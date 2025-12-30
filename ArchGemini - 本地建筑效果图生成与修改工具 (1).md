# **ArchGemini \- 本地建筑效果图生成与修改工具**

## **1\. 项目简介 (Project Overview)**

**ArchGemini** 是一个基于 Google Gemini API 和 Qwen API 开发的本地桌面端工具。

该工具专为**建筑师和室内设计师**打造，结合了 Gemini 强大的**图像生成与理解能力**以及 Qwen 优秀的**语言处理能力**，实现从灵感到渲染的闭环：

1. **智能提示词优化**：用户输入简单的中文描述，由 Qwen 扩写为专业的英文建筑渲染提示词。  
2. **视觉灵感分析**：利用 Gemini 的视觉理解能力，分析参考图的风格、材质和空间结构，辅助生成类似方案。  
3. **高质量渲染生成**：文本/图像到图像的快速生成。  
4. **网络灵活接入**：支持配置自定义 API 中转地址 (如 Cloudflare Workers)，解决网络访问问题。

## **2\. 技术栈 (Tech Stack)**

* **核心框架**: Python 3.10+, Streamlit (前端与交互)  
* **环境管理**: uv (极速 Python 包管理器)  
* **图像模型 API**: Google Gemini API (支持自定义 endpoint 和模型版本)  
* **语言模型 API**: Qwen (通义千问，支持自定义模型版本)  
* **工具库**:  
  * python-dotenv: 环境配置  
  * httpx: 异步请求 (需支持 Base URL 替换)  
  * Pillow: 图像处理  
  * streamlit-drawable-canvas: (预留) 用于未来实现简单的绘图交互  
* **配置管理**: .env 文件 (严格管理 API Key、Endpoint 和模型名称)

## **3\. 功能需求清单 (Feature Requirements)**

### **第一阶段：基础架构与 Prompt 智能系统 (MVP)**

* **环境配置**:  
  * 系统启动时自动读取 .env 文件。  
  * **关键**: 必须检查 API\_BASE\_URL (中转地址) 是否配置，若配置则用于替换官方 API 域名。  
  * 读取可配置的模型名称 (GEMINI\_MODEL\_NAME, QWEN\_MODEL\_NAME)。  
* **智能提示词 (Powered by Qwen)**:  
  * 输入框：用户输入简单的中文概念（例如：“湖边的现代玻璃别墅，黄昏”）。  
  * 处理：后端调用 Qwen API，将中文扩写为包含光照、材质、渲染引擎关键词的详细英文 Prompt。  
  * 展示：允许用户在生成图片前微调 Qwen 生成的 Prompt。  
* **文本生图**: 调用 Gemini API 生成建筑效果图并保存。

### **第二阶段：视觉理解与多模态工作流 (Visual Understanding)**

* **参考图分析 (Image Understanding)**:  
  * 功能：用户上传一张喜欢的建筑参考图。  
  * 处理：调用 Gemini 图片理解接口（generateContent），提取图片的建筑风格、材质构成和光影布局。  
  * 输出：生成一份详细的文本描述，可直接用于“文生图”或作为“修改建议”。  
* **图生图/变体**: 结合参考图和文本描述生成新的设计方案。

### **第三阶段：高级编辑 (Future)**

* **局部重绘与修改**: 待 API 支持后，利用 Streamlit Canvas 插件实现简单的遮罩上传。

## **4\. API 集成指南 (API Integration Guide)**

### **4.1 环境变量配置 (Configuration)**

项目根目录必须包含 .env 文件。

**变更说明**: 新增了 API\_BASE\_URL 用于中转，以及 \*\_MODEL\_NAME 用于指定模型。

\# .env file

\# \=== 认证信息 \===  
GOOGLE\_API\_KEY=your\_google\_api\_key\_here  
QWEN\_API\_KEY=your\_qwen\_api\_key\_here

\# \=== 网络配置 (Cloudflare Workers 中转) \===  
\# 如果使用官方地址: \[https://generativelanguage.googleapis.com\](https://generativelanguage.googleapis.com)  
\# 如果使用 CF Worker: \[https://your-worker-name.username.workers.dev\](https://your-worker-name.username.workers.dev)  
API\_BASE\_URL=\[https://your-custom-proxy-domain.com\](https://your-custom-proxy-domain.com)

\# \=== 模型配置 \===  
\# 绘图/识图模型 (例如: gemini-3-pro-image-preview 或 imagen-3.0-generate-001)  
GEMINI\_MODEL\_NAME=gemini-3-pro-image-preview

\# 提示词优化模型 (例如: qwen-turbo, qwen-plus, qwen-max)  
QWEN\_MODEL\_NAME=qwen-plus

代码读取示例：

import os  
import streamlit as st  
from dotenv import load\_dotenv

load\_dotenv()

\# 读取配置  
BASE\_URL \= os.getenv("API\_BASE\_URL", "\[https://generativelanguage.googleapis.com\](https://generativelanguage.googleapis.com)")  
GEMINI\_MODEL \= os.getenv("GEMINI\_MODEL\_NAME", "gemini-3-pro-image-preview")  
QWEN\_MODEL \= os.getenv("QWEN\_MODEL\_NAME", "qwen-plus")  
GOOGLE\_KEY \= os.getenv("GOOGLE\_API\_KEY")

if not GOOGLE\_KEY:  
    st.error("配置缺失: 请检查 .env 文件中的 GOOGLE\_API\_KEY")

### **4.2 Gemini 服务封装 (支持中转)**

**关键逻辑**: 在构造请求 URL 时，必须使用 API\_BASE\_URL 替换官方域名。

\# services/gemini\_service.py 伪代码

async def generate\_image(prompt, aspect\_ratio="16:9"):  
    \# 1\. 构建 URL (使用中转地址 \+ 模型名称)  
    \# 注意: Google API 路径通常为 /v1beta/models/{model}:predict  
    base\_url \= os.getenv("API\_BASE\_URL").rstrip('/')  
    model\_name \= os.getenv("GEMINI\_MODEL\_NAME")  
    url \= f"{base\_url}/v1beta/models/{model\_name}:predict"  
      
    headers \= {"x-goog-api-key": os.getenv("GOOGLE\_API\_KEY")}  
      
    \# ... 发送 httpx 请求 ...

### **4.3 Qwen 服务封装**

同样需要支持模型名称配置。

\# services/qwen\_service.py 伪代码

def optimize\_prompt(user\_input):  
    model \= os.getenv("QWEN\_MODEL\_NAME", "qwen-plus")  
    \# 调用 DashScope SDK 或 HTTP 接口时传入 model 参数  
    \# ...

## **5\. 项目结构规范 (Project Structure)**

arch-gemini/  
├── app.py              \# Streamlit 主入口 (UI逻辑)  
├── services/           \# 业务逻辑层 (与UI分离)  
│   ├── \_\_init\_\_.py  
│   ├── gemini\_vision.py \# 图片理解  
│   ├── gemini\_gen.py    \# 图片生成 (需处理 Base URL)  
│   └── qwen\_service.py  \# 提示词优化  
├── utils/  
│   └── image\_utils.py   \# 图片转换工具  
├── .env                \# 敏感信息 (包含中转地址和模型名)  
├── pyproject.toml      \# uv 依赖配置  
└── README.md

## **6\. 开发注意事项**

1. **URL 拼接严谨性**: 处理 API\_BASE\_URL 时，注意末尾斜杠 / 的处理，防止拼接出 //v1beta 导致请求失败。建议使用 urllib.parse.urljoin 或手动 rstrip('/')。  
2. **网络超时**: 由于经过中转，建议适当增加 httpx 的 timeout 设置（例如设置为 60秒），因为生成高清建筑图可能较慢。  
3. **模型兼容性检查**: 不同的 Gemini 模型版本（如 1.5 Pro vs 3.0 Image）的 API Payload 结构可能略有不同。当前代码应主要适配 gemini-3-pro-image-preview 的结构 (instances \+ parameters)。

## **7\. 启动步骤 (Getting Started)**

推荐使用 [uv](https://github.com/astral-sh/uv) 进行极速环境管理。

1. **初始化与安装**:  
   uv init  
   uv add streamlit python-dotenv httpx Pillow watchdog

2. 配置环境:  
   复制 .env.example 为 .env，填入 API Key、中转地址 (API\_BASE\_URL) 和模型名称。  
3. **运行应用**:  
   uv run streamlit run app.py  
