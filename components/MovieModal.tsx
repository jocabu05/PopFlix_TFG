import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
    Dimensions,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const BG_DARK = "#0F0F0F";
const BG_ACCENT = "#1A1A1A";
const NEON_RED = "#B20710";
const TEXT_LIGHT = "#FFFFFF";
const TEXT_MUTED = "#B0B0B0";

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
  rating: number;
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
  
  if (!movie) return null;

  // Mock reviews - en producción vendrían de la API
  const mockReviews: Review[] = [
    {
      id: "1",
      author: "Juan García",
      rating: 9,
      content: "Una película increíble, recomendada sin dudas. La cinematografía es hermosa y la trama mantiene el suspenso.",
      date: "Hace 2 días"
    },
    {
      id: "2",
      author: "María López",
      rating: 8,
      content: "Muy buena película. Los actores hicieron un excelente trabajo.",
      date: "Hace 1 semana"
    },
    {
      id: "3",
      author: "Carlos Rodríguez",
      rating: 7,
      content: "Está bien, pero esperaba más. La segunda mitad es mejor que la primera.",
      date: "Hace 10 días"
    },
  ];

  const displayedReviews = showAllReviews ? mockReviews : mockReviews.slice(0, 1);


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
              <View style={styles.reviewsList}>
                {displayedReviews.map((review) => (
                  <View key={review.id} style={styles.reviewItem}>
                    <View style={styles.reviewHeader}>
                      <Text style={styles.reviewAuthor}>{review.author}</Text>
                      <View style={styles.reviewRating}>
                        <MaterialCommunityIcons
                          name="star"
                          size={14}
                          color={NEON_RED}
                        />
                        <Text style={styles.reviewRatingText}>{review.rating}/10</Text>
                      </View>
                    </View>
                    <Text style={styles.reviewDate}>{review.date}</Text>
                    <Text style={styles.reviewContent}>{review.content}</Text>
                  </View>
                ))}
              </View>
              
              {mockReviews.length > 1 && !showAllReviews && (
                <TouchableOpacity 
                  style={styles.showMoreButton}
                  onPress={() => setShowAllReviews(true)}
                >
                  <Text style={styles.showMoreText}>Ver más reseñas ({mockReviews.length})</Text>
                  <MaterialCommunityIcons
                    name="chevron-down"
                    size={20}
                    color={NEON_RED}
                  />
                </TouchableOpacity>
              )}

              {showAllReviews && mockReviews.length > 1 && (
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
  addButtonActive: {
    borderColor: NEON_RED,
    backgroundColor: "rgba(178, 7, 16, 0.2)",
  },
});
