import { useAuth } from "@/hooks/useAuth";
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

const BG_DARK = "#0F0F0F";
const BG_ACCENT = "#1A1A1A";
const NEON_RED = "#B20710";
const TEXT_LIGHT = "#FFFFFF";
const TEXT_MUTED = "#B0B0B0";
const API_URL = "http://172.20.10.2:9999";

export interface MovieDetail {
  id: number;
  title: string;
  description: string;
  poster_url: string;
  rating: number;
  genre: string;
  platform: string;
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

interface MovieModalProps {
  visible: boolean;
  movie: MovieDetail | null;
  onClose: () => void;
  onAddToFavorites?: (movieId: number) => void;
  isFavorite?: boolean;
}

const { height } = Dimensions.get("window");

export default function MovieModal({ 
  visible, 
  movie, 
  onClose,
  onAddToFavorites,
  isFavorite = false 
}: MovieModalProps) {
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(8);
  const [reviewContent, setReviewContent] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  // Cargar reseñas reales de TMDB cuando el modal se abre
  useEffect(() => {
    if (!visible || !movie) {
      return;
    }

    const loadReviews = async () => {
      try {
        setLoadingReviews(true);
        const response = await fetch(`${API_URL}/api/movies/${movie.id}/reviews`);
        const data = await response.json();
        setReviews(data.reviews || []);
      } catch (error) {
        console.error("Error loading reviews:", error);
        setReviews([]);
      } finally {
        setLoadingReviews(false);
      }
    };

    loadReviews();
  }, [visible, movie?.id]);

  const submitReview = async () => {
    if (!movie) return;
    
    if (reviewContent.trim().length < 10) {
      alert("La reseña debe tener al menos 10 caracteres");
      return;
    }

    try {
      setSubmittingReview(true);
      const { user } = useAuth();
      const userId = user?.id;
      
      if (!userId) {
        alert("Debes estar logged in para publicar una reseña");
        setSubmittingReview(false);
        return;
      }
      
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
        loadReviews();
      } else {
        alert("Error al publicar la reseña");
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
    } catch (error) {
      console.error("Error loading reviews:", error);
      setReviews([]);
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
            <Image
              source={{ uri: movie.poster_url }}
              style={styles.posterImage}
            />
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
                  color={NEON_RED}
                />
                <Text style={styles.metaText}>{movie.rating}/10</Text>
              </View>

              {movie.year && (
                <View style={styles.metaItem}>
                  <MaterialCommunityIcons
                    name="calendar"
                    size={16}
                    color={NEON_RED}
                  />
                  <Text style={styles.metaText}>{movie.year}</Text>
                </View>
              )}

              {movie.duration && (
                <View style={styles.metaItem}>
                  <MaterialCommunityIcons
                    name="clock"
                    size={16}
                    color={NEON_RED}
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
                  color={isFavorite ? NEON_RED : TEXT_LIGHT}
                />
              </TouchableOpacity>
            </View>

            {/* Sinopsis */}
            <View style={styles.synopsisContainer}>
              <Text style={styles.synopsisTitle}>Sinopsis</Text>
              <Text style={styles.synopsisText}>{movie.description}</Text>
            </View>

            {/* Reseñas */}
            <View style={styles.reviewsContainer}>
              <Text style={styles.reviewsTitle}>Reseñas</Text>
              {loadingReviews ? (
                <ActivityIndicator size="large" color={NEON_RED} style={{ marginVertical: 20 }} />
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
                              color={NEON_RED}
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
                <Text style={styles.noReviewsText}>No hay reseñas disponibles para esta película</Text>
              )}
              
              {reviews.length > 1 && !showAllReviews && (
                <TouchableOpacity 
                  style={styles.showMoreButton}
                  onPress={() => setShowAllReviews(true)}
                >
                  <Text style={styles.showMoreText}>Ver más reseñas ({reviews.length})</Text>
                  <MaterialCommunityIcons
                    name="chevron-down"
                    size={20}
                    color={NEON_RED}
                  />
                </TouchableOpacity>
              )}

              {showAllReviews && reviews.length > 1 && (
                <TouchableOpacity 
                  style={styles.showMoreButton}
                  onPress={() => setShowAllReviews(false)}
                >
                  <Text style={styles.showMoreText}>Ver menos</Text>
                  <MaterialCommunityIcons
                    name="chevron-up"
                    size={20}
                    color={NEON_RED}
                  />
                </TouchableOpacity>
              )}

              {/* Botón para crear reseña */}
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
                    {movie.rating} / 10
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
    backgroundColor: BG_ACCENT,
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
    backgroundColor: BG_ACCENT,
    borderRadius: 16,
  },
  platformTag: {
    backgroundColor: NEON_RED,
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
    backgroundColor: NEON_RED,
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
    backgroundColor: BG_ACCENT,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: NEON_RED,
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
    borderBottomColor: BG_ACCENT,
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
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: NEON_RED,
    borderRadius: 4,
  },
  platformBadgeText: {
    fontSize: 12,
    fontWeight: "bold",
    color: TEXT_LIGHT,
  },
  ratingBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: BG_ACCENT,
    borderRadius: 4,
    borderLeftWidth: 3,
    borderLeftColor: NEON_RED,
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
    backgroundColor: BG_ACCENT,
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: NEON_RED,
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
    color: NEON_RED,
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
    color: NEON_RED,
    fontWeight: "600",
  },
  createReviewButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: NEON_RED,
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
    backgroundColor: BG_ACCENT,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: NEON_RED,
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
    backgroundColor: NEON_RED,
    borderColor: NEON_RED,
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
    backgroundColor: NEON_RED,
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
    borderColor: NEON_RED,
    backgroundColor: "rgba(178, 7, 16, 0.2)",
  },
});
