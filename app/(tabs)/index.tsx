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

const API_URL = "http://192.168.68.103:9999";
const BG_DARK = "#0F0F0F";
const BG_ACCENT = "#1A1A1A";
const NEON_RED = "#B20710";
const TEXT_LIGHT = "#FFFFFF";
const TEXT_MUTED = "#B0B0B0";

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
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([]);
  const [genreMovies, setGenreMovies] = useState<Movie[]>([]);
  const [ranking, setRanking] = useState<RankingMovie[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<{ name: string; id: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMovie, setSelectedMovie] = useState<MovieDetail | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [searching, setSearching] = useState(false);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Cargar películas trending
      const trendingRes = await fetch(`${API_URL}/api/movies/trending`);
      const trendingData = await trendingRes.json();
      setTrendingMovies(trendingData.movies || []);

      // Cargar ranking semanal (top 3 trending)
      const rankingRes = await fetch(`${API_URL}/api/weekly-ranking/${user?.id || "1"}`);
      const rankingData = await rankingRes.json();
      setRanking(rankingData.ranking || []);

      // Cargar películas del primer género por defecto
      if (genres.length > 0) {
        const genreRes = await fetch(`${API_URL}/api/movies/genre/${genres[0].name}`);
        const genreData = await genreRes.json();
        setGenreMovies(genreData.movies || []);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);

    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      setSearching(true);
      const res = await fetch(`${API_URL}/api/movies/search/${query}`);
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
      return;
    }

    setSelectedGenre(genreObj);

    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/movies/genre/${genreObj.name}`);
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
          return NEON_RED;
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
              color={NEON_RED}
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
          color={NEON_RED}
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
              color={NEON_RED}
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
                color={NEON_RED}
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
                  color={NEON_RED}
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
                    color={NEON_RED}
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
        <ActivityIndicator size="large" color={NEON_RED} />
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

        {/* Carrusel de tendencia */}
        <TrendingCarousel />

        {/* Top 3 Semanal */}
        {!searchQuery && ranking.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Top Valoradas</Text>
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

        {/* Géneros */}
        {!searchQuery && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Explorar por Género</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.genreScroll}
            >
              {genres.map((genre) => (
                <TouchableOpacity
                  key={genre.name}
                  style={[
                    styles.genreChip,
                    selectedGenre?.id === genre.id && styles.genreChipActive,
                  ]}
                  onPress={() => handleGenreFilter(genre)}
                >
                  <Text
                    style={[
                      styles.genreChipText,
                      selectedGenre?.id === genre.id && styles.genreChipTextActive,
                    ]}
                  >
                    {genre.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Grid de películas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {searchQuery.length > 1 ? "Resultados de búsqueda" : "Recomendadas"}
          </Text>

          {searching && (
            <ActivityIndicator
              size="small"
              color={NEON_RED}
              style={styles.loadingSpinner}
            />
          )}

          {displayMovies.length > 0 ? (
            <View style={styles.movieGrid}>
              {displayMovies.map((movie) => (
                <MovieCard 
                  key={movie.id} 
                  movie={movie}
                  onPress={() => handleMoviePress(movie)}
                />
              ))}
            </View>
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
  },
  heroBanner: {
    width: screenWidth,
    height: 400,
    position: "relative",
    marginBottom: 24,
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
    height: 150,
    backgroundColor: BG_DARK,
    opacity: 0.9,
  },
  heroContent: {
    position: "absolute",
    bottom: 16,
    left: 16,
    right: 16,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: TEXT_LIGHT,
    marginBottom: 8,
  },
  heroGenre: {
    fontSize: 14,
    color: TEXT_MUTED,
    marginBottom: 12,
  },
  heroMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  heroRating: {
    fontSize: 14,
    color: NEON_RED,
    fontWeight: "bold",
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
    backgroundColor: NEON_RED,
    paddingVertical: 10,
    borderRadius: 6,
  },
  heroPlayText: {
    fontSize: 14,
    fontWeight: "bold",
    color: TEXT_LIGHT,
  },
  heroInfoButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 6,
  },
  trendingScroll: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  trendingCard: {
    marginRight: 12,
    width: 180,
    borderRadius: 8,
    overflow: "hidden",
  },
  trendingImage: {
    width: "100%",
    height: 240,
    backgroundColor: BG_ACCENT,
  },
  trendingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  trendingInfo: {
    padding: 12,
    backgroundColor: BG_ACCENT,
  },
  trendingTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: TEXT_LIGHT,
    marginBottom: 6,
  },
  trendingMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  trendingRating: {
    fontSize: 12,
    color: NEON_RED,
    fontWeight: "bold",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 24,
    paddingHorizontal: 12,
    backgroundColor: BG_ACCENT,
    borderRadius: 8,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: TEXT_LIGHT,
    fontSize: 14,
  },
  section: {
    marginBottom: 28,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: TEXT_LIGHT,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: TEXT_MUTED,
    marginBottom: 12,
    fontWeight: "400",
  },
  rankingScroll: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  rankingCard: {
    marginRight: 16,
    alignItems: "center",
    width: 130,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: BG_ACCENT,
  },
  medalContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    alignItems: "center",
    zIndex: 10,
  },
  medalText: {
    fontSize: 28,
  },
  positionText: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#000",
  },
  rankingPoster: {
    width: "100%",
    height: 160,
    backgroundColor: BG_ACCENT,
    marginTop: 32,
  },
  rankingInfo: {
    width: "100%",
    paddingHorizontal: 8,
    paddingVertical: 8,
    backgroundColor: BG_DARK,
  },
  rankingTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: TEXT_LIGHT,
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingText: {
    fontSize: 11,
    color: NEON_RED,
    fontWeight: "bold",
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
    backgroundColor: BG_ACCENT,
    borderWidth: 1,
    borderColor: "transparent",
  },
  genreChipActive: {
    backgroundColor: NEON_RED,
    borderColor: NEON_RED,
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
    width: "48%",
    marginBottom: 16,
    borderRadius: 8,
    overflow: "hidden",
  },
  moviePoster: {
    width: "100%",
    height: 200,
    backgroundColor: BG_ACCENT,
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
    marginTop: 8,
    fontWeight: "600",
  },
  loadingSpinner: {
    marginVertical: 16,
  },
  noResults: {
    fontSize: 14,
    color: TEXT_MUTED,
    textAlign: "center",
    marginVertical: 32,
  },
  tasksSection: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    marginTop: 20,
    backgroundColor: BG_ACCENT,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.1)",
  },
  tasksSectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: TEXT_LIGHT,
    marginBottom: 12,
  },
  tasksList: {
    gap: 8,
  },
  taskItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    opacity: 0.8,
  },
  taskPending: {
    opacity: 0.6,
  },
  taskCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    backgroundColor: "#4CAF50",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  taskCheckboxPending: {
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  taskCheckmark: {
    color: TEXT_LIGHT,
    fontWeight: "bold",
    fontSize: 12,
  },
  taskDot: {
    color: TEXT_MUTED,
    fontSize: 16,
  },
  taskText: {
    fontSize: 13,
    color: TEXT_LIGHT,
    flex: 1,
  },
});
