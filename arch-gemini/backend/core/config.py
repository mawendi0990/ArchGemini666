import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
    QWEN_API_KEY = os.getenv("QWEN_API_KEY")
    GOOGLE_API_BASE_URL = os.getenv("GOOGLE_API_BASE_URL", "https://generativelanguage.googleapis.com")
    QWEN_API_BASE_URL = os.getenv("QWEN_API_BASE_URL", "https://dashscope.aliyuncs.com/compatible-mode/v1")
    
    GEMINI_IMAGE_MODEL = os.getenv("GEMINI_IMAGE_MODEL", "gemini-3-pro-image-preview")
    GEMINI_IMAGE_FALLBACK_MODEL = os.getenv("GEMINI_IMAGE_FALLBACK_MODEL", "")
    GEMINI_VISION_MODEL = os.getenv("GEMINI_VISION_MODEL", "gemini-3-pro-image-preview")
    QWEN_MODEL = os.getenv("QWEN_MODEL", "qwen-plus")

settings = Settings()
