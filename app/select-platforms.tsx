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
  View
} from "react-native";
import { useAuth } from "../hooks/useAuth";

const PRIMARY_BLUE = "#1976D2";

// Paleta cinematográfica profesional tipo streaming
const BG_DARK = "#0F0F0F";              // Negro profundo (Netflix-style)
const BG_ACCENT = "#1A1A1A";            // Gris oscuro
const NEON_RED = "#E50914";             // Rojo Netflix profundo
const NEON_ORANGE = "#D97706";          // Naranja cálido suave
const TEXT_LIGHT = "#FFFFFF";
const TEXT_MUTED = "#B0B0B0";

interface Platform {
  id: number;
  name: string;
  icon: string;
  color: string;
  selected?: boolean;
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
    otros: require("../assets/logos/logo-netflix.png"),
  };
  
  const key = name.toLowerCase().trim();
  return logoMap[key] || logoMap["otros"];
};

export default function SelectPlatformsScreen() {
  const router = useRouter();
  const { user, setPlatformsSelected } = useAuth();
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPlatforms();
  }, []);

  const loadPlatforms = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://192.168.68.103:9999/api/platforms");
      const data = await response.json();
      setPlatforms(data.platforms);
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

  const selectAll = () => {
    setSelectedPlatforms(platforms.map(p => p.id));
  };

  const deselectAll = () => {
    setSelectedPlatforms([]);
  };

  const savePlatforms = async () => {
    if (selectedPlatforms.length === 0) {
      alert("Por favor selecciona al menos una plataforma");
      return;
    }

    try {
      setSaving(true);
      const response = await fetch(
        `http://192.168.68.103:9999/api/user/${user?.id}/platforms`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ platformIds: selectedPlatforms }),
        }
      );

      if (response.ok) {
        setPlatformsSelected(true);
        alert("✅ Plataformas guardadas");
        router.push("/(tabs)");
      } else {
        alert("❌ Error guardando plataformas");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("❌ Error al guardar");
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
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>🎬 Tus Plataformas</Text>
        <Text style={styles.subtitle}>Selecciona tus servicios de streaming favoritos</Text>
      </View>

      {/* Plataformas Grid */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.gridContainer}>
          {platforms.map((platform) => {
            const isOtros = platform.name.toLowerCase() === 'otros';
            return !isOtros ? (
              <TouchableOpacity
                key={platform.id}
                style={[
                  styles.platformCard,
                  selectedPlatforms.includes(platform.id) && styles.platformCardSelected,
                ]}
                onPress={() => togglePlatform(platform.id)}
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
            ) : null;
          })}
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.selectedCount}>
          {selectedPlatforms.length} plataforma{selectedPlatforms.length !== 1 ? "s" : ""} seleccionada{selectedPlatforms.length !== 1 ? "s" : ""}
        </Text>
        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={savePlatforms}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.saveButtonText}>Continuar</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG_DARK,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: BG_DARK,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 30,
    backgroundColor: BG_DARK,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: TEXT_LIGHT,
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 15,
    color: TEXT_MUTED,
    fontWeight: "500",
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  platformCard: {
    width: "48%",
    aspectRatio: 1.1,
    borderRadius: 0,
    backgroundColor: BG_ACCENT,
    padding: 16,
    marginBottom: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(229,9,20,0.2)",
  },
  platformCardSelected: {
    borderColor: NEON_RED,
    backgroundColor: "rgba(229,9,20,0.12)",
  },
  platformIcon: {
    width: 90,
    height: 90,
    borderRadius: 0,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  logoImage: {
    width: 90,
    height: 90,
    marginBottom: 16,
  },
  platformInitial: {
    fontSize: 32,
    fontWeight: "bold",
    color: TEXT_LIGHT,
  },
  platformEmoji: {
    fontSize: 54,
    fontWeight: "900",
    color: TEXT_LIGHT,
  },
  platformName: {
    fontSize: 14,
    fontWeight: "800",
    color: TEXT_LIGHT,
    textAlign: "center",
  },
  checkmark: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 28,
    height: 28,
    borderRadius: 0,
    backgroundColor: NEON_RED,
    alignItems: "center",
    justifyContent: "center",
  },
  checkmarkText: {
    color: "#fff",
    fontWeight: "bold",
  },
  footer: {
    padding: 20,
    paddingBottom: 30,
    borderTopWidth: 1,
    borderTopColor: "rgba(229,9,20,0.2)",
    backgroundColor: BG_DARK,
  },
  selectedCount: {
    color: TEXT_MUTED,
    textAlign: "center",
    marginBottom: 16,
    fontSize: 13,
    fontWeight: "500",
  },
  saveButton: {
    backgroundColor: NEON_RED,
    paddingVertical: 16,
    borderRadius: 0,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 50,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: TEXT_LIGHT,
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingRight: 12,
  },
  headerButtons: {
    flexDirection: "row",
    gap: 8,
  },
  selectButton: {
    backgroundColor: NEON_RED,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 0,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 36,
  },
  deselectButton: {
    backgroundColor: "rgba(229,9,20,0.3)",
  },
  selectButtonText: {
    color: TEXT_LIGHT,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  selectAllContainer: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(229,9,20,0.2)",
  },
  selectAllButton: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: NEON_RED,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 0,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  clearButton: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "rgba(229,9,20,0.3)",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 0,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  selectAllText: {
    color: TEXT_LIGHT,
    fontSize: 12,
    fontWeight: "700",
  },
  quickActionsCard: {
    backgroundColor: BG_ACCENT,
    borderRadius: 0,
    padding: 16,
    minHeight: 120,
  },
  selectAllCard: {
    backgroundColor: BG_ACCENT,
    borderWidth: 2,
    borderColor: NEON_RED,
    borderRadius: 0,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 200,
  },
  cardTitle: {
    color: TEXT_LIGHT,
    fontSize: 14,
    fontWeight: "700",
    marginTop: 12,
    marginBottom: 16,
  },
  buttonGroup: {
    width: "100%",
    gap: 8,
  },
  actionButton: {
    flexDirection: "row",
    backgroundColor: NEON_RED,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 0,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  actionButtonSecondary: {
    backgroundColor: "rgba(229,9,20,0.3)",
  },
  actionButtonText: {
    color: TEXT_LIGHT,
    fontSize: 12,
    fontWeight: "700",
  },
});
