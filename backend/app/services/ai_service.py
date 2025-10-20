import os
import re
import google.generativeai as genai

# Configure the Gemini client library using the API key from environment variables
try:
    genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
except Exception as e:
    print(f"Failed to configure Gemini API: {e}")


def generate_mindmap_from_text(text_content):
    """
    Sends text content to the Gemini API and requests a structured JSON output
    for a mind map, ensuring the response is clean.
    """
    model = genai.GenerativeModel('gemini-1.5-pro-latest')
    
    # The prompt remains the same
    prompt = f"""
    Analyze the following text and generate a structured JSON object for a mind map visualization.
    The JSON must follow this structure precisely:
    - A single root object with a key named "root".
    - The "root" object must contain a "topic" (the central theme) and "children" (an array of nodes).
    - Each child node must contain a "topic" (string) and can optionally have a "summary" (string) and its own "children" array for further nesting.
    - Ensure the output is only the raw JSON, without any surrounding text, explanations, or markdown formatting like ```json.

    Text to Analyze:
    ---
    {text_content}
    ---
    """
    
    try:
        response = model.generate_content(prompt)

        # --- FIX FOR AI RESPONSE ---
        # The AI might wrap the JSON in markdown. We need to extract just the JSON part.
        # This regex finds the content between ```json and ```
        match = re.search(r'```json\n({.*?})\n```', response.text, re.DOTALL)
        if match:
            # If markdown is found, extract the clean JSON string
            clean_json_string = match.group(1)
        else:
            # Otherwise, assume the response is already clean JSON and just strip whitespace
            clean_json_string = response.text.strip()
            
        return clean_json_string

    except Exception as e:
        print(f"Error calling Gemini API: {e}")
        return '{"error": "Failed to generate mind map due to an API error."}'

