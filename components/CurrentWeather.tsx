import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { TemperatureUnit, TEMPERATURE_UNIT_KEY } from '../app/weatherSettings';

type CurrentWeatherProps = {
  location: string;
  temperature: number;
  condition: string;
  high: number;
  low: number;
  date: string;
  iconSource: any;
  humidity?: number;
  windSpeed?: number;
};

// Helper function to format temperature
const formatTemp = (temp: number, unit: TemperatureUnit): string => {
  const symbol = unit === 'celsius' ? '°C' : '°F';
  return `${temp}${symbol}`;
};

const CurrentWeather: React.FC<CurrentWeatherProps> = ({
  location,
  temperature,
  condition,
  high,
  low,
  date,
  iconSource,
  humidity,
  windSpeed,
}) => {
  const [temperatureUnit, setTemperatureUnit] = useState<TemperatureUnit>('celsius');

  // Load temperature unit setting
  useEffect(() => {
    const loadTemperatureUnit = async () => {
      try {
        const savedUnit = await AsyncStorage.getItem(TEMPERATURE_UNIT_KEY);
        if (savedUnit && (savedUnit === 'celsius' || savedUnit === 'fahrenheit')) {
          setTemperatureUnit(savedUnit as TemperatureUnit);
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
          setTemperatureUnit(savedUnit as TemperatureUnit);
        }
      } catch (error) {
        console.error('Error checking temperature unit:', error);
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [temperatureUnit]);

  const speedUnit = temperatureUnit === 'celsius' ? 'm/s' : 'mph';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.locationContainer}>
          <Ionicons name="location" size={20} color="white" />
          <Text style={styles.location}>{location}</Text>
        </View>
        
      </View>
      
      <View style={styles.iconContainer}>
        <Image 
          source={typeof iconSource === 'string' ? { uri: iconSource } : iconSource} 
          style={styles.weatherIcon} 
          resizeMode="contain" 
        />
      </View>
      
      <Text style={styles.temperature}>{formatTemp(temperature, temperatureUnit)}</Text>
      <Text style={styles.condition}>{condition}</Text>
      
      <View style={styles.highLowContainer}>
        <Text style={styles.highLow}>H:{formatTemp(high, temperatureUnit)}</Text>
        <Text style={styles.highLow}>L:{formatTemp(low, temperatureUnit)}</Text>
      </View>
      
      {/* Extra weather details */}
      {(humidity !== undefined || windSpeed !== undefined) && (
        <View style={styles.extraDetails}>
          {humidity !== undefined && (
            <View style={styles.detailItem}>
              <Ionicons name="water" size={16} color="white" />
              <Text style={styles.detailText}>{humidity}%</Text>
            </View>
          )}
          
          {windSpeed !== undefined && (
            <View style={styles.detailItem}>
              <Ionicons name="speedometer" size={16} color="white" />
              <Text style={styles.detailText}>{windSpeed} {speedUnit}</Text>
            </View>
          )}
        </View>
      )}
      
      <Text style={styles.date}>{date}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  location: {
    color: 'white',
    fontSize: 20,
    fontWeight: '600',
    marginLeft: 5,
  },
  iconContainer: {
    marginVertical: 10,
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
  },
  weatherIcon: {
    width: 150,
    height: 150,
  },
  temperature: {
    color: 'white',
    fontSize: 90,
    fontWeight: '200',
    lineHeight: 100,
    marginLeft: 20,
  },
  condition: {
    color: 'white',
    fontSize: 22,
    fontWeight: '600',
    marginTop: 5,
  },
  highLowContainer: {
    flexDirection: 'row',
    marginTop: 10,
  },
  highLow: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginHorizontal: 5,
  },
  extraDetails: {
    flexDirection: 'row',
    marginTop: 15,
    width: '70%',
    justifyContent: 'space-around',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    color: 'white',
    marginLeft: 5,
    fontSize: 14,
  },
  date: {
    color: 'white',
    fontSize: 16,
    marginTop: 10,
  },
});

export default CurrentWeather; 