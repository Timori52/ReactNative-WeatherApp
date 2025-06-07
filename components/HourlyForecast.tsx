import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TemperatureUnit, TEMPERATURE_UNIT_KEY } from '../app/weatherSettings';

type HourlyForecastItem = {
  hour: string;
  temperature: number;
  iconSource: any;
  isNow?: boolean;
};

type HourlyForecastProps = {
  data: HourlyForecastItem[];
};

// Helper function to format temperature
const formatTemp = (temp: number, unit: TemperatureUnit): string => {
  const symbol = unit === 'celsius' ? '°C' : '°F';
  return `${temp}${symbol}`;
};

const HourlyForecast: React.FC<HourlyForecastProps> = ({ data }) => {
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
      <Text style={styles.title}>Today</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {data.map((item, index) => (
          <View 
            key={index} 
            style={[
              styles.hourItem,
              item.isNow && styles.nowItem
            ]}
          >
            <Text style={[styles.hourText, item.isNow && styles.nowText]}>
              {item.hour}
            </Text>
            <View style={styles.iconContainer}>
              <Image 
                source={typeof item.iconSource === 'string' ? { uri: item.iconSource } : item.iconSource} 
                style={styles.icon} 
                resizeMode="contain" 
              />
            </View>
            <Text style={[styles.tempText, item.isNow && styles.nowText]}>
              {formatTemp(item.temperature, temperatureUnit)}
            </Text>
          </View>
        ))}
      </ScrollView>
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
  scrollContent: {
    paddingRight: 20,
  },
  hourItem: {
    alignItems: 'center',
    marginRight: 20,
    width: 60,
    height: 120,
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderRadius: 30,
  },
  nowItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  hourText: {
    color: 'white',
    fontSize: 14,
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
  tempText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  nowText: {
    color: 'white',
  },
});

export default HourlyForecast; 