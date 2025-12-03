#!/usr/bin/env pwsh
# Auto-commit watcher - Monitorea cambios y hace commits automáticos
# Ejecutar: .\auto-commit-watcher.ps1

param(
    [int]$IntervalSeconds = 60  # Intervalo de chequeo en segundos
)

$projectPath = "C:\popFlix_TFG"
$logFile = "$projectPath\auto-commit.log"
$lastCommitHash = ""

function Log-Message {
    param([string]$message)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMsg = "[$timestamp] $message"
    Write-Host $logMsg
    Add-Content -Path $logFile -Value $logMsg
}

function Get-ChangedFiles {
    $changes = git status --porcelain
    return @($changes | Where-Object { $_ })
}

function Generate-CommitMessage {
    param([string[]]$files)
    
    $summary = @()
    
    # Analizar tipos de cambios
    if ($files -match '\.tsx?$') { $summary += "Frontend" }
    if ($files -match 'backend.*\.js$') { $summary += "Backend" }
    if ($files -match 'package\.json') { $summary += "Dependencies" }
    if ($files -match '\.md$') { $summary += "Docs" }
    
    $timestamp = Get-Date -Format "HH:mm:ss"
    $message = "Auto-commit ($timestamp): $($summary -join ', ')"
    return $message
}

Log-Message "🔍 Iniciando monitor de auto-commits..."
Log-Message "Intervalo de chequeo: $IntervalSeconds segundos"

while ($true) {
    try {
        Set-Location $projectPath
        
        $files = Get-ChangedFiles
        
        if ($files.Count -gt 0) {
            Log-Message "📝 Detectados $($files.Count) cambio(s)"
            
            # Mostrar archivos modificados
            $files | ForEach-Object {
                Log-Message "  → $_"
            }
            
            # Hacer commit
            git add .
            $commitMsg = Generate-CommitMessage $files
            git commit -m $commitMsg
            
            # Push
            git push 2>&1 | ForEach-Object { Log-Message "  $($_)" }
            
            Log-Message "✅ Commit enviado a GitHub"
        }
        
    } catch {
        Log-Message "❌ Error: $($_.Exception.Message)"
    }
    
    Start-Sleep -Seconds $IntervalSeconds
}
