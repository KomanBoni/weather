import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function SearchScreen() {
  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        <ThemedText type="title">Recherche de ville</ThemedText>
        <ThemedText style={styles.subtitle}>
          Point d'entrée — Étape 2 : champ de recherche + bouton + historique
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
