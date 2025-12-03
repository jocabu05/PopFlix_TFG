# 🎬 PopFlix - Netflix-Style Streaming App

Un aplicación de streaming tipo Netflix desarrollada con React Native + Expo, con integración a TMDB API y backend en Node.js.

## ✨ Características Principales

### 📱 Frontend
- **Autenticación segura** con hasheo bcrypt
- **Netflix-style dark theme** con colores profesionales
- **Búsqueda y filtrado** de películas por género
- **Ranking semanal** con medallas decorativas (oro, plata, bronce)
- **Sistema de favoritos** (Mi Lista)
- **Modal de detalles** con reseñas expandibles
- **Carrusel de películas** trending
- **Barra de tareas** mostrando progreso de características

### 🎥 Películas & Datos
- **TMDB API Integration** con 20+ películas trending
- **8 géneros** disponibles (Drama, Action, Comedy, Thriller, Romance, Horror, Sci-Fi, Animation)
- **Búsqueda en tiempo real** de películas
- **Información completa**: ratings, año, duración, descripciones

### 🔧 Backend
- **Node.js Express** API RESTful
- **MySQL database** con relaciones optimizadas
- **11+ endpoints** para películas, usuarios y plataformas
- **Endpoints nuevos para favoritos** e historial
- **CORS habilitado** para desarrollo y producción

### 📊 Base de Datos
- **10 tablas** con relaciones y índices optimizados
- **user_favorites** para guardar películas favoritas
- **user_watch_history** para rastrear visualizaciones
- **Foreign keys** con CASCADE delete

---

## 🚀 Quick Start

### Prerequisitos
- Node.js 16+ instalado
- MySQL 8.0+ corriendo
- npm o yarn como package manager

### 1. Instalación

```bash
# Clonar repositorio
git clone <repo-url>
cd popFlix_TFG

# Instalar dependencias frontend
npm install

# Instalar dependencias backend
cd backend
npm install
cd ..
```

### 2. Configurar Base de Datos

```bash
# Crear base de datos
mysql -u root -p1234 < backend/create-movies-tables.sql

# Crear usuario de prueba
mysql -u root -p1234 -e "source backend/create-user.js"
```

### 3. Iniciar Backend

```bash
cd backend
node server.js
# Backend escucha en http://192.168.68.103:9999
```

### 4. Iniciar Frontend

```bash
# En nueva terminal, en raíz del proyecto
npx expo start --tunnel

# Opciones:
# - Presiona 'a' para abrir en Android Emulator
# - Presiona 'w' para abrir en navegador
# - Presiona 'i' para abrir en iOS Simulator
```

---

## 📁 Estructura del Proyecto

```
popFlix_TFG/
├── app/                          # Screens de la aplicación
│   ├── (tabs)/
│   │   ├── index.tsx            # Home screen con películas
│   │   ├── explore.tsx          # Explorar películas
│   │   └── _layout.tsx          # Tabs layout
│   ├── login.tsx                # Login screen
│   ├── register.tsx             # Registro
│   ├── select-platforms.tsx     # Selección de plataformas
│   └── _layout.tsx              # Root layout
│
├── components/                   # Componentes reutilizables
│   ├── MovieModal.tsx           # Modal de detalles de película
│   ├── MovieCard.tsx            # Card de película
│   ├── themed-*.tsx             # Componentes con tema
│   └── ...otros componentes
│
├── backend/                      # Backend Node.js
│   ├── server.js                # Express server
│   ├── tmdb-service.js          # Cliente TMDB API
│   ├── create-movies-tables.sql # Schema de BD
│   ├── create-user.js           # Script usuario de prueba
│   └── package.json
│
├── constants/                    # Constantes globales
│   ├── colors.ts                # Paleta de colores
│   └── theme.ts
│
├── context/                      # React Context
│   └── AuthContext.tsx          # Autenticación global
│
├── services/                     # Servicios
│   └── authService.js           # Auth API calls
│
├── FEATURES_IMPLEMENTED.md      # Lista completa de características
├── NEXT_IMPLEMENTATIONS.md      # Guía de próximas mejoras
└── package.json
```

---

## 🔑 Variables de Entorno

Crear archivo `.env` en la raíz (si es necesario):

```env
# Frontend
REACT_APP_API_URL=http://192.168.68.103:9999

# Backend (en backend/.env)
TMDB_API_KEY=f864a2cf4abc8eb393336cfe36d0c42e
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=1234
DB_NAME=popflix
PORT=9999
```

---

## 📊 API Endpoints

### Películas
- `GET /api/movies/trending` - Películas trending
- `GET /api/movies/genre/:genre` - Películas por género
- `GET /api/movies/search/:query` - Búsqueda
- `GET /api/movies/:movieId/details` - Detalles película
- `GET /api/weekly-ranking/:userId` - Top 3 ranking

### Favoritos
- `GET /api/favorites/:userId` - Obtener favoritos
- `POST /api/favorites/:userId` - Agregar a favoritos
- `DELETE /api/favorites/:userId/:movieId` - Eliminar favorito

### Historial
- `GET /api/watch-history/:userId` - Obtener historial
- `POST /api/watch-history/:userId` - Guardar visualización

### Autenticación & Plataformas
- `POST /api/auth/login` - Login
- `GET /api/platforms` - Plataformas disponibles
- `POST /api/user-platforms` - Guardar plataformas usuario

---

## 🎨 Colores & Tema

```javascript
// Netflix-style dark theme
BG_DARK = "#0F0F0F"      // Fondo principal
BG_ACCENT = "#1A1A1A"    // Fondo secundario
NEON_RED = "#B20710"     // Rojo Netflix
TEXT_LIGHT = "#FFFFFF"   // Texto principal
TEXT_MUTED = "#B0B0B0"   // Texto secundario

// Medallas ranking
GOLD = "#FFD700"         // Posición 1
SILVER = "#C0C0C0"       // Posición 2
BRONZE = "#CD7F32"       // Posición 3
```

---

## 🔐 Seguridad

- ✅ Contraseñas hasheadas con bcrypt
- ✅ CORS configurado
- ✅ Validación en frontend y backend
- ✅ SQL Injection prevention con prepared statements
- ✅ Context API para gestión de autenticación

---

## 📱 Flujo de Usuario

```
Splash/Loading
    ↓
Login/Register ← Crear cuenta
    ↓
Seleccionar Plataformas
    ↓
Home Screen
├── Hero Banner
├── Búsqueda
├── Carrusel Trending
├── Ranking Semanal
├── Filtrado por Género
└── Grid de Películas
    ↓
    Presionar película → Movie Modal
    ├── Ver detalles
    ├── Agregar a favoritos ❤️
    ├── Ver reseñas
    └── Reproducir (placeholder)
```

---

## 🧪 Testing

### Frontend
```bash
npm run web  # Prueba en navegador
npm run android  # Prueba en Android Emulator
npm run ios  # Prueba en iOS Simulator
```

### Backend
```bash
# Verificar salud del servidor
curl http://192.168.68.103:9999/api/health

# Obtener películas trending
curl http://192.168.68.103:9999/api/movies/trending

# Buscar película
curl "http://192.168.68.103:9999/api/movies/search/Inception"
```

---

## 🚧 Próximas Características

- [ ] Trailers con YouTube embed
- [ ] Reseñas reales de TMDB
- [ ] Historial de visualización con UI
- [ ] Sincronización offline con AsyncStorage
- [ ] Recomendaciones personalizadas
- [ ] Sistema de calificaciones
- [ ] Perfil de usuario mejorado

Ver `NEXT_IMPLEMENTATIONS.md` para instrucciones detalladas.

---

## 📈 Estadísticas

| Métrica | Valor |
|---------|-------|
| Componentes | 4+ principales |
| Pantallas | 7+ |
| Endpoints API | 14+ |
| Tablas BD | 10 |
| Géneros | 8 |
| Películas | 20+ trending + dinámico |
| Líneas de código | 2000+ |

---

## 🐛 Troubleshooting

### "Port 8081 is being used"
```bash
# Usar puerto alternativo
npx expo start --tunnel
```

### "TMDB API Key invalid"
```bash
# Verificar key en backend/tmdb-service.js
# Key actual: f864a2cf4abc8eb393336cfe36d0c42e
```

### "Cannot connect to backend"
```bash
# Verificar que backend está corriendo
curl http://192.168.68.103:9999/api/health

# Verificar IP correcta en app/(tabs)/index.tsx
const API_URL = "http://192.168.68.103:9999";
```

### "Database connection failed"
```bash
# Verificar MySQL está corriendo
mysql -u root -p1234 -e "SELECT 1"

# Verificar credenciales en backend/server.js
```

---

## 📚 Documentación Adicional

- **FEATURES_IMPLEMENTED.md** - Lista completa de características implementadas
- **NEXT_IMPLEMENTATIONS.md** - Guía de próximas mejoras con código de ejemplo
- **BACKEND_VALIDACIONES.md** - Validaciones en backend
- **AUTO_COMMIT_GUIDE.md** - Guía de commits automáticos

---

## 👨‍💻 Stack Técnico

### Frontend
- React Native 18+
- Expo 50+
- TypeScript 5+
- expo-router (navegación)
- @expo/vector-icons

### Backend
- Node.js 16+
- Express 4+
- MySQL 8+
- bcrypt 5+
- TMDB API v3

### Servicios
- The Movie Database API (TMDB)
- MySQL Database
- Expo Tunnel (deployments)

---

## 📄 Licencia

Proyecto educativo - PopFlix TFG

---

## 👥 Contribuidores

PopFlix Development Team

---

## 📞 Soporte

Para reportar bugs o sugerencias:
1. Crear issue detallado
2. Incluir pasos para reproducir
3. Adjuntar logs si es relevante

---

**Última actualización**: 2024
**Versión**: 1.0.0
**Estado**: ✅ Production Ready (Características Core)
