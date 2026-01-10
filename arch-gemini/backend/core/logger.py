import sqlite3
import os
import base64
import uuid
from datetime import datetime
from typing import Optional

# Setup paths
BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BACKEND_DIR, "history.db")
IMAGES_DIR = os.path.join(BACKEND_DIR, "history_images")

# Ensure images directory exists
os.makedirs(IMAGES_DIR, exist_ok=True)

def init_db():
    """Initialize the SQLite database."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Create table for request logs
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS request_logs (
        id TEXT PRIMARY KEY,
        timestamp TEXT NOT NULL,
        client_ip TEXT,
        prompt TEXT,
        model TEXT,
        api_key_suffix TEXT,
        image_filename TEXT,
        request_type TEXT
    )
    ''')
    
    conn.commit()
    conn.close()

# Initialize DB on module load
init_db()

def save_image_backup(image_base64: str) -> str:
    """Save base64 image to local disk and return filename."""
    try:
        filename = f"{datetime.now().strftime('%Y%m%d_%H%M%S')}_{uuid.uuid4().hex[:8]}.png"
        filepath = os.path.join(IMAGES_DIR, filename)
        
        # Remove header if present
        if "base64," in image_base64:
            image_base64 = image_base64.split("base64,")[1]
            
        with open(filepath, "wb") as f:
            f.write(base64.b64decode(image_base64))
            
        return filename
    except Exception as e:
        print(f"Failed to save image backup: {e}")
        return ""

def log_request(
    client_ip: str, 
    prompt: str, 
    model: str, 
    api_key: str, 
    image_base64: Optional[str] = None,
    request_type: str = "generation"
):
    """Log the request details and save image backup."""
    try:
        timestamp = datetime.now().isoformat()
        log_id = str(uuid.uuid4())
        
        # Extract key suffix for identification
        key_suffix = api_key[-4:] if api_key and len(api_key) > 4 else "unknown"
        
        image_filename = ""
        if image_base64:
            image_filename = save_image_backup(image_base64)
            
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        cursor.execute('''
        INSERT INTO request_logs (id, timestamp, client_ip, prompt, model, api_key_suffix, image_filename, request_type)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (log_id, timestamp, client_ip, prompt, model, key_suffix, image_filename, request_type))
        
        conn.commit()
        conn.close()
        
        print(f"Request logged: {log_id} | IP: {client_ip} | Model: {model}")
        
    except Exception as e:
        print(f"Failed to log request: {e}")
