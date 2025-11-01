import os
import requests
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional
import uvicorn

# /Users/fayyadrc/Desktop/adaptedMVP/Adapted/backend/app/api/summary.py

app = FastAPI()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "models/text-bison-001")
GEMINI_ENDPOINT = f"https://generativelanguage.googleapis.com/v1beta2/{GEMINI_MODEL}:generate"

if not GEMINI_API_KEY:
    raise RuntimeError("GEMINI_API_KEY environment variable is required")

class SummaryRequest(BaseModel):
    text: str
    student_level: Optional[str] = "high school"  # e.g. "middle school", "undergrad", "beginner"
    max_output_tokens: Optional[int] = 300

class SummaryResponse(BaseModel):
    summary: str
    model: str

def build_prompt(text: str, level: str) -> str:
    return (
        f"You are an educational assistant. Summarize the following text for a student at the '{level}' level.\n\n"
        "Return:\n"
        "1) A short plain-language summary (2-3 sentences).\n"
        "2) 4-6 key bullet points (concise).\n"
        "3) A simple, concrete example or analogy.\n\n"
        "Keep it easy to understand, avoid jargon, and highlight the most important concepts.\n\n"
        f"Text:\n{text}"
    )

@app.post("/summarize", response_model=SummaryResponse)
def summarize(req: SummaryRequest):
    if not req.text or not req.text.strip():
        raise HTTPException(status_code=400, detail="text is required")

    prompt = build_prompt(req.text, req.student_level)

    payload = {
        "prompt": {"text": prompt},
        "maxOutputTokens": req.max_output_tokens,
        "temperature": 0.2,
    }

    params = {"key": GEMINI_API_KEY}
    resp = requests.post(GEMINI_ENDPOINT, json=payload, params=params, timeout=30)
    if resp.status_code != 200:
        raise HTTPException(status_code=502, detail=f"Gemini API error: {resp.status_code} {resp.text}")

    data = resp.json()
    # response structure: data["candidates"][0]["content"] or data["output"][0]["content"] depending on version
    summary_text = None
    # check common fields
    if "candidates" in data and isinstance(data["candidates"], list) and data["candidates"]:
        summary_text = data["candidates"][0].get("content")
    elif "output" in data and isinstance(data["output"], list) and data["output"]:
        # some versions nest text in "content" or "text"
        summary_text = data["output"][0].get("content") or data["output"][0].get("text")
    else:
        # fallback: stringify
        summary_text = data.get("content") or str(data)

    if not summary_text:
        raise HTTPException(status_code=502, detail="No summary returned from Gemini")

    return SummaryResponse(summary=summary_text, model=GEMINI_MODEL)

if __name__ == "__main__":
    # For local testing only
    uvicorn.run("summary:app", host="0.0.0.0", port=8000, reload=True)