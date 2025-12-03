import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useAuth } from "../hooks/useAuth";

// Paleta cinematográfica profesional tipo streaming
const BG_DARK = "#0F0F0F";
const BG_ACCENT = "#1A1A1A";
const NEON_RED = "#E50914";
const TEXT_LIGHT = "#FFFFFF";
const TEXT_MUTED = "#B0B0B0";
const TEXT_MUTED_LIGHT = "#888888";

interface Platform {
  id: number;
  name: string;
  icon: string;
  color: string;
}

const getPlatformLogo = (name: string): any => {
  const logoMap: { [key: string]: any } = {
    netflix: require("../assets/logos/logo-netflix.png"),
    "prime video": require("../assets/logos/prime-logo.png"),
    amazon: require("../assets/logos/prime-logo.png"),
    disney: require("../assets/logos/disney-logo.jpg"),
    "disney+": require("../assets/logos/disney-logo.jpg"),
    hbo: require("../assets/logos/hbo-logo.png"),
    "hbo max": require("../assets/logos/hbo-logo.png"),
    hulu: require("../assets/logos/hulu-logo.jpg"),
    paramount: require("../assets/logos/paramount-logo.png"),
    "paramount+": require("../assets/logos/paramount-logo.png"),
    apple: require("../assets/logos/appleTv-logo.png"),
    "apple tv+": require("../assets/logos/appleTv-logo.png"),
  };

  const key = name.toLowerCase().trim();
  return logoMap[key] || logoMap["netflix"];
};

export default function HomeScreen() {
  const router = useRouter();
  const { user, setPlatformsSelected } = useAuth();
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  useEffect(() => {
    loadPlatforms();
  }, []);

  const loadPlatforms = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://192.168.68.103:9999/api/platforms");
      const data = await response.json();
      // Filtrar "Otros"
      const filtered = data.platforms.filter(
        (p: Platform) => p.name.toLowerCase() !== 'otros'
      );
      setPlatforms(filtered);
    } catch (error) {
      console.error("Error cargando plataformas:", error);
    } finally {
      setLoading(false);
    }
  };

  const togglePlatform = (platformId: number) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platformId)
        ? prev.filter((id) => id !== platformId)
        : [...prev, platformId]
    );
  };

  const savePlatforms = async () => {
    if (selectedPlatforms.length === 0) {
      alert("Por favor selecciona al menos una plataforma");
      return;
    }

    try {
      setSaving(true);
      const response = await fetch("http://192.168.68.103:9999/api/users/platforms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id,
          platformIds: selectedPlatforms,
        }),
      });

      if (response.ok) {
        setPlatformsSelected(true);
        router.push("/(tabs)");
      }
    } catch (error) {
      console.error("Error guardando plataformas:", error);
      alert("Error al guardar las plataformas");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={NEON_RED} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Header Section */}
      <View style={styles.heroSection}>
        <Text style={styles.heroTitle}>Bienvenido a POPFLIX</Text>
        <Text style={styles.heroSubtitle}>Selecciona tus plataformas favoritas</Text>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{platforms.length}</Text>
          <Text style={styles.statLabel}>Plataformas</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{selectedPlatforms.length}</Text>
          <Text style={styles.statLabel}>Seleccionadas</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>∞</Text>
          <Text style={styles.statLabel}>Películas</Text>
        </View>
      </View>

      {/* Platforms Grid */}
      <View style={styles.platformsSection}>
        <Text style={styles.sectionTitle}>Tus Plataformas</Text>
        <View style={styles.platformsGrid}>
          {platforms.map((platform) => (
            <TouchableOpacity
              key={platform.id}
              style={[
                styles.platformCard,
                selectedPlatforms.includes(platform.id) && styles.platformCardSelected,
                hoveredCard === platform.id && styles.platformCardHovered,
              ]}
              onPress={() => togglePlatform(platform.id)}
              onPressIn={() => setHoveredCard(platform.id)}
              onPressOut={() => setHoveredCard(null)}
              activeOpacity={0.8}
            >
              <Image
                source={getPlatformLogo(platform.name)}
                style={styles.logoImage}
                resizeMode="cover"
              />
              <Text style={styles.platformName}>{platform.name}</Text>
              {selectedPlatforms.includes(platform.id) && (
                <View style={styles.checkmark}>
                  <MaterialCommunityIcons name="check" size={16} color={TEXT_LIGHT} />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* CTA Section */}
      <View style={styles.ctaSection}>
        <TouchableOpacity
          style={[styles.mainButton, saving && styles.mainButtonDisabled]}
          onPress={savePlatforms}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color={TEXT_LIGHT} />
          ) : (
            <Text style={styles.mainButtonText}>COMENZAR</Text>
          )}
        </TouchableOpacity>
        <Text style={styles.selectedCountText}>
          {selectedPlatforms.length} plataforma{selectedPlatforms.length !== 1 ? "s" : ""} seleccionada{selectedPlatforms.length !== 1 ? "s" : ""}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG_DARK,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
  },
  centerContainer: {
    flex: 1,
    backgroundColor: BG_DARK,
    justifyContent: "center",
    alignItems: "center",
  },
  heroSection: {
    alignItems: "center",
    marginBottom: 16,
  },
  heroTitle: {
    color: TEXT_LIGHT,
    fontSize: 28,
    fontWeight: "900",
    marginBottom: 4,
    textAlign: "center",
  },
  heroSubtitle: {
    color: TEXT_MUTED,
    fontSize: 13,
    fontWeight: "500",
    textAlign: "center",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: BG_ACCENT,
    paddingVertical: 20,
    paddingHorizontal: 12,
    borderRadius: 0,
    alignItems: "center",
    borderTopWidth: 3,
    borderTopColor: NEON_RED,
  },
  statNumber: {
    color: NEON_RED,
    fontSize: 24,
    fontWeight: "900",
    marginBottom: 4,
  },
  statLabel: {
    color: TEXT_MUTED,
    fontSize: 11,
    fontWeight: "600",
  },
  platformsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    color: TEXT_LIGHT,
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 12,
  },
  platformsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    justifyContent: "space-between",
  },
  platformCard: {
    width: "30%",
    backgroundColor: BG_ACCENT,
    paddingVertical: 12,
    paddingHorizontal: 6,
    borderRadius: 0,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(229,9,20,0.2)",
    position: "relative",
  },
  platformCardSelected: {
    borderColor: NEON_RED,
    backgroundColor: "rgba(229,9,20,0.12)",
  },
  platformCardHovered: {
    backgroundColor: "#252525",
    borderColor: "#FF3535",
  },
  logoImage: {
    width: 70,
    height: 70,
    marginBottom: 8,
    borderRadius: 0,
  },
  platformName: {
    fontSize: 11,
    fontWeight: "700",
    color: TEXT_LIGHT,
    textAlign: "center",
  },
  checkmark: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: NEON_RED,
    alignItems: "center",
    justifyContent: "center",
  },
  ctaSection: {
    marginTop: 16,
  },
  mainButton: {
    backgroundColor: NEON_RED,
    paddingVertical: 14,
    borderRadius: 0,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },
  mainButtonDisabled: {
    opacity: 0.6,
  },
  mainButtonText: {
    color: TEXT_LIGHT,
    fontSize: 15,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  selectedCountText: {
    color: TEXT_MUTED,
    textAlign: "center",
    marginTop: 8,
    fontSize: 12,
    fontWeight: "500",
  },
});

