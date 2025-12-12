import json
import time
import io
import os
import re
from datetime import datetime
from google import genai
from elevenlabs import ElevenLabs
from dotenv import load_dotenv

load_dotenv()

# Initialize clients
genai_client = None
el_client = None

def _init_clients():
    """Initialize API clients if not already initialized."""
    global genai_client, el_client
    
    if genai_client is None:
        gemini_api_key = os.getenv("GEMINI_API_KEY")
        if not gemini_api_key:
            raise ValueError("GEMINI_API_KEY not configured")
        genai_client = genai.Client(api_key=gemini_api_key)
    
    if el_client is None:
        elevenlabs_api_key = os.getenv("ELEVENLABS_API_KEY")
        if not elevenlabs_api_key:
            raise ValueError("ELEVENLABS_API_KEY not configured")
        el_client = ElevenLabs(
            api_key=elevenlabs_api_key,
            base_url="https://api.elevenlabs.io/"
        )


def log(msg):
    """Timestamped logging."""
    print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] {msg}")


def clean_json(raw_text: str) -> str:
    """
    Robustly extract and clean JSON from response.
    Handles markdown, trailing commas, and basic syntax errors.
    """
    if not raw_text:
        return ''
    
    cleaned = raw_text.strip()
    
    # 1. Remove Markdown Code Blocks (```json ... ```)
    # Using regex to capture content inside code fences
    md_pattern = r'```(?:json)?\s*(.*?)```'
    match = re.search(md_pattern, cleaned, re.DOTALL | re.IGNORECASE)
    if match:
        cleaned = match.group(1).strip()
    else:
        # Fallback: simple strip if no regex match but stars with ```
        if cleaned.startswith("```"):
            cleaned = re.sub(r'^```(?:json)?', '', cleaned, flags=re.MULTILINE | re.IGNORECASE)
            cleaned = cleaned.rstrip('`').strip()

    # 2. Extract strictly from first [ or { to last ] or }
    # Find start
    start_bracket = cleaned.find('[')
    start_brace = cleaned.find('{')
    
    start_index = -1
    end_char = ''
    
    if start_bracket != -1 and (start_brace == -1 or start_bracket < start_brace):
        start_index = start_bracket
        end_char = ']'
    elif start_brace != -1:
        start_index = start_brace
        end_char = '}'
        
    if start_index != -1:
        # Find the LAST occurrence of the matching end char
        end_index = cleaned.rfind(end_char)
        if end_index != -1 and end_index > start_index:
            cleaned = cleaned[start_index:end_index+1]
        else:
            # Fallback if no closing char found, take everything from start
            cleaned = cleaned[start_index:]
            
    # 3. Remove trailing commas using Regex
    # Matches a comma followed by whitespace and a closing bracket/brace
    # re.X allows for verbose regex (comments), but we'll stick to simple inline
    # Pattern: , followed by optional whitespace, followed by ] or }
    # Repace with just the bracket/brace
    cleaned = re.sub(r',\s*([\]}])', r'\1', cleaned)

    return cleaned


def text_to_podcast_json(text: str, host_voice_id: str, guest_voice_id: str) -> list:
    """Convert text to podcast dialogue JSON using Gemini."""
    _init_clients()
    
    log("Sending text to Gemini for podcast transformation...")
    start = time.time()

    prompt = f"""
    
You are an expert podcast scriptwriter.

Convert the document below into a **dynamic, expressive, two-speaker podcast conversation** between:
- **HOST** → voice_id: "{host_voice_id}"
- **GUEST** → voice_id: "{guest_voice_id}"

====================================================
                ★ DO NOT BREAK THESE RULES ★
====================================================

### 1. OUTPUT FORMAT (NON-NEGOTIABLE)
Return **ONLY** a JSON array.
Each element MUST match EXACTLY:

{{
  "text": "dialogue line with expressive cues",
  "voice_id": "{host_voice_id}" or "{guest_voice_id}"
}}

No extra text.  
No markdown.  
No comments.  
No speaker labels.  
No code fences.  
No trailing commas.  

### 2. VOICE ASSIGNMENT (HIGHEST PRIORITY – NON-NEGOTIABLE)
- Every HOST line must use voice_id **"{host_voice_id}"**.
- Every GUEST line must use voice_id **"{guest_voice_id}"**.
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

    raw_response = response.text
    log(f"Gemini raw response length: {len(raw_response)} chars")
    
    cleaned = clean_json(raw_response)
    log(f"Cleaned JSON length: {len(cleaned)} chars")
    log(f"Cleaned JSON preview (first 300 chars): {cleaned[:300]}...")
    
    if not cleaned:
        log(f"❌ Cleaned JSON is empty. Raw response: {raw_response[:500]}")
        raise ValueError("Gemini returned empty response after cleaning")

    try:
        parsed = json.loads(cleaned)
        log(f"Gemini JSON parsed successfully: {len(parsed)} items in {time.time() - start:.2f} sec")
        return parsed
    except json.JSONDecodeError as e:
        log(f"❌ JSON parsing failed at position {e.pos}: {str(e)}")
        log(f"Cleaned JSON around error (chars {max(0, e.pos-100)} to {min(len(cleaned), e.pos+100)}):")
        log(f"{cleaned[max(0, e.pos-100):min(len(cleaned), e.pos+100)]}")
        log(f"Full cleaned JSON (first 2000 chars): {cleaned[:2000]}")
        raise ValueError(f"Failed to parse Gemini response as JSON: {str(e)}")


def generate_dialogue_audio(dialogue_json: list) -> bytes:
    """Generate audio from dialogue JSON using ElevenLabs. Returns MP3 bytes."""
    _init_clients()
    
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

    audio_parts = []

    # Generate each audio batch
    for i, batch in enumerate(batches, start=1):
        log(f"Generating batch {i}/{len(batches)}...")
        batch_start = time.time()

        stream = el_client.text_to_dialogue.convert(inputs=batch)
        
        # Collect audio chunks in memory
        batch_audio = b""
        for chunk in stream:
            batch_audio += chunk
        
        audio_parts.append(batch_audio)
        log(f"Batch {i} audio generated in {time.time()-batch_start:.2f} sec")

    # Merge all parts into single bytes
    log("Merging all audio parts...")
    merge_start = time.time()
    
    final_audio = b"".join(audio_parts)
    
    log(f"Merge completed in {time.time()-merge_start:.2f} sec")
    log(f"TOTAL audio generation time: {time.time()-overall_start:.2f} sec")
    log(f"Final podcast ready ({len(final_audio)} bytes)")

    return final_audio


def generate_podcast_audio(text: str, host_voice_id: str = None, guest_voice_id: str = None) -> bytes:
    """
    Main entry point for podcast audio generation.
    
    Args:
        text: Text content to convert to podcast
        host_voice_id: ElevenLabs voice ID for host (defaults to config)
        guest_voice_id: ElevenLabs voice ID for guest (defaults to config)
    
    Returns:
        bytes: MP3 audio file as bytes
    """
    # Use defaults from environment if not provided
    if host_voice_id is None:
        host_voice_id = os.getenv('ELEVENLABS_HOST_VOICE', 'jqcCZkN6Knx8BJ5TBdYR')
    if guest_voice_id is None:
        guest_voice_id = os.getenv('ELEVENLABS_GUEST_VOICE', 'EkK5I93UQWFDigLMpZcX')
    
    if not host_voice_id or not guest_voice_id:
        raise ValueError("Voice IDs must be provided or configured in environment")
    
    log("🔥 Podcast generation started!")
    total_start = time.time()
    
    try:
        # 1. Convert text to dialogue JSON
        podcast_json = text_to_podcast_json(text, host_voice_id, guest_voice_id)
        
        # 2. Generate audio from dialogue
        audio_bytes = generate_dialogue_audio(podcast_json)
        
        log(f"🎧 FULL PROCESS COMPLETED IN {time.time()-total_start:.2f} sec")
        return audio_bytes
        
    except Exception as e:
        log(f"❌ Podcast generation failed: {str(e)}")
        raise

