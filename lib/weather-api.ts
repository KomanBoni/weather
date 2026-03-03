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

// Prévisions : un jour = date lisible + min / max + icône
export type ForecastDay = {
  dateLabel: string;
  dayName: string;
  tempMin: number;
  tempMax: number;
  icon: string;
};

function formatDayName(dateStr: string): string {
  const date = new Date(dateStr + 'T12:00:00');
  const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
  return days[date.getDay()];
}

function formatDateLabel(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  return `${d}/${m}`;
}

export async function fetchForecast(lat: number, lon: number): Promise<ForecastDay[]> {
  const url = `${BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=fr`;
  const res = await fetch(url);
  const data = await res.json();

  if (!res.ok || data?.cod !== '200') {
    if (data?.cod === 401) {
      throw { type: 'invalid_key' as const, message: 'Clé API invalide.' };
    }
    throw { type: 'unknown' as const, message: data?.message || 'Erreur prévisions.' };
  }

  const list = data?.list ?? [];
  const byDay = new Map<string, { tempMin: number[]; tempMax: number[]; icon: string }>();

  for (const item of list) {
    const dtTxt = item.dt_txt as string;
    if (!dtTxt) continue;
    const dateStr = dtTxt.split(' ')[0];
    const tempMin = item.main?.temp_min ?? item.main?.temp;
    const tempMax = item.main?.temp_max ?? item.main?.temp;
    const icon = item.weather?.[0]?.icon ?? '01d';

    if (!byDay.has(dateStr)) {
      byDay.set(dateStr, { tempMin: [], tempMax: [], icon });
    }
    const day = byDay.get(dateStr)!;
    day.tempMin.push(tempMin);
    day.tempMax.push(tempMax);
    day.icon = icon;
  }

  const sortedDates = Array.from(byDay.keys()).sort();
  const result: ForecastDay[] = sortedDates.slice(0, 5).map((dateStr) => {
    const day = byDay.get(dateStr)!;
    return {
      dateLabel: formatDateLabel(dateStr),
      dayName: formatDayName(dateStr),
      tempMin: Math.round(Math.min(...day.tempMin)),
      tempMax: Math.round(Math.max(...day.tempMax)),
      icon: day.icon,
    };
  });

  return result;
}
