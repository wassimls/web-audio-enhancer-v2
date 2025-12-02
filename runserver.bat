@echo off
title Audio Enhancer Pro - Development Server
color 0A

echo ========================================
echo    Audio Enhancer Pro v2.0
echo    Studio-Quality Audio Processing
echo ========================================
echo.

cd /d "%~dp0audio-enhancer-react"

echo [1/3] Checking npm installation...
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] npm is not installed!
    echo Please install Node.js from: https://nodejs.org/
    pause
    exit /b 1
)

echo [OK] npm found
echo.

echo [2/3] Starting development server...
echo.
echo Server will start at: http://localhost:5173
echo Browser will open automatically...
echo Press Ctrl+C to stop the server
echo.

REM Wait 3 seconds then open browser
start "" cmd /c "timeout /t 3 /nobreak >nul && start http://localhost:5173"

echo [3/3] Running server...
echo.

npm run dev

pause
