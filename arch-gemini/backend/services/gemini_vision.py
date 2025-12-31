import httpx
import base64
import asyncio
from concurrent.futures import ThreadPoolExecutor
from core.config import settings
from core.http_client import http_client

# Create a thread pool for CPU-bound tasks
executor = ThreadPoolExecutor(max_workers=4)

async def analyze_image(image_bytes: bytes, mime_type: str = "image/png", prompt: str = "Describe this architectural image in detail, focusing on style, materials, and lighting.") -> str:
    if not settings.GOOGLE_API_KEY:
        raise ValueError("GOOGLE_API_KEY is not set")

    base_url = settings.GOOGLE_API_BASE_URL.rstrip('/')
    model = settings.GEMINI_VISION_MODEL
    url = f"{base_url}/v1beta/models/{model}:generateContent"

    headers = {
        "x-goog-api-key": settings.GOOGLE_API_KEY,
        "Content-Type": "application/json"
    }

    # Offload base64 encoding to a thread to avoid blocking the event loop
    loop = asyncio.get_running_loop()
    b64_image = await loop.run_in_executor(executor, lambda: base64.b64encode(image_bytes).decode('utf-8'))

    data = {
        "contents": [
            {
                "parts": [
                    {"text": prompt},
                    {
                        "inlineData": {
                            "mimeType": mime_type,
                            "data": b64_image
                        }
                    }
                ]
            }
        ]
    }

    client = http_client.get_client()
    try:
        response = await client.post(url, json=data, headers=headers, timeout=60.0)
        response.raise_for_status()
        result = response.json()
        
        try:
            return result['candidates'][0]['content']['parts'][0]['text']
        except (KeyError, IndexError):
                raise Exception(f"Unexpected response structure: {str(result)[:200]}")

    except httpx.HTTPStatusError as e:
        raise Exception(f"Gemini API Error: {e.response.text}")
    except Exception as e:
        raise Exception(f"Gemini Vision Service Error: {str(e)}")
