import httpx
import base64
from core.config import settings

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

    b64_image = base64.b64encode(image_bytes).decode('utf-8')

    data = {
        "contents": [
            {
                "parts": [
                    {"text": prompt},
                    {
                        "inline_data": {
                            "mime_type": mime_type,
                            "data": b64_image
                        }
                    }
                ]
            }
        ]
    }

    async with httpx.AsyncClient(timeout=60.0) as client:
        try:
            response = await client.post(url, json=data, headers=headers)
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
