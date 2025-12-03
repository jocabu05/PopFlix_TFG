# 🎬 popFlix - Guía de Inicio Rápido

## ⚡ Cómo iniciar el proyecto

### Opción 1: **MÁS FÁCIL** - Un click (Recomendado)
1. Abre la carpeta del proyecto en el Explorador
2. **Haz doble click en `START_POPFLIX.bat`**

Esto abre automáticamente:
- ✅ Backend (puerto 4000)
- ✅ Frontend (Expo en puerto 8081)
- ✅ Auto-commit watcher

---

### Opción 2: Desde VS Code (Terminal integrada)
1. Abre VS Code
2. Terminal → Nueva terminal
3. Ejecuta:
```bash
.\START_POPFLIX.bat
```

---

## 📚 Proyecto

### **Frontend (Expo)**
- 📁 Ubicación: `app/`
- 🌐 URL: `http://localhost:8081`
- 📱 Plataformas: Android, iOS, Web
- 🔧 Lenguaje: TypeScript/React Native

### **Backend (Node.js)**
- 📁 Ubicación: `backend/`
- 🌐 URL: `http://localhost:4000`
- 🗄️ BD: MySQL (popflix)
- 🔧 Lenguaje: JavaScript

### **Características**
- ✨ Login y Registro con bcrypt
- 🎬 Catálogo de películas
- 🎯 Búsqueda y filtros
- 📤 Compartir películas por QR
- 💾 Auto-backup a GitHub cada 30 segundos

---

## 🔑 Credenciales de Prueba

| Campo | Valor |
|-------|-------|
| Email | `jorgecasterabueno@gmail.com` |
| Contraseña | `Jorgecast05` |

---

## 💾 Control de Versiones

### Auto-commit está activo
Todos los cambios se guardan automáticamente cada 30 segundos en GitHub.

**Para ver el historial:**
```bash
git log --oneline
```

**Para hacer commit manual:**
```bash
.\quick-commit.ps1 -type feat -description "Tu descripción"
```

---

## 🐛 Solucionar problemas

### Puerto 4000 ocupado
```bash
netstat -ano | findstr :4000
```

### Limpiar y reinstalar
```bash
cd backend
npm install
```

### Ver logs del servidor
Los logs aparecen en la terminal del backend automáticamente.

---

## 📋 Estructura del Proyecto

```
popFlix_TFG/
├── app/                    # Frontend (React Native)
│   ├── login.tsx
│   ├── register.tsx
│   └── home.tsx
├── backend/                # Backend (Node.js)
│   ├── server.js
│   └── package.json
├── services/               # Servicios (auth)
├── components/             # Componentes reutilizables
├── START_POPFLIX.bat      # ⭐ INICIA TODO
└── README.md
```

---

## 🚀 Próximos Pasos

1. ✅ Verificar que login/registro funciona
2. ⬜ Implementar catálogo de películas
3. ⬜ Agregar búsqueda
4. ⬜ Generar QR para compartir
5. ⬜ Mejorar UI/UX

---

**¡Listo para programar! 🎉**
