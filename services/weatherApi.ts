import axios from 'axios';
import { TemperatureUnit } from '../app/weatherSettings';

// OpenWeather API configuration

const API_KEY = '54f4a3e43f3514d50df152ad0062cdc4';
const BASE_URL = 'https://api.openweathermap.org/data/2.5';
const GEO_URL = 'https://api.openweathermap.org/geo/1.0';

// Types for the weather data
export interface WeatherData {
  location: string;
  temperature: number;
  condition: string;
  date: string;
  iconSource: string;
  sunrise: number;
  sunset: number;
  aqi?: number;  // Air Quality Index
  humidity?: number;
  pressure?: number;
  visibility?: number;
  windSpeed?: number;
  feelsLike?: number;
}

export interface HourlyForecastItem {
  hour: string;
  temperature: number;
  iconSource: string;
  isNow?: boolean;
}

export interface DailyForecastData {
  day: string;
  iconSource: string;
  high: number;
  low: number;
}

export interface CitySearchResult {
  name: string;
  country: string;
  state?: string;
  lat: number;
  lon: number;
}

export interface LocationWeatherData {
  current: WeatherData;
  hourly: HourlyForecastItem[];
  daily: DailyForecastData[];
}

// Map OpenWeather icon codes to local assets
export const mapWeatherIconToLocal = (iconCode: string) => {
  const iconMappings: Record<string, any> = {
    '01d': require('../assets/images/weatherIcons/sunny.png'), // clear sky day
    '01n': require('../assets/images/weatherIcons/6.png'), // clear sky night
    '02d': require('../assets/images/weatherIcons/4.png'), // few clouds day
    '02n': require('../assets/images/weatherIcons/4.png'), // few clouds night
    '03d': require('../assets/images/weatherIcons/2.png'), // scattered clouds
    '03n': require('../assets/images/weatherIcons/2.png'), // scattered clouds
    '04d': require('../assets/images/weatherIcons/2.png'), // broken clouds
    '04n': require('../assets/images/weatherIcons/2.png'), // broken clouds
    '09d': require('../assets/images/weatherIcons/5.png'), // shower rain
    '09n': require('../assets/images/weatherIcons/5.png'), // shower rain
    '10d': require('../assets/images/weatherIcons/5.png'), // rain
    '10n': require('../assets/images/weatherIcons/5.png'), // rain
    '11d': require('../assets/images/weatherIcons/1.png'), // thunderstorm
    '11n': require('../assets/images/weatherIcons/1.png'), // thunderstorm
    '13d': require('../assets/images/weatherIcons/51.png'), // snow
    '13n': require('../assets/images/weatherIcons/51.png'), // snow
    '50d': require('../assets/images/weatherIcons/2.png'), // mist
    '50n': require('../assets/images/weatherIcons/2.png'), // mist
  };

  return iconMappings[iconCode] || require('../assets/images/weatherIcons/Group.png');
};

// Helper function to convert timestamp to formatted hour
const formatHour = (timestamp: number): string => {
  const date = new Date(timestamp * 1000);
  return date.getHours() + ':00';
};

// Helper function to convert timestamp to day name
const formatDay = (timestamp: number): string => {
  const date = new Date(timestamp * 1000);
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[date.getDay()];
};

// Helper function to format date
const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp * 1000);
  const options: Intl.DateTimeFormatOptions = { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long' 
  };
  return date.toLocaleDateString('en-US', options);
};

// Helper function to get date key without time
const getDateKey = (timestamp: number): string => {
  const date = new Date(timestamp * 1000);
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
};

// Helper function to convert Celsius to Fahrenheit
export const celsiusToFahrenheit = (celsius: number): number => {
  return Math.round((celsius * 9/5) + 32);
};

export const fahrenheitToCelsius = (fahrenheit: number): number => {
  return Math.round((fahrenheit-32)*5/9);
}

// Helper function to get the appropriate units parameter for API calls
const getUnitsParam = (unit: TemperatureUnit): string => {
  return unit === 'celsius' ? 'metric' : 'imperial';
};

// Get the AQI category based on the value
export const getAqiCategory = (aqi: number): { category: string; color: string } => {
  if (aqi <= 50) {
    return { category: 'Good', color: '#00E400' };
  } else if (aqi <= 100) {
    return { category: 'Moderate', color: '#FFFF00' };
  } else if (aqi <= 200) {
    return { category: 'Poor', color: '#FF7E00' };
  } else if (aqi <= 300) {
    return { category: 'Unhealthy', color: '#FF0000' };
  } else {
    return { category: 'Hazardous', color: '#7E0023' };
  }
};

// Weather service for API calls
class WeatherService {
  // Search for cities
  async searchCities(query: string): Promise<CitySearchResult[]> {
    try {
      const response = await axios.get(`${GEO_URL}/direct`, {
        params: {
          q: query,
          limit: 10,
          appid: API_KEY
        }
      });

      return response.data.map((item: any) => ({
        name: item.name,
        country: item.country,
        state: item.state,
        lat: item.lat,
        lon: item.lon
      }));
    } catch (error) {
      console.error('Error searching cities:', error);
      throw error;
    }
  }

  // Get weather data by coordinates
  async getWeatherByCoordinates(lat: number, lon: number, unit: TemperatureUnit = 'celsius'): Promise<LocationWeatherData> {
    try {
      // Make parallel requests for current weather, forecast, and air pollution
      const [currentResponse, forecastResponse, airPollutionResponse] = await Promise.all([
        axios.get(`${BASE_URL}/weather`, {
          params: {
            lat,
            lon,
            appid: API_KEY,
            units: getUnitsParam(unit)
          }
        }),
        axios.get(`${BASE_URL}/forecast`, {
          params: {
            lat,
            lon,
            appid: API_KEY,
            units: getUnitsParam(unit)
          }
        }),
        axios.get(`${BASE_URL}/air_pollution`, {
          params: {
            lat,
            lon,
            appid: API_KEY
          }
        })
      ]);

      // Process current weather data
      const currentData = currentResponse.data;
      const airData = airPollutionResponse.data;
      
      // Convert OpenWeatherMap AQI (1-5) to a more standard scale
      const aqiValue = airData.list[0].main.aqi;
      const mappedAqi = aqiValue === 1 ? 25 : 
                        aqiValue === 2 ? 75 : 
                        aqiValue === 3 ? 150 : 
                        aqiValue === 4 ? 218 : 
                        aqiValue === 5 ? 300 : 0;
      
      const current: WeatherData = {
        location: currentData.name,
        temperature: Math.round(currentData.main.temp),
        condition: currentData.weather[0].main,
        date: formatDate(currentData.dt),
        iconSource: mapWeatherIconToLocal(currentData.weather[0].icon),
        sunrise: currentData.sys.sunrise,
        sunset: currentData.sys.sunset,
        aqi: mappedAqi,
        humidity: currentData.main.humidity,
        pressure: currentData.main.pressure,
        visibility: currentData.visibility ? Math.round(currentData.visibility / 1000) : undefined, // Convert to km
        windSpeed: currentData.wind ? Math.round(currentData.wind.speed * 3.6) : undefined, // Convert to km/h
        feelsLike: Math.round(currentData.main.feels_like),
      };

      // Process hourly forecast data
      const hourlyData = forecastResponse.data.list.slice(0, 8).map((item: any, index: number) => ({
        hour: index === 0 ? 'Now' : formatHour(item.dt),
        temperature: Math.round(item.main.temp),
        iconSource: mapWeatherIconToLocal(item.weather[0].icon),
        isNow: index === 0
      }));

      // Process daily forecast data
      // Group forecast by day
      const dailyData: Record<string, any> = {};
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayTimestamp = today.getTime();
      
      // Process each forecast entry
      forecastResponse.data.list.forEach((item: any) => {
        const date = new Date(item.dt * 1000);
        date.setHours(0, 0, 0, 0);
        
        // Skip today's forecast since we already have current weather
        if (date.getTime() === todayTimestamp) {
          return;
        }
        
        const dateKey = getDateKey(item.dt);
        
        if (!dailyData[dateKey]) {
          dailyData[dateKey] = {
            temps: [],
            icons: [],
            day: formatDay(item.dt),
            timestamp: item.dt,
            dateObj: date
          };
        }
        
        dailyData[dateKey].temps.push(item.main.temp);
        dailyData[dateKey].icons.push(item.weather[0].icon);
      });

      // Convert to array and sort by date
      const sortedDays = Object.values(dailyData)
        .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime())
        .slice(0, 5);

      // Process daily data
      const daily = sortedDays.map((day: any) => {
        // Find most common icon for the day
        const iconCounts: Record<string, number> = {};
        day.icons.forEach((icon: string) => {
          iconCounts[icon] = (iconCounts[icon] || 0) + 1;
        });
        
        const iconEntries = Object.entries(iconCounts);
        const mostCommonIcon = iconEntries.length > 0 
          ? iconEntries.sort((a, b) => b[1] - a[1])[0][0]
          : '01d';

        // Calculate high and low temps
        const high = Math.ceil(Math.max(...day.temps));
        const low = Math.floor(Math.min(...day.temps));

        return {
          day: day.day,
          iconSource: mapWeatherIconToLocal(mostCommonIcon),
          high,
          low
        };
      });

      return {
        current,
        hourly: hourlyData,
        daily
      };
    } catch (error) {
      console.error('Error fetching weather by coordinates:', error);
      throw error;
    }
  }

  // Get current weather data for a location
  async getCurrentWeather(city: string, unit: TemperatureUnit = 'celsius'): Promise<WeatherData> {
    try {
      // First get coordinates for the city
      const geoResponse = await axios.get(`${GEO_URL}/direct`, {
        params: {
          q: city,
          limit: 1,
          appid: API_KEY
        }
      });
      
      if (geoResponse.data.length === 0) {
        throw new Error('City not found');
      }
      
      const { lat, lon } = geoResponse.data[0];
      
      // Use the existing getWeatherByCoordinates method to get complete weather data
      const weatherData = await this.getWeatherByCoordinates(lat, lon, unit);
      return weatherData.current;
      
    } catch (error) {
      console.error('Error fetching current weather:', error);
      throw error;
    }
  }

  // Get hourly forecast for a location
  async getHourlyForecast(city: string, unit: TemperatureUnit = 'celsius'): Promise<HourlyForecastItem[]> {
    try {
      // First get coordinates for the city
      const geoResponse = await axios.get(`${GEO_URL}/direct`, {
        params: {
          q: city,
          limit: 1,
          appid: API_KEY
        }
      });
      
      if (geoResponse.data.length === 0) {
        throw new Error('City not found');
      }
      
      const { lat, lon } = geoResponse.data[0];
      
      // Use the existing getWeatherByCoordinates method
      const weatherData = await this.getWeatherByCoordinates(lat, lon, unit);
      return weatherData.hourly;
      
    } catch (error) {
      console.error('Error fetching hourly forecast:', error);
      throw error;
    }
  }

  // Get daily forecast for a location
  async getDailyForecast(city: string, unit: TemperatureUnit = 'celsius'): Promise<DailyForecastData[]> {
    try {
      // First get coordinates for the city
      const geoResponse = await axios.get(`${GEO_URL}/direct`, {
        params: {
          q: city,
          limit: 1,
          appid: API_KEY
        }
      });
      
      if (geoResponse.data.length === 0) {
        throw new Error('City not found');
      }
      
      const { lat, lon } = geoResponse.data[0];
      
      // Use the existing getWeatherByCoordinates method
      const weatherData = await this.getWeatherByCoordinates(lat, lon, unit);
      return weatherData.daily;
      
    } catch (error) {
      console.error('Error fetching daily forecast:', error);
      throw error;
    }
  }
}

export default new WeatherService(); 