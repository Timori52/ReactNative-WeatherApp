import React, { useState, useEffect } from 'react';
import { View, StyleSheet, StatusBar, ScrollView, Alert, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';

import CurrentWeather from '../components/CurrentWeather';
import HourlyForecast from '../components/HourlyForecast';
import DailyForecast from '../components/DailyForecast';
import AddButton from '../components/AddButton';
import CitySearchModal from '../components/CitySearchModal';
import SplashScreen from '../components/SplashScreen';

// Import the new weather API service
import weatherApi, { celsiusToFahrenheit, fahrenheitToCelsius } from '../services/weatherApi';
import { TemperatureUnit, TEMPERATURE_UNIT_KEY } from './weatherSettings';

export default function HomeScreen() {
  // State for splash screen
  const [showSplash, setShowSplash] = useState(true);
  
  // State for city selection modal
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCity, setSelectedCity] = useState('New York'); // Default city
  
  // State for weather data
  const [currentWeather, setCurrentWeather] = useState<any>(null);
  const [hourlyForecast, setHourlyForecast] = useState<any[]>([]);
  const [dailyForecast, setDailyForecast] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [temperatureUnit, setTemperatureUnit] = useState<TemperatureUnit>('celsius');
  const [isUsingLocation, setIsUsingLocation] = useState(false);
  const [previousUnit, setPreviousUnit] = useState<TemperatureUnit>('celsius');

  // Handle splash screen completion
  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  // Convert temperatures when unit changes
  const convertTemperatures = (fromUnit: TemperatureUnit, toUnit: TemperatureUnit) => {
    if (fromUnit === toUnit) return;
    
    // Convert current weather data
    if (currentWeather) {
      const convert = fromUnit === 'fahrenheit' ? fahrenheitToCelsius : celsiusToFahrenheit;
    
      setCurrentWeather({
        ...currentWeather,
        temperature: convert(currentWeather.temperature),
        high: convert(currentWeather.high),
        low: convert(currentWeather.low)
      });
    }
    
    // Convert hourly forecast data
    if (hourlyForecast.length > 0) {
      const convertedHourly = hourlyForecast.map(item => ({
        ...item,
        temperature: fromUnit === 'fahrenheit' 
          ? fahrenheitToCelsius(item.temperature) 
          : celsiusToFahrenheit(item.temperature)
      }));
      
      setHourlyForecast(convertedHourly);
    }
    
    // Convert daily forecast data
    if (dailyForecast.length > 0) {
      const convertedDaily = dailyForecast.map(item => ({
        ...item,
        high: fromUnit === 'fahrenheit' 
          ? fahrenheitToCelsius(item.high) 
          : celsiusToFahrenheit(item.high),
        low: fromUnit === 'fahrenheit' 
          ? fahrenheitToCelsius(item.low) 
          : celsiusToFahrenheit(item.low)
      }));
      
      setDailyForecast(convertedDaily);
    }
  };

  // Load temperature unit settings
  useEffect(() => {
    const loadTemperatureUnit = async () => {
      try {
        const savedUnit = await AsyncStorage.getItem(TEMPERATURE_UNIT_KEY);
        if (savedUnit && (savedUnit === 'celsius' || savedUnit === 'fahrenheit')) {
          setTemperatureUnit(savedUnit as TemperatureUnit);
          setPreviousUnit(savedUnit as TemperatureUnit);
        }
      } catch (error) {
        console.error('Error loading temperature unit:', error);
      }
    };

    loadTemperatureUnit();

    // Listen for changes to the temperature unit
    const intervalId = setInterval(async () => {
      try {
        const savedUnit = await AsyncStorage.getItem(TEMPERATURE_UNIT_KEY);
        if (savedUnit && 
            (savedUnit === 'celsius' || savedUnit === 'fahrenheit') && 
            savedUnit !== temperatureUnit) {
          
          // If we have weather data, convert the temperatures
          if (currentWeather) {
            convertTemperatures(temperatureUnit, savedUnit as TemperatureUnit);
          }
          
          // Update the unit state
          setPreviousUnit(temperatureUnit);
          setTemperatureUnit(savedUnit as TemperatureUnit);
        }
      } catch (error) {
        console.error('Error checking temperature unit:', error);
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [temperatureUnit, currentWeather, hourlyForecast, dailyForecast]);

  // Get weather by city name
  const fetchWeatherData = async () => {
    if (isUsingLocation) return; // Skip if using location-based weather
    
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all weather data in parallel using city name and temperature unit
      const [current, hourly, daily] = await Promise.all([
        weatherApi.getCurrentWeather(selectedCity, temperatureUnit),
        weatherApi.getHourlyForecast(selectedCity, temperatureUnit),
        weatherApi.getDailyForecast(selectedCity, temperatureUnit)
      ]);
      
      setCurrentWeather(current);
      setHourlyForecast(hourly);
      setDailyForecast(daily);
    } catch (err) {
      console.error('Error fetching weather data:', err);
      setError('Could not fetch weather data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Get weather by user's current location
  const getWeatherByLocation = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Request location permissions
      let { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        setError('Permission to access location was denied');
        setIsUsingLocation(false);
        setLoading(false);
        return;
      }
      
      // Get current position
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      
      const { latitude, longitude } = location.coords;
      
      // Get weather data by coordinates
      const weatherData = await weatherApi.getWeatherByCoordinates(
        latitude,
        longitude,
        temperatureUnit
      );
      
      // Update state with the weather data
      setCurrentWeather(weatherData.current);
      setHourlyForecast(weatherData.hourly);
      setDailyForecast(weatherData.daily);
      setSelectedCity(weatherData.current.location);
      setIsUsingLocation(true);
    } catch (err) {
      console.error('Error getting location weather:', err);
      setError('Could not get weather for your location. Please try again.');
      setIsUsingLocation(false);
    } finally {
      setLoading(false);
    }
  };

  // Handle geolocation button press
  const handleGeoLocationPress = async () => {
    await getWeatherByLocation();
  };

  // Fetch weather data on component mount and when city or unit changes
  useEffect(() => {
    // Initial data fetch
    fetchWeatherData();
  }, [selectedCity, temperatureUnit]);

  const handleAddLocation = () => {
    setModalVisible(true);
  };

  const handleSelectCity = (city: string) => {
    setSelectedCity(city);
    setIsUsingLocation(false);
    setModalVisible(false);
  };

  // If the splash screen is showing, render it
  if (showSplash) {
    return <SplashScreen onFinish={handleSplashComplete} />;
  }

  // Main content rendering
  return (
    <LinearGradient
      colors={['#1DAEFF', '#C5EEFF']}
      start={{ x: 0, y: 1 }}
      end={{ x: 1, y: 0}} // Horizontal gradient
      style={styles.container}
    >
      <StatusBar hidden={true} />
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : (
          <>
            {currentWeather && <CurrentWeather {...currentWeather} />}
            
            <View style={styles.divider} />
            
            {hourlyForecast.length > 0 && <HourlyForecast data={hourlyForecast} />}
            
            <View style={styles.divider} />
            
            {dailyForecast.length > 0 && <DailyForecast data={dailyForecast} />}
          </>
        )}
      </ScrollView>
  
      <AddButton 
        onPress={handleAddLocation}
        onLocationPress={handleGeoLocationPress}
      />
  
      <CitySearchModal 
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSelectCity={handleSelectCity}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    bottom: 0,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: 300,
    paddingHorizontal: 20,
  },
  errorText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    padding: 20,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 50, // Add padding to ensure content isn't hidden behind the bottom image
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 20,
  },
});
