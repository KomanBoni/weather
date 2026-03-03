import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
    FlatList,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    StyleSheet,
    TextInput,
    View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';

const MAX_RECENT = 10;

export default function SearchScreen() {
  const router = useRouter();
  const [cityInput, setCityInput] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [validationError, setValidationError] = useState<string | null>(null);

  const borderColor = useThemeColor({}, 'icon');
  const tintColor = useThemeColor({}, 'tint');
  const textColor = useThemeColor({}, 'text');

  const searchCity = useCallback(
    (cityName: string) => {
      const trimmed = cityName.trim();
      if (!trimmed) {
        setValidationError('Veuillez saisir un nom de ville.');
        return;
      }
      setValidationError(null);
      setRecentSearches((prev) => {
        const filtered = prev.filter((c) => c.toLowerCase() !== trimmed.toLowerCase());
        return [trimmed, ...filtered].slice(0, MAX_RECENT);
      });
      setCityInput('');
      router.push({
        pathname: '/weather-result',
        params: { cityName: trimmed },
      });
    },
    [router]
  );

  const handleSearch = useCallback(() => {
    searchCity(cityInput);
  }, [cityInput, searchCity]);

  const handleSelectRecent = useCallback(
    (city: string) => {
      searchCity(city);
    },
    [searchCity]
  );

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}>
        <View style={styles.searchSection}>
          <TextInput
            style={[styles.input, { borderColor, color: textColor }]}
            placeholder="Ex: Paris, Lyon, Marseille..."
            placeholderTextColor={borderColor}
            value={cityInput}
            onChangeText={(text) => {
              setCityInput(text);
              setValidationError(null);
            }}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
            autoCapitalize="words"
            autoCorrect={false}
          />
          <Pressable
            style={({ pressed }) => [styles.button, { backgroundColor: tintColor }, pressed && styles.buttonPressed]}
            onPress={handleSearch}>
            <ThemedText style={styles.buttonText}>Rechercher</ThemedText>
          </Pressable>
          {validationError ? (
            <ThemedText style={styles.error}>{validationError}</ThemedText>
          ) : null}
        </View>

        <View style={styles.recentSection}>
          <ThemedText type="subtitle" style={styles.recentTitle}>
            Dernières recherches
          </ThemedText>
          <FlatList
            data={recentSearches}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <Pressable
                style={({ pressed }) => [styles.recentItem, pressed && styles.recentItemPressed]}
                onPress={() => handleSelectRecent(item)}>
                <ThemedText>{item}</ThemedText>
              </Pressable>
            )}
            ListEmptyComponent={
              <ThemedText style={styles.empty}>Aucune recherche récente</ThemedText>
            }
          />
        </View>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
    padding: 20,
  },
  searchSection: {
    marginBottom: 24,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 12,
  },
  button: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  error: {
    color: '#c00',
    marginTop: 8,
    fontSize: 14,
  },
  recentSection: {
    flex: 1,
  },
  recentTitle: {
    marginBottom: 12,
  },
  recentItem: {
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(128,128,128,0.3)',
  },
  recentItemPressed: {
    opacity: 0.7,
  },
  empty: {
    opacity: 0.7,
    fontStyle: 'italic',
    marginTop: 12,
  },
});
