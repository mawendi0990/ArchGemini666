# ArchGemini 技术架构文档 (v0.2.1 Beta)

## 1. 项目概述
**ArchGemini** 是一款专为建筑师设计的本地桌面应用程序，旨在通过 AI 技术辅助建筑效果图的生成、修改与创意组合。项目采用前后端分离架构，利用 Google Gemini 3 Pro 的多模态能力进行图像生成与分析，结合 Qwen API 进行提示词优化。

## 2. 核心功能 (v0.2.1 已实现)

### 2.1 三大核心工作流
| 模式 | 描述 | 技术实现 |
| :--- | :--- | :--- |
| **文生图 (Text)** | 通过文本描述生成建筑效果图 | Gemini 3 Pro (`generateContent`) |
| **草图渲染 (Sketch)** | 上传手绘/模型截图，AI 保持结构生成渲染图 | Gemini 3 Pro 多模态输入 (Prompt + Image) |
| **组合生成 (Mix)** | 上传多张参考图（材质/风格），融合生成新方案 | Gemini 3 Pro 多模态输入 (Prompt + Images list) |

### 2.2 辅助功能
*   **提示词优化 (Prompt Engineering)**：使用 Qwen API 将简单的中文描述转化为专业的英文建筑渲染 Prompt。
*   **图片反推 (Image Analysis)**：上传参考图，使用 Gemini Vision 分析其风格、光照与材质，生成中文提示词。
*   **多模态交互**：支持拖拽上传图片，前端实时预览，自动处理 Base64 编码。

## 3. 技术架构

### 3.1 总体架构
```mermaid
graph TD
    User[用户] --> Frontend[前端 (Electron + React)]
    Frontend -->|HTTP REST| Backend[后端 (FastAPI)]
    Backend -->|API Call| Gemini[Google Gemini 3 Pro API]
    Backend -->|API Call| Qwen[Aliyun Qwen API]
```

### 3.2 前端 (Frontend)
*   **框架**: Electron + React (Vite)
*   **样式**: Tailwind CSS
*   **状态管理**: React `useState` + 模式状态隔离 (Text/Sketch/Mix 独立状态)
*   **关键组件**:
    *   `App.jsx`: 核心布局与状态路由。
    *   `ImageGenerator.jsx`: 处理生成请求与 Base64 图片渲染。
    *   `ImageUploader.jsx`: 通用图片上传组件，支持拖拽与分析回调。
    *   `PromptOptimizer.jsx`: 调用后端优化接口。

### 3.3 后端 (Backend)
*   **语言**: Python 3.10+
*   **框架**: FastAPI (ASGI)
*   **包管理**: `uv` (高性能 Python 包管理器)
*   **核心服务**:
    *   `services/gemini_gen.py`: 封装 Gemini 生图接口，支持原生多模态输入（List[Image]）。
    *   `services/gemini_vision.py`: 封装 Gemini 视觉分析接口。
    *   `services/qwen_service.py`: 封装 Qwen 文本优化接口。
*   **配置**: `core/config.py` 管理环境变量与模型版本。

## 4. 数据流与接口

### 4.1 图像生成 `/api/generate-image`
*   **Method**: POST
*   **Input**:
    ```json
    {
      "prompt": "现代极简别墅...",
      "aspect_ratio": "16:9",
      "images": ["base64_string_1", "..."]
    }
    ```
*   **Logic**: 后端直接调用 `gemini-3-pro-image-preview` 的 `:generateContent` 接口，将 Prompt 与 Image Parts 组合发送。
*   **Output**: Base64 编码的图片数据 + MIME Type。

### 4.2 图片分析 `/api/analyze-image`
*   **Method**: POST (Multipart)
*   **Input**: File (Image) + Prompt (指令)
*   **Logic**: 调用 Gemini Vision 模型，返回中文风格描述。

### 4.3 提示词优化 `/api/optimize-prompt`
*   **Method**: POST
*   **Input**: `{"text": "简单的描述"}`
*   **Logic**: 调用 Qwen 模型，输出包含渲染引擎关键词的专业 Prompt。

## 5. 开发环境与部署

### 5.1 目录结构
```
e:\ArchGemini\arch-gemini\
├── backend\          # Python FastAPI 服务
│   ├── .venv\        # uv 虚拟环境
│   ├── services\     # 业务逻辑
│   └── app.py        # 入口文件
├── frontend\         # React + Electron
│   ├── src\          # React 源码
│   └── electron\     # Electron 主进程
├── start.bat         # 一键启动脚本 (Windows)
└── README.md         # 项目说明
```

### 5.2 启动方式
双击根目录下的 `一键启动.bat` 或 `start.bat`，脚本会自动：
1.  启动后端 (Port 8000)
2.  启动前端开发服务器 (Port 5173) 并拉起 Electron 窗口。

## 6. 下阶段规划建议
1.  **参数精细化控制**：增加负向提示词 (Negative Prompt)、生成步数、随机种子控制。
2.  **历史记录管理**：本地存储生成的图片历史，支持回溯与重新编辑。
3.  **模型微调/LoRA**：探索接入本地 Stable Diffusion 后端以支持更精准的 ControlNet 建筑线稿控制（Gemini 目前仅支持语义级参考）。
4.  **云端同步**：用户账号体系与云端图库同步。
