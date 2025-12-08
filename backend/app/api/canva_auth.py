import os
import secrets
import hashlib
import base64
import requests
from flask import Blueprint, request, jsonify, redirect, current_app, session
from .. import supabase

canva_auth_bp = Blueprint('canva_auth', __name__)

CANVA_AUTH_URL = "https://www.canva.com/api/oauth/authorize"
CANVA_TOKEN_URL = "https://api.canva.com/rest/v1/oauth/token"

def get_code_verifier_and_challenge():
    """Generates PKCE code verifier and challenge."""
    verifier = secrets.token_urlsafe(96)[:128]
    # Canva requires standard base64 encoding (not urlsafe) for the challenge, 
    # but the verifier should be sent as is.
    # WAIT: Standard PKCE spec says S256 uses URL-safe base64 without padding.
    # Let's double check Canva docs if possible. 
    # Usually: SHA256(verifier) -> Base64URL-encoded
    
    digest = hashlib.sha256(verifier.encode('utf-8')).digest()
    challenge = base64.urlsafe_b64encode(digest).rstrip(b'=').decode('utf-8')
    
    return verifier, challenge

@canva_auth_bp.route('/auth/url', methods=['GET'])
def get_auth_url():
    """Generates the Canva OAuth URL."""
    client_id = os.getenv("CANVA_CLIENT_ID")
    redirect_uri = os.getenv("CANVA_REDIRECT_URI", "http://localhost:5173/canva/callback")
    
    if not client_id:
        return jsonify({"error": "Missing Canva configuration"}), 500

    verifier, challenge = get_code_verifier_and_challenge()
    
    # Store verifier in session (or temp storage) to verify later
    # For now, we'll return it to the frontend to pass back, or store in a server-side session.
    # Assuming the frontend handles the redirect, we return the URL and let them store the verifier?
    # Better: Store in server-side session if Flask sessions are set up.
    # If not, we can pass it to frontend to hold in localStorage. 
    # Let's do server-side session for security if SECRET_KEY is set.
    
    # Generate state
    state = secrets.token_hex(16)
    
    # We will return the verifier to the frontend to store in localStorage 
    # because Flask session might be tricky with cross-origin defaults if not configured perfectly.
    # Ideally, httpOnly cookies are best, but let's stick to a simpler flow for this MVP 
    # where frontend orchestrates the redirect.
    
    import urllib.parse
    
    # Match the screenshot exactly: asset and design:content
    scopes = "design:content:read design:content:write asset:read asset:write"
    
    params = {
        "response_type": "code",
        "client_id": client_id,
        "redirect_uri": redirect_uri,
        "scope": scopes,
        "code_challenge": challenge,
        "code_challenge_method": "S256",
        "state": state
    }
    
    auth_url = f"{CANVA_AUTH_URL}?{urllib.parse.urlencode(params)}"
    
    return jsonify({
        "url": auth_url,
        "code_verifier": verifier, # Frontend should store this temporarily
        "state": state
    })

@canva_auth_bp.route('/auth/callback', methods=['POST'])
def auth_callback():
    """Exchanges code for access token."""
    data = request.json
    code = data.get('code')
    code_verifier = data.get('code_verifier')
    redirect_uri = os.getenv("CANVA_REDIRECT_URI", "http://localhost:5173/canva/callback") # Must match 
    client_id = os.getenv("CANVA_CLIENT_ID")
    client_secret = os.getenv("CANVA_CLIENT_SECRET")
    
    # Debug: Log if credentials are present
    print(f"DEBUG - client_id present: {bool(client_id)}, client_secret present: {bool(client_secret)}")
    print(f"DEBUG - redirect_uri: {redirect_uri}")
    print(f"DEBUG - code present: {bool(code)}, verifier present: {bool(code_verifier)}")
    
    if not client_id or not client_secret:
        return jsonify({"error": "Missing Canva credentials in environment"}), 500
    
    if not code or not code_verifier:
        return jsonify({"error": "Missing code or verifier"}), 400

    # Use requests.auth.HTTPBasicAuth which handles encoding correctly
    from requests.auth import HTTPBasicAuth
    
    headers = {
        "Content-Type": "application/x-www-form-urlencoded"
    }
    
    payload = {
        "grant_type": "authorization_code",
        "code": code,
        "code_verifier": code_verifier,
        "redirect_uri": redirect_uri
    }
    
    print(f"DEBUG - Payload: {payload}")
    print(f"DEBUG - Token URL: {CANVA_TOKEN_URL}")
    
    try:
        # Pass auth object to handle Basic Auth
        response = requests.post(
            CANVA_TOKEN_URL, 
            auth=HTTPBasicAuth(client_id, client_secret),
            headers=headers, 
            data=payload,
            timeout=30  # Add timeout
        )
        print(f"DEBUG - Response status: {response.status_code}")
        print(f"DEBUG - Response body: {response.text}")
        response.raise_for_status()
        token_data = response.json()
        
        # ... (user handling logic kept same)
        user_id = data.get('user_id')
        if user_id:
             pass
             
        return jsonify(token_data)
        
    except requests.exceptions.RequestException as e:
        print(f"DEBUG - Exception type: {type(e).__name__}")
        print(f"DEBUG - Exception: {str(e)}")
        error_body = e.response.text if e.response else "No response body"
        error_headers = e.response.headers if e.response else "No response headers"
        
        print(f"Canva Token Error Body: {error_body}")
        print(f"Canva Token Error Headers: {error_headers}")
        print(f"Debug - Status Code: {e.response.status_code if e.response else 'None'}")
        
        return jsonify({
            "error": "Token Exchange Failed",
            "canva_response": error_body,
            "status": e.response.status_code if e.response else 500
        }), 400

@canva_auth_bp.route('/status', methods=['GET'])
def check_status():
    """Checks if we have a valid token (this would require persistent storage)."""
    # Placeholder for checking DB if user is connected
    return jsonify({"connected": False})
