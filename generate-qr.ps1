#!/usr/bin/env powershell

# Script para generar QR desde PowerShell
# Uso: .\generate-qr.ps1 -Url "https://drive.google.com/uc?export=download&id=..." -OutputFile "popflix-qr.png"

param(
    [Parameter(Mandatory=$true)]
    [string]$Url,
    
    [Parameter(Mandatory=$false)]
    [string]$OutputFile = "popflix-qr.png"
)

Write-Host "================================" -ForegroundColor Cyan
Write-Host "📱 QR Code Generator" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Validar URL
if ([string]::IsNullOrWhiteSpace($Url)) {
    Write-Host "❌ Error: URL no puede estar vacía" -ForegroundColor Red
    Write-Host ""
    Write-Host "Uso: .\generate-qr.ps1 -Url 'https://...' -OutputFile 'qr.png'" -ForegroundColor Yellow
    exit 1
}

Write-Host "🔗 URL: $Url" -ForegroundColor White
Write-Host "📁 Salida: $OutputFile" -ForegroundColor White
Write-Host ""

# Verificar si qrcode está instalado
Write-Host "Verificando qrcode CLI..." -ForegroundColor Yellow
$qrcodeExists = dotnet tool list -g | Select-String "qrcode"

if (-not $qrcodeExists) {
    Write-Host "Instalando qrcode CLI..." -ForegroundColor Yellow
    dotnet tool install -g qrcode
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Error al instalar qrcode" -ForegroundColor Red
        Write-Host ""
        Write-Host "Alternativa: Usa https://qr-code-generator.com/" -ForegroundColor Yellow
        exit 1
    }
}

Write-Host "✅ qrcode CLI disponible" -ForegroundColor Green
Write-Host ""

# Generar QR
Write-Host "Generando QR..." -ForegroundColor Yellow
qrcode -o $OutputFile $Url

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ QR generado exitosamente" -ForegroundColor Green
    Write-Host ""
    
    $fileSize = (Get-Item $OutputFile).Length
    Write-Host "📊 Información:" -ForegroundColor Cyan
    Write-Host "   Archivo: $OutputFile" -ForegroundColor White
    Write-Host "   Tamaño: $fileSize bytes" -ForegroundColor White
    Write-Host ""
    
    Write-Host "📋 Próximos pasos:" -ForegroundColor Yellow
    Write-Host "   1. Abre el archivo $OutputFile" -ForegroundColor White
    Write-Host "   2. Comparte en WhatsApp, Telegram, Discord, etc." -ForegroundColor White
    Write-Host "   3. Tus amigos escanean el QR" -ForegroundColor White
    Write-Host "   4. Se descarga e instala el APK automáticamente" -ForegroundColor White
    Write-Host ""
    
    Write-Host "✨ ¡Listo para compartir!" -ForegroundColor Green
} else {
    Write-Host "❌ Error al generar QR" -ForegroundColor Red
    Write-Host ""
    Write-Host "Alternativa: Usa un generador online" -ForegroundColor Yellow
    Write-Host "https://qr-code-generator.com/" -ForegroundColor Cyan
}
