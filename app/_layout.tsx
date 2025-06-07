import React from 'react';
import { Stack } from "expo-router";
// import { SafeAreaProvider } from 'react-native-safe-area-context';
import "../global.css"

export default function RootLayout() {
  return (
    <>
      <Stack 
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#4A90E2' },
          animation: 'slide_from_right',
        }} 
      />
    </>
  );
}
