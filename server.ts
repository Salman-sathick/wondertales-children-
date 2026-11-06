import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '20mb' }));

// Helper to prevent long hangs on API spikes
function withTimeout<T>(promise: Promise<T>, ms = 9000): Promise<T> {
  let timeoutId: any;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error('REQUEST_TIMEOUT')), ms);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timeoutId));
}

// Server-side GoogleGenAI initialization with required telemetry header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

/**
 * Health check & configuration status
 */
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hasApiKey: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'),
    models: {
      tts: 'gemini-3.8-flash-tts',
      image: 'gemini-3-pro-image-preview',
      story: 'gemini-3.8-flash',
    },
  });
});

/**
 * Convert text to speech using gemini-3.8-flash-tts
 * Reads stories aloud with expressive child-friendly cadence and voices
 */
app.post('/api/tts', async (req: Request, res: Response) => {
  try {
    const { text, voiceName = 'Kore', speaker = 'Storyteller', stylePrompt } = req.body;

    if (!text || typeof text !== 'string') {
      res.status(400).json({ error: 'Text string is required for TTS generation' });
      return;
    }

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'MY_GEMINI_API_KEY') {
      res.status(503).json({
        error: 'GEMINI_API_KEY not configured in environment',
        fallbackNeeded: true,
      });
      return;
    }

    const narrationStyle = stylePrompt || 'Warm, animated, expressive bedtime storyteller reading to children with gentle cadence and whimsical pauses';

    const response = await withTimeout(
      ai.models.generateContent({
        model: 'gemini-3.8-flash-tts',
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: text.trim(),
                speechMetadata: {
                  speaker: speaker || 'Storyteller',
                  style: narrationStyle,
                },
              },
            ],
          },
        ],
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: voiceName || 'Kore',
              },
            },
          },
        },
      }),
      10000
    );

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    const mimeType = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.mimeType || 'audio/wav';

    if (!base64Audio) {
      throw new Error('No audio data returned by gemini-3.8-flash-tts');
    }

    res.json({
      audioUrl: `data:${mimeType};base64,${base64Audio}`,
      format: mimeType,
      voiceName,
    });
  } catch (error: any) {
    console.error('TTS generation error:', error?.message);
    res.status(503).json({
      error: error?.message || 'Failed to generate speech with gemini-3.8-flash-tts',
      fallbackNeeded: true,
    });
  }
});

/**
 * Generate high-quality illustrations using gemini-3-pro-image-preview
 * Supports user-selected resolution (1K, 2K, 4K) and character appearance
 */
app.post('/api/generate-illustration', async (req: Request, res: Response) => {
  try {
    const {
      prompt,
      size = '1K',
      aspectRatio = '4:3',
      style = 'Classic Gouache Storybook',
      extraNotes = '',
      characterProfile = null,
    } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      res.status(400).json({ error: 'Prompt is required for illustration generation' });
      return;
    }

    const validSizes = ['1K', '2K', '4K'];
    const chosenSize = validSizes.includes(size) ? size : '1K';

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'MY_GEMINI_API_KEY') {
      res.status(503).json({
        error: 'GEMINI_API_KEY not configured in environment',
        fallbackNeeded: true,
      });
      return;
    }

    let characterDetails = '';
    if (characterProfile) {
      characterDetails = ` Main character: ${characterProfile.name} (${characterProfile.species}), having ${characterProfile.hairStyle}, wearing ${characterProfile.clothing}, with a ${characterProfile.personality} expression.`;
    }

    const fullPrompt = `${prompt}.${characterDetails} Art style: ${style}. ${extraNotes ? `Details: ${extraNotes}.` : ''} High-quality children's book illustration, vibrant, magical, captivating, suitable for young readers.`;

    const response = await withTimeout(
      ai.models.generateContent({
        model: 'gemini-3-pro-image-preview',
        contents: {
          parts: [
            {
              text: fullPrompt,
            },
          ],
        },
        config: {
          imageConfig: {
            aspectRatio: aspectRatio || '4:3',
            imageSize: chosenSize,
          },
        },
      }),
      14000
    );

    let imageUrl = '';
    let mimeType = 'image/png';

    for (const part of response.candidates?.[0]?.content?.parts ?? []) {
      if (part.inlineData?.data) {
        mimeType = part.inlineData.mimeType || 'image/png';
        imageUrl = `data:${mimeType};base64,${part.inlineData.data}`;
        break;
      }
    }

    if (!imageUrl) {
      throw new Error('No image inlineData returned by gemini-3-pro-image-preview');
    }

    res.json({
      imageUrl,
      size: chosenSize,
      aspectRatio,
      prompt: fullPrompt,
    });
  } catch (error: any) {
    console.error('Image generation error:', error?.message);
    res.status(503).json({
      error: error?.message || 'Failed to generate illustration with gemini-3-pro-image-preview',
      fallbackNeeded: true,
    });
  }
});

/**
 * Acknowledge a child's hand-drawn illustration in the story narrative
 * Uses gemini-3.8-flash to weave the child's drawing into the tale
 */
app.post('/api/acknowledge-drawing', async (req: Request, res: Response) => {
  try {
    const { drawingCaption, heroName = 'our brave hero', pageText, characterProfile } = req.body;

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'MY_GEMINI_API_KEY') {
      res.status(503).json({
        error: 'GEMINI_API_KEY not configured',
        fallbackNeeded: true,
      });
      return;
    }

    const prompt = `A child reading a children's storybook has just hand-drawn an illustration for this page.
The child's drawing is described as: "${drawingCaption || 'a colorful picture'}".
Hero name: ${characterProfile?.name || heroName}.
Current page context: "${pageText}".

Write a heartwarming, enthusiastic 1-2 sentence paragraph spoken by the bedtime narrator that acknowledges the child's drawing directly, weaving it into the story action (e.g. admiring the drawing, having the hero interact with it, or feeling energized by its colors). Keep it delightful for a 5-year-old.`;

    const response = await withTimeout(
      ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: 'You are an affectionate, enthusiastic children story narrator who loves encouraging young artists and celebrating their drawings.',
        },
      }),
      7000
    );

    const acknowledgment = (response.text ?? '').trim();
    res.json({ acknowledgment });
  } catch (error: any) {
    console.error('Acknowledgment generation error:', error?.message);
    res.status(503).json({
      error: error?.message || 'Failed to acknowledge drawing',
      fallbackNeeded: true,
    });
  }
});

/**
 * Dynamic branching story choices
 * Uses gemini-3.8-flash to adapt the next page and generate new branching choices
 */
app.post('/api/branch-story', async (req: Request, res: Response) => {
  try {
    const {
      storyTitle,
      currentPageNumber,
      previousPageText,
      chosenChoiceText,
      readingLevel = 'Ages 3-5',
      characterProfile = null,
      artStyle = 'Classic Gouache Storybook',
      imageSize = '1K',
    } = req.body;

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'MY_GEMINI_API_KEY') {
      res.status(503).json({
        error: 'GEMINI_API_KEY not configured',
        fallbackNeeded: true,
      });
      return;
    }

    const hero = characterProfile?.name || 'the hero';
    const heroDetails = characterProfile
      ? `${characterProfile.name} (${characterProfile.species}), who wears ${characterProfile.clothing} and has a ${characterProfile.personality} personality`
      : hero;

    const prompt = `Continue the children's story "${storyTitle}" for page ${currentPageNumber + 1}.
Target reading level: ${readingLevel}.
Protagonist: ${heroDetails}.
Previous page text: "${previousPageText}".
The child chose this adventure path: "${chosenChoiceText}".

Generate the next page text describing what happens next, along with an illustration prompt and 2-3 exciting new choices for what to do next.

Return ONLY valid JSON with this schema:
{
  "pageNumber": ${currentPageNumber + 1},
  "text": "2-3 engaging sentences describing the outcome of the choice.",
  "illustrationPrompt": "Visual description of the new scene starring ${hero} for an illustrator",
  "choices": [
    {
      "id": "choice-${currentPageNumber + 1}-1",
      "text": "First exciting next option",
      "consequenceSummary": "Brief consequence",
      "illustrationHint": "Art hint"
    },
    {
      "id": "choice-${currentPageNumber + 1}-2",
      "text": "Second exciting next option",
      "consequenceSummary": "Brief consequence",
      "illustrationHint": "Art hint"
    }
  ],
  "vocabularyWords": [
    {
      "word": "Brave",
      "phonetic": "BRAYV",
      "definition": "Showing courage.",
      "childFriendly": "Ready to try something new!"
    }
  ]
}`;

    const response = await withTimeout(
      ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: 'You are a master storyteller for children who creates delightful branching choose-your-own-adventure bedtime books.',
          responseMimeType: 'application/json',
        },
      }),
      8000
    );

    const parsed = JSON.parse((response.text ?? '').trim());

    res.json({
      page: {
        pageNumber: currentPageNumber + 1,
        text: parsed.text || 'The adventure continued into the sparkling sunlight...',
        illustrationPrompt: parsed.illustrationPrompt || `Illustration of ${hero} following ${chosenChoiceText}`,
        illustrationUrl: '',
        illustrationResolution: imageSize,
        artStyle: artStyle,
        choices: parsed.choices || [],
        vocabularyWords: parsed.vocabularyWords || [],
        displayMode: 'both',
      },
    });
  } catch (error: any) {
    console.error('Branching story generation error:', error?.message);
    res.status(503).json({
      error: error?.message || 'Failed to branch story',
      fallbackNeeded: true,
    });
  }
});

/**
 * Generate complete multi-page children story using gemini-3.8-flash
 */
app.post('/api/generate-story', async (req: Request, res: Response) => {
  try {
    const { heroName, heroType, setting, plotIdea, readingLevel = 'Ages 3-5', artStyle = 'Classic Gouache Storybook', imageSize = '1K', characterProfile = null } = req.body;

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'MY_GEMINI_API_KEY') {
      res.status(503).json({
        error: 'GEMINI_API_KEY not configured in environment',
        fallbackNeeded: true,
      });
      return;
    }

    const actualHero = characterProfile?.name || heroName;
    const actualSpecies = characterProfile?.species || heroType;
    const heroLook = characterProfile ? `, wearing ${characterProfile.clothing} with ${characterProfile.hairStyle}` : '';

    const prompt = `Write a charming, wholesome children's story for ${readingLevel}.
Hero: ${actualHero} (${actualSpecies}${heroLook})
Setting: ${setting}
Plot Idea: ${plotIdea || 'An exciting, gentle adventure with a heartwarming happy ending'}
Art Style: ${artStyle}
Preferred Illustration Resolution: ${imageSize}

Generate exactly 4 distinct pages, with 2-3 interactive choices on each page so the child can steer the story!
Return ONLY valid JSON with this schema:
{
  "title": "Story Title",
  "summary": "Short 1-2 sentence overview of the adventure",
  "themeColor": "from-amber-400/20 to-rose-400/20",
  "tag": "Adventure or Bedtime or Animals",
  "pages": [
    {
      "pageNumber": 1,
      "text": "1-3 sentences suitable for reading aloud to kids.",
      "illustrationPrompt": "Detailed visual description of this page scene for an illustrator",
      "choices": [
        {
          "id": "c1",
          "text": "Choice A label",
          "consequenceSummary": "What happens",
          "illustrationHint": "Visual clue"
        },
        {
          "id": "c2",
          "text": "Choice B label",
          "consequenceSummary": "What happens",
          "illustrationHint": "Visual clue"
        }
      ],
      "vocabularyWords": [
        {
          "word": "Curious",
          "phonetic": "KYUR-ee-us",
          "definition": "Eager to know or learn something new.",
          "childFriendly": "Excited to find out how things work!"
        }
      ]
    }
  ]
}`;

    const response = await withTimeout(
      ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: 'You are an acclaimed children book author and educator. Write heartwarming, gentle, imaginative stories for kids with clear sentences and delightful vocabulary sparks.',
          responseMimeType: 'application/json',
        },
      }),
      10000
    );

    const jsonText = (response.text ?? '').trim();
    const parsed = JSON.parse(jsonText);

    const id = `custom-${Date.now()}`;
    const formattedPages = (parsed.pages || []).map((p: any, idx: number) => ({
      pageNumber: idx + 1,
      text: p.text || 'Once upon a time...',
      illustrationPrompt: p.illustrationPrompt || `Illustration of ${actualHero} in ${setting}`,
      illustrationUrl: '',
      illustrationResolution: imageSize,
      artStyle: artStyle,
      choices: p.choices || [],
      vocabularyWords: p.vocabularyWords || [],
      displayMode: 'both',
    }));

    const completeStory = {
      id,
      title: parsed.title || `The Adventures of ${actualHero}`,
      author: `${actualHero}'s Dream Team`,
      readingLevel,
      tag: parsed.tag || 'New Adventure',
      summary: parsed.summary || `A wonderful journey with ${actualHero} in ${setting}.`,
      coverImage: '',
      themeColor: parsed.themeColor || 'from-indigo-400/20 to-pink-400/20',
      pages: formattedPages,
      createdAt: new Date().toISOString().split('T')[0],
      isCustom: true,
      activeCharacter: characterProfile || undefined,
    };

    res.json({ story: completeStory });
  } catch (error: any) {
    console.error('Story generation error:', error?.message);
    res.status(503).json({
      error: error?.message || 'Failed to generate story with gemini-3.8-flash',
      fallbackNeeded: true,
    });
  }
});

// Setup dev server with Vite middlewares or production static files
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`WonderTales server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
