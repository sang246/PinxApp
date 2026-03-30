import React from 'react';
import { View, Image, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors, radius } from '../theme';

export default function ImageTile({ item, width, onPin, isPinned }) {
  const height = width / (item.aspectRatio || 1);

  return (
    <View style={[styles.tile, { width, height }]}>
      <Image
        source={{ uri: item.thumb }}
        style={styles.img}
        resizeMode="cover"
      />
      <TouchableOpacity
        style={[styles.pinBtn, isPinned && styles.pinBtnActive]}
        onPress={onPin}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Text style={styles.pinIcon}>{isPinned ? '★' : '☆'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: colors.surface2,
    marginBottom: 8,
  },
  img: { width: '100%', height: '100%' },
  pinBtn: {
    position: 'absolute',
    top: 6, right: 6,
    width: 28, height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinBtnActive: { backgroundColor: colors.accent1 },
  pinIcon: { color: '#fff', fontSize: 13 },
});
