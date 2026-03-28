import {
  BreathPattern,
  ResolvedBreathPattern,
  SessionSettings,
} from '../types/breath';

export const BREATH_PATTERNS: BreathPattern[] = [
  {
    id: 'box',
    name: 'Box Breathing',
    tagline: 'Steady structure for calm focus.',
    purpose: 'Balanced regulation when you want the mind to settle without going sleepy.',
    intent: 'Focus',
    cadenceLabel: '4-4-4-4',
    defaultSessionMinutes: 4,
    descriptor: 'Calm + Focus',
    audioPalette: 'box',
    phases: [
      { key: 'inhale', label: 'Inhale', durationSec: 4, phaseType: 'inhale', levelFrom: 0.1, levelTo: 1 },
      { key: 'hold-top', label: 'Hold', durationSec: 4, phaseType: 'hold', levelFrom: 1, levelTo: 1 },
      { key: 'exhale', label: 'Exhale', durationSec: 4, phaseType: 'exhale', levelFrom: 1, levelTo: 0.1 },
      { key: 'hold-bottom', label: 'Hold', durationSec: 4, phaseType: 'rest', levelFrom: 0.1, levelTo: 0.1 },
    ],
  },
  {
    id: 'coherent',
    name: 'Coherent Breathing',
    tagline: 'A smooth 5-and-5 rhythm.',
    purpose: 'Useful for gentle downshifting and attention steadiness with minimal complexity.',
    intent: 'Calm',
    cadenceLabel: '5-5',
    defaultSessionMinutes: 5,
    descriptor: 'Calm + Balance',
    audioPalette: 'coherent',
    phases: [
      { key: 'inhale', label: 'Inhale', durationSec: 5, phaseType: 'inhale', levelFrom: 0.12, levelTo: 1 },
      { key: 'exhale', label: 'Exhale', durationSec: 5, phaseType: 'exhale', levelFrom: 1, levelTo: 0.12 },
    ],
  },
  {
    id: 'extended-exhale',
    name: 'Extended Exhale',
    tagline: 'Longer out-breath for downregulation.',
    purpose: 'A simple calming pattern that nudges the session toward unwinding rather than energizing.',
    intent: 'Calm',
    cadenceLabel: '4-6',
    defaultSessionMinutes: 4,
    descriptor: 'Stress reset',
    audioPalette: 'extended',
    phases: [
      { key: 'inhale', label: 'Inhale', durationSec: 4, phaseType: 'inhale', levelFrom: 0.12, levelTo: 1 },
      { key: 'exhale', label: 'Exhale', durationSec: 6, phaseType: 'exhale', levelFrom: 1, levelTo: 0.12 },
    ],
  },
  {
    id: 'equal',
    name: 'Equal Breathing',
    tagline: 'Beginner-friendly symmetry.',
    purpose: 'For users who want a clean and accessible pace without breath holds.',
    intent: 'Focus',
    cadenceLabel: '4-4',
    defaultSessionMinutes: 4,
    descriptor: 'Beginner rhythm',
    audioPalette: 'generic',
    phases: [
      { key: 'inhale', label: 'Inhale', durationSec: 4, phaseType: 'inhale', levelFrom: 0.12, levelTo: 1 },
      { key: 'exhale', label: 'Exhale', durationSec: 4, phaseType: 'exhale', levelFrom: 1, levelTo: 0.12 },
    ],
  },
  {
    id: 'physiological-sigh',
    name: 'Physiological Sigh',
    tagline: 'Quick reset with a double inhale.',
    purpose: 'A brief reset pattern for acute tension or transitions between tasks.',
    intent: 'Reset',
    cadenceLabel: '2-1-6',
    defaultSessionMinutes: 3,
    descriptor: 'Fast reset',
    safetyNote: 'Some people dislike rapid top-up inhales. Keep it gentle and skip if it feels activating.',
    audioPalette: 'sigh',
    phases: [
      { key: 'inhale-primary', label: 'Inhale', durationSec: 2, phaseType: 'inhale', levelFrom: 0.1, levelTo: 0.78 },
      { key: 'inhale-topup', label: 'Top-up', durationSec: 1, phaseType: 'inhale2', levelFrom: 0.78, levelTo: 1 },
      { key: 'exhale', label: 'Long exhale', durationSec: 6, phaseType: 'exhale', levelFrom: 1, levelTo: 0.1 },
    ],
  },
  {
    id: 'four-seven-eight',
    name: '4-7-8',
    tagline: 'Sleep-leaning cadence with holds.',
    purpose: 'Designed for evening use and slower downshifting, but best treated as an advanced option.',
    intent: 'Sleep',
    cadenceLabel: '4-7-8',
    defaultSessionMinutes: 4,
    descriptor: 'Sleep support',
    safetyNote: 'Long holds are not comfortable for everyone. Keep beginner mode on or shorten the hold.',
    audioPalette: 'sleep',
    phases: [
      { key: 'inhale', label: 'Inhale', durationSec: 4, phaseType: 'inhale', levelFrom: 0.1, levelTo: 1 },
      { key: 'hold-top', label: 'Hold', durationSec: 7, phaseType: 'hold', levelFrom: 1, levelTo: 1 },
      { key: 'exhale', label: 'Exhale', durationSec: 8, phaseType: 'exhale', levelFrom: 1, levelTo: 0.1 },
    ],
  },
];

export const DEFAULT_SETTINGS: SessionSettings = {
  sessionMinutes: 4,
  soundEnabled: true,
  hapticsEnabled: true,
  highContrast: false,
  beginnerMode: true,
  themeMode: 'night',
  volume: 0.65,
  phaseDurations: {},
};

export function getPatternById(id: string): BreathPattern | undefined {
  return BREATH_PATTERNS.find((pattern) => pattern.id === id);
}

export function getInitialSettings(pattern: BreathPattern): SessionSettings {
  return {
    ...DEFAULT_SETTINGS,
    sessionMinutes: pattern.defaultSessionMinutes,
    phaseDurations: Object.fromEntries(pattern.phases.map((phase) => [phase.key, phase.durationSec])),
  };
}

export function resolvePattern(
  pattern: BreathPattern,
  settings: SessionSettings,
): ResolvedBreathPattern {
  const phases = pattern.phases.map((phase) => {
    const durationSec = settings.phaseDurations[phase.key] ?? phase.durationSec;
    return {
      ...phase,
      durationSec,
      durationMs: durationSec * 1000,
    };
  });

  const cycleDurationMs = phases.reduce((sum, phase) => sum + phase.durationMs, 0);

  return {
    ...pattern,
    phases,
    sessionLengthMs: settings.sessionMinutes * 60 * 1000,
    cycleDurationMs,
  };
}
