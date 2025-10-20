import os
from dotenv import load_dotenv

# Load environment variables from the .env file in the same directory
load_dotenv()

class Config:
    """Loads configuration settings for the Flask application."""
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'a-very-secret-key'
    GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY')

