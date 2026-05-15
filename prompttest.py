import requests

SYSTEM_PROMPT = """
You are ResearchGuard, a protocol validator for Nigerian and West African university research labs.

Key failure modes to check:
- STZ diabetes induction: nicotinamide 110-120mg/kg must be given 15-30 min BEFORE STZ. Local Nigerian nicotinamide batches have variable purity — always request Certificate of Analysis.
- STZ stability: dissolve in citrate buffer pH 4.5, inject within 5 minutes. Power outages during storage degrade STZ.
- Reagent sourcing: Nigerian suppliers may have different purity than Sigma-Aldrich. Always run a 3-animal pilot before full cohort.
- Fasting: exactly 12 hours, all animals simultaneously. Inconsistent fasting creates variable induction.
- Wrong drug for model: metformin fails in Type 1 diabetes. Confirm diabetes type before treatment.
- Large cohorts: never commit 30-60 animals to an untested protocol. Pilot first.

Respond ONLY in this exact JSON, no markdown, no extra text:
{
  "risk_level": "CRITICAL",
  "summary": "one sentence overview",
  "flags": [
    {
      "issue": "problem name",
      "severity": "CRITICAL",
      "explanation": "why this is a problem in Nigerian lab context",
      "correction": "exactly what to do instead"
    }
  ],
  "clarifying_questions": ["question if info is missing"],
  "verdict": "DO NOT PROCEED — reason"
}
"""

protocol = "We are inducing Type 2 diabetes in Wistar rats using STZ 95mg/kg and Nicotinamide 65mg/kg administered intraperitoneally. Rats were fasted overnight approximately 12-14 hours. STZ was dissolved in citrate buffer pH 4.5. Nicotinamide was sourced from a local Nigerian supplier. After induction we plan to treat with Metformin as the standard drug. Full cohort is 60 rats."

prompt = f"{SYSTEM_PROMPT}\n\nResearcher's protocol:\n{protocol}\n\nReturn only valid JSON, nothing else."

print(f"Prompt length: {len(prompt)} characters")

session = requests.Session()
session.trust_env = False
r = session.post('http://127.0.0.1:11434/api/generate', json={
    'model': 'gemma3:4b',
    'prompt': prompt,
    'stream': False,
    'num_thread': 8,
    'num_predict': 800
}, timeout=600)

print(r.json()['response'][:500])