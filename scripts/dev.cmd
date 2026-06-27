@echo off
REM Launch the Next.js dev server using the portable Node install.
set "PATH=%LOCALAPPDATA%\nodejs-portable\node-v22.12.0-win-x64;%PATH%"
cd /d "%~dp0.."
npm run dev
