# ArchGemini

A local desktop application for architects to generate and modify architectural renderings using Google Gemini 3 Pro and Qwen API.

## Prerequisites

- **Python 3.10+**
- **Node.js 18+**
- **uv** (Python package manager)

## Setup

1. **Backend Setup**:
   ```bash
   cd backend
   # Ensure .env is configured with your API keys
   uv sync  # or install dependencies: fastapi uvicorn python-dotenv httpx Pillow
   ```

2. **Frontend Setup**:
   ```bash
   cd frontend
   npm install
   ```

## Running the Application

Double-click `start.bat` in the root directory.

Or run manually:

**Backend**:
```bash
cd backend
uv run uvicorn app:app --reload
```

**Frontend**:
```bash
cd frontend
npm run dev
```

## Configuration

Edit `backend/.env` to set your API keys:
- `GOOGLE_API_KEY`
- `QWEN_API_KEY`
- `GOOGLE_API_BASE_URL` (Optional)
- `QWEN_API_BASE_URL` (Optional)

## Tech Stack

- **Backend**: FastAPI, uv, httpx, Pillow
- **Frontend**: Electron, React, Tailwind CSS, Shadcn/UI (Concepts)
- **AI**: Gemini 3 Pro (Image/Vision), Qwen (Prompt Optimization)
