import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuthContext } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from "react-native";

const API_URL = "http://192.168.68.103:9999";
const BG_DARK = "#0F0F0F";
const BG_ACCENT = "#1A1A1A";
const NEON_RED = "#B20710";
const TEXT_LIGHT = "#FFFFFF";
const TEXT_MUTED = "#B0B0B0";

interface Movie {
  id: number;
  title: string;
  description: string;
  poster_url: string;
  rating: number;
  genre: string;
  platform: string;
}

interface RankingMovie extends Movie {
  position: number;
  medal: string;
}

export default function HomeScreen() {
  const { user } = useAuthContext();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [ranking, setRanking] = useState<RankingMovie[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);

  const genres = ["Drama", "Action", "Comedy", "Thriller", "Romance"];

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);

      // Cargar películas
      const moviesRes = await fetch(`${API_URL}/api/movies/${user.id}`);
      const moviesData = await moviesRes.json();
      setMovies(moviesData.movies || []);

      // Cargar ranking semanal
      const rankingRes = await fetch(`${API_URL}/api/weekly-ranking/${user.id}`);
      const rankingData = await rankingRes.json();
      setRanking(rankingData.ranking || []);
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

    if (!user?.id) return;

    try {
      setSearching(true);
      const res = await fetch(`${API_URL}/api/movies/search/${user.id}/${query}`);
      const data = await res.json();
      setSearchResults(data.results || []);
    } catch (error) {
      console.error("Error searching:", error);
    } finally {
      setSearching(false);
    }
  };

  const handleGenreFilter = async (genre: string) => {
    if (selectedGenre === genre) {
      setSelectedGenre(null);
      return;
    }

    setSelectedGenre(genre);
    if (!user?.id) return;

    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/movies/genre/${user.id}/${genre}`);
      const data = await res.json();
      setMovies(data.movies || []);
    } catch (error) {
      console.error("Error loading genre:", error);
    } finally {
      setLoading(false);
    }
  };

  const displayMovies =
    searchQuery.length > 1 && searchResults.length > 0
      ? searchResults
      : movies;

  const RankingCard = ({ movie }: { movie: RankingMovie }) => (
    <TouchableOpacity style={styles.rankingCard}>
      <View style={styles.medalContainer}>
        <Text style={styles.medalText}>{movie.medal}</Text>
        <Text style={styles.positionText}>{movie.position}</Text>
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
            size={16}
            color={NEON_RED}
          />
          <Text style={styles.ratingText}>{movie.rating}</Text>
        </View>
        <Text style={styles.genreText}>{movie.genre}</Text>
      </View>
    </TouchableOpacity>
  );

  const MovieCard = ({ movie }: { movie: Movie }) => (
    <TouchableOpacity style={styles.movieCard}>
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

  if (loading && movies.length === 0) {
    return (
      <View style={[styles.container, { justifyContent: "center" }]}>
        <ActivityIndicator size="large" color={NEON_RED} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.greeting}>
          Bienvenido, {user?.name || "Usuario"}!
        </Text>
      </View>

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

      {/* Top 3 Semanal */}
      {!searchQuery && ranking.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏆 Top 3 Esta Semana</Text>
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
          <Text style={styles.sectionTitle}>Géneros</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.genreScroll}
          >
            {genres.map((genre) => (
              <TouchableOpacity
                key={genre}
                style={[
                  styles.genreChip,
                  selectedGenre === genre && styles.genreChipActive,
                ]}
                onPress={() => handleGenreFilter(genre)}
              >
                <Text
                  style={[
                    styles.genreChipText,
                    selectedGenre === genre && styles.genreChipTextActive,
                  ]}
                >
                  {genre}
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
              <MovieCard key={movie.id} movie={movie} />
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG_DARK,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 16,
  },
  greeting: {
    fontSize: 24,
    fontWeight: "bold",
    color: TEXT_LIGHT,
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
    marginBottom: 12,
  },
  rankingScroll: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  rankingCard: {
    marginRight: 12,
    alignItems: "center",
    width: 140,
  },
  medalContainer: {
    position: "absolute",
    top: 8,
    left: 8,
    alignItems: "center",
    zIndex: 10,
  },
  medalText: {
    fontSize: 32,
  },
  positionText: {
    fontSize: 12,
    fontWeight: "bold",
    color: NEON_RED,
  },
  rankingPoster: {
    width: 100,
    height: 150,
    borderRadius: 8,
    backgroundColor: BG_ACCENT,
  },
  rankingInfo: {
    width: "100%",
    marginTop: 8,
  },
  rankingTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: TEXT_LIGHT,
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  ratingText: {
    fontSize: 12,
    color: NEON_RED,
    marginLeft: 4,
    fontWeight: "bold",
  },
  genreText: {
    fontSize: 11,
    color: TEXT_MUTED,
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
});
