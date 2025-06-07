import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TemperatureUnit, TEMPERATURE_UNIT_KEY } from '../app/weatherSettings';

type DayForecast = {
  day: string;
  iconSource: any;
  high: number;
  low: number;
};

type DailyForecastProps = {
  data: DayForecast[];
};

// Helper function to format temperature
const formatTemp = (temp: number, unit: TemperatureUnit): string => {
  const symbol = unit === 'celsius' ? '°C' : '°F';
  return `${temp}${symbol}`;
};

const DailyForecast: React.FC<DailyForecastProps> = ({ data }) => {
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Next Forecast</Text>
      
      {data.map((item, index) => (
        <View key={index} style={styles.dayRow}>
          <Text style={styles.dayText}>{item.day}</Text>
          
          <View style={styles.iconContainer}>
            <Image 
              source={typeof item.iconSource === 'string' ? { uri: item.iconSource } : item.iconSource} 
              style={styles.icon} 
              resizeMode="contain" 
            />
          </View>
          
          <View style={styles.tempContainer}>
            <Text style={styles.highTemp}>{formatTemp(item.high, temperatureUnit)}</Text>
            <Text style={styles.lowTemp}>{formatTemp(item.low, temperatureUnit)}</Text>
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 15,
    paddingHorizontal: 20,
  },
  title: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 15,
  },
  dayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    height: 40,
  },
  dayText: {
    color: 'white',
    fontSize: 16,
    width: 100,
  },
  iconContainer: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    width: 30,
    height: 30,
  },
  tempContainer: {
    flexDirection: 'row',
    width: 100,
    justifyContent: 'flex-end',
  },
  highTemp: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 10,
  },
  lowTemp: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 16,
  },
});

export default DailyForecast; 