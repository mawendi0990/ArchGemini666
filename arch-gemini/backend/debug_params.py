
import asyncio
import os
import httpx
from dotenv import load_dotenv
import json

load_dotenv()

async def test_params():
    api_key = os.getenv("GOOGLE_API_KEY")
    base_url = os.getenv("GOOGLE_API_BASE_URL", "https://generativelanguage.googleapis.com").rstrip('/')
    model = "gemini-3-pro-image-preview"
    
    url = f"{base_url}/v1beta/models/{model}:generateContent"
    headers = {
        "x-goog-api-key": api_key,
        "Content-Type": "application/json"
    }
    
    # Test 1: candidateCount
    print("\n----- Testing candidateCount=2 -----")
    data_count = {
        "contents": [{"parts": [{"text": "A simple red cube, white background"}]}],
        "generationConfig": {
            "responseModalities": ["IMAGE"],
            "candidateCount": 2
        }
    }
    
    async with httpx.AsyncClient(timeout=60.0) as client:
        try:
            resp = await client.post(url, json=data_count, headers=headers)
            if resp.status_code == 200:
                res = resp.json()
                candidates = res.get('candidates', [])
                print(f"Success! Got {len(candidates)} candidates.")
            else:
                print(f"Failed. Status: {resp.status_code}, Body: {resp.text}")
        except Exception as e:
            print(f"Error: {e}")

    # Test 2: Native negativePrompt (if exists) inside imageConfig (?) or generationConfig (?)
    # Note: Vertex AI uses specific fields, but Gemini AI Studio often shares them.
    # Common guesses: "negativePrompt" in generationConfig? Or imageConfig?
    # Let's try imageConfig first as it has specific image params.
    print("\n----- Testing seed (randomSeed) -----")
    data_seed = {
        "contents": [{"parts": [{"text": "A simple blue cube, white background"}]}],
        "generationConfig": {
            "responseModalities": ["IMAGE"],
            "imageConfig": {},
            # "randomSeed": 12345 # Typically integers or strings? Gemini API uses integer usually
        }
    }
    # Note: Using a made up param often doesn't error, it just ignores. 
    # But let's see if we can find strict validation or just see if it runs.

if __name__ == "__main__":
    asyncio.run(test_params())
