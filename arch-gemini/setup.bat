@echo off
setlocal
echo ===================================================
echo       ArchGemini Environment Setup Wizard
echo ===================================================

echo [1/3] Checking Prerequisites...

:: Check Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is NOT installed!
    echo Please install Node.js (v18+) from: https://nodejs.org/
    pause
    exit /b 1
) else (
    echo [OK] Node.js found.
)

:: Check uv
where uv >nul 2>nul
if %errorlevel% neq 0 (
    echo [WARNING] 'uv' is NOT installed. Installing uv...
    powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
    :: Refresh env vars
    set "PATH=%USERPROFILE%\.cargo\bin;%PATH%"
) else (
    echo [OK] uv found.
)

echo.
echo [2/3] Installing Frontend Dependencies...
cd frontend
if not exist node_modules (
    echo Installing npm packages... (This may take a while)
    call npm install
) else (
    echo [OK] Frontend dependencies already installed.
)
cd ..

echo.
echo [3/3] Setting up Backend Dependencies...
cd backend
echo Syncing Python environment with uv...
call uv sync
cd ..

echo.
echo ===================================================
echo       Setup Complete! You can now run start.bat
echo ===================================================
pause
