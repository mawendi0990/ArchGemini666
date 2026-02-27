import httpx
from core.config import settings
from core.http_client import http_client

def _extract_inline_image_part(result: dict) -> tuple[str, str]:
    candidates = result.get("candidates") or []
    prompt_feedback = result.get("promptFeedback")
    
    # Check for direct prompt block
    if prompt_feedback and prompt_feedback.get("blockReason"):
        raise Exception(f"请求被拒绝: {prompt_feedback.get('blockReason')} (Prompt Unsafe)")

    if not candidates:
        # Check if it was blocked at the top level
        raise Exception(f"生成失败: 未返回任何结果。Response: {str(result)[:200]}")

    candidate = candidates[0]
    
    # Check finish reason
    finish_reason = candidate.get("finishReason")
    if finish_reason == "SAFETY":
        raise Exception("图片生成被安全策略拦截 (Safety Filter Triggered)。请尝试修改提示词，移除可能引起争议或敏感的内容。")
    if finish_reason == "RECITATION":
        raise Exception("生成内容可能涉及版权保护 (Recitation)，请尝试修改提示词。")
    if finish_reason and finish_reason != "STOP":
        # Usually STOP is normal for Image, but sometimes APIs return OTHER
        # For image generation, usually we just check if inline_data exists.
        pass

    parts = (candidate.get("content") or {}).get("parts") or []
    for part in parts:
        inline_data = part.get("inline_data") or part.get("inlineData")
        if not inline_data:
            continue
        data = inline_data.get("data")
        mime_type = inline_data.get("mime_type") or inline_data.get("mimeType") or "image/png"
        if data:
            return data, mime_type

    raise Exception(f"无法提取图片数据。Finish Reason: {finish_reason}. Response: {str(result)[:200]}")


from typing import Any, Dict, List, Union

# Gemini API 支持的最大图片数量
MAX_IMAGES_LIMIT = 14


def _validate_image_count(images: List[Any]) -> None:
    """验证图片数量不超过Gemini API限制"""
    if len(images) > MAX_IMAGES_LIMIT:
        raise ValueError(f"图片数量超出限制。最多支持 {MAX_IMAGES_LIMIT} 张图片，当前传入了 {len(images)} 张。")


def _get_image_role_name(role_id: str) -> str:
    """获取图片角色的中文名称"""
    role_names = {
        "style": "风格参考",
        "composition": "构图参考",
        "material": "材质参考",
        "color": "色彩参考",
        "lighting": "光照参考",
        "custom": "自定义参考"
    }
    return role_names.get(role_id, "参考")


def _build_image_reference_text(images: List[Dict[str, Any]]) -> str:
    """
    构建图片序号和角色说明文本

    当传入的图片包含role信息时，自动生成图片序号说明
    """
    if not images:
        return ""

    references = []
    for idx, img in enumerate(images, start=1):
        role = img.get("role", "custom") if isinstance(img, dict) else "custom"
        role_name = _get_image_role_name(role)
        references.append(f"- 图片{idx}：[{role_name}]")

    if references:
        return "\n参考：\n" + "\n".join(references)
    return ""


async def _generate_image_with_model(
    prompt: str,
    aspect_ratio: str,
    resolution: str,
    model: str,
    images: List[Union[str, Dict[str, Any]]] = [],
) -> tuple[str, str, str]:
    """
    使用指定模型生成图像

    Args:
        prompt: 提示词（可以包含图片序号说明）
        aspect_ratio: 宽高比 (1:1, 3:2, 2:3, 3:4, 4:3, 16:9, 21:9)
        resolution: 分辨率 (1K, 2K, 4K)
        model: 模型名称
        images: 图片列表，每项可以是 base64 字符串或包含 {"data": base64, "role": "style"} 的字典

    Returns:
        (base64_image_data, mime_type, api_key)
    """
    # 验证图片数量
    _validate_image_count(images)

    # 如果图片包含role信息，打印日志便于调试
    if images:
        for idx, img in enumerate(images, start=1):
            if isinstance(img, dict) and "role" in img:
                role_name = _get_image_role_name(img["role"])
                print(f"[GeminiGen] 图片{idx} 角色: {role_name}")

    # Use dynamic key rotation
    api_key = settings.get_google_api_key()
    if not api_key:
        raise ValueError("GOOGLE_API_KEY is not set")

    base_url = settings.GOOGLE_API_BASE_URL.rstrip('/')
    url = f"{base_url}/v1beta/models/{model}:generateContent"

    headers = {
        "x-goog-api-key": api_key,
        "Content-Type": "application/json"
    }

    from prompts import DEFAULT_NEGATIVE_PROMPT

    # Construct parts: text first, then images
    # Append negative prompt to ensure quality and safety
    full_prompt = f"{prompt}\n\n[Negative Prompt / Exclude]: {DEFAULT_NEGATIVE_PROMPT.strip()}"
    parts = [{"text": full_prompt}]
    for img in images:
        if isinstance(img, dict):
            img_b64 = img.get("data")
            mime_type = img.get("mime_type") or "image/jpeg"
        else:
            img_b64 = img
            mime_type = "image/jpeg"

        if not img_b64:
            continue

        parts.append(
            {
                "inlineData": {
                    "mimeType": mime_type,
                    "data": img_b64,
                }
            }
        )

    data = {
        "contents": [
            {
                "role": "user",
                "parts": parts
            }
        ],
        "generationConfig": {
            "responseModalities": ["IMAGE"],
            "imageConfig": {
                "aspectRatio": aspect_ratio,
                "imageSize": resolution  # Valid: "1K", "2K", "4K"
            }
        }
    }

    client = http_client.get_client()
    response = await client.post(url, json=data, headers=headers, timeout=60.0)
    response.raise_for_status()
    result = response.json()
    image_data, mime_type = _extract_inline_image_part(result)
    return image_data, mime_type, api_key


from services.gemini_vision import analyze_image
import base64

async def _analyze_reference_images(images: List[str]) -> str:
    """Analyze multiple images and return a combined description prompt."""
    if not images:
        return ""
    
    descriptions = []
    # Process sequentially to avoid rate limits or complex concurrency for now
    for i, img_b64 in enumerate(images):
        try:
            # Simple decoding to bytes for the existing analyze_image function
            img_bytes = base64.b64decode(img_b64)
            # analyze_image handles key internally, but we might want to standardize
            desc, _ = await analyze_image(
                img_bytes, 
                mime_type="image/jpeg", # Defaulting to jpeg/png as generic
                prompt="请详细描述这张图片的视觉特征、构图、材质和光照，用于指导AI重新生成类似的画面。"
            )
            descriptions.append(f"参考图 {i+1} 特征: {desc}")
        except Exception as e:
            print(f"Failed to analyze reference image {i}: {e}")
            
    if not descriptions:
        return ""
        
    return "\n\n【参考图像分析】:\n" + "\n".join(descriptions)

async def generate_image(prompt: str, aspect_ratio: str = "16:9", resolution: str = "1K", images: List[dict] = [], model: str = None) -> tuple[str, str, str, str]:
    """
    生成图像

    Args:
        prompt: 提示词
        aspect_ratio: 宽高比
        resolution: 分辨率 (1K, 2K, 4K)
        images: 参考图片列表
        model: 可选，指定使用的模型 (如 gemini-3-pro-image-preview, gemini-3.1-flash-image-preview)
               如果不指定，使用配置文件中的默认模型

    Returns:
        (image_base64, mime_type, model_used, api_key_used)
    """
    # 使用指定的模型，如果没有指定则使用默认模型
    primary_model = model or settings.GEMINI_IMAGE_MODEL
    fallback_model = settings.GEMINI_IMAGE_FALLBACK_MODEL

    # Use explicit imageSize parameter for Gemini 3 Pro
    # Ref: https://ai.google.dev/gemini-api/docs/image-generation?hl=zh-cn
    # Valid values: "1K", "2K", "4K"

    # Ensure resolution is uppercase just in case
    clean_resolution = resolution.upper() if resolution else "1K"

    try:
        image_b64, mime_type, api_key = await _generate_image_with_model(
            prompt=prompt,
            aspect_ratio=aspect_ratio,
            resolution=clean_resolution,
            model=primary_model,
            images=images
        )
        return image_b64, mime_type, primary_model, api_key
    except httpx.HTTPStatusError as e:
        error_content = e.response.text
        if "<!DOCTYPE html>" in error_content or "cloudflare" in error_content.lower():
             raise Exception("代理服务异常 (Cloudflare Error): 目标 Worker 出现 500/502 错误，请检查反代地址是否可用。")

        if e.response.status_code == 404 and fallback_model and fallback_model != primary_model:
            image_b64, mime_type, api_key = await _generate_image_with_model(
                prompt=prompt, 
                aspect_ratio=aspect_ratio, 
                resolution=clean_resolution,
                model=fallback_model, 
                images=images
            )
            return image_b64, mime_type, fallback_model, api_key
        raise Exception(f"Gemini API Error ({settings.GOOGLE_API_BASE_URL}): {e.response.text}")
    except Exception as e:
        raise Exception(f"Gemini Gen Service Error ({settings.GOOGLE_API_BASE_URL}): {str(e)}")
