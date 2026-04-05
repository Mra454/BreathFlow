import { useEffect, useMemo, useRef } from 'react';
import { Audio } from 'expo-av';
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
type PlayerMap = Partial<Record<CueName, Audio.Sound>>;

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

function getCueSequence(pattern: ResolvedBreathPattern, phaseKey: string, phaseType: string, durationSec: number): CueName[] {
  const count = Math.max(1, Math.round(durationSec));
  switch (pattern.audioPalette) {
    case 'box': {
      if (phaseKey === 'inhale') return spreadSequence(['pianoC4', 'pianoD4', 'pianoE4', 'pianoF4'], count);
      if (phaseKey === 'exhale') return spreadSequence(['pianoF4', 'pianoE4', 'pianoD4', 'pianoC4'], count);
      return repeats('click', count);
    }
    case 'coherent':
      return phaseKey === 'inhale' || phaseType === 'inhale' ? repeats('airyMid', count) : repeats('warmLow', count);
    case 'extended':
      return phaseType === 'inhale' ? repeats('airyHigh', count) : repeats('warmMid', count);
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
    case 'energy': {
      // Rest phase with key 'rest' (Kapalabhati rest): silent
      if (phaseKey === 'rest') return [];
      // Inhale/exhale: click
      if (phaseType === 'inhale' || phaseType === 'exhale') return repeats('click', count);
      // Hold (phaseType 'hold'): warmLow spread
      if (phaseType === 'hold') return spreadSequence(['warmLow'], count);
      // hold-empty (key 'hold-empty', phaseType 'rest'): sparse warmLow at 1 per 15s
      if (phaseKey === 'hold-empty') {
        const sparseCount = Math.max(1, Math.floor(durationSec / 15));
        return repeats('warmLow', sparseCount);
      }
      return repeats('click', count);
    }
    case 'bee': {
      if (phaseType === 'inhale' || phaseType === 'inhale2') return repeats('airyHigh', count);
      // Exhale (hum): warmLow spread at 1 per second
      return repeats('warmLow', count);
    }
    default:
      return phaseType === 'inhale' ? repeats('airyMid', count) : repeats('warmLow', count);
  }
}

export function useBreathAudio(
  pattern: ResolvedBreathPattern,
  snapshot: BreathEngineSnapshot,
  settings: SessionSettings,
) {
  const playersRef = useRef<PlayerMap>({});
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const firedPhasesRef = useRef<Set<string>>(new Set());

  const currentPhase = snapshot.currentPhase;
  const isRapidPhase = currentPhase.durationSec < 1.5;

  const phaseSequence = useMemo(
    () =>
      getCueSequence(
        pattern,
        currentPhase.key,
        currentPhase.phaseType,
        currentPhase.durationSec,
      ),
    [pattern, currentPhase.durationSec, currentPhase.key, currentPhase.phaseType],
  );

  useEffect(() => {
    let mounted = true;

    Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
    }).catch(() => undefined);

    // Load all sounds
    const players: PlayerMap = {};
    const loadAll = async () => {
      for (const key of Object.keys(audioSources) as CueName[]) {
        try {
          const { sound } = await Audio.Sound.createAsync(audioSources[key], {
            volume: settings.soundEnabled ? settings.volume : 0,
          });
          if (mounted) {
            players[key] = sound;
          } else {
            sound.unloadAsync();
          }
        } catch (_e) {
          // ignore load errors
        }
      }
      if (mounted) playersRef.current = players;
    };
    loadAll();

    return () => {
      mounted = false;
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
      Object.values(players).forEach((sound) => sound?.unloadAsync());
      playersRef.current = {};
    };
  }, []);

  useEffect(() => {
    const vol = settings.soundEnabled ? settings.volume : 0;
    Object.values(playersRef.current).forEach((sound) => {
      sound?.setVolumeAsync(vol).catch(() => undefined);
    });
  }, [settings.soundEnabled, settings.volume]);

  // Clear firedPhases on session reset (idle/completed status)
  useEffect(() => {
    if (snapshot.status === 'idle' || snapshot.status === 'completed') {
      firedPhasesRef.current.clear();
    }
  }, [snapshot.status]);

  // Clear firedPhases when a non-rapid phase plays
  useEffect(() => {
    if (!isRapidPhase && firedPhasesRef.current.size > 0) {
      firedPhasesRef.current.clear();
    }
  }, [isRapidPhase, snapshot.phaseInstanceKey]);

  // Haptics — only on phase transitions, not every tick
  const lastHapticPhaseRef = useRef('');
  useEffect(() => {
    if (snapshot.status === 'running' && settings.hapticsEnabled && snapshot.phaseInstanceKey !== lastHapticPhaseRef.current) {
      lastHapticPhaseRef.current = snapshot.phaseInstanceKey;
      Haptics.selectionAsync().catch(() => undefined);
    }
  }, [snapshot.phaseInstanceKey, snapshot.status, settings.hapticsEnabled]);

  // Play one click at each phase transition only
  const lastPlayedPhaseRef = useRef('');
  useEffect(() => {
    if (snapshot.status !== 'running') return;
    if (!settings.soundEnabled) return;
    if (snapshot.phaseInstanceKey === lastPlayedPhaseRef.current) return;

    lastPlayedPhaseRef.current = snapshot.phaseInstanceKey;
    const player = playersRef.current['click'];
    if (player) {
      player.setPositionAsync(0).then(() => player.playAsync()).catch(() => undefined);
    }
  }, [snapshot.phaseInstanceKey, snapshot.status, settings.soundEnabled]);
}
