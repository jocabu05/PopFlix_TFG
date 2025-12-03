import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

interface QRGeneratorProps {
  url: string;
  size?: number;
  title?: string;
}

export function QRGenerator({ url, size = 250, title = 'Escanea para descargar' }: QRGeneratorProps) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.qrContainer}>
        <QRCode 
          value={url} 
          size={size}
          color="#000000"
          backgroundColor="#FFFFFF"
        />
      </View>
      <Text style={styles.url}>{url}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#0A0E1A',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  qrContainer: {
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 15,
    marginBottom: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  url: {
    color: '#aaa',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 10,
  },
});
