#!/usr/bin/env pwsh
# Auto-commit watcher - Monitorea cambios y hace commits automáticos

param(
    [int]$IntervalSeconds = 60
)

$projectPath = "C:\popFlix_TFG"
$logFile = "$projectPath\auto-commit.log"

Write-Host "🔍 Iniciando monitor de auto-commits..." -ForegroundColor Green
Write-Host "Intervalo de chequeo: $IntervalSeconds segundos" -ForegroundColor Cyan
Add-Content -Path $logFile -Value "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] Iniciando monitor"

while ($true) {
    try {
        Set-Location $projectPath
        
        $changes = git status --porcelain
        
        if ($changes) {
            $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
            $changeCount = ($changes | Measure-Object -Line).Lines
            
            Write-Host "`n📝 [$timestamp] Detectados $changeCount cambio(s)" -ForegroundColor Yellow
            
            git add .
            $commitTime = Get-Date -Format "HH:mm:ss"
            git commit -m "Auto-commit: $commitTime"
            
            Write-Host "🚀 Enviando a GitHub..." -ForegroundColor Cyan
            git push 2>&1 | Out-Null
            
            Write-Host "✅ Commit enviado" -ForegroundColor Green
            Add-Content -Path $logFile -Value "[$timestamp] Commit enviado ($changeCount cambios)"
        }
        
    }
    catch {
        Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
        Add-Content -Path $logFile -Value "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] Error: $($_.Exception.Message)"
    }
    
    Start-Sleep -Seconds $IntervalSeconds
}
