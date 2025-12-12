import os
from dotenv import load_dotenv

# Load from frontend .env file for local development
load_dotenv(os.path.join(os.path.dirname(__file__), '..', 'frontend', '.env'))
load_dotenv()  # Also check local .env if it exists

class Config:
    """Loads configuration settings for the Flask application."""
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'a-very-secret-key'
    GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY') or os.environ.get('VITE_GEMINI_API_KEY')
    
    # Supabase Configuration - support both VITE_ prefixed and non-prefixed
    SUPABASE_URL = os.environ.get('SUPABASE_URL') or os.environ.get('VITE_SUPABASE_URL')
    # Use service_role key to bypass RLS, fallback to anon key
    SUPABASE_KEY = (os.environ.get('SUPABASE_SERVICE_KEY') or 
                    os.environ.get('VITE_SUPABASE_SERVICE_KEY') or 
                    os.environ.get('SUPABASE_KEY') or 
                    os.environ.get('VITE_SUPABASE_ANON_KEY'))
    
    # ElevenLabs Configuration
    ELEVENLABS_API_KEY = os.environ.get('ELEVENLABS_API_KEY')
    ELEVENLABS_HOST_VOICE = os.environ.get('ELEVENLABS_HOST_VOICE', 'jqcCZkN6Knx8BJ5TBdYR')
    ELEVENLABS_GUEST_VOICE = os.environ.get('ELEVENLABS_GUEST_VOICE', 'EkK5I93UQWFDigLMpZcX')

