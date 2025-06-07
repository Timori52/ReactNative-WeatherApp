# Weather App

A modern, intuitive weather application built with React Native and Expo that provides real-time weather information with a beautiful UI.

## Technologies Used

- **React Native**: Cross-platform mobile application framework
- **Expo**: Toolchain for React Native development
- **TypeScript**: For type-safe code
- **OpenWeather API**: For weather data
- **React Navigation**: For screen navigation
- **Expo Router**: For app routing
- **AsyncStorage**: For persistent storage
- **Expo Location**: For geolocation services
- **React Native Reanimated**: For smooth animations
- **Expo Vector Icons**: For UI icons

## Design Rationale

The app was designed with the following principles in mind:

1. **Simplicity**: Clean, intuitive interface that focuses on the most important weather information
2. **Visual Appeal**: Modern gradient backgrounds, custom weather icons, and smooth animations
3. **Performance**: Efficient API calls and state management for fast loading times
4. **Usability**: Easy navigation, clear information hierarchy, and intuitive interactions
5. **Functionality**: Comprehensive weather data with current conditions, hourly and daily forecasts

The app features a splash screen, global city search, temperature unit selection (Celsius/Fahrenheit), and geolocation support for displaying weather based on the user's current location.

## How to Run the App Locally

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Expo CLI
- Android Studio (for Android emulation) or Xcode (for iOS simulation)
- A physical device with Expo Go app (optional)

### Installation Steps

1. Clone the repository:
   ```
   git clone "https://github.com/Timori52/React-Native-Weather-App.githttps://github.com/Timori52/React-Native-Weather-App.git"
   cd weatherapp/reactnativeapp
   ```

2. Install dependencies:
   ```
   npm install
   ```
   or
   ```
   yarn install
   ```

3. Create a `.env` file (if not already present) with your OpenWeather API key:
   ```
   OPENWEATHER_API_KEY=your_api_key_here
   ```

4. Start the development server:
   ```
   npx expo start
   ```

5. Run on a device or emulator:
   - Press `a` in the terminal to run on an Android emulator
   - Press `i` to run on an iOS simulator
   - Scan the QR code with Expo Go app on your phone

## Usability Heuristics

The app was designed with Nielsen's usability heuristics in mind:

### 1. Visibility of System Status
- Loading indicators when fetching weather data
- Clear display of selected city and temperature unit
- Visual feedback for button presses

### 2. Match Between System and the Real World
- Intuitive weather icons that represent actual weather conditions
- Natural language for weather descriptions
- Familiar temperature units (°C/°F)

### 3. User Control and Freedom
- Easy navigation between screens
- Ability to switch cities quickly
- Option to cancel city search
- Temperature unit preference saved between sessions

### 4. Consistency and Standards
- Consistent design language throughout the app
- Standard icons for common functions (settings, location, search)
- Familiar UI patterns for mobile applications

### 5. Error Prevention
- Graceful handling of API failures
- Clear error messages
- Default city when location services are unavailable

### 6. Recognition Rather Than Recall
- Search suggestions for cities
- Visual cues for interactive elements
- Current location button for quick access to local weather

### 7. Flexibility and Efficiency of Use
- Quick access to frequently used cities
- Geolocation for instant local weather
- Persistent user preferences

### 8. Aesthetic and Minimalist Design
- Clean, uncluttered interface
- Focus on essential weather information
- Beautiful gradients and animations that don't distract from content

### 9. Help Users Recognize, Diagnose, and Recover from Errors
- Clear error messages with suggestions for resolution
- Automatic retries for failed API calls
- Graceful fallbacks when specific features are unavailable

### 10. Help and Documentation
- Intuitive UI that requires minimal explanation
- Visual cues for interactive elements
- Responsive design for various device sizes

## Future Enhancements

- Weather alerts and notifications
- More detailed weather information (precipitation, pressure, etc.)
- Historical weather data
- Weather maps
- Multiple saved locations
- Dark/light theme support
- Localization for multiple languages
