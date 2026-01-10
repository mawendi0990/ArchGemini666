@echo off
if not exist "frontend\node_modules" (
    echo [INFO] detected first run (missing node_modules).
    echo Launching setup wizard...
    call setup.bat
)

echo Starting ArchGemini...

:: Start Backend
if "%BACKEND_HOST%"=="" set "BACKEND_HOST=0.0.0.0"
if "%BACKEND_PORT_FALLBACKS%"=="" set "BACKEND_PORT_FALLBACKS=18000 18001 50000 50001 8000"
start "ArchGemini Backend" cmd /k "cd backend && setlocal EnableDelayedExpansion && set HOST=%BACKEND_HOST% && set PORTS=%BACKEND_PORT_FALLBACKS% && for %%P in (!PORTS!) do (echo [Backend] Try http://!HOST!:%%P && uv run python -m uvicorn app:app --reload --host !HOST! --port %%P && exit /b 0) && echo [Backend] All ports failed. Try set BACKEND_PORT_FALLBACKS=18000 18001 50000 && pause"

:: Start Frontend (React + Electron)
start "ArchGemini Frontend" cmd /k "cd frontend && npm run dev"

echo Services started.
echo.
echo ========================================================
echo  Local Network Access Info (Share this IP with others):
echo ========================================================
ipconfig | findstr "IPv4"
echo ========================================================
echo  Backend: http://[Your-IP]:8000
echo  Frontend: http://[Your-IP]:5173
echo ========================================================
pause
