import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ScrollView,
} from 'react-native';
import { useStore } from '../store';
import { colors, font, radius } from '../theme';

export default function SettingsScreen() {
  const { pexelsKey, openaiKey, youtubeKey, saveKeys, palette, removeFromPalette } = useStore();
  const [pexels, setPexels] = useState(pexelsKey);
  const [openai, setOpenai] = useState(openaiKey);
  const [youtube, setYoutube] = useState(youtubeKey);

  const save = async () => {
    await saveKeys({ pexelsKey: pexels, openaiKey: openai, youtubeKey: youtube });
    Alert.alert('Saved', 'API keys saved.');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>API Keys</Text>

      <Text style={styles.label}>Pexels API Key <Text style={styles.required}>*</Text></Text>
      <TextInput
        style={styles.input} value={pexels} onChangeText={setPexels}
        placeholder="Paste your Pexels key..." placeholderTextColor={colors.textDim}
        autoCapitalize="none" autoCorrect={false}
      />
      <Text style={styles.hint}>Required for image & video search. Free at pexels.com/api</Text>

      <Text style={styles.label}>OpenAI API Key</Text>
      <TextInput
        style={styles.input} value={openai} onChangeText={setOpenai}
        placeholder="sk-..." placeholderTextColor={colors.textDim}
        autoCapitalize="none" autoCorrect={false} secureTextEntry
      />
      <Text style={styles.hint}>Required for Fusion Studio and style tag generation.</Text>

      <Text style={styles.label}>YouTube Data API Key <Text style={styles.optional}>(optional)</Text></Text>
      <TextInput
        style={styles.input} value={youtube} onChangeText={setYoutube}
        placeholder="Paste your YouTube key..." placeholderTextColor={colors.textDim}
        autoCapitalize="none" autoCorrect={false}
      />

      <TouchableOpacity style={styles.saveBtn} onPress={save}>
        <Text style={styles.saveBtnText}>Save Keys</Text>
      </TouchableOpacity>

      {palette.length > 0 && (
        <>
          <Text style={[styles.heading, { marginTop: 32 }]}>Style Palette</Text>
          <View style={styles.tagRow}>
            {palette.map((tag) => (
              <TouchableOpacity key={tag} style={styles.paletteTag} onPress={() => removeFromPalette(tag)}>
                <Text style={styles.paletteTagText}>#{tag} ✕</Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20 },
  heading: { fontSize: font.lg, fontWeight: '800', color: colors.text, marginBottom: 16 },
  label: { fontSize: font.sm, fontWeight: '700', color: colors.textDim, marginBottom: 6, marginTop: 14 },
  required: { color: colors.accent2 },
  optional: { color: colors.textDim, fontWeight: '400' },
  input: {
    backgroundColor: colors.surface, color: colors.text,
    borderRadius: radius.md, paddingHorizontal: 14, paddingVertical: 11,
    fontSize: font.md, borderWidth: 1.5, borderColor: colors.surface2,
  },
  hint: { color: colors.textDim, fontSize: font.xs, marginTop: 4 },
  saveBtn: {
    marginTop: 24, padding: 14, borderRadius: radius.md,
    backgroundColor: colors.accent1, alignItems: 'center',
  },
  saveBtnText: { color: '#fff', fontSize: font.md, fontWeight: '700' },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap' },
  paletteTag: {
    paddingHorizontal: 12, paddingVertical: 5, borderRadius: radius.full,
    borderWidth: 1.5, borderColor: colors.accent1,
    marginRight: 6, marginBottom: 6,
  },
  paletteTagText: { color: colors.accent1, fontSize: font.xs, fontWeight: '600' },
});
