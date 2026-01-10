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
if "%BACKEND_HOST%"=="" set "BACKEND_HOST=0.0.0.0"
if "%BACKEND_PORT_FALLBACKS%"=="" set "BACKEND_PORT_FALLBACKS=18000 18001 50000 50001 8000"
start "ArchGemini Backend" cmd /k "cd backend && setlocal EnableDelayedExpansion && set HOST=%BACKEND_HOST% && set PORTS=%BACKEND_PORT_FALLBACKS% && for %%P in (!PORTS!) do (echo [Backend] Try http://!HOST!:%%P && uv run python -m uvicorn app:app --reload --host !HOST! --port %%P && exit /b 0) && echo [Backend] All ports failed. Try set BACKEND_PORT_FALLBACKS=18000 18001 50000 && pause"

echo [2/2] Starting Frontend (Electron + React)...
start "ArchGemini Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ==========================================
echo       Services started!
echo       Please wait for the Electron window.
echo ==========================================
echo.
pause
