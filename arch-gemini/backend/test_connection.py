import os
import httpx
import asyncio
from dotenv import load_dotenv

load_dotenv()

KEY = os.getenv("GOOGLE_API_KEY")
BASE_URL = os.getenv("GOOGLE_API_BASE_URL", "https://generativelanguage.googleapis.com").rstrip('/')

async def test_connection():
    print(f"Testing connection to: {BASE_URL}")
    print(f"Using Key: {KEY[:4]}...{KEY[-4:]}")
    
    # Try listing models (simple GET request)
    url = f"{BASE_URL}/v1beta/models?key={KEY}"
    
    print(f"Request URL: {url.replace(KEY, 'HIDDEN_KEY')}")
    
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.get(url)
            print(f"Status Code: {resp.status_code}")
            if resp.status_code != 200:
                print(f"Error Response: {resp.text}")
            else:
                print("Success! Models list retrieved.")
                data = resp.json()
                print(f"Found {len(data.get('models', []))} models.")
        except Exception as e:
            print(f"Connection Failed: {e}")

if __name__ == "__main__":
    asyncio.run(test_connection())
