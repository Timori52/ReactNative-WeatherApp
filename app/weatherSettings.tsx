import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, FlatList } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Temperature unit type
export type TemperatureUnit = 'celsius' | 'fahrenheit';

// Key for AsyncStorage
export const TEMPERATURE_UNIT_KEY = 'weather_app_temp_unit';

const WeatherSettings = () => {
  const router = useRouter();
  const [temperatureUnit, setTemperatureUnit] = useState<TemperatureUnit>('celsius');
  const [unitDropdownVisible, setUnitDropdownVisible] = useState(false);

  // Load saved temperature unit when component mounts
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
  }, []);

  // Save temperature unit when it changes
  const updateTemperatureUnit = async (unit: TemperatureUnit) => {
    try {
      await AsyncStorage.setItem(TEMPERATURE_UNIT_KEY, unit);
      setTemperatureUnit(unit);
      setUnitDropdownVisible(false);
    } catch (error) {
      console.error('Error saving temperature unit:', error);
    }
  };

  // Format the temperature unit for display
  const getFormattedUnit = (unit: TemperatureUnit): string => {
    if (unit === 'celsius') return 'Celsius (°C)';
    return 'Fahrenheit (°F)';
  };

  return (
    <LinearGradient
      colors={['#1DAEFF', '#C5EEFF']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <StatusBar style="light" />
      
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.card}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>App Version</Text>
              <Text style={styles.infoValue}>1.0.0</Text>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Built using</Text>
              <Text style={styles.infoValue}>React Native + Expo + OpenWeatherMap API</Text>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Designed for</Text>
              <Text style={styles.infoValue}>Reli.ai Frontend assessment</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Weather Data</Text>
          <View style={styles.card}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Data Source</Text>
              <Text style={styles.infoValue}>OpenWeatherMap</Text>
            </View>
            
            <View style={styles.divider} />
            
            <TouchableOpacity 
              style={styles.infoRow}
              onPress={() => setUnitDropdownVisible(true)}
            >
              <Text style={styles.infoLabel}>Units</Text>
              <View style={styles.unitSelector}>
                <Text style={styles.infoValue}>{getFormattedUnit(temperatureUnit)}</Text>
                <Ionicons name="chevron-down" size={16} color="white" style={styles.dropdownIcon} />
              </View>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Developer Info</Text>
          <View style={styles.card}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Created By</Text>
              <Text style={styles.infoValue}>Sumit Timori</Text>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Year</Text>
              <Text style={styles.infoValue}>{new Date().getFullYear()}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Temperature Unit Dropdown Modal */}
      <Modal
        visible={unitDropdownVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setUnitDropdownVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setUnitDropdownVisible(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Temperature Unit</Text>
            
            <TouchableOpacity 
              style={[
                styles.unitOption,
                temperatureUnit === 'celsius' && styles.selectedUnitOption
              ]}
              onPress={() => updateTemperatureUnit('celsius')}
            >
              <Text style={[
                styles.unitOptionText,
                temperatureUnit === 'celsius' && styles.selectedUnitText
              ]}>Celsius (°C)</Text>
              {temperatureUnit === 'celsius' && (
                <Ionicons name="checkmark" size={20} color="#1DAEFF" />
              )}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.unitOption,
                temperatureUnit === 'fahrenheit' && styles.selectedUnitOption
              ]}
              onPress={() => updateTemperatureUnit('fahrenheit')}
            >
              <Text style={[
                styles.unitOptionText,
                temperatureUnit === 'fahrenheit' && styles.selectedUnitText
              ]}>Fahrenheit (°F)</Text>
              {temperatureUnit === 'fahrenheit' && (
                <Ionicons name="checkmark" size={20} color="#1DAEFF" />
              )}
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
    marginLeft: 15,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginVertical: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginBottom: 10,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 15,
    padding: 15,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  infoLabel: {
    fontSize: 16,
    color: 'white',
    opacity: 0.8,
  },
  infoValue: {
    fontSize: 16,
    color: 'white',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  unitSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
  },
  dropdownIcon: {
    marginLeft: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    width: '80%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
    textAlign: 'center',
  },
  unitOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  selectedUnitOption: {
    backgroundColor: 'rgba(29, 174, 255, 0.1)',
  },
  unitOptionText: {
    fontSize: 16,
    color: '#333',
  },
  selectedUnitText: {
    color: '#1DAEFF',
    fontWeight: 'bold',
  },
});

export default WeatherSettings; 