import { Tabs } from 'expo-router';
import React from 'react';
import { LogBox } from 'react-native';


LogBox.ignoreAllLogs();

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false, tabBarStyle: { display: 'none' } }}>
      <Tabs.Screen name="index" />
    </Tabs>
  );
}