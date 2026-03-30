import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Image,
  Modal, ActivityIndicator, StyleSheet, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useStore } from '../store';
import { analyseImageTags } from '../services/api';
import { colors, font, radius, gradient } from '../theme';
import ImageTile from '../components/ImageTile';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const PADDING = 12;
const COL_GAP = 8;
const COL_W = (SCREEN_W - PADDING * 2 - COL_GAP) / 2;

function toColumns(items) {
  const left = [], right = [];
  let lh = 0, rh = 0;
  for (const item of items) {
    const h = COL_W / (item.aspectRatio || 1);
    if (lh <= rh) { left.push(item); lh += h + 8; }
    else           { right.push(item); rh += h + 8; }
  }
  return { left, right };
}

export default function PinsScreen() {
  const { pinnedItems, togglePin, openaiKey, addToPalette, palette } = useStore();

  const [selected, setSelected]     = useState(null); // item shown in modal
  const [tags, setTags]             = useState({ atmosphere: [], elements: [] });
  const [tagsLoading, setTagsLoading] = useState(false);

  const items = Object.values(pinnedItems);
  const { left, right } = toColumns(items);

  const openPin = async (item) => {
    setSelected(item);
    setTags({ atmosphere: [], elements: [] });
    if (!openaiKey) return;
    setTagsLoading(true);
    try {
      const result = await analyseImageTags(item.thumb, false, openaiKey);
      setTags(result);
    } catch (_) {}
    setTagsLoading(false);
  };

  const closeModal = () => { setSelected(null); setTags({ atmosphere: [], elements: [] }); };

  const renderTile = (item) => (
    <TouchableOpacity key={item.id} onPress={() => openPin(item)} activeOpacity={0.85}>
      <ImageTile
        item={item}
        width={COL_W}
        isPinned={true}
        onPin={() => togglePin(item)}
      />
    </TouchableOpacity>
  );

  if (items.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyTitle}>No pins yet</Text>
        <Text style={styles.emptyBody}>Star items in Explore to pin them here.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.grid} showsVerticalScrollIndicator={false}>
        <View style={styles.columns}>
          <View style={styles.col}>{left.map(renderTile)}</View>
          <View style={[styles.col, { marginLeft: COL_GAP }]}>{right.map(renderTile)}</View>
        </View>
      </ScrollView>

      {/* Tag analysis modal */}
      <Modal visible={!!selected} animationType="slide" transparent onRequestClose={closeModal}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={closeModal} />
        <View style={styles.sheet}>
          {selected && (
            <>
              <View style={styles.sheetHandle} />
              <View style={styles.imgWrap}>
                <Image source={{ uri: selected.thumb }} style={styles.sheetImg} resizeMode="cover" />
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.6)']}
                  style={styles.imgOverlay}
                />
                <TouchableOpacity style={styles.unpinBtn} onPress={() => { togglePin(selected); closeModal(); }}>
                  <Text style={styles.unpinText}>✕  Unpin</Text>
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.sheetBody} showsVerticalScrollIndicator={false}>
                {tagsLoading ? (
                  <View style={styles.loadingRow}>
                    <ActivityIndicator color={colors.accent1} />
                    <Text style={styles.loadingText}>Analysing style...</Text>
                  </View>
                ) : (
                  <>
                    {!openaiKey && (
                      <Text style={styles.noKeyHint}>Add an OpenAI key in Settings to generate style tags.</Text>
                    )}
                    <TagSection
                      title="Atmosphere"
                      tags={tags.atmosphere}
                      palette={palette}
                      onAdd={addToPalette}
                    />
                    <TagSection
                      title="Decorative Elements"
                      tags={tags.elements}
                      palette={palette}
                      onAdd={addToPalette}
                    />
                  </>
                )}
              </ScrollView>
            </>
          )}
        </View>
      </Modal>
    </View>
  );
}

function TagSection({ title, tags, palette, onAdd }) {
  if (tags.length === 0) return null;
  return (
    <View style={styles.tagSection}>
      <Text style={styles.tagTitle}>{title}</Text>
      <View style={styles.tagRow}>
        {tags.map((tag) => {
          const active = palette.includes(tag);
          return (
            <TouchableOpacity
              key={tag}
              style={[styles.tag, active && styles.tagActive]}
              onPress={() => onAdd(tag)}
            >
              <Text style={[styles.tagText, active && styles.tagTextActive]}>#{tag}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const SHEET_H = SCREEN_H * 0.72;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  grid: { padding: PADDING, paddingBottom: 40 },
  columns: { flexDirection: 'row' },
  col: { flex: 1 },

  empty: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emptyTitle: { color: colors.text, fontSize: font.lg, fontWeight: '700', marginBottom: 8 },
  emptyBody: { color: colors.textDim, fontSize: font.sm, textAlign: 'center' },

  backdrop: { flex: 1, backgroundColor: 'rgba(3,30,60,0.45)' },
  sheet: {
    height: SHEET_H,
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  sheetHandle: {
    width: 36, height: 4, borderRadius: 2,
    backgroundColor: colors.surface2,
    alignSelf: 'center', marginTop: 10, marginBottom: 8,
  },
  imgWrap: { width: '100%', height: 200, position: 'relative' },
  sheetImg: { width: '100%', height: 200 },
  imgOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 80 },
  unpinBtn: {
    position: 'absolute', bottom: 10, right: 12,
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: radius.full,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
  },
  unpinText: { color: 'rgba(255,255,255,0.85)', fontSize: font.xs, fontWeight: '600' },

  sheetBody: { flex: 1, padding: 14 },
  loadingRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 20 },
  loadingText: { color: colors.textDim, fontSize: font.sm, marginLeft: 10 },
  noKeyHint: { color: colors.textDim, fontSize: font.xs, fontStyle: 'italic', marginBottom: 12 },

  tagSection: { marginBottom: 16 },
  tagTitle: {
    fontSize: font.xs, fontWeight: '800', color: colors.textDim,
    textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8,
  },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap' },
  tag: {
    paddingHorizontal: 12, paddingVertical: 5,
    borderRadius: radius.full,
    borderWidth: 1.5, borderColor: colors.surface2,
    backgroundColor: colors.bg,
    marginRight: 6, marginBottom: 6,
  },
  tagActive: { backgroundColor: colors.accent1, borderColor: colors.accent1 },
  tagText: { color: colors.textDim, fontSize: font.xs },
  tagTextActive: { color: '#fff' },
});
