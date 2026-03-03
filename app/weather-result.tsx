import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import {
  fetchCurrentWeather,
  getWeatherIconUrl,
  type CurrentWeather,
  type WeatherApiError,
} from '@/lib/weather-api';

type State = { status: 'loading' } | { status: 'success'; data: CurrentWeather } | { status: 'error'; error: WeatherApiError };

export default function WeatherResultScreen() {
  const router = useRouter();
  const { cityName } = useLocalSearchParams<{ cityName: string }>();
  const [state, setState] = useState<State>({ status: 'loading' });

  const loadWeather = useCallback(async () => {
    if (!cityName?.trim()) {
      setState({ status: 'error', error: { type: 'city_not_found', message: 'Nom de ville manquant.' } });
      return;
    }
    setState({ status: 'loading' });
    try {
      const data = await fetchCurrentWeather(cityName.trim());
      setState({ status: 'success', data });
    } catch (err: unknown) {
      const e = err as WeatherApiError;
      if (e?.type) {
        setState({ status: 'error', error: e });
      } else if (err instanceof TypeError && (err.message === 'Network request failed' || err.message?.includes('fetch'))) {
        setState({ status: 'error', error: { type: 'network', message: 'Pas de connexion internet.' } });
      } else {
        setState({ status: 'error', error: { type: 'unknown', message: 'Une erreur est survenue.' } });
      }
    }
  }, [cityName]);

  useEffect(() => {
    loadWeather();
  }, [loadWeather]);

  if (state.status === 'loading') {
    return (
      <ThemedView style={styles.center}>
        <ActivityIndicator size="large" />
        <ThemedText style={styles.loadingText}>Chargement de la météo...</ThemedText>
      </ThemedView>
    );
  }

  if (state.status === 'error') {
    return (
      <ThemedView style={styles.center}>
        <ThemedText type="subtitle" style={styles.errorTitle}>
          Erreur
        </ThemedText>
        <ThemedText style={styles.errorMessage}>{state.error.message}</ThemedText>
        <Pressable style={styles.retryButton} onPress={loadWeather}>
          <ThemedText style={styles.retryButtonText}>Réessayer</ThemedText>
        </Pressable>
      </ThemedView>
    );
  }

  const { data } = state;

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <ThemedText type="title" style={styles.cityName}>
          {data.cityName}
        </ThemedText>

        <View style={styles.weatherCard}>
          <View style={styles.tempRow}>
            <ThemedText style={styles.temp}>{data.temp}°</ThemedText>
            <Image source={{ uri: getWeatherIconUrl(data.icon) }} style={styles.icon} />
          </View>
          <ThemedText style={styles.description}>{data.description}</ThemedText>
        </View>

        <View style={styles.details}>
          <View style={styles.detailItem}>
            <ThemedText style={styles.detailLabel}>Humidité</ThemedText>
            <ThemedText type="defaultSemiBold">{data.humidity} %</ThemedText>
          </View>
          <View style={styles.detailItem}>
            <ThemedText style={styles.detailLabel}>Vent</ThemedText>
            <ThemedText type="defaultSemiBold">{data.windSpeed.toFixed(1)} m/s</ThemedText>
          </View>
        </View>

        <Pressable
          style={({ pressed }) => [styles.forecastButton, pressed && styles.forecastButtonPressed]}
          onPress={() =>
            router.push({
              pathname: '/forecast',
              params: { lat: String(data.lat), lon: String(data.lon), cityName: data.cityName },
            })
          }>
          <ThemedText style={styles.forecastButtonText}>Voir les prévisions 5 jours</ThemedText>
        </Pressable>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    opacity: 0.8,
  },
  errorTitle: {
    marginBottom: 8,
  },
  errorMessage: {
    textAlign: 'center',
    marginBottom: 20,
    opacity: 0.9,
  },
  retryButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#0a7ea4',
    borderRadius: 12,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  scrollContent: {
    padding: 24,
    paddingTop: 24,
    flexGrow: 1,
  },
  cityName: {
    marginBottom: 24,
    textAlign: 'center',
  },
  weatherCard: {
    backgroundColor: 'rgba(128, 128, 128, 0.12)',
    borderRadius: 20,
    padding: 28,
    paddingTop: 32,
    marginBottom: 24,
    alignItems: 'center',
  },
  tempRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 12,
    minHeight: 90,
  },
  temp: {
    fontSize: 72,
    fontWeight: '700',
    letterSpacing: -2,
    lineHeight: 86,
    includeFontPadding: false,
  },
  icon: {
    width: 80,
    height: 80,
  },
  description: {
    fontSize: 20,
    textTransform: 'capitalize',
    opacity: 0.95,
  },
  details: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 32,
    justifyContent: 'center',
  },
  detailItem: {
    backgroundColor: 'rgba(128, 128, 128, 0.1)',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    minWidth: 120,
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 13,
    opacity: 0.8,
    marginBottom: 4,
  },
  forecastButton: {
    paddingVertical: 16,
    borderRadius: 14,
    backgroundColor: '#0a7ea4',
    alignItems: 'center',
  },
  forecastButtonPressed: {
    opacity: 0.9,
  },
  forecastButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
