import { View, Text, StyleSheet } from 'react-native';

const BG_DARK = '#0F0F0F';
const TEXT_LIGHT = '#FFFFFF';

export default function RegisterValidations() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Register Validations</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG_DARK, alignItems: 'center', justifyContent: 'center' },
  text: { color: TEXT_LIGHT, fontSize: 18 },
});
