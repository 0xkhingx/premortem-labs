import json
import logging
import os
import time
from typing import Any

import requests
from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from requests.exceptions import RequestException, Timeout as RequestsTimeout


logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s %(message)s",
)
logger = logging.getLogger("premortem.api")

app = FastAPI(title="PreMortem Labs API", version="2.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

OLLAMA_HOST = "http://127.0.0.1:11434"
OLLAMA_URL = f"{OLLAMA_HOST}/api/generate"
OLLAMA_TAGS_URL = f"{OLLAMA_HOST}/api/tags"
OLLAMA_MODEL = "gemma3:4b"
OLLAMA_KEEP_ALIVE = "30m"
OLLAMA_CONNECT_TIMEOUT = 10
OLLAMA_READ_TIMEOUT = 180
MAX_PROTOCOL_CHARS = 12000
MAX_FLAGS_FOR_CITATIONS = 6
DEFAULT_THREADS = max(1, min(4, os.cpu_count() or 1))

VALIDATION_PROMPT = """You are ResearchGuard, a biomedical protocol validator for university labs in Nigeria and West Africa.

Analyze the protocol for methodological, reagent, storage, calibration, pilot, sample size, timing, and context-specific operational risks.
Return only valid JSON with this exact shape:
{
  "risk_level": "LOW|MEDIUM|HIGH|CRITICAL",
  "summary": "one sentence overview",
  "flags": [
    {
      "issue": "problem name",
      "severity": "LOW|MEDIUM|HIGH|CRITICAL",
      "explanation": "why this is a problem in the local lab context",
      "correction": "specific corrective action"
    }
  ],
  "clarifying_questions": ["question if information is missing"],
  "verdict": "clear go/no-go recommendation"
}"""

CHAT_PROMPT = """You are a biomedical research copilot helping a Nigerian university researcher fix their protocol.
Reply in 2-3 sentences max. Be specific, direct, and actionable. No markdown."""

CITATIONS_PROMPT = """You are a biomedical research assistant.
Given the flagged protocol risks below, return exactly 3 relevant academic citations the researcher should review.
Return only valid JSON with this exact shape:
{
  "citations": [
    {
      "title": "full paper title",
      "authors": "Last FM, Last FM",
      "journal": "Journal Name",
      "year": 2020,
      "doi": "10.xxxx/xxxxx",
      "confidence": 0.92,
      "abstract": "one sentence summary of the paper",
      "evidence": "specific finding relevant to the flagged issues"
    }
  ]
}"""


class ProtocolRequest(BaseModel):
    protocol: str = Field(min_length=1)


class ChatRequest(BaseModel):
    message: str = Field(min_length=1)
    context: str = Field(min_length=1)


class CitationFlag(BaseModel):
    issue: str = ""
    severity: str = ""
    explanation: str = ""
    correction: str = ""


class CitationsRequest(BaseModel):
    flags: list[CitationFlag] = Field(default_factory=list)


@app.exception_handler(RequestValidationError)
async def handle_validation_error(_, exc: RequestValidationError):
    logger.warning("request validation error: %s", exc.errors())
    return JSONResponse(
        status_code=422,
        content={"error": "Invalid request body", "details": exc.errors()},
    )


def clamp_text(value: str, limit: int) -> str:
    text = value.strip()
    if len(text) <= limit:
        return text
    return text[:limit].rstrip() + "\n\n[truncated]"


def strip_code_fences(raw: str) -> str:
    text = raw.strip()
    if text.startswith("```"):
        parts = text.split("```")
        if len(parts) >= 2:
            text = parts[1]
        if text.startswith("json"):
            text = text[4:]
    return text.strip()


def parse_json_payload(raw: str) -> dict[str, Any]:
    cleaned = strip_code_fences(raw)
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        start = cleaned.find("{")
        end = cleaned.rfind("}")
        if start != -1 and end != -1 and end > start:
            return json.loads(cleaned[start : end + 1])
        raise


def ollama_generate(
    prompt: str,
    *,
    json_mode: bool,
    num_predict: int,
    temperature: float,
) -> tuple[str, dict[str, Any]]:
    payload: dict[str, Any] = {
        "model": OLLAMA_MODEL,
        "prompt": prompt,
        "stream": True,
        "keep_alive": OLLAMA_KEEP_ALIVE,
        "options": {
            "temperature": temperature,
            "num_predict": num_predict,
            "num_thread": DEFAULT_THREADS,
            "num_ctx": 4096,
        },
    }
    if json_mode:
        payload["format"] = "json"

    started = time.perf_counter()
    with requests.Session() as session:
        session.trust_env = False
        response = session.post(
            OLLAMA_URL,
            json=payload,
            stream=True,
            timeout=(OLLAMA_CONNECT_TIMEOUT, OLLAMA_READ_TIMEOUT),
        )
        response.raise_for_status()

        chunks: list[str] = []
        final_chunk: dict[str, Any] = {}

        for line in response.iter_lines(decode_unicode=True):
            if not line:
                continue

            data = json.loads(line)
            if data.get("error"):
                raise RuntimeError(str(data["error"]))

            piece = data.get("response", "")
            if piece:
                chunks.append(piece)

            if data.get("done"):
                final_chunk = data
                break

    raw = "".join(chunks).strip()
    duration = time.perf_counter() - started
    logger.info(
        "ollama_generate done model=%s json_mode=%s chars=%s seconds=%.2f prompt_eval=%s eval=%s total_duration_ns=%s",
        OLLAMA_MODEL,
        json_mode,
        len(raw),
        duration,
        final_chunk.get("prompt_eval_count"),
        final_chunk.get("eval_count"),
        final_chunk.get("total_duration"),
    )

    if not raw:
        raise RuntimeError("Ollama returned an empty response")

    return raw, final_chunk


def build_validation_prompt(protocol: str) -> str:
    trimmed_protocol = clamp_text(protocol, MAX_PROTOCOL_CHARS)
    return (
        f"{VALIDATION_PROMPT}\n\n"
        f"Research protocol:\n{trimmed_protocol}\n\n"
        "Return only valid JSON."
    )


def build_chat_prompt(message: str, context: str) -> str:
    trimmed_context = clamp_text(context, 6000)
    trimmed_message = clamp_text(message, 1000)
    return (
        f"{CHAT_PROMPT}\n\n"
        f"Context from protocol analysis:\n{trimmed_context}\n\n"
        f"Researcher asks: {trimmed_message}"
    )


def build_citations_prompt(flags: list[CitationFlag]) -> str:
    lines = []
    for flag in flags[:MAX_FLAGS_FOR_CITATIONS]:
        explanation = clamp_text(flag.explanation, 300).replace("\n", " ")
        issue = flag.issue.strip() or "Unspecified issue"
        severity = (flag.severity or "UNKNOWN").upper()
        lines.append(f"- [{severity}] {issue}: {explanation}")

    joined = "\n".join(lines)
    return f"{CITATIONS_PROMPT}\n\nFlagged issues:\n{joined}\n\nReturn only valid JSON."


def error_response(status_code: int, message: str, **extra: Any) -> JSONResponse:
    payload: dict[str, Any] = {"error": message}
    payload.update(extra)
    return JSONResponse(status_code=status_code, content=payload)


@app.get("/")
def root():
    return {"status": "PreMortem Labs API is running"}


@app.get("/health")
def health():
    try:
        with requests.Session() as session:
            session.trust_env = False
            tags_response = session.get(
                OLLAMA_TAGS_URL,
                timeout=(OLLAMA_CONNECT_TIMEOUT, 20),
            )
            tags_response.raise_for_status()
            models = tags_response.json().get("models", [])

        raw, _ = ollama_generate(
            "Reply with exactly: OK",
            json_mode=False,
            num_predict=8,
            temperature=0.0,
        )
        return {
            "ollama": "reachable",
            "model": OLLAMA_MODEL,
            "available_models": [m.get("name") for m in models],
            "response": raw[:50],
        }
    except Exception as e:
        logger.exception("health check failed")
        return {"ollama": "unreachable", "error": str(e)}


@app.post("/validate")
def validate_protocol(request: ProtocolRequest):
    started = time.perf_counter()
    raw = ""
    try:
        logger.info("validate start protocol_chars=%s", len(request.protocol))
        prompt = build_validation_prompt(request.protocol)
        raw, _ = ollama_generate(
            prompt,
            json_mode=True,
            num_predict=320,
            temperature=0.1,
        )
        parsed = parse_json_payload(raw)
        logger.info("validate success seconds=%.2f", time.perf_counter() - started)
        return JSONResponse(content=parsed)
    except RequestsTimeout:
        logger.exception("validate timeout protocol_chars=%s", len(request.protocol))
        return error_response(
            504,
            "Ollama timed out while validating the protocol",
            model=OLLAMA_MODEL,
        )
    except RequestException as e:
        logger.exception("validate ollama request failed")
        return error_response(502, "Failed to reach Ollama", detail=str(e)[:300])
    except json.JSONDecodeError as e:
        logger.exception("validate model returned invalid json")
        return error_response(
            502,
            "Model returned invalid JSON for validation",
            detail=str(e),
            raw_response=raw[:1000],
        )
    except Exception as e:
        logger.exception("validate unexpected error")
        return error_response(500, "Validation failed", detail=str(e)[:300])


@app.post("/chat")
def chat(request: ChatRequest):
    started = time.perf_counter()
    try:
        logger.info(
            "chat start message_chars=%s context_chars=%s",
            len(request.message),
            len(request.context),
        )
        prompt = build_chat_prompt(request.message, request.context)
        raw, _ = ollama_generate(
            prompt,
            json_mode=False,
            num_predict=120,
            temperature=0.2,
        )
        logger.info("chat success seconds=%.2f", time.perf_counter() - started)
        return JSONResponse(content={"reply": raw.strip()})
    except RequestsTimeout:
        logger.exception("chat timeout")
        return error_response(504, "Ollama timed out while generating chat response")
    except RequestException as e:
        logger.exception("chat ollama request failed")
        return error_response(502, "Failed to reach Ollama", detail=str(e)[:300])
    except Exception as e:
        logger.exception("chat unexpected error")
        return error_response(500, "Chat failed", detail=str(e)[:300])


@app.post("/citations")
def get_citations(request: CitationsRequest):
    started = time.perf_counter()
    raw = ""
    try:
        if not request.flags:
            return error_response(400, "No flags provided")

        logger.info("citations start flag_count=%s", len(request.flags))
        prompt = build_citations_prompt(request.flags)
        raw, _ = ollama_generate(
            prompt,
            json_mode=True,
            num_predict=360,
            temperature=0.2,
        )
        parsed = parse_json_payload(raw)
        logger.info("citations success seconds=%.2f", time.perf_counter() - started)
        return JSONResponse(content=parsed)
    except RequestsTimeout:
        logger.exception("citations timeout flag_count=%s", len(request.flags))
        return error_response(
            504,
            "Ollama timed out while generating citations",
            model=OLLAMA_MODEL,
        )
    except RequestException as e:
        logger.exception("citations ollama request failed")
        return error_response(502, "Failed to reach Ollama", detail=str(e)[:300])
    except json.JSONDecodeError as e:
        logger.exception("citations model returned invalid json")
        return error_response(
            502,
            "Model returned invalid JSON for citations",
            detail=str(e),
            raw_response=raw[:1000],
        )
    except Exception as e:
        logger.exception("citations unexpected error")
        return error_response(500, "Citation generation failed", detail=str(e)[:300])


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, timeout_keep_alive=120)
