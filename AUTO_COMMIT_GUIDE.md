# AUTO-COMMIT GUIDE - popFlix TFG

## Scripts de Auto-commit

### 1. **Quick Commit** (Recomendado para cambios rápidos)
```powershell
.\quick-commit.ps1 -type feat -description "Descripción del cambio"
```

**Tipos disponibles:**
- `feat` - Nueva característica
- `fix` - Corrección de bug
- `refactor` - Reorganización de código
- `docs` - Actualización de documentación
- `style` - Cambios de estilo/formato
- `perf` - Mejoras de rendimiento
- `test` - Agregar/actualizar tests

**Ejemplos:**
```powershell
.\quick-commit.ps1 -type feat -description "Agregar búsqueda de películas"
.\quick-commit.ps1 -type fix -description "Corregir bug de login"
.\quick-commit.ps1 -type docs -description "Actualizar README"
```

---

### 2. **Auto-commit Watcher** (Monitor continuo)
Monitorea cambios automáticamente y hace commits cada X segundos:

```powershell
# Chequear cada 60 segundos (default)
.\auto-commit-watcher.ps1

# Chequear cada 30 segundos
.\auto-commit-watcher.ps1 -IntervalSeconds 30

# Chequear cada 5 minutos
.\auto-commit-watcher.ps1 -IntervalSeconds 300
```

Se registran todos los commits en `auto-commit.log`

---

### 3. **Auto-backup** (Backup manual rápido)
```powershell
# Backup automático sin mensaje específico
.\auto-backup.ps1

# Backup con mensaje personalizado
.\auto-backup.ps1 -message "feat: Agregar nueva pantalla"
```

---

## ⚙️ Configuración en VS Code (Opcional)

Para hacer commits automáticos al guardar:

1. Instala la extensión **Git Commit Workflow**
2. Ve a Settings → Busca "git commit"
3. Habilita auto-commit on save

O usa el terminal integrado de VS Code:
- Presiona `Ctrl + Ñ` para abrir terminal
- Ejecuta `.\quick-commit.ps1 -type feat -description "Tu descripción"`

---

## 📊 Flujo de trabajo recomendado

1. **Haces cambios en el código**
2. **Ejecutas**: `.\quick-commit.ps1 -type feat -description "Lo que hiciste"`
3. **Automáticamente**:
   - Se agregan los archivos (`git add .`)
   - Se crea un commit con descripción clara
   - Se sube a GitHub (`git push`)

---

## 🔍 Ver historial de commits

```powershell
# Ver últimos commits
git log --oneline -10

# Ver cambios de un commit específico
git show <commit-hash>

# Ver todos los commits con detalles
git log --all --decorate --oneline --graph
```

---

## ⚠️ Recuperar cambios si algo sale mal

```powershell
# Ver cambios sin stagear
git diff

# Deshacer cambios en un archivo
git checkout -- <archivo>

# Deshacer último commit (mantener cambios)
git reset --soft HEAD~1

# Deshacer último commit (perder cambios)
git reset --hard HEAD~1
```

---

**¡Tu proyecto está protegido! Todos los cambios se guardan automáticamente en GitHub.**
