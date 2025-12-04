const express = require("express");
const mysql = require("mysql2/promise");
const bcrypt = require("bcrypt");
const cors = require("cors");
const { getTrendingMovies, getMoviesByGenre, searchMovies, getMovieDetails, getMovieReviews, getFictionalReviews, GENRE_IDS } = require("./tmdb-service");

const app = express();
const PORT = 9999;

// Middleware
app.use(cors());
app.use(express.json());

// Configuración de la conexión a MySQL
const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "1234",
  database: "popflix",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Verificar conexión a BD al iniciar
pool.getConnection()
  .then(conn => {
    console.log("✅ Conexión a MySQL exitosa");
    conn.release();
  })
  .catch(err => {
    console.error("❌ ERROR DE CONEXIÓN A MYSQL:", err.message);
    console.error("⚠️  Verifica que MySQL esté corriendo y la BD 'popflix' exista");
  });

// Validaciones
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isValidName = (name) => {
  return name.length >= 3 && /^[a-záéíóúàèìòùäëïöüñ\s]+$/i.test(name);
};

const isValidPhone = (phone) => {
  return phone.length >= 7 && /^\d+$/.test(phone.replace(/\D/g, ""));
};

const isValidPassword = (password) => {
  return password.length >= 8;
};

// Rutas
// Health check - para verificar que el servidor está activo
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "OK", message: "Backend está funcionando" });
});

// Endpoint para limpiar caché (solo en desarrollo)
app.post("/api/clear-cache", (req, res) => {
  moviesCache = {
    trending: { data: [], timestamp: 0 },
    genres: {},
    search: {}
  };
  res.status(200).json({ message: "Caché limpiado" });
});

// ============ PLATAFORMAS ============
// Obtener todas las plataformas disponibles
app.get("/api/platforms", async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [platforms] = await connection.query("SELECT * FROM platforms ORDER BY id");
    connection.release();
    
    return res.status(200).json({
      message: "Plataformas obtenidas",
      platforms: platforms
    });
  } catch (error) {
    console.error("Error al obtener plataformas:", error);
    return res.status(500).json({ message: "Error al obtener plataformas" });
  }
});

// Obtener plataformas seleccionadas por el usuario
app.get("/api/user/:userId/platforms", async (req, res) => {
  try {
    const { userId } = req.params;
    const connection = await pool.getConnection();
    
    const [platforms] = await connection.query(
      `SELECT p.*, up.selected FROM platforms p
       LEFT JOIN user_platforms up ON p.id = up.platform_id AND up.user_id = ?
       ORDER BY p.id`,
      [userId]
    );
    
    connection.release();
    
    return res.status(200).json({
      message: "Plataformas del usuario obtenidas",
      platforms: platforms
    });
  } catch (error) {
    console.error("Error al obtener plataformas del usuario:", error);
    return res.status(500).json({ message: "Error al obtener plataformas" });
  }
});

app.post("/api/auth/register", async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password } = req.body;

    // Validar que todos los campos estén presentes
    if (!firstName || !lastName || !email || !phone || !password) {
      return res.status(400).json({ message: "Todos los campos son obligatorios" });
    }

    // Validar formato de datos
    if (firstName.length < 2 || !/^[a-záéíóúàèìòùäëïöüñ\s]+$/i.test(firstName)) {
      return res.status(400).json({ message: "Nombre inválido (mínimo 2 caracteres, solo letras)" });
    }

    if (lastName.length < 2 || !/^[a-záéíóúàèìòùäëïöüñ\s]+$/i.test(lastName)) {
      return res.status(400).json({ message: "Apellido inválido (mínimo 2 caracteres, solo letras)" });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Email inválido" });
    }

    if (!isValidPhone(phone)) {
      return res.status(400).json({ message: "Teléfono inválido (mínimo 7 dígitos)" });
    }

    if (!isValidPassword(password)) {
      return res.status(400).json({ message: "Contraseña muy corta (mínimo 8 caracteres)" });
    }

    const connection = await pool.getConnection();

    // Verificar si el email ya existe
    const [rows] = await connection.query("SELECT id FROM users WHERE email = ?", [email]);

    if (rows.length > 0) {
      connection.release();
      return res.status(409).json({ message: "El email ya está registrado" });
    }

    // Encriptar contraseña
    let hashedPassword;
    try {
      hashedPassword = await bcrypt.hash(password, 10);
      console.log("Contraseña hasheada:", hashedPassword.substring(0, 20) + "...");
    } catch (hashError) {
      console.error("Error al hashear contraseña:", hashError);
      connection.release();
      return res.status(500).json({ message: "Error al procesar contraseña" });
    }

    // Insertar usuario
    const [result] = await connection.query(
      "INSERT INTO users (firstName, lastName, email, phone, password) VALUES (?, ?, ?, ?, ?)",
      [firstName, lastName, email, phone, hashedPassword]
    );

    connection.release();

    return res.status(201).json({
      message: "Usuario registrado exitosamente",
      userId: result.insertId,
    });
  } catch (error) {
    console.error("Error en registro:", error);
    return res.status(500).json({ message: "Error en el servidor" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email y contraseña requeridos" });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Email inválido" });
    }

    const connection = await pool.getConnection();

    const [rows] = await connection.query("SELECT id, firstName, lastName, email, password FROM users WHERE email = ?", [email]);

    if (rows.length === 0) {
      connection.release();
      return res.status(401).json({ message: "Credenciales incorrectas" });
    }

    const user = rows[0];
    console.log("=== LOGIN DEBUG ===");
    console.log("Email encontrado:", user.email);
    console.log("Password de BD (primeros 30 chars):", user.password.substring(0, 30));
    console.log("Password enviado:", password);
    console.log("Tipo de password en BD:", typeof user.password);
    
    let passwordMatch = false;
    try {
      passwordMatch = await bcrypt.compare(password, user.password);
      console.log("Resultado bcrypt.compare:", passwordMatch);
    } catch (compareError) {
      console.error("Error en bcrypt.compare:", compareError.message);
      console.log("Intentando comparación directa...");
      passwordMatch = password === user.password;
      console.log("Comparación directa:", passwordMatch);
    }
    console.log("=== FIN DEBUG ===");

    connection.release();

    if (!passwordMatch) {
      return res.status(401).json({ message: "Credenciales incorrectas" });
    }

    return res.status(200).json({
      message: "Login exitoso",
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Error en login:", error);
    return res.status(500).json({ message: "Error en el servidor" });
  }
});

// ========== RUTAS DE PLATAFORMAS ==========

// Obtener todas las plataformas
app.get("/api/platforms", async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [platforms] = await connection.query("SELECT id, name, icon, color FROM platforms ORDER BY name");
    connection.release();
    
    return res.status(200).json({ platforms });
  } catch (error) {
    console.error("Error obteniendo plataformas:", error);
    return res.status(500).json({ message: "Error al obtener plataformas" });
  }
});

// Obtener plataformas del usuario
app.get("/api/user/:userId/platforms", async (req, res) => {
  try {
    const { userId } = req.params;
    const connection = await pool.getConnection();
    
    const [userPlatforms] = await connection.query(
      `SELECT p.id, p.name, p.icon, p.color, COALESCE(up.selected, FALSE) as selected
       FROM platforms p
       LEFT JOIN user_platforms up ON p.id = up.platform_id AND up.user_id = ?
       ORDER BY p.name`,
      [userId]
    );
    
    connection.release();
    return res.status(200).json({ platforms: userPlatforms });
  } catch (error) {
    console.error("Error obteniendo plataformas del usuario:", error);
    return res.status(500).json({ message: "Error al obtener plataformas" });
  }
});

// Guardar plataformas seleccionadas por el usuario
app.post("/api/user/:userId/platforms", async (req, res) => {
  try {
    const { userId } = req.params;
    const { platformIds } = req.body;

    console.log("POST /api/user/:userId/platforms");
    console.log("userId:", userId);
    console.log("platformIds:", platformIds);

    if (!platformIds || !Array.isArray(platformIds)) {
      console.log("Error: platformIds no es un array válido");
      return res.status(400).json({ message: "platformIds debe ser un array" });
    }

    const connection = await pool.getConnection();
    console.log("Conexión obtenida");

    // Eliminar selecciones previas
    await connection.query("DELETE FROM user_platforms WHERE user_id = ?", [userId]);
    console.log("Registros previos eliminados");

    // Insertar nuevas selecciones
    for (const platformId of platformIds) {
      console.log("Insertando platform:", platformId);
      await connection.query(
        "INSERT INTO user_platforms (user_id, platform_id, selected) VALUES (?, ?, TRUE)",
        [userId, platformId]
      );
    }

    connection.release();
    console.log("Conexión liberada");

    return res.status(201).json({
      message: "Plataformas guardadas exitosamente",
      platformsCount: platformIds.length
    });
  } catch (error) {
    console.error("Error guardando plataformas:", error);
    return res.status(500).json({ message: "Error al guardar plataformas", error: error.message });
  }
});
// ============ PELÍCULAS (TMDB Real) ============
// Caché mejorado de películas con variación por página
let moviesCache = {
  trending: { data: [], timestamp: 0 },
  genres: {},
  search: {}
};
const cacheTimeout = 5 * 60 * 1000; // 5 minutos para desarrollo (era 1 hora)

// Función para verificar si caché es válido
function isCacheValid(timestamp) {
  return timestamp && (Date.now() - timestamp < cacheTimeout);
}

// Obtener películas trending con paginación
app.get("/api/movies/trending", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = 10;

    // Verificar caché
    if (isCacheValid(moviesCache.trending.timestamp)) {
      const allMovies = moviesCache.trending.data;
      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      const paginatedMovies = allMovies.slice(start, end);

      return res.status(200).json({
        movies: paginatedMovies,
        count: paginatedMovies.length,
        page: page,
        totalPages: Math.ceil(allMovies.length / pageSize),
        message: "Películas trending obtenidas"
      });
    }

    // Si caché expiró, obtener nuevas películas
    const movies = await getTrendingMovies();
    moviesCache.trending = { data: movies, timestamp: Date.now() };

    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginatedMovies = movies.slice(start, end);

    res.status(200).json({
      movies: paginatedMovies,
      count: paginatedMovies.length,
      page: page,
      totalPages: Math.ceil(movies.length / pageSize),
      message: "Películas trending obtenidas"
    });
  } catch (error) {
    console.error("Error fetching trending:", error);
    res.status(500).json({ message: "Error al obtener películas", error: error.message });
  }
});

// Obtener películas por género con caché por género
app.get("/api/movies/genre/:genre", async (req, res) => {
  try {
    const { genre } = req.params;
    const page = parseInt(req.query.page) || 1;
    const pageSize = 10;
    const genreId = GENRE_IDS[genre];

    if (!genreId) {
      return res.status(400).json({ message: "Género no válido" });
    }

    // Verificar caché por género
    if (!moviesCache.genres[genreId]) {
      moviesCache.genres[genreId] = { data: [], timestamp: 0 };
    }

    if (isCacheValid(moviesCache.genres[genreId].timestamp)) {
      const allMovies = moviesCache.genres[genreId].data;
      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      const paginatedMovies = allMovies.slice(start, end);

      return res.status(200).json({
        movies: paginatedMovies,
        count: paginatedMovies.length,
        page: page,
        totalPages: Math.ceil(allMovies.length / pageSize),
        message: `Películas de ${genre} obtenidas`
      });
    }

    // Si caché expiró, obtener nuevas películas
    const movies = await getMoviesByGenre(genreId);
    moviesCache.genres[genreId] = { data: movies, timestamp: Date.now() };

    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginatedMovies = movies.slice(start, end);

    res.status(200).json({
      movies: paginatedMovies,
      count: paginatedMovies.length,
      page: page,
      totalPages: Math.ceil(movies.length / pageSize),
      message: `Películas de ${genre} obtenidas`
    });
  } catch (error) {
    console.error("Error fetching genre:", error);
    res.status(500).json({ message: "Error al obtener películas", error: error.message });
  }
});

// Buscar películas
app.get("/api/movies/search/:query", async (req, res) => {
  try {
    const { query } = req.params;
    const page = parseInt(req.query.page) || 1;
    const pageSize = 10;
    
    if (query.length < 2) {
      return res.status(400).json({ message: "Búsqueda debe tener al menos 2 caracteres" });
    }

    // Verificar caché de búsqueda
    const cacheKey = `${query}_${page}`;
    if (!moviesCache.search[query]) {
      moviesCache.search[query] = { data: [], timestamp: 0 };
    }

    if (isCacheValid(moviesCache.search[query].timestamp)) {
      const allMovies = moviesCache.search[query].data;
      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      const paginatedMovies = allMovies.slice(start, end);

      return res.status(200).json({
        movies: paginatedMovies,
        count: paginatedMovies.length,
        page: page,
        totalPages: Math.ceil(allMovies.length / pageSize),
        message: "Búsqueda completada"
      });
    }

    // Si caché expiró, obtener nuevas películas
    const movies = await searchMovies(query);
    moviesCache.search[query] = { data: movies, timestamp: Date.now() };

    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginatedMovies = movies.slice(start, end);

    res.status(200).json({
      movies: paginatedMovies,
      count: paginatedMovies.length,
      page: page,
      totalPages: Math.ceil(movies.length / pageSize),
      message: "Búsqueda completada"
    });
  } catch (error) {
    console.error("Error searching:", error);
    res.status(500).json({ message: "Error al buscar películas", error: error.message });
  }
});

// Obtener películas por plataformas del usuario - VERSION SIMPLE
app.get("/api/movies/user/:userId/by-platforms", async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const pageSize = 10;

    const connection = await pool.getConnection();

    // Paso 1: Obtener plataformas del usuario
    const [userPlatforms] = await connection.query(
      "SELECT platform_id FROM user_platforms WHERE user_id = ?",
      [userId]
    );

    if (userPlatforms.length === 0) {
      connection.release();
      return res.json({ movies: [], count: 0, page, totalPages: 0 });
    }

    // Paso 2: Obtener películas de esas plataformas
    const platformIds = userPlatforms.map(p => p.platform_id);
    const placeholders = platformIds.map(() => "?").join(",");
    
    const query = `SELECT DISTINCT m.id, m.title, m.rating, m.release_date, m.poster_url
                   FROM movies m
                   INNER JOIN movies_platforms mp ON m.id = mp.movie_id
                   WHERE mp.platform_id IN (${placeholders})
                   LIMIT ?, ?`;
    
    const offset = (page - 1) * pageSize;
    const [movies] = await connection.query(query, [...platformIds, offset, pageSize]);

    connection.release();

    res.json({
      movies: movies || [],
      count: (movies || []).length,
      page,
      totalPages: 10
    });
  } catch (error) {
    console.error("Error:", error.message);
    res.json({ movies: [], count: 0, error: error.message });
  }
});
// Obtener detalles de película
app.get("/api/movies/:movieId/details", async (req, res) => {
  try {
    const { movieId } = req.params;
    const details = await getMovieDetails(movieId);
    
    if (!details) {
      return res.status(404).json({ message: "Película no encontrada" });
    }
    
    res.status(200).json({
      movie: details,
      message: "Detalles obtenidos"
    });
  } catch (error) {
    console.error("Error fetching details:", error);
    res.status(500).json({ message: "Error al obtener detalles", error: error.message });
  }
});

// Obtener reseñas de película (TMDB + Usuarios + Ficticias)
app.get("/api/movies/:movieId/reviews", async (req, res) => {
  try {
    const { movieId } = req.params;
    
    // 1. Obtener reseñas de TMDB
    const tmdbReviews = await getMovieReviews(movieId);
    
    // 2. Obtener reseñas de usuarios de la base de datos
    const connection = await pool.getConnection();
    const [userReviews] = await connection.query(
      `SELECT ur.id, u.firstName as author, ur.rating, ur.content, 
              DATE_FORMAT(ur.created_at, '%d/%m/%Y') as date
       FROM user_reviews ur
       JOIN users u ON ur.user_id = u.id
       WHERE ur.movie_id = ?
       ORDER BY ur.created_at DESC
       LIMIT 10`,
      [movieId]
    );
    connection.release();
    
    // Formatear reseñas de usuario
    const formattedUserReviews = userReviews.map(review => ({
      id: `user_${review.id}`,
      author: review.author,
      rating: parseFloat(review.rating),
      content: review.content,
      date: review.date,
      source: "user",
    }));
    
    // 3. Combinar todas las reseñas: usuario (prioridad) + TMDB + ficticias
    let allReviews = [...formattedUserReviews, ...tmdbReviews];
    
    // Si no hay suficientes reseñas, agregar ficticias
    if (allReviews.length === 0) {
      allReviews = getFictionalReviews();
    } else if (allReviews.length < 3) {
      const fictionalToAdd = getFictionalReviews();
      allReviews = [...allReviews, ...fictionalToAdd.slice(0, 3 - allReviews.length)];
    }
    
    res.status(200).json({
      reviews: allReviews,
      count: allReviews.length,
      message: "Reseñas obtenidas"
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ message: "Error al obtener reseñas", error: error.message });
  }
});

// Crear reseña de usuario
app.post("/api/reviews", async (req, res) => {
  try {
    const { userId, movieId, rating, content } = req.body;

    // Validaciones
    if (!userId || !movieId || !rating || !content) {
      return res.status(400).json({ message: "Datos incompletos" });
    }

    if (rating < 1 || rating > 10) {
      return res.status(400).json({ message: "Rating debe estar entre 1 y 10" });
    }

    if (content.length < 10) {
      return res.status(400).json({ message: "La reseña debe tener al menos 10 caracteres" });
    }

    const connection = await pool.getConnection();

    // Insertar o actualizar reseña
    const [result] = await connection.query(
      `INSERT INTO user_reviews (user_id, movie_id, rating, content) 
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE rating = ?, content = ?, updated_at = NOW()`,
      [userId, movieId, rating, content, rating, content]
    );

    connection.release();

    return res.status(201).json({
      message: "Reseña guardada exitosamente",
      reviewId: result.insertId || result.affectedRows,
    });
  } catch (error) {
    console.error("Error creating review:", error);
    return res.status(500).json({ message: "Error al guardar reseña", error: error.message });
  }
});

// Obtener ranking semanal (Top 3 trending)
app.get("/api/weekly-ranking/:userId", async (req, res) => {
  try {
    const movies = await getTrendingMovies();
    const ranking = movies.slice(0, 3).map((movie, index) => ({
      ...movie,
      position: index + 1,
      medal: index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"
    }));
    
    res.status(200).json({
      ranking,
      weekStart: new Date().toISOString().split('T')[0],
      message: "Ranking obtenido exitosamente"
    });
  } catch (error) {
    console.error("Error fetching ranking:", error);
    res.status(500).json({ message: "Error al obtener ranking", error: error.message });
  }
});

// ============ FAVORITOS ============
// Obtener favoritos del usuario
app.get("/api/favorites/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const connection = await pool.getConnection();
    
    const [favorites] = await connection.query(
      "SELECT movie_id FROM user_favorites WHERE user_id = ? ORDER BY added_date DESC",
      [userId]
    );
    
    connection.release();
    
    res.json({
      count: favorites.length,
      favorites: favorites.map((f) => f.movie_id),
    });
  } catch (error) {
    console.error("Error fetching favorites:", error);
    res.status(500).json({ message: "Error al obtener favoritos", error: error.message });
  }
});

// Añadir a favoritos
app.post("/api/favorites/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { movieId } = req.body;
    const connection = await pool.getConnection();
    
    await connection.query(
      "INSERT INTO user_favorites (user_id, movie_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE added_date = NOW()",
      [userId, movieId]
    );
    
    connection.release();
    
    res.json({ message: "Película añadida a favoritos", movieId, userId });
  } catch (error) {
    console.error("Error adding favorite:", error);
    res.status(500).json({ message: "Error al añadir a favoritos", error: error.message });
  }
});

// Eliminar de favoritos
app.delete("/api/favorites/:userId/:movieId", async (req, res) => {
  try {
    const { userId, movieId } = req.params;
    const connection = await pool.getConnection();
    
    await connection.query(
      "DELETE FROM user_favorites WHERE user_id = ? AND movie_id = ?",
      [userId, movieId]
    );
    
    connection.release();
    
    res.json({ message: "Película eliminada de favoritos", movieId, userId });
  } catch (error) {
    console.error("Error removing favorite:", error);
    res.status(500).json({ message: "Error al eliminar de favoritos", error: error.message });
  }
});

// ============ ENDPOINTS DE SERIES ============

// Series trending
app.get("/api/series/trending", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const offset = (page - 1) * limit;
    
    const connection = await pool.getConnection();
    
    const [series] = await connection.query(
      `SELECT s.* FROM series s 
       ORDER BY s.popularity DESC 
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );
    
    connection.release();
    
    res.json({ 
      series: series || [],
      page,
      limit,
      total: series?.length || 0
    });
  } catch (error) {
    console.error("Error fetching series:", error);
    res.status(500).json({ message: "Error al obtener series", error: error.message });
  }
});

// Series por género
app.get("/api/series/genre/:genreName", async (req, res) => {
  try {
    const { genreName } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const offset = (page - 1) * limit;
    
    const connection = await pool.getConnection();
    
    const [series] = await connection.query(
      `SELECT DISTINCT s.* FROM series s
       INNER JOIN series_genres sg ON s.id = sg.series_id
       INNER JOIN genres g ON sg.genre_id = g.id
       WHERE g.name = ?
       ORDER BY s.popularity DESC
       LIMIT ? OFFSET ?`,
      [genreName, limit, offset]
    );
    
    connection.release();
    
    res.json({ 
      series: series || [],
      genre: genreName,
      page,
      limit
    });
  } catch (error) {
    console.error("Error fetching series by genre:", error);
    res.status(500).json({ message: "Error al obtener series por género", error: error.message });
  }
});

// Buscar series
app.get("/api/series/search/:query", async (req, res) => {
  try {
    const { query } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const offset = (page - 1) * limit;
    
    const connection = await pool.getConnection();
    
    const [series] = await connection.query(
      `SELECT * FROM series 
       WHERE LOWER(title) LIKE ? OR LOWER(description) LIKE ?
       ORDER BY popularity DESC
       LIMIT ? OFFSET ?`,
      [`%${query.toLowerCase()}%`, `%${query.toLowerCase()}%`, limit, offset]
    );
    
    connection.release();
    
    res.json({ 
      series: series || [],
      query,
      page,
      limit
    });
  } catch (error) {
    console.error("Error searching series:", error);
    res.status(500).json({ message: "Error al buscar series", error: error.message });
  }
});

// Series por plataformas del usuario
app.get("/api/series/user/:userId/by-platforms", async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const offset = (page - 1) * limit;
    
    const connection = await pool.getConnection();
    
    const [series] = await connection.query(
      `SELECT DISTINCT s.* FROM series s
       INNER JOIN series_platforms sp ON s.id = sp.series_id
       INNER JOIN user_platforms up ON sp.platform_id = up.platform_id
       WHERE up.user_id = ?
       ORDER BY s.popularity DESC
       LIMIT ? OFFSET ?`,
      [userId, limit, offset]
    );
    
    connection.release();
    
    res.json({ 
      series: series || [],
      userId,
      page,
      limit,
      count: series?.length || 0
    });
  } catch (error) {
    console.error("Error fetching user series:", error);
    res.status(500).json({ message: "Error al obtener series del usuario", error: error.message });
  }
});

// Rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ message: "Ruta no encontrada" });
});

// Error handler global
app.use((err, req, res, next) => {
  console.error("Error no capturado:", err);
  res.status(500).json({ message: "Error interno del servidor", error: err.message });
});

// Iniciar servidor
const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log("✅ Backend listo para recibir peticiones");
});
