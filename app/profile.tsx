import { View, Text, StyleSheet } from 'react-native';

const BG_DARK = '#0F0F0F';
const TEXT_LIGHT = '#FFFFFF';

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Profile - Coming Soon</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG_DARK, alignItems: 'center', justifyContent: 'center' },
  text: { color: TEXT_LIGHT, fontSize: 18 },
});
