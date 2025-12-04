import MovieModal, { MovieDetail } from "@/components/MovieModal";
import { useAuthContext } from "@/context/AuthContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

const API_URL = "http://172.20.10.2:9999";
const BG_DARK = "#0d1b2a";
const BG_CARD = "#1a2f45";
const GRADIENT_BLUE = "#0f3460";
const GRADIENT_PURPLE = "#533483";
const ACCENT_CYAN = "#00d9ff";
const ACCENT_LIME = "#39ff14";
const ACCENT_PINK = "#ff006e";
const ACCENT_ORANGE = "#ff6b35";
const TEXT_LIGHT = "#ffffff";
const TEXT_MUTED = "#b0b9c1";

const { width: screenWidth } = Dimensions.get("window");

interface Movie {
  id: number;
  title: string;
  description: string;
  poster_url: string;
  rating: number;
  popularity: number;
  release_date?: string;
  genre_ids?: number[];
}

interface RankingMovie extends Movie {
  position: number;
  medal: string;
}

const genres = [
  { name: "Drama", id: 18 },
  { name: "Action", id: 28 },
  { name: "Comedy", id: 35 },
  { name: "Thriller", id: 53 },
  { name: "Romance", id: 10749 },
  { name: "Horror", id: 27 },
];

export default function HomeScreen() {
  const { user } = useAuthContext();
  const [contentType, setContentType] = useState<"movies" | "series">("movies");
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([]);
  const [genreMovies, setGenreMovies] = useState<Movie[]>([]);
  const [platformMovies, setPlatformMovies] = useState<Movie[]>([]);
  const [ranking, setRanking] = useState<RankingMovie[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<{ name: string; id: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMovie, setSelectedMovie] = useState<MovieDetail | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [searching, setSearching] = useState(false);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  
  // Pagination states
  const [trendingPage, setTrendingPage] = useState(1);
  const [genrePage, setGenrePage] = useState(1);
  const [platformPage, setPlatformPage] = useState(1);
  const [searchPage, setSearchPage] = useState(1);

  useEffect(() => {
    loadData();
  }, [user]);

  const fetchWithTimeout = (url: string, timeout = 8000) => {
    return Promise.race([
      fetch(url),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Timeout")), timeout)
      ),
    ]);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      console.log("🔄 Iniciando carga de datos...");

      // Cargar MÁS películas trending (sin límite)
      let allTrending = [];
      try {
        for (let page = 1; page <= 5; page++) {
          const trendingRes = await fetchWithTimeout(`${API_URL}/api/movies/trending?page=${page}`, 8000);
          const trendingData = await trendingRes.json();
          allTrending = [...allTrending, ...(trendingData.movies || [])];
        }
        setTrendingMovies(allTrending);
        console.log("🎬 Total trending:", allTrending.length);
      } catch (trendingError) {
        console.error("❌ Error cargando trending:", trendingError);
      }

      // Cargar ranking semanal (top 3 trending)
      try {
        const rankingRes = await fetchWithTimeout(`${API_URL}/api/weekly-ranking/${user?.id || "1"}`, 8000);
        const rankingData = await rankingRes.json();
        setRanking(rankingData.ranking || []);
        console.log("🏆 Ranking:", rankingData.ranking?.length || 0);
      } catch (rankingError) {
        console.error("❌ Error cargando ranking:", rankingError);
      }

      // Cargar películas del primer género (MÁS)
      if (genres.length > 0) {
        try {
          let allGenre = [];
          for (let page = 1; page <= 3; page++) {
            const genreRes = await fetchWithTimeout(`${API_URL}/api/movies/genre/${genres[0].name}?page=${page}`, 8000);
            const genreData = await genreRes.json();
            allGenre = [...allGenre, ...(genreData.movies || [])];
          }
          setGenreMovies(allGenre);
          console.log("🎭 Género:", allGenre.length);
        } catch (genreError) {
          console.error("❌ Error cargando género:", genreError);
        }
      }

      // Cargar películas por plataformas (MÁS)
      if (user?.id) {
        try {
          let allPlatform = [];
          for (let page = 1; page <= 3; page++) {
            const platformRes = await fetchWithTimeout(`${API_URL}/api/movies/user/${user.id}/by-platforms?page=${page}`, 8000);
            const platformData = await platformRes.json();
            allPlatform = [...allPlatform, ...(platformData.movies || [])];
          }
          setPlatformMovies(allPlatform);
          console.log("📱 Plataformas:", allPlatform.length);
        } catch (platformError) {
          console.error("❌ Error cargando películas por plataformas:", platformError);
        }
      }
      console.log("✅ Datos cargados");
    } catch (error) {
      console.error("❌ Error en loadData:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    setSearchPage(1); // Reset page on new search

    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      setSearching(true);
      const res = await fetch(`${API_URL}/api/movies/search/${query}?page=1`);
      const data = await res.json();
      setSearchResults(data.movies || []);
    } catch (error) {
      console.error("Error searching:", error);
    } finally {
      setSearching(false);
    }
  };

  const handleGenreFilter = async (genreObj: { name: string; id: number }) => {
    if (selectedGenre?.id === genreObj.id) {
      setSelectedGenre(null);
      setGenreMovies([]);
      setGenrePage(1);
      return;
    }

    setSelectedGenre(genreObj);
    setGenrePage(1); // Reset page when changing genre

    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/movies/genre/${genreObj.name}?page=1`);
      const data = await res.json();
      setGenreMovies(data.movies || []);
    } catch (error) {
      console.error("Error loading genre:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMoviePress = (movie: Movie) => {
    setSelectedMovie({
      ...movie,
      duration: "2h 30m",
      year: 2023,
    });
    setModalVisible(true);
  };

  const handleMovieSelect = (movie: Movie) => {
    handleMoviePress(movie);
  };

  const toggleFavorite = (movie: Movie) => {
    handleAddToFavorites(movie.id);
  };

  const handleAddToFavorites = (movieId: number) => {
    const newFavorites = new Set(favorites);
    const isFavorite = newFavorites.has(movieId);
    
    if (isFavorite) {
      newFavorites.delete(movieId);
      // Opcional: Llamar al backend para eliminar
      // fetch(`${API_URL}/api/favorites/${user?.id}/${movieId}`, {
      //   method: 'DELETE',
      // }).catch(err => console.error("Error removing favorite:", err));
    } else {
      newFavorites.add(movieId);
      // Opcional: Llamar al backend para guardar
      // fetch(`${API_URL}/api/favorites/${user?.id}`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ movieId })
      // }).catch(err => console.error("Error adding favorite:", err));
    }
    setFavorites(newFavorites);
  };

  const loadMoreTrending = async () => {
    try {
      const nextPage = trendingPage + 1;
      const res = await fetch(`${API_URL}/api/movies/trending?page=${nextPage}`);
      const data = await res.json();
      setTrendingMovies([...trendingMovies, ...(data.movies || [])]);
      setTrendingPage(nextPage);
    } catch (error) {
      console.error("Error loading more trending movies:", error);
    }
  };

  const loadMoreGenre = async () => {
    if (!selectedGenre) return;
    try {
      const nextPage = genrePage + 1;
      const res = await fetch(`${API_URL}/api/movies/genre/${selectedGenre.name}?page=${nextPage}`);
      const data = await res.json();
      setGenreMovies([...genreMovies, ...(data.movies || [])]);
      setGenrePage(nextPage);
    } catch (error) {
      console.error("Error loading more genre movies:", error);
    }
  };

  const loadMoreSearch = async () => {
    try {
      const nextPage = searchPage + 1;
      const res = await fetch(`${API_URL}/api/movies/search/${searchQuery}?page=${nextPage}`);
      const data = await res.json();
      setSearchResults([...searchResults, ...(data.movies || [])]);
      setSearchPage(nextPage);
    } catch (error) {
      console.error("Error loading more search results:", error);
    }
  };

  const displayMovies =
    searchQuery.length > 1 && searchResults.length > 0
      ? searchResults
      : selectedGenre
      ? genreMovies
      : trendingMovies;

  const RankingCard = ({ movie }: { movie: RankingMovie }) => {
    const getBorderColor = () => {
      switch (movie.position) {
        case 1:
          return "#FFD700"; // Oro
        case 2:
          return "#C0C0C0"; // Plata
        case 3:
          return "#CD7F32"; // Bronce
        default:
          return ACCENT_PINK;
      }
    };

    return (
      <TouchableOpacity 
        style={[styles.rankingCard, { borderColor: getBorderColor(), borderWidth: 3 }]}
        onPress={() => handleMoviePress(movie)}
      >
      <View style={styles.medalContainer}>
          <Text style={styles.medalText}>{movie.medal}</Text>
        </View>

        <Image
          source={{ uri: movie.poster_url }}
          style={styles.rankingPoster}
        />

        <View style={styles.rankingInfo}>
          <Text style={styles.rankingTitle} numberOfLines={2}>
            {movie.title}
          </Text>
          <View style={styles.ratingContainer}>
            <MaterialCommunityIcons
              name="star"
              size={14}
              color={ACCENT_PINK}
            />
            <Text style={styles.ratingText}>{movie.rating}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const MovieCard = ({ movie, onPress }: { movie: Movie; onPress: () => void }) => (
    <TouchableOpacity style={styles.movieCard} onPress={onPress}>
      <Image
        source={{ uri: movie.poster_url }}
        style={styles.moviePoster}
      />
      <View style={styles.movieOverlay}>
        <MaterialCommunityIcons
          name="play-circle"
          size={48}
          color={ACCENT_PINK}
        />
      </View>
      <Text style={styles.movieTitle} numberOfLines={2}>
        {movie.title}
      </Text>
    </TouchableOpacity>
  );

  const HeroBanner = () => {
    const heroMovie = trendingMovies[0];
    if (!heroMovie) return null;

    return (
      <TouchableOpacity 
        style={styles.heroBanner}
        onPress={() => handleMoviePress(heroMovie)}
        activeOpacity={0.9}
      >
        <Image
          source={{ uri: heroMovie.poster_url }}
          style={styles.heroBannerImage}
        />
        <View style={styles.heroGradient} />
        <View style={styles.heroContent}>
          <Text style={styles.heroTitle} numberOfLines={2}>
            {heroMovie.title}
          </Text>
          <View style={styles.heroMeta}>
            <MaterialCommunityIcons
              name="star"
              size={16}
              color={ACCENT_PINK}
            />
            <Text style={styles.heroRating}>{heroMovie.rating}</Text>
            <Text style={styles.heroDivider}>•</Text>
            <Text style={styles.heroYear}>{heroMovie.release_date?.split('-')[0]}</Text>
          </View>
          <View style={styles.heroButtons}>
            <TouchableOpacity style={styles.heroPlayButton}>
              <MaterialCommunityIcons
                name="play"
                size={20}
                color={TEXT_LIGHT}
                style={{ marginRight: 8 }}
              />
              <Text style={styles.heroPlayText}>Reproducir</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.heroInfoButton}>
              <MaterialCommunityIcons
                name="information"
                size={20}
                color={ACCENT_PINK}
              />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const TrendingCarousel = () => {
    const carouselMovies = trendingMovies.slice(1, 6);
    if (carouselMovies.length === 0) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tendencias</Text>
        <Text style={styles.sectionSubtitle}>Lo más visto esta semana</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.trendingScroll}
          snapToAlignment="start"
          snapToInterval={200}
        >
          {carouselMovies.map((movie) => (
            <TouchableOpacity
              key={movie.id}
              style={styles.trendingCard}
              onPress={() => handleMoviePress(movie)}
            >
              <Image
                source={{ uri: movie.poster_url }}
                style={styles.trendingImage}
              />
              <View style={styles.trendingOverlay}>
                <MaterialCommunityIcons
                  name="play-circle"
                  size={40}
                  color={ACCENT_PINK}
                />
              </View>
              <View style={styles.trendingInfo}>
                <Text style={styles.trendingTitle} numberOfLines={1}>
                  {movie.title}
                </Text>
                <View style={styles.trendingMeta}>
                  <MaterialCommunityIcons
                    name="star"
                    size={12}
                    color={ACCENT_PINK}
                  />
                  <Text style={styles.trendingRating}>{movie.rating}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  if (loading && trendingMovies.length === 0) {
    return (
      <View style={[styles.container, { justifyContent: "center" }]}>
        <ActivityIndicator size="large" color={ACCENT_PINK} />
      </View>
    );
  }

  return (
    <>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Hero Banner */}
        <HeroBanner />

        {/* Barra de búsqueda */}
        <View style={styles.searchContainer}>
          <MaterialCommunityIcons
            name="magnify"
            size={20}
            color={TEXT_MUTED}
            style={styles.searchIcon}
          />
          <TextInput
            placeholder="Buscar películas..."
            placeholderTextColor={TEXT_MUTED}
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={handleSearch}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setSearchQuery("");
                setSearchResults([]);
              }}
            >
              <MaterialCommunityIcons
                name="close"
                size={20}
                color={TEXT_MUTED}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Toggle Películas / Series */}
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[styles.toggleBtn, contentType === "movies" && styles.toggleBtnActive]}
            onPress={() => setContentType("movies")}
          >
            <Text style={[styles.toggleText, contentType === "movies" && styles.toggleTextActive]}>
              MOVIES
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, contentType === "series" && styles.toggleBtnActive]}
            onPress={() => setContentType("series")}
          >
            <Text style={[styles.toggleText, contentType === "series" && styles.toggleTextActive]}>
              SERIES
            </Text>
          </TouchableOpacity>
        </View>

        {/* Carrusel de tendencia */}
        <TrendingCarousel />

        {/* Top 3 Semanal */}
        {!searchQuery && ranking.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ranking Semanal</Text>
            <Text style={styles.sectionSubtitle}>Las más bien puntuadas</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.rankingScroll}
            >
              {ranking.map((movie) => (
                <RankingCard key={movie.id} movie={movie} />
              ))}
            </ScrollView>
          </View>
        )}

        {/* Películas en tus plataformas */}
        {!searchQuery && platformMovies.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>En tus plataformas</Text>
            <Text style={styles.sectionSubtitle}>Disponibles para ti</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.carouselContainer}
            >
              {platformMovies.map((movie) => (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  onPress={() => handleMovieSelect(movie)}
                  isFavorite={favorites.has(movie.id)}
                  onFavoritePress={() => toggleFavorite(movie)}
                />
              ))}
            </ScrollView>
          </View>
        )}

        {/* Géneros - Slider */}
        {!searchQuery && (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Explorar por Género</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.carouselContainer}
              >
                {genres.map((genre) => (
                  <TouchableOpacity
                    key={genre.name}
                    style={[
                      styles.genreSliderCard,
                      selectedGenre?.id === genre.id && styles.genreSliderCardActive,
                    ]}
                    onPress={() => handleGenreFilter(genre)}
                  >
                    <Text
                      style={[
                        styles.genreSliderText,
                        selectedGenre?.id === genre.id && styles.genreSliderTextActive,
                      ]}
                    >
                      {genre.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Películas del género seleccionado */}
            {selectedGenre && genreMovies.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>{selectedGenre.name}</Text>
                <Text style={styles.sectionSubtitle}>Películas destacadas</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.carouselContainer}
                >
                  {genreMovies.map((movie) => (
                    <MovieCard
                      key={movie.id}
                      movie={movie}
                      onPress={() => handleMovieSelect(movie)}
                      isFavorite={favorites.has(movie.id)}
                      onFavoritePress={() => toggleFavorite(movie)}
                    />
                  ))}
                </ScrollView>
              </View>
            )}
          </>
        )}

        {/* Slider de películas recomendadas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {searchQuery.length > 1 ? "Resultados de búsqueda" : "Recomendadas"}
          </Text>

          {searching && (
            <ActivityIndicator
              size="small"
              color={ACCENT_PINK}
              style={styles.loadingSpinner}
            />
          )}

          {displayMovies.length > 0 ? (
            <>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.carouselContainer}
              >
                {displayMovies.map((movie) => (
                  <MovieCard 
                    key={movie.id} 
                    movie={movie}
                    onPress={() => handleMoviePress(movie)}
                  />
                ))}
              </ScrollView>
            </>
          ) : (
            <Text style={styles.noResults}>
              {searchQuery.length > 1
                ? "No se encontraron películas"
                : "No hay películas disponibles"}
            </Text>
          )}
        </View>

        {/* Espaciador */}
        <View style={{ height: 40 }} />

        {/* Barra de Tareas Pendientes */}
        <View style={styles.tasksSection}>
          <Text style={styles.tasksSectionTitle}>Tareas Pendientes</Text>
          <View style={styles.tasksList}>
            <View style={styles.taskItem}>
              <View style={styles.taskCheckbox}>
                <Text style={styles.taskCheckmark}>✓</Text>
              </View>
              <Text style={styles.taskText}>Integración de TMDB API</Text>
            </View>
            <View style={styles.taskItem}>
              <View style={styles.taskCheckbox}>
                <Text style={styles.taskCheckmark}>✓</Text>
              </View>
              <Text style={styles.taskText}>Sistema de géneros</Text>
            </View>
            <View style={styles.taskItem}>
              <View style={styles.taskCheckbox}>
                <Text style={styles.taskCheckmark}>✓</Text>
              </View>
              <Text style={styles.taskText}>Búsqueda de películas</Text>
            </View>
            <View style={[styles.taskItem, styles.taskPending]}>
              <View style={[styles.taskCheckbox, styles.taskCheckboxPending]}>
                <Text style={styles.taskDot}>•</Text>
              </View>
              <Text style={styles.taskText}>Reseñas de películas</Text>
            </View>
            <View style={[styles.taskItem, styles.taskPending]}>
              <View style={[styles.taskCheckbox, styles.taskCheckboxPending]}>
                <Text style={styles.taskDot}>•</Text>
              </View>
              <Text style={styles.taskText}>Mi Lista (Favoritos)</Text>
            </View>
            <View style={[styles.taskItem, styles.taskPending]}>
              <View style={[styles.taskCheckbox, styles.taskCheckboxPending]}>
                <Text style={styles.taskDot}>•</Text>
              </View>
              <Text style={styles.taskText}>Historial de visualización</Text>
            </View>
            <View style={[styles.taskItem, styles.taskPending]}>
              <View style={[styles.taskCheckbox, styles.taskCheckboxPending]}>
                <Text style={styles.taskDot}>•</Text>
              </View>
              <Text style={styles.taskText}>Trailers de películas</Text>
            </View>
            <View style={[styles.taskItem, styles.taskPending]}>
              <View style={[styles.taskCheckbox, styles.taskCheckboxPending]}>
                <Text style={styles.taskDot}>•</Text>
              </View>
              <Text style={styles.taskText}>Recomendaciones personalizadas</Text>
            </View>
          </View>
        </View>

        <View style={{ height: 80 }} />
      </ScrollView>

      {/* Modal de detalles */}
      <MovieModal
        visible={modalVisible}
        movie={selectedMovie}
        onClose={() => setModalVisible(false)}
        onAddToFavorites={handleAddToFavorites}
        isFavorite={selectedMovie ? favorites.has(selectedMovie.id) : false}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG_DARK,
    backgroundImage: `linear-gradient(135deg, ${BG_DARK} 0%, ${GRADIENT_PURPLE} 100%)`,
  },
  heroBanner: {
    width: screenWidth,
    height: 500,
    position: "relative",
    marginBottom: 32,
    borderRadius: 24,
    overflow: "hidden",
    marginHorizontal: 8,
    marginTop: 8,
    shadowColor: ACCENT_PINK,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 12,
  },
  heroBannerImage: {
    width: "100%",
    height: "100%",
  },
  heroGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 200,
    backgroundImage: "linear-gradient(to top, rgba(10,14,39,0.95), transparent)",
  },
  heroContent: {
    position: "absolute",
    bottom: 20,
    left: 16,
    right: 16,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: "800",
    color: TEXT_LIGHT,
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  heroGenre: {
    fontSize: 14,
    color: TEXT_MUTED,
    marginBottom: 12,
  },
  heroMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 8,
  },
  heroRating: {
    fontSize: 16,
    color: ACCENT_PINK,
    fontWeight: "700",
  },
  heroDivider: {
    color: TEXT_MUTED,
    fontSize: 14,
  },
  heroYear: {
    fontSize: 14,
    color: TEXT_MUTED,
  },
  heroButtons: {
    flexDirection: "row",
    gap: 12,
  },
  heroPlayButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: ACCENT_PINK,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: ACCENT_PINK,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 10,
  },
  heroPlayText: {
    fontSize: 15,
    fontWeight: "700",
    color: TEXT_LIGHT,
  },
  heroInfoButton: {
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: ACCENT_CYAN,
    borderRadius: 10,
    shadowColor: ACCENT_CYAN,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  trendingScroll: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  trendingCard: {
    marginRight: 16,
    width: 180,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: BG_CARD,
    borderWidth: 1,
    borderColor: "rgba(0, 228, 255, 0.3)",
    shadowColor: ACCENT_CYAN,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  trendingImage: {
    width: "100%",
    height: 270,
    backgroundColor: BG_CARD,
  },
  trendingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
    opacity: 0,
  },
  trendingInfo: {
    padding: 14,
    backgroundColor: "rgba(15, 21, 53, 0.8)",
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 228, 255, 0.2)",
  },
  trendingTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: TEXT_LIGHT,
    marginBottom: 6,
  },
  trendingMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  trendingRating: {
    fontSize: 13,
    color: ACCENT_PINK,
    fontWeight: "700",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 28,
    paddingHorizontal: 14,
    backgroundColor: "rgba(15, 21, 53, 0.7)",
    borderRadius: 14,
    height: 52,
    borderWidth: 1.5,
    borderColor: "rgba(0, 228, 255, 0.4)",
    shadowColor: ACCENT_CYAN,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: TEXT_LIGHT,
    fontSize: 15,
    fontWeight: "500",
  },
  section: {
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: TEXT_LIGHT,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: TEXT_MUTED,
    marginBottom: 16,
    fontWeight: "500",
  },
  rankingScroll: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  rankingCard: {
    marginRight: 16,
    alignItems: "center",
    width: 140,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: BG_CARD,
    borderWidth: 2,
    shadowColor: GRADIENT_PURPLE,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 10,
  },
  medalContainer: {
    position: "absolute",
    top: 8,
    left: 8,
    zIndex: 10,
    backgroundColor: "rgba(0,0,0,0.7)",
    borderRadius: 8,
    padding: 6,
  },
  medalText: {
    fontSize: 32,
  },
  positionText: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#000",
  },
  rankingPoster: {
    width: "100%",
    height: 190,
    backgroundColor: BG_CARD,
    marginTop: 36,
  },
  rankingInfo: {
    width: "100%",
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: "rgba(10, 14, 39, 0.9)",
    borderTopWidth: 1,
    borderTopColor: "rgba(179, 68, 255, 0.3)",
  },
  rankingTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: TEXT_LIGHT,
    marginBottom: 6,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    color: ACCENT_PINK,
    fontWeight: "700",
  },
  genreScroll: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  genreChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: BG_CARD,
    borderWidth: 1,
    borderColor: "transparent",
  },
  genreChipActive: {
    backgroundColor: ACCENT_PINK,
    borderColor: ACCENT_PINK,
  },
  genreChipText: {
    color: TEXT_MUTED,
    fontSize: 12,
    fontWeight: "600",
  },
  genreChipTextActive: {
    color: TEXT_LIGHT,
  },
  movieGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  movieCard: {
    width: 150,
    marginRight: 14,
    marginBottom: 16,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: BG_CARD,
    borderWidth: 1,
    borderColor: "rgba(255, 42, 109, 0.2)",
    shadowColor: ACCENT_PINK,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  moviePoster: {
    width: "100%",
    height: 220,
    backgroundColor: BG_CARD,
  },
  movieOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  movieTitle: {
    fontSize: 12,
    color: TEXT_LIGHT,
    padding: 10,
    fontWeight: "600",
    height: 50,
  },
  loadingSpinner: {
    marginVertical: 16,
  },
  noResults: {
    fontSize: 15,
    color: TEXT_MUTED,
    textAlign: "center",
    marginVertical: 32,
    fontWeight: "500",
  },
  tasksSection: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    marginTop: 20,
    backgroundColor: "rgba(15, 21, 53, 0.5)",
    borderTopWidth: 1.5,
    borderTopColor: "rgba(0, 228, 255, 0.3)",
  },
  tasksSectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: TEXT_LIGHT,
    marginBottom: 14,
  },
  tasksList: {
    gap: 10,
  },
  taskItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    opacity: 0.9,
  },
  taskPending: {
    opacity: 0.6,
  },
  taskCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: "#4CAF50",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    shadowColor: "#4CAF50",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  taskCheckboxPending: {
    backgroundColor: "rgba(255,255,255,0.15)",
    shadowColor: "transparent",
  },
  taskCheckmark: {
    color: TEXT_LIGHT,
    fontWeight: "bold",
    fontSize: 13,
  },
  taskDot: {
    color: TEXT_MUTED,
    fontSize: 16,
  },
  taskText: {
    fontSize: 14,
    color: TEXT_LIGHT,
    flex: 1,
    fontWeight: "500",
  },
  loadMoreButton: {
    marginTop: 20,
    paddingVertical: 14,
    paddingHorizontal: 24,
    backgroundColor: ACCENT_PINK,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: ACCENT_PINK,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  loadMoreButtonText: {
    fontSize: 15,
    color: TEXT_LIGHT,
    fontWeight: "700",
  },
  toggleContainer: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginVertical: 18,
    gap: 12,
    backgroundColor: "rgba(15, 21, 53, 0.6)",
    borderRadius: 14,
    padding: 6,
    borderWidth: 1,
    borderColor: "rgba(0, 228, 255, 0.2)",
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: "center",
    backgroundColor: "transparent",
  },
  toggleBtnActive: {
    backgroundColor: ACCENT_PINK,
    shadowColor: ACCENT_PINK,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: "700",
    color: TEXT_MUTED,
  },
  toggleTextActive: {
    color: TEXT_LIGHT,
  },
  genreSliderCard: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    marginRight: 12,
    borderRadius: 14,
    backgroundColor: "rgba(15, 21, 53, 0.5)",
    borderWidth: 2,
    borderColor: "rgba(0, 228, 255, 0.3)",
    justifyContent: "center",
    shadowColor: ACCENT_CYAN,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  genreSliderCardActive: {
    backgroundColor: ACCENT_PINK,
    borderColor: ACCENT_PINK,
    shadowColor: ACCENT_PINK,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  genreSliderText: {
    fontSize: 15,
    fontWeight: "700",
    color: TEXT_MUTED,
  },
  genreSliderTextActive: {
    color: TEXT_LIGHT,
  },
  carouselContainer: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
});

