@echo off
cd /d "%~dp0\backend"

:: Simply use port 18000 to avoid conflicts with 8000
set PORT=18000
set HOST=0.0.0.0

echo ==================================================
echo [Backend] Starting on http://%HOST%:%PORT%
echo ==================================================

uv run python -m uvicorn app:app --reload --host %HOST% --port %PORT%

if %errorlevel% neq 0 (
    echo.
    echo [Backend] Startup failed!
    pause
)