import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useStore } from '../store';
import { colors, font, radius, gradient, shadow } from '../theme';
import GradientButton from '../components/GradientButton';

export default function SettingsScreen() {
  const { pexelsKey, openaiKey, youtubeKey, saveKeys, palette, removeFromPalette } = useStore();
  const [pexels, setPexels]   = useState(pexelsKey);
  const [openai, setOpenai]   = useState(openaiKey);
  const [youtube, setYoutube] = useState(youtubeKey);
  const [saving, setSaving]   = useState(false);

  const save = async () => {
    setSaving(true);
    await saveKeys({ pexelsKey: pexels, openaiKey: openai, youtubeKey: youtube });
    setSaving(false);
    Alert.alert('Saved', 'API keys updated.');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

      {/* API Keys section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>API Keys</Text>

        <Text style={styles.label}>
          Pexels API Key <Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          style={styles.input}
          value={pexels} onChangeText={setPexels}
          placeholder="Paste your Pexels key..."
          placeholderTextColor={colors.textDim}
          autoCapitalize="none" autoCorrect={false}
        />
        <Text style={styles.hint}>Required for image & video search — free at pexels.com/api</Text>

        <Text style={styles.label}>OpenAI API Key</Text>
        <TextInput
          style={styles.input}
          value={openai} onChangeText={setOpenai}
          placeholder="sk-..."
          placeholderTextColor={colors.textDim}
          autoCapitalize="none" autoCorrect={false}
          secureTextEntry={true}
        />
        <Text style={styles.hint}>Required for Fusion Studio image generation and style tag analysis</Text>

        <Text style={styles.label}>
          YouTube Data API Key <Text style={styles.optional}>(optional)</Text>
        </Text>
        <TextInput
          style={styles.input}
          value={youtube} onChangeText={setYoutube}
          placeholder="Paste your YouTube key..."
          placeholderTextColor={colors.textDim}
          autoCapitalize="none" autoCorrect={false}
        />

        <GradientButton label="Save Keys" onPress={save} loading={saving} style={{ marginTop: 20 }} />
      </View>

      {/* Style Palette section */}
      {palette.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Style Palette</Text>
          <Text style={styles.sectionSubtitle}>Tap a tag to remove it from your palette</Text>
          <View style={styles.tagRow}>
            {palette.map((tag) => (
              <TouchableOpacity key={tag} style={styles.paletteTag} onPress={() => removeFromPalette(tag)}>
                <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.paletteTagGradient}>
                  <Text style={styles.paletteTagText}>#{tag}</Text>
                  <Text style={styles.paletteTagX}> ✕</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* About */}
      <View style={styles.about}>
        <Text style={styles.aboutLogo}>pinx</Text>
        <Text style={styles.aboutText}>Your AI-powered moodboard studio</Text>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content:   { padding: 16, paddingBottom: 48 },

  section: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.surface2,
    ...shadow.sm,
  },
  sectionTitle: {
    fontSize: font.md, fontWeight: '800', color: colors.text,
    marginBottom: 16, letterSpacing: 0.3,
  },
  sectionSubtitle: {
    fontSize: font.xs, color: colors.textDim,
    fontStyle: 'italic', marginTop: -12, marginBottom: 12,
  },

  label: {
    fontSize: font.xs, fontWeight: '700', color: colors.textDim,
    textTransform: 'uppercase', letterSpacing: 0.8,
    marginBottom: 8, marginTop: 14,
  },
  required: { color: colors.accent2 },
  optional: { color: colors.textDim, fontWeight: '400', textTransform: 'none' },

  input: {
    backgroundColor: colors.bg, color: colors.text,
    borderRadius: radius.md, paddingHorizontal: 14, paddingVertical: 12,
    fontSize: font.md, borderWidth: 1.5, borderColor: colors.surface2,
    letterSpacing: 0.2,
  },
  hint: { color: colors.textDim, fontSize: font.xs, marginTop: 5, lineHeight: 16 },

  tagRow: { flexDirection: 'row', flexWrap: 'wrap' },
  paletteTag: { borderRadius: radius.full, overflow: 'hidden', marginRight: 6, marginBottom: 6 },
  paletteTagGradient: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 12, paddingVertical: 6,
  },
  paletteTagText: { color: '#fff', fontSize: font.xs, fontWeight: '700' },
  paletteTagX:    { color: 'rgba(255,255,255,0.7)', fontSize: font.xs },

  about: { alignItems: 'center', paddingVertical: 24 },
  aboutLogo: { fontSize: 36, color: colors.accent1, fontWeight: '900', letterSpacing: 1 },
  aboutText:  { color: colors.textDim, fontSize: font.xs, marginTop: 4 },
});
