import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts, DancingScript_700Bold } from '@expo-google-fonts/dancing-script';
import { useStore } from './src/store';
import { colors, gradient, font } from './src/theme';

import ExploreScreen  from './src/screens/ExploreScreen';
import PinsScreen     from './src/screens/PinsScreen';
import FusionScreen   from './src/screens/FusionScreen';
import GalleryScreen  from './src/screens/GalleryScreen';
import SettingsScreen from './src/screens/SettingsScreen';

const TABS = [
  { key: 'explore',  label: 'Explore',  icon: '🔍' },
  { key: 'pins',     label: 'My Pins',  icon: '📌', badge: 'pins' },
  { key: 'fusion',   label: 'Fusion',   icon: '⚡' },
  { key: 'gallery',  label: 'Gallery',  icon: '🖼️', badge: 'gallery' },
  { key: 'settings', label: 'Settings', icon: '⚙️' },
];

export default function App() {
  const [active, setActive] = useState('explore');
  const hydrate  = useStore((s) => s.hydrate);
  const pinCount = useStore((s) => s.pinned.size);
  const galCount = useStore((s) => s.gallery.length);

  const [fontsLoaded] = useFonts({ DancingScript_700Bold });

  useEffect(() => { hydrate(); }, []);

  const getBadge = (key) => {
    if (key === 'pins')    return pinCount > 0 ? pinCount : null;
    if (key === 'gallery') return galCount > 0 ? galCount : null;
    return null;
  };

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

      {/* ── Header ── */}
      <View style={styles.header}>
        {fontsLoaded ? (
          <Text style={styles.logo}>pinx</Text>
        ) : (
          <Text style={[styles.logo, { fontFamily: undefined, fontWeight: '900' }]}>pinx</Text>
        )}
        <Text style={styles.screenName}>
          {TABS.find((t) => t.key === active)?.label}
        </Text>
      </View>

      {/* ── Screen ── */}
      <View style={styles.screen}>{renderScreen()}</View>

      {/* ── Tab bar ── */}
      <View style={styles.tabBar}>
        {TABS.map((tab) => {
          const focused = active === tab.key;
          const badge   = getBadge(tab.key);
          return (
            <TouchableOpacity
              key={tab.key}
              style={styles.tabItem}
              onPress={() => setActive(tab.key)}
              activeOpacity={0.7}
            >
              {focused && (
                <LinearGradient
                  colors={gradient}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  style={styles.tabIndicator}
                />
              )}
              <View style={styles.tabIconWrap}>
                <Text style={[styles.tabIcon, focused && styles.tabIconFocused]}>{tab.icon}</Text>
                {badge != null && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{badge > 99 ? '99+' : badge}</Text>
                  </View>
                )}
              </View>
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
    paddingTop: Platform.OS === 'ios' ? 56 : 38,
    paddingBottom: 10,
    paddingHorizontal: 18,
    backgroundColor: colors.bg,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface2,
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 10,
  },
  logo: {
    fontFamily: 'DancingScript_700Bold',
    fontSize: 28,
    color: colors.accent1,
    letterSpacing: 0.5,
  },
  screenName: {
    fontSize: font.sm,
    color: colors.textDim,
    fontWeight: '600',
    letterSpacing: 0.3,
  },

  screen: { flex: 1 },

  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.surface2,
    paddingBottom: Platform.OS === 'ios' ? 26 : 8,
    paddingTop: 6,
  },
  tabItem: { flex: 1, alignItems: 'center', position: 'relative', paddingTop: 6 },
  tabIndicator: {
    position: 'absolute',
    top: 0, left: '20%', right: '20%',
    height: 2, borderRadius: 2,
  },
  tabIconWrap: { position: 'relative' },
  tabIcon: { fontSize: 20, opacity: 0.5 },
  tabIconFocused: { opacity: 1 },
  tabLabel: { fontSize: 9, color: colors.textDim, marginTop: 3 },
  tabLabelActive: { color: colors.accent1, fontWeight: '700' },

  badge: {
    position: 'absolute', top: -4, right: -8,
    minWidth: 16, height: 16, borderRadius: 8,
    backgroundColor: colors.accent2,
    alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: { color: '#fff', fontSize: 8, fontWeight: '800' },
});
