import { useSyncExternalStore } from "react";

export type ReasoningStatus = "queued" | "active" | "done";
export type PreflightState = "pass" | "warn" | "fail" | "pending";
export type Severity = "low" | "medium" | "high" | "critical";

export type ValidationState = {
  status: "idle" | "running" | "complete" | "error";
  riskScore: number;
  riskLevel: string;
  summary: string;
  verdict: string;
  subs: { label: string; value: number }[];
  reasoning: { label: string; status: ReasoningStatus }[];
  preflight: { label: string; state: PreflightState; note: string }[];
  flags: {
    issue: string;
    severity: Severity;
    explanation: string;
    correction: string;
  }[];
  clarifyingQuestions: string[];
  passCount: number;
  totalCount: number;
  startedAt: number | null;
  finishedAt: number | null;
  error: string | null;
  citations: Citation[];
};

export type Citation = {
  title: string;
  authors: string;
  journal: string;
  year: number;
  doi: string;
  confidence: number;
  abstract: string;
  evidence: string;
};

const REASONING_LABELS = [
  "Parsing protocol structure",
  "Checking experimental design",
  "Analyzing reagent stability",
  "Evaluating sourcing & storage",
  "Reviewing sample size & pilot",
  "Generating risk assessment",
];

const idleState = (): ValidationState => ({
  status: "idle",
  riskScore: 0,
  riskLevel: "",
  summary: "",
  verdict: "",
  subs: [
    { label: "Methodology", value: 0 },
    { label: "Reproducibility", value: 0 },
    { label: "Ethics", value: 0 },
  ],
  reasoning: REASONING_LABELS.map((label) => ({ label, status: "queued" })),
  preflight: [],
  flags: [],
  clarifyingQuestions: [],
  passCount: 0,
  totalCount: 0,
  startedAt: null,
  finishedAt: null,
  error: null,
  citations: [],
});

let state: ValidationState = idleState();
const listeners = new Set<() => void>();
let timers: ReturnType<typeof setTimeout>[] = [];



const emit = () => listeners.forEach((l) => l());
const setState = (next: Partial<ValidationState>) => {
  state = { ...state, ...next };
  emit();
};

async function readApiError(response: Response, fallback: string) {
  try {
    const data = await response.json();
    if (typeof data?.error === "string" && data.error) {
      return data.detail ? `${data.error}: ${data.detail}` : data.error;
    }
  } catch {
    // Ignore JSON parse failures for error payloads.
  }
  return fallback;
}

export const subscribeValidation = (l: () => void) => {
  listeners.add(l);
  return () => { listeners.delete(l); };
};
export const getValidationSnapshot = () => state;

export function useValidation() {
  return useSyncExternalStore(subscribeValidation, getValidationSnapshot, getValidationSnapshot);
}

function riskLevelToScore(level: string): number {
  switch (level.toUpperCase()) {
    case "CRITICAL": return 92;
    case "HIGH": return 74;
    case "MEDIUM": return 45;
    case "LOW": return 18;
    default: return 50;
  }
}

function flagsToSubs(flags: ValidationState["flags"]) {
  const critical = flags.filter((f) => f.severity === "critical").length;
  const high = flags.filter((f) => f.severity === "high").length;
  const total = flags.length || 1;
  return [
    { label: "Methodology", value: Math.min(100, Math.round(((critical * 3 + high * 2) / (total * 3)) * 100)) },
    { label: "Reproducibility", value: Math.min(100, Math.round((flags.length / 8) * 100)) },
    { label: "Ethics", value: flags.some((f) => f.issue.toLowerCase().includes("cohort")) ? 65 : 88 },
  ];
}

function flagsToPreflight(flags: ValidationState["flags"], questions: string[]) {
  const checks = flags.slice(0, 5).map((f) => ({
    label: f.issue,
    state: f.severity === "critical"
      ? ("fail" as PreflightState)
      : f.severity === "high"
        ? ("warn" as PreflightState)
        : f.severity === "medium"
          ? ("warn" as PreflightState)
          : ("pass" as PreflightState),
    note: f.explanation,
  }));

  checks.push({
    label: "Clarifications required",
    state: questions.length > 0 ? ("warn" as PreflightState) : ("pass" as PreflightState),
    note: questions.length > 0
      ? `${questions.length} question(s) need answers before proceeding.`
      : "No clarifications needed.",
  });

  return checks;
}

export async function runValidation(protocol: string) {
  timers.forEach(clearTimeout);
  timers = [];

  setState({
    ...idleState(),
    status: "running",
    startedAt: Date.now(),
    reasoning: REASONING_LABELS.map((label) => ({ label, status: "queued" })),
  });

  // Animate reasoning steps while API call runs
REASONING_LABELS.forEach((_, i) => {
    timers.push(
      setTimeout(() => {
        setState({
          reasoning: state.reasoning.map((r, idx) => ({
            ...r,
            status: idx < i ? "done" : idx === i ? "active" : "queued",
          })),
        });
      }, i * 800),
    );
  });

  try {
    const response = await fetch("http://localhost:8000/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ protocol }),
    });

    if (!response.ok) {
      throw new Error(await readApiError(response, `Backend error: ${response.status}`));
    }

    const data = await response.json();

    const flags = (data.flags ?? []).map((f: {
      issue: string;
      severity: string;
      explanation: string;
      correction: string;
    }) => ({
      issue: f.issue,
      severity: f.severity.toLowerCase() as Severity,
      explanation: f.explanation,
      correction: f.correction,
    }));

    const questions: string[] = data.clarifying_questions ?? [];
    const preflight = flagsToPreflight(flags, questions);
    const targetScore = riskLevelToScore(data.risk_level ?? "MEDIUM");
    const subs = flagsToSubs(flags);

    // Fetch citations in background after main validation.
    fetch("http://localhost:8000/citations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ flags: flags ?? [] }),
    })
      .then((r) => {
        if (!r.ok) {
          return readApiError(r, `Citations error: ${r.status}`).then((message) => {
            throw new Error(message);
          });
        }
        return r.json();
      })
      .then((citData) => {
        if (citData.citations) {
          setState({ citations: citData.citations });
        }
      })
      .catch((err) => {
        console.error("Citations fetch failed:", err);
      });

    // Animate score
    const scoreSteps = 24;
    for (let i = 1; i <= scoreSteps; i++) {
      timers.push(
        setTimeout(() => {
          setState({ riskScore: Math.round((targetScore * i) / scoreSteps) });
        }, i * 40),
      );
    }

    // Animate preflight
    preflight.forEach((p, i) => {
      timers.push(
        setTimeout(() => {
          const next = preflight.map((x, idx) =>
            idx <= i ? x : { ...x, state: "pending" as PreflightState }
          );
          setState({
            preflight: next,
            passCount: next.filter((x) => x.state === "pass").length,
            totalCount: preflight.length,
          });
        }, i * 300),
      );
    });

    // Animate subs
    subs.forEach((s, i) => {
      timers.push(
        setTimeout(() => {
          setState({ subs: state.subs.map((x, idx) => (idx === i ? s : x)) });
        }, i * 200),
      );
    });

    // Finalize
    timers.push(
      setTimeout(() => {
        setState({
          status: "complete",
          riskLevel: data.risk_level ?? "",
          summary: data.summary ?? "",
          verdict: data.verdict ?? "",
          flags,
          clarifyingQuestions: questions,
          preflight,
          passCount: preflight.filter((p) => p.state === "pass").length,
          totalCount: preflight.length,
          riskScore: targetScore,
          subs,
          reasoning: REASONING_LABELS.map((label) => ({ label, status: "done" as ReasoningStatus })),
          finishedAt: Date.now(),
        });
      }, 100),
    );

  } catch (err) {
    timers.forEach(clearTimeout);
    setState({
      status: "error",
      error: err instanceof Error ? err.message : "Unknown error",
      reasoning: REASONING_LABELS.map((label) => ({ label, status: "done" })),
    });
  }
}
