import os
from supabase import create_client

# Manually load .env
env_path = os.path.join(os.path.dirname(__file__), '..', '.env')
if os.path.exists(env_path):
    with open(env_path, 'r') as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith('#'):
                continue
            if '=' in line:
                key, value = line.split('=', 1)
                # Remove quotes if present
                value = value.strip('"').strip("'")
                os.environ[key] = value

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_KEY")

if not url or not key:
    print("Error: SUPABASE_URL or SUPABASE_KEY not found in environment.")
    exit(1)

supabase = create_client(url, key)

print("--- Buckets ---")
try:
    buckets = supabase.storage.list_buckets()
    for b in buckets:
        print(f"- {b.name}")
except Exception as e:
    print(f"Error listing buckets: {e}")

print("\n--- Tables (checking 'learnings') ---")
try:
    # Try to select one row to see if table exists
    response = supabase.table("learnings").select("*").limit(1).execute()
    print("Table 'learnings' exists.")
    # print(response)
except Exception as e:
    print(f"Error accessing 'learnings' table: {e}")
