import requests
import json
import time

CANVA_API_BASE = "https://api.canva.com/rest/v1"

def create_design_autofill_job(data, template_id, access_token):
    """
    Creates a new design autofill job in Canva.
    
    Args:
        data (dict): key-value pairs to fill into the template.
        template_id (str): The ID of the Canva brand template.
        access_token (str): Valid OAuth access token.
        
    Returns:
        dict: The response containing the job_id.
    """
    url = f"{CANVA_API_BASE}/autofills"
    
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "brand_template_id": template_id,
        "title": data.get("title", "Generated Infographic"),
        "data": {}
    }
    
    # Transform simple dictionary to Canva's expected 'data' format
    # Input: {"stats_1": "50%"}
    # Output: {"stats_1": {"type": "text", "text": "50%"}}
    # Note: This implies we know the type. For MVP, we'll assume text for now 
    # or improve mapping logic if we have images.
    
    for key, value in data.get('data', {}).items():
        if isinstance(value, str):
             payload["data"][key] = {"type": "text", "text": value}
        elif isinstance(value, dict) and "type" in value:
             # Already formatted
             payload["data"][key] = value
             
    try:
        response = requests.post(url, headers=headers, json=payload)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Canva Autofill Error: {e.response.text if e.response else str(e)}")
        raise e

def get_design_autofill_job(job_id, access_token):
    """
    Checks the status of an autofill job.
    """
    url = f"{CANVA_API_BASE}/autofills/{job_id}"
    
    headers = {
        "Authorization": f"Bearer {access_token}"
    }
    
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Canva Job Status Error: {e.response.text if e.response else str(e)}")
        raise e

def poll_design_autofill_job(job_id, access_token, max_attempts=10, delay=2):
    """
    Polls the job status until success or failure.
    """
    for _ in range(max_attempts):
        result = get_design_autofill_job(job_id, access_token)
        status = result.get('job', {}).get('status')
        
        if status == 'success':
            return result
        elif status == 'failed':
            raise Exception(f"Canva Job Failed: {result.get('job', {}).get('error')}")
            
        time.sleep(delay)
        
    raise Exception("Timeout waiting for Canva job to complete")

def list_brand_templates(access_token):
    """
    Lists brand templates (requires permission).
    """
    # NOTE: As of API v1, listing 'brand templates' specifically for autofill 
    # might require the assets API or just knowing the ID.
    # We will use this placeholder or just recommended hardcoding for now.
    pass
