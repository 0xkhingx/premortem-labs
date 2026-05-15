import requests
session = requests.Session()
session.trust_env = False
r = session.post('http://127.0.0.1:11434/api/generate', json={
    'model': 'gemma3:4b',
    'prompt': 'Return only this exact JSON with no other text: {"risk_level": "HIGH", "summary": "test", "flags": [], "clarifying_questions": [], "verdict": "test"}',
    'stream': False,
    'num_predict': 100
}, timeout=120)
print(r.json()['response'][:200])