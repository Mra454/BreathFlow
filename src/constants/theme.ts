import { Easing } from 'react-native-reanimated';
import type { ResolvedPalette } from '../types/breath';

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 999,
} as const;

// ─── Typography ───
// DM Sans: geometric, modern, tall x-height — calm and precise.
// Two weights only (Rule 22, 43): regular for body, semibold for emphasis.
export const typography = {
  regular: { fontFamily: 'DMSans-Regular', fontWeight: '400' as const },
  medium: { fontFamily: 'DMSans-Medium', fontWeight: '500' as const },
  semibold: { fontFamily: 'DMSans-SemiBold', fontWeight: '600' as const },
} as const;

// ─── Motion tokens ───
// Breathing: meditative, symmetric in/out — used for all breath visualizations.
// Inhale: accelerates smoothly into full expansion.
// Exhale: gentle deceleration for the release.
// Enter/Exit: UI elements appearing and disappearing.
export const motion = {
  inhaleEasing: Easing.bezier(0.4, 0.0, 0.2, 1),
  exhaleEasing: Easing.bezier(0.0, 0.0, 0.2, 1),
  holdEasing: Easing.inOut(Easing.sin),
  enterEasing: Easing.out(Easing.cubic),
  exitEasing: Easing.in(Easing.cubic),
  pressDuration: 80,
  pressScale: 0.96,
  transitionDuration: 250,
  staggerDelay: 50,
  holdThreshold: 0.05,
  holdMicroDrift: 0.003,
  holdDuration: 1500,
} as const;

// ─── Animation scale constants ───
// Orb: contracts to 72% and expands to 106% — feels natural without disappearing.
// Aura: wider range (95%→145%) for the atmospheric glow ring.
export const breathScale = {
  orbMin: 0.72,
  orbMax: 1.06,
  orbOpacityMin: 0.75,
  orbOpacityMax: 1,
  auraMin: 0.95,
  auraMax: 1.45,
  auraOpacityMin: 0.08,
  auraOpacityMax: 0.28,
  // Rings: each ring expands progressively more than the last.
  ring0ScaleMin: 0.72,
  ring0ScaleMax: 1.08,
  ring1ScaleMin: 0.77,
  ring1ScaleMax: 1.21,
  ring2ScaleMin: 0.82,
  ring2ScaleMax: 1.34,
  ringOpacityMin: 0.18,
  ring0OpacityMax: 0.34,
  ring1OpacityMax: 0.28,
  ring2OpacityMax: 0.22,
  coreMin: 0.85,
  coreMax: 1.05,
  // Square path: inner square breathes subtly.
  squareMin: 0.76,
  squareMax: 1.04,
  squareOpacityMin: 0.62,
  squareOpacityMax: 1,
} as const;

const nightPalette: ResolvedPalette = {
  name: 'night',
  background: '#021C2E',
  backgroundAlt: '#032D45',
  text: '#F0F4F1',
  subtext: '#7c9885',
  border: '#0E3A4E',
  surface: '#042F4A',
  surfaceStrong: '#053550',
  overlay: 'rgba(2,28,46,0.85)',
  accent: '#28666e',
  accentSoft: '#0E3A4E',
  accent2: '#fedc97',
  orbGlow: 'rgba(40,102,110,0.3)',
  orbCore: '#28666e',
  buttonText: '#07111F',
  buttonTextInverse: '#FFFFFF',
};

const mistPalette: ResolvedPalette = {
  name: 'mist',
  background: '#EEF2ED',
  backgroundAlt: '#E2E8E0',
  text: '#033f63',
  subtext: '#5A7A6A',
  border: '#C8D4C0',
  surface: '#F4F7F3',
  surfaceStrong: '#FFFFFF',
  overlay: 'rgba(3,63,99,0.25)',
  accent: '#28666e',
  accentSoft: '#D0E0D8',
  accent2: '#b5b682',
  orbGlow: 'rgba(124,152,133,0.5)',
  orbCore: '#7c9885',
  buttonText: '#FFFFFF',
  buttonTextInverse: '#07111F',
};

export function getPalette(mode: 'night' | 'mist'): ResolvedPalette {
  return mode === 'mist' ? mistPalette : nightPalette;
}
