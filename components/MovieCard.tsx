import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const ACCENT_CYAN = "#00d9ff";
const ACCENT_PINK = "#ff006e";
const BG_CARD = "#1a2f45";
const TEXT_LIGHT = "#ffffff";

interface Movie {
  id: number;
  title: string;
  poster_url: string;
  rating?: number;
}

interface MovieCardProps {
  movie: Movie;
  onPress: () => void;
  isFavorite?: boolean;
  onFavoritePress?: () => void;
}

export default function MovieCard({
  movie,
  onPress,
  isFavorite = false,
  onFavoritePress,
}: MovieCardProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const PLACEHOLDER = "https://via.placeholder.com/154x230/1a2f45/ffffff?text=No+Image";

  // Build a safe optimized poster URL. Some DB entries have malformed paths
  // (extra segments). We try three variants in order:
  // 1) short size replacement (w342 -> w154)
  // 2) reconstruct using last path segment at TMDB base
  // 3) placeholder
  const original = movie.poster_url || "";
  const shortVariant = original ? original.replace("w342", "w154") : "";
  const lastSegment = original.split('/').filter(Boolean).pop() || "";
  const reconstructed = lastSegment && lastSegment.endsWith('.jpg')
    ? `https://image.tmdb.org/t/p/w154/${lastSegment}`
    : "";
  const [currentUri, setCurrentUri] = useState<string | null>(
    shortVariant || reconstructed || null
  );

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.posterContainer}>
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={ACCENT_CYAN} />
          </View>
        )}

        {!error && currentUri ? (
          <Image
            source={{ uri: currentUri }}
            style={styles.poster}
            onLoadStart={() => setLoading(true)}
            onLoadEnd={() => setLoading(false)}
            onError={() => {
              // Retry with reconstructed URL once before falling back to placeholder
              if (attempt === 0 && reconstructed && currentUri !== reconstructed) {
                setAttempt(1);
                setCurrentUri(reconstructed);
                return;
              }
              setError(true);
              setLoading(false);
            }}
          />
        ) : (
          <View style={styles.placeholderContainer}>
            <MaterialCommunityIcons
              name="image-off"
              size={24}
              color={ACCENT_PINK}
            />
          </View>
        )}

        {/* Favorite Button */}
        {onFavoritePress && (
          <TouchableOpacity
            style={styles.favoriteBtn}
            onPress={onFavoritePress}
          >
            <MaterialCommunityIcons
              name={isFavorite ? "heart" : "heart-outline"}
              size={20}
              color={ACCENT_PINK}
            />
          </TouchableOpacity>
        )}

        {/* Rating Badge */}
        {movie.rating && (
          <View style={styles.ratingBadge}>
            <MaterialCommunityIcons
              name="star"
              size={12}
              color="#FFD700"
            />
            <Text style={styles.ratingText}>{Number(movie.rating).toFixed(1)}</Text>
          </View>
        )}
      </View>

      <Text style={styles.title} numberOfLines={2}>
        {movie.title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 140,
    marginRight: 12,
    marginBottom: 16,
  },
  posterContainer: {
    position: "relative",
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: BG_CARD,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  poster: {
    width: "100%",
    height: 200,
    backgroundColor: BG_CARD,
  },
  loadingContainer: {
    position: "absolute",
    width: "100%",
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: BG_CARD,
    zIndex: 10,
  },
  placeholderContainer: {
    width: "100%",
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: BG_CARD,
  },
  favoriteBtn: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    borderRadius: 20,
    padding: 6,
    zIndex: 15,
  },
  ratingBadge: {
    position: "absolute",
    bottom: 8,
    left: 8,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingText: {
    color: TEXT_LIGHT,
    fontSize: 11,
    fontWeight: "600",
  },
  title: {
    marginTop: 8,
    fontSize: 12,
    color: TEXT_LIGHT,
    fontWeight: "500",
    height: 32,
  },
});

