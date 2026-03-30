import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import { useStore } from './src/store';
import { colors } from './src/theme';

import ExploreScreen from './src/screens/ExploreScreen';
import PinsScreen from './src/screens/PinsScreen';
import FusionScreen from './src/screens/FusionScreen';
import SettingsScreen from './src/screens/SettingsScreen';

const Tab = createBottomTabNavigator();

const icon = (label) => ({ focused }) => (
  <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>{label}</Text>
);

export default function App() {
  const hydrate = useStore((s) => s.hydrate);

  useEffect(() => {
    hydrate();
  }, []);

  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Tab.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: colors.bg },
          headerTintColor: colors.text,
          headerTitleStyle: { fontWeight: '800' },
          tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.surface2 },
          tabBarActiveTintColor: colors.accent1,
          tabBarInactiveTintColor: colors.textDim,
        }}
      >
        <Tab.Screen
          name="Explore"
          component={ExploreScreen}
          options={{ tabBarIcon: icon('🔍'), title: 'Explore' }}
        />
        <Tab.Screen
          name="Pins"
          component={PinsScreen}
          options={{ tabBarIcon: icon('📌'), title: 'My Pins' }}
        />
        <Tab.Screen
          name="Fusion"
          component={FusionScreen}
          options={{ tabBarIcon: icon('⚡'), title: 'Fusion Studio' }}
        />
        <Tab.Screen
          name="Settings"
          component={SettingsScreen}
          options={{ tabBarIcon: icon('⚙️'), title: 'Settings' }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
