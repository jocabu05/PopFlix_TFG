#!/usr/bin/env powershell

# Script para generar APK de popFlix
# Uso: .\build-apk.ps1

Write-Host "================================" -ForegroundColor Cyan
Write-Host "🚀 popFlix - Android APK Builder" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Verificar si estamos en el directorio correcto
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: No se encontró package.json" -ForegroundColor Red
    Write-Host "   Asegúrate de estar en la raíz del proyecto" -ForegroundColor Yellow
    exit 1
}

Write-Host "📦 Paso 1: Limpiar y preparar proyecto..." -ForegroundColor Yellow
expo prebuild --clean --npm

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error durante prebuild" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Prebuild completado" -ForegroundColor Green
Write-Host ""

Write-Host "🔨 Paso 2: Compilar APK de debug..." -ForegroundColor Yellow
cd android

# Limpiar compilaciones anteriores
Write-Host "   Limpiando compilaciones previas..." -ForegroundColor Gray
.\gradlew clean

# Compilar
Write-Host "   Compilando APK..." -ForegroundColor Gray
.\gradlew assembleDebug

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error durante compilación" -ForegroundColor Red
    cd ..
    exit 1
}

cd ..

Write-Host "✅ APK compilado exitosamente" -ForegroundColor Green
Write-Host ""

$apkPath = "android\app\build\outputs\apk\debug\app-debug.apk"

if (Test-Path $apkPath) {
    Write-Host "📱 APK generado en:" -ForegroundColor Cyan
    Write-Host "   $apkPath" -ForegroundColor White
    Write-Host ""
    Write-Host "📋 Información del APK:" -ForegroundColor Yellow
    
    $apkSize = (Get-Item $apkPath).Length / 1MB
    Write-Host "   Tamaño: $([Math]::Round($apkSize, 2)) MB" -ForegroundColor Green
    
    Write-Host ""
    Write-Host "🔄 Opciones:" -ForegroundColor Cyan
    Write-Host "   1. Instalar en dispositivo/emulador conectado" -ForegroundColor White
    Write-Host "      Comando: adb install -r '$apkPath'" -ForegroundColor Gray
    Write-Host ""
    Write-Host "   2. Subir a servidor y compartir por QR" -ForegroundColor White
    Write-Host "      - Sube el APK a Google Drive, Firebase o tu servidor" -ForegroundColor Gray
    Write-Host "      - Copia la URL de descarga pública" -ForegroundColor Gray
    Write-Host "      - Usa la pantalla 'Compartir por QR' en la app" -ForegroundColor Gray
    Write-Host ""
    Write-Host "   3. Distribuir directamente" -ForegroundColor White
    Write-Host "      - Comparte el archivo .apk por email, WhatsApp, etc." -ForegroundColor Gray
    Write-Host ""
    
    Write-Host "✅ ¡Construcción completada!" -ForegroundColor Green
} else {
    Write-Host "❌ No se encontró el APK compilado" -ForegroundColor Red
    exit 1
}
