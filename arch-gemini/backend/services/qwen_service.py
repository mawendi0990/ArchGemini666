import httpx
from core.config import settings
from prompts import ARCH_RENDER_SYSTEM_PROMPT

async def optimize_prompt(text: str) -> str:
    if not settings.QWEN_API_KEY:
        raise ValueError("QWEN_API_KEY is not set")

    headers = {
        "Authorization": f"Bearer {settings.QWEN_API_KEY}",
        "Content-Type": "application/json"
    }
    
    data = {
        "model": settings.QWEN_MODEL,
        "messages": [
            {"role": "system", "content": ARCH_RENDER_SYSTEM_PROMPT},
            {"role": "user", "content": text}
        ]
    }

    # Handle trailing slash in base URL
    base_url = settings.QWEN_API_BASE_URL.rstrip('/')
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            response = await client.post(
                f"{base_url}/chat/completions",
                json=data,
                headers=headers
            )
            response.raise_for_status()
            result = response.json()
            return result['choices'][0]['message']['content'].strip()
        except httpx.HTTPStatusError as e:
            raise Exception(f"Qwen API Error: {e.response.text}")
        except Exception as e:
            raise Exception(f"Qwen Service Error: {str(e)}")
