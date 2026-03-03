const API_KEY = process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

export type CurrentWeather = {
  temp: number;
  description: string;
  icon: string;
  humidity: number;
  windSpeed: number;
  cityName: string;
  lat: number;
  lon: number;
};

export type WeatherApiError = {
  type: 'city_not_found' | 'network' | 'invalid_key' | 'unknown';
  message: string;
};

export async function fetchCurrentWeather(cityName: string): Promise<CurrentWeather> {
  const url = `${BASE_URL}/weather?q=${encodeURIComponent(cityName)}&appid=${API_KEY}&units=metric&lang=fr`;
  const res = await fetch(url);
  const data = await res.json();

  if (!res.ok) {
    if (data?.cod === '404' || data?.cod === 404) {
      throw { type: 'city_not_found' as const, message: 'Ville introuvable.' };
    }
    if (data?.cod === 401) {
      throw { type: 'invalid_key' as const, message: 'Clé API invalide.' };
    }
    throw { type: 'unknown' as const, message: data?.message || 'Erreur lors de la récupération de la météo.' };
  }

  return {
    temp: Math.round(data.main.temp),
    description: data.weather[0]?.description ?? '',
    icon: data.weather[0]?.icon ?? '01d',
    humidity: data.main.humidity ?? 0,
    windSpeed: data.wind?.speed ?? 0,
    cityName: data.name ?? cityName,
    lat: data.coord?.lat ?? 0,
    lon: data.coord?.lon ?? 0,
  };
}

export function getWeatherIconUrl(icon: string): string {
  return `https://openweathermap.org/img/wn/${icon}@2x.png`;
}
