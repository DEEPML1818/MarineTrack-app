
import axios from 'axios';
import { WeatherData } from '@/types/maritime';

class WeatherService {
  private apiKey: string = ''; // Add your StormGlass/WeatherAPI key

  async getCurrentWeather(latitude: number, longitude: number): Promise<WeatherData | null> {
    try {
      // Example using StormGlass API
      // Replace with actual API endpoint
      const response = await axios.get(
        `https://api.stormglass.io/v2/weather/point`,
        {
          params: {
            lat: latitude,
            lng: longitude,
            params: 'waveHeight,windSpeed,windDirection,visibility,waterTemperature'
          },
          headers: {
            'Authorization': this.apiKey
          }
        }
      );

      const data = response.data.hours[0];
      
      return {
        temperature: data.waterTemperature?.noaa || 0,
        windSpeed: data.windSpeed?.noaa || 0,
        windDirection: data.windDirection?.noaa || 0,
        waveHeight: data.waveHeight?.noaa || 0,
        visibility: data.visibility?.noaa || 0,
        seaState: this.getSeaState(data.waveHeight?.noaa || 0),
        timestamp: Date.now()
      };
    } catch (error) {
      console.error('Weather fetch error:', error);
      return null;
    }
  }

  private getSeaState(waveHeight: number): string {
    if (waveHeight < 0.1) return 'Calm';
    if (waveHeight < 0.5) return 'Smooth';
    if (waveHeight < 1.25) return 'Slight';
    if (waveHeight < 2.5) return 'Moderate';
    if (waveHeight < 4) return 'Rough';
    if (waveHeight < 6) return 'Very Rough';
    if (waveHeight < 9) return 'High';
    return 'Very High';
  }

  async getForecast(latitude: number, longitude: number, hours: number = 24): Promise<WeatherData[]> {
    // Implement forecast logic
    return [];
  }
}

export default new WeatherService();
