#!/usr/bin/env pwsh
# Start-PopFlix.ps1 - Inicia todo el proyecto en una ventana

$projectPath = "C:\popFlix_TFG"

Write-Host "╔════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║       popFlix - DEV STARTUP        ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════╝`n" -ForegroundColor Cyan

# 1. Iniciar backend
Write-Host "1️⃣  Iniciando backend (puerto 4000)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit -Command `"cd $projectPath\backend; node server.js`""
Start-Sleep -Seconds 2

# 2. Iniciar frontend
Write-Host "2️⃣  Iniciando frontend (Expo)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit -Command `"cd $projectPath; npx expo start`""
Start-Sleep -Seconds 2

# 3. Iniciar auto-commit watcher
Write-Host "3️⃣  Iniciando auto-commit watcher (cada 30 seg)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit -Command `"cd $projectPath; .\auto-commit-watcher.bat`""
Start-Sleep -Seconds 2

Write-Host "`n✅ ¡Todo listo!" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "📱 Frontend: http://localhost:8081" -ForegroundColor Yellow
Write-Host "🔌 Backend: http://localhost:4000" -ForegroundColor Yellow
Write-Host "📦 Auto-commit: Monitorando cambios..." -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
