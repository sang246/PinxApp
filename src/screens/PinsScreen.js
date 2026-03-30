import React, { useState } from 'react';
import {
  View, Text, FlatList, Image, TouchableOpacity,
  StyleSheet, Dimensions, ActivityIndicator,
} from 'react-native';
import { useStore } from '../store';
import { analyseImageTags } from '../services/api';
import { colors, font, radius } from '../theme';

const NUM_COLS = 2;
const GAP = 8;
const PADDING = 12;
const TILE_WIDTH = (Dimensions.get('window').width - PADDING * 2 - GAP) / NUM_COLS;

export default function PinsScreen() {
  const { pinnedItems, pinned, togglePin, openaiKey, addToPalette, palette } = useStore();
  const [expanded, setExpanded] = useState(null);
  const [tags, setTags] = useState({ atmosphere: [], elements: [] });
  const [tagsLoading, setTagsLoading] = useState(false);

  const items = Object.values(pinnedItems);

  const onSelect = async (item) => {
    if (expanded === item.id) {
      setExpanded(null);
      return;
    }
    setExpanded(item.id);
    setTags({ atmosphere: [], elements: [] });
    if (!openaiKey) return;
    setTagsLoading(true);
    try {
      const result = await analyseImageTags(item.thumb, false, openaiKey);
      setTags(result);
    } catch (_) {}
    setTagsLoading(false);
  };

  const renderTag = (tag) => {
    const inPalette = palette.includes(tag);
    return (
      <TouchableOpacity
        key={tag}
        style={[styles.tag, inPalette && styles.tagActive]}
        onPress={() => addToPalette(tag)}
      >
        <Text style={[styles.tagText, inPalette && styles.tagTextActive]}>#{tag}</Text>
      </TouchableOpacity>
    );
  };

  const renderItem = ({ item, index }) => {
    const isRight = index % NUM_COLS === 1;
    const isExpanded = expanded === item.id;
    return (
      <View style={[styles.tile, isRight && { marginLeft: GAP }]}>
        <TouchableOpacity onPress={() => onSelect(item)} activeOpacity={0.85}>
          <Image source={{ uri: item.thumb }} style={styles.tileImg} resizeMode="cover" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.unpinBtn} onPress={() => togglePin(item)}>
          <Text style={styles.unpinText}>✕</Text>
        </TouchableOpacity>
        {isExpanded && (
          <View style={styles.expander}>
            {tagsLoading ? (
              <ActivityIndicator color={colors.accent1} />
            ) : (
              <>
                <Text style={styles.expanderTitle}>Atmosphere</Text>
                <View style={styles.tagRow}>{tags.atmosphere.map(renderTag)}</View>
                <Text style={[styles.expanderTitle, { marginTop: 10 }]}>Decorative Elements</Text>
                <View style={styles.tagRow}>{tags.elements.map(renderTag)}</View>
              </>
            )}
          </View>
        )}
      </View>
    );
  };

  if (items.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No pins yet — star items in Explore to pin them here.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={items}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      numColumns={NUM_COLS}
      contentContainerStyle={styles.grid}
      style={{ backgroundColor: colors.bg }}
    />
  );
}

const styles = StyleSheet.create({
  grid: { padding: PADDING, paddingTop: 12 },
  tile: {
    width: TILE_WIDTH,
    marginBottom: GAP,
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
  tileImg: { width: '100%', height: TILE_WIDTH * 1.2 },
  unpinBtn: {
    position: 'absolute', top: 6, right: 6,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: radius.full,
    width: 24, height: 24,
    alignItems: 'center', justifyContent: 'center',
  },
  unpinText: { color: colors.white, fontSize: 11 },
  expander: {
    padding: 10,
    backgroundColor: colors.surface2,
  },
  expanderTitle: {
    fontSize: font.xs,
    fontWeight: '800',
    color: colors.textDim,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap' },
  tag: {
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: radius.full,
    borderWidth: 1.5,
    marginRight: 5, marginBottom: 5,
    borderColor: colors.surface2,
    backgroundColor: colors.surface,
  },
  tagActive: { backgroundColor: colors.accent1, borderColor: colors.accent1 },
  tagText: { color: colors.textDim, fontSize: font.xs },
  tagTextActive: { color: colors.white },
  empty: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emptyText: { color: colors.textDim, fontSize: font.md, textAlign: 'center', lineHeight: 22 },
});
