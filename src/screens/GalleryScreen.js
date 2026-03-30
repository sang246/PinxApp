import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Image,
  Modal, StyleSheet, Dimensions, Alert,
} from 'react-native';
import { useStore } from '../store';
import { colors, font, radius } from '../theme';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const PADDING = 12;
const COL_GAP = 8;
const THUMB = (SCREEN_W - PADDING * 2 - COL_GAP * 2) / 3;

export default function GalleryScreen() {
  const { gallery, removeFromGallery, togglePin, pinned } = useStore();
  const [preview, setPreview] = useState(null);

  const confirmDelete = (item) => {
    Alert.alert('Delete image?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => { removeFromGallery(item.id); if (preview?.id === item.id) setPreview(null); } },
    ]);
  };

  if (gallery.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyTitle}>No generated images yet</Text>
        <Text style={styles.emptyBody}>Generate images in Fusion Studio and save them here.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.grid} showsVerticalScrollIndicator={false}>
        {/* 3-column grid — all images are 1:1 from DALL-E */}
        {chunk(gallery, 3).map((row, ri) => (
          <View key={ri} style={styles.row}>
            {row.map((item) => (
              <TouchableOpacity key={item.id} onPress={() => setPreview(item)} activeOpacity={0.85}>
                <Image source={{ uri: item.uri }} style={styles.thumb} resizeMode="cover" />
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </ScrollView>

      {/* Full-screen preview modal */}
      <Modal visible={!!preview} animationType="fade" transparent onRequestClose={() => setPreview(null)}>
        <View style={styles.modalBg}>
          <TouchableOpacity style={styles.modalClose} onPress={() => setPreview(null)}>
            <Text style={styles.modalCloseText}>✕</Text>
          </TouchableOpacity>

          {preview && (
            <>
              <Image source={{ uri: preview.uri }} style={styles.previewImg} resizeMode="contain" />
              {preview.prompt ? (
                <Text style={styles.previewPrompt} numberOfLines={3}>{preview.prompt}</Text>
              ) : null}
              <View style={styles.previewActions}>
                <View style={styles.actionBtnWrap}>
                  <TouchableOpacity
                    style={[styles.actionBtn, pinned.has('gi_' + preview.id) && styles.actionBtnActive]}
                    onPress={() => togglePin({ id: 'gi_' + preview.id, type: 'gi', thumb: preview.uri, full: preview.uri, title: 'Generated Image', aspectRatio: 1 })}
                  >
                    <Text style={styles.actionBtnText}>
                      {pinned.has('gi_' + preview.id) ? '★  Pinned' : '☆  Pin'}
                    </Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity style={[styles.actionBtn, styles.actionBtnDelete]} onPress={() => confirmDelete(preview)}>
                  <Text style={styles.actionBtnText}>🗑  Delete</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </Modal>
    </View>
  );
}

function chunk(arr, size) {
  const result = [];
  for (let i = 0; i < arr.length; i += size) result.push(arr.slice(i, i + size));
  return result;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  grid: { padding: PADDING, paddingBottom: 40 },
  row: { flexDirection: 'row', marginBottom: COL_GAP },
  thumb: {
    width: THUMB, height: THUMB,
    borderRadius: radius.sm,
    marginRight: COL_GAP,
    backgroundColor: colors.surface2,
  },

  empty: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emptyTitle: { color: colors.text, fontSize: font.lg, fontWeight: '700', marginBottom: 8 },
  emptyBody: { color: colors.textDim, fontSize: font.sm, textAlign: 'center', lineHeight: 20 },

  modalBg: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.92)',
    alignItems: 'center', justifyContent: 'center',
  },
  modalClose: { position: 'absolute', top: 52, right: 20, padding: 8 },
  modalCloseText: { color: '#fff', fontSize: 20 },
  previewImg: { width: SCREEN_W - 32, height: SCREEN_W - 32, borderRadius: radius.md },
  previewPrompt: {
    color: colors.textDim, fontSize: font.xs, fontStyle: 'italic',
    textAlign: 'center', marginTop: 12, paddingHorizontal: 32,
  },
  previewActions: { flexDirection: 'row', marginTop: 16 },
  actionBtnWrap: { marginRight: 12 },
  actionBtn: {
    paddingHorizontal: 20, paddingVertical: 10,
    borderRadius: radius.md, borderWidth: 1.5, borderColor: colors.surface2,
    backgroundColor: colors.surface,
  },
  actionBtnActive: { borderColor: colors.accent1, backgroundColor: colors.accent1 + '33' },
  actionBtnDelete: { borderColor: '#6e2d2d', backgroundColor: '#3a1a1a' },
  actionBtnText: { color: colors.text, fontSize: font.sm, fontWeight: '700' },
});
