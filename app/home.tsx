import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.text}>🏠 Bienvenido a POPFLIX</Text>
      
      <TouchableOpacity
        style={styles.shareButton}
        onPress={() => router.push("../share-apk")}
      >
        <Text style={styles.shareButtonText}>📱 Compartir por QR</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0A0E1A",
    padding: 20,
  },
  text: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 30,
  },
  shareButton: {
    backgroundColor: "#C11119",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 10,
    marginTop: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  shareButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});

