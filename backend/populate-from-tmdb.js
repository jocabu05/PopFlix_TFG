const mysql = require('mysql2/promise');
const axios = require('axios');
const { getWatchProviders, TMDB_TO_PLATFORM_MAP } = require('./tmdb-service');

const TMDB_API_KEY = 'f864a2cf4abc8eb393336cfe36d0c42e';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

async function getMoviesFromTMDB() {
  const movies = [];
  const movieIds = new Set();

  try {
    console.log('📥 Obteniendo películas de múltiples fuentes TMDB...\n');

    // Trending
    console.log('   🔥 Trending...');
    const trending = await axios.get(`${TMDB_BASE_URL}/trending/movie/week`, {
      params: {
        api_key: TMDB_API_KEY,
        language: 'es-ES'
      }
    });
    trending.data.results.forEach(m => {
      if (!movieIds.has(m.id)) {
        movieIds.add(m.id);
        movies.push(m);
      }
    });

    // Top Rated
    console.log('   ⭐ Top Rated...');
    const topRated = await axios.get(`${TMDB_BASE_URL}/movie/top_rated`, {
      params: {
        api_key: TMDB_API_KEY,
        language: 'es-ES',
        page: 1
      }
    });
    topRated.data.results.forEach(m => {
      if (!movieIds.has(m.id)) {
        movieIds.add(m.id);
        movies.push(m);
      }
    });

    // Popular
    console.log('   🎬 Popular...');
    const popular = await axios.get(`${TMDB_BASE_URL}/movie/popular`, {
      params: {
        api_key: TMDB_API_KEY,
        language: 'es-ES',
        page: 1
      }
    });
    popular.data.results.forEach(m => {
      if (!movieIds.has(m.id)) {
        movieIds.add(m.id);
        movies.push(m);
      }
    });

    // Géneros populares
    const genres = [35, 28, 18]; // Comedy, Action, Drama
    for (const genreId of genres) {
      console.log(`   🎭 Género ${genreId}...`);
      const genreMovies = await axios.get(`${TMDB_BASE_URL}/discover/movie`, {
        params: {
          api_key: TMDB_API_KEY,
          language: 'es-ES',
          with_genres: genreId,
          sort_by: 'popularity.desc',
          page: 1
        }
      });
      genreMovies.data.results.forEach(m => {
        if (!movieIds.has(m.id)) {
          movieIds.add(m.id);
          movies.push(m);
        }
      });
    }

    console.log(`\n✅ Se obtuvieron ${movies.length} películas únicas\n`);
    return movies;
  } catch (error) {
    console.error('❌ Error obteniendo películas:', error.message);
    return [];
  }
}

async function populateMoviesWithProviders() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '1234',
    database: 'popflix'
  });

  try {
    console.log('🗑️  Limpiando tablas...');
    await connection.query('DELETE FROM movies_platforms');
    await connection.query('DELETE FROM movies');

    console.log('📥 Obteniendo películas de TMDB...');
    const trendingMovies = await getMoviesFromTMDB();
    
    if (trendingMovies.length === 0) {
      console.error('❌ No se obtuvieron películas de TMDB');
      process.exit(1);
    }

    console.log(`✅ Se obtuvieron ${trendingMovies.length} películas`);

    console.log('📝 Insertando películas en BD...');
    let insertedCount = 0;
    for (const movie of trendingMovies) {
      try {
        await connection.query(
          'INSERT INTO movies (tmdb_id, title, description, release_date, rating, popularity) VALUES (?, ?, ?, ?, ?, ?)',
          [
            movie.id,  // TMDB ID correcto
            movie.title,
            movie.overview || 'Sin descripción',
            movie.release_date || null,
            movie.vote_average || 0,
            movie.popularity || 0
          ]
        );
        insertedCount++;
      } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          console.log(`⚠️  Película ${movie.title} ya existe, saltando...`);
        } else {
          console.error(`❌ Error insertando ${movie.title}:`, err.message);
        }
      }
    }

    console.log(`✅ Insertadas ${insertedCount} películas`);

    console.log('📺 Obteniendo watch/providers para cada película...');
    let platformCount = 0;
    let withProvidersCount = 0;

    for (let i = 0; i < trendingMovies.length; i++) {
      const movie = trendingMovies[i];
      try {
        process.stdout.write(`\r   [${i + 1}/${trendingMovies.length}] Procesando: ${movie.title.substring(0, 40)}...`);
        
        const providers = await getWatchProviders(movie.id);
        
        if (providers.length > 0) {
          withProvidersCount++;
          
          for (const tmdbProviderId of providers) {
            const platformId = TMDB_TO_PLATFORM_MAP[tmdbProviderId];
            
            if (platformId) {
              try {
                // Obtener movie_id local
                const [result] = await connection.query(
                  'SELECT id FROM movies WHERE tmdb_id = ?',
                  [movie.id]
                );
                
                if (result.length > 0) {
                  const localMovieId = result[0].id;
                  
                  await connection.query(
                    'INSERT IGNORE INTO movies_platforms (movie_id, platform_id) VALUES (?, ?)',
                    [localMovieId, platformId]
                  );
                  platformCount++;
                }
              } catch (err) {
                // Silenciar errores de duplicados
              }
            }
          }
        }
        
        // Rate limiting: esperar 0.2s entre requests a TMDB
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (error) {
        console.error(`\n❌ Error procesando ${movie.title}:`, error.message);
      }
    }

    console.log(`\n\n✅ Asignadas ${platformCount} películas a plataformas`);
    console.log(`✅ ${withProvidersCount}/${insertedCount} películas tienen datos de plataformas`);

    // Estadísticas finales
    const [moviesCount] = await connection.query('SELECT COUNT(*) as count FROM movies');
    const [platformsCount] = await connection.query('SELECT COUNT(*) as count FROM movies_platforms');
    
    console.log(`\n📊 Estado final:`);
    console.log(`   ✅ Total películas: ${moviesCount[0].count}`);
    console.log(`   ✅ Total asignaciones: ${platformsCount[0].count}`);

    // Mostrar distribución por plataforma
    const [distribution] = await connection.query(`
      SELECT p.name, COUNT(mp.movie_id) as count
      FROM platforms p
      LEFT JOIN movies_platforms mp ON p.id = mp.platform_id
      WHERE p.id IN (1, 2, 3, 4)
      GROUP BY p.id, p.name
      ORDER BY count DESC
    `);

    console.log(`\n🎬 Distribución por plataforma:`);
    distribution.forEach(row => {
      console.log(`   • ${row.name}: ${row.count} películas`);
    });

    console.log('\n✨ ¡Base de datos poblada exitosamente!');

  } catch (error) {
    console.error('❌ Error fatal:', error.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

populateMoviesWithProviders();
