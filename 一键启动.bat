@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo ==========================================
echo       ArchGemini Launcher
echo ==========================================

cd /d "%~dp0\arch-gemini"

if not exist "backend" (
    echo Error: Backend directory not found!
    pause
    exit /b
)

if not exist "frontend" (
    echo Error: Frontend directory not found!
    pause
    exit /b
)

echo [1/2] Starting Backend (FastAPI)...
start "ArchGemini Backend" cmd /k "cd backend && uv run python -m uvicorn app:app --reload --host 0.0.0.0"

echo [2/2] Starting Frontend (Electron + React)...
start "ArchGemini Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ==========================================
echo       Services started!
echo       Please wait for the Electron window.
echo ==========================================
echo.
pause
