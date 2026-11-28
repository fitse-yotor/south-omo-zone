@echo off
rem Double-click to start the admin panel and the website. Close this window or press Ctrl+C to stop.
title South Omo Zone portal
cd /d "%~dp0"
node scripts\start.mjs --open
if errorlevel 1 pause
