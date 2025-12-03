#!/usr/bin/env pwsh
# Auto-backup to GitHub - popFlix TFG
# Script que hace commit y push automático

param(
    [string]$message = "Auto-backup"
)

$projectPath = "C:\popFlix_TFG"
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

Set-Location $projectPath

# Verificar si hay cambios
$status = git status --porcelain

if ($status) {
    Write-Host "📦 Creando backup automático..." -ForegroundColor Green
    Write-Host "Timestamp: $timestamp" -ForegroundColor Cyan
    
    git add .
    
    $commitMsg = if ($message -eq "Auto-backup") { 
        "Auto-backup: $timestamp" 
    } else { 
        $message 
    }
    
    git commit -m $commitMsg
    
    Write-Host "🚀 Enviando a GitHub..." -ForegroundColor Cyan
    git push
    
    Write-Host "✅ Backup realizado exitosamente" -ForegroundColor Green
} else {
    Write-Host "✓ Sin cambios para guardar" -ForegroundColor Yellow
}
