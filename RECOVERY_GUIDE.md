# 🔧 Guía de Recuperación de Errores - popFlix

## ⚠️ Si la app se rompe

### **Paso 1: Identifica el error**

Los errores aparecerán en una de estas ventanas:

| Ventana | Error |
|---------|-------|
| **Backend** | Errores del servidor (400, 500, DB, etc) |
| **Frontend** | Errores de React/Expo (pantalla roja) |
| **Auto-commit** | Errores al hacer commit a GitHub |

---

## 🐛 Tipos de errores comunes

### **1. Error: "Port 4000 already in use"**
```bash
# El puerto 4000 está ocupado
# Solución:
netstat -ano | findstr :4000
taskkill /PID <PID> /F

# O simplemente cierra todas las ventanas y vuelve a iniciar
```

### **2. Error: "Connection refused"**
```
El backend no está corriendo
→ Asegúrate que START_POPFLIX.bat esté ejecutándose
→ Revisa que no haya errores en la ventana del backend
```

### **3. Error: "Database connection failed"**
```
MySQL no está corriendo
→ Abre MySQL
→ Verifica que la BD "popflix" exista
```

### **4. Error: "Credenciales incorrectas"**
```
El login no funciona
→ Usa: jorgecasterabueno@gmail.com / Jorgecast05
→ Verifica que la BD tenga ese usuario
```

---

## 🔄 Recuperar versión anterior

### **Ver el historial de cambios**
```bash
git log --oneline -10
```

Verás algo como:
```
a1b2c3d feat: Nueva feature
e4f5g6h fix: Corrección de bug
...
```

### **Volver a una versión anterior**
```bash
# Opción 1: Deshacer último commit (mantener cambios)
git reset --soft HEAD~1

# Opción 2: Deshacer último commit (perder cambios)
git reset --hard HEAD~1

# Opción 3: Volver a un commit específico
git reset --hard <commit-hash>
```

### **Si ya hiciste push a GitHub**
```bash
# Revertir commit pero crear uno nuevo
git revert <commit-hash>
git push
```

---

## 📋 Checklist para evitar errores

- ✅ **Backend corriendo** - Revisa que no haya errores en la terminal
- ✅ **MySQL activo** - `mysql -u root -p1234`
- ✅ **Expo corriendo** - La app debe estar compilada
- ✅ **Auto-commit activo** - La ventana debe estar visible
- ✅ **Verificar cambios** - `git status` antes de hacer cambios críticos

---

## 🚨 En caso de emergencia

### **Restaurar todo a estado inicial**
```bash
# CUIDADO: Esto pierde todos los cambios locales
git reset --hard origin/main
```

### **Limpiar todo y empezar de nuevo**
```bash
# Eliminar node_modules
rm -r node_modules

# Reinstalar
npm install

# Backend
cd backend
npm install
```

---

## 📞 Verificar que todo funciona

### **Health Check del Backend**
```bash
curl http://localhost:4000/api/health
```

Debería devolver:
```json
{
  "status": "OK",
  "message": "Backend está funcionando"
}
```

---

## 💾 Reglas de Oro

1. **Siempre mantén el auto-commit corriendo**
2. **Nunca hagas cambios críticos sin estar seguro**
3. **Si algo se rompe, revierta con git**
4. **Los commits automáticos son tu red de seguridad**
5. **Ante duda, mira los logs de error**

---

**Recuerda: GitHub tiene todo guardado. Si rompes algo, siempre puedes recuperar una versión anterior.**
