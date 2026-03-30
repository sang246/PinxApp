import React, { useState, useCallback, useRef } from 'react';
import {
  View, Text, TextInput, ScrollView, ActivityIndicator,
  StyleSheet, Dimensions, TouchableOpacity,
} from 'react-native';
import { useStore } from '../store';
import { searchPexelsImages, searchPexelsVideos } from '../services/api';
import { colors, font, radius } from '../theme';
import ImageTile from '../components/ImageTile';
import VideoTile from '../components/VideoTile';

const { width: SCREEN_W } = Dimensions.get('window');
const PADDING = 12;
const COL_GAP = 8;
const COL_W = (SCREEN_W - PADDING * 2 - COL_GAP) / 2;

// Distribute items into two columns, balancing estimated heights
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

const SUGGESTIONS = ['interior design', 'minimalist', 'cozy living room', 'scandinavian', 'japandi', 'modern kitchen', 'boho bedroom'];

export default function ExploreScreen() {
  const { pexelsKey, pinned, togglePin } = useStore();

  const [query, setQuery]       = useState('');
  const [items, setItems]       = useState([]);
  const [loading, setLoading]   = useState(false);
  const [page, setPage]         = useState(1);
  const [hasMore, setHasMore]   = useState(true);
  const [searched, setSearched] = useState(false);

  const debounceRef = useRef(null);
  const loadingRef  = useRef(false);
  const pageRef     = useRef(1);
  const queryRef    = useRef('');

  const runSearch = useCallback(async (q, pg) => {
    if (!pexelsKey || loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    try {
      const [imgs, vids] = await Promise.all([
        searchPexelsImages(q, pg, pexelsKey),
        searchPexelsVideos(q, pg, pexelsKey),
      ]);
      // interleave: 3 images, 1 video, repeat
      const merged = [];
      let ii = 0, vi = 0;
      while (ii < imgs.length || vi < vids.length) {
        for (let i = 0; i < 3 && ii < imgs.length; i++) merged.push(imgs[ii++]);
        if (vi < vids.length) merged.push(vids[vi++]);
      }
      if (pg === 1) setItems(merged);
      else setItems((prev) => [...prev, ...merged]);
      setHasMore(merged.length > 0);
      pageRef.current = pg;
    } catch (_) {}
    setLoading(false);
    loadingRef.current = false;
  }, [pexelsKey]);

  const onChangeText = (text) => {
    setQuery(text);
    queryRef.current = text;
    clearTimeout(debounceRef.current);
    if (!text.trim()) { setItems([]); setSearched(false); return; }
    debounceRef.current = setTimeout(() => {
      setSearched(true);
      pageRef.current = 1;
      setPage(1);
      setHasMore(true);
      runSearch(text.trim(), 1);
    }, 600);
  };

  const onSubmit = () => {
    const q = query.trim();
    if (!q) return;
    clearTimeout(debounceRef.current);
    setSearched(true);
    pageRef.current = 1;
    setPage(1);
    setHasMore(true);
    runSearch(q, 1);
  };

  const loadMore = () => {
    if (!hasMore || loadingRef.current) return;
    const next = pageRef.current + 1;
    setPage(next);
    runSearch(queryRef.current || query, next);
  };

  const onScroll = ({ nativeEvent: { layoutMeasurement, contentOffset, contentSize } }) => {
    const nearBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 300;
    if (nearBottom && !loadingRef.current && hasMore && searched) loadMore();
  };

  const renderTile = (item) => {
    const isPinned = pinned.has(item.id);
    const props = { key: item.id, item, width: COL_W, isPinned, onPin: () => togglePin(item) };
    return item.type === 'video' ? <VideoTile {...props} /> : <ImageTile {...props} />;
  };

  const { left, right } = toColumns(items);

  return (
    <View style={styles.container}>
      {/* Search bar */}
      <View style={styles.searchWrap}>
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.input}
            placeholder="Search images & videos..."
            placeholderTextColor={colors.textDim}
            value={query}
            onChangeText={onChangeText}
            onSubmitEditing={onSubmit}
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => { setQuery(''); setItems([]); setSearched(false); }}>
              <Text style={styles.clearBtn}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Suggestion chips */}
      {!searched && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {SUGGESTIONS.map((s) => (
            <TouchableOpacity key={s} style={styles.chip} onPress={() => { setQuery(s); queryRef.current = s; setSearched(true); pageRef.current = 1; setHasMore(true); runSearch(s, 1); }}>
              <Text style={styles.chipText}>{s}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* No key state */}
      {!pexelsKey && (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyTitle}>Add your Pexels key</Text>
          <Text style={styles.emptyBody}>Go to Settings → add your free Pexels API key to start searching.</Text>
        </View>
      )}

      {/* Masonry grid */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.grid}
        onScroll={onScroll}
        scrollEventThrottle={200}
        showsVerticalScrollIndicator={false}
      >
        {items.length > 0 && (
          <View style={styles.columns}>
            <View style={styles.col}>{left.map(renderTile)}</View>
            <View style={[styles.col, { marginLeft: COL_GAP }]}>{right.map(renderTile)}</View>
          </View>
        )}

        {loading && (
          <View style={styles.loadingWrap}>
            <ActivityIndicator color={colors.accent1} size="large" />
          </View>
        )}

        {searched && !loading && items.length === 0 && (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyTitle}>No results</Text>
            <Text style={styles.emptyBody}>Try a different search term.</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },

  searchWrap: { paddingHorizontal: PADDING, paddingTop: 10, paddingBottom: 8 },
  searchBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.surface2,
    paddingHorizontal: 12, height: 42,
  },
  searchIcon: { fontSize: 14, marginRight: 8 },
  input: { flex: 1, color: colors.text, fontSize: font.md },
  clearBtn: { color: colors.textDim, fontSize: 14, paddingLeft: 8 },

  chips: { paddingHorizontal: PADDING, paddingBottom: 10, gap: 8 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.surface2,
    marginRight: 8,
  },
  chipText: { color: colors.textDim, fontSize: font.sm },

  scroll: { flex: 1 },
  grid: { padding: PADDING, paddingTop: 4, paddingBottom: 40 },
  columns: { flexDirection: 'row' },
  col: { flex: 1 },

  loadingWrap: { paddingVertical: 24, alignItems: 'center' },

  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80, paddingHorizontal: 32 },
  emptyTitle: { color: colors.text, fontSize: font.lg, fontWeight: '700', marginBottom: 8 },
  emptyBody: { color: colors.textDim, fontSize: font.sm, textAlign: 'center', lineHeight: 20 },
});
