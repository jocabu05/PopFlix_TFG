const express = require("express");
const mysql = require("mysql2/promise");
const bcrypt = require("bcrypt");
const cors = require("cors");
const { getTrendingMovies, getMoviesByGenre, searchMovies, getMovieDetails, GENRE_IDS } = require("./tmdb-service");

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
// Caché de películas para evitar llamadas excesivas
let moviesCache = {};
let cacheTimeout = 60 * 60 * 1000; // 1 hora

// Obtener películas trending
app.get("/api/movies/trending", async (req, res) => {
  try {
    const movies = await getTrendingMovies();
    res.status(200).json({ 
      movies,
      count: movies.length,
      message: "Películas trending obtenidas"
    });
  } catch (error) {
    console.error("Error fetching trending:", error);
    res.status(500).json({ message: "Error al obtener películas", error: error.message });
  }
});

// Obtener películas por género
app.get("/api/movies/genre/:genre", async (req, res) => {
  try {
    const { genre } = req.params;
    const genreId = GENRE_IDS[genre];
    
    if (!genreId) {
      return res.status(400).json({ message: "Género no válido" });
    }
    
    const movies = await getMoviesByGenre(genreId);
    res.status(200).json({ 
      movies,
      count: movies.length,
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
    
    if (query.length < 2) {
      return res.status(400).json({ message: "Búsqueda debe tener al menos 2 caracteres" });
    }
    
    const movies = await searchMovies(query);
    res.status(200).json({
      movies,
      count: movies.length,
      message: "Búsqueda completada"
    });
  } catch (error) {
    console.error("Error searching:", error);
    res.status(500).json({ message: "Error al buscar películas", error: error.message });
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
