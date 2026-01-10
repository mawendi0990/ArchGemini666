@echo off
if not exist "frontend\node_modules" (
    echo [INFO] detected first run (missing node_modules).
    echo Launching setup wizard...
    call setup.bat
)

echo Starting ArchGemini...

:: Start Backend
start "ArchGemini Backend" cmd /k "cd backend && uv run python -m uvicorn app:app --reload"

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
