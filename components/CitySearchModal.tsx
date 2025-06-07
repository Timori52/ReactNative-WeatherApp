import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  Modal, 
  TouchableOpacity, 
  FlatList,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import weatherApi, { CitySearchResult } from '../services/weatherApi';

type CitySearchModalProps = {
  visible: boolean;
  onClose: () => void;
  onSelectCity: (city: string) => void;
};

// Popular cities to show by default
const POPULAR_CITIES = [
  'New York', 
  'London', 
  'Tokyo', 
  'Paris', 
  'Sydney', 
  'Berlin', 
  'Moscow', 
  'Dubai', 
  'Singapore', 
  'Hong Kong',
  'Los Angeles',
  'Mumbai',
  'Rio de Janeiro',
  'Bangkok',
  'Toronto',
  'Agra'
];

const CitySearchModal: React.FC<CitySearchModalProps> = ({
  visible,
  onClose,
  onSelectCity,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<CitySearchResult[]>([]);
  const [popularCitiesData, setPopularCitiesData] = useState<CitySearchResult[]>([]);
  const [loadingPopularCities, setLoadingPopularCities] = useState(false);
  
  // Reset search when modal opens
  useEffect(() => {
    if (visible) {
      setSearchQuery('');
      setSearchResults([]);
      setSearching(false);
      fetchPopularCities();
    }
  }, [visible]);

  // Fetch data for popular cities
  const fetchPopularCities = async () => {
    if (popularCitiesData.length > 0) return;
    
    setLoadingPopularCities(true);
    try {
      const citiesData = await Promise.all(
        POPULAR_CITIES.map(async (city) => {
          try {
            const results = await weatherApi.searchCities(city);
            return results[0]; // Taking the first result for each popular city
          } catch (error) {
            console.error(`Error fetching data for ${city}:`, error);
            return null;
          }
        })
      );
      
      setPopularCitiesData(citiesData.filter(city => city !== null) as CitySearchResult[]);
    } catch (error) {
      console.error('Error fetching popular cities:', error);
    } finally {
      setLoadingPopularCities(false);
    }
  };

  // Search cities using the weatherApi
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSearchResults([]);
      setSearching(false);
      return;
    }

    setSearching(true);
    
    const timer = setTimeout(async () => {
      try {
        const results = await weatherApi.searchCities(searchQuery);
        setSearchResults(results);
      } catch (error) {
        console.error('Error searching cities:', error);
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Cities to display: search results or popular cities
  const citiesToDisplay = searchQuery.trim() === '' 
    ? popularCitiesData
    : searchResults;

  const renderCityItem = (item: CitySearchResult) => {
    // Format location name with state/country if available
    const locationText = item.state 
      ? `${item.name}, ${item.state}, ${item.country}`
      : `${item.name}, ${item.country}`;
      
    return (
      <TouchableOpacity 
        style={styles.cityItem}
        onPress={() => {
          onSelectCity(item.name);
          onClose();
        }}
      >
        <View style={styles.cityNameContainer}>
          <Ionicons name="location" size={16} color="rgba(255, 255, 255, 0.7)" style={styles.locationIcon} />
          <Text style={styles.cityName}>{locationText}</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color="rgba(255, 255, 255, 0.7)" />
      </TouchableOpacity>
    );
  };
  
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      statusBarTranslucent
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.title}>Add City</Text>
        </View>

        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="rgba(255, 255, 255, 0.7)" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for a city"
            placeholderTextColor="rgba(255, 255, 255, 0.7)"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
              <Ionicons name="close-circle" size={20} color="rgba(255, 255, 255, 0.7)" />
            </TouchableOpacity>
          )}
        </View>

        {searching || loadingPopularCities ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="white" />
          </View>
        ) : (
          <>
            {searchQuery.trim() !== '' && searchResults.length === 0 ? (
              <View style={styles.noResultsContainer}>
                <Text style={styles.noResultsText}>No cities found</Text>
                <Text style={styles.noResultsSubtext}>Try a different search term</Text>
              </View>
            ) : (
              <>
                <Text style={styles.resultsTitle}>
                  {searchQuery.trim() === '' ? 'Popular Cities' : 'Search Results'}
                </Text>
                <FlatList
                  data={citiesToDisplay}
                  keyExtractor={(item, index) => `${item.name}-${item.lat}-${item.lon}-${index}`}
                  renderItem={({ item }) => renderCityItem(item)}
                  ItemSeparatorComponent={() => <View style={styles.separator} />}
                  ListEmptyComponent={
                    <View style={styles.noResultsContainer}>
                      <Text style={styles.noResultsText}>Loading cities...</Text>
                    </View>
                  }
                />
              </>
            )}
          </>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#6908d4',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 50,
  },
  closeButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
    marginLeft: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 10,
    margin: 16,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 46,
    color: 'white',
    fontSize: 16,
  },
  clearButton: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
  },
  noResultsText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  noResultsSubtext: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 16,
  },
  resultsTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  cityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  cityNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationIcon: {
    marginRight: 8,
  },
  cityName: {
    fontSize: 18,
    color: 'white',
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginHorizontal: 16,
  },
});

export default CitySearchModal;