/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Volume2, Sparkles, HelpCircle, RotateCcw, Award, CheckCircle2, Music, ArrowLeft } from 'lucide-react';
import { ANIMAL_SOUNDS, AnimalSoundDef, playAnimalSound, speakAnimalSound } from '../utils/audioSynth';

interface AnimalSoundsPageProps {
  onBackToLibrary: () => void;
  onWeaveStoryWithAnimal?: (animal: AnimalSoundDef) => void;
}

export const AnimalSoundsPage: React.FC<AnimalSoundsPageProps> = ({
  onBackToLibrary,
  onWeaveStoryWithAnimal,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeAnimalId, setActiveAnimalId] = useState<string | null>(null);
  const [sparkles, setSparkles] = useState<{ id: number; x: number; y: number; emoji: string }[]>([]);

  // Mini-game state
  const [isGameMode, setIsGameMode] = useState<boolean>(false);
  const [gameMysteryAnimal, setGameMysteryAnimal] = useState<AnimalSoundDef | null>(null);
  const [gameChoices, setGameChoices] = useState<AnimalSoundDef[]>([]);
  const [gameResult, setGameResult] = useState<'correct' | 'wrong' | null>(null);
  const [gameScore, setGameScore] = useState<number>(0);

  const categories = ['All', 'Farm', 'Wild', 'Pets', 'Nature'];

  const filteredAnimals = selectedCategory === 'All'
    ? ANIMAL_SOUNDS
    : ANIMAL_SOUNDS.filter((a) => a.category === selectedCategory);

  const handlePlaySound = (animal: AnimalSoundDef, e?: React.MouseEvent) => {
    setActiveAnimalId(animal.id);
    playAnimalSound(animal);

    if (e) {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const emojis = ['⭐', '✨', '🎶', '💖', animal.emoji];
      const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
      const newSparkle = { id: Date.now() + Math.random(), x, y, emoji: randomEmoji };
      setSparkles((prev) => [...prev.slice(-8), newSparkle]);
      setTimeout(() => {
        setSparkles((prev) => prev.filter((s) => s.id !== newSparkle.id));
      }, 900);
    }

    setTimeout(() => {
      setActiveAnimalId((prev) => (prev === animal.id ? null : prev));
    }, 1000);
  };

  const handleSpeakSound = (animal: AnimalSoundDef, e: React.MouseEvent) => {
    e.stopPropagation();
    speakAnimalSound(`${animal.soundName}! Says ${animal.name}!`);
  };

  // Mini Game Start
  const startNewGameRound = () => {
    const target = ANIMAL_SOUNDS[Math.floor(Math.random() * ANIMAL_SOUNDS.length)];
    const others = ANIMAL_SOUNDS.filter((a) => a.id !== target.id)
      .sort(() => 0.5 - Math.random())
      .slice(0, 2);
    const roundChoices = [target, ...others].sort(() => 0.5 - Math.random());

    setGameMysteryAnimal(target);
    setGameChoices(roundChoices);
    setGameResult(null);

    // Play mystery sound
    setTimeout(() => {
      playAnimalSound(target);
    }, 200);
  };

  const handleToggleGameMode = () => {
    if (!isGameMode) {
      setIsGameMode(true);
      startNewGameRound();
    } else {
      setIsGameMode(false);
      setGameMysteryAnimal(null);
      setGameResult(null);
    }
  };

  const handleGuessChoice = (choice: AnimalSoundDef) => {
    if (!gameMysteryAnimal) return;
    if (choice.id === gameMysteryAnimal.id) {
      setGameResult('correct');
      setGameScore((prev) => prev + 1);
      speakAnimalSound(`Hooray! That is ${gameMysteryAnimal.name}! Great job!`);
    } else {
      setGameResult('wrong');
      speakAnimalSound('Try again! Listen closely!');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* Top Bar with Back and Game Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={onBackToLibrary}
          className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-stone-600 hover:text-stone-900 px-3.5 py-2 rounded-xl hover:bg-stone-100 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Story Library</span>
        </button>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleToggleGameMode}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer shadow-xs ${
              isGameMode
                ? 'bg-amber-500 text-white ring-2 ring-amber-300'
                : 'bg-white hover:bg-amber-50 text-amber-900 border border-amber-300'
            }`}
          >
            <HelpCircle className="w-4 h-4 text-amber-700" />
            <span>{isGameMode ? 'Exit Sound Game' : '🎮 Play Guess The Sound'}</span>
          </button>
        </div>
      </div>

      {/* Hero Banner */}
      <div className="rounded-3xl shadow-xl border border-amber-200/80 bg-gradient-to-r from-amber-100 via-orange-50 to-rose-100 p-6 sm:p-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 text-xs font-bold text-amber-800 uppercase tracking-widest">
              <Sparkles className="w-4 h-4 text-amber-600 animate-spin" style={{ animationDuration: '6s' }} />
              <span>Interactive Animal Sounds Safari</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-extrabold text-stone-900 leading-tight">
              Listen to the <span className="text-amber-800">Animal Chorus!</span> 🐾
            </h1>
            <p className="text-stone-700 text-sm sm:text-base max-w-xl">
              Tap any animal friend to hear realistic synthesized calls and funny spoken sound effects! Perfect for toddlers and curious kids.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-4 bg-white/90 rounded-2xl border border-amber-300 shadow-sm text-center">
              <span className="text-4xl block animate-bounce" style={{ animationDuration: '2.5s' }}>
                🦁🐮🦆
              </span>
              <span className="text-xs font-bold text-amber-900 mt-1 block">
                {ANIMAL_SOUNDS.length} Animal Friends
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Mini-Game Box when active */}
      {isGameMode && gameMysteryAnimal && (
        <div className="p-6 bg-gradient-to-br from-amber-50 via-white to-orange-50 rounded-3xl border-3 border-amber-300 shadow-lg space-y-4 text-center">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-600" />
              <span>Sound Detective Mode · Score: {gameScore}</span>
            </span>

            <button
              onClick={startNewGameRound}
              className="text-xs font-bold text-amber-800 hover:text-amber-950 flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Next Mystery</span>
            </button>
          </div>

          <h3 className="font-serif text-xl sm:text-2xl font-bold text-stone-900">
            Who made this sound?
          </h3>

          <div className="py-2">
            <button
              onClick={() => playAnimalSound(gameMysteryAnimal)}
              className="px-6 py-3.5 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-bold text-base rounded-2xl shadow-md transition-all flex items-center gap-2.5 mx-auto cursor-pointer animate-pulse"
            >
              <Volume2 className="w-5 h-5" />
              <span>🔊 Replay Mystery Sound</span>
            </button>
          </div>

          {/* 3 Guess Options */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-xl mx-auto pt-2">
            {gameChoices.map((choice) => (
              <button
                key={choice.id}
                onClick={() => handleGuessChoice(choice)}
                className="p-4 bg-white hover:bg-amber-100/70 border-2 border-amber-200 hover:border-amber-400 rounded-2xl shadow-xs transition-all flex flex-col items-center gap-2 cursor-pointer active:scale-95"
              >
                <span className="text-5xl">{choice.emoji}</span>
                <span className="font-serif font-bold text-base text-stone-900">
                  {choice.name}
                </span>
                <span className="text-xs text-amber-800 font-medium">
                  {choice.soundText}
                </span>
              </button>
            ))}
          </div>

          {/* Result Feedback */}
          {gameResult === 'correct' && (
            <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-emerald-900 font-bold flex items-center justify-center gap-2 animate-in zoom-in-95">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Hooray! That is {gameMysteryAnimal.name}! (+1 Star ⭐)</span>
            </div>
          )}

          {gameResult === 'wrong' && (
            <div className="p-3 bg-rose-50 border border-rose-300 rounded-2xl text-rose-900 font-semibold text-sm">
              Not quite! Tap "Replay Mystery Sound" and listen again! 👂
            </div>
          )}
        </div>
      )}

      {/* Category Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-stone-100 rounded-2xl overflow-x-auto">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              selectedCategory === cat
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Animal Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {filteredAnimals.map((animal) => {
          const isActive = activeAnimalId === animal.id;

          return (
            <div
              key={animal.id}
              onClick={(e) => handlePlaySound(animal, e)}
              className={`relative bg-white rounded-3xl border p-5 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer group active:scale-98 overflow-hidden ${
                isActive
                  ? 'border-amber-400 ring-4 ring-amber-200/80 scale-[1.02]'
                  : 'border-stone-200/80 hover:border-amber-300'
              }`}
            >
              {/* Sparkles burst */}
              {sparkles.map((spk) => (
                <span
                  key={spk.id}
                  className="absolute pointer-events-none text-2xl animate-out fade-out zoom-out"
                  style={{ left: spk.x, top: spk.y, transform: 'translate(-50%, -50%)' }}
                >
                  {spk.emoji}
                </span>
              ))}

              {/* Card Top: Emoji & Category Tag */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-amber-800 uppercase tracking-wider bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                    {animal.category}
                  </span>
                  <span className="text-xs text-stone-400 font-medium">Tap to Play</span>
                </div>

                {/* Big Emoji Zone */}
                <div className="w-24 h-24 sm:w-28 sm:h-28 mx-auto rounded-3xl bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform duration-300">
                  <span className="text-5xl sm:text-6xl drop-shadow-xs select-none">
                    {animal.emoji}
                  </span>
                </div>

                {/* Name & Sound */}
                <div className="text-center mt-4">
                  <h3 className="font-serif text-xl font-bold text-stone-900 group-hover:text-amber-950">
                    {animal.name}
                  </h3>
                  <div className="mt-1">
                    <span className="inline-block px-3 py-1 bg-amber-100/90 text-amber-950 font-extrabold text-sm rounded-full border border-amber-300/80 shadow-2xs">
                      {animal.soundText}
                    </span>
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed mt-2.5 line-clamp-2">
                    {animal.description}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-3 border-t border-stone-100 flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePlaySound(animal, e);
                  }}
                  className="flex-1 py-2.5 px-3 bg-amber-400 hover:bg-amber-500 active:bg-amber-600 text-amber-950 font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Volume2 className="w-4 h-4 text-amber-950" />
                  <span>Play Call</span>
                </button>

                <button
                  type="button"
                  onClick={(e) => handleSpeakSound(animal, e)}
                  className="p-2.5 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-xl border border-amber-200 transition-colors cursor-pointer"
                  title="Speak animal sound out loud"
                  aria-label={`Speak ${animal.soundName}`}
                >
                  <Music className="w-4 h-4 text-amber-800" />
                </button>

                {onWeaveStoryWithAnimal && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onWeaveStoryWithAnimal(animal);
                    }}
                    className="p-2.5 bg-rose-50 hover:bg-rose-100 text-rose-900 rounded-xl border border-rose-200 transition-colors cursor-pointer"
                    title={`Create a story about ${animal.name}`}
                    aria-label={`Weave story with ${animal.name}`}
                  >
                    <Sparkles className="w-4 h-4 text-rose-600" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
