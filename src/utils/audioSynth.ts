/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface AnimalSoundDef {
  id: string;
  name: string;
  category: 'Farm' | 'Wild' | 'Pets' | 'Nature';
  emoji: string;
  soundName: string;
  soundText: string;
  color: string;
  description: string;
  synthSound: (audioCtx: AudioContext) => void;
}

export const ANIMAL_SOUNDS: AnimalSoundDef[] = [
  {
    id: 'lion',
    name: 'Leo the Lion',
    category: 'Wild',
    emoji: '🦁',
    soundName: 'Roar',
    soundText: 'ROAAR! 🦁',
    color: 'from-amber-400 to-orange-500',
    description: 'The brave king of the jungle with a mighty, deep roar!',
    synthSound: (ctx) => {
      const now = ctx.currentTime;
      // Low rumble osc
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(55, now + 0.8);
      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.3, now + 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);

      // Noise generator for breath/growl
      const bufferSize = ctx.sampleRate * 0.8;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(280, now);
      filter.Q.value = 3.0;

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.01, now);
      noiseGain.gain.linearRampToValueAtTime(0.25, now + 0.1);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

      osc.connect(gain);
      gain.connect(ctx.destination);
      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(ctx.destination);

      osc.start(now);
      noise.start(now);
      osc.stop(now + 0.9);
      noise.stop(now + 0.8);
    },
  },
  {
    id: 'cow',
    name: 'Daisy the Cow',
    category: 'Farm',
    emoji: '🐮',
    soundName: 'Moo',
    soundText: 'MOOOOO! 🐮',
    color: 'from-emerald-400 to-teal-500',
    description: 'A gentle spotted cow chewing sweet meadow grass!',
    synthSound: (ctx) => {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(120, now);
      osc.frequency.linearRampToValueAtTime(145, now + 0.25);
      osc.frequency.exponentialRampToValueAtTime(110, now + 1.1);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.35, now + 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.1);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 1.1);
    },
  },
  {
    id: 'sheep',
    name: 'Woolly the Sheep',
    category: 'Farm',
    emoji: '🐑',
    soundName: 'Baa',
    soundText: 'BAAA-AAA! 🐑',
    color: 'from-sky-300 to-blue-400',
    description: 'A super soft fluffy sheep leaping over green hills!',
    synthSound: (ctx) => {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      // Tremolo LFO for stuttering baa-aa-aa
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();

      lfo.frequency.setValueAtTime(8, now); // 8 Hz vibrato
      lfoGain.gain.setValueAtTime(25, now);

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.exponentialRampToValueAtTime(210, now + 0.7);

      lfo.connect(osc.frequency);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.28, now + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.75);

      osc.connect(gain);
      gain.connect(ctx.destination);

      lfo.start(now);
      osc.start(now);
      lfo.stop(now + 0.75);
      osc.stop(now + 0.75);
    },
  },
  {
    id: 'duck',
    name: 'Ducky the Duck',
    category: 'Farm',
    emoji: '🦆',
    soundName: 'Quack',
    soundText: 'QUACK QUACK! 🦆',
    color: 'from-amber-300 to-yellow-500',
    description: 'A happy yellow duck paddling in the warm pond!',
    synthSound: (ctx) => {
      const playSingleQuack = (delay: number) => {
        const now = ctx.currentTime + delay;
        const osc = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();
        const gain = ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(220, now + 0.2);

        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1400, now);
        filter.Q.value = 4;

        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.3, now + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.23);
      };

      playSingleQuack(0);
      playSingleQuack(0.25);
    },
  },
  {
    id: 'frog',
    name: 'Freddy the Frog',
    category: 'Nature',
    emoji: '🐸',
    soundName: 'Ribbit',
    soundText: 'RIBBIT RIBBIT! 🐸',
    color: 'from-emerald-400 to-green-600',
    description: 'A bouncy green frog sitting cozy on a water lily leaf!',
    synthSound: (ctx) => {
      const playCroak = (delay: number) => {
        const now = ctx.currentTime + delay;
        const osc = ctx.createOscillator();
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        const gain = ctx.createGain();

        lfo.frequency.setValueAtTime(35, now);
        lfoGain.gain.setValueAtTime(80, now);

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(190, now);
        osc.frequency.linearRampToValueAtTime(240, now + 0.12);
        osc.frequency.exponentialRampToValueAtTime(160, now + 0.25);

        lfo.connect(osc.frequency);

        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.28, now + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

        osc.connect(gain);
        gain.connect(ctx.destination);

        lfo.start(now);
        osc.start(now);
        lfo.stop(now + 0.25);
        osc.stop(now + 0.25);
      };

      playCroak(0);
      playCroak(0.3);
    },
  },
  {
    id: 'cat',
    name: 'Whiskers the Cat',
    category: 'Pets',
    emoji: '🐱',
    soundName: 'Meow',
    soundText: 'MEEE-OW! 🐱',
    color: 'from-rose-300 to-pink-500',
    description: 'A playful purring kitten curling up on a fluffy cushion!',
    synthSound: (ctx) => {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.linearRampToValueAtTime(680, now + 0.25);
      osc.frequency.exponentialRampToValueAtTime(360, now + 0.85);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.25, now + 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.85);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.85);
    },
  },
  {
    id: 'dog',
    name: 'Buster the Puppy',
    category: 'Pets',
    emoji: '🐶',
    soundName: 'Bark',
    soundText: 'WOOF WOOF! 🐶',
    color: 'from-amber-500 to-orange-600',
    description: 'An enthusiastic puppy wagging its tail and doing tricks!',
    synthSound: (ctx) => {
      const playBark = (delay: number) => {
        const now = ctx.currentTime + delay;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(140, now + 0.18);

        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.35, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.19);
      };

      playBark(0);
      playBark(0.22);
    },
  },
  {
    id: 'elephant',
    name: 'Peanut the Elephant',
    category: 'Wild',
    emoji: '🐘',
    soundName: 'Trumpet',
    soundText: 'PAWOOOOO! 🐘',
    color: 'from-indigo-400 to-purple-600',
    description: 'A friendly giant elephant spraying cool water droplets!',
    synthSound: (ctx) => {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(360, now);
      osc.frequency.linearRampToValueAtTime(620, now + 0.3);
      osc.frequency.exponentialRampToValueAtTime(380, now + 0.9);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.3, now + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.9);
    },
  },
  {
    id: 'rooster',
    name: 'Rocky the Rooster',
    category: 'Farm',
    emoji: '🐓',
    soundName: 'Crow',
    soundText: 'COCK-A-DOODLE-DOO! 🐓',
    color: 'from-red-400 to-rose-600',
    description: 'Waking up the sunny morning with high spirits!',
    synthSound: (ctx) => {
      const notes = [440, 523, 659, 880];
      const durations = [0.15, 0.15, 0.2, 0.5];
      let t = ctx.currentTime;

      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, t);

        gain.gain.setValueAtTime(0.01, t);
        gain.gain.linearRampToValueAtTime(0.25, t + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, t + durations[i]);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(t);
        osc.stop(t + durations[i]);
        t += durations[i] * 0.85;
      });
    },
  },
  {
    id: 'monkey',
    name: 'Koko the Monkey',
    category: 'Wild',
    emoji: '🐵',
    soundName: 'Chirp',
    soundText: 'OO-OO-AA-AA! 🐵',
    color: 'from-amber-600 to-yellow-600',
    description: 'Swinging happily between jungle vines and eating sweet bananas!',
    synthSound: (ctx) => {
      const freqs = [350, 480, 360, 540];
      let t = ctx.currentTime;
      freqs.forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);
        osc.frequency.linearRampToValueAtTime(freq * 1.3, t + 0.1);

        gain.gain.setValueAtTime(0.01, t);
        gain.gain.linearRampToValueAtTime(0.25, t + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(t);
        osc.stop(t + 0.12);
        t += 0.15;
      });
    },
  },
  {
    id: 'pig',
    name: 'Barnaby the Pig',
    category: 'Farm',
    emoji: '🐷',
    soundName: 'Oink',
    soundText: 'OINK OINK! 🐷',
    color: 'from-pink-400 to-rose-400',
    description: 'A happy little piglet splashing in the warm mud bath!',
    synthSound: (ctx) => {
      const playOink = (delay: number) => {
        const now = ctx.currentTime + delay;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.linearRampToValueAtTime(190, now + 0.08);
        osc.frequency.exponentialRampToValueAtTime(110, now + 0.2);

        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.3, now + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.21);
      };

      playOink(0);
      playOink(0.25);
    },
  },
  {
    id: 'horse',
    name: 'Spirit the Horse',
    category: 'Farm',
    emoji: '🐴',
    soundName: 'Neigh',
    soundText: 'NEIIIGH! 🐴',
    color: 'from-amber-700 to-orange-800',
    description: 'Galloping fast through the golden meadows under the blue sky!',
    synthSound: (ctx) => {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      const gain = ctx.createGain();

      lfo.frequency.setValueAtTime(14, now); // fast whinny flutter
      lfoGain.gain.setValueAtTime(70, now);

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(780, now + 0.35);
      osc.frequency.exponentialRampToValueAtTime(320, now + 0.9);

      lfo.connect(osc.frequency);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.28, now + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.95);

      osc.connect(gain);
      gain.connect(ctx.destination);

      lfo.start(now);
      osc.start(now);
      lfo.stop(now + 0.95);
      osc.stop(now + 0.95);
    },
  },
  {
    id: 'owl',
    name: 'Barnaby Owl',
    category: 'Nature',
    emoji: '🦉',
    soundName: 'Hoot',
    soundText: 'HOO-HOOOO! 🦉',
    color: 'from-indigo-500 to-slate-700',
    description: 'A wise gentle owl perching under the full silver moon!',
    synthSound: (ctx) => {
      const playHoot = (delay: number, duration: number, freq: number) => {
        const now = ctx.currentTime + delay;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.9, now + duration);

        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.3, now + duration * 0.3);
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + duration + 0.05);
      };

      playHoot(0, 0.25, 420);
      playHoot(0.35, 0.55, 380);
    },
  },
  {
    id: 'bee',
    name: 'Buzzy the Bee',
    category: 'Nature',
    emoji: '🐝',
    soundName: 'Buzz',
    soundText: 'BZZZZZZ! 🐝',
    color: 'from-yellow-400 to-amber-500',
    description: 'Sipping sweet flower nectar and dancing with butterflies!',
    synthSound: (ctx) => {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.linearRampToValueAtTime(240, now + 0.3);
      osc.frequency.linearRampToValueAtTime(200, now + 0.7);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.2, now + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.75);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.75);
    },
  },
];

/**
 * Play synthesized sound using Web Audio API
 */
export function playAnimalSound(animal: AnimalSoundDef): void {
  try {
    if (typeof window === 'undefined') return;
    const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtxClass) return;
    const ctx = new AudioCtxClass();
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    animal.synthSound(ctx);
    setTimeout(() => {
      ctx.close().catch(() => {});
    }, 2500);
  } catch (e) {
    console.warn('Web Audio playback error:', e);
  }
}

/**
 * Play spoken speech sound effect ("Moooo!", "Roar!")
 */
export function speakAnimalSound(text: string): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.2;
    window.speechSynthesis.speak(utterance);
  } catch (e) {
    console.warn('SpeechSynthesis error:', e);
  }
}
