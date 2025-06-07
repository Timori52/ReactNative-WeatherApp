import React from 'react';
import { TouchableOpacity, Image, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

type AddButtonProps = {
  onPress: () => void;
  onLocationPress: () => void;
};

const AddButton: React.FC<AddButtonProps> = ({ onPress, onLocationPress }) => {
  const router = useRouter();

  const handleSettingsPress = () => {
    router.push('/weatherSettings');
  };

  return (
    <View style={styles.container}>
       {/* GeoLocation button on the left */}
       <TouchableOpacity 
        style={styles.locationButton}
        onPress={onLocationPress}
        activeOpacity={0.7}
      >
        <Ionicons name="location" size={24} color="white" />
      </TouchableOpacity>
      {/* Bottom Section Image */}
      <Image 
        source={require('../assets/images/weatherIcons/addBottomTheme.png')} 
        style={styles.bottomImage}
        resizeMode="cover"
      />

      {/* Add Button in the center */}
      <TouchableOpacity 
        style={styles.addButton}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <Image 
          source={require('../assets/images/weatherIcons/AddButton.png')} 
          style={styles.addButtonImage}
          resizeMode="contain"
        />
      </TouchableOpacity>

      {/* Settings button on the right */}
      <TouchableOpacity 
        style={styles.settingsButton}
        onPress={handleSettingsPress}
        activeOpacity={0.7}
      >
        <Ionicons name="settings" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    bottom: 0,
    left: 0,
    right: 0,
    width: '100%',
    alignItems: 'center',
    position: 'absolute',
  },
  bottomImage: {
    width: '100%',
    height: 180,
    position: 'absolute',
    bottom: -20,
    marginBottom: 0,
  },
  addButton: {
    position: 'absolute',
    bottom: 10, 
    alignSelf: 'center',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  addButtonImage: {
    width: 100,
    height: 100,
  },
  settingsButton: {
    position: 'absolute',
    bottom: 20,
    right: 30,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 3},
  locationButton: {
    position: 'absolute',
    bottom: 20,
    left: 30,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 3,
  },
});

export default AddButton;
