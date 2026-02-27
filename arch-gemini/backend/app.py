from fastapi import FastAPI, HTTPException, UploadFile, File, Form, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import uvicorn
import asyncio

# Import services
from services.qwen_service import optimize_prompt, translate_error
from services.gemini_gen import generate_image
from services.gemini_vision import analyze_image
from services.prompt_builder import get_prompt_builder
from core.logger import log_request

app = FastAPI(title="ArchGemini API")

# Concurrency Control (Semaphore)
# Allow up to 10 concurrent heavy tasks (generation/analysis) to avoid excessive queuing/overload
HEAVY_TASK_SEMAPHORE = asyncio.Semaphore(10)

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
    template_id: Optional[str] = None # 模板ID
    model: Optional[str] = None # 模型选择 (可选，覆盖默认模型)

class ImageWithRole(BaseModel):
    data: str  # base64 data
    role: str = "custom"  # style, composition, material, color, lighting, custom

class GenerateWithTemplateRequest(BaseModel):
    template_id: Optional[str] = None
    user_prompt: str
    images: List[ImageWithRole] = []
    aspect_ratio: str = "16:9"
    resolution: str = "1K"
    custom_template: Optional[str] = None  # 自定义模板字符串

class CreateTemplateRequest(BaseModel):
    template_id: str
    name: str
    description: str
    prompt_template: str
    category_id: str = "custom"
    default_roles: List[str] = []

class UpdateTemplateRequest(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    prompt_template: Optional[str] = None
    category_id: Optional[str] = None
    default_roles: Optional[List[str]] = None

class PreviewPromptRequest(BaseModel):
    template_id: Optional[str] = None
    user_prompt: str
    images: List[ImageWithRole] = []
    custom_template: Optional[str] = None

@app.get("/")
async def root():
    return {"message": "ArchGemini Backend is running!", "status": "ok"}

@app.post("/api/optimize-prompt")
async def optimize_prompt_endpoint(req: OptimizeRequest):
    async with HEAVY_TASK_SEMAPHORE:
        try:
            result = await optimize_prompt(req.text)
            return {"optimized_prompt": result}
        except Exception as e:
            print(f"Error optimizing prompt: {e}")
            # Translate error for user
            user_msg = await translate_error(str(e))
            raise HTTPException(status_code=500, detail=user_msg)

@app.post("/api/generate-image")
async def generate_image_endpoint(req: GenerateRequest, request: Request):
    async with HEAVY_TASK_SEMAPHORE:
        try:
            # Get client IP
            client_ip = request.client.host if request.client else "unknown"

            # Process images to extract mime_type and data
            processed_images = []
            for img in req.images:
                mime_type = "image/jpeg"
                data = img
                
                if "base64," in img:
                    # Format: data:image/png;base64,.....
                    parts = img.split("base64,")
                    data = parts[1]
                    
                    # Extract mime type from parts[0]
                    # parts[0] looks like "data:image/png;"
                    if "data:" in parts[0] and ";" in parts[0]:
                        mime_type = parts[0].split("data:")[1].split(";")[0]
                
                processed_images.append({
                    "data": data,
                    "mime_type": mime_type
                })
                    
            image_base64, mime_type, model_used, api_key_used = await generate_image(
                prompt=req.prompt,
                aspect_ratio=req.aspect_ratio,
                resolution=req.resolution,
                images=processed_images,
                model=req.model  # 使用前端指定的模型
            )
            
            # Log the request and backup image
            log_request(
                client_ip=client_ip,
                prompt=req.prompt,
                model=model_used,
                api_key=api_key_used,
                image_base64=image_base64,
                request_type="generation"
            )

            return {
                "image_base64": image_base64,
                "mime_type": mime_type,
                "model_used": model_used,
            }
        except Exception as e:
            print(f"Error generating image: {e}")
            user_msg = await translate_error(str(e))
            raise HTTPException(status_code=500, detail=user_msg)

@app.post("/api/analyze-image")
async def analyze_image_endpoint(
    request: Request,
    file: UploadFile = File(...), 
    prompt: Optional[str] = Form(None),
    analysis_type: str = Form("general") # general, scene, facade
):
    async with HEAVY_TASK_SEMAPHORE:
        try:
            client_ip = request.client.host if request.client else "unknown"
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
            
            description, api_key_used = await analyze_image(contents, mime_type, final_prompt)
            
            # Log analysis request (no generated image to save, but good to track usage)
            log_request(
                client_ip=client_ip,
                prompt=f"[{analysis_type}] {final_prompt[:50]}...",
                model="gemini-vision",
                api_key=api_key_used,
                image_base64=None,
                request_type="analysis"
            )

            return {"description": description}
        except Exception as e:
            print(f"Error analyzing image: {e}")
            user_msg = await translate_error(str(e))
            raise HTTPException(status_code=500, detail=user_msg)


# ==================== Template API Endpoints ====================

@app.get("/api/templates")
async def get_templates(category: Optional[str] = None):
    """获取所有模板列表"""
    try:
        builder = get_prompt_builder()
        if category:
            templates = builder.get_templates_by_category(category)
        else:
            templates = builder.get_all_templates()
        return {
            "templates": templates,
            "total": len(templates)
        }
    except Exception as e:
        print(f"Error getting templates: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/templates/{template_id}")
async def get_template(template_id: str):
    """获取单个模板详情"""
    try:
        builder = get_prompt_builder()
        template = builder.get_template(template_id)
        if not template:
            raise HTTPException(status_code=404, detail=f"Template '{template_id}' not found")
        return template
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error getting template: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/roles")
async def get_roles():
    """获取所有图片角色列表"""
    try:
        builder = get_prompt_builder()
        roles = builder.get_all_roles()
        return {
            "roles": roles,
            "total": len(roles)
        }
    except Exception as e:
        print(f"Error getting roles: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/categories")
async def get_categories():
    """获取所有模板分类"""
    try:
        builder = get_prompt_builder()
        categories = builder.get_categories()
        return {
            "categories": categories,
            "total": len(categories)
        }
    except Exception as e:
        print(f"Error getting categories: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/templates")
async def create_template(req: CreateTemplateRequest):
    """创建自定义模板"""
    try:
        builder = get_prompt_builder()

        # 验证模板格式
        validation = builder.validate_template(req.prompt_template)
        if not validation["valid"]:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid template: {', '.join(validation['errors'])}"
            )

        template = builder.create_custom_template(
            template_id=req.template_id,
            name=req.name,
            description=req.description,
            prompt_template=req.prompt_template,
            category_id=req.category_id,
            default_roles=req.default_roles
        )
        return {
            "message": "Template created successfully",
            "template": template
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error creating template: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.put("/api/templates/{template_id}")
async def update_template(template_id: str, req: UpdateTemplateRequest):
    """更新自定义模板"""
    try:
        builder = get_prompt_builder()

        # 检查是否为自定义模板
        existing = builder.get_template(template_id)
        if not existing:
            raise HTTPException(status_code=404, detail=f"Template '{template_id}' not found")
        if not existing.get("is_custom"):
            raise HTTPException(status_code=403, detail="Cannot update built-in templates")

        # 验证模板格式（如果提供了新的模板内容）
        if req.prompt_template:
            validation = builder.validate_template(req.prompt_template)
            if not validation["valid"]:
                raise HTTPException(
                    status_code=400,
                    detail=f"Invalid template: {', '.join(validation['errors'])}"
                )

        # 构建更新数据（只包含非None的字段）
        updates = {}
        if req.name is not None:
            updates["name"] = req.name
        if req.description is not None:
            updates["description"] = req.description
        if req.prompt_template is not None:
            updates["promptTemplate"] = req.prompt_template
        if req.category_id is not None:
            updates["categoryId"] = req.category_id
        if req.default_roles is not None:
            updates["defaultRoles"] = req.default_roles

        template = builder.update_custom_template(template_id, **updates)
        if not template:
            raise HTTPException(status_code=404, detail=f"Template '{template_id}' not found")

        return {
            "message": "Template updated successfully",
            "template": template
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error updating template: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/api/templates/{template_id}")
async def delete_template(template_id: str):
    """删除自定义模板"""
    try:
        builder = get_prompt_builder()

        # 检查是否为自定义模板
        existing = builder.get_template(template_id)
        if not existing:
            raise HTTPException(status_code=404, detail=f"Template '{template_id}' not found")
        if not existing.get("is_custom"):
            raise HTTPException(status_code=403, detail="Cannot delete built-in templates")

        success = builder.delete_custom_template(template_id)
        if not success:
            raise HTTPException(status_code=404, detail=f"Template '{template_id}' not found")

        return {"message": "Template deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error deleting template: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/preview-prompt")
async def preview_prompt(req: PreviewPromptRequest):
    """预览使用模板构建的完整Prompt"""
    try:
        builder = get_prompt_builder()

        # 转换图片格式
        images = [{"data": img.data, "role": img.role} for img in req.images]

        prompt, preview = builder.build_prompt_with_preview(
            template_id=req.template_id or "",
            user_prompt=req.user_prompt,
            images=images if images else None
        )

        return {
            "prompt": prompt,
            "preview": preview
        }
    except Exception as e:
        print(f"Error previewing prompt: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/generate-with-template")
async def generate_with_template(req: GenerateWithTemplateRequest, request: Request):
    """使用模板生成图像"""
    async with HEAVY_TASK_SEMAPHORE:
        try:
            client_ip = request.client.host if request.client else "unknown"
            builder = get_prompt_builder()

            # 构建Prompt
            images = [{"data": img.data, "role": img.role} for img in req.images]
            final_prompt, _ = builder.build_prompt_with_preview(
                template_id=req.template_id or "",
                user_prompt=req.user_prompt,
                images=images if images else None
            )

            # 处理图片数据用于API调用
            processed_images = []
            for img in req.images:
                mime_type = "image/jpeg"
                data = img.data

                if "base64," in data:
                    parts = data.split("base64,")
                    data = parts[1]
                    if "data:" in parts[0] and ";" in parts[0]:
                        mime_type = parts[0].split("data:")[1].split(";")[0]

                processed_images.append({
                    "data": data,
                    "mime_type": mime_type
                })

            # 生成图像
            image_base64, mime_type, model_used, api_key_used = await generate_image(
                prompt=final_prompt,
                aspect_ratio=req.aspect_ratio,
                resolution=req.resolution,
                images=processed_images
            )

            # 记录请求
            log_request(
                client_ip=client_ip,
                prompt=final_prompt,
                model=model_used,
                api_key=api_key_used,
                image_base64=image_base64,
                request_type="generation"
            )

            return {
                "image_base64": image_base64,
                "mime_type": mime_type,
                "model_used": model_used,
                "prompt_used": final_prompt
            }
        except Exception as e:
            print(f"Error generating with template: {e}")
            user_msg = await translate_error(str(e))
            raise HTTPException(status_code=500, detail=user_msg)


# ==================== Image Edit API Endpoints ====================

class EditImageRequest(BaseModel):
    """图像编辑请求"""
    source_image: str  # 原始图片的base64数据
    edit_prompt: str  # 编辑提示词，描述要进行的修改
    aspect_ratio: Optional[str] = None  # 保持原图比例
    resolution: str = "1K"
    mask_image: Optional[str] = None  # 可选的遮罩图片base64
    reference_images: List[ImageWithRole] = []  # 可选的参考图片


@app.post("/api/edit-image")
async def edit_image_endpoint(req: EditImageRequest, request: Request):
    """
    多轮图像编辑API

    支持基于之前生成的图片进行迭代修改。可以传入：
    - source_image: 要编辑的原始图片
    - edit_prompt: 编辑指令（如"将窗户改大"、"添加阳台"等）
    - reference_images: 可选的参考图片，用于指导修改方向
    """
    async with HEAVY_TASK_SEMAPHORE:
        try:
            client_ip = request.client.host if request.client else "unknown"

            # 构建编辑提示词
            builder = get_prompt_builder()

            # 基础编辑提示词
            base_edit_prompt = f"""基于提供的图片进行编辑修改。

编辑要求：{req.edit_prompt}

请保持原图的整体构图和风格，仅根据编辑要求进行修改。生成专业建筑渲染图，高清，细节丰富。"""

            # 如果有参考图片，使用模板构建器添加角色说明
            if req.reference_images:
                ref_images_list = [{"data": img.data, "role": img.role} for img in req.reference_images]
                final_prompt, _ = builder.build_prompt_with_preview(
                    template_id="",
                    user_prompt=base_edit_prompt,
                    images=ref_images_list
                )
            else:
                final_prompt = base_edit_prompt

            # 准备图片数据：源图片 + 参考图片
            processed_images = []

            # 首先添加源图片（作为主要参考）
            source_mime = "image/png"
            source_data = req.source_image
            if "base64," in source_data:
                parts = source_data.split("base64,")
                source_data = parts[1]
                if "data:" in parts[0] and ";" in parts[0]:
                    source_mime = parts[0].split("data:")[1].split(";")[0]

            processed_images.append({
                "data": source_data,
                "mime_type": source_mime,
                "role": "source"  # 标记为源图片
            })

            # 添加参考图片
            for ref_img in req.reference_images:
                ref_mime = "image/jpeg"
                ref_data = ref_img.data
                if "base64," in ref_data:
                    parts = ref_data.split("base64,")
                    ref_data = parts[1]
                    if "data:" in parts[0] and ";" in parts[0]:
                        ref_mime = parts[0].split("data:")[1].split(";")[0]

                processed_images.append({
                    "data": ref_data,
                    "mime_type": ref_mime
                })

            # 使用原图宽高比，或请求指定的比例
            aspect_ratio = req.aspect_ratio if req.aspect_ratio else "16:9"

            # 调用生成API
            image_base64, mime_type, model_used, api_key_used = await generate_image(
                prompt=final_prompt,
                aspect_ratio=aspect_ratio,
                resolution=req.resolution,
                images=processed_images
            )

            # 记录编辑请求
            log_request(
                client_ip=client_ip,
                prompt=f"[EDIT] {req.edit_prompt}",
                model=model_used,
                api_key=api_key_used,
                image_base64=image_base64,
                request_type="edit"
            )

            return {
                "image_base64": image_base64,
                "mime_type": mime_type,
                "model_used": model_used,
                "prompt_used": final_prompt,
                "edit_prompt": req.edit_prompt
            }
        except Exception as e:
            print(f"Error editing image: {e}")
            user_msg = await translate_error(str(e))
            raise HTTPException(status_code=500, detail=user_msg)


@app.post("/api/edit-with-template")
async def edit_with_template_endpoint(req: GenerateWithTemplateRequest, request: Request):
    """
    使用模板进行图像编辑

    结合模板系统和多图控制，实现更强大的编辑功能：
    - 可以使用模板定义编辑风格
    - 支持多张参考图片控制编辑方向
    """
    async with HEAVY_TASK_SEMAPHORE:
        try:
            client_ip = request.client.host if request.client else "unknown"
            builder = get_prompt_builder()

            # 构建编辑提示词
            images = [{"data": img.data, "role": img.role} for img in req.images]
            final_prompt, _ = builder.build_prompt_with_preview(
                template_id=req.template_id or "",
                user_prompt=f"图像编辑：{req.user_prompt}",
                images=images if images else None
            )

            # 处理图片数据
            processed_images = []
            for img in req.images:
                mime_type = "image/jpeg"
                data = img.data

                if "base64," in data:
                    parts = data.split("base64,")
                    data = parts[1]
                    if "data:" in parts[0] and ";" in parts[0]:
                        mime_type = parts[0].split("data:")[1].split(";")[0]

                processed_images.append({
                    "data": data,
                    "mime_type": mime_type
                })

            # 生成图像
            image_base64, mime_type, model_used, api_key_used = await generate_image(
                prompt=final_prompt,
                aspect_ratio=req.aspect_ratio,
                resolution=req.resolution,
                images=processed_images
            )

            # 记录请求
            log_request(
                client_ip=client_ip,
                prompt=f"[EDIT_WITH_TEMPLATE] {req.user_prompt}",
                model=model_used,
                api_key=api_key_used,
                image_base64=image_base64,
                request_type="edit"
            )

            return {
                "image_base64": image_base64,
                "mime_type": mime_type,
                "model_used": model_used,
                "prompt_used": final_prompt
            }
        except Exception as e:
            print(f"Error editing with template: {e}")
            user_msg = await translate_error(str(e))
            raise HTTPException(status_code=500, detail=user_msg)

if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
