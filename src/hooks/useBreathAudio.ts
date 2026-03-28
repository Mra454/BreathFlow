import { useEffect, useMemo, useRef } from 'react';
import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import * as Haptics from 'expo-haptics';
import { BreathEngineSnapshot, ResolvedBreathPattern, SessionSettings } from '../types/breath';

const audioSources = {
  click: require('../../assets/audio/metronome_click.wav'),
  pianoC4: require('../../assets/audio/piano_c4.wav'),
  pianoD4: require('../../assets/audio/piano_d4.wav'),
  pianoE4: require('../../assets/audio/piano_e4.wav'),
  pianoF4: require('../../assets/audio/piano_f4.wav'),
  warmLow: require('../../assets/audio/warm_low.wav'),
  warmMid: require('../../assets/audio/warm_mid.wav'),
  airyHigh: require('../../assets/audio/airy_high.wav'),
  airyMid: require('../../assets/audio/airy_mid.wav'),
} as const;

type CueName = keyof typeof audioSources;
type PlayerMap = Partial<Record<CueName, ReturnType<typeof createAudioPlayer>>>;

function spreadSequence(base: CueName[], count: number): CueName[] {
  if (count <= 0) return [];
  if (count === 1) return [base[0]];
  return Array.from({ length: count }, (_, index) => {
    const position = Math.round((index / Math.max(1, count - 1)) * (base.length - 1));
    return base[position];
  });
}

function repeats(cue: CueName, count: number): CueName[] {
  return Array.from({ length: count }, () => cue);
}

function getCueSequence(pattern: ResolvedBreathPattern, phaseKey: string, durationSec: number): CueName[] {
  const count = Math.max(1, Math.round(durationSec));
  switch (pattern.audioPalette) {
    case 'box': {
      if (phaseKey === 'inhale') return spreadSequence(['pianoC4', 'pianoD4', 'pianoE4', 'pianoF4'], count);
      if (phaseKey === 'exhale') return spreadSequence(['pianoF4', 'pianoE4', 'pianoD4', 'pianoC4'], count);
      return repeats('click', count);
    }
    case 'coherent':
      return phaseKey === 'inhale' ? repeats('airyMid', count) : repeats('warmLow', count);
    case 'extended':
      return phaseKey === 'inhale' ? repeats('airyHigh', count) : repeats('warmMid', count);
    case 'sigh': {
      if (phaseKey === 'inhale-primary') return repeats('airyMid', count);
      if (phaseKey === 'inhale-topup') return repeats('airyHigh', count);
      return repeats('warmLow', count);
    }
    case 'sleep': {
      if (phaseKey === 'inhale') return repeats('airyMid', count);
      if (phaseKey === 'hold-top') return repeats('click', count);
      return spreadSequence(['warmMid', 'warmLow'], count);
    }
    default:
      return phaseKey === 'inhale' ? repeats('airyMid', count) : repeats('warmLow', count);
  }
}

export function useBreathAudio(
  pattern: ResolvedBreathPattern,
  snapshot: BreathEngineSnapshot,
  settings: SessionSettings,
) {
  const playersRef = useRef<PlayerMap>({});
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const phaseSequence = useMemo(
    () =>
      getCueSequence(
        pattern,
        snapshot.currentPhase.key,
        snapshot.currentPhase.durationSec,
      ),
    [pattern, snapshot.currentPhase.durationSec, snapshot.currentPhase.key],
  );

  useEffect(() => {
    let mounted = true;
    setAudioModeAsync({
      playsInSilentMode: true,
      interruptionMode: 'mixWithOthers',
      shouldPlayInBackground: false,
    }).catch(() => undefined);

    const players: PlayerMap = {};
    (Object.keys(audioSources) as CueName[]).forEach((key) => {
      const player = createAudioPlayer(audioSources[key]);
      player.volume = settings.soundEnabled ? settings.volume : 0;
      players[key] = player;
    });

    if (mounted) playersRef.current = players;

    return () => {
      mounted = false;
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
      Object.values(players).forEach((player) => player?.remove());
      playersRef.current = {};
    };
  }, []);

  useEffect(() => {
    Object.values(playersRef.current).forEach((player) => {
      if (player) {
        player.volume = settings.soundEnabled ? settings.volume : 0;
      }
    });
  }, [settings.soundEnabled, settings.volume]);

  useEffect(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    if (snapshot.status !== 'running') return;
    if (settings.hapticsEnabled) Haptics.selectionAsync().catch(() => undefined);
    if (!settings.soundEnabled) return;

    const nextBeat = Math.ceil(snapshot.phaseElapsedMs / 1000);
    phaseSequence.forEach((cue, beatIndex) => {
      if (beatIndex < nextBeat) return;
      const delay = Math.max(0, beatIndex * 1000 - snapshot.phaseElapsedMs);
      const timer = setTimeout(() => {
        const player = playersRef.current[cue];
        if (!player) return;
        player.seekTo(0);
        player.play();
      }, delay);
      timersRef.current.push(timer);
    });
    return () => {
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
    };
  }, [
    phaseSequence,
    settings.hapticsEnabled,
    settings.soundEnabled,
    snapshot.phaseElapsedMs,
    snapshot.phaseInstanceKey,
    snapshot.status,
  ]);
}
