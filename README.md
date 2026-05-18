# premortem-labs
AI protocol validator for biomedical research labs in Nigeria and West Africa. Catches protocol failures before they cost animals, time, and money using local LLM inference (Ollama + Gemma).

# PreMortem Labs

AI protocol validator for biomedical research labs in Nigeria and West Africa.

## Problem

Biomedical research in African universities fails due to constraints Western literature doesn't address:
- Variable reagent purity from local suppliers
- Power instability affecting storage
- Limited equipment calibration access
- No pilot testing budgets

This tool catches these failures before they cost animals, time, and money.

## Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- Ollama (https://ollama.ai)

### Setup

1. **Pull the Gemma 3 model:**
```bash
ollama pull gemma3:4b
```

2. **Start Ollama:**
```bash
ollama serve
```

3. **Start backend (new terminal):**
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --timeout-keep-alive 600
```

4. **Start frontend (new terminal):**
```bash
npm install
npm run dev
```

5. **Open browser:**

## Usage

1. Paste your research protocol
2. Click "Validate"
3. Get risk score (CRITICAL/HIGH/MEDIUM/LOW)
4. See specific flags and corrections
5. Ask Copilot clarifying questions

## Example Protocols

**Bad Protocol (CRITICAL risk):**
"We are inducing Type 2 diabetes in Wistar rats using STZ 95mg/kg and Nicotinamide 65mg/kg administered intraperitoneally..."

**Good Protocol (MEDIUM risk):**
"We are conducting a pilot study on anti-inflammatory effects of Azadirachta indica extract..."

## Architecture

- **Frontend:** React + TypeScript + Vite + Tailwind
- **Backend:** FastAPI (Python)
- **AI:** Gemma 3 4B via Ollama (local inference, offline-first)

## License

MIT
