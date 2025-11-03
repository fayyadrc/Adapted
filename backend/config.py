import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    """Loads configuration settings for the Flask application."""
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'a-very-secret-key'
    GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY')
    
    # Supabase Configuration
    SUPABASE_URL = os.environ.get('SUPABASE_URL')
    SUPABASE_KEY = os.environ.get('SUPABASE_KEY')

