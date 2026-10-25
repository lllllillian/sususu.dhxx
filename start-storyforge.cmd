@echo off
setlocal
cd /d "%~dp0"

echo Starting StoryForge at http://localhost:5174/reading.html
echo Keep this window open while using the website.
echo Backup address: http://localhost:5174/reading.html
echo.

call powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0start-storyforge.ps1"
pause
