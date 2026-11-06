# WonderTales: Child Drawing Studio, Character Customizer & Interactive Branching Adventures

An enchanted interactive upgrade to WonderTales allowing children to draw their own page illustrations, customize the hero's appearance and personality across all tales, and steer the adventure with branching choices at the end of every page.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The following user preferences were confirmed in Phase 1 and are baked into this blueprint:

- **Confirmed Decision 1 (Drawing Display)**: Children's hand-drawn art is displayed in a flexible **side-by-side mode** alongside the AI-generated illustration, with a 1-click toggle to switch to full-screen child drawing or full-screen AI artwork.
- **Confirmed Decision 2 (Branching Choices Frequency)**: Interactive story choices appear **at the end of every page before advancing**, offering 2–3 meaningful paths that dynamically weave the subsequent page text, Gemini 3 Pro illustration, and Gemini 3.8 Flash TTS narration.
- **Confirmed Decision 3 (Character Customization Scope)**: The custom hero profile (name, hair color/style, clothing, and personality trait) is active **across both newly generated tales and existing library stories**, dynamically injecting the child's personalized hero into illustrations, narrative, and vocal delivery.
- **Child Drawing Acknowledgment**: When a child saves their drawing, the storyteller will enthusiastically celebrate and reference specific elements of their artwork in the story narrative and voiceover (e.g. *"Look at those vibrant sapphire wings you painted—they glowed warmly as we flew into the clouds!"*).

---

## 1. Overview & Core Concept

- **What It Does**: Transforms WonderTales from a passive book reader into an active creative studio where kids co-author the adventure: they can draw with a tactile, playful canvas; customize their own avatar hero; and make narrative choices on every page that change the storyline in real time.
- **Target Audience**: Young children (ages 3–12) and their parents for bedtime reading, early literacy development, and creative expression.
- **Key Value**: Deep emotional connection and agency—the child sees their own character, hears their own drawing celebrated by the narrator, and controls the plot.

---

## 2. User Experience & Visual Design

### Key User Flows

1. **Child Drawing Studio Flow**:
   - On any story page, tap the **"Draw Your Illustration"** palette icon.
   - An intuitive child drawing modal opens with colorful crayons/markers, size sliders, eraser, stamp stickers (stars, sparkles, hearts, friendly animals), and undo/clear.
   - Child draws their scene or hero, adds optional prompt/caption (e.g. *"Golden dragon wings"*), and taps **"Save to Story"**.
   - The book reader updates into **Side-by-Side Mode**: Child Drawing on the left, Gemini 3 Pro illustration on the right, with a segmented pill toggle (`Both Side-by-Side` · `Child Art` · `AI Illustration`).
   - The AI narrator acknowledges the drawing with a warm personalized spoken voiceover!

2. **Character Customizer Flow**:
   - Tap **"Hero Creator"** in the top navigation or reader toolbar.
   - Customizer modal lets the child configure:
     * **Name**: (e.g. Oliver, Maya, Pip)
     * **Species / Form**: Human Kid, Baby Dragon, Bunny Adventurer, Space Kitten, Robot Explorer
     * **Appearance**: Hair color & style (e.g., *Golden curls*, *Spiky cobalt*, *Fiery braids*), Outfit (e.g., *Starry cape & boots*, *Chef baker apron*, *Explorer goggles & overalls*)
     * **Personality**: *Brave & curious*, *Playful & silly*, *Thoughtful & wise*, *Gentle & kind*
   - Saving updates the global active hero. Existing stories immediately adopt the customized character in text, illustration prompts, and voice persona!

3. **Branching Adventure Choice Flow**:
   - After listening to or reading page 1, the child reaches the page footer.
   - Instead of a plain "Next" button, 2–3 vibrant choice cards appear:
     * *Choice A*: "Follow the glowing butterfly trail into the hollow tree"
     * *Choice B*: "Build a raft of cinnamon bark to cross the stardust river"
     * *Choice C*: "Call out a secret whistle to the friendly moon owl"
   - Tapping a choice triggers a magical page turn:
     * Gemini 3.8 Flash crafts the next page consequence seamlessly.
     * Gemini 3 Pro generates the new page illustration at the chosen size (1K, 2K, 4K).
     * Gemini 3.8 Flash TTS narrating the choice outcome with animated word highlighting.

### Visual Identity & Theme

- **Aesthetic Direction**: Enchanting, tactile children's book aesthetic with warm creamy paper textures, rounded 24px cards, soft shadows, and delightful animations.
- **Color Palette**:
  * Neutral field: Soft warm cream (`#FAF8F5`) and pure card white (`#FFFFFF`).
  * Accent colors: Amber gold (`#D97706`), Sunset coral (`#F97316`), Soft teal (`#0D9488`), and Starry indigo (`#4F46E5`).
  * Drawing Palette: 12 vibrant kid-safe wax crayon swatches + custom color picker.
- **Typography**: Display titles in `Fraunces` serif, body text in `Plus Jakarta Sans` with 1.65 line spacing and large readable 22px–26px font for young readers.
- **Zero-Pill Compliance**: Metadata formatted as clean unboxed text with typographic dot separators; functional segmented controls used strictly for interactive view toggles.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: HTML5 Canvas for Drawing Engine**:
  * *Chosen Approach*: Lightweight, high-performance HTML5 `<canvas>` with touch and mouse support, smooth quadratic curve interpolation, eraser, brush size controls, and PNG dataURL export.
  * *Why*: Zero external heavyweight dependencies, instant 60fps responsiveness on both touchscreens and desktop mice, and simple persistence in `localStorage`.
- **Decision 2: Side-by-Side Dual Illustration Mode**:
  * *Chosen Approach*: Provide a 3-way view toggle (`Both Side-by-Side`, `My Drawing Only`, `AI Art Only`) defaulting to side-by-side.
  * *Why*: Respects the child's creativity while preserving the AI illustration so neither is lost.
- **Decision 3: Server-Authoritative Branching Narrative via Gemini 3.8 Flash**:
  * *Chosen Approach*: Endpoint `/api/branch-story` receives the current story, current page, chosen decision, character customizations, and child drawing context, returning the customized next page text, 2-3 new choices, illustration prompt, and vocabulary sparks.
  * *Why*: Fast latency, cohesive narrative continuity, and strict JSON response schema.
- **Decision 4: Narrative Acknowledgment of Child Artwork**:
  * *Chosen Approach*: When a child submits a drawing with an optional tag or title (e.g. "sparkly wings"), Gemini crafts a celebratory 1-sentence narrative acknowledgment into the page text, which is voiced aloud by `gemini-3.8-flash-tts`.

---

## 4. Technical Architecture & Data Strategy

### System Architecture Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                        WonderTales Client (React)                      │
│                                                                        │
│  ┌─────────────────────────┐  ┌─────────────────────────────────────┐  │
│  │   CharacterCustomizer   │  │           DrawingStudio             │  │
│  │ (Name, Outfit, Traits)  │  │   (HTML5 Canvas, Brushes, Stamps)   │  │
│  └───────────┬─────────────┘  └──────────────────┬──────────────────┘  │
│              │                                   │                     │
│              ▼                                   ▼                     │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                            BookReader                            │  │
│  │  ┌───────────────────────────┐   ┌────────────────────────────┐  │  │
│  │  │  Dual-Illustration Frame  │   │  Prose & Interactive Words │  │  │
│  │  │  [Child Art]  [AI 1K/2K/4K│   │  (Highlighted Read-Aloud)  │  │  │
│  │  └───────────────────────────┘   └────────────────────────────┘  │  │
│  │  ┌────────────────────────────────────────────────────────────┐  │  │
│  │  │        Branching Choice Cards (Choice A / B / C)           │  │  │
│  │  └────────────────────────────────────────────────────────────┘  │  │
│  │  ┌────────────────────────────────────────────────────────────┐  │  │
│  │  │           Audio Storyteller Bar (Gemini 3.8 TTS)           │  │  │
│  │  └────────────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────┬──────────────────────────────┘  │
└──────────────────────────────────────┼─────────────────────────────────┘
                                       │ /api calls (fetch)
                                       ▼
┌────────────────────────────────────────────────────────────────────────┐
│                          Express Server.ts                             │
│                                                                        │
│  ┌────────────────────┐ ┌────────────────────┐ ┌────────────────────┐  │
│  │      POST /api/    │ │     POST /api/     │ │     POST /api/     │  │
│  │        branch      │ │   custom-character │ │   acknowledge-art  │  │
│  │   (gemini-3.8-flash│ │   (gemini-3.8-flash│ │   (gemini-3.8-flash│  │
│  └─────────┬──────────┘ └─────────┬──────────┘ └─────────┬──────────┘  │
│            │                      │                      │             │
│            ▼                      ▼                      ▼             │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │              POST /api/generate-illustration                     │  │
│  │           (gemini-3-pro-image-preview with 1K/2K/4K)             │  │
│  └──────────────────────────────────┬───────────────────────────────┘  │
│                                     │                                  │
│                                     ▼                                  │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                         POST /api/tts                            │  │
│  │      (gemini-3.8-flash-tts with personalized voice styles)       │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

### Data Model Enhancements

```typescript
export interface CharacterProfile {
  name: string;
  species: string; // 'Human Kid' | 'Baby Dragon' | 'Bunny Explorer' | 'Space Cat' | 'Robot Friend'
  hairStyle: string; // e.g. 'Golden curls', 'Midnight spiky hair', 'Fiery braids'
  clothing: string; // e.g. 'Starry cape & boots', 'Explorer goggles & jacket', 'Cozy baker apron'
  personality: string; // 'Brave & curious', 'Playful & silly', 'Thoughtful & kind'
  colorTheme: string;
}

export interface ChildDrawing {
  pageNumber: number;
  dataUrl: string; // Base64 canvas drawing
  caption?: string; // Child's description of what they drew
  createdAt: string;
}

export interface StoryChoice {
  id: string;
  text: string;
  consequenceSummary: string;
  illustrationHint: string;
}

export interface StoryPage {
  pageNumber: number;
  text: string;
  illustrationPrompt: string;
  illustrationUrl: string;
  illustrationResolution: ImageSize;
  artStyle: ArtStyle;
  childDrawing?: ChildDrawing;
  displayMode?: 'both' | 'child' | 'ai';
  choices?: StoryChoice[];
  chosenChoiceId?: string;
  drawingAcknowledgment?: string;
  vocabularyWords: VocabularyWord[];
}
```

### Interactive State Transitions

- **Canvas Drawing**: User selects color/brush size -> drags pointer to draw -> undo/clear modifies canvas history stack -> save creates PNG dataUrl stored in `story.pages[idx].childDrawing` and local storage -> triggers acknowledgment endpoint.
- **Display Mode Toggle**: User clicks `Both` / `My Drawing` / `AI Art` -> updates `page.displayMode` immediately without re-rendering network assets.
- **Branch Choice Pick**: User clicks Choice B -> shows sparkle loading transition -> `/api/branch-story` generates Page N+1 text taking choice and custom character profile into account -> `/api/generate-illustration` creates matching 1K/2K/4K art -> reader advances and starts Gemini TTS narration!
