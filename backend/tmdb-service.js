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

module.exports = {
  getTrendingMovies,
  getMoviesByGenre,
  searchMovies,
  getMovieDetails,
  GENRE_IDS,
};
