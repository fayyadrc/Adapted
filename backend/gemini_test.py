import os
import requests
import json
from dotenv import load_dotenv
import google.generativeai as genai

# Load environment variables
load_dotenv()

def test_gemini_key():
    print("🔍 Checking Gemini API Key...")
    
    # 1. Check if key exists
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        print("❌ Error: GEMINI_API_KEY not found in environment variables.")
        print("   Make sure you have a .env file with GEMINI_API_KEY defined.")
        return

    print(f"✅ Found API Key: {api_key[:5]}...{api_key[-5:]}")

    # 2. Test via raw HTTP request (like curl)
    print("\n📡 Testing connectivity via raw HTTP (curl-style)...")
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
    headers = {"Content-Type": "application/json"}
    payload = {
        "contents": [{
            "parts": [{"text": "Reply with 'API Key is working!'"}]
        }]
    }

    try:
        response = requests.post(url, headers=headers, json=payload, timeout=10)
        
        if response.status_code == 200:
            result = response.json()
            text = result.get('candidates', [{}])[0].get('content', {}).get('parts', [{}])[0].get('text', '').strip()
            print("✅ HTTP Request Successful!")
            print(f"   Response from Gemini: \"{text}\"")
        else:
            print(f"❌ HTTP Request Failed with Status Code: {response.status_code}")
            print(f"   Error details: {response.text}")
    except Exception as e:
        print(f"❌ HTTP Request Exception: {e}")

    # 3. Test via Python SDK (as used in the app)
    print("\n🐍 Testing via Google GenAI Python SDK...")
    try:
        genai.configure(api_key=api_key)
        # Using gemini-1.5-flash as a safe default for testing
        model = genai.GenerativeModel('gemini-2.5-flash')
        response = model.generate_content("Reply with 'SDK is working!'")
        
        if response and response.text:
            print("✅ SDK Request Successful!")
            print(f"   Response from Gemini: \"{response.text.strip()}\"")
        else:
            print("⚠️ SDK worked but returned empty response.")
            
    except Exception as e:
        print(f"❌ SDK Error: {e}")
        print("   Note: If HTTP checked passed but SDK failed, check your 'google-generativeai' package version.")

if __name__ == "__main__":
    test_gemini_key()
