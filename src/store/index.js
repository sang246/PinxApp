import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  pexelsKey: 'mb_pexels_key',
  openaiKey: 'mb_openai_key',
  youtubeKey: 'mb_youtube_key',
  pinned: 'mb_pinned_ids',
  pinnedItems: 'mb_pinned_items',
  palette: 'mb_palette',
};

export const useStore = create((set, get) => ({
  // API keys
  pexelsKey: '',
  openaiKey: '',
  youtubeKey: '',

  // Search
  query: '',
  items: [],
  loading: false,
  page: 1,
  hasMore: true,

  // Pins
  pinned: new Set(),
  pinnedItems: {},

  // Fusion
  fusionSelected: new Set(),
  fusionStylings: [],
  uploadedImageUri: null,

  // Palette
  palette: [],

  // UI
  activeTab: 'explore',

  // ── Actions ──

  setKeys: (keys) => set(keys),

  setQuery: (query) => set({ query }),

  setItems: (items) => set({ items }),

  appendItems: (newItems) =>
    set((s) => ({ items: [...s.items, ...newItems] })),

  setLoading: (loading) => set({ loading }),

  setPage: (page) => set({ page }),

  setHasMore: (hasMore) => set({ hasMore }),

  togglePin: (item) =>
    set((s) => {
      const pinned = new Set(s.pinned);
      const pinnedItems = { ...s.pinnedItems };
      if (pinned.has(item.id)) {
        pinned.delete(item.id);
        delete pinnedItems[item.id];
      } else {
        pinned.add(item.id);
        pinnedItems[item.id] = item;
      }
      AsyncStorage.setItem(STORAGE_KEYS.pinned, JSON.stringify([...pinned]));
      AsyncStorage.setItem(STORAGE_KEYS.pinnedItems, JSON.stringify(pinnedItems));
      return { pinned, pinnedItems };
    }),

  toggleFusionSelect: (id) =>
    set((s) => {
      const fusionSelected = new Set(s.fusionSelected);
      fusionSelected.has(id) ? fusionSelected.delete(id) : fusionSelected.add(id);
      return { fusionSelected };
    }),

  clearFusionSelected: () => set({ fusionSelected: new Set() }),

  addFusionStyling: (tag) =>
    set((s) =>
      s.fusionStylings.includes(tag)
        ? {}
        : { fusionStylings: [...s.fusionStylings, tag] }
    ),

  removeFusionStyling: (tag) =>
    set((s) => ({ fusionStylings: s.fusionStylings.filter((t) => t !== tag) })),

  setUploadedImageUri: (uri) => set({ uploadedImageUri: uri }),

  addToPalette: (tag) =>
    set((s) => {
      if (s.palette.includes(tag)) return {};
      const palette = [...s.palette, tag];
      AsyncStorage.setItem(STORAGE_KEYS.palette, JSON.stringify(palette));
      return { palette };
    }),

  removeFromPalette: (tag) =>
    set((s) => {
      const palette = s.palette.filter((t) => t !== tag);
      AsyncStorage.setItem(STORAGE_KEYS.palette, JSON.stringify(palette));
      return { palette };
    }),

  // Load persisted state from AsyncStorage
  hydrate: async () => {
    try {
      const [pexels, openai, youtube, pinIds, pinItems, palette] =
        await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.pexelsKey),
          AsyncStorage.getItem(STORAGE_KEYS.openaiKey),
          AsyncStorage.getItem(STORAGE_KEYS.youtubeKey),
          AsyncStorage.getItem(STORAGE_KEYS.pinned),
          AsyncStorage.getItem(STORAGE_KEYS.pinnedItems),
          AsyncStorage.getItem(STORAGE_KEYS.palette),
        ]);
      set({
        pexelsKey: pexels || '',
        openaiKey: openai || '',
        youtubeKey: youtube || '',
        pinned: new Set(JSON.parse(pinIds || '[]')),
        pinnedItems: JSON.parse(pinItems || '{}'),
        palette: JSON.parse(palette || '[]'),
      });
    } catch (_) {}
  },

  saveKeys: async ({ pexelsKey, openaiKey, youtubeKey }) => {
    await Promise.all([
      AsyncStorage.setItem(STORAGE_KEYS.pexelsKey, pexelsKey),
      AsyncStorage.setItem(STORAGE_KEYS.openaiKey, openaiKey),
      AsyncStorage.setItem(STORAGE_KEYS.youtubeKey, youtubeKey),
    ]);
    set({ pexelsKey, openaiKey, youtubeKey });
  },
}));
