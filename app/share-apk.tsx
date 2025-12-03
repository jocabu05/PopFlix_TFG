import { QRGenerator } from '@/components/QRGenerator';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function ShareAPKScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [apkUrl, setApkUrl] = useState<string | null>(null);

  // Simular generación de APK (en producción, usarías EAS o tu servidor)
  const handleGenerateAPK = async () => {
    setLoading(true);
    try {
      // Este es un ejemplo. En producción:
      // 1. Construye con: expo prebuild --clean && cd android && ./gradlew assembleDebuild
      // 2. Sube el APK a tu servidor
      // 3. Obtén la URL

      const mockUrl = 'https://tu-servidor.com/popflix-app.apk';
      
      Alert.alert(
        'APK Generada',
        'Para compartir el APK:\n\n1. Construye con: expo prebuild --clean\n2. cd android && ./gradlew assembleDebug\n3. Sube a tu servidor y cambia la URL en el QR'
      );

      setApkUrl(mockUrl);
    } catch (error) {
      Alert.alert('Error', 'No se pudo generar la APK');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>📱 Compartir popFlix por QR</Text>

      {apkUrl ? (
        <>
          <Text style={styles.subtitle}>Escanea el código QR para descargar la APK</Text>
          <QRGenerator url={apkUrl} size={280} />
          
          <TouchableOpacity
            style={styles.button}
            onPress={() => setApkUrl(null)}
          >
            <Text style={styles.buttonText}>Generar Nuevo QR</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={styles.description}>
            Genera un QR para compartir la APK de popFlix con tus amigos
          </Text>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleGenerateAPK}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Generar APK y QR</Text>
            )}
          </TouchableOpacity>

          <View style={styles.stepsContainer}>
            <Text style={styles.stepsTitle}>Pasos para generar APK:</Text>
            
            <View style={styles.step}>
              <Text style={styles.stepNumber}>1</Text>
              <Text style={styles.stepText}>Abre PowerShell en la carpeta del proyecto</Text>
            </View>

            <View style={styles.step}>
              <Text style={styles.stepNumber}>2</Text>
              <Text style={styles.stepText}>Ejecuta: expo prebuild --clean</Text>
            </View>

            <View style={styles.step}>
              <Text style={styles.stepNumber}>3</Text>
              <Text style={styles.stepText}>cd android && ./gradlew assembleDebug</Text>
            </View>

            <View style={styles.step}>
              <Text style={styles.stepNumber}>4</Text>
              <Text style={styles.stepText}>La APK estará en android/app/build/outputs/apk/debug/</Text>
            </View>

            <View style={styles.step}>
              <Text style={styles.stepNumber}>5</Text>
              <Text style={styles.stepText}>Sube el archivo a tu servidor o Google Drive</Text>
            </View>

            <View style={styles.step}>
              <Text style={styles.stepNumber}>6</Text>
              <Text style={styles.stepText}>Copia la URL pública y actualiza el link en el QR</Text>
            </View>
          </View>
        </>
      )}

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Text style={styles.backButtonText}>← Volver</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E1A',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
    marginTop: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#aaa',
    textAlign: 'center',
    marginBottom: 20,
  },
  description: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 20,
  },
  button: {
    backgroundColor: '#C11119',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  buttonDisabled: {
    backgroundColor: '#5A5A5A',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  stepsContainer: {
    backgroundColor: '#1C2333',
    borderRadius: 10,
    padding: 15,
    marginTop: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#C11119',
  },
  stepsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  step: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  stepNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#C11119',
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 30,
    marginRight: 12,
  },
  stepText: {
    flex: 1,
    color: '#ddd',
    fontSize: 13,
    lineHeight: 18,
  },
  backButton: {
    marginTop: 20,
    paddingVertical: 12,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#C11119',
    fontSize: 16,
    fontWeight: '600',
  },
});
