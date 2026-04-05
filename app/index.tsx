import React, { useCallback, useEffect, useState } from 'react';
import {
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Svg, { Circle, Path } from 'react-native-svg';
import Animated, {
  Easing,
  FadeInDown,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { spacing, typography } from '../src/constants/theme';
import { PressableScale } from '../src/components/PressableScale';

// ─── Constants ───

const { width: SCREEN_W } = Dimensions.get('window');
const CARD_H = 185;

const DISCLAIMER_KEY = 'disclaimer-seen';
const ONBOARDING_KEY = 'onboarding-seen';

// ─── Color palette ───

const C = {
  primaryDark: '#033f63',
  teal: '#28666e',
  sage: '#7c9885',
  olive: '#b5b682',
  gold: '#fedc97',
  bg: '#021C2E',
  text: '#F0F4F1',
} as const;

function rgba(r: number, g: number, b: number, a: number) {
  return `rgba(${r},${g},${b},${a})`;
}

const WH = (a: number) => rgba(255, 255, 255, a);

// ─── Types ───

interface IntentCard {
  id: string;
  title: string;
  subtitle: string;
  route: string;
  entryDelay: number;
}

// ─── Data ───

const intentCards: IntentCard[] = [
  {
    id: 'wind-down',
    title: 'Wind Down',
    subtitle: '5 patterns for winding down — extended exhales, sleep cadences, and calming rhythms',
    route: '/category/calm-sleep',
    entryDelay: 100,
  },
  {
    id: 'sharpen',
    title: 'Sharpen',
    subtitle: '3 structured patterns with holds and steady pacing for focus',
    route: '/category/focus-performance',
    entryDelay: 180,
  },
  {
    id: 'energize',
    title: 'Energize',
    subtitle: '4 rapid and power breathing techniques to wake up your system',
    route: '/category/energy-activation',
    entryDelay: 260,
  },
  {
    id: 'balance',
    title: 'Balance',
    subtitle: '4 patterns for equilibrium — equal pacing, alternating flow, and gentle regulation',
    route: '/category/balance-wellness',
    entryDelay: 340,
  },
  {
    id: 'breathe-well',
    title: 'Breathe Well',
    subtitle: '3 clinically-informed patterns for respiratory health and awareness',
    route: '/category/therapeutic',
    entryDelay: 420,
  },
];

const DISCLAIMER_TEXT =
  'This app is for general wellness and guided pacing. It is not a medical product. ' +
  'Keep the breath gentle, shorten or remove holds if you feel strained, and stop if you ' +
  'feel lightheaded or uncomfortable.\n\n' +
  'Patterns marked as Advanced involve intense techniques with specific contraindications. ' +
  'Please read the safety information carefully before starting those exercises.';

// ─── Animated components ───

const AnimatedView = Animated.View;
const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedGradient = Animated.createAnimatedComponent(LinearGradient);

// ─── Helper: simple alternate animation ───

function useAlternate(
  from: number,
  to: number,
  durationMs: number,
  delayMs = 0,
  easing = Easing.inOut(Easing.ease),
) {
  const sv = useSharedValue(from);
  useEffect(() => {
    const anim = withRepeat(
      withTiming(to, { duration: durationMs, easing }),
      -1,
      true,
    );
    sv.value = delayMs > 0 ? withDelay(delayMs, anim) : anim;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return sv;
}

// ─── Helper: multi-keyframe loop (non-alternating) ───

function useKeyframeLoop(
  keyframes: { value: number; duration: number; easing?: typeof Easing.linear }[],
  delayMs = 0,
) {
  const sv = useSharedValue(keyframes[0].value);
  useEffect(() => {
    const segments = keyframes.slice(1).map((kf) =>
      withTiming(kf.value, {
        duration: kf.duration,
        easing: kf.easing ?? Easing.inOut(Easing.ease),
      }),
    );
    const seq = withRepeat(withSequence(...segments), -1, false);
    sv.value = delayMs > 0 ? withDelay(delayMs, seq) : seq;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return sv;
}

// ═══════════════════════════════════════════
// HERO ORB — 7 concentric layers + 2 ambient glows
// ═══════════════════════════════════════════

function HeroOrb() {
  // Ambient backdrop glow (::before)
  const ambScale = useAlternate(0.8, 1.2, 8000);
  const ambOp = useAlternate(0.5, 1, 8000);
  // Secondary glow (::after)
  const amb2Scale = useAlternate(1.15, 0.85, 6000);
  const amb2Op = useAlternate(0.4, 1, 6000);

  // 7 orb rings — each with oR keyframe: scale 0.86→1.14, opacity 0.35→1
  // Different durations and delays
  const r1s = useAlternate(0.86, 1.14, 6200);
  const r1o = useAlternate(0.35, 1, 6200);
  const r2s = useAlternate(0.86, 1.14, 5700, 400);
  const r2o = useAlternate(0.35, 1, 5700, 400);
  const r3s = useAlternate(0.86, 1.14, 5200, 800);
  const r3o = useAlternate(0.35, 1, 5200, 800);
  const r4s = useAlternate(0.86, 1.14, 4800, 1200);
  const r4o = useAlternate(0.35, 1, 4800, 1200);
  const r5s = useAlternate(0.86, 1.14, 4500, 1500);
  const r5o = useAlternate(0.35, 1, 4500, 1500);
  const r6s = useAlternate(0.86, 1.14, 4200, 1800);
  const r6o = useAlternate(0.35, 1, 4200, 1800);
  const r7s = useAlternate(0.86, 1.14, 4000, 2100);
  const r7o = useAlternate(0.35, 1, 4000, 2100);

  const ambStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ambScale.value }],
    opacity: ambOp.value,
  }));
  const amb2Style = useAnimatedStyle(() => ({
    transform: [{ scale: amb2Scale.value }],
    opacity: amb2Op.value,
  }));
  const r1Style = useAnimatedStyle(() => ({ transform: [{ scale: r1s.value }], opacity: r1o.value }));
  const r2Style = useAnimatedStyle(() => ({ transform: [{ scale: r2s.value }], opacity: r2o.value }));
  const r3Style = useAnimatedStyle(() => ({ transform: [{ scale: r3s.value }], opacity: r3o.value }));
  const r4Style = useAnimatedStyle(() => ({ transform: [{ scale: r4s.value }], opacity: r4o.value }));
  const r5Style = useAnimatedStyle(() => ({ transform: [{ scale: r5s.value }], opacity: r5o.value }));
  const r6Style = useAnimatedStyle(() => ({ transform: [{ scale: r6s.value }], opacity: r6o.value }));
  const r7Style = useAnimatedStyle(() => ({ transform: [{ scale: r7s.value }], opacity: r7o.value }));

  // Contour rings — dashed outlines that breathe between the solid glow rings
  // Placed at radii between the glow rings: 140, 112, 86, 64, 44
  const c1s = useAlternate(0.88, 1.12, 7000, 300);
  const c1o = useAlternate(0.08, 0.22, 7000, 300);
  const c2s = useAlternate(0.88, 1.12, 6200, 600);
  const c2o = useAlternate(0.06, 0.18, 6200, 600);
  const c3s = useAlternate(0.88, 1.12, 5500, 900);
  const c3o = useAlternate(0.05, 0.15, 5500, 900);
  const c4s = useAlternate(0.88, 1.12, 5000, 1100);
  const c4o = useAlternate(0.04, 0.14, 5000, 1100);
  const c5s = useAlternate(0.88, 1.12, 4600, 1400);
  const c5o = useAlternate(0.04, 0.12, 4600, 1400);

  const c1Style = useAnimatedStyle(() => ({ transform: [{ scale: c1s.value }], opacity: c1o.value }));
  const c2Style = useAnimatedStyle(() => ({ transform: [{ scale: c2s.value }], opacity: c2o.value }));
  const c3Style = useAnimatedStyle(() => ({ transform: [{ scale: c3s.value }], opacity: c3o.value }));
  const c4Style = useAnimatedStyle(() => ({ transform: [{ scale: c4s.value }], opacity: c4o.value }));
  const c5Style = useAnimatedStyle(() => ({ transform: [{ scale: c5s.value }], opacity: c5o.value }));

  return (
    <View style={heroStyles.container}>
      {/* Ambient backdrop glow */}
      <AnimatedView style={[heroStyles.ambientGlow, ambStyle]} />
      {/* Secondary glow */}
      <AnimatedView style={[heroStyles.secondaryGlow, amb2Style]} />

      {/* Orb glow rings */}
      <AnimatedView style={[heroStyles.ring, { width: 155, height: 155, borderRadius: 78, backgroundColor: 'rgba(28,72,82,0.10)' }, r1Style]} />
      <AnimatedView style={[heroStyles.ring, { width: 125, height: 125, borderRadius: 63, backgroundColor: 'rgba(36,92,100,0.14)' }, r2Style]} />
      <AnimatedView style={[heroStyles.ring, { width: 98, height: 98, borderRadius: 49, backgroundColor: 'rgba(48,130,140,0.19)' }, r3Style]} />
      <AnimatedView style={[heroStyles.ring, { width: 74, height: 74, borderRadius: 37, backgroundColor: 'rgba(60,160,150,0.25)' }, r4Style]} />
      <AnimatedView style={[heroStyles.ring, { width: 52, height: 52, borderRadius: 26, backgroundColor: 'rgba(80,195,175,0.32)' }, r5Style]} />
      <AnimatedView style={[heroStyles.ring, { width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(110,220,200,0.40)' }, r6Style]} />
      <AnimatedView style={[heroStyles.ring, { width: 16, height: 16, borderRadius: 8, backgroundColor: 'rgba(180,245,230,0.62)' }, r7Style]} />

      {/* Topographic contour rings — dashed SVG circles layered ON TOP of glow */}
      <AnimatedView style={[heroStyles.contour, { width: 170, height: 170 }, c1Style]}>
        <Svg width={170} height={170}><Circle cx={85} cy={85} r={83} fill="none" stroke="rgba(180,220,210,0.35)" strokeWidth={0.7} strokeDasharray="5 9" /></Svg>
      </AnimatedView>
      <AnimatedView style={[heroStyles.contour, { width: 140, height: 140 }, c1Style]}>
        <Svg width={140} height={140}><Circle cx={70} cy={70} r={68} fill="none" stroke="rgba(180,220,210,0.7)" strokeWidth={1} strokeDasharray="4 7" /></Svg>
      </AnimatedView>
      <AnimatedView style={[heroStyles.contour, { width: 112, height: 112 }, c2Style]}>
        <Svg width={112} height={112}><Circle cx={56} cy={56} r={54} fill="none" stroke="rgba(180,220,210,0.6)" strokeWidth={0.8} strokeDasharray="3 6" /></Svg>
      </AnimatedView>
      <AnimatedView style={[heroStyles.contour, { width: 86, height: 86 }, c3Style]}>
        <Svg width={86} height={86}><Circle cx={43} cy={43} r={41} fill="none" stroke="rgba(180,220,210,0.5)" strokeWidth={0.8} strokeDasharray="3 5" /></Svg>
      </AnimatedView>
      <AnimatedView style={[heroStyles.contour, { width: 64, height: 64 }, c4Style]}>
        <Svg width={64} height={64}><Circle cx={32} cy={32} r={30} fill="none" stroke="rgba(180,220,210,0.45)" strokeWidth={0.7} strokeDasharray="2 5" /></Svg>
      </AnimatedView>
      <AnimatedView style={[heroStyles.contour, { width: 44, height: 44 }, c5Style]}>
        <Svg width={44} height={44}><Circle cx={22} cy={22} r={20} fill="none" stroke="rgba(180,220,210,0.4)" strokeWidth={0.7} strokeDasharray="2 4" /></Svg>
      </AnimatedView>
    </View>
  );
}

const heroStyles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 180,
    height: 180,
    marginBottom: 18,
  },
  ambientGlow: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(58,154,160,0.07)',
  },
  secondaryGlow: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(77,184,160,0.04)',
  },
  ring: {
    position: 'absolute',
  },
  contour: {
    position: 'absolute',
  },
});

// ═══════════════════════════════════════════
// QUICK RESET ORB — 4 layers
// ═══════════════════════════════════════════

// Physiological sigh rhythm: inhale 2s, sip 1s, exhale 6s = 9s total cycle
// The orb expands in two quick steps then slowly contracts — the actual breath pattern.
// 5 layers: outermost ring, outer glow, mid glow, inner glow, bright core.
// Each layer follows the same phase timing but with slightly offset scale ranges.

function QuickResetOrb() {
  const ease = Easing.inOut(Easing.sin);

  // Phase-synced: expand (2s) → sip expand (1s) → long contract (6s)
  // Layer 1 — outermost ring (barely visible, largest range)
  const r1s = useKeyframeLoop([
    { value: 0.6, duration: 0, easing: ease },    // start contracted
    { value: 1.0, duration: 2000, easing: ease },  // inhale
    { value: 1.3, duration: 1000, easing: ease },  // sip
    { value: 0.6, duration: 6000, easing: ease },  // exhale
  ]);
  const r1o = useKeyframeLoop([
    { value: 0.08, duration: 0, easing: ease },
    { value: 0.18, duration: 2000, easing: ease },
    { value: 0.25, duration: 1000, easing: ease },
    { value: 0.08, duration: 6000, easing: ease },
  ]);

  // Layer 2 — outer glow
  const r2s = useKeyframeLoop([
    { value: 0.65, duration: 0, easing: ease },
    { value: 1.0, duration: 2000, easing: ease },
    { value: 1.25, duration: 1000, easing: ease },
    { value: 0.65, duration: 6000, easing: ease },
  ], 80);
  const r2o = useKeyframeLoop([
    { value: 0.06, duration: 0, easing: ease },
    { value: 0.16, duration: 2000, easing: ease },
    { value: 0.22, duration: 1000, easing: ease },
    { value: 0.06, duration: 6000, easing: ease },
  ], 80);

  // Layer 3 — mid glow
  const r3s = useKeyframeLoop([
    { value: 0.7, duration: 0, easing: ease },
    { value: 1.05, duration: 2000, easing: ease },
    { value: 1.2, duration: 1000, easing: ease },
    { value: 0.7, duration: 6000, easing: ease },
  ], 150);
  const r3o = useKeyframeLoop([
    { value: 0.10, duration: 0, easing: ease },
    { value: 0.25, duration: 2000, easing: ease },
    { value: 0.35, duration: 1000, easing: ease },
    { value: 0.10, duration: 6000, easing: ease },
  ], 150);

  // Layer 4 — inner glow
  const r4s = useKeyframeLoop([
    { value: 0.75, duration: 0, easing: ease },
    { value: 1.05, duration: 2000, easing: ease },
    { value: 1.15, duration: 1000, easing: ease },
    { value: 0.75, duration: 6000, easing: ease },
  ], 200);
  const r4o = useKeyframeLoop([
    { value: 0.20, duration: 0, easing: ease },
    { value: 0.45, duration: 2000, easing: ease },
    { value: 0.60, duration: 1000, easing: ease },
    { value: 0.20, duration: 6000, easing: ease },
  ], 200);

  // Layer 5 — bright core
  const r5s = useKeyframeLoop([
    { value: 0.7, duration: 0, easing: ease },
    { value: 1.0, duration: 2000, easing: ease },
    { value: 1.15, duration: 1000, easing: ease },
    { value: 0.7, duration: 6000, easing: ease },
  ], 250);
  const r5o = useKeyframeLoop([
    { value: 0.50, duration: 0, easing: ease },
    { value: 0.85, duration: 2000, easing: ease },
    { value: 1.0, duration: 1000, easing: ease },
    { value: 0.50, duration: 6000, easing: ease },
  ], 250);

  const s1 = useAnimatedStyle(() => ({ transform: [{ scale: r1s.value }], opacity: r1o.value }));
  const s2 = useAnimatedStyle(() => ({ transform: [{ scale: r2s.value }], opacity: r2o.value }));
  const s3 = useAnimatedStyle(() => ({ transform: [{ scale: r3s.value }], opacity: r3o.value }));
  const s4 = useAnimatedStyle(() => ({ transform: [{ scale: r4s.value }], opacity: r4o.value }));
  const s5 = useAnimatedStyle(() => ({ transform: [{ scale: r5s.value }], opacity: r5o.value }));

  return (
    <View style={qrOrbStyles.wrap}>
      <AnimatedView style={[qrOrbStyles.ring, { width: 56, height: 56, borderRadius: 28, borderWidth: 1, borderColor: 'rgba(254,220,151,0.06)' }, s1]} />
      <AnimatedView style={[qrOrbStyles.ring, { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(254,220,151,0.06)' }, s2]} />
      <AnimatedView style={[qrOrbStyles.ring, { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(254,220,151,0.10)' }, s3]} />
      <AnimatedView style={[qrOrbStyles.ring, { width: 22, height: 22, borderRadius: 11, backgroundColor: 'rgba(254,220,151,0.16)' }, s4]} />
      <AnimatedView style={[qrOrbStyles.core, s5]} />
    </View>
  );
}

const qrOrbStyles = StyleSheet.create({
  wrap: {
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
  },
  core: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: C.gold,
    zIndex: 2,
  },
});

// ═══════════════════════════════════════════
// QUICK RESET GLOW — warm ambient light bleed
// ═══════════════════════════════════════════

function QuickResetGlow() {
  const ease = Easing.inOut(Easing.sin);
  // Synced to the same 9s cycle — glows brightest at the sip peak
  const gs = useKeyframeLoop([
    { value: 0.85, duration: 0, easing: ease },
    { value: 1.05, duration: 2000, easing: ease },
    { value: 1.18, duration: 1000, easing: ease },
    { value: 0.85, duration: 6000, easing: ease },
  ]);
  const go = useKeyframeLoop([
    { value: 0.25, duration: 0, easing: ease },
    { value: 0.55, duration: 2000, easing: ease },
    { value: 0.8, duration: 1000, easing: ease },
    { value: 0.25, duration: 6000, easing: ease },
  ]);
  const outerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: gs.value }],
    opacity: go.value,
  }));
  // Second, larger, fainter glow for soft bleed
  const g2s = useKeyframeLoop([
    { value: 0.9, duration: 0, easing: ease },
    { value: 1.0, duration: 2000, easing: ease },
    { value: 1.1, duration: 1000, easing: ease },
    { value: 0.9, duration: 6000, easing: ease },
  ], 100);
  const g2o = useKeyframeLoop([
    { value: 0.08, duration: 0, easing: ease },
    { value: 0.18, duration: 2000, easing: ease },
    { value: 0.25, duration: 1000, easing: ease },
    { value: 0.08, duration: 6000, easing: ease },
  ], 100);
  const outerStyle2 = useAnimatedStyle(() => ({
    transform: [{ scale: g2s.value }],
    opacity: g2o.value,
  }));

  return (
    <>
      <AnimatedView
        style={[
          {
            position: 'absolute',
            right: -30,
            top: -30,
            width: 140,
            height: 140,
            borderRadius: 70,
            backgroundColor: 'rgba(254,220,151,0.04)',
          },
          outerStyle2,
        ]}
      />
      <AnimatedView
        style={[
          {
            position: 'absolute',
            right: -12,
            top: -12,
            width: 100,
            height: 100,
            borderRadius: 50,
            backgroundColor: 'rgba(254,220,151,0.06)',
          },
          outerStyle,
        ]}
      />
    </>
  );
}

// ═══════════════════════════════════════════
// ★ WIND DOWN — Midnight Lagoon
// 21 elements: sky, warmglow, aurora1, aurora2, water,
// moon halo, moon, moon shadow, 8 stars, pillar, 4 shimmers
// ═══════════════════════════════════════════

function WindDownGfx() {
  const CW = SCREEN_W - 40;

  // Fix 1: Shared moon center — all reflections derive from this
  const moonCenterX = CW - 72; // moon right:50, width:44 => center at CW-72
  const ripple1W = 78;
  const ripple2W = 48;

  // Sky — barely drifts
  const skyS = useAlternate(0.99, 1.01, 26000);
  const skyO = useAlternate(0.72, 0.9, 26000);

  // Fix 2: Warm atmosphere as gradient, not flat blob
  const wgS = useAlternate(0.97, 1.03, 18000);
  const wgO = useAlternate(0.3, 0.58, 18000);

  // Fix 4: Aurora even thinner
  const a1tx = useAlternate(-8, 10, 16000);
  const a1sx = useAlternate(0.96, 1.04, 16000);
  const a1o = useAlternate(0.18, 0.42, 16000);
  const a2tx = useAlternate(6, -8, 20000);
  const a2sx = useAlternate(1.02, 0.98, 20000);
  const a2o = useAlternate(0.12, 0.28, 20000);

  // Water
  const watO = useAlternate(0.82, 0.96, 18000);

  // Fix 3: Halo slightly less warm
  const mhS = useAlternate(0.96, 1.06, 14000);
  const mhO = useAlternate(0.28, 0.56, 14000);

  // Moon — hero, barely moves
  const mnTx = useAlternate(0.5, -0.5, 14000);
  const mnTy = useAlternate(1, -0.5, 14000);
  const mnS = useAlternate(0.985, 1.015, 14000);
  const mnO = useAlternate(0.82, 1, 14000);
  const msTx = useAlternate(1, -0.5, 14000);
  const msTy = useAlternate(0.5, -0.5, 14000);

  // Fix 5b: Stars — direct hook calls, no nested helper functions
  const ws1o = useKeyframeLoop([
    { value: 0, duration: 0 }, { value: 0.55, duration: 675 }, { value: 0.10, duration: 900 },
    { value: 0.38, duration: 1350 }, { value: 0.04, duration: 900 }, { value: 0, duration: 675 },
  ], 0);
  const ws2o = useKeyframeLoop([
    { value: 0, duration: 0 }, { value: 0.65, duration: 320 }, { value: 0, duration: 480 },
    { value: 0.42, duration: 800 }, { value: 0.06, duration: 800 }, { value: 0, duration: 800 },
  ], 1200);
  const ws3o = useKeyframeLoop([
    { value: 0, duration: 0 }, { value: 0.55, duration: 825 }, { value: 0.10, duration: 1100 },
    { value: 0.38, duration: 1650 }, { value: 0.04, duration: 1100 }, { value: 0, duration: 825 },
  ], 2400);
  const ws4o = useKeyframeLoop([
    { value: 0, duration: 0 }, { value: 0.65, duration: 380 }, { value: 0, duration: 570 },
    { value: 0.42, duration: 950 }, { value: 0.06, duration: 950 }, { value: 0, duration: 950 },
  ], 600);
  const ws5o = useKeyframeLoop([
    { value: 0, duration: 0 }, { value: 0.55, duration: 975 }, { value: 0.10, duration: 1300 },
    { value: 0.38, duration: 1950 }, { value: 0.04, duration: 1300 }, { value: 0, duration: 975 },
  ], 3400);

  // Reflection — quiet
  const pilS = useAlternate(0.94, 1.06, 9000);
  const pilO = useAlternate(0.12, 0.32, 9000);
  const sh1tx = useAlternate(-8, 8, 9000);
  const sh1sx = useAlternate(0.94, 1.08, 9000);
  const sh1o = useAlternate(0.08, 0.22, 9000);
  const sh2tx = useAlternate(-6, 6, 12000, 1800);
  const sh2sx = useAlternate(0.96, 1.06, 12000, 1800);
  const sh2o = useAlternate(0.04, 0.14, 12000, 1800);

  const skyStyle = useAnimatedStyle(() => ({ transform: [{ scale: skyS.value }], opacity: skyO.value }));
  const wgStyle = useAnimatedStyle(() => ({ transform: [{ scale: wgS.value }], opacity: wgO.value }));
  const a1Style = useAnimatedStyle(() => ({ transform: [{ translateX: a1tx.value }, { scaleX: a1sx.value }], opacity: a1o.value }));
  const a2Style = useAnimatedStyle(() => ({ transform: [{ translateX: a2tx.value }, { scaleX: a2sx.value }], opacity: a2o.value }));
  const watStyle = useAnimatedStyle(() => ({ opacity: watO.value }));
  const mhStyle = useAnimatedStyle(() => ({ transform: [{ scale: mhS.value }], opacity: mhO.value }));
  const mnStyle = useAnimatedStyle(() => ({ transform: [{ translateX: mnTx.value }, { translateY: mnTy.value }, { scale: mnS.value }], opacity: mnO.value }));
  const msStyle = useAnimatedStyle(() => ({ transform: [{ translateX: msTx.value }, { translateY: msTy.value }] }));
  const ws1Style = useAnimatedStyle(() => ({ opacity: ws1o.value }));
  const ws2Style = useAnimatedStyle(() => ({ opacity: ws2o.value }));
  const ws3Style = useAnimatedStyle(() => ({ opacity: ws3o.value }));
  const ws4Style = useAnimatedStyle(() => ({ opacity: ws4o.value }));
  const ws5Style = useAnimatedStyle(() => ({ opacity: ws5o.value }));
  const pilStyle = useAnimatedStyle(() => ({ transform: [{ scaleY: pilS.value }], opacity: pilO.value }));
  const sh1Style = useAnimatedStyle(() => ({ transform: [{ translateX: sh1tx.value }, { scaleX: sh1sx.value }], opacity: sh1o.value }));
  const sh2Style = useAnimatedStyle(() => ({ transform: [{ translateX: sh2tx.value }, { scaleX: sh2sx.value }], opacity: sh2o.value }));

  return (
    <View style={StyleSheet.absoluteFill}>
      {/* Sky */}
      <AnimatedGradient
        colors={['rgba(7,12,32,0.52)', 'rgba(7,12,32,0.20)', 'transparent']}
        style={[{ position: 'absolute', width: CW + 36, height: 132, left: -18, top: -18, borderRadius: 56 }, skyStyle]}
      />
      {/* Fix 4: Thinner aurora — height 20 and 12 */}
      <AnimatedGradient
        colors={['transparent', 'rgba(64,156,160,0.10)', 'rgba(84,184,166,0.06)', 'transparent']}
        start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }}
        style={[{ position: 'absolute', width: 300, height: 20, borderRadius: 10, left: -6, top: 12 }, a1Style]}
      />
      <AnimatedGradient
        colors={['transparent', 'rgba(86,92,160,0.06)', 'rgba(70,126,166,0.04)', 'transparent']}
        start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }}
        style={[{ position: 'absolute', width: 250, height: 12, borderRadius: 8, left: 38, top: 24 }, a2Style]}
      />
      {/* Fix 2: Warm atmosphere — two nested gradient circles instead of flat blob */}
      <AnimatedGradient
        colors={['rgba(254,220,151,0.05)', 'rgba(254,220,151,0.015)', 'transparent']}
        start={{ x: 0.5, y: 0.5 }} end={{ x: 1, y: 1 }}
        style={[{ position: 'absolute', width: 190, height: 160, borderRadius: 80, right: -30, top: -18 }, wgStyle]}
      />
      <AnimatedGradient
        colors={['rgba(254,220,151,0.04)', 'rgba(254,220,151,0.01)', 'transparent']}
        start={{ x: 0.5, y: 0.5 }} end={{ x: 1, y: 1 }}
        style={[{ position: 'absolute', width: 120, height: 100, borderRadius: 50, right: 5, top: 2 }, wgStyle]}
      />
      {/* Fix 3b: Water — slightly lighter bottom */}
      <AnimatedGradient
        colors={['transparent', 'rgba(7,54,84,0.10)', 'rgba(5,40,68,0.24)', 'rgba(3,28,52,0.28)']}
        style={[{ position: 'absolute', width: CW + 36, height: 92, left: -18, bottom: -10, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 }, watStyle]}
      />
      {/* Horizon sheen */}
      <AnimatedGradient
        colors={['transparent', 'rgba(150,190,220,0.06)', 'transparent']}
        start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }}
        style={{ position: 'absolute', width: CW - 24, height: 1, left: 12, bottom: 54, borderRadius: 1 }}
      />
      {/* Halo — 12 concentric circles, 8px steps, for smooth radial glow */}
      <AnimatedView style={[{ position: 'absolute', width: 148, height: 148, borderRadius: 74, right: 0, top: -22, backgroundColor: 'rgba(254,220,151,0.004)' }, mhStyle]} />
      <AnimatedView style={[{ position: 'absolute', width: 140, height: 140, borderRadius: 70, right: 4, top: -18, backgroundColor: 'rgba(254,220,151,0.006)' }, mhStyle]} />
      <AnimatedView style={[{ position: 'absolute', width: 132, height: 132, borderRadius: 66, right: 8, top: -14, backgroundColor: 'rgba(254,220,151,0.008)' }, mhStyle]} />
      <AnimatedView style={[{ position: 'absolute', width: 124, height: 124, borderRadius: 62, right: 12, top: -10, backgroundColor: 'rgba(254,220,151,0.009)' }, mhStyle]} />
      <AnimatedView style={[{ position: 'absolute', width: 116, height: 116, borderRadius: 58, right: 16, top: -6, backgroundColor: 'rgba(254,220,151,0.010)' }, mhStyle]} />
      <AnimatedView style={[{ position: 'absolute', width: 108, height: 108, borderRadius: 54, right: 20, top: -2, backgroundColor: 'rgba(254,220,151,0.011)' }, mhStyle]} />
      <AnimatedView style={[{ position: 'absolute', width: 100, height: 100, borderRadius: 50, right: 24, top: 2, backgroundColor: 'rgba(254,220,151,0.013)' }, mhStyle]} />
      <AnimatedView style={[{ position: 'absolute', width: 90, height: 90, borderRadius: 45, right: 29, top: 7, backgroundColor: 'rgba(254,220,151,0.016)' }, mhStyle]} />
      <AnimatedView style={[{ position: 'absolute', width: 80, height: 80, borderRadius: 40, right: 34, top: 12, backgroundColor: 'rgba(254,220,151,0.019)' }, mhStyle]} />
      <AnimatedView style={[{ position: 'absolute', width: 70, height: 70, borderRadius: 35, right: 39, top: 17, backgroundColor: 'rgba(254,220,151,0.022)' }, mhStyle]} />
      <AnimatedView style={[{ position: 'absolute', width: 60, height: 60, borderRadius: 30, right: 44, top: 22, backgroundColor: 'rgba(254,220,151,0.026)' }, mhStyle]} />
      <AnimatedView style={[{ position: 'absolute', width: 50, height: 50, borderRadius: 25, right: 49, top: 27, backgroundColor: 'rgba(254,220,151,0.030)' }, mhStyle]} />
      {/* Moon — crescent via gradient direction */}
      <AnimatedGradient
        colors={[
          'rgba(255,235,195,0.56)',
          'rgba(255,228,175,0.42)',
          'rgba(254,222,155,0.22)',
          'rgba(254,220,151,0.08)',
          'transparent',
        ]}
        start={{ x: 0.65, y: 0.7 }}
        end={{ x: 0.15, y: 0.1 }}
        style={[{ position: 'absolute', width: 42, height: 42, borderRadius: 21, right: 50, top: 22, overflow: 'hidden' }, mnStyle]}
      >
        {/* Craters — darker spots on the bright lower-right quadrant */}
        <View style={{ position: 'absolute', width: 7, height: 7, borderRadius: 3.5, backgroundColor: 'rgba(80,70,40,0.30)', left: 21, top: 23 }} />
        <View style={{ position: 'absolute', width: 5, height: 5, borderRadius: 2.5, backgroundColor: 'rgba(90,80,50,0.25)', left: 29, top: 17 }} />
        <View style={{ position: 'absolute', width: 4, height: 4, borderRadius: 2, backgroundColor: 'rgba(85,75,45,0.22)', left: 16, top: 30 }} />
        <View style={{ position: 'absolute', width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(75,65,35,0.20)', left: 26, top: 28 }} />
        <View style={{ position: 'absolute', width: 3, height: 3, borderRadius: 1.5, backgroundColor: 'rgba(90,80,50,0.18)', left: 33, top: 22 }} />
      </AnimatedGradient>
      {/* Stars */}
      <AnimatedView style={[{ position: 'absolute', width: 2, height: 2, borderRadius: 1, left: 34, top: 16, backgroundColor: 'rgba(255,241,224,0.78)' }, ws1Style]} />
      <AnimatedView style={[{ position: 'absolute', width: 1.5, height: 1.5, borderRadius: 0.75, left: 92, top: 10, backgroundColor: 'rgba(235,240,255,0.62)' }, ws2Style]} />
      <AnimatedView style={[{ position: 'absolute', width: 2, height: 2, borderRadius: 1, left: 148, top: 22, backgroundColor: 'rgba(255,241,224,0.70)' }, ws3Style]} />
      <AnimatedView style={[{ position: 'absolute', width: 1.5, height: 1.5, borderRadius: 0.75, left: 214, top: 12, backgroundColor: 'rgba(235,240,255,0.56)' }, ws4Style]} />
      <AnimatedView style={[{ position: 'absolute', width: 1.5, height: 1.5, borderRadius: 0.75, left: 70, top: 36, backgroundColor: 'rgba(255,241,224,0.42)' }, ws5Style]} />
      {/* Fix 1: Reflection aligned under moon center */}
      <AnimatedGradient
        colors={['rgba(255,224,170,0.14)', 'rgba(255,224,170,0.06)', 'transparent']}
        style={[{ position: 'absolute', width: 4, height: 54, borderRadius: 2, left: moonCenterX - 2, bottom: 12 }, pilStyle]}
      />
      <AnimatedGradient
        colors={['transparent', 'rgba(255,224,170,0.18)', 'rgba(255,224,170,0.07)', 'transparent']}
        start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }}
        style={[{ position: 'absolute', width: ripple1W, height: 1.5, borderRadius: 1, left: moonCenterX - ripple1W / 2, bottom: 36 }, sh1Style]}
      />
      <AnimatedGradient
        colors={['transparent', 'rgba(255,224,170,0.10)', 'transparent']}
        start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }}
        style={[{ position: 'absolute', width: ripple2W, height: 1.5, borderRadius: 1, left: moonCenterX - ripple2W / 2, bottom: 28 }, sh2Style]}
      />
    </View>
  );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function _WindDownGfxOld() {
  const CW = SCREEN_W - 40; // card width

  // wd-sky1: scale 0.98→1.02, opacity 0.6→1, 20s
  const skyS = useAlternate(0.98, 1.02, 20000);
  const skyO = useAlternate(0.6, 1, 20000);

  // wd-warmglow: translate + scale, 12s
  const wgS = useAlternate(0.92, 1.08, 12000);
  const wgO = useAlternate(0.5, 1, 12000);

  // wd-aurora1: translateX(-15→20) + scaleX(0.9→1.1), opacity 0.4→1, 12s
  const a1tx = useAlternate(-15, 20, 12000);
  const a1sx = useAlternate(0.9, 1.1, 12000);
  const a1o = useAlternate(0.4, 1, 12000);

  // wd-aurora2: translateX(10→-12) + scaleX(1.05→0.95), opacity 0.3→0.8, 15s
  const a2tx = useAlternate(10, -12, 15000);
  const a2sx = useAlternate(1.05, 0.95, 15000);
  const a2o = useAlternate(0.3, 0.8, 15000);

  // wd-water: opacity 0.7→1, 14s
  const watO = useAlternate(0.7, 1, 14000);

  // wd-mhalo: scale 0.9→1.15, opacity 0.5→1, 10s
  const mhS = useAlternate(0.9, 1.15, 10000);
  const mhO = useAlternate(0.5, 1, 10000);

  // wd-moon: translate(1,2→-1,-1) + scale 0.97→1.03, opacity 0.7→1, 10s
  const mnTx = useAlternate(1, -1, 10000);
  const mnTy = useAlternate(2, -1, 10000);
  const mnS = useAlternate(0.97, 1.03, 10000);
  const mnO = useAlternate(0.7, 1, 10000);

  // wd-mshadow: translate(2,1→0,-1), 10s
  const msTx = useAlternate(2, 0, 10000);
  const msTy = useAlternate(1, -1, 10000);

  // Stars — wsSlow: 0,0→0.7→0.15→0.5→0.05→0 (multi-keyframe)
  // wsFast: 0→0.9→0→0.6→0.1→0

  const wsSlowKf = (dur: number, delay: number) =>
    useKeyframeLoop(
      [
        { value: 0, duration: 0 },
        { value: 0.7, duration: dur * 0.15 },
        { value: 0.15, duration: dur * 0.20 },
        { value: 0.5, duration: dur * 0.30 },
        { value: 0.05, duration: dur * 0.20 },
        { value: 0, duration: dur * 0.15 },
      ],
      delay,
    );

  const wsFastKf = (dur: number, delay: number) =>
    useKeyframeLoop(
      [
        { value: 0, duration: 0 },
        { value: 0.9, duration: dur * 0.10 },
        { value: 0, duration: dur * 0.15 },
        { value: 0.6, duration: dur * 0.25 },
        { value: 0.1, duration: dur * 0.25 },
        { value: 0, duration: dur * 0.25 },
      ],
      delay,
    );

  // ws1: slow 4s, left:30 top:15, 3px
  const ws1o = wsSlowKf(4000, 0);
  // ws2: fast 2.8s delay -1s, left:75 top:8, 2px
  const ws2o = wsFastKf(2800, 1000);
  // ws3: slow 5s delay -2s, left:130 top:18, 2.5px
  const ws3o = wsSlowKf(5000, 2000);
  // ws4: fast 3.2s delay -0.5s, left:180 top:6, 2px
  const ws4o = wsFastKf(3200, 500);
  // ws5: slow 6s delay -3s, left:220 top:28, 1.5px
  const ws5o = wsSlowKf(6000, 3000);
  // ws6: fast 3.5s delay -1.8s, left:100 top:35, 2px
  const ws6o = wsFastKf(3500, 1800);
  // ws7: slow 4.5s delay -2.5s, left:260 top:14, 1.5px
  const ws7o = wsSlowKf(4500, 2500);
  // ws8: fast 4s delay -3.2s, left:55 top:42, 2px
  const ws8o = wsFastKf(4000, 3200);

  // wd-pillar: scaleY 0.85→1.15, opacity 0.3→0.8, 8s
  const pilS = useAlternate(0.85, 1.15, 8000);
  const pilO = useAlternate(0.3, 0.8, 8000);

  // Shimmer lines: translateX(-15→15) + scaleX(0.8→1.2), opacity 0.15→0.7, varied durations
  const sh1tx = useAlternate(-15, 15, 7000);
  const sh1sx = useAlternate(0.8, 1.2, 7000);
  const sh1o = useAlternate(0.15, 0.7, 7000);

  const sh2tx = useAlternate(-15, 15, 9000, 2000);
  const sh2sx = useAlternate(0.8, 1.2, 9000, 2000);
  const sh2o = useAlternate(0.09, 0.42, 9000, 2000);

  const sh3tx = useAlternate(-15, 15, 11000, 4000);
  const sh3sx = useAlternate(0.8, 1.2, 11000, 4000);
  const sh3o = useAlternate(0.06, 0.28, 11000, 4000);

  const sh4tx = useAlternate(-15, 15, 8000, 1000);
  const sh4sx = useAlternate(0.8, 1.2, 8000, 1000);
  const sh4o = useAlternate(0.075, 0.35, 8000, 1000);

  // Animated styles
  const skyStyle = useAnimatedStyle(() => ({ transform: [{ scale: skyS.value }], opacity: skyO.value }));
  const wgStyle = useAnimatedStyle(() => ({ transform: [{ scale: wgS.value }], opacity: wgO.value }));
  const a1Style = useAnimatedStyle(() => ({ transform: [{ translateX: a1tx.value }, { scaleX: a1sx.value }], opacity: a1o.value }));
  const a2Style = useAnimatedStyle(() => ({ transform: [{ translateX: a2tx.value }, { scaleX: a2sx.value }], opacity: a2o.value }));
  const watStyle = useAnimatedStyle(() => ({ opacity: watO.value }));
  const mhStyle = useAnimatedStyle(() => ({ transform: [{ scale: mhS.value }], opacity: mhO.value }));
  const mnStyle = useAnimatedStyle(() => ({ transform: [{ translateX: mnTx.value }, { translateY: mnTy.value }, { scale: mnS.value }], opacity: mnO.value }));
  const msStyle = useAnimatedStyle(() => ({ transform: [{ translateX: msTx.value }, { translateY: msTy.value }] }));

  const ws1Style = useAnimatedStyle(() => ({ opacity: ws1o.value }));
  const ws2Style = useAnimatedStyle(() => ({ opacity: ws2o.value }));
  const ws3Style = useAnimatedStyle(() => ({ opacity: ws3o.value }));
  const ws4Style = useAnimatedStyle(() => ({ opacity: ws4o.value }));
  const ws5Style = useAnimatedStyle(() => ({ opacity: ws5o.value }));
  const ws6Style = useAnimatedStyle(() => ({ opacity: ws6o.value }));
  const ws7Style = useAnimatedStyle(() => ({ opacity: ws7o.value }));
  const ws8Style = useAnimatedStyle(() => ({ opacity: ws8o.value }));

  const pilStyle = useAnimatedStyle(() => ({ transform: [{ scaleY: pilS.value }], opacity: pilO.value }));

  const sh1Style = useAnimatedStyle(() => ({ transform: [{ translateX: sh1tx.value }, { scaleX: sh1sx.value }], opacity: sh1o.value }));
  const sh2Style = useAnimatedStyle(() => ({ transform: [{ translateX: sh2tx.value }, { scaleX: sh2sx.value }], opacity: sh2o.value }));
  const sh3Style = useAnimatedStyle(() => ({ transform: [{ translateX: sh3tx.value }, { scaleX: sh3sx.value }], opacity: sh3o.value }));
  const sh4Style = useAnimatedStyle(() => ({ transform: [{ translateX: sh4tx.value }, { scaleX: sh4sx.value }], opacity: sh4o.value }));

  const starColor = 'rgba(255,240,220,0.9)';

  const halfW = Math.round(CW / 2);
  const AnimatedGradient = Animated.createAnimatedComponent(LinearGradient);

  return (
    <View style={StyleSheet.absoluteFill}>
      {/* Sky — feathered from dark top to transparent */}
      <AnimatedGradient
        colors={['rgba(8,14,40,0.45)', 'rgba(8,14,40,0.15)', 'transparent']}
        style={[{ position: 'absolute', width: CW + 40, height: 140, left: -20, top: -20, borderRadius: 60 }, skyStyle]}
      />
      {/* Warm ambient glow — radial-simulated with layered feathered circles */}
      <AnimatedView style={[{ position: 'absolute', width: 220, height: 180, borderRadius: 90, right: -50, top: -30, backgroundColor: 'rgba(254,220,151,0.04)' }, wgStyle]} />
      <AnimatedView style={[{ position: 'absolute', width: 160, height: 130, borderRadius: 65, right: -25, top: -10, backgroundColor: 'rgba(254,220,151,0.06)' }, wgStyle]} />
      <AnimatedView style={[{ position: 'absolute', width: 100, height: 80, borderRadius: 40, right: 0, top: 5, backgroundColor: 'rgba(254,220,151,0.04)' }, wgStyle]} />
      {/* Aurora band 1 — feathered horizontally */}
      <AnimatedGradient
        colors={['transparent', 'rgba(58,154,160,0.12)', 'rgba(77,184,160,0.08)', 'transparent']}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={[{ position: 'absolute', width: 320, height: 36, borderRadius: 18, left: -20, top: 10 }, a1Style]}
      />
      {/* Aurora band 2 — feathered horizontally, violet */}
      <AnimatedGradient
        colors={['transparent', 'rgba(90,80,160,0.08)', 'rgba(80,140,170,0.06)', 'transparent']}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={[{ position: 'absolute', width: 280, height: 24, borderRadius: 12, left: 30, top: 26 }, a2Style]}
      />
      {/* Water body — feathered from transparent top to dark bottom */}
      <AnimatedGradient
        colors={['transparent', 'rgba(6,58,86,0.12)', 'rgba(6,58,86,0.30)', 'rgba(4,36,64,0.35)']}
        style={[{ position: 'absolute', width: CW + 40, height: 100, left: -20, bottom: -10, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 }, watStyle]}
      />
      {/* Moon halo — concentric radial-gradient rings, each fully feathered center→transparent */}
      <AnimatedGradient
        colors={['rgba(254,220,151,0.07)', 'rgba(254,220,151,0.03)', 'transparent']}
        start={{ x: 0.5, y: 0.5 }}
        end={{ x: 1, y: 1 }}
        style={[{ position: 'absolute', width: 140, height: 140, borderRadius: 70, right: 0, top: -25 }, mhStyle]}
      />
      <AnimatedGradient
        colors={['rgba(254,220,151,0.09)', 'rgba(254,220,151,0.03)', 'transparent']}
        start={{ x: 0.5, y: 0.5 }}
        end={{ x: 1, y: 1 }}
        style={[{ position: 'absolute', width: 90, height: 90, borderRadius: 45, right: 25, top: 0 }, mhStyle]}
      />
      {/* Moon — feathered warm disc, bright center fading to transparent edge */}
      <AnimatedGradient
        colors={['rgba(254,230,180,0.55)', 'rgba(254,225,170,0.35)', 'rgba(254,220,151,0.10)', 'transparent']}
        start={{ x: 0.45, y: 0.42 }}
        end={{ x: 1, y: 1 }}
        style={[{ position: 'absolute', width: 50, height: 50, borderRadius: 25, right: 44, top: 16 }, mnStyle]}
      />
      {/* Moon shadow — creates crescent, feathered edge */}
      <AnimatedGradient
        colors={['rgba(4,36,64,0.98)', 'rgba(4,36,64,0.92)', 'rgba(4,36,64,0.60)', 'rgba(4,36,64,0.15)']}
        start={{ x: 0.35, y: 0.45 }}
        end={{ x: 1, y: 0.8 }}
        style={[{ position: 'absolute', width: 42, height: 42, borderRadius: 21, right: 36, top: 15, zIndex: 2 }, msStyle]}
      />

      {/* Stars — 8 twinkling points at varied rates */}
      <AnimatedView style={[{ position: 'absolute', width: 3, height: 3, borderRadius: 1.5, left: 30, top: 15, backgroundColor: starColor }, ws1Style]} />
      <AnimatedView style={[{ position: 'absolute', width: 2, height: 2, borderRadius: 1, left: 75, top: 8, backgroundColor: starColor }, ws2Style]} />
      <AnimatedView style={[{ position: 'absolute', width: 2.5, height: 2.5, borderRadius: 1.25, left: 130, top: 18, backgroundColor: starColor }, ws3Style]} />
      <AnimatedView style={[{ position: 'absolute', width: 2, height: 2, borderRadius: 1, left: 180, top: 6, backgroundColor: starColor }, ws4Style]} />
      <AnimatedView style={[{ position: 'absolute', width: 1.5, height: 1.5, borderRadius: 0.75, left: 220, top: 28, backgroundColor: starColor }, ws5Style]} />
      <AnimatedView style={[{ position: 'absolute', width: 2, height: 2, borderRadius: 1, left: 100, top: 35, backgroundColor: starColor }, ws6Style]} />
      <AnimatedView style={[{ position: 'absolute', width: 1.5, height: 1.5, borderRadius: 0.75, left: 260, top: 14, backgroundColor: starColor }, ws7Style]} />
      <AnimatedView style={[{ position: 'absolute', width: 2, height: 2, borderRadius: 1, left: 55, top: 42, backgroundColor: starColor }, ws8Style]} />

      {/* Golden light pillar — feathered vertically */}
      <AnimatedGradient
        colors={['rgba(254,220,151,0.22)', 'rgba(254,220,151,0.10)', 'rgba(254,220,151,0.02)', 'transparent']}
        style={[{ position: 'absolute', width: 8, height: 65, borderRadius: 4, right: 65, bottom: 12 }, pilStyle]}
      />

      {/* Shimmer lines — feathered horizontally for soft water reflections */}
      <AnimatedGradient
        colors={['transparent', 'rgba(254,220,151,0.30)', 'rgba(254,220,151,0.12)', 'transparent']}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={[{ position: 'absolute', width: 110, height: 2, borderRadius: 1, left: halfW - 55, bottom: 40 }, sh1Style]}
      />
      <AnimatedGradient
        colors={['transparent', 'rgba(254,220,151,0.22)', 'rgba(254,220,151,0.08)', 'transparent']}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={[{ position: 'absolute', width: 80, height: 1.5, borderRadius: 1, left: halfW - 15, bottom: 32 }, sh2Style]}
      />
      <AnimatedGradient
        colors={['transparent', 'rgba(254,220,151,0.16)', 'transparent']}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={[{ position: 'absolute', width: 60, height: 1.5, borderRadius: 1, left: halfW - 40, bottom: 24 }, sh3Style]}
      />
      <AnimatedGradient
        colors={['transparent', 'rgba(254,220,151,0.20)', 'rgba(254,220,151,0.10)', 'transparent']}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={[{ position: 'absolute', width: 90, height: 1.5, borderRadius: 1, left: halfW - 65, bottom: 36 }, sh4Style]}
      />
    </View>
  );
}

// ═══════════════════════════════════════════
// ★ SHARPEN — Crystal Prism
// 17 elements: atmo, 3 grids, 5 beams, spectral edge,
// 2 refraction lines, focal, focal core, secondary focal, mist
// ═══════════════════════════════════════════

function SharpenGfx() {
  const CW = SCREEN_W - 40;

  // sh-atmo: translate(5,0→-5,0) + scale 0.96→1.04, opacity 0.6→1, 16s
  const atS = useAlternate(0.96, 1.04, 16000);
  const atO = useAlternate(0.6, 1, 16000);

  // Beams
  const b1tx = useAlternate(-3, 3, 9000);
  const b1sy = useAlternate(0.96, 1.04, 9000);
  const b1o = useAlternate(0.35, 0.9, 9000);

  const b2tx = useAlternate(2, -2, 12000);
  const b2o = useAlternate(0.25, 0.75, 12000);

  const b3tx = useAlternate(-2, 2, 10000);
  const b3o = useAlternate(0.2, 0.65, 10000);

  const b4tx = useAlternate(1, -2, 14000);
  const b4o = useAlternate(0.15, 0.55, 14000);

  const b5tx = useAlternate(-1, 1, 11000);
  const b5o = useAlternate(0.1, 0.4, 11000);

  // Spectral edge
  const spO = useAlternate(0.2, 0.7, 9000);
  const spTx = useAlternate(-1, 1, 9000);

  // Refraction lines
  const r1o = useAlternate(0.2, 0.75, 10000);
  const r1tx = useAlternate(-6, 6, 10000);
  const r2o = useAlternate(0.15, 0.6, 13000, 3000);
  const r2tx = useAlternate(4, -4, 13000, 3000);

  // Focal diamond
  const fS = useAlternate(0.85, 1.15, 5500);
  const fTy = useAlternate(3, -3, 5500);
  const fO = useAlternate(0.45, 1, 5500);

  // Secondary focal
  const f2S = useAlternate(1.1, 0.85, 5500);
  const f2Ty = useAlternate(-2, 4, 5500);
  const f2O = useAlternate(0.65, 0.15, 5500);

  // Mist
  const mTy = useAlternate(2, -3, 14000);
  const mO = useAlternate(0.3, 0.8, 14000);

  const atStyle = useAnimatedStyle(() => ({ transform: [{ scale: atS.value }], opacity: atO.value }));
  const b1Style = useAnimatedStyle(() => ({ transform: [{ translateX: b1tx.value }, { scaleY: b1sy.value }], opacity: b1o.value }));
  const b2Style = useAnimatedStyle(() => ({ transform: [{ translateX: b2tx.value }], opacity: b2o.value }));
  const b3Style = useAnimatedStyle(() => ({ transform: [{ translateX: b3tx.value }], opacity: b3o.value }));
  const b4Style = useAnimatedStyle(() => ({ transform: [{ translateX: b4tx.value }], opacity: b4o.value }));
  const b5Style = useAnimatedStyle(() => ({ transform: [{ translateX: b5tx.value }], opacity: b5o.value }));
  const spStyle = useAnimatedStyle(() => ({ transform: [{ translateX: spTx.value }], opacity: spO.value }));
  const r1Style = useAnimatedStyle(() => ({ transform: [{ rotate: '-16deg' }, { translateX: r1tx.value }], opacity: r1o.value }));
  const r2Style = useAnimatedStyle(() => ({ transform: [{ rotate: '-10deg' }, { translateX: r2tx.value }], opacity: r2o.value }));
  const fStyle = useAnimatedStyle(() => ({ transform: [{ scale: fS.value }, { translateY: fTy.value }], opacity: fO.value }));
  const f2Style = useAnimatedStyle(() => ({ transform: [{ scale: f2S.value }, { translateY: f2Ty.value }], opacity: f2O.value }));
  const mStyle = useAnimatedStyle(() => ({ transform: [{ translateY: mTy.value }], opacity: mO.value }));

  return (
    <View style={StyleSheet.absoluteFill}>
      {/* Teal atmospheric field */}
      <AnimatedView style={[{ position: 'absolute', width: 260, height: 260, borderRadius: 130, right: -70, top: -60, backgroundColor: 'rgba(40,102,110,0.12)' }, atStyle]} />

      {/* Grid lines */}
      <View style={{ position: 'absolute', width: '100%', height: 1, top: '33%', left: 0, backgroundColor: 'rgba(58,154,160,0.04)' }} />
      <View style={{ position: 'absolute', width: '100%', height: 1, top: '55%', left: 0, backgroundColor: 'rgba(58,154,160,0.03)' }} />
      <View style={{ position: 'absolute', width: '100%', height: 1, top: '77%', left: 0, backgroundColor: 'rgba(58,154,160,0.02)' }} />

      {/* Mist */}
      <AnimatedView style={[{ position: 'absolute', width: '100%', height: 70, borderRadius: 35, left: 0, bottom: -25, backgroundColor: 'rgba(124,152,133,0.06)' }, mStyle]} />

      {/* Beams */}
      <AnimatedView style={[{ position: 'absolute', width: 36, height: 240, borderRadius: 999, left: '53%', top: -45, backgroundColor: 'rgba(58,154,160,0.15)' }, b1Style]} />
      <AnimatedView style={[{ position: 'absolute', width: 22, height: 210, borderRadius: 999, left: '39%', top: -35, backgroundColor: 'rgba(48,130,140,0.10)' }, b2Style]} />
      <AnimatedView style={[{ position: 'absolute', width: 14, height: 180, borderRadius: 999, left: '25%', top: -20, backgroundColor: 'rgba(40,102,110,0.08)' }, b3Style]} />
      <AnimatedView style={[{ position: 'absolute', width: 10, height: 160, borderRadius: 999, left: '67%', top: -10, backgroundColor: 'rgba(58,154,160,0.06)' }, b4Style]} />
      <AnimatedView style={[{ position: 'absolute', width: 6, height: 140, borderRadius: 999, left: '16%', top: 0, backgroundColor: 'rgba(40,102,110,0.04)' }, b5Style]} />

      {/* Spectral edge */}
      <AnimatedView style={[{ position: 'absolute', width: 2, height: 120, borderRadius: 1, left: '56%', top: -10, backgroundColor: 'rgba(120,200,255,0.06)' }, spStyle]} />

      {/* Refraction lines */}
      <AnimatedView style={[{ position: 'absolute', width: '55%', height: 2, right: -10, top: 50, backgroundColor: 'rgba(254,220,151,0.14)' }, r1Style]} />
      <AnimatedView style={[{ position: 'absolute', width: '40%', height: 1.5, right: 5, top: 74, backgroundColor: 'rgba(232,200,112,0.10)' }, r2Style]} />

      {/* Diamond focal point */}
      <AnimatedView style={[{ position: 'absolute', width: 42, height: 42, borderRadius: 21, left: '50%', marginLeft: -21, top: 46, backgroundColor: 'rgba(254,220,151,0.25)' }, fStyle]} />
      {/* Focal core */}
      <AnimatedView style={[{ position: 'absolute', width: 12, height: 12, borderRadius: 6, left: '50%', marginLeft: -6, top: 61, backgroundColor: 'rgba(255,240,200,0.50)' }, fStyle]} />
      {/* Secondary focal */}
      <AnimatedView style={[{ position: 'absolute', width: 16, height: 16, borderRadius: 8, left: '33%', top: 78, backgroundColor: 'rgba(232,200,112,0.20)' }, f2Style]} />
    </View>
  );
}

// ═══════════════════════════════════════════
// ★ ENERGIZE — Solar Burst
// 20 elements: canopy, depth, bloom2, sun, 5 rays,
// flare, hot, spark, 3 streaks, 5 embers
// ═══════════════════════════════════════════

function EnergizeGfx() {
  const CW = SCREEN_W - 40;

  // Canopy
  const canS = useAlternate(0.96, 1.04, 8000);
  const canO = useAlternate(0.5, 1, 8000);

  // Depth
  const depS = useAlternate(1.1, 0.9, 8000);
  const depTx = useAlternate(5, -5, 8000);
  const depO = useAlternate(0.4, 1, 8000);

  // Bloom2
  const bl2S = useAlternate(1.1, 0.8, 4200);
  const bl2Tx = useAlternate(-6, 8, 4200);
  const bl2O = useAlternate(0.6, 0.25, 4200);

  // Sun
  const sunS = useAlternate(0.7, 1.3, 3000);
  const sunO = useAlternate(0.35, 1, 3000);

  // Rays — opacity 0.1→0.6, scaleY 0.8→1.15, varied durations and delays
  const ray1o = useAlternate(0.1, 0.6, 3000);
  const ray1s = useAlternate(0.8, 1.15, 3000);
  const ray2o = useAlternate(0.1, 0.6, 3500, 500);
  const ray2s = useAlternate(0.8, 1.15, 3500, 500);
  const ray3o = useAlternate(0.1, 0.6, 2800, 1000);
  const ray3s = useAlternate(0.8, 1.15, 2800, 1000);
  const ray4o = useAlternate(0.1, 0.6, 3200, 1500);
  const ray4s = useAlternate(0.8, 1.15, 3200, 1500);
  const ray5o = useAlternate(0.1, 0.6, 3800, 300);
  const ray5s = useAlternate(0.8, 1.15, 3800, 300);

  // Flare
  const flO = useAlternate(0.2, 0.7, 4000);
  const flTx = useAlternate(-10, 10, 4000);

  // Hot flash — multi keyframe 0→0.9→0.15→0→0, 2.4s non-alternate
  const hotO = useKeyframeLoop([
    { value: 0, duration: 0 },
    { value: 0.9, duration: 432 },
    { value: 0.15, duration: 408 },
    { value: 0, duration: 480 },
    { value: 0, duration: 1080 },
  ]);
  const hotS = useKeyframeLoop([
    { value: 0.3, duration: 0 },
    { value: 0.85, duration: 432 },
    { value: 1.2, duration: 408 },
    { value: 1.5, duration: 480 },
    { value: 0.3, duration: 1080 },
  ]);

  // Spark flash — multi keyframe 0→1→0→0, 2.4s
  const spkO = useKeyframeLoop([
    { value: 0, duration: 0 },
    { value: 1, duration: 240 },
    { value: 0, duration: 288 },
    { value: 0, duration: 1872 },
  ]);
  const spkS = useKeyframeLoop([
    { value: 0.15, duration: 0 },
    { value: 1.2, duration: 240 },
    { value: 1.6, duration: 288 },
    { value: 0.15, duration: 1872 },
  ]);

  // Streaks: translateY(12→-16), opacity 0.15→0.75
  const st1ty = useAlternate(12, -16, 3000);
  const st1o = useAlternate(0.15, 0.75, 3000);
  const st2ty = useAlternate(12, -16, 4200, 1000);
  const st2o = useAlternate(0.15, 0.75, 4200, 1000);
  const st3ty = useAlternate(12, -16, 3500, 2000);
  const st3o = useAlternate(0.15, 0.75, 3500, 2000);

  // Embers — multi keyframe: translate & opacity & scale
  const makeEmber = (dur: number, delay: number) => {
    const o = useKeyframeLoop([
      { value: 0, duration: 0 },
      { value: 0.8, duration: dur * 0.20 },
      { value: 0.2, duration: dur * 0.30 },
      { value: 0.5, duration: dur * 0.25 },
      { value: 0, duration: dur * 0.25 },
    ], delay);
    const tx = useKeyframeLoop([
      { value: 0, duration: 0 },
      { value: 4, duration: dur * 0.20 },
      { value: -2, duration: dur * 0.30 },
      { value: 6, duration: dur * 0.25 },
      { value: 0, duration: dur * 0.25 },
    ], delay);
    const ty = useKeyframeLoop([
      { value: 8, duration: 0 },
      { value: -4, duration: dur * 0.20 },
      { value: -14, duration: dur * 0.30 },
      { value: -8, duration: dur * 0.25 },
      { value: 8, duration: dur * 0.25 },
    ], delay);
    const s = useKeyframeLoop([
      { value: 0.4, duration: 0 },
      { value: 1.1, duration: dur * 0.20 },
      { value: 0.7, duration: dur * 0.30 },
      { value: 0.9, duration: dur * 0.25 },
      { value: 0.4, duration: dur * 0.25 },
    ], delay);
    return { o, tx, ty, s };
  };

  const e1 = makeEmber(3500, 0);
  const e2 = makeEmber(4500, 1500);
  const e3 = makeEmber(3800, 2500);
  const e4 = makeEmber(5000, 3500);
  const e5 = makeEmber(4000, 800);

  // Animated styles
  const canStyle = useAnimatedStyle(() => ({ transform: [{ scale: canS.value }], opacity: canO.value }));
  const depStyle = useAnimatedStyle(() => ({ transform: [{ scale: depS.value }, { translateX: depTx.value }], opacity: depO.value }));
  const bl2Style = useAnimatedStyle(() => ({ transform: [{ scale: bl2S.value }, { translateX: bl2Tx.value }], opacity: bl2O.value }));
  const sunStyle = useAnimatedStyle(() => ({ transform: [{ scale: sunS.value }], opacity: sunO.value }));

  const r1Style = useAnimatedStyle(() => ({ transform: [{ rotate: '-15deg' }, { scaleY: ray1s.value }], opacity: ray1o.value }));
  const r2Style = useAnimatedStyle(() => ({ transform: [{ rotate: '5deg' }, { scaleY: ray2s.value }], opacity: ray2o.value }));
  const r3Style = useAnimatedStyle(() => ({ transform: [{ rotate: '-30deg' }, { scaleY: ray3s.value }], opacity: ray3o.value }));
  const r4Style = useAnimatedStyle(() => ({ transform: [{ rotate: '20deg' }, { scaleY: ray4s.value }], opacity: ray4o.value }));
  const r5Style = useAnimatedStyle(() => ({ transform: [{ rotate: '-45deg' }, { scaleY: ray5s.value }], opacity: ray5o.value }));

  const flStyle = useAnimatedStyle(() => ({ transform: [{ translateX: flTx.value }], opacity: flO.value }));
  const hotStyle = useAnimatedStyle(() => ({ transform: [{ scale: hotS.value }], opacity: hotO.value }));
  const spkStyle = useAnimatedStyle(() => ({ transform: [{ scale: spkS.value }], opacity: spkO.value }));

  const st1Style = useAnimatedStyle(() => ({ transform: [{ translateY: st1ty.value }], opacity: st1o.value }));
  const st2Style = useAnimatedStyle(() => ({ transform: [{ translateY: st2ty.value }], opacity: st2o.value }));
  const st3Style = useAnimatedStyle(() => ({ transform: [{ translateY: st3ty.value }], opacity: st3o.value }));

  const makeEmberStyle = (e: ReturnType<typeof makeEmber>) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useAnimatedStyle(() => ({
      transform: [{ translateX: e.tx.value }, { translateY: e.ty.value }, { scale: e.s.value }],
      opacity: e.o.value,
    }));

  const e1Style = makeEmberStyle(e1);
  const e2Style = makeEmberStyle(e2);
  const e3Style = makeEmberStyle(e3);
  const e4Style = makeEmberStyle(e4);
  const e5Style = makeEmberStyle(e5);

  return (
    <View style={StyleSheet.absoluteFill}>
      {/* Green canopy */}
      <AnimatedView style={[{ position: 'absolute', width: CW + 40, height: 140, borderRadius: 70, left: -20, bottom: -40, backgroundColor: 'rgba(100,140,60,0.08)' }, canStyle]} />
      {/* Olive depth */}
      <AnimatedView style={[{ position: 'absolute', width: 200, height: 180, borderRadius: 90, right: -35, bottom: -45, backgroundColor: 'rgba(181,182,130,0.08)' }, depStyle]} />
      {/* Secondary bloom */}
      <AnimatedView style={[{ position: 'absolute', width: 130, height: 110, borderRadius: 55, left: 5, top: -5, backgroundColor: 'rgba(232,200,112,0.13)' }, bl2Style]} />
      {/* Sun */}
      <AnimatedView style={[{ position: 'absolute', width: 120, height: 120, borderRadius: 60, right: 15, top: -10, backgroundColor: 'rgba(254,230,160,0.30)' }, sunStyle]} />

      {/* Rays */}
      <AnimatedView style={[{ position: 'absolute', width: 3, height: 70, borderRadius: 999, right: 72, top: -15, backgroundColor: 'rgba(254,220,151,0.12)' }, r1Style]} />
      <AnimatedView style={[{ position: 'absolute', width: 2, height: 55, borderRadius: 999, right: 50, top: -10, backgroundColor: 'rgba(254,220,151,0.12)' }, r2Style]} />
      <AnimatedView style={[{ position: 'absolute', width: 2, height: 60, borderRadius: 999, right: 90, top: -5, backgroundColor: 'rgba(254,220,151,0.12)' }, r3Style]} />
      <AnimatedView style={[{ position: 'absolute', width: 2, height: 50, borderRadius: 999, right: 40, top: 0, backgroundColor: 'rgba(254,220,151,0.12)' }, r4Style]} />
      <AnimatedView style={[{ position: 'absolute', width: 1.5, height: 45, borderRadius: 999, right: 100, top: 5, backgroundColor: 'rgba(254,220,151,0.12)' }, r5Style]} />

      {/* Lens flare */}
      <AnimatedView style={[{ position: 'absolute', width: 200, height: 3, borderRadius: 2, right: -30, top: 48, backgroundColor: 'rgba(254,220,151,0.10)' }, flStyle]} />

      {/* Hot flash */}
      <AnimatedView style={[{ position: 'absolute', width: 44, height: 44, borderRadius: 22, right: 55, top: 22, backgroundColor: 'rgba(255,238,187,0.35)' }, hotStyle]} />
      {/* Spark */}
      <AnimatedView style={[{ position: 'absolute', width: 14, height: 14, borderRadius: 7, right: 74, top: 16, backgroundColor: 'rgba(255,253,230,0.60)' }, spkStyle]} />

      {/* Streaks */}
      <AnimatedView style={[{ position: 'absolute', width: 3.5, height: 65, borderRadius: 999, right: 72, top: 20, backgroundColor: 'rgba(254,220,151,0.12)' }, st1Style]} />
      <AnimatedView style={[{ position: 'absolute', width: 3, height: 50, borderRadius: 999, right: 110, top: 32, backgroundColor: 'rgba(181,182,130,0.10)' }, st2Style]} />
      <AnimatedView style={[{ position: 'absolute', width: 2.5, height: 40, borderRadius: 999, right: 52, top: 42, backgroundColor: 'rgba(254,220,151,0.08)' }, st3Style]} />

      {/* Embers */}
      <AnimatedView style={[{ position: 'absolute', width: 4, height: 4, borderRadius: 2, left: 50, top: 30, backgroundColor: 'rgba(254,220,151,0.7)' }, e1Style]} />
      <AnimatedView style={[{ position: 'absolute', width: 3, height: 3, borderRadius: 1.5, left: 110, top: 18, backgroundColor: 'rgba(255,240,200,0.6)' }, e2Style]} />
      <AnimatedView style={[{ position: 'absolute', width: 3, height: 3, borderRadius: 1.5, right: 95, top: 50, backgroundColor: 'rgba(254,220,151,0.5)' }, e3Style]} />
      <AnimatedView style={[{ position: 'absolute', width: 2.5, height: 2.5, borderRadius: 1.25, left: 80, top: 45, backgroundColor: 'rgba(232,200,112,0.6)' }, e4Style]} />
      <AnimatedView style={[{ position: 'absolute', width: 3, height: 3, borderRadius: 1.5, right: 130, top: 35, backgroundColor: 'rgba(255,240,200,0.5)' }, e5Style]} />
    </View>
  );
}

// ═══════════════════════════════════════════
// ★ BALANCE — Zen Reflection
// 13 elements: sky echo, earth echo, sky, earth,
// mist, horizon glow, horizon line, stone,
// 3 ripples, 2 reflection bands
// ═══════════════════════════════════════════

function BalanceGfx() {
  // Sky field — scale 0.88→1.12, translateX(-6→4), opacity 0.35→1, 12s
  const skyS = useAlternate(0.88, 1.12, 12000);
  const skyTx = useAlternate(-6, 4, 12000);
  const skyO = useAlternate(0.35, 1, 12000);

  // Sky echo — translateX(-10→0), scale 0.85→1.05, opacity 0.2→0.7
  const skyES = useAlternate(0.85, 1.05, 12000);
  const skyETx = useAlternate(-10, 0, 12000);
  const skyEO = useAlternate(0.2, 0.7, 12000);

  // Earth — opposite phase: scale 1.12→0.88, translateX(6→-4), opacity 1→0.35
  const earthS = useAlternate(1.12, 0.88, 12000);
  const earthTx = useAlternate(6, -4, 12000);
  const earthO = useAlternate(1, 0.35, 12000);

  // Earth echo
  const earthES = useAlternate(1.05, 0.85, 12000);
  const earthETx = useAlternate(10, 0, 12000);
  const earthEO = useAlternate(0.7, 0.2, 12000);

  // Mist: translateY(-2→2), opacity 0.2→0.7, 6s
  const mistTy = useAlternate(-2, 2, 6000);
  const mistO = useAlternate(0.2, 0.7, 6000);

  // Horizon glow + line: scaleX 0.88→1.12, opacity multi with 50% peak
  const hzSx = useAlternate(0.88, 1.12, 9000);
  const hzO = useAlternate(0.3, 1, 9000);

  // Stone: scale 0.9→1.1, opacity 0.4→1, 8s
  const stS = useAlternate(0.9, 1.1, 8000);
  const stO = useAlternate(0.4, 1, 8000);

  // Ripples: scale 0.4→2.2, opacity 0→0.5→0, 6s each with stagger
  const makeRipple = (delay: number) => {
    const s = useKeyframeLoop([
      { value: 0.4, duration: 0 },
      { value: 1.3, duration: 1200 },
      { value: 2.2, duration: 4800 },
    ], delay);
    const o = useKeyframeLoop([
      { value: 0, duration: 0 },
      { value: 0.5, duration: 1200 },
      { value: 0, duration: 4800 },
    ], delay);
    const ty = useKeyframeLoop([
      { value: 0, duration: 0 },
      { value: 3, duration: 1200 },
      { value: 6, duration: 4800 },
    ], delay);
    return { s, o, ty };
  };

  const rip1 = makeRipple(0);
  const rip2 = makeRipple(2000);
  const rip3 = makeRipple(4000);

  // Reflection bands — non-alternate: opacity 0.08→0.75→0.08, scaleX 0.7→1.3→0.7, translateX(-6→6→-6)
  const ref1o = useKeyframeLoop([
    { value: 0.08, duration: 0 },
    { value: 0.75, duration: 3000 },
    { value: 0.08, duration: 3000 },
  ]);
  const ref1sx = useKeyframeLoop([
    { value: 0.7, duration: 0 },
    { value: 1.3, duration: 3000 },
    { value: 0.7, duration: 3000 },
  ]);
  const ref1tx = useKeyframeLoop([
    { value: -6, duration: 0 },
    { value: 6, duration: 3000 },
    { value: -6, duration: 3000 },
  ]);

  const ref2o = useKeyframeLoop([
    { value: 0.04, duration: 0 },
    { value: 0.375, duration: 4000 },
    { value: 0.04, duration: 4000 },
  ], 2000);
  const ref2sx = useKeyframeLoop([
    { value: 0.7, duration: 0 },
    { value: 1.3, duration: 4000 },
    { value: 0.7, duration: 4000 },
  ], 2000);
  const ref2tx = useKeyframeLoop([
    { value: -6, duration: 0 },
    { value: 6, duration: 4000 },
    { value: -6, duration: 4000 },
  ], 2000);

  // Styles
  const skyStyle = useAnimatedStyle(() => ({ transform: [{ scale: skyS.value }, { translateX: skyTx.value }], opacity: skyO.value }));
  const skyEStyle = useAnimatedStyle(() => ({ transform: [{ scale: skyES.value }, { translateX: skyETx.value }], opacity: skyEO.value }));
  const earthStyle = useAnimatedStyle(() => ({ transform: [{ scale: earthS.value }, { translateX: earthTx.value }], opacity: earthO.value }));
  const earthEStyle = useAnimatedStyle(() => ({ transform: [{ scale: earthES.value }, { translateX: earthETx.value }], opacity: earthEO.value }));
  const mistStyle = useAnimatedStyle(() => ({ transform: [{ translateY: mistTy.value }], opacity: mistO.value }));
  const hzStyle = useAnimatedStyle(() => ({ transform: [{ scaleX: hzSx.value }], opacity: hzO.value }));
  const stStyle = useAnimatedStyle(() => ({ transform: [{ scale: stS.value }], opacity: stO.value }));

  const makeRipStyle = (r: ReturnType<typeof makeRipple>) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useAnimatedStyle(() => ({
      transform: [{ scale: r.s.value }, { translateY: r.ty.value }],
      opacity: r.o.value,
    }));

  const rip1Style = makeRipStyle(rip1);
  const rip2Style = makeRipStyle(rip2);
  const rip3Style = makeRipStyle(rip3);

  const ref1Style = useAnimatedStyle(() => ({ transform: [{ scaleX: ref1sx.value }, { translateX: ref1tx.value }], opacity: ref1o.value }));
  const ref2Style = useAnimatedStyle(() => ({ transform: [{ scaleX: ref2sx.value }, { translateX: ref2tx.value }], opacity: ref2o.value }));

  return (
    <View style={StyleSheet.absoluteFill}>
      {/* Sky echo */}
      <AnimatedView style={[{ position: 'absolute', width: 160, height: 170, borderRadius: 85, left: -30, top: 0, backgroundColor: 'rgba(26,90,100,0.08)' }, skyEStyle]} />
      {/* Earth echo */}
      <AnimatedView style={[{ position: 'absolute', width: 160, height: 170, borderRadius: 85, right: -30, bottom: 0, backgroundColor: 'rgba(106,138,112,0.08)' }, earthEStyle]} />
      {/* Sky */}
      <AnimatedView style={[{ position: 'absolute', width: 220, height: 240, borderRadius: 110, left: -65, top: -50, backgroundColor: 'rgba(40,102,110,0.14)' }, skyStyle]} />
      {/* Earth */}
      <AnimatedView style={[{ position: 'absolute', width: 220, height: 240, borderRadius: 110, right: -65, bottom: -50, backgroundColor: 'rgba(124,152,133,0.14)' }, earthStyle]} />

      {/* Mist */}
      <AnimatedView style={[{ position: 'absolute', width: '65%', height: 50, borderRadius: 25, left: '17.5%', top: '42%', backgroundColor: 'rgba(40,102,110,0.06)' }, mistStyle]} />

      {/* Horizon glow */}
      <AnimatedView style={[{ position: 'absolute', width: '80%', height: 24, borderRadius: 12, left: '10%', top: '45%', backgroundColor: 'rgba(181,182,130,0.06)' }, hzStyle]} />
      {/* Horizon line */}
      <AnimatedView style={[{ position: 'absolute', width: '85%', height: 2, borderRadius: 1, left: '7.5%', top: '50%', backgroundColor: 'rgba(181,182,130,0.20)' }, hzStyle]} />

      {/* Center stone */}
      <AnimatedView style={[{ position: 'absolute', width: 10, height: 10, borderRadius: 5, left: '50%', marginLeft: -5, top: '50%', marginTop: -5, backgroundColor: 'rgba(200,210,195,0.35)' }, stStyle]} />

      {/* Ripples */}
      <AnimatedView style={[{ position: 'absolute', width: 40, height: 14, borderRadius: 7, left: '50%', marginLeft: -20, top: '58%', borderWidth: 1, borderColor: 'rgba(200,210,195,0.08)', backgroundColor: 'transparent' }, rip1Style]} />
      <AnimatedView style={[{ position: 'absolute', width: 60, height: 18, borderRadius: 9, left: '50%', marginLeft: -30, top: '62%', borderWidth: 1, borderColor: 'rgba(200,210,195,0.08)', backgroundColor: 'transparent' }, rip2Style]} />
      <AnimatedView style={[{ position: 'absolute', width: 85, height: 22, borderRadius: 11, left: '50%', marginLeft: -42, top: '66%', borderWidth: 1, borderColor: 'rgba(200,210,195,0.08)', backgroundColor: 'transparent' }, rip3Style]} />

      {/* Reflection bands */}
      <AnimatedView style={[{ position: 'absolute', width: 90, height: 2, borderRadius: 1, left: '50%', marginLeft: -45, top: '60%', backgroundColor: 'rgba(254,220,151,0.20)' }, ref1Style]} />
      <AnimatedView style={[{ position: 'absolute', width: 55, height: 2, borderRadius: 1, left: '50%', marginLeft: -20, top: '72%', backgroundColor: 'rgba(254,220,151,0.20)' }, ref2Style]} />
    </View>
  );
}

// ═══════════════════════════════════════════
// ★ BREATHE WELL — Pure Atmosphere
// 16 elements: atmo, 6 rings + core, wave SVG,
// ground, 2 warmth accents, 5 dust particles
// ═══════════════════════════════════════════

function BreatheWellGfx() {
  const CW = SCREEN_W - 40;

  // Atmosphere: scale 0.97→1.03, opacity 0.5→1, 12s
  const atS = useAlternate(0.97, 1.03, 12000);
  const atO = useAlternate(0.5, 1, 12000);

  // Rings — all use bwR: scale 0.78→1.22, opacity 0.3→1, 7s with varied delays
  const ringS5 = useAlternate(0.78, 1.22, 7000);
  const ringO5 = useAlternate(0.3, 1, 7000);
  const ringS4 = useAlternate(0.78, 1.22, 7000, 500);
  const ringO4 = useAlternate(0.3, 1, 7000, 500);
  const ringS3 = useAlternate(0.78, 1.22, 7000, 1000);
  const ringO3 = useAlternate(0.3, 1, 7000, 1000);
  const ringS2 = useAlternate(0.78, 1.22, 7000, 1500);
  const ringO2 = useAlternate(0.3, 1, 7000, 1500);
  const ringS1 = useAlternate(0.78, 1.22, 7000, 2000);
  const ringO1 = useAlternate(0.3, 1, 7000, 2000);
  const ringS0 = useAlternate(0.78, 1.22, 7000, 2500);
  const ringO0 = useAlternate(0.3, 1, 7000, 2500);

  // Wave: dashOffset 0→-80, opacity 0.3→0.8→0.3, 6s non-alternate
  const waveOffset = useKeyframeLoop([
    { value: 0, duration: 0 },
    { value: -40, duration: 3000 },
    { value: -80, duration: 3000 },
  ]);
  const waveO = useKeyframeLoop([
    { value: 0.3, duration: 0 },
    { value: 0.8, duration: 3000 },
    { value: 0.3, duration: 3000 },
  ]);

  // Ground: translateY(2→-2), opacity 0.25→0.7→0.25, 11s
  const gndTy = useAlternate(2, -2, 11000);
  const gndO = useKeyframeLoop([
    { value: 0.25, duration: 0 },
    { value: 0.7, duration: 5500 },
    { value: 0.25, duration: 5500 },
  ]);

  // Warm accents — opacity 0.15→0.8→0.15, translateX(4→-4→4), scale 0.92→1.08→0.92, 6s
  const w1o = useKeyframeLoop([
    { value: 0.15, duration: 0 },
    { value: 0.8, duration: 3000 },
    { value: 0.15, duration: 3000 },
  ]);
  const w1tx = useKeyframeLoop([
    { value: 4, duration: 0 },
    { value: -4, duration: 3000 },
    { value: 4, duration: 3000 },
  ]);
  const w1s = useKeyframeLoop([
    { value: 0.92, duration: 0 },
    { value: 1.08, duration: 3000 },
    { value: 0.92, duration: 3000 },
  ]);

  const w2o = useKeyframeLoop([
    { value: 0.15, duration: 0 },
    { value: 0.8, duration: 3000 },
    { value: 0.15, duration: 3000 },
  ], 3000);
  const w2tx = useKeyframeLoop([
    { value: 4, duration: 0 },
    { value: -4, duration: 3000 },
    { value: 4, duration: 3000 },
  ], 3000);
  const w2s = useKeyframeLoop([
    { value: 0.92, duration: 0 },
    { value: 1.08, duration: 3000 },
    { value: 0.92, duration: 3000 },
  ], 3000);

  // Dust particles — multi keyframe translate & opacity
  const makeDust = (dur: number, delay: number) => {
    const o = useKeyframeLoop([
      { value: 0, duration: 0 },
      { value: 0.55, duration: dur * 0.20 },
      { value: 0.15, duration: dur * 0.25 },
      { value: 0.4, duration: dur * 0.25 },
      { value: 0.1, duration: dur * 0.20 },
      { value: 0, duration: dur * 0.10 },
    ], delay);
    const tx = useKeyframeLoop([
      { value: 0, duration: 0 },
      { value: 6, duration: dur * 0.20 },
      { value: -3, duration: dur * 0.25 },
      { value: 8, duration: dur * 0.25 },
      { value: 2, duration: dur * 0.20 },
      { value: 0, duration: dur * 0.10 },
    ], delay);
    const ty = useKeyframeLoop([
      { value: 0, duration: 0 },
      { value: -5, duration: dur * 0.20 },
      { value: -12, duration: dur * 0.25 },
      { value: -3, duration: dur * 0.25 },
      { value: -8, duration: dur * 0.20 },
      { value: 0, duration: dur * 0.10 },
    ], delay);
    return { o, tx, ty };
  };

  const d1 = makeDust(9000, 0);
  const d2 = makeDust(11000, 3000);
  const d3 = makeDust(10000, 6000);
  const d4 = makeDust(8000, 4500);
  const d5 = makeDust(12000, 8000);

  // Animated styles
  const atStyle = useAnimatedStyle(() => ({ transform: [{ scale: atS.value }], opacity: atO.value }));

  const r5Style = useAnimatedStyle(() => ({ transform: [{ scale: ringS5.value }], opacity: ringO5.value }));
  const r4Style = useAnimatedStyle(() => ({ transform: [{ scale: ringS4.value }], opacity: ringO4.value }));
  const r3Style = useAnimatedStyle(() => ({ transform: [{ scale: ringS3.value }], opacity: ringO3.value }));
  const r2Style = useAnimatedStyle(() => ({ transform: [{ scale: ringS2.value }], opacity: ringO2.value }));
  const r1Style = useAnimatedStyle(() => ({ transform: [{ scale: ringS1.value }], opacity: ringO1.value }));
  const r0Style = useAnimatedStyle(() => ({ transform: [{ scale: ringS0.value }], opacity: ringO0.value }));

  const waveProps = useAnimatedProps(() => ({
    strokeDashoffset: waveOffset.value,
    opacity: waveO.value,
  }));

  const gndStyle = useAnimatedStyle(() => ({ transform: [{ translateY: gndTy.value }], opacity: gndO.value }));

  const w1Style = useAnimatedStyle(() => ({ transform: [{ translateX: w1tx.value }, { scale: w1s.value }], opacity: w1o.value }));
  const w2Style = useAnimatedStyle(() => ({ transform: [{ translateX: w2tx.value }, { scale: w2s.value }], opacity: w2o.value }));

  const makeDustStyle = (d: ReturnType<typeof makeDust>) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useAnimatedStyle(() => ({
      transform: [{ translateX: d.tx.value }, { translateY: d.ty.value }],
      opacity: d.o.value,
    }));

  const d1Style = makeDustStyle(d1);
  const d2Style = makeDustStyle(d2);
  const d3Style = makeDustStyle(d3);
  const d4Style = makeDustStyle(d4);
  const d5Style = makeDustStyle(d5);

  const dustColor = 'rgba(160,210,200,0.45)';
  // Ring center X/Y — positioned from the right side
  const ringCX = CW * 0.6;
  const halfH = CARD_H / 2;

  return (
    <View style={StyleSheet.absoluteFill}>
      {/* Atmosphere */}
      <AnimatedView style={[{ position: 'absolute', width: CW + 40, height: 190, borderRadius: 95, left: -20, top: -25, backgroundColor: 'rgba(20,80,96,0.10)' }, atStyle]} />

      {/* Ring 5 (outermost) */}
      <AnimatedView style={[{ position: 'absolute', width: 180, height: 180, borderRadius: 90, right: 8, top: halfH - 105, borderWidth: 1, borderColor: 'rgba(58,154,160,0.04)', backgroundColor: 'transparent' }, r5Style]} />
      {/* Ring 4 */}
      <AnimatedView style={[{ position: 'absolute', width: 145, height: 145, borderRadius: 73, right: 25, top: halfH - 88, backgroundColor: 'rgba(20,80,88,0.06)' }, r4Style]} />
      {/* Ring 3 */}
      <AnimatedView style={[{ position: 'absolute', width: 110, height: 110, borderRadius: 55, right: 43, top: halfH - 70, backgroundColor: 'rgba(30,100,108,0.10)' }, r3Style]} />
      {/* Ring 2 */}
      <AnimatedView style={[{ position: 'absolute', width: 78, height: 78, borderRadius: 39, right: 59, top: halfH - 54, backgroundColor: 'rgba(45,130,138,0.14)' }, r2Style]} />
      {/* Ring 1 */}
      <AnimatedView style={[{ position: 'absolute', width: 48, height: 48, borderRadius: 24, right: 74, top: halfH - 39, backgroundColor: 'rgba(58,154,160,0.24)' }, r1Style]} />
      {/* Core */}
      <AnimatedView style={[{ position: 'absolute', width: 18, height: 18, borderRadius: 9, right: 89, top: halfH - 24, backgroundColor: 'rgba(130,220,210,0.38)' }, r0Style]} />

      {/* Breath wave SVG */}
      <View style={{ position: 'absolute', left: 0, bottom: 35, width: '100%', height: 30, overflow: 'hidden' }}>
        <Svg viewBox="0 0 374 30" width="100%" height={30} preserveAspectRatio="none">
          <AnimatedPath
            d="M0,15 C20,5 40,5 60,15 C80,25 100,25 120,15 C140,5 160,5 180,15 C200,25 220,25 240,15 C260,5 280,5 300,15 C320,25 340,25 360,15 L374,15"
            fill="none"
            stroke="rgba(58,154,160,0.12)"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeDasharray="4 6"
            animatedProps={waveProps}
          />
        </Svg>
      </View>

      {/* Ground band */}
      <AnimatedView style={[{ position: 'absolute', width: '55%', height: 45, borderRadius: 23, left: 5, bottom: -12, backgroundColor: 'rgba(124,152,133,0.06)' }, gndStyle]} />

      {/* Warm accents */}
      <AnimatedView style={[{ position: 'absolute', width: 55, height: 40, borderRadius: 20, left: 28, top: 32, backgroundColor: 'rgba(254,220,151,0.07)' }, w1Style]} />
      <AnimatedView style={[{ position: 'absolute', width: 35, height: 28, borderRadius: 14, right: 22, bottom: 24, backgroundColor: 'rgba(232,200,112,0.05)' }, w2Style]} />

      {/* Floating dust */}
      <AnimatedView style={[{ position: 'absolute', width: 3, height: 3, borderRadius: 1.5, left: '18%', top: '28%', backgroundColor: dustColor }, d1Style]} />
      <AnimatedView style={[{ position: 'absolute', width: 2, height: 2, borderRadius: 1, left: '38%', top: '18%', backgroundColor: dustColor }, d2Style]} />
      <AnimatedView style={[{ position: 'absolute', width: 2.5, height: 2.5, borderRadius: 1.25, left: '12%', top: '52%', backgroundColor: dustColor }, d3Style]} />
      <AnimatedView style={[{ position: 'absolute', width: 2, height: 2, borderRadius: 1, left: '50%', top: '60%', backgroundColor: dustColor }, d4Style]} />
      <AnimatedView style={[{ position: 'absolute', width: 2, height: 2, borderRadius: 1, left: '25%', top: '70%', backgroundColor: dustColor }, d5Style]} />
    </View>
  );
}

// ═══════════════════════════════════════════
// INTENT CARD WRAPPER
// ═══════════════════════════════════════════

const CARD_GRADIENTS: Record<string, { colors: [string, string, ...string[]]; start: { x: number; y: number }; end: { x: number; y: number } }> = {
  'wind-down': {
    colors: ['#020E1E', '#042440', '#063A56', '#054A60', '#043E52'],
    start: { x: 0.1, y: 0 },
    end: { x: 0.7, y: 1 },
  },
  sharpen: {
    colors: ['#061420', '#0A2A3E', '#124A5C', '#1A5A68', '#165060'],
    start: { x: 0.1, y: 0 },
    end: { x: 0.7, y: 1 },
  },
  energize: {
    colors: ['#0E2818', '#1A4430', '#266838', '#348240', '#2E7838'],
    start: { x: 0.1, y: 0 },
    end: { x: 0.7, y: 1 },
  },
  balance: {
    colors: ['#0C2018', '#163828', '#204E38', '#265A40', '#1E4E35'],
    start: { x: 0.1, y: 0 },
    end: { x: 0.7, y: 1 },
  },
  'breathe-well': {
    colors: ['#021520', '#053248', '#094458', '#0C4E5E', '#084452'],
    start: { x: 0.1, y: 0 },
    end: { x: 0.7, y: 1 },
  },
};

function GfxForCard({ id }: { id: string }) {
  switch (id) {
    case 'wind-down':
      return <WindDownGfx />;
    case 'sharpen':
      return <SharpenGfx />;
    case 'energize':
      return <EnergizeGfx />;
    case 'balance':
      return <BalanceGfx />;
    case 'breathe-well':
      return <BreatheWellGfx />;
    default:
      return null;
  }
}

// ═══════════════════════════════════════════
// MAIN SCREEN
// ═══════════════════════════════════════════

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const [disclaimerSeen, onboardingSeen] = await Promise.all([
        AsyncStorage.getItem(DISCLAIMER_KEY),
        AsyncStorage.getItem(ONBOARDING_KEY),
      ]);
      if (!disclaimerSeen) setShowDisclaimer(true);
      if (!onboardingSeen) setShowOnboarding(true);
      setLoaded(true);
    })();
  }, []);

  const dismissDisclaimer = useCallback(async () => {
    setShowDisclaimer(false);
    await AsyncStorage.setItem(DISCLAIMER_KEY, 'true');
  }, []);

  const dismissOnboarding = useCallback(async () => {
    setShowOnboarding(false);
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
  }, []);

  const handleQuickReset = useCallback(() => {
    router.push('/session/physiological-sigh');
  }, [router]);

  const handleCardPress = useCallback(
    (route: string) => {
      router.push(route as any);
    },
    [router],
  );

  if (!loaded) {
    return <View style={[s.flex, { backgroundColor: C.bg }]} />;
  }

  return (
    <View style={[s.flex, { backgroundColor: C.bg }]}>
      <SafeAreaView edges={['top']} style={s.flex}>
        <ScrollView
          contentContainerStyle={s.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* ─── Hero ─── */}
          <View style={s.hero}>
            <HeroOrb />
            <Text style={s.appName}>Breath Atlas</Text>
            <Text style={s.appTagline}>Guided breathwork for every state</Text>
          </View>

          {/* ─── Info button ─── */}
          <Pressable
            style={s.infoBtn}
            onPress={() => setShowDisclaimer(true)}
            accessibilityRole="button"
            accessibilityLabel="Show safety guidance"
          >
            <Text style={s.infoBtnText}>i</Text>
          </Pressable>

          {/* ─── Quick Reset card ─── */}
          <Animated.View entering={FadeInDown.delay(50).duration(450)}>
            <PressableScale
              onPress={handleQuickReset}
              accessibilityRole="button"
              accessibilityLabel="Quick Reset session"
            >
              <LinearGradient
                colors={['#02304C', '#054A64', '#08546A']}
                start={{ x: 0.15, y: 0 }}
                end={{ x: 0.85, y: 1 }}
                style={s.qrCard}
              >
                <QuickResetGlow />
                <View style={s.qrText}>
                  <Text style={s.qrLabel}>Quick Reset</Text>
                  <Text style={s.qrSub}>One double-inhale sigh to reset</Text>
                </View>
                <QuickResetOrb />
              </LinearGradient>
            </PressableScale>
          </Animated.View>

          {/* ─── Intent cards ─── */}
          {intentCards.map((card) => {
            const grad = CARD_GRADIENTS[card.id];
            return (
              <Animated.View
                key={card.id}
                entering={FadeInDown.delay(card.entryDelay).duration(450)}
              >
                <PressableScale
                  onPress={() => handleCardPress(card.route)}
                  accessibilityRole="button"
                  accessibilityLabel={`${card.title}. ${card.subtitle}`}
                  style={{ marginBottom: 14 }}
                >
                  <View style={s.card}>
                    <LinearGradient
                      colors={grad.colors}
                      start={grad.start}
                      end={grad.end}
                      style={s.ic}
                    >
                      {/* Animated graphic layer */}
                      <View style={s.gfx}>
                        <GfxForCard id={card.id} />
                      </View>

                      {/* Text content — bottom-aligned */}
                      <View style={s.cardSpacer} />
                      <Text style={s.il}>{card.title}</Text>
                      <Text style={s.is}>{card.subtitle}</Text>
                    </LinearGradient>
                  </View>
                </PressableScale>
              </Animated.View>
            );
          })}

          <View style={{ height: 60 }} />
        </ScrollView>
      </SafeAreaView>

      {/* ─── Safety Modal ─── */}
      <Modal
        visible={showDisclaimer}
        animationType="slide"
        transparent
        onRequestClose={dismissDisclaimer}
      >
        <Pressable style={s.modalOverlay} onPress={dismissDisclaimer}>
          <Pressable
            style={[s.modalSheet, { paddingBottom: insets.bottom + spacing.lg }]}
            onPress={() => {}}
          >
            <View style={s.modalHeader}>
              <View>
                <Text style={s.modalLabel}>BEFORE YOU BEGIN</Text>
                <Text style={s.modalTitle}>Safety guidance</Text>
              </View>
              <Pressable
                onPress={dismissDisclaimer}
                style={s.modalClose}
                accessibilityLabel="Close safety guidance"
              >
                <Text style={s.modalCloseText}>{'\u2715'}</Text>
              </Pressable>
            </View>
            <View style={s.modalBody}>
              <Text style={s.modalBodyText}>
                BreathFlow is for general wellness and guided pacing. It is not a
                medical device or a substitute for clinical care.
              </Text>
              <Text style={s.modalBodyText}>
                Keep the breath gentle. Shorten or remove any holds if you feel
                strain, and stop early if you feel lightheaded, distressed, or
                uncomfortable.
              </Text>
              <Text style={s.modalBodyText}>
                If you have a respiratory, cardiovascular, or other medical
                condition that may affect breathing exercises, use extra caution
                and follow the guidance of your clinician.
              </Text>
            </View>
            <View style={s.modalCTA}>
              <Pressable onPress={dismissDisclaimer} style={s.modalButton}>
                <Text style={s.modalButtonText}>I understand</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

// ─── Styles ───

const s = StyleSheet.create({
  flex: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 60,
  },

  // Hero
  hero: {
    alignItems: 'center',
    paddingTop: 44,
    marginBottom: 8,
  },
  appName: {
    fontSize: 34,
    fontWeight: '200',
    letterSpacing: 3.5,
    color: C.text,
  },
  appTagline: {
    fontSize: 14,
    fontWeight: '400',
    color: C.sage,
    marginTop: 6,
    letterSpacing: 0.3,
  },

  // Info button
  infoBtn: {
    position: 'absolute',
    right: 24,
    top: 56,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(40,102,110,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(40,102,110,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  infoBtnText: {
    fontSize: 14,
    fontWeight: '600',
    fontStyle: 'italic',
    color: C.sage,
  },

  // Onboarding
  onboarding: {
    textAlign: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    marginBottom: 12,
    color: 'rgba(124,152,133,0.55)',
    fontSize: 15,
    letterSpacing: 0.3,
  },

  // Quick Reset card
  qrCard: {
    height: 78,
    borderRadius: 22,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(40,102,110,0.18)',
  },
  qrText: {
    zIndex: 2,
  },
  qrLabel: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
    color: C.gold,
  },
  qrSub: {
    fontSize: 12,
    marginTop: 4,
    color: 'rgba(240,244,241,0.42)',
  },

  // Intent cards
  card: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(124,152,133,0.08)',
  },
  ic: {
    height: CARD_H,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 20,
    justifyContent: 'space-between',
  },
  gfx: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    borderRadius: 24,
  },
  cardSpacer: {
    flex: 1,
  },
  il: {
    fontSize: 28,
    fontWeight: '600',
    letterSpacing: -0.3,
    color: C.text,
    marginBottom: 6,
    zIndex: 8,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 12,
  },
  is: {
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 19,
    color: 'rgba(240,244,241,0.60)',
    zIndex: 8,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  // Modal
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  modalSheet: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: WH(0.10),
    backgroundColor: '#0f1821',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: WH(0.06),
  },
  modalLabel: {
    fontSize: 11,
    ...typography.medium,
    letterSpacing: 2,
    color: 'rgba(40,102,110,0.38)',
  },
  modalTitle: {
    fontSize: 22,
    ...typography.semibold,
    letterSpacing: -0.55,
    color: C.text,
    marginTop: 4,
  },
  modalClose: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: WH(0.05),
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseText: {
    fontSize: 16,
    color: WH(0.70),
  },
  modalBody: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 16,
  },
  modalBodyText: {
    fontSize: 14,
    ...typography.regular,
    lineHeight: 24,
    color: WH(0.72),
  },
  modalCTA: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  modalButton: {
    borderRadius: 16,
    backgroundColor: C.text,
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 14,
    ...typography.semibold,
    color: C.primaryDark,
  },
});
