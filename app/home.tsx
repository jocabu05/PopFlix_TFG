import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Animated,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useAuth } from "../hooks/useAuth";

// Colores
const BG_DARK = "#0F0F0F";
const BG_ACCENT = "#1A1A1A";
const NEON_RED = "#B20710";
const TEXT_LIGHT = "#FFFFFF";
const TEXT_MUTED = "#B0B0B0";

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
  const animScaleValues = useRef<{ [key: number]: Animated.Value }>({}).current;

  useEffect(() => {
    loadPlatforms();
  }, []);

  const loadPlatforms = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://172.20.10.2:9999/api/platforms");
      const data = await response.json();
      console.log("Plataformas cargadas:", data);
      const filtered = data.platforms.filter(
        (p: Platform) => p.name.toLowerCase() !== "otros"
      );
      console.log("Plataformas filtradas:", filtered);
      setPlatforms(filtered);
    } catch (error) {
      console.error("Error cargando plataformas:", error);
    } finally {
      setLoading(false);
    }
  };

  const togglePlatform = (platformId: number) => {
    console.log("TOGGLE - platformId:", platformId, "tipo:", typeof platformId);
    console.log("TOGGLE - antes:", selectedPlatforms);
    setSelectedPlatforms((prev) => {
      const newSelection = prev.includes(platformId)
        ? prev.filter((id) => id !== platformId)
        : [...prev, platformId];
      console.log("TOGGLE - después:", newSelection);
      return newSelection;
    });
    animatePlatform(platformId);
  };

  const animatePlatform = (platformId: number) => {
    if (!animScaleValues[platformId]) {
      animScaleValues[platformId] = new Animated.Value(1);
    }
    Animated.sequence([
      Animated.timing(animScaleValues[platformId], {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(animScaleValues[platformId], {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const savePlatforms = async () => {
    try {
      // Convertir a array seguro
      const platformsToSend: number[] = [];
      
      if (Array.isArray(selectedPlatforms)) {
        platformsToSend.push(...selectedPlatforms);
      }
      
      console.log("platformsToSend:", platformsToSend);
      console.log("user:", user);
      console.log("user?.id:", user?.id);
      
      if (platformsToSend.length === 0) {
        alert("Por favor selecciona al menos una plataforma");
        return;
      }

      if (!user?.id) {
        alert("Error: Usuario no autenticado");
        return;
      }

      setSaving(true);
      
      const payload = {
        platformIds: platformsToSend,
      };
      
      console.log("Enviando:", JSON.stringify(payload));
      
      const response = await fetch(
        `http://172.20.10.2:9999/api/user/${user.id}/platforms`,
        {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      console.log("Status:", response.status);
      const text = await response.text();
      console.log("Response:", text);
      
      try {
        const data = JSON.parse(text);
        if (response.ok || response.status === 201) {
          setPlatformsSelected(true);
          router.push("/(tabs)");
        } else {
          alert(data.message || "Error");
        }
      } catch (e) {
        console.error("No JSON response:", text);
        alert("Error al guardar");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error");
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
      contentContainerStyle={styles.content}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Bienvenido a POPFLIX</Text>
        <Text style={styles.subtitle}>Selecciona tus plataformas</Text>
      </View>

      {/* Stats */}
      <View style={styles.stats}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{platforms.length}</Text>
          <Text style={styles.statLabel}>Plataformas</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>∞</Text>
          <Text style={styles.statLabel}>Películas</Text>
        </View>
      </View>

      {/* Platforms Grid */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tus Plataformas</Text>
        <View style={styles.grid}>
          {platforms.map((platform) => {
            if (!animScaleValues[platform.id]) {
              animScaleValues[platform.id] = new Animated.Value(1);
            }
            const isSelected = selectedPlatforms.includes(platform.id);

            return (
              <Animated.View
                key={platform.id}
                style={[
                  {
                    transform: [{ scale: animScaleValues[platform.id] }],
                  },
                ]}
              >
                <TouchableOpacity
                  style={[styles.card, isSelected && styles.cardSelected]}
                  onPress={() => togglePlatform(platform.id)}
                  activeOpacity={0.9}
                >
                  <Image
                    source={getPlatformLogo(platform.name)}
                    style={styles.logo}
                    resizeMode="cover"
                  />
                  <Text style={styles.platformName}>{platform.name}</Text>
                  {isSelected && (
                    <View style={styles.badge}>
                      <MaterialCommunityIcons
                        name="check"
                        size={12}
                        color={TEXT_LIGHT}
                      />
                    </View>
                  )}
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>
      </View>

      {/* Button & Counter */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, saving && styles.buttonDisabled]}
          onPress={savePlatforms}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color={TEXT_LIGHT} size="small" />
          ) : (
            <Text style={styles.buttonText}>COMENZAR</Text>
          )}
        </TouchableOpacity>
        <Text style={styles.counter}>
          {selectedPlatforms.length} plataforma
          {selectedPlatforms.length !== 1 ? "s" : ""} seleccionada
          {selectedPlatforms.length !== 1 ? "s" : ""}
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
  content: {
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  centerContainer: {
    flex: 1,
    backgroundColor: BG_DARK,
    justifyContent: "center",
    alignItems: "center",
  },

  // Header
  header: {
    marginBottom: 24,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
    color: TEXT_LIGHT,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: "500",
    color: TEXT_MUTED,
  },

  // Stats
  stats: {
    flexDirection: "row",
    backgroundColor: BG_ACCENT,
    borderTopWidth: 3,
    borderTopColor: NEON_RED,
    borderRadius: 0,
    marginBottom: 28,
    paddingVertical: 16,
    paddingHorizontal: 20,
    justifyContent: "space-around",
    alignItems: "center",
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "900",
    color: NEON_RED,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: TEXT_MUTED,
  },
  divider: {
    width: 1,
    height: 30,
    backgroundColor: "rgba(229,9,20,0.2)",
  },

  // Section
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: TEXT_LIGHT,
    marginBottom: 18,
    letterSpacing: 0.3,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
    justifyContent: "center",
  },
  card: {
    width: "30%",
    minWidth: 100,
    backgroundColor: BG_ACCENT,
    borderWidth: 1.5,
    borderColor: "rgba(229,9,20,0.3)",
    borderRadius: 0,
    paddingVertical: 16,
    paddingHorizontal: 10,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  cardSelected: {
    borderColor: NEON_RED,
    borderWidth: 2,
    backgroundColor: "rgba(229,9,20,0.15)",
  },
  logo: {
    width: 75,
    height: 75,
    marginBottom: 10,
    borderRadius: 0,
  },
  platformName: {
    fontSize: 12,
    fontWeight: "700",
    color: TEXT_LIGHT,
    textAlign: "center",
    marginTop: 2,
  },
  badge: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: NEON_RED,
    alignItems: "center",
    justifyContent: "center",
  },

  // Footer
  footer: {
    marginBottom: 16,
  },
  button: {
    backgroundColor: NEON_RED,
    paddingVertical: 14,
    borderRadius: 0,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: TEXT_LIGHT,
    fontSize: 15,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  counter: {
    color: TEXT_MUTED,
    fontSize: 12,
    fontWeight: "500",
    textAlign: "center",
    marginTop: 10,
  },
});

