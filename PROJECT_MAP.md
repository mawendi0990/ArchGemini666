# ArchGemini 项目地图

> **最后更新**: 2026-02-11
> **项目路径**: `I:\ArchGemini666`
> **用途**: AI 建筑效果图生成辅助工具

---

## 项目简介

ArchGemini 是一个桌面应用程序，帮助建筑设计师通过 AI 生成和优化效果图。

**核心功能**:
| 模式 | 说明 |
|------|------|
| 文生图 | 输入文字描述，生成建筑效果图 |
| 草图渲染 | 上传草图/模型截图，生成精细渲染图 |
| 创意组合 | 上传多张参考图，结合提示词生成新设计 |

**模型选择**: 支持 Flash（快速生成）和 Pro（高质量）两种模式切换 |

---

## 技术栈

| 层级 | 技术 |
|------|------|
| 后端 | Python + FastAPI |
| 前端 | React + Vite + Tailwind CSS |
| 桌面 | Electron |
| AI 模型 | Gemini (图像), Qwen (文本) |

---

## 目录结构

```
ArchGemini666/
│
├── .env                          # 环境配置（API密钥、模型、代理）
├── 一键启动.bat                   # 启动脚本
├── PROJECT_MAP.md                # 本文档
│
└── arch-gemini/                  # 主应用目录
    │
    ├── backend/                  # Python 后端
    │   ├── app.py               # FastAPI 入口 (端口 18000)
    │   ├── requirements.txt     # Python 依赖
    │   │
    │   ├── core/                # 核心模块
    │   │   ├── config.py        # 配置加载，多 Key 轮询逻辑
    │   │   ├── http_client.py   # HTTP 客户端
    │   │   └── logger.py        # 日志配置
    │   │
    │   ├── services/            # AI 服务
    │   │   ├── gemini_gen.py    # Gemini 图像生成
    │   │   ├── gemini_vision.py # Gemini 图像分析
    │   │   └── qwen_service.py  # Qwen 提示词优化
    │   │
    │   └── prompts.py           # 系统提示词 & 负面提示词
    │
    └── frontend/                 # React 前端
        ├── package.json
        ├── vite.config.js
        ├── tailwind.config.js
        │
        ├── electron/main.js      # Electron 主进程
        │
        └── src/
            ├── app.jsx           # 根组件
            ├── index.css
            │
            └── components/
                ├── HistorySidebar.jsx      # 历史记录
                ├── ImageGenerator.jsx      # 图像生成
                ├── ImageUploader.jsx       # 图片上传
                ├── PromptOptimizer.jsx     # 提示词优化
                └── ImageAnalyzer.jsx       # 图像分析
```

---

## API 端点

| 端点 | 方法 | 功能 | 调用模型 |
|------|------|------|----------|
| `/api/generate-image` | POST | 生成建筑效果图 | `gemini-3-pro-image-preview` |
| `/api/analyze-image` | POST | 分析上传的图片 | `gemini-3-pro-image-preview` |
| `/api/optimize-prompt` | POST | 优化用户提示词 | `qwen-plus` |
| `/api/health` | GET | 健康检查 | - |

---

## AI 模型配置

### 当前使用的模型

```bash
# 图像生成 (建筑效果图)
GEMINI_IMAGE_MODEL=gemini-3-pro-image-preview

# 图像分析 (参考图分析)
GEMINI_VISION_MODEL=gemini-3-pro-image-preview

# 提示词优化 (文本处理)
QWEN_MODEL=qwen-plus
```

### 模型用途说明

| 模型 | 用途 | 能力 |
|------|------|------|
| `gemini-3-pro-image-preview` | 图像生成/分析 | 文生图、图生图、图像理解 |
| `qwen-plus` | 提示词优化 | 将简单描述扩写为专业渲染提示词 |

---

## 环境配置 (.env)

```bash
# API Keys (逗号分隔 = 轮询)
GOOGLE_API_KEY=key1,key2,key3
QWEN_API_KEY=your-qwen-key

# 代理地址 (可选)
GOOGLE_API_BASE_URL=https://your-proxy.workers.dev/
QWEN_API_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1

# 模型 (可选，不填则使用默认值)
GEMINI_IMAGE_MODEL=gemini-3-pro-image-preview
GEMINI_IMAGE_FALLBACK_MODEL=        # 备用模型
GEMINI_VISION_MODEL=gemini-3-pro-image-preview
QWEN_MODEL=qwen-plus

# 服务端口
PORT=18000
```

### 配置特性

- **多 Key 轮询**: `GOOGLE_API_KEY` 支持逗号分隔多个 Key，自动轮询分配
- **代理支持**: 可配置 Cloudflare Workers 等反代地址
- **备用模型**: 主模型失败时自动切换到备用模型

---

## 数据流

### 图像生成流程
```
用户输入 → 提示词优化(可选) → 生成请求
    ↓
POST /api/generate-image
    ↓
gemini_gen.py (Key 轮询 → Gemini API)
    ↓
返回 Base64 图像 → 前端显示 → 保存历史
```

### 参考图分析流程
```
用户上传图片 → 选择分析模式
    ↓
POST /api/analyze-image
    ↓
gemini_vision.py (Gemini Vision API)
    ↓
返回描述文本 → 自动追加到提示词框
```

---

## 关键代码位置

| 功能 | 文件 | 行号/说明 |
|------|------|-----------|
| API 路由定义 | `backend/app.py` | 主入口 |
| 模型配置默认值 | `backend/core/config.py` | 12-15 行 |
| API Key 轮询逻辑 | `backend/core/config.py` | 26-34 行 |
| 图像生成 | `backend/services/gemini_gen.py` | `generate_image()` |
| 安全错误处理 | `backend/services/gemini_gen.py` | `_extract_inline_image_part()` |
| 参考图分析 | `backend/services/gemini_gen.py` | `_analyze_reference_images()` |
| 图像分析 | `backend/services/gemini_vision.py` | `analyze_image()` |
| 提示词优化 | `backend/services/qwen_service.py` | |

---

## 常见问题排查

| 问题 | 可能原因 | 解决方案 |
|------|----------|----------|
| 启动失败 | 依赖未安装 | 运行 `setup.bat` |
| 生成报错 | API Key 无效 | 检查 `.env` 中的 Key |
| 代理错误 | 反代地址不可用 | 更换 `GOOGLE_API_BASE_URL` |
| SAFETY 错误 | 提示词被拦截 | 修改提示词内容 |
| 端口占用 | 18000 被占用 | 修改 `.env` 中的 `PORT` |

---

## 维护日志

| 日期 | 更改 |
|------|------|
| 2026-02-11 | 修正 .env 模型配置注释，重写项目地图 |
