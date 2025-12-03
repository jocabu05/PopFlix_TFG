import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { useAuth } from "../hooks/useAuth";

const PRIMARY_BLUE = "#1976D2";

interface Platform {
  id: number;
  name: string;
  icon: string;
  color: string;
  selected?: boolean;
}

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
      const response = await fetch("http://localhost:9999/api/platforms");
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

  const savePlatforms = async () => {
    if (selectedPlatforms.length === 0) {
      alert("Por favor selecciona al menos una plataforma");
      return;
    }

    try {
      setSaving(true);
      const response = await fetch(
        `http://localhost:9999/api/user/${user?.id}/platforms`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ platformIds: selectedPlatforms }),
        }
      );

      if (response.ok) {
        setPlatformsSelected(true);
        alert("✅ Plataformas guardadas");
        router.push("/home");
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
        <ActivityIndicator size="large" color={PRIMARY_BLUE} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>¿Qué plataformas tienes?</Text>
        <Text style={styles.subtitle}>Selecciona tus servicios de streaming</Text>
      </View>

      {/* Plataformas Grid */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.gridContainer}>
          {platforms.map((platform) => (
            <TouchableOpacity
              key={platform.id}
              style={[
                styles.platformCard,
                selectedPlatforms.includes(platform.id) && styles.platformCardSelected,
              ]}
              onPress={() => togglePlatform(platform.id)}
            >
              <View
                style={[
                  styles.platformIcon,
                  { backgroundColor: selectedPlatforms.includes(platform.id) ? platform.color : "#ddd" },
                ]}
              >
                <Text style={styles.platformInitial}>
                  {platform.name.charAt(0)}
                </Text>
              </View>
              <Text style={styles.platformName}>{platform.name}</Text>
              {selectedPlatforms.includes(platform.id) && (
                <View style={styles.checkmark}>
                  <Text style={styles.checkmarkText}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
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
    backgroundColor: "#0A1929",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0A1929",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
    backgroundColor: "#0A1929",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#aaa",
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  platformCard: {
    width: "48%",
    aspectRatio: 1,
    borderRadius: 12,
    backgroundColor: "#1a1a1a",
    padding: 12,
    marginBottom: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#333",
  },
  platformCardSelected: {
    borderColor: PRIMARY_BLUE,
    backgroundColor: "#0D2847",
  },
  platformIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  platformInitial: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
  },
  platformName: {
    fontSize: 12,
    fontWeight: "600",
    color: "#fff",
    textAlign: "center",
  },
  checkmark: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: PRIMARY_BLUE,
    alignItems: "center",
    justifyContent: "center",
  },
  checkmarkText: {
    color: "#fff",
    fontWeight: "bold",
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#333",
    backgroundColor: "#0A1929",
  },
  selectedCount: {
    color: "#aaa",
    textAlign: "center",
    marginBottom: 12,
    fontSize: 12,
  },
  saveButton: {
    backgroundColor: PRIMARY_BLUE,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
