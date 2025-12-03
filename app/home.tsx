import { useRouter } from "expo-router";
import { useEffect } from "react";
import { Animated, StyleSheet, Text, TouchableOpacity } from "react-native";

// Paleta cinematográfica profesional tipo streaming
const BG_DARK = "#0F0F0F";              // Negro profundo (Netflix-style)
const BG_ACCENT = "#1A1A1A";            // Gris oscuro
const NEON_RED = "#E50914";             // Rojo Netflix profundo
const NEON_ORANGE = "#D97706";          // Naranja cálido suave
const TEXT_LIGHT = "#FFFFFF";
const TEXT_MUTED = "#B0B0B0";

export default function HomeScreen() {
  const router = useRouter();
  
  // Animación del fondo
  const bgAnimation = new Animated.Value(0);
  
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bgAnimation, {
          toValue: 1,
          duration: 6000,
          useNativeDriver: false,
        }),
        Animated.timing(bgAnimation, {
          toValue: 0,
          duration: 6000,
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View 
      style={[
        styles.container,
        {
          backgroundColor: bgAnimation.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: [BG_DARK, BG_ACCENT, BG_DARK],
          }),
        }
      ]}
    >
      {/* Capa de luz animada superior */}
      <Animated.View 
        style={[
          styles.lightOverlay,
          {
            opacity: bgAnimation.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: [0.15, 0.35, 0.15],
            }),
          }
        ]}
      />
      {/* Capa de luz animada inferior */}
      <Animated.View 
        style={[
          styles.lightOverlayBottom,
          {
            opacity: bgAnimation.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: [0.1, 0.2, 0.1],
            }),
          }
        ]}
      />
      <Text style={styles.text}>🎬 ¡Bienvenido a POPFLIX!</Text>
      <Text style={styles.subtitle}>Gracias por unirte a nuestra comunidad</Text>
      
      <TouchableOpacity
        style={styles.shareButton}
        onPress={() => router.push("/select-platforms")}
      >
        <Text style={styles.shareButtonText}>🎬 Seleccionar Plataformas</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: BG_DARK,
    padding: 20,
  },
  lightOverlay: {
    position: "absolute",
    top: -80,
    right: -120,
    width: 350,
    height: 350,
    borderRadius: 175,
    backgroundColor: NEON_RED,
    zIndex: 0,
    opacity: 0.08,
  },
  lightOverlayBottom: {
    position: "absolute",
    bottom: -100,
    left: -150,
    width: 330,
    height: 330,
    borderRadius: 165,
    backgroundColor: NEON_ORANGE,
    zIndex: 0,
    opacity: 0.06,
  },
  text: {
    color: TEXT_LIGHT,
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  subtitle: {
    color: TEXT_MUTED,
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 40,
    textAlign: "center",
  },
  shareButton: {
    backgroundColor: NEON_RED,
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderRadius: 0,
    borderWidth: 1.5,
    borderColor: "rgba(229,9,20,0.6)",
  },
  shareButtonText: {
    color: TEXT_LIGHT,
    fontSize: 16,
    fontWeight: "600",
  },
});

