import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useStore } from './src/store';
import { colors } from './src/theme';

import ExploreScreen  from './src/screens/ExploreScreen';
import PinsScreen     from './src/screens/PinsScreen';
import FusionScreen   from './src/screens/FusionScreen';
import GalleryScreen  from './src/screens/GalleryScreen';
import SettingsScreen from './src/screens/SettingsScreen';

const TABS = [
  { key: 'explore',  label: 'Explore',  icon: '🔍' },
  { key: 'pins',     label: 'My Pins',  icon: '📌' },
  { key: 'fusion',   label: 'Fusion',   icon: '⚡' },
  { key: 'gallery',  label: 'Gallery',  icon: '🖼️' },
  { key: 'settings', label: 'Settings', icon: '⚙️' },
];

export default function App() {
  const [active, setActive] = useState('explore');
  const hydrate = useStore((s) => s.hydrate);

  useEffect(() => { hydrate(); }, []);

  const renderScreen = () => {
    switch (active) {
      case 'explore':  return <ExploreScreen />;
      case 'pins':     return <PinsScreen />;
      case 'fusion':   return <FusionScreen />;
      case 'gallery':  return <GalleryScreen />;
      case 'settings': return <SettingsScreen />;
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {TABS.find((t) => t.key === active)?.label}
        </Text>
      </View>
      <View style={styles.screen}>{renderScreen()}</View>
      <View style={styles.tabBar}>
        {TABS.map((tab) => {
          const focused = active === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={styles.tabItem}
              onPress={() => setActive(tab.key)}
              activeOpacity={0.7}
            >
              {focused && <View style={styles.tabIndicator} />}
              <Text style={styles.tabIcon}>{tab.icon}</Text>
              <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: {
    paddingTop: Platform.OS === 'ios' ? 54 : 36,
    paddingBottom: 12,
    paddingHorizontal: 18,
    backgroundColor: colors.bg,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface2,
  },
  headerTitle: { color: colors.text, fontSize: 18, fontWeight: '800' },
  screen: { flex: 1 },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.surface2,
    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
    paddingTop: 6,
  },
  tabItem:  { flex: 1, alignItems: 'center', position: 'relative', paddingTop: 4 },
  tabIcon:  { fontSize: 18 },
  tabLabel: { fontSize: 9, color: colors.textDim, marginTop: 2 },
  tabLabelActive: { color: colors.accent1, fontWeight: '700' },
  tabIndicator: {
    position: 'absolute', top: 0, width: 20, height: 2,
    borderRadius: 2, backgroundColor: colors.accent1,
  },
});
