/**
 * Script para verificar y actualizar posters rotos desde TMDB
 */

const axios = require("axios");
const mysql = require("mysql2/promise");

const TMDB_API_KEY = "f864a2cf4abc8eb393336cfe36d0c42e";
const DB_CONFIG = {
  host: "localhost",
  user: "root",
  password: "1234",
  database: "popflix",
};

async function checkUrl(url) {
  try {
    const response = await axios.head(url, { timeout: 5000 });
    return response.status === 200;
  } catch {
    return false;
  }
}

async function getNewPoster(tmdbId, type) {
  try {
    const endpoint = type === 'movie' ? 'movie' : 'tv';
    const response = await axios.get(
      `https://api.themoviedb.org/3/${endpoint}/${tmdbId}?api_key=${TMDB_API_KEY}&language=es-ES`
    );
    if (response.data.poster_path) {
      return `https://image.tmdb.org/t/p/w342${response.data.poster_path}`;
    }
    return null;
  } catch {
    return null;
  }
}

async function main() {
  console.log("🔍 VERIFICANDO Y ACTUALIZANDO POSTERS ROTOS...\n");
  const conn = await mysql.createConnection(DB_CONFIG);
  
  let fixedMovies = 0, fixedSeries = 0;
  let deletedMovies = 0, deletedSeries = 0;

  // Verificar PELÍCULAS
  console.log("🎬 Verificando películas...");
  const [movies] = await conn.query("SELECT id, tmdb_id, title, poster_url FROM movies");
  
  for (let i = 0; i < movies.length; i++) {
    const movie = movies[i];
    if (i % 50 === 0) process.stdout.write(`\r   Progreso: ${i}/${movies.length}`);
    
    const isValid = await checkUrl(movie.poster_url);
    if (!isValid) {
      const newPoster = await getNewPoster(movie.tmdb_id, 'movie');
      if (newPoster) {
        await conn.query("UPDATE movies SET poster_url = ? WHERE id = ?", [newPoster, movie.id]);
        fixedMovies++;
      } else {
        // Eliminar si no tiene poster válido
        await conn.query("DELETE FROM movie_genres WHERE movie_id = ?", [movie.id]);
        await conn.query("DELETE FROM movies WHERE id = ?", [movie.id]);
        deletedMovies++;
      }
    }
    await new Promise(r => setTimeout(r, 100)); // Rate limit
  }
  console.log(`\r   ✅ Películas: ${fixedMovies} arregladas, ${deletedMovies} eliminadas`);

  // Verificar SERIES
  console.log("📺 Verificando series...");
  const [series] = await conn.query("SELECT id, tmdb_id, title, poster_url FROM series");
  
  for (let i = 0; i < series.length; i++) {
    const serie = series[i];
    if (i % 50 === 0) process.stdout.write(`\r   Progreso: ${i}/${series.length}`);
    
    const isValid = await checkUrl(serie.poster_url);
    if (!isValid) {
      const newPoster = await getNewPoster(serie.tmdb_id, 'tv');
      if (newPoster) {
        await conn.query("UPDATE series SET poster_url = ? WHERE id = ?", [newPoster, serie.id]);
        fixedSeries++;
      } else {
        // Eliminar si no tiene poster válido
        await conn.query("DELETE FROM series_genres WHERE series_id = ?", [serie.id]);
        await conn.query("DELETE FROM series WHERE id = ?", [serie.id]);
        deletedSeries++;
      }
    }
    await new Promise(r => setTimeout(r, 100)); // Rate limit
  }
  console.log(`\r   ✅ Series: ${fixedSeries} arregladas, ${deletedSeries} eliminadas`);

  // Estadísticas finales
  const [[{ totalMovies }]] = await conn.query("SELECT COUNT(*) as totalMovies FROM movies");
  const [[{ totalSeries }]] = await conn.query("SELECT COUNT(*) as totalSeries FROM series");

  console.log("\n" + "═".repeat(50));
  console.log("📊 RESUMEN:");
  console.log(`   Películas arregladas: ${fixedMovies}`);
  console.log(`   Películas eliminadas: ${deletedMovies}`);
  console.log(`   Series arregladas: ${fixedSeries}`);
  console.log(`   Series eliminadas: ${deletedSeries}`);
  console.log(`   TOTAL ACTUAL: ${totalMovies} películas, ${totalSeries} series`);
  console.log("═".repeat(50));

  await conn.end();
}

main();
