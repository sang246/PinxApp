import React, { useState } from 'react';
import {
  View, Text, TextInput, ScrollView, TouchableOpacity,
  Image, ActivityIndicator, StyleSheet, Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useStore } from '../store';
import { generateFusionImage } from '../services/api';
import { colors, font, radius } from '../theme';

export default function FusionScreen() {
  const {
    openaiKey, pinnedItems, fusionSelected, fusionStylings,
    toggleFusionSelect, addFusionStyling, removeFusionStyling,
    uploadedImageUri, setUploadedImageUri,
  } = useStore();

  const [prompt, setPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [resultUri, setResultUri] = useState(null);

  const pins = Object.values(pinnedItems);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });
    if (!result.canceled) setUploadedImageUri(result.assets[0].uri);
  };

  const buildPrompt = () => {
    const selected = pins.filter((p) => fusionSelected.has(p.id));
    const styleDesc = selected.map((p) => p.title).join('; ');
    const stylings = fusionStylings.length > 0 ? ` Style: ${fusionStylings.join(', ')}.` : '';
    const atm = styleDesc ? ` Visual atmosphere inspired by: ${styleDesc}.` : '';
    return `A photorealistic, high-quality image of ${prompt}.${stylings}${atm} Cinematic, detailed, professional quality.`;
  };

  const generate = async () => {
    if (!prompt) { Alert.alert('Add a prompt first'); return; }
    if (!openaiKey) { Alert.alert('Add your OpenAI key in Settings'); return; }
    setGenerating(true);
    setResultUri(null);
    try {
      const url = await generateFusionImage(buildPrompt(), openaiKey);
      setResultUri(url);
    } catch (e) {
      Alert.alert('Generation failed', e.message);
    }
    setGenerating(false);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.sectionLabel}>Reference Image</Text>
      <TouchableOpacity style={styles.uploadBtn} onPress={pickImage}>
        {uploadedImageUri ? (
          <Image source={{ uri: uploadedImageUri }} style={styles.uploadPreview} resizeMode="cover" />
        ) : (
          <Text style={styles.uploadPlaceholder}>↑ Tap to upload a reference image</Text>
        )}
      </TouchableOpacity>
      {uploadedImageUri && (
        <TouchableOpacity onPress={() => setUploadedImageUri(null)}>
          <Text style={styles.clearText}>✕ Remove image</Text>
        </TouchableOpacity>
      )}

      <Text style={styles.sectionLabel}>Project Prompt</Text>
      <TextInput
        style={styles.textarea}
        placeholder="Describe your project (e.g. a cozy living room...)"
        placeholderTextColor={colors.textDim}
        value={prompt}
        onChangeText={setPrompt}
        multiline
        numberOfLines={3}
      />

      <Text style={styles.sectionLabel}>Stylings</Text>
      <View style={styles.tagRow}>
        {fusionStylings.length === 0
          ? <Text style={styles.emptyTags}>No stylings added yet</Text>
          : fusionStylings.map((tag) => (
            <TouchableOpacity key={tag} style={[styles.stylingTag, styles.tagRowItem]} onPress={() => removeFusionStyling(tag)}>
              <Text style={styles.stylingTagText}>#{tag} ✕</Text>
            </TouchableOpacity>
          ))
        }
      </View>

      <Text style={styles.sectionLabel}>Pinned Items to Fuse</Text>
      {pins.length === 0
        ? <Text style={styles.emptyTags}>Pin some images first</Text>
        : (
          <View style={styles.pinGrid}>
            {pins.map((item) => {
              const sel = fusionSelected.has(item.id);
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.pinThumb, sel && styles.pinThumbSel, styles.pinGridItem]}
                  onPress={() => toggleFusionSelect(item.id)}
                >
                  <Image source={{ uri: item.thumb }} style={styles.pinThumbImg} resizeMode="cover" />
                  {sel && <View style={styles.pinCheck}><Text style={{ color: '#fff', fontSize: 10 }}>✓</Text></View>}
                </TouchableOpacity>
              );
            })}
          </View>
        )
      }

      <TouchableOpacity style={styles.genBtn} onPress={generate} disabled={generating}>
        {generating
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.genBtnText}>⚡ Generate Fusion Image</Text>
        }
      </TouchableOpacity>

      {resultUri && (
        <View style={styles.resultWrap}>
          <Image source={{ uri: resultUri }} style={styles.resultImg} resizeMode="contain" />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16 },
  sectionLabel: {
    fontSize: font.xs, fontWeight: '800', color: colors.textDim,
    textTransform: 'uppercase', letterSpacing: 1, marginTop: 14, marginBottom: 6,
  },
  uploadBtn: {
    borderWidth: 2, borderStyle: 'dashed', borderColor: colors.surface2,
    borderRadius: radius.md, height: 110,
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  uploadPreview: { width: '100%', height: '100%' },
  uploadPlaceholder: { color: colors.textDim, fontSize: font.sm },
  clearText: { color: colors.textDim, fontSize: font.xs, marginTop: 6 },
  textarea: {
    backgroundColor: colors.surface, color: colors.text,
    borderRadius: radius.md, padding: 12, fontSize: font.md,
    borderWidth: 1.5, borderColor: colors.surface2,
    minHeight: 80, textAlignVertical: 'top',
  },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', minHeight: 28 },
  tagRowItem: { marginRight: 6, marginBottom: 6 },
  emptyTags: { color: colors.textDim, fontSize: font.xs, fontStyle: 'italic' },
  stylingTag: {
    paddingHorizontal: 12, paddingVertical: 5, borderRadius: radius.full,
    backgroundColor: colors.accent1,
  },
  stylingTagText: { color: '#fff', fontSize: font.xs, fontWeight: '700' },
  pinGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  pinGridItem: { marginRight: 8, marginBottom: 8 },
  pinThumb: {
    width: 64, height: 64, borderRadius: radius.sm,
    overflow: 'hidden', borderWidth: 2, borderColor: colors.surface2,
  },
  pinThumbSel: { borderColor: colors.accent1 },
  pinThumbImg: { width: '100%', height: '100%' },
  pinCheck: {
    position: 'absolute', top: 3, right: 3,
    width: 16, height: 16, borderRadius: 8,
    backgroundColor: colors.accent1,
    alignItems: 'center', justifyContent: 'center',
  },
  genBtn: {
    marginTop: 16, padding: 14, borderRadius: radius.md,
    backgroundColor: colors.accent1, alignItems: 'center',
  },
  genBtnText: { color: '#fff', fontSize: font.md, fontWeight: '700' },
  resultWrap: { marginTop: 16, borderRadius: radius.md, overflow: 'hidden' },
  resultImg: { width: '100%', height: 300 },
});
