import React, { useState } from 'react';
import {
  View, Text, TextInput, ScrollView, TouchableOpacity,
  Image, ActivityIndicator, StyleSheet, Alert, Dimensions,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useStore } from '../store';
import { generateFusionImage } from '../services/api';
import { colors, font, radius } from '../theme';

const { width: SCREEN_W } = Dimensions.get('window');

export default function FusionScreen() {
  const {
    openaiKey,
    pinnedItems,
    fusionSelected, toggleFusionSelect,
    fusionStylings, toggleFusionStyling, clearFusionStylings,
    uploadedImageUri, setUploadedImageUri,
    palette,
    addToGallery,
  } = useStore();

  const [prompt, setPrompt]       = useState('');
  const [generating, setGenerating] = useState(false);
  const [resultUri, setResultUri] = useState(null);
  const [saving, setSaving]       = useState(false);
  const [saved, setSaved]         = useState(false);

  const pins = Object.values(pinnedItems);
  const selCount = fusionSelected.size;

  // ── Image picker ────────────────────────────────────────────
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });
    if (!result.canceled) {
      setUploadedImageUri(result.assets[0].uri);
    }
  };

  // ── Build prompt ────────────────────────────────────────────
  const buildPrompt = () => {
    const selected = pins.filter((p) => fusionSelected.has(p.id));
    const styleDesc = selected.map((p) => p.title).join('; ');
    const stylings  = fusionStylings.length > 0 ? ` Style: ${fusionStylings.join(', ')}.` : '';
    const atm       = styleDesc ? ` Visual atmosphere inspired by: ${styleDesc}.` : '';
    return `A photorealistic, high-quality image of ${prompt}.${stylings}${atm} Cinematic, detailed, professional quality.`;
  };

  // ── Generate ─────────────────────────────────────────────────
  const generate = async () => {
    if (!prompt.trim()) { Alert.alert('Enter a prompt first'); return; }
    if (!openaiKey)     { Alert.alert('Add your OpenAI key in Settings'); return; }
    setGenerating(true);
    setResultUri(null);
    setSaved(false);
    try {
      const url = await generateFusionImage(buildPrompt(), openaiKey);
      setResultUri(url);
    } catch (e) {
      Alert.alert('Generation failed', e.message);
    }
    setGenerating(false);
  };

  // ── Save to gallery ─────────────────────────────────────────
  const saveToGallery = async () => {
    if (!resultUri) return;
    setSaving(true);
    const item = await addToGallery(resultUri, prompt);
    setSaving(false);
    if (item) setSaved(true);
    else Alert.alert('Could not save image');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

      {/* ── Reference image ── */}
      <Text style={styles.label}>Reference Image</Text>
      <TouchableOpacity style={[styles.uploadArea, uploadedImageUri && styles.uploadAreaFilled]} onPress={pickImage}>
        {uploadedImageUri ? (
          <Image source={{ uri: uploadedImageUri }} style={styles.uploadPreview} resizeMode="cover" />
        ) : (
          <View style={styles.uploadPlaceholder}>
            <Text style={styles.uploadIcon}>↑</Text>
            <Text style={styles.uploadText}>Tap to upload a reference image</Text>
            <Text style={styles.uploadHint}>GPT-4o will use its composition as the primary anchor</Text>
          </View>
        )}
      </TouchableOpacity>
      {uploadedImageUri && (
        <TouchableOpacity onPress={() => setUploadedImageUri(null)} style={styles.clearBtn}>
          <Text style={styles.clearBtnText}>✕  Remove reference</Text>
        </TouchableOpacity>
      )}

      {/* ── Prompt ── */}
      <Text style={styles.label}>Project Prompt</Text>
      <TextInput
        style={styles.textarea}
        placeholder="Describe your project (e.g. a cozy living room...)"
        placeholderTextColor={colors.textDim}
        value={prompt}
        onChangeText={setPrompt}
        multiline
        numberOfLines={3}
      />

      {/* ── Style palette ── */}
      {palette.length > 0 && (
        <>
          <Text style={styles.label}>Style Palette</Text>
          <Text style={styles.sublabel}>Tap tags to add them as stylings</Text>
          <View style={styles.tagRow}>
            {palette.map((tag) => {
              const active = fusionStylings.includes(tag);
              return (
                <TouchableOpacity
                  key={tag}
                  style={[styles.paletteTag, active && styles.paletteTagActive]}
                  onPress={() => toggleFusionStyling(tag)}
                >
                  <Text style={[styles.paletteTagText, active && styles.paletteTagTextActive]}>
                    #{tag}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </>
      )}

      {/* ── Active stylings ── */}
      {fusionStylings.length > 0 && (
        <View style={styles.stylingsBar}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {fusionStylings.map((tag) => (
              <TouchableOpacity key={tag} style={styles.stylingChip} onPress={() => toggleFusionStyling(tag)}>
                <Text style={styles.stylingChipText}>#{tag}  ✕</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity onPress={clearFusionStylings} style={styles.clearStylings}>
            <Text style={styles.clearStylingsText}>Clear all</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ── Pin picker ── */}
      <View style={styles.pinPickerHeader}>
        <Text style={styles.label}>Pins to Fuse</Text>
        {selCount > 0 && (
          <View style={styles.selBadge}>
            <Text style={styles.selBadgeText}>{selCount} selected</Text>
          </View>
        )}
      </View>

      {pins.length === 0 ? (
        <Text style={styles.emptyHint}>Pin images in Explore to select them here</Text>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pinStrip}>
          {pins.map((item) => {
            const sel = fusionSelected.has(item.id);
            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.pinThumb, sel && styles.pinThumbSel]}
                onPress={() => toggleFusionSelect(item.id)}
              >
                <Image source={{ uri: item.thumb }} style={styles.pinThumbImg} resizeMode="cover" />
                {sel && (
                  <View style={styles.pinCheck}>
                    <Text style={styles.pinCheckText}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      {/* ── Generate button ── */}
      <TouchableOpacity
        style={[styles.genBtn, generating && styles.genBtnDisabled]}
        onPress={generate}
        disabled={generating}
      >
        {generating
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.genBtnText}>⚡  Generate Fusion Image</Text>
        }
      </TouchableOpacity>

      {/* ── Result ── */}
      {resultUri && (
        <View style={styles.resultWrap}>
          <Image source={{ uri: resultUri }} style={styles.resultImg} resizeMode="contain" />
          <TouchableOpacity
            style={[styles.saveBtn, saved && styles.saveBtnDone]}
            onPress={saveToGallery}
            disabled={saving || saved}
          >
            {saving
              ? <ActivityIndicator color="#fff" size="small" />
              : <Text style={styles.saveBtnText}>{saved ? '✓  Saved to Gallery' : '↓  Save to Gallery'}</Text>
            }
          </TouchableOpacity>
        </View>
      )}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content:   { padding: 16, paddingBottom: 48 },

  label: {
    fontSize: font.xs, fontWeight: '800', color: colors.textDim,
    textTransform: 'uppercase', letterSpacing: 1,
    marginTop: 20, marginBottom: 8,
  },
  sublabel: { color: colors.textDim, fontSize: font.xs, marginTop: -6, marginBottom: 8, fontStyle: 'italic' },

  // Upload
  uploadArea: {
    borderWidth: 2, borderStyle: 'dashed', borderColor: colors.surface2,
    borderRadius: radius.md, minHeight: 110,
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  uploadAreaFilled: { borderStyle: 'solid', borderColor: colors.accent1, minHeight: 160 },
  uploadPreview: { width: '100%', height: 160 },
  uploadPlaceholder: { alignItems: 'center', padding: 16 },
  uploadIcon: { color: colors.textDim, fontSize: 22, marginBottom: 6 },
  uploadText: { color: colors.textDim, fontSize: font.sm, marginBottom: 4 },
  uploadHint: { color: colors.textDim, fontSize: font.xs, fontStyle: 'italic', textAlign: 'center' },
  clearBtn: { marginTop: 6, alignSelf: 'flex-start' },
  clearBtnText: { color: colors.textDim, fontSize: font.xs },

  // Prompt
  textarea: {
    backgroundColor: colors.surface, color: colors.text,
    borderRadius: radius.md, padding: 12, fontSize: font.md,
    borderWidth: 1.5, borderColor: colors.surface2,
    minHeight: 80, textAlignVertical: 'top',
  },

  // Palette tags
  tagRow: { flexDirection: 'row', flexWrap: 'wrap' },
  paletteTag: {
    paddingHorizontal: 12, paddingVertical: 5, borderRadius: radius.full,
    borderWidth: 1.5, borderColor: colors.surface2,
    marginRight: 6, marginBottom: 6,
  },
  paletteTagActive:     { borderColor: colors.accent1, backgroundColor: colors.accent1 + '22' },
  paletteTagText:       { color: colors.textDim, fontSize: font.xs },
  paletteTagTextActive: { color: colors.accent1, fontWeight: '700' },

  // Active stylings bar
  stylingsBar: { marginTop: 4, marginBottom: 2 },
  stylingChip: {
    paddingHorizontal: 12, paddingVertical: 5, borderRadius: radius.full,
    backgroundColor: colors.accent1, marginRight: 6,
  },
  stylingChipText: { color: '#fff', fontSize: font.xs, fontWeight: '700' },
  clearStylings: { marginTop: 6 },
  clearStylingsText: { color: colors.textDim, fontSize: font.xs },

  // Pin picker
  pinPickerHeader: { flexDirection: 'row', alignItems: 'center', marginTop: 20, marginBottom: 8 },
  selBadge: {
    marginLeft: 8, paddingHorizontal: 8, paddingVertical: 2,
    borderRadius: radius.full, backgroundColor: colors.accent1,
  },
  selBadgeText: { color: '#fff', fontSize: font.xs, fontWeight: '700' },
  emptyHint: { color: colors.textDim, fontSize: font.xs, fontStyle: 'italic', marginBottom: 4 },
  pinStrip: { paddingBottom: 4 },
  pinThumb: {
    width: 72, height: 72, borderRadius: radius.sm,
    overflow: 'hidden', borderWidth: 2, borderColor: colors.surface2,
    marginRight: 8,
  },
  pinThumbSel:   { borderColor: colors.accent1 },
  pinThumbImg:   { width: '100%', height: '100%' },
  pinCheck: {
    position: 'absolute', top: 4, right: 4,
    width: 18, height: 18, borderRadius: 9,
    backgroundColor: colors.accent1, alignItems: 'center', justifyContent: 'center',
  },
  pinCheckText: { color: '#fff', fontSize: 10, fontWeight: '800' },

  // Generate
  genBtn: {
    marginTop: 24, padding: 15, borderRadius: radius.md,
    backgroundColor: colors.accent1, alignItems: 'center',
  },
  genBtnDisabled: { opacity: 0.6 },
  genBtnText:     { color: '#fff', fontSize: font.md, fontWeight: '800' },

  // Result
  resultWrap: { marginTop: 20 },
  resultImg:  { width: '100%', aspectRatio: 1, borderRadius: radius.md },
  saveBtn: {
    marginTop: 10, padding: 13, borderRadius: radius.md,
    backgroundColor: colors.surface2, alignItems: 'center',
    borderWidth: 1.5, borderColor: colors.surface2,
  },
  saveBtnDone:  { backgroundColor: '#1a3a1a', borderColor: '#2d6e2d' },
  saveBtnText:  { color: colors.text, fontSize: font.sm, fontWeight: '700' },
});
