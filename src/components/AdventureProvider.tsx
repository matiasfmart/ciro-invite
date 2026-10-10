import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import confetti from 'canvas-confetti';

type CelebrationOptions = { origin?: { x: number; y: number }; colors?: string[]; sound?: 'success' | 'applause' };
type AdventureEffects = { musicPlaying: boolean; chime: (kind?: 'bell' | 'stone' | 'success' | 'applause') => void; celebrate: (options?: CelebrationOptions) => void };
const AdventureContext = createContext<AdventureEffects | null>(null);

export function AdventureProvider({ children, colors }: { children: ReactNode; colors: string[] }) {
  const [musicPlaying, setMusicPlaying] = useState(false);
  const audio = useRef<AudioContext | null>(null);
  useEffect(() => {
    const player = new Audio(`${import.meta.env.BASE_URL}assets/david-cancion.mp3`);
    player.loop = true;
    player.volume = 0.22;
    let starting = false;
    const updatePlaying = () => setMusicPlaying(true);
    const updatePaused = () => setMusicPlaying(false);
    const startMusic = () => {
      if (starting || !player.paused) return;
      starting = true;
      void player.play().catch(() => {}).finally(() => { starting = false; });
    };
    player.addEventListener('playing', updatePlaying);
    player.addEventListener('pause', updatePaused);
    player.addEventListener('error', updatePaused);
    window.addEventListener('pointerdown', startMusic);
    window.addEventListener('keydown', startMusic);
    startMusic();
    return () => {
      window.removeEventListener('pointerdown', startMusic);
      window.removeEventListener('keydown', startMusic);
      player.removeEventListener('playing', updatePlaying);
      player.removeEventListener('pause', updatePaused);
      player.removeEventListener('error', updatePaused);
      player.pause();
      void audio.current?.close();
    };
  }, []);

  function chime(kind: 'bell' | 'stone' | 'success' | 'applause' = 'bell') {
    if (!musicPlaying || !('AudioContext' in window)) return;
    try {
      audio.current ??= new AudioContext();
      const context = audio.current;
      void context.resume();
      if (kind === 'applause') {
        const buffer = context.createBuffer(1, Math.floor(context.sampleRate * .1), context.sampleRate);
        const samples = buffer.getChannelData(0);
        for (let index = 0; index < samples.length; index++) samples[index] = (Math.random() * 2 - 1) * Math.exp(-index / (samples.length * .18));
        for (const delay of [0, .12, .24, .36, .48]) {
          const source = context.createBufferSource();
          const gain = context.createGain();
          source.buffer = buffer;
          gain.gain.value = .14;
          source.connect(gain);
          gain.connect(context.destination);
          source.start(context.currentTime + delay);
          source.onended = () => { source.disconnect(); gain.disconnect(); };
        }
        return;
      }
      const notes = kind === 'success' ? [523, 659, 784, 1047] : kind === 'stone' ? [660, 880] : [880, 1320];
      notes.forEach((frequency, index) => {
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        const start = context.currentTime + index * 0.12;
        oscillator.type = 'sine';
        oscillator.frequency.value = frequency;
        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(0.08, start + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.35);
        oscillator.connect(gain);
        gain.connect(context.destination);
        oscillator.start(start);
        oscillator.stop(start + 0.4);
        oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
      });
    } catch {}
  }

  function celebrate(options: CelebrationOptions = {}) {
    chime(options.sound ?? 'success');
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    void confetti({ particleCount: 65, spread: 65, startVelocity: 28, gravity: 1, origin: options.origin ?? { y: 0.55 }, colors: options.colors ?? colors, disableForReducedMotion: true });
  }

  return <AdventureContext.Provider value={{ musicPlaying, chime, celebrate }}>{children}</AdventureContext.Provider>;
}

export function useAdventure() {
  const effects = useContext(AdventureContext);
  if (!effects) throw new Error('Las interacciones necesitan AdventureProvider.');
  return effects;
}