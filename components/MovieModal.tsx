import { useAuthContext } from "@/context/AuthContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

const API_URL = "http://172.20.10.2:9999";
const { width: screenWidth } = Dimensions.get("window");

// Paleta de colores actualizada para coincidir con la app
const BG_DARK = "#0d1b2a";
const BG_CARD = "#1a2f45";
const GRADIENT_BLUE = "#0f3460";
const ACCENT_CYAN = "#00d9ff";
const ACCENT_PINK = "#ff006e";
const TEXT_LIGHT = "#ffffff";
const TEXT_MUTED = "#b0b9c1";

// Colores de plataformas
const PLATFORM_COLORS: Record<string, string> = {
  "Netflix": "#E50914",
  "Prime Video": "#146EB4",
  "Disney+": "#113CCF",
  "HBO Max": "#5822b4",
  "Hulu": "#1CE783",
  "Paramount+": "#0064FF",
  "Apple TV+": "#000000",
  "Otros": "#666666",
};

// Logos locales de plataformas
const PLATFORM_LOGOS: Record<string, any> = {
  "Netflix": require("../assets/logos/logo-netflix.png"),
  "Prime Video": require("../assets/logos/prime-logo.png"),
  "Disney+": require("../assets/logos/disney-logo.jpg"),
  "HBO Max": require("../assets/logos/hbo-logo.png"),
  "Hulu": require("../assets/logos/hulu-logo.jpg"),
  "Paramount+": require("../assets/logos/paramount-logo.png"),
  "Apple TV+": require("../assets/logos/appleTv-logo.png"),
};

// Iconos de plataformas (MaterialCommunityIcons - fallback)
const PLATFORM_ICONS: Record<string, string> = {
  "Netflix": "netflix",
  "Prime Video": "package-variant",
  "Disney+": "castle",
  "HBO Max": "alpha-h-box",
  "Hulu": "television-classic",
  "Paramount+": "alpha-p-box",
  "Apple TV+": "apple",
  "Otros": "television",
};

// Iconos de géneros
const GENRE_ICONS: Record<string, string> = {
  "Action": "sword-cross",
  "Comedy": "emoticon-happy",
  "Drama": "drama-masks",
  "Horror": "ghost",
  "Science Fiction": "rocket-launch",
  "Animation": "animation-play",
  "Romance": "heart",
  "Thriller": "knife",
  "Adventure": "map-legend",
  "Fantasy": "wizard-hat",
  "Documentary": "file-document",
  "Crime": "handcuffs",
  "Mystery": "magnify",
  "Family": "account-group",
  "default": "movie",
};

export interface MovieDetail {
  id: number;
  title: string;
  description: string;
  poster_url: string;
  rating: number;
  genre: string;
  platform: string;
  platforms?: string[];
  duration?: string;
  year?: number;
}

interface Review {
  id: string;
  author: string;
  rating: number | null;
  content: string;
  date: string;
}

interface ReviewStats {
  totalReviews: number;
  averageRating: string | null;
  distribution: {
    star5: number;
    star4: number;
    star3: number;
    star2: number;
    star1: number;
  };
}

interface MovieModalProps {
  visible: boolean;
  movie: MovieDetail | null;
  onClose: () => void;
  onAddToFavorites?: (movieId: number) => void;
  isFavorite?: boolean;
}

const { height } = Dimensions.get("window");

// Small helper component to load poster safely with one retry using reconstructed path
function MoviePoster({ uri, reconstructedBase }: { uri?: string; reconstructedBase?: string }) {
  const [currentUri, setCurrentUri] = useState<string | null>(uri || reconstructedBase || null);
  const [attempt, setAttempt] = useState(0);
  const PLACEHOLDER = "https://via.placeholder.com/342x513/1a2f45/ffffff?text=No+Image";

  return (
    <Image
      source={{ uri: currentUri || PLACEHOLDER }}
      style={styles.posterImage}
      onError={() => {
        if (attempt === 0 && reconstructedBase && currentUri !== reconstructedBase) {
          setAttempt(1);
          setCurrentUri(reconstructedBase);
          return;
        }
        setCurrentUri(PLACEHOLDER);
      }}
    />
  );
}

export default function MovieModal({ 
  visible, 
  movie, 
  onClose,
  onAddToFavorites,
  isFavorite = false 
}: MovieModalProps) {
  const { user } = useAuthContext();
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewStats, setReviewStats] = useState<ReviewStats | null>(null);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [reviewsLoaded, setReviewsLoaded] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(8);
  const [reviewContent, setReviewContent] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [showReviewsSection, setShowReviewsSection] = useState(false);

  // Reset states when modal closes
  useEffect(() => {
    if (!visible) {
      setReviews([]);
      setReviewStats(null);
      setReviewsLoaded(false);
      setShowReviewsSection(false);
      setShowAllReviews(false);
      setShowReviewForm(false);
    }
  }, [visible]);

  // Cargar reseñas solo cuando el usuario expande la sección (lazy load)
  const handleShowReviews = async () => {
    setShowReviewsSection(true);
    if (reviewsLoaded || !movie) return;
    
    try {
      setLoadingReviews(true);
      const response = await fetch(`${API_URL}/api/movies/${movie.id}/reviews`);
      const data = await response.json();
      setReviews(data.reviews || []);
      setReviewsLoaded(true);
    } catch (error) {
      console.error("Error loading reviews:", error);
      setReviews([]);
    } finally {
      setLoadingReviews(false);
    }
  };

  const submitReview = async () => {
    if (!movie) return;
    
    if (reviewContent.trim().length < 10) {
      alert("La reseña debe tener al menos 10 caracteres");
      return;
    }

    try {
      setSubmittingReview(true);
      const userId = user?.id ? Number(user.id) : null;
      
      if (!userId) {
        alert("Debes iniciar sesión para publicar una reseña");
        setSubmittingReview(false);
        return;
      }

      console.log("📝 Enviando reseña:", { userId, movieId: movie.id, rating: reviewRating });
      
      const response = await fetch(`${API_URL}/api/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          movieId: movie.id,
          rating: reviewRating,
          content: reviewContent
        })
      });

      if (response.ok) {
        alert("¡Reseña publicada exitosamente!");
        setReviewContent("");
        setReviewRating(8);
        setShowReviewForm(false);
        // Recargar reseñas
        setReviewsLoaded(false);
        handleShowReviews();
      } else {
        const errorData = await response.json();
        alert(errorData.message || "Error al publicar la reseña");
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      alert("Error al publicar la reseña");
    } finally {
      setSubmittingReview(false);
    }
  };

  const loadReviews = async () => {
    if (!movie) return;
    
    try {
      setLoadingReviews(true);
      const response = await fetch(`${API_URL}/api/movies/${movie.id}/reviews`);
      const data = await response.json();
      setReviews(data.reviews || []);
      setReviewStats(data.stats || null);
    } catch (error) {
      console.error("Error loading reviews:", error);
      setReviews([]);
      setReviewStats(null);
    } finally {
      setLoadingReviews(false);
    }
  };

  if (!movie) return null;

  const displayedReviews = showAllReviews ? reviews : reviews.slice(0, 1);


  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header con close */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <MaterialCommunityIcons
              name="close"
              size={28}
              color={TEXT_LIGHT}
            />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Poster y gradiente */}
          <View style={styles.posterContainer}>
            {/* compute reconstructed fallback from last path segment */}
            {
              (() => {
                const original = movie.poster_url || "";
                const lastSegment = original.split('/').filter(Boolean).pop() || "";
                return (
                  <MoviePoster uri={movie.poster_url} reconstructedBase={lastSegment && lastSegment.endsWith('.jpg') ? `https://image.tmdb.org/t/p/w342/${lastSegment}` : undefined} />
                );
              })()
            }
            <View style={styles.gradient} />
          </View>

          {/* Información */}
          <View style={styles.infoContainer}>
            <Text style={styles.title}>{movie.title}</Text>

            {/* Meta info */}
            <View style={styles.metaContainer}>
              <View style={styles.metaItem}>
                <MaterialCommunityIcons
                  name="star"
                  size={16}
                  color={ACCENT_PINK}
                />
                <Text style={styles.metaText}>{movie.rating ? Number(movie.rating).toFixed(1) : 'N/A'}/10</Text>
              </View>

              {movie.year && (
                <View style={styles.metaItem}>
                  <MaterialCommunityIcons
                    name="calendar"
                    size={16}
                    color={ACCENT_PINK}
                  />
                  <Text style={styles.metaText}>{movie.year}</Text>
                </View>
              )}

              {movie.duration && (
                <View style={styles.metaItem}>
                  <MaterialCommunityIcons
                    name="clock"
                    size={16}
                    color={ACCENT_PINK}
                  />
                  <Text style={styles.metaText}>{movie.duration}</Text>
                </View>
              )}
            </View>

            {/* Género y Plataforma */}
            <View style={styles.tagsContainer}>
              <View style={styles.tag}>
                <Text style={styles.tagText}>{movie.genre}</Text>
              </View>
              <View style={[styles.tag, styles.platformTag]}>
                <Text style={styles.tagText}>{movie.platform}</Text>
              </View>
            </View>

            {/* Botones de acción */}
            <View style={styles.buttonsContainer}>
              <TouchableOpacity style={styles.playButton}>
                <MaterialCommunityIcons
                  name="play-circle"
                  size={24}
                  color={TEXT_LIGHT}
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.playButtonText}>Reproducir</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.addButton, isFavorite && styles.addButtonActive]}
                onPress={() => onAddToFavorites?.(movie.id)}
              >
                <MaterialCommunityIcons
                  name={isFavorite ? "heart" : "heart-outline"}
                  size={24}
                  color={isFavorite ? ACCENT_PINK : TEXT_LIGHT}
                />
              </TouchableOpacity>
            </View>

            {/* Sinopsis */}
            <View style={styles.synopsisContainer}>
              <Text style={styles.synopsisTitle}>Sinopsis</Text>
              <Text style={styles.synopsisText}>{movie.description}</Text>
            </View>

            {/* Plataformas disponibles con logos reales */}
            {movie.platforms && movie.platforms.length > 0 && (
              <View style={styles.platformsSection}>
                <Text style={styles.platformsSectionTitle}>Disponible en</Text>
                <View style={styles.platformBadges}>
                  {movie.platforms.map((platform, index) => (
                    <View 
                      key={index} 
                      style={[
                        styles.platformLogoContainer,
                        { backgroundColor: PLATFORM_COLORS[platform] || PLATFORM_COLORS["Otros"] }
                      ]}
                    >
                      {PLATFORM_LOGOS[platform] ? (
                        <Image 
                          source={PLATFORM_LOGOS[platform]}
                          style={styles.platformLogoImage}
                          resizeMode="contain"
                        />
                      ) : (
                        <MaterialCommunityIcons 
                          name={(PLATFORM_ICONS[platform] || PLATFORM_ICONS["Otros"]) as any}
                          size={28} 
                          color={TEXT_LIGHT} 
                        />
                      )}
                    </View>
                  ))}
                </View>
                <View style={styles.platformNamesContainer}>
                  {movie.platforms.map((platform, index) => (
                    <Text key={index} style={styles.platformNameText}>{platform}</Text>
                  ))}
                </View>
              </View>
            )}

            {/* Género */}
            {movie.genre && (
              <View style={styles.genreSection}>
                <Text style={styles.genreSectionTitle}>Género</Text>
                <View style={styles.genreBadge}>
                  <MaterialCommunityIcons 
                    name={(GENRE_ICONS[movie.genre] || GENRE_ICONS["default"]) as any}
                    size={18} 
                    color={ACCENT_CYAN} 
                  />
                  <Text style={styles.genreBadgeText}>{movie.genre}</Text>
                </View>
              </View>
            )}

            {/* Reseñas - Lazy Load */}
            <View style={styles.reviewsContainer}>
              {!showReviewsSection ? (
                <TouchableOpacity 
                  style={styles.showReviewsButton}
                  onPress={handleShowReviews}
                >
                  <MaterialCommunityIcons name="comment-text-outline" size={20} color={ACCENT_CYAN} />
                  <Text style={styles.showReviewsButtonText}>Ver reseñas</Text>
                  <MaterialCommunityIcons name="chevron-down" size={20} color={ACCENT_CYAN} />
                </TouchableOpacity>
              ) : (
                <>
                  <Text style={styles.reviewsTitle}>Reseñas</Text>
                  
                  {/* Estadísticas tipo Google */}
                  {reviewStats && reviewStats.totalReviews > 0 && (
                    <View style={styles.reviewStatsContainer}>
                      <View style={styles.reviewStatsHeader}>
                        <Text style={styles.reviewStatsAverage}>
                          {reviewStats.averageRating}
                        </Text>
                        <View>
                          <View style={styles.reviewStatsStars}>
                            {[1, 2, 3, 4, 5].map((star) => (
                              <MaterialCommunityIcons
                                key={star}
                                name={parseFloat(reviewStats.averageRating || "0") >= star * 2 ? "star" : 
                                      parseFloat(reviewStats.averageRating || "0") >= star * 2 - 1 ? "star-half-full" : "star-outline"}
                                size={20}
                                color="#FFD700"
                              />
                            ))}
                          </View>
                          <Text style={styles.reviewStatsCount}>
                            {reviewStats.totalReviews} {reviewStats.totalReviews === 1 ? "reseña" : "reseñas"}
                          </Text>
                        </View>
                      </View>
                      
                      {/* Barras de distribución */}
                      <View style={styles.reviewStatsDistribution}>
                        {[
                          { label: "5", count: reviewStats.distribution.star5 },
                          { label: "4", count: reviewStats.distribution.star4 },
                          { label: "3", count: reviewStats.distribution.star3 },
                          { label: "2", count: reviewStats.distribution.star2 },
                          { label: "1", count: reviewStats.distribution.star1 },
                        ].map((item) => (
                          <View key={item.label} style={styles.reviewStatsBar}>
                            <Text style={styles.reviewStatsBarLabel}>{item.label}</Text>
                            <View style={styles.reviewStatsBarBg}>
                              <View 
                                style={[
                                  styles.reviewStatsBarFill, 
                                  { width: `${reviewStats.totalReviews > 0 ? (item.count / reviewStats.totalReviews) * 100 : 0}%` }
                                ]} 
                              />
                            </View>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}
                  
                  {loadingReviews ? (
                    <ActivityIndicator size="small" color={ACCENT_PINK} style={{ marginVertical: 16 }} />
                  ) : reviews.length > 0 ? (
                    <View style={styles.reviewsList}>
                      {displayedReviews.map((review) => (
                        <View key={review.id} style={styles.reviewItem}>
                          <View style={styles.reviewHeader}>
                            <Text style={styles.reviewAuthor}>{review.author}</Text>
                            {review.rating !== null && (
                              <View style={styles.reviewRating}>
                                <MaterialCommunityIcons
                                  name="star"
                                  size={14}
                                  color="#FFD700"
                                />
                                <Text style={styles.reviewRatingText}>{review.rating}/10</Text>
                              </View>
                            )}
                          </View>
                          <Text style={styles.reviewDate}>{review.date}</Text>
                          <Text style={styles.reviewContent}>{review.content}</Text>
                        </View>
                      ))}
                    </View>
                  ) : (
                    <Text style={styles.noReviewsText}>No hay reseñas disponibles</Text>
                  )}
                  
                  {reviews.length > 1 && !showAllReviews && (
                    <TouchableOpacity 
                      style={styles.showMoreButton}
                      onPress={() => setShowAllReviews(true)}
                    >
                      <Text style={styles.showMoreText}>Ver más ({reviews.length})</Text>
                      <MaterialCommunityIcons name="chevron-down" size={20} color={ACCENT_PINK} />
                    </TouchableOpacity>
                  )}

                  {showAllReviews && reviews.length > 1 && (
                    <TouchableOpacity 
                      style={styles.showMoreButton}
                      onPress={() => setShowAllReviews(false)}
                    >
                      <Text style={styles.showMoreText}>Ver menos</Text>
                      <MaterialCommunityIcons name="chevron-up" size={20} color={ACCENT_PINK} />
                    </TouchableOpacity>
                  )}
                </>
              )}

              {/* Botón para crear reseña */}
              {showReviewsSection && (
                <TouchableOpacity 
                  style={styles.createReviewButton}
                  onPress={() => setShowReviewForm(!showReviewForm)}
                >
                  <MaterialCommunityIcons
                    name={showReviewForm ? "close" : "pencil"}
                    size={18}
                    color={TEXT_LIGHT}
                  />
                  <Text style={styles.createReviewButtonText}>
                    {showReviewForm ? "Cancelar" : "Escribir reseña"}
                  </Text>
                </TouchableOpacity>
              )}

              {/* Formulario de crear reseña */}
              {showReviewForm && (
                <View style={styles.reviewFormContainer}>
                  <Text style={styles.reviewFormTitle}>Tu reseña</Text>
                  
                  {/* Rating Slider */}
                  <View style={styles.ratingContainer}>
                    <Text style={styles.ratingLabel}>Calificación: {reviewRating}/10</Text>
                    <View style={styles.ratingButtons}>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
                        <TouchableOpacity
                          key={rating}
                          style={[
                            styles.ratingButton,
                            reviewRating === rating && styles.ratingButtonActive
                          ]}
                          onPress={() => setReviewRating(rating)}
                        >
                          <Text style={styles.ratingButtonText}>{rating}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  {/* Text Input */}
                  <TextInput
                    style={styles.reviewInput}
                    placeholder="Escribe tu reseña aquí (mínimo 10 caracteres)..."
                    placeholderTextColor={TEXT_MUTED}
                    multiline={true}
                    numberOfLines={4}
                    value={reviewContent}
                    onChangeText={setReviewContent}
                    maxLength={500}
                  />

                  <Text style={styles.charCount}>
                    {reviewContent.length}/500
                  </Text>

                  {/* Submit Button */}
                  <TouchableOpacity 
                    style={[
                      styles.submitButton,
                      submittingReview && styles.submitButtonDisabled
                    ]}
                    onPress={submitReview}
                    disabled={submittingReview}
                  >
                    {submittingReview ? (
                      <ActivityIndicator size="small" color={TEXT_LIGHT} />
                    ) : (
                      <Text style={styles.submitButtonText}>Publicar reseña</Text>
                    )}
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Información adicional */}
            <View style={styles.detailsContainer}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Disponible en</Text>
                <View style={styles.platformBadge}>
                  <Text style={styles.platformBadgeText}>{movie.platform}</Text>
                </View>
              </View>

              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Género</Text>
                <Text style={styles.detailValue}>{movie.genre}</Text>
              </View>

              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Calificación</Text>
                <View style={styles.ratingBadge}>
                  <Text style={styles.ratingBadgeText}>
                    {movie.rating ? Number(movie.rating).toFixed(1) : 'N/A'} / 10
                  </Text>
                </View>
              </View>
            </View>

            {/* Espaciador */}
            <View style={{ height: 40 }} />
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG_DARK,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: BG_CARD,
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
  },
  posterContainer: {
    position: "relative",
    height: 300,
    overflow: "hidden",
  },
  posterImage: {
    width: "100%",
    height: "100%",
  },
  gradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
    backgroundColor: BG_DARK,
    opacity: 0.9,
  },
  infoContainer: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: TEXT_LIGHT,
    marginBottom: 12,
  },
  metaContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 16,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metaText: {
    fontSize: 14,
    color: TEXT_MUTED,
  },
  tagsContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 20,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: BG_CARD,
    borderRadius: 16,
  },
  platformTag: {
    backgroundColor: ACCENT_PINK,
  },
  tagText: {
    fontSize: 12,
    fontWeight: "600",
    color: TEXT_LIGHT,
  },
  buttonsContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  playButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: ACCENT_PINK,
    paddingVertical: 12,
    borderRadius: 8,
  },
  playButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: TEXT_LIGHT,
  },
  addButton: {
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: BG_CARD,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: ACCENT_PINK,
  },
  synopsisContainer: {
    marginBottom: 24,
  },
  synopsisTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: TEXT_LIGHT,
    marginBottom: 8,
  },
  synopsisText: {
    fontSize: 14,
    color: TEXT_MUTED,
    lineHeight: 22,
  },
  detailsContainer: {
    gap: 16,
  },
  detailItem: {
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: BG_CARD,
  },
  detailLabel: {
    fontSize: 12,
    color: TEXT_MUTED,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  detailValue: {
    fontSize: 14,
    color: TEXT_LIGHT,
    fontWeight: "600",
  },
  platformBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: ACCENT_PINK,
    borderRadius: 20,
    gap: 6,
  },
  platformBadgeText: {
    fontSize: 12,
    fontWeight: "bold",
    color: TEXT_LIGHT,
  },
  // Estilos para logos de plataformas
  platformLogoContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  platformNamesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    marginTop: 8,
  },
  platformNameText: {
    fontSize: 11,
    color: TEXT_MUTED,
    textAlign: "center",
    width: 50,
  },
  ratingBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: BG_CARD,
    borderRadius: 4,
    borderLeftWidth: 3,
    borderLeftColor: ACCENT_PINK,
  },
  ratingBadgeText: {
    fontSize: 12,
    fontWeight: "bold",
    color: TEXT_LIGHT,
  },
  reviewsContainer: {
    marginBottom: 24,
  },
  reviewsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: TEXT_LIGHT,
    marginBottom: 16,
  },
  noReviewsText: {
    fontSize: 14,
    color: TEXT_MUTED,
    textAlign: "center",
    paddingVertical: 16,
    fontStyle: "italic",
  },
  reviewsList: {
    gap: 12,
  },
  reviewItem: {
    backgroundColor: BG_CARD,
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: ACCENT_PINK,
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  reviewAuthor: {
    fontSize: 14,
    fontWeight: "bold",
    color: TEXT_LIGHT,
  },
  reviewRating: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  reviewRatingText: {
    fontSize: 12,
    color: ACCENT_PINK,
    fontWeight: "bold",
  },
  reviewDate: {
    fontSize: 12,
    color: TEXT_MUTED,
    marginBottom: 6,
  },
  reviewContent: {
    fontSize: 13,
    color: TEXT_MUTED,
    lineHeight: 18,
  },
  showMoreButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
    paddingVertical: 10,
    gap: 4,
  },
  showMoreText: {
    fontSize: 13,
    color: ACCENT_PINK,
    fontWeight: "600",
  },
  createReviewButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: ACCENT_PINK,
    borderRadius: 8,
    gap: 8,
  },
  createReviewButtonText: {
    fontSize: 14,
    color: TEXT_LIGHT,
    fontWeight: "600",
  },
  reviewFormContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: BG_CARD,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: ACCENT_PINK,
  },
  reviewFormTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: TEXT_LIGHT,
    marginBottom: 12,
  },
  ratingContainer: {
    marginBottom: 16,
  },
  ratingLabel: {
    fontSize: 13,
    color: TEXT_LIGHT,
    marginBottom: 8,
    fontWeight: "600",
  },
  ratingButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  ratingButton: {
    width: "18%",
    paddingVertical: 8,
    backgroundColor: BG_DARK,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: TEXT_MUTED,
    alignItems: "center",
  },
  ratingButtonActive: {
    backgroundColor: ACCENT_PINK,
    borderColor: ACCENT_PINK,
  },
  ratingButtonText: {
    fontSize: 12,
    color: TEXT_LIGHT,
    fontWeight: "600",
  },
  reviewInput: {
    backgroundColor: BG_DARK,
    color: TEXT_LIGHT,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
    fontSize: 13,
    borderWidth: 1,
    borderColor: TEXT_MUTED,
    textAlignVertical: "top",
    minHeight: 100,
  },
  charCount: {
    fontSize: 11,
    color: TEXT_MUTED,
    marginBottom: 12,
    textAlign: "right",
  },
  submitButton: {
    backgroundColor: ACCENT_PINK,
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: "center",
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: TEXT_LIGHT,
    fontSize: 14,
    fontWeight: "600",
  },
  addButtonActive: {
    borderColor: ACCENT_PINK,
    backgroundColor: "rgba(178, 7, 16, 0.2)",
  },
  // Estilos para sección de plataformas
  platformsSection: {
    marginBottom: 20,
  },
  platformsSectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: TEXT_LIGHT,
    marginBottom: 10,
  },
  platformBadges: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  platformLogoImage: {
    width: 32,
    height: 32,
  },
  // Estilos para estadísticas de reseñas tipo Google
  reviewStatsContainer: {
    backgroundColor: BG_CARD,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(0, 217, 255, 0.2)",
  },
  reviewStatsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  reviewStatsAverage: {
    fontSize: 48,
    fontWeight: "bold",
    color: TEXT_LIGHT,
    marginRight: 16,
  },
  reviewStatsStars: {
    flexDirection: "row",
    marginBottom: 4,
  },
  reviewStatsCount: {
    fontSize: 13,
    color: TEXT_MUTED,
  },
  reviewStatsDistribution: {
    marginTop: 8,
  },
  reviewStatsBar: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  reviewStatsBarLabel: {
    width: 20,
    fontSize: 12,
    color: TEXT_MUTED,
    marginRight: 8,
  },
  reviewStatsBarBg: {
    flex: 1,
    height: 8,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 4,
    overflow: "hidden",
  },
  reviewStatsBarFill: {
    height: "100%",
    backgroundColor: ACCENT_CYAN,
    borderRadius: 4,
  },
  // Estilos para sección de género
  genreSection: {
    marginBottom: 20,
  },
  genreSectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: TEXT_LIGHT,
    marginBottom: 10,
  },
  genreBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: BG_CARD,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: ACCENT_CYAN,
    gap: 6,
  },
  genreBadgeText: {
    fontSize: 13,
    fontWeight: "600",
    color: TEXT_LIGHT,
  },
  // Estilos para botón de ver reseñas
  showReviewsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: BG_CARD,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: ACCENT_CYAN,
    gap: 8,
  },
  showReviewsButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: ACCENT_CYAN,
  },
});
