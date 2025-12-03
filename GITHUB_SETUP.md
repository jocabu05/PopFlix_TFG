# GitHub Setup Guide - popFlix TFG

## 1. Crear repositorio en GitHub

1. Ve a [github.com](https://github.com) y accede con tu cuenta
2. Haz clic en el icono **+** en la esquina superior derecha
3. Selecciona **New repository**
4. Nombre: `popFlix_TFG`
5. Descripción: `App de películas con autenticación y compartir películas mediante QR`
6. Selecciona **Private** (privado)
7. NO inicialices con README (ya lo tenemos)
8. Haz clic en **Create repository**

## 2. Conectar repositorio local con GitHub

```powershell
cd C:\popFlix_TFG

# Agregar remote
git remote add origin https://github.com/TU_USUARIO/popFlix_TFG.git

# Renombrar rama a main si es necesario
git branch -M main

# Hacer push inicial
git push -u origin main
```

> **Nota:** Reemplaza `TU_USUARIO` con tu nombre de usuario de GitHub

## 3. Hacer backup automático

Ejecuta el script de backup cada vez que hayas hecho cambios importantes:

```powershell
.\auto-backup.ps1
```

O usa Git manualmente:

```powershell
git add .
git commit -m "Descripción de los cambios"
git push
```

## 4. Crear ramas para features

Para trabajar en nuevas features sin afectar la rama principal:

```powershell
# Crear nueva rama
git checkout -b feature/nombre-feature

# Hacer cambios y commits
git add .
git commit -m "Descripción"

# Volver a main y hacer merge
git checkout main
git merge feature/nombre-feature

# Eliminar rama
git branch -d feature/nombre-feature
```

## 5. Ver historial de cambios

```powershell
# Ver commits
git log --oneline

# Ver cambios sin stagear
git diff

# Ver cambios en staging
git diff --cached
```

## Comandos útiles

| Comando | Descripción |
|---------|-------------|
| `git status` | Ver estado de cambios |
| `git add .` | Agregar todos los cambios |
| `git commit -m "msg"` | Crear commit |
| `git push` | Enviar a GitHub |
| `git pull` | Descargar cambios de GitHub |
| `git log` | Ver historial |
| `git diff` | Ver cambios |

---

**¡Tu proyecto está protegido! Ahora cada cambio importante se guarda en GitHub.**
