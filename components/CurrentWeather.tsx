import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TemperatureUnit } from '../app/weatherSettings';

type CurrentWeatherProps = {
  location: string;
  temperature: number;
  condition: string;
  date: string;
  iconSource: any;
  unit: TemperatureUnit;
  feelsLike?: number;
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
  date,
  iconSource,
  unit = 'celsius', // Default to celsius if not provided
  feelsLike,
}) => {
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
      
      <Text style={styles.temperature}>{formatTemp(temperature, unit)}</Text>
      {feelsLike && (
        <Text style={styles.feelsLike}>Feels like {formatTemp(feelsLike, unit)}</Text>
      )}
      <Text style={styles.condition}>{condition}</Text>
      
      <Text style={styles.date}>{date}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingTop: 60,
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
  feelsLike: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 8,
    textAlign: 'center',
  },
  condition: {
    color: 'white',
    fontSize: 22,
    fontWeight: '600',
    marginTop: 5,
  },
  date: {
    color: 'white',
    fontSize: 16,
    marginTop: 10,
  },
});

export default CurrentWeather; 