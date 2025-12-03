const axios = require("axios");

const TMDB_API_KEY = "8e0cc4ff66e5b76c4d28fb2ee72f7a6e"; // API key pública (considera usar env)
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

// Configuración de plataformas TMDB
const PLATFORM_TMDB_MAPPING = {
  1: 8, // Netflix -> TMDB provider 8
  4: 9, // HBO Max -> TMDB provider 9
  7: 25, // Apple TV+ -> TMDB provider 25
};

/**
 * Obtener películas populares de la semana filtradas por plataformas del usuario
 */
async function getMoviesForUser(userId, pool) {
  try {
    // 1. Obtener plataformas del usuario
    const connection = await pool.getConnection();
    const [userPlatforms] = await connection.query(
      `SELECT platform_id FROM user_platforms WHERE user_id = ? AND selected = 1`,
      [userId]
    );
    connection.release();

    if (!userPlatforms.length) {
      return { movies: [], message: "Usuario no tiene plataformas seleccionadas" };
    }

    const platformIds = userPlatforms.map((p) => p.platform_id);
    const tmdbProviders = platformIds
      .map((id) => PLATFORM_TMDB_MAPPING[id])
      .filter((p) => p);

    if (!tmdbProviders.length) {
      return { movies: [], message: "Plataformas no mapeadas a TMDB" };
    }

    // 2. Obtener películas populares de TMDB
    const response = await axios.get(`${TMDB_BASE_URL}/movie/popular`, {
      params: {
        api_key: TMDB_API_KEY,
        language: "es-ES",
        page: 1,
      },
    });

    let movies = response.data.results.slice(0, 20); // Top 20

    // 3. Filtrar por disponibilidad en las plataformas del usuario
    // (En un caso real, usarías el endpoint /movie/{id}/watch/providers)
    // Por ahora, retornamos las populares y las guardamos en BD

    // 4. Guardar películas en BD
    for (const movie of movies) {
      await saveMovieToDB(movie, platformIds, pool);
    }

    return { movies, count: movies.length };
  } catch (error) {
    console.error("Error fetching movies for user:", error.message);
    throw error;
  }
}

/**
 * Guardar película en BD
 */
async function saveMovieToDB(tmdbMovie, platformIds, pool) {
  try {
    const connection = await pool.getConnection();

    // Verificar si ya existe
    const [existing] = await connection.query(
      "SELECT id FROM movies WHERE tmdb_id = ?",
      [tmdbMovie.id]
    );

    if (existing.length > 0) {
      connection.release();
      return existing[0].id;
    }

    // Insertar película
    const [result] = await connection.query(
      `INSERT INTO movies (tmdb_id, title, description, poster_url, backdrop_url, release_date, rating, popularity)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        tmdbMovie.id,
        tmdbMovie.title,
        tmdbMovie.overview,
        `https://image.tmdb.org/t/p/w342${tmdbMovie.poster_path}`,
        `https://image.tmdb.org/t/p/w1280${tmdbMovie.backdrop_path}`,
        tmdbMovie.release_date,
        tmdbMovie.vote_average,
        tmdbMovie.popularity,
      ]
    );

    const movieId = result.insertId;

    // Insertar géneros
    if (tmdbMovie.genre_ids && tmdbMovie.genre_ids.length > 0) {
      for (const genreId of tmdbMovie.genre_ids) {
        await connection.query(
          `INSERT IGNORE INTO movie_genres (movie_id, genre_id) 
           SELECT ?, id FROM genres WHERE tmdb_id = ?`,
          [movieId, genreId]
        );
      }
    }

    // Insertar plataformas disponibles
    for (const platformId of platformIds) {
      await connection.query(
        `INSERT IGNORE INTO movie_platforms (movie_id, platform_id) VALUES (?, ?)`,
        [movieId, platformId]
      );
    }

    connection.release();
    return movieId;
  } catch (error) {
    console.error("Error saving movie to DB:", error.message);
    return null;
  }
}

/**
 * Obtener ranking semanal (Top 3)
 */
async function getWeeklyRanking(userId, pool) {
  try {
    const connection = await pool.getConnection();

    // Obtener inicio de semana
    const today = new Date();
    const first = today.getDate() - today.getDay();
    const weekStart = new Date(today.setDate(first)).toISOString().split("T")[0];

    // Obtener plataformas del usuario
    const [userPlatforms] = await connection.query(
      `SELECT platform_id FROM user_platforms WHERE user_id = ? AND selected = 1`,
      [userId]
    );

    if (!userPlatforms.length) {
      connection.release();
      return { ranking: [] };
    }

    // Obtener top 3 de la semana
    const [ranking] = await connection.query(
      `SELECT 
        wr.position,
        m.tmdb_id,
        m.title,
        m.poster_url,
        m.rating,
        m.popularity
       FROM weekly_ranking wr
       JOIN movies m ON wr.movie_id = m.id
       JOIN movie_platforms mp ON m.id = mp.movie_id
       WHERE wr.week_start = ? 
       AND mp.platform_id IN (?)
       AND wr.position <= 3
       ORDER BY wr.position ASC`,
      [weekStart, userPlatforms.map((p) => p.platform_id)]
    );

    connection.release();
    return { ranking, weekStart };
  } catch (error) {
    console.error("Error fetching weekly ranking:", error.message);
    return { ranking: [] };
  }
}

/**
 * Buscar películas
 */
async function searchMovies(query, userId, pool) {
  try {
    const connection = await pool.getConnection();

    // Obtener plataformas del usuario
    const [userPlatforms] = await connection.query(
      `SELECT platform_id FROM user_platforms WHERE user_id = ? AND selected = 1`,
      [userId]
    );

    const platformIds = userPlatforms.map((p) => p.platform_id);

    // Buscar en BD primero
    const [dbResults] = await connection.query(
      `SELECT DISTINCT m.* FROM movies m
       JOIN movie_platforms mp ON m.id = mp.movie_id
       WHERE (m.title LIKE ? OR m.description LIKE ?)
       AND mp.platform_id IN (?)
       ORDER BY m.popularity DESC
       LIMIT 20`,
      [`%${query}%`, `%${query}%`, platformIds]
    );

    // Si no hay resultados en BD, buscar en TMDB
    if (dbResults.length === 0) {
      const response = await axios.get(`${TMDB_BASE_URL}/search/movie`, {
        params: {
          api_key: TMDB_API_KEY,
          query,
          language: "es-ES",
          page: 1,
        },
      });

      for (const movie of response.data.results.slice(0, 10)) {
        await saveMovieToDB(movie, platformIds, pool);
      }

      return { results: response.data.results.slice(0, 10) };
    }

    connection.release();
    return { results: dbResults };
  } catch (error) {
    console.error("Error searching movies:", error.message);
    return { results: [] };
  }
}

/**
 * Obtener películas por género
 */
async function getMoviesByGenre(genreId, userId, pool) {
  try {
    const connection = await pool.getConnection();

    // Obtener plataformas del usuario
    const [userPlatforms] = await connection.query(
      `SELECT platform_id FROM user_platforms WHERE user_id = ? AND selected = 1`,
      [userId]
    );

    const platformIds = userPlatforms.map((p) => p.platform_id);

    // Obtener películas del género en plataformas del usuario
    const [movies] = await connection.query(
      `SELECT DISTINCT m.* FROM movies m
       JOIN movie_genres mg ON m.id = mg.movie_id
       JOIN movie_platforms mp ON m.id = mp.movie_id
       WHERE mg.genre_id = ? AND mp.platform_id IN (?)
       ORDER BY m.popularity DESC
       LIMIT 20`,
      [genreId, platformIds]
    );

    connection.release();
    return { movies };
  } catch (error) {
    console.error("Error fetching movies by genre:", error.message);
    return { movies: [] };
  }
}

module.exports = {
  getMoviesForUser,
  getWeeklyRanking,
  searchMovies,
  getMoviesByGenre,
  PLATFORM_TMDB_MAPPING,
};
