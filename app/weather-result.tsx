import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function WeatherResultScreen() {
  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        <ThemedText type="title">Météo actuelle</ThemedText>
        <ThemedText style={styles.subtitle}>
          Étape 3 : réception ville via params, appel API, loading / success / error
        </ThemedText>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  subtitle: {
    marginTop: 12,
    opacity: 0.8,
  },
});
