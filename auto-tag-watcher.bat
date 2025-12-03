@echo off
REM Auto-tag script - Crea tags automáticos cada hora con títulos descriptivos

cd C:\popFlix_TFG

REM Intervalo por defecto: 3600 segundos (1 hora)
set INTERVAL=3600
if not "%1"=="" set INTERVAL=%1

echo Iniciando auto-tag watcher...
echo Intervalo: %INTERVAL% segundos

:loop
git add . 2>nul
if NOT "%ERRORLEVEL%"=="0" goto loop

for /f %%A in ('git status --porcelain') do (
    set HAS_CHANGES=1
)

if defined HAS_CHANGES (
    for /f "tokens=2-4 delims=/ " %%a in ('date /t') do (set mydate=%%c-%%a-%%b)
    for /f "tokens=1-2 delims=/:" %%a in ('time /t') do (set mytime=%%a:%%b)
    
    echo [%mydate% %mytime%] Detectados cambios, haciendo commit y tag...
    
    git commit -m "Auto-snapshot: %mytime%"
    
    REM Crear tag con fecha y hora
    for /f "tokens=1-6" %%a in ('wmic os get localdatetime ^| find "20"') do set DT=%%a
    set YYYY=%DT:~0,4%
    set MM=%DT:~4,2%
    set DD=%DT:~6,2%
    set HH=%DT:~8,2%
    set MIN=%DT:~10,2%
    
    REM Nombre del tag con formato descriptivo
    set TAG_NAME=snapshot-%YYYY%%MM%%DD%T%HH%%MIN%
    
    REM Mensaje descriptivo con fecha y hora en español
    git tag -a %TAG_NAME% -m "Snapshot del Proyecto - %mydate% a las %mytime%"
    
    git push
    git push --tags
    
    echo [%mydate% %mytime%] Tag %TAG_NAME% creado y enviado a GitHub
    
    set HAS_CHANGES=
)

timeout /t %INTERVAL% /nobreak
goto loop
