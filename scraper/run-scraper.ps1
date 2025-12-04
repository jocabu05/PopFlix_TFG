# Script para ejecutar el sistema de scraping completo
# Uso: .\run-scraper.ps1

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗"
Write-Host "║         SISTEMA DE SCRAPING POPFLIX - TFG                 ║"
Write-Host "║      Plataformas de Streaming + TMDB Integration          ║"
Write-Host "╚════════════════════════════════════════════════════════════╝"
Write-Host ""

# Verificar Python
Write-Host "📦 Verificando Python..." -ForegroundColor Cyan
python --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Python no instalado. Descargar de python.org" -ForegroundColor Red
    exit 1
}

# Ir a directorio scraper
Set-Location -Path "$PSScriptRoot\scraper" -ErrorAction Stop
Write-Host "📂 En directorio: $(Get-Location)" -ForegroundColor Green
Write-Host ""

# Menú principal
while ($true) {
    Write-Host "═══════════════════════════════════════════════════════════"
    Write-Host "QUÉ QUIERES HACER:" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  1️⃣  Instalar dependencias (pip install)"
    Write-Host "  2️⃣  Ejecutar scraper"
    Write-Host "  3️⃣  Ejecutar task orchestrator"
    Write-Host "  4️⃣  Ejecutar test suite"
    Write-Host "  5️⃣  Ver documentación"
    Write-Host "  6️⃣  Salir"
    Write-Host ""
    Write-Host "═══════════════════════════════════════════════════════════"
    
    $choice = Read-Host "Selecciona opción (1-6)"
    Write-Host ""

    switch ($choice) {
        "1" {
            Write-Host "🔧 Instalando dependencias..." -ForegroundColor Yellow
            pip install -r requirements.txt
            Write-Host ""
            Write-Host "✅ Dependencias instaladas" -ForegroundColor Green
            Write-Host ""
        }
        
        "2" {
            Write-Host "🚀 Ejecutando scraper..." -ForegroundColor Yellow
            Write-Host ""
            python scraper.py
            Write-Host ""
            Write-Host "✅ Scraper completado" -ForegroundColor Green
            Write-Host ""
        }
        
        "3" {
            Write-Host "⏰ Ejecutando task orchestrator..." -ForegroundColor Yellow
            Write-Host "(Presiona Ctrl+C para detener)" -ForegroundColor Gray
            Write-Host ""
            python task_orchestrator.py
            Write-Host ""
            Write-Host "✅ Task orchestrator detenido" -ForegroundColor Green
            Write-Host ""
        }
        
        "4" {
            Write-Host "🧪 Ejecutando test suite..." -ForegroundColor Yellow
            Write-Host "   (Asegúrate de que el backend esté corriendo)" -ForegroundColor Gray
            Write-Host ""
            python test_system.py
            Write-Host ""
            Write-Host "✅ Test suite completado" -ForegroundColor Green
            Write-Host ""
        }
        
        "5" {
            Write-Host "📚 Mostrando documentación..." -ForegroundColor Yellow
            if (Test-Path "README.md") {
                Get-Content README.md | more
            } else {
                Write-Host "❌ README.md no encontrado" -ForegroundColor Red
            }
            Write-Host ""
        }
        
        "6" {
            Write-Host "👋 Adiós!" -ForegroundColor Cyan
            exit 0
        }
        
        default {
            Write-Host "❌ Opción no válida" -ForegroundColor Red
            Write-Host ""
        }
    }
}
