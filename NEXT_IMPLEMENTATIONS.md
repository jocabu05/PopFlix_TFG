# 📋 Guía de Próximas Implementaciones - PopFlix

## 🎯 Prioridad 1: Sistema de Favoritos Completo

### 1.1 Activar Sincronización con Backend
**Archivo**: `app/(tabs)/index.tsx`

En la función `handleAddToFavorites`, descomenta las llamadas al backend:

```typescript
const handleAddToFavorites = (movieId: number) => {
  const newFavorites = new Set(favorites);
  const isFavorite = newFavorites.has(movieId);
  
  if (isFavorite) {
    newFavorites.delete(movieId);
    fetch(`${API_URL}/api/favorites/${user?.id}/${movieId}`, {
      method: 'DELETE',
    }).catch(err => console.error("Error:", err));
  } else {
    newFavorites.add(movieId);
    fetch(`${API_URL}/api/favorites/${user?.id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ movieId })
    }).catch(err => console.error("Error:", err));
  }
  setFavorites(newFavorites);
};
```

### 1.2 Cargar Favoritos al Iniciar
**Archivo**: `app/(tabs)/index.tsx`

En el `useEffect` de `loadData()`, agregar:

```typescript
const loadFavorites = async () => {
  if (user?.id) {
    try {
      const res = await fetch(`${API_URL}/api/favorites/${user.id}`);
      const data = await res.json();
      setFavorites(new Set(data.favorites || []));
    } catch (error) {
      console.error("Error loading favorites:", error);
    }
  }
};

// Llamar al final de loadData()
loadFavorites();
```

### 1.3 Crear Pantalla de "Mi Lista"
**Nuevo archivo**: `app/(tabs)/favorites.tsx`

```typescript
import { View, Text, ScrollView, FlatList, StyleSheet } from "react-native";
import MovieCard from "@/components/MovieCard";

export default function FavoritesScreen() {
  // TODO: Implementar pantalla de favoritos
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Mi Lista</Text>
      {/* FlatList de favoritos */}
    </ScrollView>
  );
}
```

---

## 🎯 Prioridad 2: Historial de Visualización

### 2.1 Guardar en Historial al Ver Detalles
**Archivo**: `app/(tabs)/index.tsx`

Modificar `handleMoviePress`:

```typescript
const handleMoviePress = async (movie: Movie) => {
  setSelectedMovie({
    ...movie,
    duration: "2h 30m",
    year: 2023,
  });
  setModalVisible(true);
  
  // Guardar en historial
  if (user?.id) {
    try {
      await fetch(`${API_URL}/api/watch-history/${user.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ movieId: movie.id })
      });
    } catch (error) {
      console.error("Error saving to history:", error);
    }
  }
};
```

### 2.2 Crear Endpoint en Backend
**Archivo**: `backend/server.js`

Agregar antes de las "rutas no encontradas":

```javascript
// ============ HISTORIAL ============
app.post("/api/watch-history/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { movieId } = req.body;
    const connection = await pool.getConnection();
    
    await connection.query(
      "INSERT INTO user_watch_history (user_id, movie_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE watched_at = NOW()",
      [userId, movieId]
    );
    
    connection.release();
    res.json({ message: "Añadido al historial", movieId });
  } catch (error) {
    console.error("Error saving to history:", error);
    res.status(500).json({ message: "Error al guardar en historial" });
  }
});

app.get("/api/watch-history/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const connection = await pool.getConnection();
    
    const [history] = await connection.query(
      `SELECT m.*, h.watched_at FROM user_watch_history h
       JOIN movies m ON h.movie_id = m.id
       WHERE h.user_id = ?
       ORDER BY h.watched_at DESC
       LIMIT 20`,
      [userId]
    );
    
    connection.release();
    res.json({ count: history.length, movies: history });
  } catch (error) {
    console.error("Error fetching history:", error);
    res.status(500).json({ message: "Error al obtener historial" });
  }
});
```

### 2.3 Crear Pantalla de Historial
**Nuevo archivo**: `app/(tabs)/history.tsx`

Similar a favorites.tsx pero mostrando historial de películas vistas.

---

## 🎯 Prioridad 3: Trailers

### 3.1 Actualizar MovieDetail Interface
**Archivo**: `components/MovieModal.tsx`

```typescript
export interface MovieDetail {
  // ... campos existentes
  trailerUrl?: string;
  youtubeKey?: string;
}
```

### 3.2 Agregar Sección de Trailer
**Archivo**: `components/MovieModal.tsx`

En el JSX, después de la sección de reseñas:

```typescript
{/* Sección de Trailer */}
{movie.youtubeKey && (
  <View style={styles.trailerSection}>
    <Text style={styles.trailerTitle}>Trailer</Text>
    <View style={styles.trailerContainer}>
      {/* Aquí irá el player de video */}
      <Image
        source={{ uri: `https://img.youtube.com/vi/${movie.youtubeKey}/0.jpg` }}
        style={styles.trailerThumbnail}
      />
      <TouchableOpacity style={styles.playOverlay}>
        <MaterialCommunityIcons
          name="play-circle"
          size={60}
          color={NEON_RED}
        />
      </TouchableOpacity>
    </View>
  </View>
)}
```

### 3.3 Obtener YouTube Key de TMDB
**Archivo**: `backend/tmdb-service.js`

Actualizar `getMovieDetails()` para incluir videos:

```javascript
const movieDetails = await tmdbApi.get(`/movie/${movieId}`, {
  params: {
    api_key: TMDB_API_KEY,
    append_to_response: "videos",
    language: "es-ES"
  }
});

const trailer = movieDetails.data.videos?.results?.find(
  video => video.type === 'Trailer'
);

return {
  // ... datos existentes
  youtubeKey: trailer?.key || null
};
```

---

## 🎯 Prioridad 4: Reseñas Reales

### 4.1 Integrar Reviews de TMDB
**Archivo**: `backend/tmdb-service.js`

Agregar función:

```javascript
async function getMovieReviews(movieId) {
  try {
    const response = await tmdbApi.get(`/movie/${movieId}/reviews`, {
      params: { api_key: TMDB_API_KEY, language: "es-ES" },
    });
    return response.data.results || [];
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return [];
  }
}
```

### 4.2 Crear Endpoint para Reviews
**Archivo**: `backend/server.js`

```javascript
app.get("/api/movies/:movieId/reviews", async (req, res) => {
  try {
    const { movieId } = req.params;
    const reviews = await getMovieReviews(movieId);
    
    res.json({
      count: reviews.length,
      reviews: reviews.map(r => ({
        id: r.id,
        author: r.author,
        rating: r.author_details?.rating || 8,
        content: r.content,
        date: new Date(r.updated_at).toLocaleDateString('es-ES')
      }))
    });
  } catch (error) {
    res.status(500).json({ message: "Error al obtener reseñas" });
  }
});
```

### 4.3 Actualizar MovieModal
**Archivo**: `components/MovieModal.tsx`

Reemplazar mock reviews con API call:

```typescript
useEffect(() => {
  if (movie?.id && visible) {
    fetchReviews();
  }
}, [movie?.id, visible]);

const fetchReviews = async () => {
  try {
    const res = await fetch(
      `http://192.168.68.103:9999/api/movies/${movie?.id}/reviews`
    );
    const data = await res.json();
    setReviews(data.reviews || []);
  } catch (error) {
    console.error("Error fetching reviews:", error);
  }
};
```

---

## 🎯 Prioridad 5: Persistencia Offline

### 5.1 Instalar AsyncStorage
```bash
npx expo install @react-native-async-storage/async-storage
```

### 5.2 Guardar Favoritos Offline
**Archivo**: `app/(tabs)/index.tsx`

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

// Guardar cuando cambia
useEffect(() => {
  if (user?.id) {
    AsyncStorage.setItem(
      `favorites_${user.id}`,
      JSON.stringify(Array.from(favorites))
    );
  }
}, [favorites, user?.id]);

// Cargar al iniciar
const loadFavoritesOffline = async () => {
  if (user?.id) {
    const saved = await AsyncStorage.getItem(`favorites_${user.id}`);
    if (saved) {
      setFavorites(new Set(JSON.parse(saved)));
    }
  }
};
```

---

## 🔍 Checklist de Implementación

### Favoritos
- [ ] Descomenta sincronización con backend
- [ ] Carga favoritos al iniciar en loadData()
- [ ] Crea pantalla de favoritos
- [ ] Implementa almacenamiento offline con AsyncStorage
- [ ] Agrega tab en tabs layout

### Historial
- [ ] Crea endpoint POST en backend
- [ ] Crea endpoint GET en backend
- [ ] Modifica handleMoviePress para guardar
- [ ] Crea pantalla de historial
- [ ] Implementa AsyncStorage para offline

### Trailers
- [ ] Actualiza MovieDetail interface
- [ ] Modifica getMovieDetails en backend
- [ ] Agrega sección de trailer en modal
- [ ] Instala react-native-youtube-iframe (opcional)

### Reseñas Reales
- [ ] Crea función getMovieReviews en backend
- [ ] Crea endpoint /reviews en backend
- [ ] Reemplaza mock reviews en MovieModal
- [ ] Agrega state para reseñas dinámicas

### Persistencia
- [ ] Instala AsyncStorage
- [ ] Implementa guardado de favoritos
- [ ] Implementa guardado de historial
- [ ] Implementa sincronización al conectar

---

## 📞 Recursos Útiles

### TMDB API Documentation
- Base: https://api.themoviedb.org/3
- Movies: `/movie/{id}`
- Reviews: `/movie/{id}/reviews`
- Videos: `/movie/{id}/videos`

### React Native Docs
- AsyncStorage: https://react-native-async-storage.github.io
- FlatList: https://reactnative.dev/docs/flatlist
- ScrollView: https://reactnative.dev/docs/scrollview

---

## 💡 Tips de Desarrollo

1. **Siempre usa try-catch** en fetch calls
2. **Valida datos** antes de usar en componentes
3. **Usa console.log** estratégicamente
4. **Prueba en ambos formatos**: iOS y Android
5. **Mantén la lógica clara** y modular

---

## 🚀 Orden Recomendado de Implementación

1. **Primero**: Activar sincronización de favoritos (rápido)
2. **Segundo**: Crear pantalla de favoritos (UI)
3. **Tercero**: Historial (similar a favoritos)
4. **Cuarto**: Trailers (requiere nueva API)
5. **Quinto**: Reseñas reales (requiere cambios backend)
6. **Último**: Persistencia offline (opcional pero recomendado)

---

**Última actualización**: 2024
**Responsable**: PopFlix Development Team
