@echo off
title HAND BLAST
cd /d "%~dp0"
where py >nul 2>nul
if %errorlevel%==0 (
  start "" "http://localhost:5500"
  py -m http.server 5500
  pause
  goto :eof
)
where python >nul 2>nul
if %errorlevel%==0 (
  start "" "http://localhost:5500"
  python -m http.server 5500
  pause
  goto :eof
)
echo Python is not installed.
echo Install Python, then run START-GAME.bat again.
pause
