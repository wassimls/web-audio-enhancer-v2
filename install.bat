@echo off
title Audio Enhancer Pro - Installation
color 0B

echo ========================================
echo    Audio Enhancer Pro v2.0
echo    First-Time Setup
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

echo [2/3] Installing dependencies...
echo This may take a few minutes...
echo.

npm install

if %errorlevel% neq 0 (
    echo [ERROR] Installation failed!
    pause
    exit /b 1
)

echo.
echo [3/3] Installation complete!
echo.
echo ========================================
echo    You can now run the server using:
echo    runserver.bat
echo ========================================
echo.

pause
