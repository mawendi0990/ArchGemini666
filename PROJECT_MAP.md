# ArchGemini 项目全景地图 (Project Map)

ArchGemini 是一个基于 **FastAPI (Python)** 和 **Electron + React** 的本地建筑效果图生成工具，集成了 Google Gemini (用于图像生成与视觉分析) 和 阿里 Qwen (用于提示词优化与翻译)。

## 🏗️ 项目概览 (Project Overview)
ArchGemini 旨在辅助建筑设计师通过 AI 生成效果图。它支持三种核心模式：
1.  **文生图 (Text-to-Image)**: 通过文字描述生成建筑图像。
2.  **草图/模型渲染 (Sketch-to-Image)**: 基于上传的草图或模型截图生成渲染图。
3.  **创意组合 (Composition)**: 结合多张参考图进行创意生成。

---

## 📂 文件结构与功能说明 (File Structure Map)

### 1. 根目录 (`/`)
*   `一键启动.bat`: **用户入口**。自动检测环境，首次运行会调用 `setup.bat`，之后启动前后端服务。
*   `arch-gemini/`: 项目源码主目录。

### 2. 后端 (`arch-gemini/backend/`)
基于 FastAPI 框架，负责核心业务逻辑与 AI 模型调用。
*   `app.py`: **后端入口**。
    *   定义 API 路由 (`/api/optimize-prompt`, `/api/generate-image`, `/api/analyze-image`)。
    *   使用 `HEAVY_TASK_SEMAPHORE` 限制并发任务数 (最大 10)。
*   `core/`: 核心配置与工具。
    *   `config.py`: 加载 `.env` 配置，定义模型名称 (Gemini 3 Pro, Qwen Plus) 和 API Key。
    *   `http_client.py`: 统一的 HTTP 客户端配置。
*   `services/`: 业务逻辑封装。
    *   `gemini_gen.py`: **图像生成服务**。调用 Gemini API 生成图像，处理 Base64 图片输入（图生图），包含 fallback 机制（主模型失败切换备用模型）。
    *   `gemini_vision.py`: **视觉分析服务**。使用 Gemini Vision 模型分析上传的图片（场景、立面等），生成描述词。
    *   `qwen_service.py`: **语言模型服务**。调用 Qwen 优化提示词，并将英文错误信息翻译为中文。
*   `prompts.py`: 存放系统级提示词 (System Prompts) 和负面提示词 (Negative Prompts)。
*   `analysis_prompts.py`: 存放不同分析模式（场景、立面）的专用提示词。

### 3. 前端 (`arch-gemini/frontend/`)
基于 React (Vite) 构建 UI，并使用 Electron 封装为桌面应用。
*   `electron/`:
    *   `main.js`: Electron 主进程，创建窗口，加载 React 应用。
*   `src/`: React 源码。
    *   `app.jsx`: **主组件**。管理三种模式的状态 (`text`, `sketch`, `composition`)，处理图片上传与分析回调。
    *   `components/`:
        *   `PromptOptimizer.jsx`: 提示词优化组件。
        *   `ImageGenerator.jsx`: 图片生成与展示组件。
        *   `ImageUploader.jsx`: 图片上传组件。
        *   `HistorySidebar.jsx`: 历史记录侧边栏。

---

## 🚀 核心功能链路 (Key Capabilities Flow)

### A. 图像生成 (Generate Image)
*   **路由**: `POST /api/generate-image`
*   **流程**: 前端发送 Prompt + 图片(可选) -> `app.py` 接收 -> 调用 `gemini_gen.py` -> Google Gemini API (`v1beta/models/...:generateContent`)。
*   **特性**: 支持分辨率选择 (1K, 2K, 4K)，自动追加负面提示词，支持 Base64 图片作为参考（图生图）。

### B. 图片分析 (Analyze Image)
*   **路由**: `POST /api/analyze-image`
*   **流程**: 用户上传图片 -> 选择分析类型 (General/Scene/Facade) -> `app.py` 选择对应 Prompt -> 调用 `gemini_vision.py` -> Google Gemini Vision API。
*   **结果**: 返回图片描述，前端自动追加到当前提示词框中。

### C. 提示词优化 (Optimize Prompt)
*   **路由**: `POST /api/optimize-prompt`
*   **流程**: 用户输入简单词 -> `app.py` -> 调用 `qwen_service.py` -> 阿里 Qwen API。
*   **作用**: 将简单的建筑描述扩写为专业的渲染提示词 (包含光照、材质、风格等细节)。

### D. 错误处理与翻译
*   **机制**: 当后端发生异常时，捕获错误信息 -> 调用 `qwen_service.py` 的 `translate_error` -> 返回中文友好的错误提示给前端。

---

## ⚙️ 关键配置 (Configuration)
位于 `.env` (由 `core/config.py` 加载):
*   `GOOGLE_API_KEY`: 用于 Gemini 图像生成与视觉分析。
*   `QWEN_API_KEY`: 用于提示词优化与错误翻译。
*   `GEMINI_IMAGE_MODEL`: 默认 `gemini-3-pro-image-preview`。
*   `QWEN_MODEL`: 默认 `qwen-plus`。

## 🐞 调试建议 (Debugging Tips)
1.  **启动失败**: 检查 `一键启动.bat` 输出，确保 Python 依赖 (`uv`) 和 Node 依赖 (`npm`) 已安装。
2.  **生成报错**: 检查 `backend` 控制台输出。如果是 API 错误，通常会被 Qwen 翻译，但原始错误日志会在控制台打印。
3.  **模型切换**: 如遇 Gemini API 404 或限流，可在 `.env` 中修改 `GEMINI_IMAGE_MODEL` 或配置 `GEMINI_IMAGE_FALLBACK_MODEL`。
