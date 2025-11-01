
// Weather API Keys
const STORMGLASS_API_KEY = '5cf7a41a-b626-11f0-a8f4-0242ac130003-5cf7a492-b626-11f0-a8f4-0242ac130003';
const AISTREAM_API_KEY = '786e06e04c50efda09a5075482678ca8b48014fd';
const WEATHERAPI_KEY = 'b8662263280e4b65a6864833253110';

// Cache for failed API calls
let stormGlassFailedAt: number | null = null;
const STORMGLASS_RETRY_DELAY = 10 * 60 * 1000; // 10 minutes in milliseconds

export interface WeatherData {
  temperature: number;
  windSpeed: number;
  waveHeight: number;
  visibility: number;
  condition: string;
  icon: string;
}

export interface HourlyForecast {
  time: string;
  temp: string;
  icon: string;
  wind: string;
  condition: string;
}

export const fetchStormGlassWeather = async (lat: number, lng: number): Promise<WeatherData | null> => {
  // Check if we recently failed and should not retry yet
  if (stormGlassFailedAt) {
    const timeSinceFailure = Date.now() - stormGlassFailedAt;
    if (timeSinceFailure < STORMGLASS_RETRY_DELAY) {
      // Silently return null during cooldown
      return null;
    }
  }

  try {
    const response = await fetch(
      `https://api.stormglass.io/v2/weather/point?lat=${lat}&lng=${lng}&params=airTemperature,windSpeed,waveHeight,visibility`,
      {
        headers: {
          'Authorization': STORMGLASS_API_KEY
        }
      }
    );
    
    if (!response.ok) {
      // Silently mark failure and return null - no console errors
      stormGlassFailedAt = Date.now();
      return null;
    }
    
    // Reset failure timer on success
    stormGlassFailedAt = null;
    
    const data = await response.json();
    const current = data.hours[0];
    
    return {
      temperature: Math.round(current.airTemperature.noaa || 28),
      windSpeed: Math.round(current.windSpeed.noaa || 15),
      waveHeight: parseFloat((current.waveHeight.noaa || 1.2).toFixed(1)),
      visibility: Math.round(current.visibility.noaa || 8),
      condition: 'Partly Cloudy',
      icon: '⛅'
    };
  } catch (error) {
    // Silently mark failure and return null - no console errors
    stormGlassFailedAt = Date.now();
    return null;
  }
};

export const fetchWeatherAPIData = async (lat: number, lng: number): Promise<any> => {
  try {
    const response = await fetch(
      `https://api.weatherapi.com/v1/forecast.json?key=${WEATHERAPI_KEY}&q=${lat},${lng}&days=1&aqi=no&alerts=yes`
    );
    
    if (!response.ok) {
      console.error('WeatherAPI error:', response.status);
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching WeatherAPI data:', error);
    return null;
  }
};

export const getWeatherIcon = (condition: string): string => {
  const lowerCondition = condition.toLowerCase();
  if (lowerCondition.includes('sunny') || lowerCondition.includes('clear')) return '☀️';
  if (lowerCondition.includes('partly cloudy')) return '⛅';
  if (lowerCondition.includes('cloudy') || lowerCondition.includes('overcast')) return '☁️';
  if (lowerCondition.includes('rain') || lowerCondition.includes('drizzle')) return '🌧️';
  if (lowerCondition.includes('storm') || lowerCondition.includes('thunder')) return '⛈️';
  if (lowerCondition.includes('snow')) return '❄️';
  if (lowerCondition.includes('fog') || lowerCondition.includes('mist')) return '🌫️';
  return '⛅';
};

export const getMockWeatherData = (): WeatherData => {
  return {
    temperature: 28,
    windSpeed: 15,
    waveHeight: 1.2,
    visibility: 8,
    condition: 'Partly Cloudy',
    icon: '⛅'
  };
};

export const getMockHourlyForecast = (): HourlyForecast[] => {
  return [
    { time: '10 AM', temp: '27°C', icon: '☀️', wind: '12 km/h', condition: 'Sunny' },
    { time: '11 AM', temp: '28°C', icon: '⛅', wind: '15 km/h', condition: 'Partly Cloudy' },
    { time: '12 PM', temp: '29°C', icon: '⛅', wind: '18 km/h', condition: 'Partly Cloudy' },
    { time: '1 PM', temp: '30°C', icon: '☁️', wind: '20 km/h', condition: 'Cloudy' },
    { time: '2 PM', temp: '29°C', icon: '🌧️', wind: '22 km/h', condition: 'Light Rain' },
    { time: '3 PM', temp: '28°C', icon: '🌧️', wind: '20 km/h', condition: 'Rain' },
    { time: '4 PM', temp: '27°C', icon: '⛅', wind: '18 km/h', condition: 'Clearing' },
    { time: '5 PM', temp: '26°C', icon: '⛅', wind: '16 km/h', condition: 'Partly Cloudy' },
  ];
};
