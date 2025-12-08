import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env from project root (parent of backend directory)
env_path = Path(__file__).resolve().parent.parent / '.env'
load_dotenv(dotenv_path=env_path)

client_id = os.getenv("CANVA_CLIENT_ID")
client_secret = os.getenv("CANVA_CLIENT_SECRET")
redirect_uri = os.getenv("CANVA_REDIRECT_URI")

print(f"CLIENT_ID: |{client_id}|")
print(f"CLIENT_SECRET: |{client_secret}|")
print(f"REDIRECT_URI: |{redirect_uri}|")
