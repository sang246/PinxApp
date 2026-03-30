import React, { useRef, useState } from 'react';
import { View, Image, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { colors, radius } from '../theme';

export default function VideoTile({ item, width, onPin, isPinned }) {
  const height = width / (item.aspectRatio || 1.77);
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [ready, setReady] = useState(false);

  const toggle = async () => {
    if (!ready) return;
    try {
      if (playing) {
        await videoRef.current?.pauseAsync();
      } else {
        await videoRef.current?.playAsync();
      }
      setPlaying((p) => !p);
    } catch (_) {}
  };

  return (
    <View style={[styles.tile, { width, height }]}>
      {/* Thumbnail shown until video loads */}
      {!playing && (
        <Image source={{ uri: item.thumb }} style={styles.cover} resizeMode="cover" />
      )}

      <Video
        ref={videoRef}
        source={{ uri: item.videoUrl }}
        style={[styles.cover, !playing && styles.hidden]}
        resizeMode={ResizeMode.COVER}
        isLooping
        isMuted
        onReadyForDisplay={() => setReady(true)}
      />

      {/* Play / pause overlay */}
      <TouchableOpacity style={styles.overlay} onPress={toggle} activeOpacity={0.8}>
        {!playing && (
          <View style={styles.playBtn}>
            <Text style={styles.playIcon}>▶</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Video badge */}
      <View style={styles.badge}>
        <Text style={styles.badgeText}>VIDEO</Text>
      </View>

      {/* Pin button */}
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
  cover: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  hidden: { opacity: 0 },
  overlay: { position: 'absolute', inset: 0, alignItems: 'center', justifyContent: 'center' },
  playBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center', justifyContent: 'center',
  },
  playIcon: { color: '#fff', fontSize: 14, marginLeft: 2 },
  badge: {
    position: 'absolute', bottom: 6, left: 6,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 4, paddingHorizontal: 5, paddingVertical: 2,
  },
  badgeText: { color: '#fff', fontSize: 8, fontWeight: '800', letterSpacing: 0.5 },
  pinBtn: {
    position: 'absolute', top: 6, right: 6,
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center', justifyContent: 'center',
  },
  pinBtnActive: { backgroundColor: colors.accent1 },
  pinIcon: { color: '#fff', fontSize: 13 },
});
