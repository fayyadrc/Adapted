import os
import google.generativeai as genai

# Configure the Gemini client library using the API key from environment variables
try:
    genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
except Exception as e:
    print(f"Failed to configure Gemini API: {e}")


def generate_mindmap_from_text(text_content):
    """
    Sends text content to the Gemini API and requests a structured JSON output
    for a mind map.
    """
    model = genai.GenerativeModel('models/gemini-pro-latest')
    
    # This is the detailed instruction (prompt) for the AI model
    prompt = f"""
    From the text below, generate a mind map.
    
    Text to Analyze:
    ---
    {text_content}
    ---
    """
    
    generation_config = {
        "response_mime_type": "application/json",
    }
    
    try:
        response = model.generate_content(prompt, generation_config=generation_config)
        return response.text
    except Exception as e:
        print(f"Error calling Gemini API: {e}")
        # Return a JSON string with an error message
        return '{"error": "Failed to generate mind map due to an API error."}'

