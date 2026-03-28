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
  pill: 999,
} as const;

const nightPalette: ResolvedPalette = {
  name: 'night',
  background: '#0a0e14',
  backgroundAlt: '#0f1419',
  text: '#e6edf3',
  subtext: '#8b9cad',
  border: '#2d3748',
  surface: '#151b23',
  surfaceStrong: '#1a2129',
  overlay: 'rgba(0,0,0,0.6)',
  accent: '#5b9bd5',
  accentSoft: '#1e3a52',
  accent2: '#7ab0e0',
  orbGlow: 'rgba(91,155,213,0.25)',
  orbCore: '#2d4a66',
};

const mistPalette: ResolvedPalette = {
  name: 'mist',
  background: '#e8eef4',
  backgroundAlt: '#dce4ec',
  text: '#1a2332',
  subtext: '#4a5f7a',
  border: '#b8c8d8',
  surface: '#f0f4f8',
  surfaceStrong: '#ffffff',
  overlay: 'rgba(0,0,0,0.35)',
  accent: '#4a7ba7',
  accentSoft: '#c5d8e8',
  accent2: '#6b9bc4',
  orbGlow: 'rgba(200,220,240,0.8)',
  orbCore: '#a8c8e0',
};

export function getPalette(mode: 'night' | 'mist'): ResolvedPalette {
  return mode === 'mist' ? mistPalette : nightPalette;
}
