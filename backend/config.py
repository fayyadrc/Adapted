import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env from project root (parent of backend directory)
env_path = Path(__file__).resolve().parent.parent / '.env'
load_dotenv(dotenv_path=env_path)

class Config:
    """Loads configuration settings for the Flask application."""
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'a-very-secret-key'
    GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY')
    
    # Supabase Configuration
    SUPABASE_URL = os.environ.get('SUPABASE_URL')
    # Use service_role key to bypass RLS, fallback to anon key
    SUPABASE_KEY = os.environ.get('SUPABASE_SERVICE_KEY') or os.environ.get('SUPABASE_KEY')

