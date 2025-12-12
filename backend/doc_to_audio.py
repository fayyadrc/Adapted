import json
import docx
import time
from datetime import datetime
from google import genai
from elevenlabs import ElevenLabs

# -------------------------------------------------
# CONFIG
# -------------------------------------------------
GEMINI_API_KEY = "AIzaSyBNNsHSXKns02zQdbwuQ4oGmRxVKCQMjkY"
ELEVENLABS_API_KEY = "8914acf52ae82e314f23672d373ecf03c46ae4ee23a491d7c4ca00561ae0ec40"
HOST_VOICE="jqcCZkN6Knx8BJ5TBdYR"
GUEST_VOICE="EkK5I93UQWFDigLMpZcX"

# Gemini client
genai_client = genai.Client(api_key=GEMINI_API_KEY)

# ElevenLabs client
el_client = ElevenLabs(
    api_key=ELEVENLABS_API_KEY,
    base_url="https://api.elevenlabs.io/"
)

# -------------------------------------------------
# UTIL — TIMESTAMPED PRINT
# -------------------------------------------------
def log(msg):
    print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] {msg}")

# -------------------------------------------------
# 1. Extract text from DOCX
# -------------------------------------------------
def extract_docx_text(path):
    log("Starting DOCX extraction...")
    start = time.time()

    doc = docx.Document(path)
    text = "\n".join([p.text for p in doc.paragraphs if p.text.strip()])

    log(f"DOCX extraction completed in {time.time()-start:.2f} sec")
    return text


# -------------------------------------------------
# 2. Convert text → Podcast JSON using Gemini
# -------------------------------------------------
def clean_json(raw_text: str):
    cleaned = raw_text.strip()
    if cleaned.startswith("```"):
        cleaned = cleaned.strip("`").replace("json", "", 1).strip()
    cleaned = cleaned.replace(",]", "]").replace(",}", "}")
    return cleaned


def text_to_podcast_json(text):
    log("Sending text to Gemini for podcast transformation...")
    start = time.time()

    prompt = f"""
You are an expert podcast scriptwriter.

Convert the document below into a **dynamic, expressive, two-speaker podcast conversation** between:
- **HOST** → voice_id: "{HOST_VOICE}"
- **GUEST** → voice_id: "{GUEST_VOICE}"

====================================================
                ★ DO NOT BREAK THESE RULES ★
====================================================

### 1. OUTPUT FORMAT (NON-NEGOTIABLE)
Return **ONLY** a JSON array.
Each element MUST match EXACTLY:

{{
  "text": "dialogue line with expressive cues",
  "voice_id": "{HOST_VOICE}" or "{GUEST_VOICE}"
}}

No extra text.  
No markdown.  
No comments.  
No speaker labels.  
No code fences.  
No trailing commas.  

### 2. VOICE ASSIGNMENT (HIGHEST PRIORITY – NON-NEGOTIABLE)
- Every HOST line must use voice_id **"{HOST_VOICE}"**.
- Every GUEST line must use voice_id **"{GUEST_VOICE}"**.
- Never swap, never mix, never alternate incorrectly.
- Never use any voice other than these two.
- Each line belongs to exactly one speaker.

### 3. EXPRESSIVE CUES (MANDATORY)
You **must include expressive cues** in **at least 30–50%** of all lines.

Expressive cues MUST:
- Be inside square brackets: `[excited]`, `[pauses]`, `[laughs]`
- Appear **inside the "text" field**
- Be short, human, and context-appropriate
- Enhance emotional realism

Allowed categories:
- Emotional: [excited], [calm], [nervous], [serious tone], [warmly]
- Reactions: [laughs], [chuckles], [sighs], [gasps], [gulps]
- Cognitive: [thinking], [hesitates], [reflects], [pauses 0.5s]
- Delivery/tone: [softly], [deadpan], [playfully], [engaged]

You MAY combine up to **two** cues if natural:
- Example: "[thinking][softly]" or "[laughs][reassuring tone]"

### 4. SCRIPT STYLE REQUIREMENTS
- Begin with a short, engaging Host introduction.
- Make the Host ask questions, guide flow, and react naturally.
- Make the Guest answer, explain, reflect, and build on ideas.
- Keep the flow conversational, human-like, and emotionally rich.
- Maintain context integrity — do NOT add new factual content.
- End with a clean outro by the Host.

### 5. LINE STRUCTURE RULES
Each line MUST:
- Be 1–3 sentences max.
- Sound like natural spoken dialogue.
- Contain NO speaker names (infer speaker from voice_id).
- Avoid long monologues; keep it conversational.

### 6. PRIORITY ORDER (STRICT)
If rules ever conflict, follow this order:
1. Correct JSON format  
2. Correct voice_id assignment  
3. At least 30–50% expressive cues  
4. Conversational quality  
5. Everything else  

====================================================

### DOCUMENT TO CONVERT:
{text}

====================================================
"""

    response = genai_client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt
    )

    raw = clean_json(response.text)
    print("Gemini raw response:", raw)  # Debug print
    print("-----")  # Debug separator

    try:
        parsed = json.loads(raw)
        log(f"Gemini JSON parsed successfully in {time.time() - start:.2f} sec")
        return parsed
    except json.JSONDecodeError:
        log("❌ JSON parsing failed. Gemini returned:")
        print(raw)
        raise




# -------------------------------------------------
# 3. ElevenLabs Batch Audio Generation (no pydub)
# -------------------------------------------------
def generate_dialogue_audio(dialogue_json, output="podcast_full.mp3"):
    log("Preparing batches for ElevenLabs...")
    overall_start = time.time()

    batches = []
    current = []
    length = 0

    # Split into safe-sized batches (<5000 chars)
    for item in dialogue_json:
        s = json.dumps(item)
        if length + len(s) > 4800:
            batches.append(current)
            current = []
            length = 0
        current.append(item)
        length += len(s)

    if current:
        batches.append(current)

    log(f"Total batches created: {len(batches)}")

    part_files = []

    # Generate each audio batch
    for i, batch in enumerate(batches, start=1):
        log(f"Generating batch {i}/{len(batches)}...")
        batch_start = time.time()

        filename = f"podcast_part_{i}.mp3"
        stream = el_client.text_to_dialogue.convert(inputs=batch)

        with open(filename, "wb") as f:
            for chunk in stream:
                f.write(chunk)

        log(f"Batch {i} audio saved ({filename}) in {time.time()-batch_start:.2f} sec")
        part_files.append(filename)

    # Merge parts
    log("Merging all audio parts into final file...")
    merge_start = time.time()

    with open(output, "wb") as outfile:
        for fpath in part_files:
            with open(fpath, "rb") as infile:
                outfile.write(infile.read())

    log(f"Merge completed in {time.time()-merge_start:.2f} sec")
    log(f"TOTAL audio generation time: {time.time()-overall_start:.2f} sec")
    log(f"Final podcast ready → {output}")

    return output


# -------------------------------------------------
# MAIN
# -------------------------------------------------
if __name__ == "__main__":
    total_start = time.time()
    log("🔥 Podcast generation started!")

    # 1. Read DOCX
    text = extract_docx_text(
        r"C:\Users\moham\OneDrive\Documents\Top-up Assignments\1. Project\Report.docx"
    )

    # 2. Convert to dialogue JSON
    podcast_json = text_to_podcast_json(text)

    # 3. Generate final podcast
    output_file = generate_dialogue_audio(podcast_json)

    log(f"🎧 FULL PROCESS COMPLETED IN {time.time()-total_start:.2f} sec")
    log(f"Podcast generated → {output_file}")
