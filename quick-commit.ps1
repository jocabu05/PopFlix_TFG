#!/usr/bin/env pwsh
# Quick commit script - Haz commits rápidos con descripción automática

param(
    [string]$type = "feat",  # feat, fix, refactor, docs, style
    [string]$description = "Changes"
)

$projectPath = "C:\popFlix_TFG"
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

Set-Location $projectPath

# Tipos de commit disponibles
$commitTypes = @{
    "feat"     = "✨ Característica"
    "fix"      = "🐛 Corrección"
    "refactor" = "♻️ Refactor"
    "docs"     = "📚 Documentación"
    "style"    = "🎨 Estilo"
    "perf"     = "⚡ Rendimiento"
    "test"     = "✅ Tests"
}

# Validar tipo
if (-not $commitTypes.ContainsKey($type)) {
    Write-Host "❌ Tipo no válido. Opciones: $($commitTypes.Keys -join ', ')" -ForegroundColor Red
    exit
}

$status = git status --porcelain

if (-not $status) {
    Write-Host "✓ Sin cambios para guardar" -ForegroundColor Yellow
    exit
}

Write-Host "📝 Cambios detectados:" -ForegroundColor Cyan
$status | ForEach-Object { Write-Host "  $_" }

git add .

$emoji = $commitTypes[$type] -replace '(.+) .+', '$1'
$message = "[$type] $description ($timestamp)"

Write-Host "`n🚀 Haciendo commit..." -ForegroundColor Green
git commit -m $message

Write-Host "⬆️  Enviando a GitHub..." -ForegroundColor Cyan
git push

Write-Host "`n✅ Commit completado: $message" -ForegroundColor Green
