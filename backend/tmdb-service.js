const axios = require("axios");

const TMDB_API_KEY = "f864a2cf4abc8eb393336cfe36d0c42e";
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

// Mapeo de plataformas a géneros TMDB
const GENRE_IDS = {
  Drama: 18,
  Action: 28,
  Comedy: 35,
  Thriller: 53,
  Romance: 10749,
  Horror: 27,
  ScienceFiction: 878,
  Animation: 16,
};

// Función para obtener películas trending
async function getTrendingMovies() {
  try {
    const response = await axios.get(`${TMDB_BASE_URL}/trending/movie/week`, {
      params: {
        api_key: TMDB_API_KEY,
        language: "es-ES",
      },
    });

    return response.data.results.map((movie) => ({
      id: movie.id,
      tmdb_id: movie.id,
      title: movie.title,
      description: movie.overview,
      poster_url: `https://image.tmdb.org/t/p/w342${movie.poster_path}`,
      backdrop_url: `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`,
      rating: parseFloat(movie.vote_average.toFixed(1)),
      popularity: movie.popularity,
      release_date: movie.release_date,
      genre_ids: movie.genre_ids,
    }));
  } catch (error) {
    console.error("Error fetching trending:", error.message);
    return [];
  }
}

// Función para obtener películas por género
async function getMoviesByGenre(genreId) {
  try {
    const response = await axios.get(
      `${TMDB_BASE_URL}/discover/movie`,
      {
        params: {
          api_key: TMDB_API_KEY,
          with_genres: genreId,
          sort_by: "popularity.desc",
          language: "es-ES",
          page: 1,
        },
      }
    );

    return response.data.results.map((movie) => ({
      id: movie.id,
      tmdb_id: movie.id,
      title: movie.title,
      description: movie.overview,
      poster_url: `https://image.tmdb.org/t/p/w342${movie.poster_path}`,
      backdrop_url: `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`,
      rating: parseFloat(movie.vote_average.toFixed(1)),
      popularity: movie.popularity,
      release_date: movie.release_date,
      genre_ids: movie.genre_ids,
    }));
  } catch (error) {
    console.error("Error fetching by genre:", error.message);
    return [];
  }
}

// Función para buscar películas
async function searchMovies(query) {
  try {
    const response = await axios.get(
      `${TMDB_BASE_URL}/search/movie`,
      {
        params: {
          api_key: TMDB_API_KEY,
          query,
          language: "es-ES",
          page: 1,
        },
      }
    );

    return response.data.results.map((movie) => ({
      id: movie.id,
      tmdb_id: movie.id,
      title: movie.title,
      description: movie.overview,
      poster_url: `https://image.tmdb.org/t/p/w342${movie.poster_path}`,
      backdrop_url: `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`,
      rating: parseFloat(movie.vote_average.toFixed(1)),
      popularity: movie.popularity,
      release_date: movie.release_date,
      genre_ids: movie.genre_ids,
    }));
  } catch (error) {
    console.error("Error searching movies:", error.message);
    return [];
  }
}

// Función para obtener detalles de película
async function getMovieDetails(movieId) {
  try {
    const response = await axios.get(
      `${TMDB_BASE_URL}/movie/${movieId}`,
      {
        params: {
          api_key: TMDB_API_KEY,
          language: "es-ES",
        },
      }
    );

    const movie = response.data;
    return {
      id: movie.id,
      title: movie.title,
      description: movie.overview,
      poster_url: `https://image.tmdb.org/t/p/w342${movie.poster_path}`,
      backdrop_url: `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`,
      rating: parseFloat(movie.vote_average.toFixed(1)),
      runtime: movie.runtime,
      release_date: movie.release_date,
      genres: movie.genres.map((g) => g.name),
      budget: movie.budget,
      revenue: movie.revenue,
      tagline: movie.tagline,
    };
  } catch (error) {
    console.error("Error fetching movie details:", error.message);
    return null;
  }
}

// Función para obtener reseñas reales de TMDB
async function getMovieReviews(movieId) {
  try {
    const response = await axios.get(
      `${TMDB_BASE_URL}/movie/${movieId}/reviews`,
      {
        params: {
          api_key: TMDB_API_KEY,
          language: "es-ES",
        },
      }
    );

    return response.data.results.map((review) => ({
      id: review.id,
      author: review.author,
      rating: review.author_details?.rating || null,
      content: review.content,
      date: new Date(review.created_at).toLocaleDateString("es-ES"),
      url: review.url,
      source: "tmdb",
    }));
  } catch (error) {
    console.error("Error fetching movie reviews:", error.message);
    return [];
  }
}

// Reseñas ficticias realistas de usuarios
function getFictionalReviews() {
  const fictionalReviews = [
    {
      id: "fict_1",
      author: "María García",
      rating: 9,
      content: "Película excelente, muy bien dirigida. Los actores fueron increíbles y la trama te mantiene en suspenso de principio a fin. Definitivamente la volvería a ver.",
      date: "Hace 3 días",
      source: "user",
    },
    {
      id: "fict_2",
      author: "Carlos López",
      rating: 8,
      content: "Muy buena. La cinematografía es hermosa y la música es perfecta. Solo le faltan algunas escenas más de acción, pero en general es recomendable.",
      date: "Hace 1 semana",
      source: "user",
    },
    {
      id: "fict_3",
      author: "Ana Rodríguez",
      rating: 7,
      content: "Está bien, pero no es lo mejor que he visto. La primera mitad es lenta, pero la segunda parte mejora bastante. Vale la pena verla.",
      date: "Hace 2 semanas",
      source: "user",
    },
    {
      id: "fict_4",
      author: "Juan Martínez",
      rating: 9,
      content: "¡Masterpiece! No me esperaba que fuera tan buena. Los giros en la trama son impresionantes. Totalmente recomendada.",
      date: "Hace 1 mes",
      source: "user",
    },
    {
      id: "fict_5",
      author: "Sofia Chen",
      rating: 8,
      content: "Sorprendente. Pensé que sería una típica película más, pero tiene originalidad. Los personajes están bien desarrollados.",
      date: "Hace 2 meses",
      source: "user",
    },
  ];

  // Retornar 2-3 reseñas aleatorias para variar
  const shuffled = fictionalReviews.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.floor(Math.random() * 2) + 2);
}

// Función para obtener watch/providers (dónde ver la película)
async function getWatchProviders(movieId) {
  try {
    const response = await axios.get(
      `${TMDB_BASE_URL}/movie/${movieId}/watch/providers`,
      {
        params: {
          api_key: TMDB_API_KEY,
        },
      }
    );

    // Obtener datos de España (ES)
    const esData = response.data.results?.ES;
    
    if (!esData) {
      return [];
    }

    // Retornar los provider IDs disponibles
    const providers = [];
    
    if (esData.flatrate) {
      // Streaming providers (Netflix, HBO, Prime, Disney+, etc.)
      providers.push(...esData.flatrate.map(p => p.provider_id));
    }
    
    if (esData.rent) {
      // Rental providers
      providers.push(...esData.rent.map(p => p.provider_id));
    }
    
    if (esData.buy) {
      // Purchase providers
      providers.push(...esData.buy.map(p => p.provider_id));
    }

    return [...new Set(providers)]; // Remover duplicados
  } catch (error) {
    console.error(`Error fetching watch providers for movie ${movieId}:`, error.message);
    return [];
  }
}

// Mapeo de TMDB provider IDs a nuestros platform IDs
// TMDB IDs: Netflix=8, Prime=1, Disney+=337, HBO=3, Apple TV+=2, etc.
const TMDB_TO_PLATFORM_MAP = {
  8: 1,      // Netflix -> platform_id 1
  1: 2,      // Prime Video -> platform_id 2
  337: 3,    // Disney+ -> platform_id 3
  3: 4,      // HBO -> platform_id 4
  2: 7,      // Apple TV+ -> platform_id 7
  119: 5,    // Hulu -> platform_id 5
  62: 6,     // Paramount+ -> platform_id 6
};

module.exports = {
  getTrendingMovies,
  getMoviesByGenre,
  searchMovies,
  getMovieDetails,
  getMovieReviews,
  getFictionalReviews,
  getWatchProviders,
  TMDB_TO_PLATFORM_MAP,
  GENRE_IDS,
};
