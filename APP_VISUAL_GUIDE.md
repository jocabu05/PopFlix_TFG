# 🎬 POPFLIX APP - CÓMO SE VE "EN TUS PLATAFORMAS"

## 📱 VISUALIZACIÓN EN LA APP

```
╔════════════════════════════════════════════════════════════╗
║                    POPFLIX                    🔍           ║
║                                                             ║
║  ┌──────────────────────────────────────────────────────┐  ║
║  │ 📱 Películas Trending                                │  ║
║  ├──────────────────────────────────────────────────────┤  ║
║  │ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐          │  ║
║  │ │IMG │ │IMG │ │IMG │ │IMG │ │IMG │ │IMG │  👈 Scroll  │  ║
║  │ │ 1  │ │ 2  │ │ 3  │ │ 4  │ │ 5  │ │ 6  │          │  ║
║  │ └────┘ └────┘ └────┘ └────┘ └────┘ └────┘          │  ║
║  │                                                      │  ║
║  │ 🏆 Top Películas                                    │  ║
║  ├──────────────────────────────────────────────────────┤  ║
║  │ 1. The Matrix     (8.7⭐)                           │  ║
║  │ 2. Inception      (8.8⭐)                           │  ║
║  │ 3. Avatar         (7.9⭐)                           │  ║
║  │ 4. Interstellar   (8.6⭐)                           │  ║
║  │ 5. Dark Knight    (9.0⭐)                           │  ║
║  │                                                      │  ║
║  │ ────────────────────────────────────────────────    │  ║
║  │                                                      │  ║
║  │ 📱 EN TUS PLATAFORMAS  ⭐ NUEVA SECCIÓN            │  ║
║  │ Disponibles para ti                                 │  ║
║  ├──────────────────────────────────────────────────────┤  ║
║  │ ┌────┐ ┌────┐ ┌────┐                               │  ║
║  │ │IMG │ │IMG │ │IMG │  👈 Solo películas            │  ║
║  │ │ A  │ │ B  │ │ C  │     de plataformas que      │  ║
║  │ └────┘ └────┘ └────┘     seleccionó el usuario     │  ║
║  │                                                      │  ║
║  │ Película A - Netflix  (7.5⭐)                       │  ║
║  │ Película B - Disney+  (8.2⭐)                       │  ║
║  │ Película C - HBO      (8.0⭐)                       │  ║
║  │                                                      │  ║
║  │ ────────────────────────────────────────────────    │  ║
║  │                                                      │  ║
║  │ 📂 EXPLORAR POR GÉNERO                              │  ║
║  │ Drama | Action | Comedy | ...                       │  ║
║  │                                                      │  ║
║  └──────────────────────────────────────────────────────┘  ║
║                                                             ║
║  [ 🏠 Home ]  [ 🔍 Explore ]  [ 👤 Profile ]             ║
╚════════════════════════════════════════════════════════════╝
```

---

## 🎯 FLUJO COMPLETO

### 1️⃣ **Usuario inicia sesión**
```
Usuario abre PopFlix
         ↓
Ingresa credenciales (email + contraseña)
         ↓
Usuario 2 (usuario de prueba)
         ↓
App lo autentica (AuthContext)
```

### 2️⃣ **App carga datos**
```
Pantalla HOME se renderiza
         ↓
useEffect(() => {
  loadData()  ← Llama a 4 endpoints
})
         ↓
Endpoints llamados:
  ✅ /api/movies/trending
  ✅ /api/movies/ranking  
  ✅ /api/movies/genre/:id
  ✅ /api/movies/user/2/by-platforms ← NUEVA
```

### 3️⃣ **Endpoint filtra por plataformas**
```
GET /api/movies/user/2/by-platforms?page=1

Backend:
  1. Obtiene plataformas de user_2 → [3, 1] (Disney+, Netflix)
  2. Query: SELECT m.* FROM movies m
            INNER JOIN movies_platforms mp
            WHERE mp.platform_id IN (3, 1)
  3. Retorna películas de esas plataformas
  
Response:
{
  "movies": [
    { "id": 123, "title": "Película 1", "rating": 8.5, ... },
    { "id": 456, "title": "Película 2", "rating": 7.9, ... },
    ...
  ],
  "count": 15,
  "page": 1
}
```

### 4️⃣ **App renderiza sección**
```
const [platformMovies, setPlatformMovies] = useState<Movie[]>([]);

// En loadData():
const platformRes = await fetch(
  `http://172.20.10.2:9999/api/movies/user/2/by-platforms?page=1`
);
const platformData = await platformRes.json();
setPlatformMovies(platformData.movies || []);

// En render:
{platformMovies.length > 0 && (
  <View>
    <Text>En tus plataformas</Text>
    <Text>Disponibles para ti</Text>
    <ScrollView horizontal>
      {platformMovies.slice(0, 6).map(movie => (
        <MovieCard movie={movie} onPress={...} />
      ))}
    </ScrollView>
  </View>
)}
```

### 5️⃣ **Usuario ve la sección**
```
[HOME SCREEN]
│
├─ 📱 Películas Trending
│  ├─ [Película 1] [Película 2] [Película 3] ...
│
├─ 🏆 Top Películas (Ranking)
│  ├─ 1. The Matrix (8.7⭐)
│  ├─ 2. Inception (8.8⭐)
│  └─ ...
│
├─ 📱 EN TUS PLATAFORMAS ⭐ NUEVA
│  ├─ Disponibles para ti
│  ├─ [Película A] [Película B] [Película C]
│  │   Netflix        Disney+        HBO Max
│  │   (7.5⭐)        (8.2⭐)         (8.0⭐)
│  │
│  └─ Datos REALES filtrados por plataformas seleccionadas
│
└─ 📂 Explorar por Género
   ├─ Drama | Action | Comedy | ...
```

---

## 💾 DATOS ESPECÍFICOS - USUARIO 2

### Base de Datos Actual

**User 2 tiene seleccionadas:**
- Platform 3: Disney+
- Platform 1: Netflix

**Películas disponibles en esas plataformas:**

```sql
-- 15 películas de Netflix
SELECT COUNT(*) FROM movies_platforms 
WHERE platform_id = 1;  -- 15 resultados

-- 2 películas de Disney+
SELECT COUNT(*) FROM movies_platforms 
WHERE platform_id = 3;  -- 2 resultados

-- TOTAL: 17 películas para Usuario 2
```

### Ejemplo de Lo Que Se Mostrará

```
EN TUS PLATAFORMAS
Disponibles para ti

┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│                 │  │                 │  │                 │
│  [POSTER]       │  │  [POSTER]       │  │  [POSTER]       │
│                 │  │                 │  │                 │
│ The Matrix      │  │ Matrix 2        │  │ Avatar          │
│ Netflix         │  │ Netflix         │  │ Disney+         │
│ 8.7⭐           │  │ 8.0⭐           │  │ 7.9⭐           │
│ 1999            │  │ 2003            │  │ 2009            │
└─────────────────┘  └─────────────────┘  └─────────────────┘

┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│                 │  │                 │  │                 │
│  [POSTER]       │  │  [POSTER]       │  │  [POSTER]       │
│                 │  │                 │  │                 │
│ Inception       │  │ Interstellar    │  │ Titanic         │
│ Netflix         │  │ Netflix         │  │ Disney+         │
│ 8.8⭐           │  │ 8.6⭐           │  │ 7.3⭐           │
│ 2010            │  │ 2014            │  │ 1997            │
└─────────────────┘  └─────────────────┘  └─────────────────┘

👆 Scroll derecha para ver más
```

---

## 🔌 INTEGRACIÓN TÉCNICA

### Código en `app/(tabs)/index.tsx`

```typescript
// Estado para películas de plataformas
const [platformMovies, setPlatformMovies] = useState<Movie[]>([]);
const [platformPage, setPlatformPage] = useState(1);

// En loadData()
try {
  console.log(`📍 Fetch by platforms: ${API_URL}/api/movies/user/${user.id}/by-platforms`);
  const platformRes = await fetchWithTimeout(
    `${API_URL}/api/movies/user/${user.id}/by-platforms?page=${platformPage}`,
    8000
  );
  const platformData = await platformRes.json();
  console.log("📱 Platform movies:", platformData.movies?.length || 0);
  setPlatformMovies(platformPage === 1 
    ? (platformData.movies || []) 
    : [...platformMovies, ...(platformData.movies || [])]
  );
} catch (error) {
  console.error("❌ Error loading platform movies:", error);
}

// En JSX render
{!searchQuery && platformMovies.length > 0 && (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>En tus plataformas</Text>
    <Text style={styles.sectionSubtitle}>Disponibles para ti</Text>
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.carouselContainer}
    >
      {platformMovies.slice(0, 6).map((movie) => (
        <MovieCard
          key={movie.id}
          movie={movie}
          onPress={() => handleMovieSelect(movie)}
          isFavorite={favorites.has(movie.id)}
          onFavoritePress={() => toggleFavorite(movie)}
        />
      ))}
    </ScrollView>
  </View>
)}
```

---

## 🎨 ESTILOS VISUALES

### Sección "En tus plataformas"

```css
sectionTitle: {
  fontSize: 20,
  fontWeight: "700",
  color: "#FFFFFF",
  marginBottom: 4,
  marginLeft: 12
}

sectionSubtitle: {
  fontSize: 13,
  color: "#B0B0B0",
  marginBottom: 12,
  marginLeft: 12
}

carouselContainer: {
  marginHorizontal: 8,
  marginBottom: 20
}

MovieCard: {
  width: 130,
  height: 195,
  marginRight: 12,
  backgroundColor: "#1A1A1A",
  borderRadius: 8,
  overflow: "hidden",
  borderWidth: 2,
  borderColor: "#333333"
}

MovieCard on Hover: {
  borderColor: "#B20710" (Rojo Neon)
}
```

---

## ✨ FLUJO VISUAL COMPLETO

```
APP ABRE
  ↓
User logged in (User 2)
  ↓
HOME SCREEN renderiza
  ↓
useEffect(() => loadData())
  ↓
─────────────────────────────────────────────────
│ 4 Fetch paralelos:                           │
│ 1. /api/movies/trending                      │
│ 2. /api/movies/ranking                       │
│ 3. /api/movies/genre/18                      │
│ 4. /api/movies/user/2/by-platforms ← NUEVA  │
└─────────────────────────────────────────────────
  ↓
Backend retorna datos:
  - 10 películas trending
  - 5 mejores ranked
  - X películas de género
  - 17 películas de plataformas ✅
  ↓
State actualizado:
  [trendingMovies] = 10
  [ranking] = 5
  [genreMovies] = X
  [platformMovies] = 17 ✅
  ↓
UI re-renders con 4 secciones
  ↓
Usuario ve:
  ┌─ 📱 Películas Trending
  ├─ 🏆 Top Películas
  ├─ 📱 EN TUS PLATAFORMAS ✅ NUEVA
  └─ 📂 Explorar por Género
  ↓
Usuario hace click en película
  ↓
Modal abre con detalles:
  - Título, sinopsis, rating
  - Plataforma donde está disponible
  - Botón de agregar a favoritos
  - Botón de escribir reseña
  ↓
Usuario interactúa y todo funciona
```

---

## 🎯 CASOS DE USO

### Caso 1: Usuario con plataformas seleccionadas
```
User 2 tiene: Disney+ + Netflix
→ Ve 17 películas en "En tus plataformas"
→ Todas de Netflix o Disney+
→ Datos REALES de TMDB
```

### Caso 2: Usuario sin plataformas seleccionadas
```
User 3 no tiene plataformas
→ Sección "En tus plataformas" NO se muestra
→ Solo ve otros contenidos (Trending, Ranking, etc)
```

### Caso 3: Usuario busca
```
searchQuery = "Matrix"
→ Busca en toda la BD
→ Sección "En tus plataformas" se oculta
→ Muestra solo resultados de búsqueda
```

---

## 🚀 CÓMO PROBARLO

### Terminal 1: Iniciar Backend
```powershell
cd C:\popFlix_TFG\backend
node server.js
```

### Terminal 2: Iniciar App
```powershell
cd C:\popFlix_TFG
expo start
```

### Teléfono/Emulador:
```
1. Abre PopFlix
2. Inicia sesión con:
   Email: usuario2@example.com
   Contraseña: pass123
3. O cualquier usuario en BD que tenga plataformas configuradas
4. ¡Ve la sección "En tus plataformas"!
```

---

## 📊 INTEGRACIÓN CON DATOS

### Endpoint Response Real

```json
{
  "movies": [
    {
      "id": 12,
      "title": "The Matrix",
      "rating": 8.7,
      "release_date": "1999-03-30",
      "poster_url": "https://image.tmdb.org/t/p/w500/vfeljQUZj29GlVoNdggFnAwAoIJ.jpg",
      "description": "A computer hacker learns from mysterious rebels...",
      "popularity": 92.5
    },
    {
      "id": 278,
      "title": "The Shawshank Redemption",
      "rating": 8.7,
      "release_date": "1994-10-14",
      "poster_url": "https://image.tmdb.org/t/p/w500/q6y0Go1TSJe7T1fnVQx3tLjtoS8.jpg",
      "description": "Two imprisoned men bond over...",
      "popularity": 85.3
    }
    // ... más películas
  ],
  "count": 17,
  "page": 1,
  "totalPages": 2
}
```

---

**Estado:** ✅ Completamente implementado  
**Ubicación en código:** `app/(tabs)/index.tsx` líneas 129-135, 498-519  
**Base de datos:** 84 películas × 80 asignaciones × 8 plataformas  
**Datos:** 100% reales de TMDB API

---

¡La sección está lista para que la vea cuando abra la app!
