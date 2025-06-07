import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { TemperatureUnit } from '../app/weatherSettings';
import { formatTemp } from './CurrentWeather';

type DayForecast = {
  day: string;
  iconSource: any;
  high: number;
  low: number;
};



const DailyForecast: React.FC<DailyForecastProps> = ({ data, unit = 'celsius' }) => {
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
            <Text style={styles.highTemp}>{formatTemp(item.high, unit)}</Text>
            <Text style={styles.lowTemp}>{formatTemp(item.low, unit)}</Text>
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