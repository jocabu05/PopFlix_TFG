@echo off
REM Auto-commit watcher script
REM Monitorea cambios y hace commits automáticos

cd C:\popFlix_TFG

echo Iniciando auto-commit watcher...
echo Intervalo: 30 segundos

:loop
git add . 2>nul
if NOT "%ERRORLEVEL%"=="0" goto loop

for /f %%A in ('git status --porcelain') do (
    set HAS_CHANGES=1
)

if defined HAS_CHANGES (
    for /f "tokens=2-4 delims=/ " %%a in ('date /t') do (set mydate=%%c-%%a-%%b)
    for /f "tokens=1-2 delims=/:" %%a in ('time /t') do (set mytime=%%a:%%b)
    
    echo [%mydate% %mytime%] Detectados cambios, haciendo commit...
    
    git commit -m "Auto-commit: %mytime%"
    git push
    
    set HAS_CHANGES=
)

timeout /t 30 /nobreak
goto loop
