
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
  high: number;
  low: number;
  date: string;
  iconSource: string;
  humidity: number;
  windSpeed: number;
  sunrise: number;
  sunset: number;
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
      // Make parallel requests for current weather and forecast
      const [currentResponse, forecastResponse] = await Promise.all([
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
        })
      ]);

      // Process current weather data
      const currentData = currentResponse.data;
      const current: WeatherData = {
        location: currentData.name,
        temperature: Math.round(currentData.main.temp),
        condition: currentData.weather[0].main,
        high: Math.ceil(currentData.main.temp_max),
        low: Math.floor(currentData.main.temp_min),
        date: formatDate(currentData.dt),
        iconSource: mapWeatherIconToLocal(currentData.weather[0].icon),
        humidity: currentData.main.humidity,
        windSpeed: currentData.wind.speed,
        sunrise: currentData.sys.sunrise,
        sunset: currentData.sys.sunset
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
      const response = await axios.get(`${BASE_URL}/weather`, {
        params: {
          q: city,
          appid: API_KEY,
          units: getUnitsParam(unit)
        }
      });

      const data = response.data;
      
      return {
        location: data.name,
        temperature: Math.round(data.main.temp),
        condition: data.weather[0].main,
        high: Math.round(data.main.temp_max),
        low: Math.round(data.main.temp_min),
        date: formatDate(data.dt),
        iconSource: mapWeatherIconToLocal(data.weather[0].icon),
        humidity: data.main.humidity,
        windSpeed: data.wind.speed,
        sunrise: data.sys.sunrise,
        sunset: data.sys.sunset
      };
    } catch (error) {
      console.error('Error fetching current weather:', error);
      throw error;
    }
  }

  // Get hourly forecast for a location
  async getHourlyForecast(city: string, unit: TemperatureUnit = 'celsius'): Promise<HourlyForecastItem[]> {
    try {
      const response = await axios.get(`${BASE_URL}/forecast`, {
        params: {
          q: city,
          appid: API_KEY,
          units: getUnitsParam(unit),
          cnt: 8 // Limit to 8 results (24 hours)
        }
      });

      // Transform API data to our format
      const hourlyData = response.data.list.map((item: any, index: number) => ({
        hour: index === 0 ? 'Now' : formatHour(item.dt),
        temperature: Math.round(item.main.temp),
        iconSource: mapWeatherIconToLocal(item.weather[0].icon),
        isNow: index === 0
      }));

      return hourlyData;
    } catch (error) {
      console.error('Error fetching hourly forecast:', error);
      throw error;
    }
  }

  // Get daily forecast for a location
  async getDailyForecast(city: string, unit: TemperatureUnit = 'celsius'): Promise<DailyForecastData[]> {
    try {
      // Use the 5-day forecast endpoint
      const response = await axios.get(`${BASE_URL}/forecast`, {
        params: {
          q: city,
          appid: API_KEY,
          units: getUnitsParam(unit)
        }
      });

      // Group forecast by day
      const dailyData: Record<string, any> = {};
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayTimestamp = today.getTime();
      
      // Process each forecast entry
      response.data.list.forEach((item: any) => {
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
            timestamp: item.dt, // Save timestamp to sort by date later
            dateObj: date // Save date object for sorting
          };
        }
        
        dailyData[dateKey].temps.push(item.main.temp);
        dailyData[dateKey].icons.push(item.weather[0].icon);
      });

      // Convert to array and sort by date
      const sortedDays = Object.values(dailyData)
        .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime())
        .slice(0, 5); // Limit to 5 days

      // Process daily data
      return sortedDays.map((day: any) => {
        // Find most common icon for the day
        const iconCounts: Record<string, number> = {};
        day.icons.forEach((icon: string) => {
          iconCounts[icon] = (iconCounts[icon] || 0) + 1;
        });
        
        const iconEntries = Object.entries(iconCounts);
        const mostCommonIcon = iconEntries.length > 0 
          ? iconEntries.sort((a, b) => b[1] - a[1])[0][0]
          : '01d'; // Default icon if none found

        // Calculate high and low temps
        const high = Math.round(Math.max(...day.temps));
        const low = Math.round(Math.min(...day.temps));

        return {
          day: day.day,
          iconSource: mapWeatherIconToLocal(mostCommonIcon),
          high,
          low
        };
      });
    } catch (error) {
      console.error('Error fetching daily forecast:', error);
      throw error;
    }
  }
}

export default new WeatherService(); 