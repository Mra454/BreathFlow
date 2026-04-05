import {
  BreathPattern,
  BreathPhase,
  PatternCategory,
  ResolvedBreathPattern,
  SessionSettings,
} from '../types/breath';

// Helper to generate interleaved rapid phase pairs
function generateRapidPairs(
  inhalePhase: BreathPhase,
  exhalePhase: BreathPhase,
  count: number,
): BreathPhase[] {
  const pairs: BreathPhase[] = [];
  for (let i = 0; i < count; i++) {
    pairs.push({ ...inhalePhase });
    pairs.push({ ...exhalePhase });
  }
  return pairs;
}

export const BREATH_PATTERNS: BreathPattern[] = [
  // ─── Calm & Sleep ───
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
    safetyTier: 'green',
    category: 'calm-sleep',
    phases: [
      { key: 'inhale', label: 'Inhale', durationSec: 4, phaseType: 'inhale', levelFrom: 0.12, levelTo: 1 },
      { key: 'exhale', label: 'Exhale', durationSec: 6, phaseType: 'exhale', levelFrom: 1, levelTo: 0.12 },
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
    safetyTier: 'yellow',
    category: 'calm-sleep',
    beginnerOverrides: { 'inhale': 3, 'hold-top': 5, 'exhale': 6 },
    phases: [
      { key: 'inhale', label: 'Inhale', durationSec: 4, phaseType: 'inhale', levelFrom: 0.1, levelTo: 1 },
      { key: 'hold-top', label: 'Hold', durationSec: 7, phaseType: 'hold', levelFrom: 1, levelTo: 1 },
      { key: 'exhale', label: 'Exhale', durationSec: 8, phaseType: 'exhale', levelFrom: 1, levelTo: 0.1 },
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
    safetyTier: 'green',
    category: 'calm-sleep',
    phases: [
      { key: 'inhale', label: 'Inhale', durationSec: 5, phaseType: 'inhale', levelFrom: 0.12, levelTo: 1 },
      { key: 'exhale', label: 'Exhale', durationSec: 5, phaseType: 'exhale', levelFrom: 1, levelTo: 0.12 },
    ],
  },
  {
    id: 'two-to-one',
    name: '2:1 Ratio',
    tagline: 'Exhale twice as long as you inhale.',
    purpose: 'Deep parasympathetic activation through extended exhalation.',
    intent: 'Calm',
    cadenceLabel: '4-8',
    defaultSessionMinutes: 5,
    descriptor: 'Deep calm',
    audioPalette: 'extended',
    safetyTier: 'green',
    category: 'calm-sleep',
    phases: [
      { key: 'inhale', label: 'Inhale', durationSec: 4, phaseType: 'inhale', levelFrom: 0.1, levelTo: 1 },
      { key: 'exhale', label: 'Exhale', durationSec: 8, phaseType: 'exhale', levelFrom: 1, levelTo: 0.1 },
    ],
  },
  {
    id: 'bee-breath',
    name: 'Bee Breath',
    tagline: 'Hum your way to stillness.',
    purpose: 'Vibration and humming activate the vagus nerve for deep calm. Hum audibly on the exhale.',
    intent: 'Calm',
    cadenceLabel: '4-10',
    defaultSessionMinutes: 5,
    descriptor: 'Humming calm',
    audioPalette: 'bee',
    safetyTier: 'green',
    category: 'calm-sleep',
    phases: [
      { key: 'inhale', label: 'Inhale', durationSec: 4, phaseType: 'inhale', levelFrom: 0.1, levelTo: 1 },
      { key: 'exhale', label: 'Hum', durationSec: 10, phaseType: 'exhale', levelFrom: 1, levelTo: 0.1 },
    ],
  },

  // ─── Focus & Performance ───
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
    safetyTier: 'green',
    category: 'focus-performance',
    phases: [
      { key: 'inhale', label: 'Inhale', durationSec: 4, phaseType: 'inhale', levelFrom: 0.1, levelTo: 1 },
      { key: 'hold-top', label: 'Hold', durationSec: 4, phaseType: 'hold', levelFrom: 1, levelTo: 1 },
      { key: 'exhale', label: 'Exhale', durationSec: 4, phaseType: 'exhale', levelFrom: 1, levelTo: 0.1 },
      { key: 'hold-bottom', label: 'Hold', durationSec: 4, phaseType: 'rest', levelFrom: 0.1, levelTo: 0.1 },
    ],
  },
  {
    id: 'triangle',
    name: 'Triangle Breathing',
    tagline: 'Three-phase focus without the bottom hold.',
    purpose: 'A gentler structured pattern for people who find box breathing\'s bottom hold uncomfortable.',
    intent: 'Focus',
    cadenceLabel: '5-5-5',
    defaultSessionMinutes: 4,
    descriptor: 'Gentle focus',
    audioPalette: 'box',
    safetyTier: 'green',
    category: 'focus-performance',
    phases: [
      { key: 'inhale', label: 'Inhale', durationSec: 5, phaseType: 'inhale', levelFrom: 0.1, levelTo: 1 },
      { key: 'hold-top', label: 'Hold', durationSec: 5, phaseType: 'hold', levelFrom: 1, levelTo: 1 },
      { key: 'exhale', label: 'Exhale', durationSec: 5, phaseType: 'exhale', levelFrom: 1, levelTo: 0.1 },
    ],
  },
  {
    id: 'grounding',
    name: 'Grounding Breath',
    tagline: 'Asymmetric box for anxious moments.',
    purpose: 'Combines box breathing structure with extended exhale emphasis for grounding during acute anxiety.',
    intent: 'Focus',
    cadenceLabel: '4-4-6-2',
    defaultSessionMinutes: 4,
    descriptor: 'Anxiety ground',
    audioPalette: 'box',
    safetyTier: 'green',
    category: 'focus-performance',
    phases: [
      { key: 'inhale', label: 'Inhale', durationSec: 4, phaseType: 'inhale', levelFrom: 0.1, levelTo: 1 },
      { key: 'hold-top', label: 'Hold', durationSec: 4, phaseType: 'hold', levelFrom: 1, levelTo: 1 },
      { key: 'exhale', label: 'Exhale', durationSec: 6, phaseType: 'exhale', levelFrom: 1, levelTo: 0.1 },
      { key: 'rest', label: 'Rest', durationSec: 2, phaseType: 'rest', levelFrom: 0.1, levelTo: 0.1 },
    ],
  },

  // ─── Energy & Activation ───
  {
    id: 'wim-hof',
    name: 'Wim Hof Power Breathing',
    tagline: '30 deep breaths, then hold.',
    purpose: 'Alkalosis-inducing power breathing for energy, resilience, and altered-state exploration.',
    intent: 'Energy',
    cadenceLabel: '30×(2.5) + hold + recovery',
    defaultSessionMinutes: 7,
    descriptor: 'Power round',
    audioPalette: 'energy',
    safetyTier: 'red',
    category: 'energy-activation',
    safetyNote: 'Never practice in water, while driving, or standing. Contraindicated for epilepsy, pregnancy, and cardiovascular conditions. Tingling and lightheadedness are normal. Stop if you feel faint.',
    beginnerOverrides: { 'rapid-inhale': 2, 'rapid-exhale': 1.5, 'hold-empty': 30, 'recovery-hold': 10 },
    beginnerCycleCount: 15,
    phases: [
      ...generateRapidPairs(
        { key: 'rapid-inhale', label: 'Inhale', durationSec: 1.5, phaseType: 'inhale', levelFrom: 0.2, levelTo: 0.8 },
        { key: 'rapid-exhale', label: 'Exhale', durationSec: 1, phaseType: 'exhale', levelFrom: 0.8, levelTo: 0.2 },
        30,
      ),
      { key: 'hold-empty', label: 'Hold (empty)', durationSec: 60, phaseType: 'rest', levelFrom: 0.05, levelTo: 0.05, skippable: true },
      { key: 'recovery-inhale', label: 'Recovery', durationSec: 3, phaseType: 'inhale', levelFrom: 0.05, levelTo: 1 },
      { key: 'recovery-hold', label: 'Recovery hold', durationSec: 15, phaseType: 'hold', levelFrom: 1, levelTo: 1 },
    ],
  },
  {
    id: 'kapalabhati',
    name: 'Kapalabhati',
    tagline: 'Rapid exhale pulses for energy.',
    purpose: 'Sharp, forceful exhales with passive inhales. Clears the mind and activates the core.',
    intent: 'Energy',
    cadenceLabel: '30×(1) + rest',
    defaultSessionMinutes: 5,
    descriptor: 'Breath pulses',
    audioPalette: 'energy',
    safetyTier: 'red',
    category: 'energy-activation',
    safetyNote: 'Contraindicated for pregnancy, hernia, recent abdominal surgery, epilepsy, and uncontrolled hypertension. Practice on an empty stomach.',
    beginnerOverrides: { 'rapid-exhale': 0.7, 'rapid-inhale': 0.7, 'rest': 8 },
    beginnerCycleCount: 15,
    phases: [
      { key: 'prep-inhale', label: 'Breathe in', durationSec: 3, phaseType: 'inhale', levelFrom: 0.1, levelTo: 0.6 },
      ...generateRapidPairs(
        { key: 'rapid-exhale', label: 'Pulse out', durationSec: 0.5, phaseType: 'exhale', levelFrom: 0.6, levelTo: 0.2 },
        { key: 'rapid-inhale', label: 'In', durationSec: 0.5, phaseType: 'inhale', levelFrom: 0.2, levelTo: 0.6 },
        30,
      ),
      { key: 'rest', label: 'Rest', durationSec: 5, phaseType: 'rest', levelFrom: 0.3, levelTo: 0.3 },
    ],
  },
  {
    id: 'breath-of-fire',
    name: 'Breath of Fire',
    tagline: 'Rapid equal breathing for inner heat.',
    purpose: 'Continuous rapid breathing from the Kundalini yoga tradition. Builds energy and core heat.',
    intent: 'Energy',
    cadenceLabel: 'continuous rapid',
    defaultSessionMinutes: 3,
    descriptor: 'Inner fire',
    audioPalette: 'energy',
    safetyTier: 'red',
    category: 'energy-activation',
    safetyNote: 'Same precautions as Kapalabhati. Start with 30 seconds and build up. Stop if dizzy.',
    beginnerOverrides: { 'rapid-inhale': 0.6, 'rapid-exhale': 0.6 },
    phases: [
      { key: 'rapid-inhale', label: 'In', durationSec: 0.4, phaseType: 'inhale', levelFrom: 0.2, levelTo: 0.7 },
      { key: 'rapid-exhale', label: 'Out', durationSec: 0.4, phaseType: 'exhale', levelFrom: 0.7, levelTo: 0.2 },
    ],
  },
  {
    id: 'lions-breath',
    name: "Lion's Breath",
    tagline: 'Roar out the tension.',
    purpose: 'Forceful exhale with face and tongue engagement. Releases jaw, throat, and facial tension.',
    intent: 'Energy',
    cadenceLabel: '4-4',
    defaultSessionMinutes: 3,
    descriptor: 'Tension release',
    audioPalette: 'generic',
    safetyTier: 'green',
    category: 'energy-activation',
    phases: [
      { key: 'inhale', label: 'Inhale', durationSec: 4, phaseType: 'inhale', levelFrom: 0.1, levelTo: 1 },
      { key: 'exhale', label: 'Roar', durationSec: 4, phaseType: 'exhale', levelFrom: 1, levelTo: 0.1 },
    ],
  },

  // ─── Balance & Wellness ───
  {
    id: 'equal',
    name: 'Equal Breathing',
    tagline: 'Beginner-friendly symmetry.',
    purpose: 'For users who want a clean and accessible pace without breath holds.',
    intent: 'Balance',
    cadenceLabel: '4-4',
    defaultSessionMinutes: 4,
    descriptor: 'Beginner rhythm',
    audioPalette: 'generic',
    safetyTier: 'green',
    category: 'balance-wellness',
    phases: [
      { key: 'inhale', label: 'Inhale', durationSec: 4, phaseType: 'inhale', levelFrom: 0.12, levelTo: 1 },
      { key: 'exhale', label: 'Exhale', durationSec: 4, phaseType: 'exhale', levelFrom: 1, levelTo: 0.12 },
    ],
  },
  {
    id: 'alternate-nostril',
    name: 'Alternate Nostril',
    tagline: 'Balance through alternating flow.',
    purpose: 'Traditional Nadi Shodhana pranayama. Balances the nervous system and calms the mind. Close right nostril → inhale left. Close left → exhale right. Inhale right. Close right → exhale left. That is one cycle.',
    intent: 'Balance',
    cadenceLabel: '4-4-4-4',
    defaultSessionMinutes: 5,
    descriptor: 'Nostril balance',
    audioPalette: 'coherent',
    safetyTier: 'green',
    category: 'balance-wellness',
    phases: [
      { key: 'inhale-left', label: 'In (left)', durationSec: 4, phaseType: 'inhale', levelFrom: 0.1, levelTo: 1 },
      { key: 'exhale-right', label: 'Out (right)', durationSec: 4, phaseType: 'exhale', levelFrom: 1, levelTo: 0.1 },
      { key: 'inhale-right', label: 'In (right)', durationSec: 4, phaseType: 'inhale', levelFrom: 0.1, levelTo: 1 },
      { key: 'exhale-left', label: 'Out (left)', durationSec: 4, phaseType: 'exhale', levelFrom: 1, levelTo: 0.1 },
    ],
  },
  {
    id: 'sitali',
    name: 'Sitali Cooling Breath',
    tagline: 'Cool inhale, warm exhale.',
    purpose: 'Inhale through a curled tongue (or teeth) to cool the body. Reduces frustration and overheating.',
    intent: 'Balance',
    cadenceLabel: '5-5',
    defaultSessionMinutes: 4,
    descriptor: 'Cooling breath',
    audioPalette: 'coherent',
    safetyTier: 'green',
    category: 'balance-wellness',
    phases: [
      { key: 'inhale', label: 'Cool in', durationSec: 5, phaseType: 'inhale', levelFrom: 0.12, levelTo: 1 },
      { key: 'exhale', label: 'Warm out', durationSec: 5, phaseType: 'exhale', levelFrom: 1, levelTo: 0.12 },
    ],
  },
  {
    id: 'resonant',
    name: 'Resonant Breathing',
    tagline: 'Optimal heart rate variability pace.',
    purpose: 'Slower than coherent breathing, tuned to ~4.6 breaths per minute for maximum HRV.',
    intent: 'Balance',
    cadenceLabel: '6.5-6.5',
    defaultSessionMinutes: 5,
    descriptor: 'HRV optimal',
    audioPalette: 'coherent',
    safetyTier: 'green',
    category: 'balance-wellness',
    phases: [
      { key: 'inhale', label: 'Inhale', durationSec: 6.5, phaseType: 'inhale', levelFrom: 0.12, levelTo: 1 },
      { key: 'exhale', label: 'Exhale', durationSec: 6.5, phaseType: 'exhale', levelFrom: 1, levelTo: 0.12 },
    ],
  },

  // ─── Therapeutic ───
  {
    id: 'pursed-lip',
    name: 'Pursed Lip Breathing',
    tagline: 'Slow exhale through pursed lips.',
    purpose: 'Clinically recommended for COPD and exercise recovery. Creates back-pressure that keeps airways open longer.',
    intent: 'Calm',
    cadenceLabel: '2-5',
    defaultSessionMinutes: 5,
    descriptor: 'Airway support',
    audioPalette: 'extended',
    safetyTier: 'green',
    category: 'therapeutic',
    phases: [
      { key: 'inhale', label: 'Nose in', durationSec: 2, phaseType: 'inhale', levelFrom: 0.15, levelTo: 1 },
      { key: 'exhale', label: 'Lips out', durationSec: 5, phaseType: 'exhale', levelFrom: 1, levelTo: 0.15 },
    ],
  },
  {
    id: 'buteyko',
    name: 'Buteyko Breathing',
    tagline: 'Breathe less, not more.',
    purpose: 'Gentle nasal breathing with an extended pause to build CO2 tolerance. Useful for asthma management and reducing chronic hyperventilation.',
    intent: 'Calm',
    cadenceLabel: '3-3-pause',
    defaultSessionMinutes: 5,
    descriptor: 'CO2 tolerance',
    audioPalette: 'generic',
    safetyTier: 'yellow',
    category: 'therapeutic',
    safetyNote: 'The air hunger during the pause is intentional but should never become distressing. Reduce the pause if uncomfortable.',
    beginnerOverrides: { 'pause': 5 },
    phases: [
      { key: 'inhale', label: 'Gentle in', durationSec: 3, phaseType: 'inhale', levelFrom: 0.15, levelTo: 0.6 },
      { key: 'exhale', label: 'Gentle out', durationSec: 3, phaseType: 'exhale', levelFrom: 0.6, levelTo: 0.15 },
      { key: 'pause', label: 'Pause', durationSec: 10, phaseType: 'rest', levelFrom: 0.1, levelTo: 0.1 },
    ],
  },
  {
    id: 'staircase',
    name: 'Staircase Breathing',
    tagline: 'Inhale in steps, exhale smoothly.',
    purpose: 'Segmented inhale builds lung awareness. Each step fills a different zone: belly, ribs, chest.',
    intent: 'Calm',
    cadenceLabel: '2-2-2-6',
    defaultSessionMinutes: 4,
    descriptor: 'Segmented fill',
    audioPalette: 'generic',
    safetyTier: 'green',
    category: 'therapeutic',
    phases: [
      { key: 'inhale-belly', label: 'Belly', durationSec: 2, phaseType: 'inhale', levelFrom: 0.1, levelTo: 0.4 },
      { key: 'inhale-ribs', label: 'Ribs', durationSec: 2, phaseType: 'inhale', levelFrom: 0.4, levelTo: 0.7 },
      { key: 'inhale-chest', label: 'Chest', durationSec: 2, phaseType: 'inhale', levelFrom: 0.7, levelTo: 1 },
      { key: 'exhale', label: 'Exhale', durationSec: 6, phaseType: 'exhale', levelFrom: 1, levelTo: 0.1 },
    ],
  },

  // ─── Quick Reset ───
  {
    id: 'physiological-sigh',
    name: 'Quick Reset',
    tagline: 'Quick reset with a double inhale.',
    purpose: 'A brief reset pattern for acute tension or transitions between tasks.',
    intent: 'Reset',
    cadenceLabel: '2-1-6',
    defaultSessionMinutes: 3,
    descriptor: 'Fast reset',
    safetyNote: 'Some people dislike rapid top-up inhales. Keep it gentle and skip if it feels activating.',
    audioPalette: 'sigh',
    safetyTier: 'green',
    category: 'quick-reset',
    phases: [
      { key: 'inhale-primary', label: 'Nose in', durationSec: 2, phaseType: 'inhale', levelFrom: 0.1, levelTo: 0.78 },
      { key: 'inhale-topup', label: 'Sip', durationSec: 1, phaseType: 'inhale2', levelFrom: 0.78, levelTo: 1 },
      { key: 'exhale', label: 'Mouth out', durationSec: 6, phaseType: 'exhale', levelFrom: 1, levelTo: 0.1 },
    ],
  },
];

export const CATEGORY_META: Record<PatternCategory, { displayName: string; description: string }> = {
  'calm-sleep': { displayName: 'Calm & Sleep', description: 'Wind-down, parasympathetic activation, sleep induction' },
  'focus-performance': { displayName: 'Focus & Performance', description: 'Structured patterns for concentration and pre-performance centering' },
  'energy-activation': { displayName: 'Energy & Activation', description: 'Sympathetic activation, alertness, physical warm-up' },
  'balance-wellness': { displayName: 'Balance & Wellness', description: 'General regulation, equilibrium, daily maintenance' },
  'therapeutic': { displayName: 'Therapeutic', description: 'Clinically-informed patterns for respiratory health' },
  'quick-reset': { displayName: 'Quick Reset', description: 'Single-breath or sub-minute interventions' },
};

export const CATEGORY_ORDER: PatternCategory[] = [
  'calm-sleep',
  'focus-performance',
  'energy-activation',
  'balance-wellness',
  'therapeutic',
  'quick-reset',
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
  // Step 1: Apply beginner cycle truncation if applicable
  let workingPhases = [...pattern.phases];

  if (settings.beginnerMode && pattern.beginnerCycleCount !== undefined) {
    // Identify contiguous rapid block boundaries
    const rapidIndices: number[] = [];
    for (let i = 0; i < workingPhases.length; i++) {
      if (workingPhases[i].key.startsWith('rapid-')) {
        rapidIndices.push(i);
      }
    }

    if (rapidIndices.length > 0) {
      const rapidStart = rapidIndices[0];
      const rapidEnd = rapidIndices[rapidIndices.length - 1];
      const targetCount = pattern.beginnerCycleCount * 2; // pairs -> individual phases

      const beforeRapid = workingPhases.slice(0, rapidStart);
      const rapidBlock = workingPhases.slice(rapidStart, rapidEnd + 1);
      const afterRapid = workingPhases.slice(rapidEnd + 1);

      const truncatedRapid = rapidBlock.slice(0, targetCount);

      workingPhases = [...beforeRapid, ...truncatedRapid, ...afterRapid];
    }
  }

  // Step 2: Apply duration overrides with correct precedence
  const phases = workingPhases.map((phase) => {
    // Start with default
    let durationSec = phase.durationSec;

    // Apply beginner overrides if applicable
    if (settings.beginnerMode && pattern.beginnerOverrides && pattern.beginnerOverrides[phase.key] !== undefined) {
      durationSec = pattern.beginnerOverrides[phase.key];
    }

    // User phaseDurations always win
    if (settings.phaseDurations[phase.key] !== undefined) {
      durationSec = settings.phaseDurations[phase.key];
    }

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
