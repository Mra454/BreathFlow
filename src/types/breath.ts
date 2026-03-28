export type PhaseType = 'inhale' | 'inhale2' | 'exhale' | 'hold' | 'rest';

export interface BreathPhase {
  key: string;
  label: string;
  durationSec: number;
  phaseType: PhaseType;
  levelFrom: number;
  levelTo: number;
}

export interface ResolvedBreathPhase extends BreathPhase {
  durationMs: number;
}

export type AudioPalette = 'box' | 'coherent' | 'extended' | 'sigh' | 'sleep' | 'generic';

export interface BreathPattern {
  id: string;
  name: string;
  tagline: string;
  purpose: string;
  intent: string;
  cadenceLabel: string;
  defaultSessionMinutes: number;
  descriptor: string;
  safetyNote?: string;
  audioPalette: AudioPalette;
  phases: BreathPhase[];
}

export interface ResolvedBreathPattern extends Omit<BreathPattern, 'phases'> {
  phases: ResolvedBreathPhase[];
  sessionLengthMs: number;
  cycleDurationMs: number;
}

export interface SessionSettings {
  sessionMinutes: number;
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  highContrast: boolean;
  beginnerMode: boolean;
  themeMode: 'night' | 'mist';
  volume: number;
  phaseDurations: Record<string, number>;
}

export type BreathEngineStatus = 'idle' | 'running' | 'paused' | 'completed';

export interface BreathEngineSnapshot {
  status: BreathEngineStatus;
  phaseIndex: number;
  cycleIndex: number;
  sessionElapsedMs: number;
  sessionRemainingMs: number;
  sessionProgress: number;
  phaseElapsedMs: number;
  phaseRemainingMs: number;
  phaseProgress: number;
  cycleProgress: number;
  currentLevel: number;
  animationToken: number;
  phaseInstanceKey: string;
  currentPhase: ResolvedBreathPhase;
}

export interface ResolvedPalette {
  name: 'night' | 'mist';
  background: string;
  backgroundAlt: string;
  text: string;
  subtext: string;
  border: string;
  surface: string;
  surfaceStrong: string;
  overlay: string;
  accent: string;
  accentSoft: string;
  accent2: string;
  orbGlow: string;
  orbCore: string;
}

export interface VisualizationProps {
  phaseLabel: string;
  currentLevel: number;
  levelTo: number;
  phaseRemainingMs: number;
  cycleProgress?: number;
  animationToken: number;
  isRunning: boolean;
  reducedMotion: boolean;
  palette: ResolvedPalette;
}
