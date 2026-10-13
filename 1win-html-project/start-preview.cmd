@echo off
title 1win Local Preview
cd /d "%~dp0"
set "ONEWIN_NODE=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
if not exist "%ONEWIN_NODE%" set "ONEWIN_NODE=node"
echo Open http://127.0.0.1:4173/ in your browser.
echo Close this window to stop the local preview.
"%ONEWIN_NODE%" scripts\serve.mjs
pause
