from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import uvicorn

# Import services
from services.qwen_service import optimize_prompt
from services.gemini_gen import generate_image
from services.gemini_vision import analyze_image

app = FastAPI(title="ArchGemini API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class OptimizeRequest(BaseModel):
    text: str

class GenerateRequest(BaseModel):
    prompt: str
    aspect_ratio: str = "16:9"
    resolution: str = "1K" # 1K, 2K, 4K
    images: List[str] = [] # List of base64 strings

@app.get("/")
async def root():
    return {"message": "ArchGemini Backend is running!", "status": "ok"}

@app.post("/api/optimize-prompt")
async def optimize_prompt_endpoint(req: OptimizeRequest):
    try:
        result = await optimize_prompt(req.text)
        return {"optimized_prompt": result}
    except Exception as e:
        print(f"Error optimizing prompt: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/generate-image")
async def generate_image_endpoint(req: GenerateRequest):
    try:
        # Basic cleanup of data:image/...;base64, prefix if present
        clean_images = []
        for img in req.images:
            if "," in img:
                clean_images.append(img.split(",")[1])
            else:
                clean_images.append(img)
                
        image_base64, mime_type, model_used = await generate_image(
            prompt=req.prompt, 
            aspect_ratio=req.aspect_ratio, 
            resolution=req.resolution,
            images=clean_images
        )
        return {
            "image_base64": image_base64,
            "mime_type": mime_type,
            "model_used": model_used,
        }
    except Exception as e:
        print(f"Error generating image: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/analyze-image")
async def analyze_image_endpoint(
    file: UploadFile = File(...), 
    prompt: Optional[str] = Form(None),
    analysis_type: str = Form("general") # general, scene, facade
):
    try:
        contents = await file.read()
        mime_type = file.content_type or "image/png"
        
        # Select prompt based on type
        from analysis_prompts import SCENE_ANALYSIS_PROMPT, FACADE_ANALYSIS_PROMPT, GENERAL_ANALYSIS_PROMPT
        
        final_prompt = prompt
        if not final_prompt:
            if analysis_type == "scene":
                final_prompt = SCENE_ANALYSIS_PROMPT
            elif analysis_type == "facade":
                final_prompt = FACADE_ANALYSIS_PROMPT
            else:
                final_prompt = GENERAL_ANALYSIS_PROMPT
        
        description = await analyze_image(contents, mime_type, final_prompt)
        return {"description": description}
    except Exception as e:
        print(f"Error analyzing image: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
