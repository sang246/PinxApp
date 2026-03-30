import React, { useState, useCallback } from 'react';
import {
  View, Text, TextInput, FlatList, Image, TouchableOpacity,
  ActivityIndicator, StyleSheet, Dimensions,
} from 'react-native';
import { useStore } from '../store';
import { searchPexelsImages, searchPexelsVideos } from '../services/api';
import { colors, font, radius } from '../theme';

const NUM_COLS = 2;
const GAP = 8;
const PADDING = 12;
const TILE_WIDTH = (Dimensions.get('window').width - PADDING * 2 - GAP) / NUM_COLS;

export default function ExploreScreen() {
  const { pexelsKey, items, loading, pinned, togglePin, setItems, appendItems, setLoading } = useStore();
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const search = useCallback(async (q, pg = 1) => {
    if (!pexelsKey) return;
    setLoading(true);
    try {
      const [images, videos] = await Promise.all([
        searchPexelsImages(q, pg, pexelsKey),
        searchPexelsVideos(q, pg, pexelsKey),
      ]);
      const merged = [...images, ...videos].sort(() => Math.random() - 0.5);
      if (pg === 1) setItems(merged);
      else appendItems(merged);
      setHasMore(merged.length > 0);
    } catch (_) {}
    setLoading(false);
  }, [pexelsKey]);

  const onSubmit = () => {
    setPage(1);
    search(query, 1);
  };

  const onEndReached = () => {
    if (!loading && hasMore && query) {
      const next = page + 1;
      setPage(next);
      search(query, next);
    }
  };

  const renderItem = ({ item, index }) => {
    const isPinned = pinned.has(item.id);
    const isRight = index % NUM_COLS === 1;
    return (
      <View style={[styles.tile, isRight && { marginLeft: GAP }]}>
        <Image source={{ uri: item.thumb }} style={styles.tileImg} resizeMode="cover" />
        <TouchableOpacity
          style={[styles.pinBtn, isPinned && styles.pinBtnActive]}
          onPress={() => togglePin(item)}
        >
          <Text style={styles.pinBtnText}>{isPinned ? '★' : '☆'}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchRow}>
        <TextInput
          style={styles.input}
          placeholder="Search images & videos..."
          placeholderTextColor={colors.textDim}
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={onSubmit}
          returnKeyType="search"
        />
      </View>
      {!pexelsKey && (
        <Text style={styles.hint}>Add your Pexels API key in Settings to start searching.</Text>
      )}
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        numColumns={NUM_COLS}
        contentContainerStyle={styles.grid}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.4}
        ListFooterComponent={loading ? <ActivityIndicator color={colors.accent1} style={{ margin: 16 }} /> : null}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  searchRow: { padding: PADDING, paddingBottom: 8 },
  input: {
    backgroundColor: colors.surface,
    color: colors.text,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: font.md,
    borderWidth: 1,
    borderColor: colors.surface2,
  },
  hint: { color: colors.textDim, fontSize: font.sm, textAlign: 'center', marginTop: 40 },
  grid: { padding: PADDING, paddingTop: 4 },
  tile: {
    width: TILE_WIDTH,
    marginBottom: GAP,
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
  tileImg: { width: '100%', height: TILE_WIDTH * 1.2 },
  pinBtn: {
    position: 'absolute', top: 6, right: 6,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: radius.full,
    width: 30, height: 30,
    alignItems: 'center', justifyContent: 'center',
  },
  pinBtnActive: { backgroundColor: colors.accent1 },
  pinBtnText: { color: colors.white, fontSize: 14 },
});
