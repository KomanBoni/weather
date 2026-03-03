import { Image } from 'expo-image';
import { useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import {
  fetchForecast,
  getWeatherIconUrl,
  type ForecastDay,
  type WeatherApiError,
} from '@/lib/weather-api';

type State =
  | { status: 'loading' }
  | { status: 'success'; data: ForecastDay[]; cityName: string }
  | { status: 'error'; error: WeatherApiError };

function ForecastItem({ item }: { item: ForecastDay }) {
  return (
    <View style={styles.item}>
      <View style={styles.itemLeft}>
        <ThemedText type="defaultSemiBold" style={styles.dayName}>
          {item.dayName}
        </ThemedText>
        <ThemedText style={styles.dateLabel}>{item.dateLabel}</ThemedText>
      </View>
      <Image source={{ uri: getWeatherIconUrl(item.icon) }} style={styles.icon} />
      <View style={styles.temps}>
        <ThemedText style={styles.tempMax}>{item.tempMax}°</ThemedText>
        <ThemedText style={styles.tempMin}>{item.tempMin}°</ThemedText>
      </View>
    </View>
  );
}

export default function ForecastScreen() {
  const { lat, lon, cityName } = useLocalSearchParams<{
    lat: string;
    lon: string;
    cityName?: string;
  }>();
  const [state, setState] = useState<State>({ status: 'loading' });

  const loadForecast = useCallback(async () => {
    const latNum = parseFloat(lat ?? '');
    const lonNum = parseFloat(lon ?? '');
    if (isNaN(latNum) || isNaN(lonNum)) {
      setState({
        status: 'error',
        error: { type: 'unknown', message: 'Coordonnées invalides.' },
      });
      return;
    }
    setState({ status: 'loading' });
    try {
      const data = await fetchForecast(latNum, lonNum);
      setState({ status: 'success', data, cityName: cityName ?? '' });
    } catch (err: unknown) {
      const e = err as WeatherApiError;
      if (e?.type) {
        setState({ status: 'error', error: e });
      } else if (
        err instanceof TypeError &&
        (err.message === 'Network request failed' || err.message?.includes('fetch'))
      ) {
        setState({
          status: 'error',
          error: { type: 'network', message: 'Pas de connexion internet.' },
        });
      } else {
        setState({
          status: 'error',
          error: { type: 'unknown', message: 'Une erreur est survenue.' },
        });
      }
    }
  }, [lat, lon, cityName]);

  useEffect(() => {
    loadForecast();
  }, [loadForecast]);

  if (state.status === 'loading') {
    return (
      <ThemedView style={styles.center}>
        <ActivityIndicator size="large" />
        <ThemedText style={styles.loadingText}>Chargement des prévisions...</ThemedText>
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
        <Pressable style={styles.retryButton} onPress={loadForecast}>
          <ThemedText style={styles.retryButtonText}>Réessayer</ThemedText>
        </Pressable>
      </ThemedView>
    );
  }

  const title = state.cityName ? `Prévisions — ${state.cityName}` : 'Prévisions 5 jours';

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="subtitle" style={styles.headerTitle}>
        {title}
      </ThemedText>
      <FlatList
        data={state.data}
        keyExtractor={(item) => `${item.dateLabel}-${item.dayName}`}
        renderItem={({ item }) => <ForecastItem item={item} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
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
  headerTitle: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(128, 128, 128, 0.1)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  itemLeft: {
    flex: 1,
  },
  dayName: {
    fontSize: 16,
  },
  dateLabel: {
    fontSize: 13,
    opacity: 0.8,
    marginTop: 2,
  },
  icon: {
    width: 48,
    height: 48,
    marginHorizontal: 12,
  },
  temps: {
    alignItems: 'flex-end',
  },
  tempMax: {
    fontSize: 18,
    fontWeight: '700',
  },
  tempMin: {
    fontSize: 14,
    opacity: 0.8,
    marginTop: 2,
  },
});
