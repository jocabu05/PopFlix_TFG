@echo off
REM START-POPFLIX.bat - Inicia todo el proyecto de una vez

cls
color 0B
echo.
echo ╔════════════════════════════════════╗
echo ║       popFlix - DEV STARTUP        ║
echo ╚════════════════════════════════════╝
echo.

set PROJECT=C:\popFlix_TFG

REM 1. Backend
echo 1^) Iniciando backend...
start "popFlix Backend" cmd /k "cd %PROJECT%\backend && node server.js"
timeout /t 3 /nobreak

REM 2. Frontend
echo 2^) Iniciando frontend...
start "popFlix Frontend" cmd /k "cd %PROJECT% && npx expo start"
timeout /t 3 /nobreak

REM 3. Auto-commit
echo 3^) Iniciando auto-commit watcher...
start "popFlix Auto-Commit" cmd /k "cd %PROJECT% && auto-commit-watcher.bat"
timeout /t 3 /nobreak

cls
color 0B
echo.
echo ╔════════════════════════════════════╗
echo ║  popFlix INICIADO CORRECTAMENTE    ║
echo ╚════════════════════════════════════╝
echo.
echo ^├─ Frontend: http://localhost:8081
echo ^├─ Backend: http://localhost:4000
echo ^└─ Auto-commit: Monitorando...
echo.
timeout /t 5 /nobreak
exit
