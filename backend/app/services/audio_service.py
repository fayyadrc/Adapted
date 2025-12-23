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


def _init_eleven_client():
    """Initialize ElevenLabs client only (no Gemini dependency).

    Use this when you already have dialogue JSON and only need TTS.
    """
    global el_client
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
You are a professional podcast scriptwriter.

Convert the document below into a natural, high-quality, two-speaker podcast conversation.

HOST voice_id: "{host_voice_id}"
GUEST voice_id: "{guest_voice_id}"

================= HARD RULES =================

1. OUTPUT FORMAT (NON-NEGOTIABLE)
Return ONLY a valid JSON array.
No markdown.
No commentary.
No text outside the JSON.

Each element must be exactly:
{{
  "text": "spoken podcast dialogue",
  "voice_id": "{host_voice_id}" or "{guest_voice_id}"
}}

2. VOICE RULES (CRITICAL)
- HOST always uses "{host_voice_id}"
- GUEST always uses "{guest_voice_id}"
- Never swap voices
- Never invent or introduce other voices
- Each line belongs to exactly one speaker

3. LENGTH & TIMING CONSTRAINTS (VERY IMPORTANT)
- The final spoken audio should be **under ~5 minutes on average**
- Target total script length: **1,000–1,300 spoken words**
- Do NOT over-summarize
- Do NOT ramble or repeat
- Preserve the document’s structure and ideas while tightening phrasing

Think of this as:
"Almost the full document, but optimized for spoken conversation."

4. CONTENT COVERAGE RULES
- Cover ALL major ideas and sections from the document
- Maintain the original meaning and intent
- Do NOT introduce new facts or external information
- You may:
  - Rephrase for clarity
  - Combine closely related points
  - Convert formal text into conversational explanations

5. CONVERSATION STYLE
- Start with a short, engaging Host introduction
- Host guides the flow and asks clarifying questions
- Guest explains, reflects, and elaborates
- Maintain a natural back-and-forth rhythm
- Avoid long monologues
- End with a concise Host outro

6. LINE STRUCTURE RULES
- 1–3 sentences per line
- Spoken, conversational English
- No speaker labels or names in text
- No filler like “As mentioned earlier” or “In conclusion”

7. PRIORITY ORDER (STRICT)
If rules conflict, follow this order:
1. Valid JSON format
2. Correct voice_id assignment
3. Length & timing constraints
4. Content coverage
5. Conversational quality

================= DOCUMENT =================
{text}
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


def generate_dialogue_audio(dialogue_json: list, output: str = 'podcast_full.mp3', cleanup: bool = False) -> bytes:
    """Generate audio from dialogue JSON using ElevenLabs per-line TTS.

    For each line we call `text_to_speech.convert`, write a `line_XXXX.mp3`
    file, then merge all line files into a single MP3 which is returned as
    bytes and written to `output` when provided.

    Args:
        dialogue_json: List of {"text","voice_id"} items
        output: Path to write merged MP3 (if truthy)
        cleanup: Remove intermediate `line_XXXX.mp3` files when True
    """
    _init_eleven_client()
    log("Starting ElevenLabs per-line TTS generation...")
    overall_start = time.time()

    part_files = []

    for idx, line in enumerate(dialogue_json, start=1):
        filename = f"line_{idx:04d}.mp3"
        log(f"Generating line {idx}/{len(dialogue_json)} → {filename}")

        audio_stream = el_client.text_to_speech.convert(
            voice_id=line["voice_id"],
            model_id="eleven_turbo_v2_5",
            output_format="mp3_44100_128",
            text=line["text"]
        )

        with open(filename, "wb") as f:
            for chunk in audio_stream:
                f.write(chunk)

        part_files.append(filename)

    log("Merging audio files...")

    final_audio = b""
    for fpath in part_files:
        with open(fpath, "rb") as infile:
            final_audio += infile.read()

    # Write final file if requested
    if output:
        with open(output, "wb") as outfile:
            outfile.write(final_audio)
        log(f"Final podcast saved → {output}")

    # Optional cleanup of intermediate files
    if cleanup:
        for fpath in part_files:
            try:
                os.remove(fpath)
            except OSError:
                log(f"Warning: could not remove intermediate file {fpath}")

    log(f"TOTAL TTS time: {time.time() - overall_start:.2f} sec")
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
        
        # 2. Generate audio from dialogue (per-line TTS)
        audio_bytes = generate_dialogue_audio(podcast_json, output='podcast_full.mp3')
        
        log(f"🎧 FULL PROCESS COMPLETED IN {time.time()-total_start:.2f} sec")
        return audio_bytes
        
    except Exception as e:
        log(f"❌ Podcast generation failed: {str(e)}")
        raise

