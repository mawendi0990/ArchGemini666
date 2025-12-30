# ArchGemini 团队服务器部署指南 (Web版)

## 1. 适用性分析
当前的 **v0.2.1 Beta** 版本架构完全支持在团队服务器上部署。由于采用了 **前后端分离 (React + FastAPI)** 架构，您可以轻松地将其从“单机桌面应用”转换为“局域网 Web 服务”。

*   **适合点**：
    *   后端已经是标准的 HTTP API 服务，天然支持多客户端并发请求。
    *   前端代码未依赖 Electron 专属 API（如文件系统直接操作），完全兼容标准浏览器。
*   **注意点**：
    *   目前**无用户登录系统**，局域网内任何人获得网址均可使用，且共享同一个 Google API Key 配额。
    *   生成的图片目前仅保存在浏览器内存中，刷新页面会丢失（需提醒团队成员及时下载）。

## 2. 改造步骤 (从桌面版 -> Web版)

### 第一步：修改前端 API 地址
目前前端硬编码了 `http://localhost:8000`，需改为相对路径或服务器 IP。

**修改文件**: `frontend/src/config.js` (建议新建此文件统一管理) 或直接修改组件。
*   **推荐方案**：将所有 fetch URL 从 `http://localhost:8000/api/...` 改为 `/api/...`（通过 Nginx 转发）或 `http://<服务器IP>:8000/api/...`。

### 第二步：编译前端
在服务器上（或本地编译后上传）执行：
```bash
cd frontend
npm run build
```
这将生成一个 `dist` 目录，里面包含了可以直接在浏览器运行的 HTML/CSS/JS 文件。

### 第三步：配置后端监听
修改 `backend/app.py` 或启动命令，使后端监听所有网络接口（不仅是 localhost）：
```bash
# 在服务器后端目录下运行
uv run uvicorn app:app --host 0.0.0.0 --port 8000
```

### 第四步：部署服务 (推荐 Nginx)
使用 Nginx 作为反向代理服务器，同时提供前端页面和 API 转发：

**Nginx 配置示例**:
```nginx
server {
    listen 80;
    server_name arch-gemini.internal;  # 团队内部域名或IP

    # 1. 前端页面 (编译后的 dist 目录)
    location / {
        root /var/www/arch-gemini/frontend/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # 2. 后端 API 转发
    location /api/ {
        proxy_pass http://127.0.0.1:8000;  # 转发给 Python 后端
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 3. 团队协作优势
1.  **统一环境**：无需每位成员安装 Python/Node.js 环境，打开浏览器即用。
2.  **资源共享**：服务器配置好高性能梯子/代理后，所有成员即可稳定连接 Gemini API，无需单独配置网络。
3.  **版本管理**：管理员更新服务器代码后，所有成员刷新页面即享最新功能。
