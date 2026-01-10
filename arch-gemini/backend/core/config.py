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

    def __init__(self):
        # Support multiple keys separated by comma
        raw_keys = os.getenv("GOOGLE_API_KEY", "")
        self.GOOGLE_API_KEYS = [k.strip() for k in raw_keys.split(",") if k.strip()]
        self._key_index = 0
        
        # Keep the single property for backward compatibility (returns the first one or None)
        self.GOOGLE_API_KEY = self.GOOGLE_API_KEYS[0] if self.GOOGLE_API_KEYS else None

    def get_google_api_key(self) -> str:
        """Get the next API key in rotation."""
        if not self.GOOGLE_API_KEYS:
            return None
        
        # Round-robin selection
        key = self.GOOGLE_API_KEYS[self._key_index]
        self._key_index = (self._key_index + 1) % len(self.GOOGLE_API_KEYS)
        return key

settings = Settings()

# Debug: Print loaded configuration
print("="*30)
print("ArchGemini Backend Configuration:")
print(f"GOOGLE_API_BASE_URL: {settings.GOOGLE_API_BASE_URL}")
print(f"GEMINI_IMAGE_MODEL: {settings.GEMINI_IMAGE_MODEL}")
if settings.GOOGLE_API_KEYS:
    print(f"GOOGLE_API_KEYS: Loaded {len(settings.GOOGLE_API_KEYS)} keys.")
    print(f"Current Key (Ends with): ...{settings.GOOGLE_API_KEYS[0][-4:] if len(settings.GOOGLE_API_KEYS[0]) > 4 else '****'}")
else:
    print("GOOGLE_API_KEY: Not Set")

if settings.QWEN_API_KEY:
    print(f"QWEN_API_KEY: Found (Ends with ...{settings.QWEN_API_KEY[-4:] if len(settings.QWEN_API_KEY) > 4 else '****'})")
else:
    print("QWEN_API_KEY: Not Set")
print("="*30)
