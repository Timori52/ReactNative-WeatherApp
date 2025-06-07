import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getAqiCategory } from '../services/weatherApi';

type AirQualitySectionProps = {
  aqi: number;
};

const AirQualitySection: React.FC<AirQualitySectionProps> = ({ aqi }) => {
  const { category, color } = getAqiCategory(aqi);
  
  // Calculate the progress percentage
  const progressPercentage = Math.min(aqi / 500 * 100, 100);
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>AQI</Text>
      
      <Text style={styles.aqiValue}>{category} ({aqi})</Text>
      
      <View style={styles.progressBarContainer}>
        <View style={[
          styles.progressBar, 
          { width: `${progressPercentage}%`, backgroundColor: color }
        ]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 15,
    paddingHorizontal: 70,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    paddingVertical: 10,
    marginHorizontal: 20,
  },
  title: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 15,
    fontWeight: '400',
    textAlign: 'center',
    
  },
  aqiValue: {
    color: 'white',
    fontSize: 19,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 5,
  },
  progressBarContainer: {
    height: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 10,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 10,
  },
});

export default AirQualitySection; 