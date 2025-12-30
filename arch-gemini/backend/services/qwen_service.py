import httpx
from core.config import settings
from core.http_client import http_client
from prompts import ARCH_RENDER_SYSTEM_PROMPT
from error_prompts import ERROR_TRANSLATION_SYSTEM_PROMPT

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
    
    client = http_client.get_client()
    try:
        response = await client.post(
            f"{base_url}/chat/completions",
            json=data,
            headers=headers,
            timeout=30.0
        )
        response.raise_for_status()
        result = response.json()
        return result['choices'][0]['message']['content'].strip()
    except httpx.HTTPStatusError as e:
        raise Exception(f"Qwen API Error: {e.response.text}")
    except Exception as e:
        raise Exception(f"Qwen Service Error: {str(e)}")

async def translate_error(error_msg: str) -> str:
    """Use Qwen to translate technical error messages into user-friendly Chinese."""
    if not settings.QWEN_API_KEY:
        return "发生未知错误（且Qwen API未配置）。"

    headers = {
        "Authorization": f"Bearer {settings.QWEN_API_KEY}",
        "Content-Type": "application/json"
    }
    
    data = {
        "model": settings.QWEN_MODEL,
        "messages": [
            {"role": "system", "content": ERROR_TRANSLATION_SYSTEM_PROMPT},
            {"role": "user", "content": f"Error Message: {error_msg}"}
        ]
    }

    base_url = settings.QWEN_API_BASE_URL.rstrip('/')
    
    try:
        client = http_client.get_client()
        # Use a short timeout for error translation to avoid long waits
        response = await client.post(
            f"{base_url}/chat/completions",
            json=data,
            headers=headers,
            timeout=5.0
        )
        response.raise_for_status()
        result = response.json()
        return result['choices'][0]['message']['content'].strip()
    except Exception:
        # Fallback if translation fails
        return "系统繁忙，请稍后重试。"

