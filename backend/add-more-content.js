/**
 * Script para añadir más películas y series de géneros específicos
 */

const axios = require("axios");
const mysql = require("mysql2/promise");

const TMDB_API_KEY = "f864a2cf4abc8eb393336cfe36d0c42e";
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

const DB_CONFIG = {
  host: "localhost",
  user: "root",
  password: "1234",
  database: "popflix",
};

const MOVIE_GENRES = {
  28: "Action",
  16: "Animation",
  35: "Comedy",
  27: "Horror",
  878: "Science Fiction",
  18: "Drama",
  53: "Thriller",
  10749: "Romance",
  80: "Crime",
};

const TV_GENRES = {
  10759: "Action",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  18: "Drama",
  9648: "Mystery",
  10765: "Sci-Fi & Fantasy",
};

async function fetchTMDB(endpoint, params = {}) {
  try {
    const response = await axios.get(`${TMDB_BASE_URL}${endpoint}`, {
      params: { api_key: TMDB_API_KEY, language: "es-ES", ...params },
    });
    return response.data;
  } catch (error) {
    return null;
  }
}

async function insertMovie(conn, movie) {
  if (!movie.poster_path) return false;
  try {
    const [existing] = await conn.query("SELECT id FROM movies WHERE tmdb_id = ?", [movie.id]);
    if (existing.length > 0) return false;

    await conn.query(
      `INSERT INTO movies (tmdb_id, title, description, poster_url, backdrop_url, release_date, rating, popularity)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        movie.id,
        movie.title,
        movie.overview || "Sin descripción",
        `https://image.tmdb.org/t/p/w342${movie.poster_path}`,
        movie.backdrop_path ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}` : null,
        movie.release_date || null,
        movie.vote_average || 0,
        movie.popularity || 0,
      ]
    );

    const [[{ movieId }]] = await conn.query("SELECT id as movieId FROM movies WHERE tmdb_id = ?", [movie.id]);
    
    if (movie.genre_ids) {
      for (const genreId of movie.genre_ids) {
        const genreName = MOVIE_GENRES[genreId];
        if (genreName) {
          const [genreRow] = await conn.query("SELECT id FROM genres WHERE name = ?", [genreName]);
          if (genreRow.length > 0) {
            await conn.query("INSERT IGNORE INTO movie_genres (movie_id, genre_id) VALUES (?, ?)", [movieId, genreRow[0].id]);
          }
        }
      }
    }
    return true;
  } catch (error) {
    return false;
  }
}

async function insertSeries(conn, series) {
  if (!series.poster_path) return false;
  try {
    const [existing] = await conn.query("SELECT id FROM series WHERE tmdb_id = ?", [series.id]);
    if (existing.length > 0) return false;

    await conn.query(
      `INSERT INTO series (tmdb_id, title, description, poster_url, backdrop_url, first_air_date, rating, popularity, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        series.id,
        series.name,
        series.overview || "Sin descripción",
        `https://image.tmdb.org/t/p/w342${series.poster_path}`,
        series.backdrop_path ? `https://image.tmdb.org/t/p/w1280${series.backdrop_path}` : null,
        series.first_air_date || null,
        series.vote_average || 0,
        series.popularity || 0,
        "Returning Series",
      ]
    );

    const [[{ seriesId }]] = await conn.query("SELECT id as seriesId FROM series WHERE tmdb_id = ?", [series.id]);
    
    if (series.genre_ids) {
      for (const genreId of series.genre_ids) {
        const genreName = TV_GENRES[genreId];
        if (genreName) {
          const [genreRow] = await conn.query("SELECT id FROM genres WHERE name LIKE ?", [`%${genreName}%`]);
          if (genreRow.length > 0) {
            await conn.query("INSERT IGNORE INTO series_genres (series_id, genre_id) VALUES (?, ?)", [seriesId, genreRow[0].id]);
          }
        }
      }
    }
    return true;
  } catch (error) {
    return false;
  }
}

async function main() {
  console.log("🚀 Añadiendo más contenido...\n");
  const conn = await mysql.createConnection(DB_CONFIG);

  // Añadir más películas por género (5 páginas cada uno)
  const movieGenreIds = [28, 27, 878, 35, 16, 53]; // Action, Horror, Sci-Fi, Comedy, Animation, Thriller
  let moviesAdded = 0;
  
  for (const genreId of movieGenreIds) {
    console.log(`🎬 Películas de ${MOVIE_GENRES[genreId]}...`);
    for (let page = 1; page <= 5; page++) {
      const data = await fetchTMDB("/discover/movie", {
        page,
        with_genres: genreId,
        sort_by: "popularity.desc",
        "vote_count.gte": 100,
      });
      if (data?.results) {
        for (const movie of data.results) {
          if (await insertMovie(conn, movie)) moviesAdded++;
        }
      }
      await new Promise(r => setTimeout(r, 200));
    }
  }
  console.log(`   ✅ +${moviesAdded} películas\n`);

  // Añadir más series por género
  const tvGenreIds = [10759, 18, 35, 80, 16, 9648, 10765]; // Action, Drama, Comedy, Crime, Animation, Mystery, Sci-Fi
  let seriesAdded = 0;
  
  for (const genreId of tvGenreIds) {
    const genreName = TV_GENRES[genreId] || genreId;
    console.log(`📺 Series de ${genreName}...`);
    for (let page = 1; page <= 4; page++) {
      const data = await fetchTMDB("/discover/tv", {
        page,
        with_genres: genreId,
        sort_by: "popularity.desc",
        "vote_count.gte": 50,
      });
      if (data?.results) {
        for (const series of data.results) {
          if (await insertSeries(conn, series)) seriesAdded++;
        }
      }
      await new Promise(r => setTimeout(r, 200));
    }
  }
  console.log(`   ✅ +${seriesAdded} series\n`);

  // Estadísticas finales
  const [[{ totalMovies }]] = await conn.query("SELECT COUNT(*) as totalMovies FROM movies");
  const [[{ totalSeries }]] = await conn.query("SELECT COUNT(*) as totalSeries FROM series");

  console.log("═".repeat(40));
  console.log(`📊 TOTAL: ${totalMovies} películas, ${totalSeries} series`);
  console.log("═".repeat(40));

  await conn.end();
}

main();
