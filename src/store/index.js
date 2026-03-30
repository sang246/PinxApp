import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';

const STORAGE_KEYS = {
  pexelsKey:   'mb_pexels_key',
  openaiKey:   'mb_openai_key',
  youtubeKey:  'mb_youtube_key',
  pinned:      'mb_pinned_ids',
  pinnedItems: 'mb_pinned_items',
  palette:     'mb_palette',
  gallery:     'mb_gallery',
};

export const useStore = create((set, get) => ({
  // API keys
  pexelsKey:  '',
  openaiKey:  '',
  youtubeKey: '',

  // Pins
  pinned:      new Set(),
  pinnedItems: {},

  // Fusion
  fusionSelected:  new Set(),
  fusionStylings:  [],
  uploadedImageUri: null,

  // Palette
  palette: [],

  // Gallery
  gallery: [], // [{ id, uri, prompt, timestamp }]

  // ── Pin actions ──

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

  // ── Fusion actions ──

  toggleFusionSelect: (id) =>
    set((s) => {
      const fusionSelected = new Set(s.fusionSelected);
      fusionSelected.has(id) ? fusionSelected.delete(id) : fusionSelected.add(id);
      return { fusionSelected };
    }),

  clearFusionSelected: () => set({ fusionSelected: new Set() }),

  toggleFusionStyling: (tag) =>
    set((s) => ({
      fusionStylings: s.fusionStylings.includes(tag)
        ? s.fusionStylings.filter((t) => t !== tag)
        : [...s.fusionStylings, tag],
    })),

  clearFusionStylings: () => set({ fusionStylings: [] }),

  setUploadedImageUri: (uri) => set({ uploadedImageUri: uri }),

  // ── Palette actions ──

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

  // ── Gallery actions ──

  addToGallery: async (remoteUrl, prompt) => {
    const id = Date.now().toString();
    const localUri = FileSystem.documentDirectory + `fusion_${id}.jpg`;
    try {
      await FileSystem.downloadAsync(remoteUrl, localUri);
      const item = { id, uri: localUri, prompt, timestamp: Date.now() };
      set((s) => {
        const gallery = [item, ...s.gallery];
        AsyncStorage.setItem(STORAGE_KEYS.gallery, JSON.stringify(gallery));
        return { gallery };
      });
      return item;
    } catch (_) {
      return null;
    }
  },

  removeFromGallery: (id) =>
    set((s) => {
      const item = s.gallery.find((g) => g.id === id);
      if (item) FileSystem.deleteAsync(item.uri, { idempotent: true }).catch(() => {});
      const gallery = s.gallery.filter((g) => g.id !== id);
      AsyncStorage.setItem(STORAGE_KEYS.gallery, JSON.stringify(gallery));
      return { gallery };
    }),

  // ── Bootstrap ──

  hydrate: async () => {
    try {
      const [pexels, openai, youtube, pinIds, pinItems, palette, gallery] =
        await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.pexelsKey),
          AsyncStorage.getItem(STORAGE_KEYS.openaiKey),
          AsyncStorage.getItem(STORAGE_KEYS.youtubeKey),
          AsyncStorage.getItem(STORAGE_KEYS.pinned),
          AsyncStorage.getItem(STORAGE_KEYS.pinnedItems),
          AsyncStorage.getItem(STORAGE_KEYS.palette),
          AsyncStorage.getItem(STORAGE_KEYS.gallery),
        ]);
      set({
        pexelsKey:   pexels  || '',
        openaiKey:   openai  || '',
        youtubeKey:  youtube || '',
        pinned:      new Set(JSON.parse(pinIds   || '[]')),
        pinnedItems: JSON.parse(pinItems || '{}'),
        palette:     JSON.parse(palette  || '[]'),
        gallery:     JSON.parse(gallery  || '[]'),
      });
    } catch (_) {}
  },

  saveKeys: async ({ pexelsKey, openaiKey, youtubeKey }) => {
    await Promise.all([
      AsyncStorage.setItem(STORAGE_KEYS.pexelsKey,  pexelsKey),
      AsyncStorage.setItem(STORAGE_KEYS.openaiKey,  openaiKey),
      AsyncStorage.setItem(STORAGE_KEYS.youtubeKey, youtubeKey),
    ]);
    set({ pexelsKey, openaiKey, youtubeKey });
  },
}));
