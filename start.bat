@echo off
title FundMate AI Launcher
echo ====================================================
echo             FundMate AI - Quick Launcher
echo ====================================================
echo.
cd /d "%~dp0"

if not exist "node_modules\" (
    echo [1/2] Installing dependencies (first time setup)...
    echo This may take 1-2 minutes. Please wait...
    call npm install
    if errorlevel 1 (
        echo.
        echo [ERROR] Failed to install dependencies. Please make sure Node.js is installed.
        pause
        exit /b 1
    )
) else (
    echo [1/2] Dependencies already installed!
)

echo.
echo [2/2] Launching Next.js development server on port 3005...
echo Opening http://localhost:3005 in your browser...
echo.
start http://localhost:3005
call npm run dev
pause
