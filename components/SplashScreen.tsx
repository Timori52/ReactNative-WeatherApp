import React, { useEffect, useRef } from 'react';
import { Image, StyleSheet, Dimensions, View, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

type SplashScreenProps = {
  onFinish: () => void;
};

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start(() => {
      // Wait a moment at full opacity
      setTimeout(() => {
        // Fade out animation
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }).start(() => {
          onFinish();
        });
      }, 1000); // Show at full opacity for 1 second
    });

    return () => {
      // Cleanup any timers if component unmounts
      fadeAnim.stopAnimation();
    };
  }, []);

  return (
    <LinearGradient
      colors={['#1DAEFF', '#C5EEFF']}
      start={{ x: 0, y: 1 }}
      end={{ x: 1, y: 0 }}
      style={styles.container}
    >
      <View style={styles.content}>
        <Animated.Image
          source={require('../assets/images/weatherIcons/Group.png')}
          style={[
            styles.logo,
            {
              opacity: fadeAnim
            }
          ]}
          resizeMode="contain"
        />
      </View>
    </LinearGradient>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: width * 0.7,
    height: width * 0.7,
  },
});

export default SplashScreen; 