import MovieModal, { MovieDetail } from "@/components/MovieModal";
import { useAuthContext } from "@/context/AuthContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    Image,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
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

// Iconos de plataformas para mini badges
// Logos locales de las plataformas
const PLATFORM_LOGOS: Record<string, any> = {
  "Netflix": require("../../assets/logos/logo-netflix.png"),
  "Prime Video": require("../../assets/logos/prime-logo.png"),
  "Disney+": require("../../assets/logos/disney-logo.jpg"),
  "HBO Max": require("../../assets/logos/hbo-logo.png"),
  "Hulu": require("../../assets/logos/hulu-logo.jpg"),
  "Paramount+": require("../../assets/logos/paramount-logo.png"),
  "Apple TV+": require("../../assets/logos/appleTv-logo.png"),
};

interface Movie {
  id: number;
  title: string;
  description: string;
  poster_url: string;
  backdrop_url?: string;
  rating: number;
  popularity: number;
  release_date?: string;
  genre_ids?: number[];
  genre?: string;
  platforms?: { id: number; name: string; color: string }[];
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
  
  // NUEVAS SECCIONES NETFLIX
  const [topRatedMovies, setTopRatedMovies] = useState<Movie[]>([]);
  const [actionMovies, setActionMovies] = useState<Movie[]>([]);
  const [comedyMovies, setComedyMovies] = useState<Movie[]>([]);
  const [horrorMovies, setHorrorMovies] = useState<Movie[]>([]);
  const [scifiMovies, setScifiMovies] = useState<Movie[]>([]);
  const [animationMovies, setAnimationMovies] = useState<Movie[]>([]);
  
  // Estado para explorar todo el catálogo
  const [showFullCatalog, setShowFullCatalog] = useState(false);
  const [catalogMovies, setCatalogMovies] = useState<Movie[]>([]);
  const [catalogPage, setCatalogPage] = useState(1);
  const [loadingCatalog, setLoadingCatalog] = useState(false);
  const [hasMoreCatalog, setHasMoreCatalog] = useState(true);
  
  // Pagination states
  const [trendingPage, setTrendingPage] = useState(1);
  const [genrePage, setGenrePage] = useState(1);
  const [platformPage, setPlatformPage] = useState(1);
  const [searchPage, setSearchPage] = useState(1);
  
  // Loading more states
  const [loadingMoreTrending, setLoadingMoreTrending] = useState(false);
  const [loadingMoreGenre, setLoadingMoreGenre] = useState(false);
  const [loadingMorePlatform, setLoadingMorePlatform] = useState(false);
  const [loadingMoreSearch, setLoadingMoreSearch] = useState(false);
  
  // Pull to refresh
  const [refreshing, setRefreshing] = useState(false);
  
  // Hero movie aleatorio (se selecciona al cargar)
  const [heroMovieIndex, setHeroMovieIndex] = useState(0);
  
  // Animaciones
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  
  // Placeholder para posters rotos
  const PLACEHOLDER_POSTER = "https://via.placeholder.com/342x513/1a2f45/ffffff?text=No+Image";
  
  // Función para obtener página aleatoria (para variedad cada vez que se entra)
  const getRandomPage = (maxPages: number) => Math.floor(Math.random() * maxPages) + 1;
  
  // Helper para formatear rating de forma segura
  const formatRating = (rating: any): string => {
    if (rating === undefined || rating === null) return 'N/A';
    const num = Number(rating);
    return !isNaN(num) ? num.toFixed(1) : 'N/A';
  };

  useEffect(() => {
    loadData();
  }, [user]);

  useEffect(() => {
    // Reload data when contentType changes
    loadData();
  }, [contentType]);

  // Animación de entrada cuando se cargan los datos
  useEffect(() => {
    if (!loading && trendingMovies.length > 0) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [loading, trendingMovies.length]);

  // Pull to refresh handler
  const onRefresh = async () => {
    setRefreshing(true);
    fadeAnim.setValue(0);
    slideAnim.setValue(50);
    await loadData();
    setRefreshing(false);
  };

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
      console.log("🔄 Iniciando carga de datos...", contentType);
      
      // Reset pagination
      setTrendingPage(1);
      setGenrePage(1);
      setPlatformPage(1);
      setSelectedGenre(null);
      setSearchResults([]);

      const baseEndpoint = contentType === "series" ? "/api/series" : "/api/movies";
      
      // Páginas aleatorias para variedad cada vez que se entra
      const trendingPage = getRandomPage(contentType === 'movies' ? 20 : 15);
      const topRatedPage = getRandomPage(contentType === 'movies' ? 15 : 10);

      // CARGA EN PARALELO - Páginas ALEATORIAS para variedad
      const promises = [
        // Trending (página aleatoria)
        fetchWithTimeout(`${API_URL}${baseEndpoint}/trending?page=${trendingPage}`, 5000)
          .then(res => (res as Response).json())
          .catch(() => ({ movies: [], series: [] })),
        // Ranking (solo películas)
        contentType === "movies" 
          ? fetchWithTimeout(`${API_URL}/api/weekly-ranking/${user?.id || "1"}`, 5000)
              .then(res => (res as Response).json())
              .catch(() => ({ ranking: [] }))
          : Promise.resolve({ ranking: [] }),
        // Top Rated (página aleatoria diferente)
        fetchWithTimeout(`${API_URL}${baseEndpoint}/top-rated?page=${topRatedPage}`, 5000)
          .then(res => (res as Response).json())
          .catch(() => ({ movies: [], series: [] })),
      ];

      const [trendingData, rankingData, topRatedData] = await Promise.all(promises);
      
      // Setear datos principales inmediatamente
      const trendingList = trendingData.movies || trendingData.series || [];
      setTrendingMovies(trendingList);
      setRanking(rankingData.ranking || []);
      setTopRatedMovies(topRatedData.movies || topRatedData.series || []);
      
      // Seleccionar un hero aleatorio entre los que tienen backdrop
      const withBackdrop = trendingList.filter((m: Movie) => m.backdrop_url);
      if (withBackdrop.length > 0) {
        setHeroMovieIndex(Math.floor(Math.random() * withBackdrop.length));
      }
      
      console.log("🎬 Trending:", trendingList.length);
      console.log("🏆 Ranking:", rankingData.ranking?.length || 0);
      console.log("⭐ Top Rated:", (topRatedData.movies || topRatedData.series || []).length);

      // Quitar loading principal para mostrar contenido rápido
      setLoading(false);

      // CARGAR GÉNEROS EN BACKGROUND (sin bloquear UI)
      loadGenresInBackground(baseEndpoint);
      
      console.log("✅ Datos principales cargados");
    } catch (error) {
      console.error("❌ Error en loadData:", error);
      setLoading(false);
    }
  };

  // Cargar géneros en background para no bloquear la UI
  const loadGenresInBackground = async (baseEndpoint: string) => {
    if (contentType === "movies") {
      // Películas: Cargar géneros con páginas ALEATORIAS para variedad
      const genrePromises = [
        fetchWithTimeout(`${API_URL}${baseEndpoint}/action?page=${getRandomPage(10)}`, 6000)
          .then(res => (res as Response).json()).catch(() => ({ movies: [] })),
        fetchWithTimeout(`${API_URL}${baseEndpoint}/comedy?page=${getRandomPage(10)}`, 6000)
          .then(res => (res as Response).json()).catch(() => ({ movies: [] })),
        fetchWithTimeout(`${API_URL}${baseEndpoint}/horror?page=${getRandomPage(6)}`, 6000)
          .then(res => (res as Response).json()).catch(() => ({ movies: [] })),
        fetchWithTimeout(`${API_URL}${baseEndpoint}/scifi?page=${getRandomPage(6)}`, 6000)
          .then(res => (res as Response).json()).catch(() => ({ movies: [] })),
        fetchWithTimeout(`${API_URL}${baseEndpoint}/animation?page=${getRandomPage(7)}`, 6000)
          .then(res => (res as Response).json()).catch(() => ({ movies: [] })),
      ];

      const [action, comedy, horror, scifi, animation] = await Promise.all(genrePromises);
      
      setActionMovies(action.movies || []);
      setComedyMovies(comedy.movies || []);
      setHorrorMovies(horror.movies || []);
      setScifiMovies(scifi.movies || []);
      setAnimationMovies(animation.movies || []);
      
      console.log("💥 Géneros cargados en background");
    } else {
      // Series: Drama, Crime, Comedy, Animation
      const seriesPromises = [
        fetchWithTimeout(`${API_URL}${baseEndpoint}/drama?page=1`, 6000)
          .then(res => (res as Response).json()).catch(() => ({ series: [] })),
        fetchWithTimeout(`${API_URL}${baseEndpoint}/crime?page=1`, 6000)
          .then(res => (res as Response).json()).catch(() => ({ series: [] })),
        fetchWithTimeout(`${API_URL}${baseEndpoint}/comedy?page=1`, 6000)
          .then(res => (res as Response).json()).catch(() => ({ series: [] })),
        fetchWithTimeout(`${API_URL}${baseEndpoint}/animation?page=1`, 6000)
          .then(res => (res as Response).json()).catch(() => ({ series: [] })),
      ];

      const [drama, crime, comedy, animation] = await Promise.all(seriesPromises);
      
      setActionMovies(drama.series || []);
      setComedyMovies(crime.series || []);
      setHorrorMovies(comedy.series || []);
      setScifiMovies(animation.series || []);
      setAnimationMovies([]);
      
      console.log("📺 Géneros series cargados en background");
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
      const endpoint = contentType === "series" ? "/api/series/search" : "/api/movies/search";
      const res = await fetch(`${API_URL}${endpoint}/${query}?page=1`);
      const data = await res.json();
      setSearchResults(data.movies || data.series || []);
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
      const endpoint = contentType === "series" ? "/api/series/genre" : "/api/movies/genre";
      const res = await fetch(`${API_URL}${endpoint}/${genreObj.name}?page=1`);
      const data = await res.json();
      setGenreMovies(data.movies || data.series || []);
    } catch (error) {
      console.error("Error loading genre:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMoviePress = async (movie: Movie) => {
    // Mostrar modal inmediatamente con datos básicos
    const year = movie.release_date ? new Date(movie.release_date).getFullYear() : undefined;
    setSelectedMovie({
      ...movie,
      genre: movie.genre || 'Película',
      platform: movie.platforms?.[0]?.name || 'Streaming',
      platforms: movie.platforms?.map(p => p.name) || [],
      duration: "2h 30m",
      year,
    });
    setModalVisible(true);
    
    // Cargar plataformas en background si no las tiene
    if (!movie.platforms || movie.platforms.length === 0) {
      try {
        const endpoint = contentType === 'series' ? 'series' : 'movies';
        const res = await fetch(`${API_URL}/api/${endpoint}/${movie.id}/platforms`);
        const data = await res.json();
        if (data.platforms && data.platforms.length > 0) {
          setSelectedMovie(prev => prev ? {
            ...prev,
            platform: data.platforms[0].name,
            platforms: data.platforms.map((p: any) => p.name),
          } : null);
        }
      } catch (e) {
        // Silently fail
      }
    }
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
    if (loadingMoreTrending) return;
    try {
      setLoadingMoreTrending(true);
      const nextPage = trendingPage + 1;
      const endpoint = contentType === "series" ? "/api/series/trending" : "/api/movies/trending";
      const res = await fetch(`${API_URL}${endpoint}?page=${nextPage}`);
      const data = await res.json();
      const newMovies = data.movies || data.series || [];
      // Evitar duplicados
      const existingIds = new Set(trendingMovies.map(m => m.id));
      const uniqueNew = newMovies.filter((m: Movie) => !existingIds.has(m.id));
      if (uniqueNew.length > 0) {
        setTrendingMovies([...trendingMovies, ...uniqueNew]);
        setTrendingPage(nextPage);
      }
    } catch (error) {
      console.error("Error loading more trending:", error);
    } finally {
      setLoadingMoreTrending(false);
    }
  };

  const loadMoreGenre = async () => {
    if (!selectedGenre || loadingMoreGenre) return;
    try {
      setLoadingMoreGenre(true);
      const nextPage = genrePage + 1;
      const endpoint = contentType === "series" ? "/api/series/genre" : "/api/movies/genre";
      const res = await fetch(`${API_URL}${endpoint}/${selectedGenre.name}?page=${nextPage}`);
      const data = await res.json();
      const newMovies = data.movies || data.series || [];
      // Evitar duplicados
      const existingIds = new Set(genreMovies.map(m => m.id));
      const uniqueNew = newMovies.filter((m: Movie) => !existingIds.has(m.id));
      if (uniqueNew.length > 0) {
        setGenreMovies([...genreMovies, ...uniqueNew]);
        setGenrePage(nextPage);
      }
    } catch (error) {
      console.error("Error loading more genre:", error);
    } finally {
      setLoadingMoreGenre(false);
    }
  };

  const loadMorePlatform = async () => {
    if (!user?.id || loadingMorePlatform) return;
    try {
      setLoadingMorePlatform(true);
      const nextPage = platformPage + 1;
      const endpoint = contentType === "series" ? "/api/series/user" : "/api/movies/user";
      const res = await fetch(`${API_URL}${endpoint}/${user.id}/by-platforms?page=${nextPage}`);
      const data = await res.json();
      const newMovies = data.movies || data.series || [];
      // Evitar duplicados
      const existingIds = new Set(platformMovies.map(m => m.id));
      const uniqueNew = newMovies.filter((m: Movie) => !existingIds.has(m.id));
      if (uniqueNew.length > 0) {
        setPlatformMovies([...platformMovies, ...uniqueNew]);
        setPlatformPage(nextPage);
      }
    } catch (error) {
      console.error("Error loading more platform:", error);
    } finally {
      setLoadingMorePlatform(false);
    }
  };

  const loadMoreSearch = async () => {
    if (loadingMoreSearch || searchQuery.length < 2) return;
    try {
      setLoadingMoreSearch(true);
      const nextPage = searchPage + 1;
      const endpoint = contentType === "series" ? "/api/series/search" : "/api/movies/search";
      const res = await fetch(`${API_URL}${endpoint}/${searchQuery}?page=${nextPage}`);
      const data = await res.json();
      const newResults = data.movies || data.series || [];
      // Evitar duplicados
      const existingIds = new Set(searchResults.map(m => m.id));
      const uniqueNew = newResults.filter((m: Movie) => !existingIds.has(m.id));
      if (uniqueNew.length > 0) {
        setSearchResults([...searchResults, ...uniqueNew]);
        setSearchPage(nextPage);
      }
    } catch (error) {
      console.error("Error loading more search:", error);
    } finally {
      setLoadingMoreSearch(false);
    }
  };

  // Función para abrir el catálogo completo
  const openFullCatalog = async () => {
    setShowFullCatalog(true);
    setCatalogPage(1);
    setCatalogMovies([]);
    setHasMoreCatalog(true);
    await loadCatalogPage(1);
  };

  // Cargar una página del catálogo
  const loadCatalogPage = async (page: number) => {
    if (loadingCatalog) return;
    try {
      setLoadingCatalog(true);
      const endpoint = contentType === "series" ? "/api/series/trending" : "/api/movies/trending";
      const res = await fetch(`${API_URL}${endpoint}?page=${page}`);
      const data = await res.json();
      const newMovies = data.movies || data.series || [];
      
      if (newMovies.length === 0) {
        setHasMoreCatalog(false);
        return;
      }
      
      if (page === 1) {
        setCatalogMovies(newMovies);
      } else {
        // Evitar duplicados
        const existingIds = new Set(catalogMovies.map(m => m.id));
        const uniqueNew = newMovies.filter((m: Movie) => !existingIds.has(m.id));
        if (uniqueNew.length > 0) {
          setCatalogMovies(prev => [...prev, ...uniqueNew]);
        } else {
          setHasMoreCatalog(false);
        }
      }
      setCatalogPage(page);
    } catch (error) {
      console.error("Error loading catalog:", error);
    } finally {
      setLoadingCatalog(false);
    }
  };

  // Cargar más del catálogo
  const loadMoreCatalog = () => {
    if (!loadingCatalog && hasMoreCatalog) {
      loadCatalogPage(catalogPage + 1);
    }
  };

  // Cerrar catálogo
  const closeFullCatalog = () => {
    setShowFullCatalog(false);
    setCatalogMovies([]);
    setCatalogPage(1);
  };

  const displayMovies =
    searchQuery.length > 1 && searchResults.length > 0
      ? searchResults
      : selectedGenre
      ? genreMovies
      : trendingMovies;

  const RankingCard = ({ movie }: { movie: RankingMovie }) => {
    const [imageError, setImageError] = useState(false);
    const posterUri = imageError || !movie.poster_url ? PLACEHOLDER_POSTER : movie.poster_url;
    
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
          source={{ uri: posterUri }}
          style={styles.rankingPoster}
          onError={() => setImageError(true)}
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
            <Text style={styles.ratingText}>{formatRating(movie.rating)}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Skeleton Loader para carga elegante
  const SkeletonCard = () => {
    const pulseAnim = useRef(new Animated.Value(0.3)).current;
    
    useEffect(() => {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0.3,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }, []);

    return (
      <Animated.View style={[styles.skeletonCard, { opacity: pulseAnim }]}>
        <View style={styles.skeletonPoster} />
        <View style={styles.skeletonTitle} />
        <View style={styles.skeletonMeta} />
      </Animated.View>
    );
  };

  const SkeletonRow = () => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.carouselContainer}>
      {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
    </ScrollView>
  );

  const MovieCard = ({ movie, onPress }: { movie: Movie; onPress: () => void }) => {
    const [attempt, setAttempt] = useState(0);
    const original = movie.poster_url || "";
    const cardAnim = useRef(new Animated.Value(0)).current;
    
    useEffect(() => {
      Animated.timing(cardAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }, []);
    
    // Intentar diferentes tamaños de TMDB
    const getPosterUrl = (att: number) => {
      if (!original || original.includes('placeholder')) return PLACEHOLDER_POSTER;
      const filename = original.split('/').filter(Boolean).pop() || "";
      if (!filename.endsWith('.jpg')) return PLACEHOLDER_POSTER;
      
      switch(att) {
        case 0: return original; // URL original
        case 1: return `https://image.tmdb.org/t/p/w500/${filename}`; // Tamaño mayor
        case 2: return `https://image.tmdb.org/t/p/w185/${filename}`; // Tamaño menor
        default: return PLACEHOLDER_POSTER;
      }
    };
    
    const [currentUri, setCurrentUri] = useState(getPosterUrl(0));
    
    // Obtener plataformas (máximo 3)
    const platforms = movie.platforms?.slice(0, 3) || [];
    
    return (
      <Animated.View style={{ opacity: cardAnim, transform: [{ scale: cardAnim }] }}>
        <TouchableOpacity style={styles.movieCard} onPress={onPress}>
          <Image
            source={{ uri: currentUri }}
            style={styles.moviePoster}
            onError={() => {
              if (attempt < 2) {
                setAttempt(attempt + 1);
                setCurrentUri(getPosterUrl(attempt + 1));
              } else {
                setCurrentUri(PLACEHOLDER_POSTER);
              }
            }}
          />
          
          {/* Badges de plataformas (logos locales) */}
          {platforms.length > 0 && (
            <View style={styles.platformBadgesRow}>
              {platforms.map((platform, idx) => {
                const logo = PLATFORM_LOGOS[platform.name];
                if (!logo) return null;
                return (
                  <View key={idx} style={styles.platformLogoBadge}>
                    <Image
                      source={logo}
                      style={styles.platformLogoMini}
                      resizeMode="contain"
                    />
                  </View>
                );
              })}
            </View>
          )}
          
          {/* Rating badge */}
          <View style={styles.ratingBadge}>
            <MaterialCommunityIcons name="star" size={10} color="#FFD700" />
            <Text style={styles.ratingBadgeText}>{formatRating(movie.rating)}</Text>
          </View>
          
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
      </Animated.View>
    );
  };
  
  // Componente para botón de cargar más
  const LoadMoreButton = ({ onPress, loading }: { onPress: () => void; loading: boolean }) => (
    <TouchableOpacity 
      style={styles.loadMoreButton} 
      onPress={onPress}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator size="small" color={ACCENT_PINK} />
      ) : (
        <MaterialCommunityIcons name="chevron-right" size={32} color={ACCENT_PINK} />
      )}
    </TouchableOpacity>
  );

  const HeroBanner = () => {
    // Filtrar películas que tienen backdrop para el hero
    const moviesWithBackdrop = trendingMovies.filter(m => m.backdrop_url);
    // Usar el índice guardado (seleccionado al cargar datos)
    const heroMovie = moviesWithBackdrop[heroMovieIndex] || moviesWithBackdrop[0] || trendingMovies[0];
    if (!heroMovie) return null;

    // Usar backdrop si está disponible, sino poster
    const heroImage = heroMovie.backdrop_url || heroMovie.poster_url;
    const primaryPlatform = heroMovie.platforms?.[0];
    const platformLogo = primaryPlatform ? PLATFORM_LOGOS[primaryPlatform.name] : null;

    return (
      <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
        <TouchableOpacity 
          style={styles.heroBanner}
          onPress={() => handleMoviePress(heroMovie)}
          activeOpacity={0.9}
        >
          <Image
            source={{ uri: heroImage }}
            style={styles.heroBannerImage}
          />
          <View style={styles.heroGradientOverlay} />
          <View style={styles.heroContent}>
            {/* Badge de plataforma en Hero con logo local */}
            {platformLogo && (
              <View style={styles.heroPlatformBadge}>
                <Image
                  source={platformLogo}
                  style={styles.heroPlatformLogo}
                  resizeMode="contain"
                />
                <Text style={styles.heroPlatformText}>{primaryPlatform?.name}</Text>
              </View>
            )}
            <Text style={styles.heroTitle} numberOfLines={2}>
              {heroMovie.title}
            </Text>
            <View style={styles.heroMeta}>
              <MaterialCommunityIcons
                name="star"
                size={16}
                color="#FFD700"
              />
              <Text style={styles.heroRating}>{formatRating(heroMovie.rating)}</Text>
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
      </Animated.View>
    );
  };

  const TrendingCarousel = () => {
    const carouselMovies = trendingMovies.slice(1);
    if (carouselMovies.length === 0) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tendencias</Text>
        <Text style={styles.sectionSubtitle}>Lo más visto esta semana</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.trendingScroll}
          onScroll={({ nativeEvent }) => {
            const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
            if (layoutMeasurement.width + contentOffset.x >= contentSize.width - 100) {
              loadMoreTrending();
            }
          }}
          scrollEventThrottle={16}
          decelerationRate="fast"
          directionalLockEnabled
          removeClippedSubviews
        >
          {carouselMovies.map((movie) => (
            <TrendingCard key={movie.id} movie={movie} />
          ))}
          {loadingMoreTrending && (
            <View style={styles.loadingMoreContainer}>
              <ActivityIndicator size="small" color={ACCENT_PINK} />
            </View>
          )}
        </ScrollView>
      </View>
    );
  };
  
  // Componente TrendingCard con manejo de errores
  const TrendingCard = ({ movie }: { movie: Movie }) => {
    const [imageError, setImageError] = useState(false);
    const [attempt, setAttempt] = useState(0);
    const original = movie.poster_url || "";
    const lastSegment = original.split('/').filter(Boolean).pop() || "";
    const reconstructed = lastSegment && lastSegment.endsWith('.jpg')
      ? `https://image.tmdb.org/t/p/w342/${lastSegment}`
      : "";
    const initialUri = movie.poster_url || reconstructed || PLACEHOLDER_POSTER;
    const [currentUri, setCurrentUri] = useState(initialUri);
    
    return (
      <TouchableOpacity
        style={styles.trendingCard}
        onPress={() => handleMoviePress(movie)}
      >
        <Image
          source={{ uri: currentUri }}
          style={styles.trendingImage}
          onError={() => {
            if (attempt === 0 && reconstructed && currentUri !== reconstructed) {
              setAttempt(1);
              setCurrentUri(reconstructed);
              return;
            }
            setImageError(true);
            setCurrentUri(PLACEHOLDER_POSTER);
          }}
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
            <Text style={styles.trendingRating}>{formatRating(movie.rating)}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading && trendingMovies.length === 0) {
    return (
      <View style={styles.container}>
        {/* Skeleton Loading */}
        <View style={styles.skeletonHero} />
        <View style={styles.section}>
          <View style={styles.skeletonSectionTitle} />
          <SkeletonRow />
        </View>
        <View style={styles.section}>
          <View style={styles.skeletonSectionTitle} />
          <SkeletonRow />
        </View>
      </View>
    );
  }

  return (
    <>
      <ScrollView 
        style={styles.container} 
        showsVerticalScrollIndicator={false} 
        removeClippedSubviews
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={ACCENT_PINK}
            colors={[ACCENT_PINK, ACCENT_CYAN]}
            progressBackgroundColor={BG_CARD}
          />
        }
      >
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
              onScroll={({ nativeEvent }) => {
                const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
                if (layoutMeasurement.width + contentOffset.x >= contentSize.width - 100) {
                  loadMorePlatform();
                }
              }}
              scrollEventThrottle={16}
              decelerationRate="fast"
              directionalLockEnabled
              removeClippedSubviews
            >
              {platformMovies.map((movie) => (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  onPress={() => handleMovieSelect(movie)}
                />
              ))}
              {loadingMorePlatform && (
                <View style={styles.loadingMoreContainer}>
                  <ActivityIndicator size="small" color={ACCENT_PINK} />
                </View>
              )}
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
                <Text style={styles.sectionSubtitle}>{contentType === 'series' ? 'Series' : 'Películas'} destacadas</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.carouselContainer}
                  onScroll={({ nativeEvent }) => {
                    const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
                    if (layoutMeasurement.width + contentOffset.x >= contentSize.width - 100) {
                      loadMoreGenre();
                    }
                  }}
                  scrollEventThrottle={16}
                  decelerationRate="fast"
                  directionalLockEnabled
                  removeClippedSubviews
                >
                  {genreMovies.map((movie) => (
                    <MovieCard
                      key={movie.id}
                      movie={movie}
                      onPress={() => handleMovieSelect(movie)}
                    />
                  ))}
                  {loadingMoreGenre && (
                    <View style={styles.loadingMoreContainer}>
                      <ActivityIndicator size="small" color={ACCENT_PINK} />
                    </View>
                  )}
                </ScrollView>
              </View>
            )}
          </>
        )}

        {/* ============ NUEVAS SECCIONES NETFLIX STYLE ============ */}
        
        {/* Top Rated - Mejor valoradas */}
        {!searchQuery && topRatedMovies.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Mejor Valoradas</Text>
            <Text style={styles.sectionSubtitle}>Las mejor puntuadas de todos los tiempos</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.carouselContainer}
              scrollEventThrottle={16}
              decelerationRate="fast"
              directionalLockEnabled
              removeClippedSubviews
            >
              {topRatedMovies.map((movie) => (
                <MovieCard
                  key={`top-${movie.id}`}
                  movie={movie}
                  onPress={() => handleMovieSelect(movie)}
                />
              ))}
            </ScrollView>
          </View>
        )}

        {/* Acción / Drama (para series) */}
        {!searchQuery && actionMovies.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {contentType === 'movies' ? 'Acción' : 'Drama'}
            </Text>
            <Text style={styles.sectionSubtitle}>
              {contentType === 'movies' ? 'Adrenalina pura' : 'Historias que emocionan'}
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.carouselContainer}
              scrollEventThrottle={16}
              decelerationRate="fast"
              directionalLockEnabled
              removeClippedSubviews
            >
              {actionMovies.map((movie) => (
                <MovieCard
                  key={`action-${movie.id}`}
                  movie={movie}
                  onPress={() => handleMovieSelect(movie)}
                />
              ))}
            </ScrollView>
          </View>
        )}

        {/* Comedia / Crime (para series) */}
        {!searchQuery && comedyMovies.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {contentType === 'movies' ? 'Comedia' : 'Crimen'}
            </Text>
            <Text style={styles.sectionSubtitle}>
              {contentType === 'movies' ? 'Para reír sin parar' : 'Misterio y suspenso'}
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.carouselContainer}
              scrollEventThrottle={16}
              decelerationRate="fast"
              directionalLockEnabled
              removeClippedSubviews
            >
              {comedyMovies.map((movie) => (
                <MovieCard
                  key={`comedy-${movie.id}`}
                  movie={movie}
                  onPress={() => handleMovieSelect(movie)}
                />
              ))}
            </ScrollView>
          </View>
        )}

        {/* Terror / Comedy Series */}
        {!searchQuery && horrorMovies.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {contentType === 'movies' ? 'Terror' : 'Comedia'}
            </Text>
            <Text style={styles.sectionSubtitle}>
              {contentType === 'movies' ? 'Para los valientes' : 'Risas garantizadas'}
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.carouselContainer}
              scrollEventThrottle={16}
              decelerationRate="fast"
              directionalLockEnabled
              removeClippedSubviews
            >
              {horrorMovies.map((movie) => (
                <MovieCard
                  key={`horror-${movie.id}`}
                  movie={movie}
                  onPress={() => handleMovieSelect(movie)}
                />
              ))}
            </ScrollView>
          </View>
        )}

        {/* Ciencia Ficción / Animation Series */}
        {!searchQuery && scifiMovies.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {contentType === 'movies' ? 'Ciencia Ficción' : 'Animación'}
            </Text>
            <Text style={styles.sectionSubtitle}>
              {contentType === 'movies' ? 'Viajes al futuro' : 'Mundos animados'}
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.carouselContainer}
              scrollEventThrottle={16}
              decelerationRate="fast"
              directionalLockEnabled
              removeClippedSubviews
            >
              {scifiMovies.map((movie) => (
                <MovieCard
                  key={`scifi-${movie.id}`}
                  movie={movie}
                  onPress={() => handleMovieSelect(movie)}
                />
              ))}
            </ScrollView>
          </View>
        )}

        {/* Animación (solo movies) */}
        {!searchQuery && contentType === 'movies' && animationMovies.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Animación</Text>
            <Text style={styles.sectionSubtitle}>Para toda la familia</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.carouselContainer}
              scrollEventThrottle={16}
              decelerationRate="fast"
              directionalLockEnabled
              removeClippedSubviews
            >
              {animationMovies.map((movie) => (
                <MovieCard
                  key={`anim-${movie.id}`}
                  movie={movie}
                  onPress={() => handleMovieSelect(movie)}
                />
              ))}
            </ScrollView>
          </View>
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
                onScroll={({ nativeEvent }) => {
                  const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
                  if (layoutMeasurement.width + contentOffset.x >= contentSize.width - 100) {
                    if (searchQuery.length > 1) {
                      loadMoreSearch();
                    } else {
                      loadMoreTrending();
                    }
                  }
                }}
                scrollEventThrottle={16}
                decelerationRate="fast"
                directionalLockEnabled
                removeClippedSubviews
              >
                {displayMovies.map((movie) => (
                  <MovieCard 
                    key={movie.id} 
                    movie={movie}
                    onPress={() => handleMoviePress(movie)}
                  />
                ))}
                {(loadingMoreSearch || loadingMoreTrending) && (
                  <View style={styles.loadingMoreContainer}>
                    <ActivityIndicator size="small" color={ACCENT_PINK} />
                  </View>
                )}
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

        {/* Botón Explorar Todo el Catálogo - Diseño Premium */}
        {!searchQuery && (
          <View style={styles.exploreCatalogSection}>
            <TouchableOpacity 
              style={styles.exploreCatalogButton}
              onPress={openFullCatalog}
              activeOpacity={0.8}
            >
              <View style={styles.exploreCatalogGlow} />
              <View style={styles.exploreCatalogIconContainer}>
                <MaterialCommunityIcons name="view-grid-plus" size={40} color={TEXT_LIGHT} />
              </View>
              <View style={styles.exploreCatalogTextContainer}>
                <Text style={styles.exploreCatalogText}>
                  Explorar Catálogo Completo
                </Text>
                <Text style={styles.exploreCatalogSubtext}>
                  {contentType === 'movies' ? '+1.300 películas disponibles' : '+900 series disponibles'}
                </Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={28} color={ACCENT_PINK} />
            </TouchableOpacity>
          </View>
        )}

        {/* Espaciador */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Modal de detalles */}
      <MovieModal
        visible={modalVisible}
        movie={selectedMovie}
        onClose={() => setModalVisible(false)}
        onAddToFavorites={handleAddToFavorites}
        isFavorite={selectedMovie ? favorites.has(selectedMovie.id) : false}
      />

      {/* Modal Catálogo Completo - Diseño Premium */}
      {showFullCatalog && (
        <View style={styles.catalogModal}>
          {/* Header del catálogo con gradiente */}
          <View style={styles.catalogHeader}>
            <TouchableOpacity onPress={closeFullCatalog} style={styles.catalogBackButton}>
              <MaterialCommunityIcons name="arrow-left" size={28} color={TEXT_LIGHT} />
            </TouchableOpacity>
            <View style={styles.catalogTitleContainer}>
              <Text style={styles.catalogTitle}>
                {contentType === 'movies' ? 'Todas las Películas' : 'Todas las Series'}
              </Text>
              <Text style={styles.catalogSubtitle}>
                Desliza para explorar
              </Text>
            </View>
            <View style={styles.catalogCountBadge}>
              <Text style={styles.catalogCount}>{catalogMovies.length}</Text>
            </View>
          </View>

          {/* Stats del catálogo */}
          <View style={styles.catalogStats}>
            <View style={styles.catalogStatItem}>
              <MaterialCommunityIcons name="movie-open" size={20} color={ACCENT_PINK} />
              <Text style={styles.catalogStatText}>
                {contentType === 'movies' ? '1.331' : '940'} total
              </Text>
            </View>
            <View style={styles.catalogStatItem}>
              <MaterialCommunityIcons name="download" size={20} color={ACCENT_CYAN} />
              <Text style={styles.catalogStatText}>{catalogMovies.length} cargadas</Text>
            </View>
            <View style={styles.catalogStatItem}>
              <MaterialCommunityIcons name="television-play" size={20} color={ACCENT_LIME} />
              <Text style={styles.catalogStatText}>7 plataformas</Text>
            </View>
          </View>

          {/* Grid de películas con scroll infinito */}
          <ScrollView
            style={styles.catalogGrid}
            contentContainerStyle={styles.catalogGridContent}
            onScroll={({ nativeEvent }) => {
              const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
              if (layoutMeasurement.height + contentOffset.y >= contentSize.height - 500) {
                loadMoreCatalog();
              }
            }}
            scrollEventThrottle={16}
          >
            <View style={styles.catalogGridContainer}>
              {catalogMovies.map((movie, index) => (
                <TouchableOpacity
                  key={`catalog-${movie.id}-${index}`}
                  style={styles.catalogCard}
                  onPress={() => handleMovieSelect(movie)}
                  activeOpacity={0.7}
                >
                  <View style={styles.catalogPosterContainer}>
                    <Image
                      source={{ uri: movie.poster_url || PLACEHOLDER_POSTER }}
                      style={styles.catalogPoster}
                    />
                    {/* Overlay con gradiente */}
                    <View style={styles.catalogPosterOverlay} />
                    {/* Número de posición */}
                    {index < 10 && (
                      <View style={styles.catalogPositionBadge}>
                        <Text style={styles.catalogPositionText}>#{index + 1}</Text>
                      </View>
                    )}
                    {/* Mini badges de plataforma */}
                    {movie.platforms && movie.platforms.length > 0 && (
                      <View style={styles.catalogPlatformBadge}>
                        {movie.platforms.slice(0, 2).map((platform, idx) => {
                          const logo = PLATFORM_LOGOS[platform.name];
                          if (!logo) return null;
                          return (
                            <View key={idx} style={styles.catalogPlatformLogoContainer}>
                              <Image
                                source={logo}
                                style={styles.catalogPlatformLogo}
                                resizeMode="contain"
                              />
                            </View>
                          );
                        })}
                      </View>
                    )}
                    {/* Rating en esquina */}
                    <View style={styles.catalogRatingBadge}>
                      <MaterialCommunityIcons name="star" size={10} color="#FFD700" />
                      <Text style={styles.catalogRatingText}>{formatRating(movie.rating)}</Text>
                    </View>
                  </View>
                  <Text style={styles.catalogMovieTitle} numberOfLines={2}>
                    {movie.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Loading más - Diseño mejorado */}
            {loadingCatalog && (
              <View style={styles.catalogLoading}>
                <View style={styles.catalogLoadingSpinner}>
                  <ActivityIndicator size="large" color={ACCENT_PINK} />
                </View>
                <Text style={styles.catalogLoadingText}>Cargando más contenido...</Text>
                <Text style={styles.catalogLoadingSubtext}>Página {catalogPage + 1}</Text>
              </View>
            )}

            {/* Mensaje fin del catálogo */}
            {!hasMoreCatalog && catalogMovies.length > 0 && (
              <View style={styles.catalogEnd}>
                <View style={styles.catalogEndIcon}>
                  <MaterialCommunityIcons name="check-circle" size={40} color={ACCENT_CYAN} />
                </View>
                <Text style={styles.catalogEndTitle}>Catálogo completo</Text>
                <Text style={styles.catalogEndText}>
                  Has visto todo el contenido disponible
                </Text>
                <Text style={styles.catalogEndSubtext}>
                  {catalogMovies.length} {contentType === 'movies' ? 'películas' : 'series'}
                </Text>
              </View>
            )}

            <View style={{ height: 100 }} />
          </ScrollView>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG_DARK,
  },
  loadingMoreContainer: {
    width: 60,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  loadMoreButton: {
    width: 50,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: BG_CARD,
    borderRadius: 12,
    marginLeft: 8,
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
    top: 4,
    left: 4,
    zIndex: 10,
  },
  medalText: {
    fontSize: 16,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
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
    backgroundColor: "rgba(0,0,0,0.15)",
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
  // Skeleton styles
  skeletonCard: {
    width: 140,
    marginRight: 14,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: BG_CARD,
  },
  skeletonPoster: {
    width: "100%",
    height: 210,
    backgroundColor: GRADIENT_BLUE,
    borderRadius: 14,
  },
  skeletonTitle: {
    width: "80%",
    height: 14,
    backgroundColor: GRADIENT_BLUE,
    borderRadius: 4,
    marginTop: 10,
    marginLeft: 4,
  },
  skeletonMeta: {
    width: "50%",
    height: 10,
    backgroundColor: GRADIENT_BLUE,
    borderRadius: 4,
    marginTop: 6,
    marginLeft: 4,
    marginBottom: 8,
  },
  skeletonHero: {
    width: screenWidth - 16,
    height: 400,
    backgroundColor: GRADIENT_BLUE,
    borderRadius: 24,
    marginHorizontal: 8,
    marginTop: 8,
    marginBottom: 32,
  },
  skeletonSectionTitle: {
    width: 150,
    height: 20,
    backgroundColor: GRADIENT_BLUE,
    borderRadius: 4,
    marginBottom: 16,
  },
  // Platform badge on cards
  platformBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  // Row de múltiples plataformas
  platformBadgesRow: {
    position: "absolute",
    top: 8,
    left: 8,
    flexDirection: "row",
    gap: 4,
  },
  platformLogoBadge: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: "rgba(0,0,0,0.75)",
    justifyContent: "center",
    alignItems: "center",
    padding: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.4,
    shadowRadius: 2,
    elevation: 3,
  },
  platformLogoMini: {
    width: 18,
    height: 18,
  },
  // Rating badge on cards
  ratingBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 3,
  },
  ratingBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#FFD700",
  },
  // Hero platform badge
  heroPlatformBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "rgba(0,0,0,0.75)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
    gap: 8,
  },
  heroPlatformLogo: {
    width: 22,
    height: 22,
  },
  heroPlatformText: {
    fontSize: 12,
    fontWeight: "700",
    color: TEXT_LIGHT,
  },
  // Hero gradient overlay
  heroGradientOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 300,
    backgroundColor: "transparent",
    // Gradiente con transparencia
    backgroundImage: "linear-gradient(to top, rgba(13,27,42,1) 0%, rgba(13,27,42,0.8) 40%, transparent 100%)",
  },
  // Explorar catálogo - Diseño Premium
  exploreCatalogSection: {
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  exploreCatalogButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BG_CARD,
    borderWidth: 2,
    borderColor: ACCENT_PINK,
    borderRadius: 20,
    padding: 16,
    gap: 16,
    overflow: "hidden",
    shadowColor: ACCENT_PINK,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  exploreCatalogGlow: {
    position: "absolute",
    top: -50,
    left: -50,
    width: 150,
    height: 150,
    backgroundColor: ACCENT_PINK,
    opacity: 0.15,
    borderRadius: 75,
  },
  exploreCatalogIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: "rgba(255, 42, 109, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  exploreCatalogTextContainer: {
    flex: 1,
    gap: 4,
  },
  exploreCatalogText: {
    fontSize: 18,
    fontWeight: "700",
    color: TEXT_LIGHT,
  },
  exploreCatalogSubtext: {
    fontSize: 14,
    color: TEXT_MUTED,
  },
  // Modal catálogo completo - Diseño Premium
  catalogModal: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: BG_DARK,
    zIndex: 1000,
  },
  catalogHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: BG_CARD,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,42,109,0.3)",
    gap: 12,
  },
  catalogBackButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  catalogTitleContainer: {
    flex: 1,
  },
  catalogTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: TEXT_LIGHT,
  },
  catalogSubtitle: {
    fontSize: 12,
    color: TEXT_MUTED,
    marginTop: 2,
  },
  catalogCountBadge: {
    backgroundColor: ACCENT_PINK,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  catalogCount: {
    fontSize: 14,
    color: TEXT_LIGHT,
    fontWeight: "700",
  },
  catalogStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "rgba(26, 47, 69, 0.5)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  catalogStatItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  catalogStatText: {
    fontSize: 12,
    color: TEXT_MUTED,
    fontWeight: "500",
  },
  catalogGrid: {
    flex: 1,
  },
  catalogGridContent: {
    padding: 8,
  },
  catalogGridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  catalogCard: {
    width: (screenWidth - 32) / 3,
    marginBottom: 16,
    padding: 4,
  },
  catalogPosterContainer: {
    position: "relative",
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  catalogPoster: {
    width: "100%",
    height: 165,
    backgroundColor: BG_CARD,
  },
  catalogPosterOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: "transparent",
  },
  catalogPositionBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    backgroundColor: ACCENT_PINK,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  catalogPositionText: {
    fontSize: 10,
    fontWeight: "700",
    color: TEXT_LIGHT,
  },
  catalogPlatformBadge: {
    position: "absolute",
    top: 6,
    left: 6,
    flexDirection: "row",
    gap: 4,
  },
  catalogPlatformLogoContainer: {
    width: 24,
    height: 24,
    backgroundColor: "rgba(0,0,0,0.7)",
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    padding: 2,
  },
  catalogPlatformLogo: {
    width: 18,
    height: 18,
  },
  catalogRatingBadge: {
    position: "absolute",
    bottom: 6,
    right: 6,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.8)",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 3,
  },
  catalogRatingText: {
    fontSize: 10,
    color: TEXT_LIGHT,
    fontWeight: "600",
  },
  catalogMovieTitle: {
    fontSize: 11,
    fontWeight: "600",
    color: TEXT_LIGHT,
    marginTop: 8,
    height: 32,
    lineHeight: 14,
  },
  catalogLoading: {
    padding: 40,
    alignItems: "center",
    gap: 12,
  },
  catalogLoadingSpinner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255,42,109,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  catalogLoadingText: {
    color: TEXT_LIGHT,
    fontSize: 16,
    fontWeight: "600",
  },
  catalogLoadingSubtext: {
    color: TEXT_MUTED,
    fontSize: 12,
  },
  catalogEnd: {
    padding: 32,
    alignItems: "center",
    gap: 8,
    marginTop: 16,
  },
  catalogEndIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(0, 217, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  catalogEndTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: TEXT_LIGHT,
  },
  catalogEndText: {
    color: TEXT_MUTED,
    fontSize: 14,
    fontWeight: "500",
  },
  catalogEndSubtext: {
    color: TEXT_MUTED,
    fontSize: 13,
    opacity: 0.7,
  },
});

