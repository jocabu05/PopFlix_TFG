/**
 * Script para poblar masivamente películas y series desde TMDB
 * Añade contenido variado para tener una app más completa tipo Netflix
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

// Géneros de películas
const MOVIE_GENRES = {
  28: "Action",
  12: "Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  10751: "Family",
  14: "Fantasy",
  36: "History",
  27: "Horror",
  10402: "Music",
  9648: "Mystery",
  10749: "Romance",
  878: "Science Fiction",
  10770: "TV Movie",
  53: "Thriller",
  10752: "War",
  37: "Western",
};

// Géneros de series
const TV_GENRES = {
  10759: "Action & Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  10751: "Family",
  10762: "Kids",
  9648: "Mystery",
  10763: "News",
  10764: "Reality",
  10765: "Sci-Fi & Fantasy",
  10766: "Soap",
  10767: "Talk",
  10768: "War & Politics",
  37: "Western",
};

async function fetchTMDB(endpoint, params = {}) {
  try {
    const response = await axios.get(`${TMDB_BASE_URL}${endpoint}`, {
      params: {
        api_key: TMDB_API_KEY,
        language: "es-ES",
        ...params,
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error.message);
    return null;
  }
}

async function insertMovie(conn, movie) {
  if (!movie.poster_path) return false;
  
  try {
    const [existing] = await conn.query(
      "SELECT id FROM movies WHERE tmdb_id = ?",
      [movie.id]
    );
    
    if (existing.length > 0) return false;

    await conn.query(
      `INSERT INTO movies (tmdb_id, title, description, poster_url, backdrop_url, release_date, rating, popularity)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        movie.id,
        movie.title,
        movie.overview || "Sin descripción disponible",
        `https://image.tmdb.org/t/p/w342${movie.poster_path}`,
        movie.backdrop_path ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}` : null,
        movie.release_date || null,
        movie.vote_average || 0,
        movie.popularity || 0,
      ]
    );

    // Insertar géneros
    if (movie.genre_ids && movie.genre_ids.length > 0) {
      const [[{ movieId }]] = await conn.query(
        "SELECT id as movieId FROM movies WHERE tmdb_id = ?",
        [movie.id]
      );
      
      for (const genreId of movie.genre_ids) {
        const genreName = MOVIE_GENRES[genreId];
        if (genreName) {
          const [genreRow] = await conn.query(
            "SELECT id FROM genres WHERE name = ?",
            [genreName]
          );
          if (genreRow.length > 0) {
            await conn.query(
              "INSERT IGNORE INTO movie_genres (movie_id, genre_id) VALUES (?, ?)",
              [movieId, genreRow[0].id]
            );
          }
        }
      }
    }

    return true;
  } catch (error) {
    if (!error.message.includes("Duplicate")) {
      console.error(`Error inserting movie ${movie.title}:`, error.message);
    }
    return false;
  }
}

async function insertSeries(conn, series) {
  if (!series.poster_path) return false;
  
  try {
    const [existing] = await conn.query(
      "SELECT id FROM series WHERE tmdb_id = ?",
      [series.id]
    );
    
    if (existing.length > 0) return false;

    await conn.query(
      `INSERT INTO series (tmdb_id, title, description, poster_url, backdrop_url, first_air_date, rating, popularity, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        series.id,
        series.name,
        series.overview || "Sin descripción disponible",
        `https://image.tmdb.org/t/p/w342${series.poster_path}`,
        series.backdrop_path ? `https://image.tmdb.org/t/p/w1280${series.backdrop_path}` : null,
        series.first_air_date || null,
        series.vote_average || 0,
        series.popularity || 0,
        "Returning Series",
      ]
    );

    // Insertar géneros
    if (series.genre_ids && series.genre_ids.length > 0) {
      const [[{ seriesId }]] = await conn.query(
        "SELECT id as seriesId FROM series WHERE tmdb_id = ?",
        [series.id]
      );
      
      for (const genreId of series.genre_ids) {
        const genreName = TV_GENRES[genreId] || MOVIE_GENRES[genreId];
        if (genreName) {
          const [genreRow] = await conn.query(
            "SELECT id FROM genres WHERE name = ? OR name LIKE ?",
            [genreName, `%${genreName.split(" ")[0]}%`]
          );
          if (genreRow.length > 0) {
            await conn.query(
              "INSERT IGNORE INTO series_genres (series_id, genre_id) VALUES (?, ?)",
              [seriesId, genreRow[0].id]
            );
          }
        }
      }
    }

    return true;
  } catch (error) {
    if (!error.message.includes("Duplicate")) {
      console.error(`Error inserting series ${series.name}:`, error.message);
    }
    return false;
  }
}

async function populateMovies(conn) {
  console.log("\n🎬 POBLANDO PELÍCULAS...\n");
  let totalAdded = 0;

  // 1. Películas populares (5 páginas = 100 películas)
  console.log("📈 Obteniendo películas populares...");
  for (let page = 1; page <= 5; page++) {
    const data = await fetchTMDB("/movie/popular", { page });
    if (data?.results) {
      for (const movie of data.results) {
        if (await insertMovie(conn, movie)) totalAdded++;
      }
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  console.log(`   ✓ Populares procesadas`);

  // 2. Películas top rated (3 páginas)
  console.log("⭐ Obteniendo películas mejor valoradas...");
  for (let page = 1; page <= 3; page++) {
    const data = await fetchTMDB("/movie/top_rated", { page });
    if (data?.results) {
      for (const movie of data.results) {
        if (await insertMovie(conn, movie)) totalAdded++;
      }
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  console.log(`   ✓ Top rated procesadas`);

  // 3. Películas now playing
  console.log("🎭 Obteniendo películas en cartelera...");
  for (let page = 1; page <= 2; page++) {
    const data = await fetchTMDB("/movie/now_playing", { page });
    if (data?.results) {
      for (const movie of data.results) {
        if (await insertMovie(conn, movie)) totalAdded++;
      }
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  console.log(`   ✓ En cartelera procesadas`);

  // 4. Películas upcoming
  console.log("🔜 Obteniendo próximos estrenos...");
  for (let page = 1; page <= 2; page++) {
    const data = await fetchTMDB("/movie/upcoming", { page });
    if (data?.results) {
      for (const movie of data.results) {
        if (await insertMovie(conn, movie)) totalAdded++;
      }
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  console.log(`   ✓ Próximos estrenos procesados`);

  // 5. Por géneros específicos
  const genresToFetch = [28, 35, 27, 878, 16, 10749, 53, 18]; // Action, Comedy, Horror, Sci-Fi, Animation, Romance, Thriller, Drama
  for (const genreId of genresToFetch) {
    console.log(`🎭 Obteniendo películas de ${MOVIE_GENRES[genreId]}...`);
    for (let page = 1; page <= 2; page++) {
      const data = await fetchTMDB("/discover/movie", {
        page,
        with_genres: genreId,
        sort_by: "popularity.desc",
      });
      if (data?.results) {
        for (const movie of data.results) {
          if (await insertMovie(conn, movie)) totalAdded++;
        }
      }
      await new Promise((r) => setTimeout(r, 250));
    }
  }
  console.log(`   ✓ Por géneros procesadas`);

  console.log(`\n✅ Total películas nuevas añadidas: ${totalAdded}`);
  return totalAdded;
}

async function populateSeries(conn) {
  console.log("\n📺 POBLANDO SERIES...\n");
  let totalAdded = 0;

  // 1. Series populares (5 páginas)
  console.log("📈 Obteniendo series populares...");
  for (let page = 1; page <= 5; page++) {
    const data = await fetchTMDB("/tv/popular", { page });
    if (data?.results) {
      for (const series of data.results) {
        if (await insertSeries(conn, series)) totalAdded++;
      }
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  console.log(`   ✓ Populares procesadas`);

  // 2. Series top rated (3 páginas)
  console.log("⭐ Obteniendo series mejor valoradas...");
  for (let page = 1; page <= 3; page++) {
    const data = await fetchTMDB("/tv/top_rated", { page });
    if (data?.results) {
      for (const series of data.results) {
        if (await insertSeries(conn, series)) totalAdded++;
      }
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  console.log(`   ✓ Top rated procesadas`);

  // 3. Series on the air
  console.log("📡 Obteniendo series en emisión...");
  for (let page = 1; page <= 2; page++) {
    const data = await fetchTMDB("/tv/on_the_air", { page });
    if (data?.results) {
      for (const series of data.results) {
        if (await insertSeries(conn, series)) totalAdded++;
      }
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  console.log(`   ✓ En emisión procesadas`);

  // 4. Series airing today
  console.log("📆 Obteniendo series de hoy...");
  const data = await fetchTMDB("/tv/airing_today");
  if (data?.results) {
    for (const series of data.results) {
      if (await insertSeries(conn, series)) totalAdded++;
    }
  }
  console.log(`   ✓ De hoy procesadas`);

  // 5. Por géneros específicos
  const genresToFetch = [10759, 35, 18, 10765, 16, 80, 9648]; // Action, Comedy, Drama, Sci-Fi, Animation, Crime, Mystery
  for (const genreId of genresToFetch) {
    const genreName = TV_GENRES[genreId] || "Género";
    console.log(`🎭 Obteniendo series de ${genreName}...`);
    for (let page = 1; page <= 2; page++) {
      const data = await fetchTMDB("/discover/tv", {
        page,
        with_genres: genreId,
        sort_by: "popularity.desc",
      });
      if (data?.results) {
        for (const series of data.results) {
          if (await insertSeries(conn, series)) totalAdded++;
        }
      }
      await new Promise((r) => setTimeout(r, 250));
    }
  }
  console.log(`   ✓ Por géneros procesadas`);

  console.log(`\n✅ Total series nuevas añadidas: ${totalAdded}`);
  return totalAdded;
}

async function ensureGenres(conn) {
  console.log("🏷️  Asegurando géneros en la BD...");
  
  const allGenres = [
    "Action", "Adventure", "Animation", "Comedy", "Crime", "Documentary",
    "Drama", "Family", "Fantasy", "History", "Horror", "Music", "Mystery",
    "Romance", "Science Fiction", "Thriller", "War", "Western",
    "Action & Adventure", "Kids", "Reality", "Sci-Fi & Fantasy", "Soap", "Talk"
  ];

  for (const genre of allGenres) {
    await conn.query(
      "INSERT IGNORE INTO genres (name) VALUES (?)",
      [genre]
    );
  }
  console.log("   ✓ Géneros asegurados");
}

async function main() {
  console.log("═".repeat(50));
  console.log("🚀 POBLADOR MASIVO DE CONTENIDO TMDB");
  console.log("═".repeat(50));

  const conn = await mysql.createConnection(DB_CONFIG);

  try {
    // Asegurar géneros
    await ensureGenres(conn);

    // Poblar películas
    const moviesAdded = await populateMovies(conn);

    // Poblar series
    const seriesAdded = await populateSeries(conn);

    // Estadísticas finales
    const [[{ totalMovies }]] = await conn.query("SELECT COUNT(*) as totalMovies FROM movies");
    const [[{ totalSeries }]] = await conn.query("SELECT COUNT(*) as totalSeries FROM series");

    console.log("\n" + "═".repeat(50));
    console.log("📊 RESUMEN FINAL");
    console.log("═".repeat(50));
    console.log(`   Películas añadidas: ${moviesAdded}`);
    console.log(`   Series añadidas: ${seriesAdded}`);
    console.log(`   Total películas en BD: ${totalMovies}`);
    console.log(`   Total series en BD: ${totalSeries}`);
    console.log("═".repeat(50));

  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await conn.end();
  }
}

main();
