// ── Pexels ──────────────────────────────────────────────────────
export async function searchPexelsImages(query, page = 1, apiKey) {
  const res = await fetch(
    `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=20&page=${page}`,
    { headers: { Authorization: apiKey } }
  );
  const data = await res.json();
  return (data.photos || []).map((p) => ({
    id: String(p.id),
    type: 'image',
    thumb: p.src.medium,
    full: p.src.large2x,
    title: p.alt || query,
    avgColor: p.avg_color || '#888',
    source: 'pexels',
    aspectRatio: p.width && p.height ? p.width / p.height : 1,
  }));
}

export async function searchPexelsVideos(query, page = 1, apiKey) {
  const res = await fetch(
    `https://api.pexels.com/videos/search?query=${encodeURIComponent(query)}&per_page=10&page=${page}`,
    { headers: { Authorization: apiKey } }
  );
  const data = await res.json();
  return (data.videos || []).map((v) => {
    const file = v.video_files?.find((f) => f.quality === 'sd') || v.video_files?.[0];
    return {
      id: 'v_' + v.id,
      type: 'video',
      thumb: v.image,
      videoUrl: file?.link || '',
      title: v.url?.split('/').filter(Boolean).pop() || query,
      avgColor: '#334',
      source: 'pexels',
      aspectRatio: v.width && v.height ? v.width / v.height : 16 / 9,
    };
  });
}

// ── OpenAI tag analysis ──────────────────────────────────────────
export async function analyseImageTags(imageUrl, isBase64 = false, apiKey) {
  const imageContent = isBase64
    ? { type: 'image_url', image_url: { url: imageUrl } }
    : { type: 'image_url', image_url: { url: imageUrl } };

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: [
            imageContent,
            {
              type: 'text',
              text:
                'Analyse this image and return a JSON object with exactly two arrays. Keep them completely different — no overlap allowed.\n' +
                '1. "atmosphere": 7 feeling/mood descriptors — adjectives, lighting qualities, color moods, and aesthetic vibes. NO object names.\n' +
                '2. "elements": 7 specific named objects, materials, or furnishings that are physically visible or strongly implied. Concrete nouns only — NO mood words.\n' +
                'Return ONLY valid JSON, no explanation, no markdown.',
            },
          ],
        },
      ],
      max_tokens: 200,
    }),
  });
  const data = await res.json();
  const text = (data.choices?.[0]?.message?.content || '').trim();
  const json = JSON.parse(text.replace(/^```json|^```|```$/g, '').trim());
  return {
    atmosphere: (json.atmosphere || []).map((t) => String(t).toLowerCase().trim()).filter(Boolean).slice(0, 7),
    elements: (json.elements || []).map((t) => String(t).toLowerCase().trim()).filter(Boolean).slice(0, 7),
  };
}

// ── OpenAI image generation ──────────────────────────────────────
export async function generateFusionImage(prompt, apiKey) {
  const res = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'dall-e-3',
      prompt,
      n: 1,
      size: '1024x1024',
    }),
  });
  const data = await res.json();
  return data.data?.[0]?.url || null;
}
