import { StyleSheet, Text, View } from 'react-native';
import { useEffect, useRef, useState } from 'react';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { VisualizationProps } from '../../types/breath';

const PILL_HEIGHT = 440;
const PILL_WIDTH = 144;
const PILL_RADIUS = PILL_WIDTH / 2;
const BALL_SIZE = 76;
const BALL_RADIUS = BALL_SIZE / 2;
const TRAVEL = PILL_HEIGHT - PILL_WIDTH;

const INHALE_EASING = Easing.bezier(0.4, 0.0, 0.2, 1);
const SIP_EASING = Easing.bezier(0.2, 0.8, 0.3, 1);
const EXHALE_EASING = Easing.linear;
const HOLD_THRESHOLD = 0.05;

// Breath range for Quick Reset
const LO = 0.1;
const HI = 1.0;

export function PillVisualization({
  phaseLabel,
  currentLevel,
  levelTo,
  phaseRemainingMs,
  animationToken,
  isRunning,
  reducedMotion,
}: VisualizationProps) {
  const level = useSharedValue(currentLevel);
  // Exhale counter — only counts during exhale phases
  const [exhaleCount, setExhaleCount] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isExhalePhase = levelTo < currentLevel;

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    if (isRunning && isExhalePhase) {
      // Start at 1 immediately, then tick
      setExhaleCount(1);
      const totalSec = Math.round(phaseRemainingMs / 1000);
      intervalRef.current = setInterval(() => {
        setExhaleCount((c) => (c >= totalSec ? c : c + 1));
      }, 1000);
    } else {
      setExhaleCount(0);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animationToken, isRunning]);

  useEffect(() => {
    if (!isRunning || reducedMotion) {
      level.value = currentLevel;
      return;
    }

    // NEVER snap level.value = currentLevel during a running session.
    // Always let withTiming chain from wherever the ball currently is.
    // The previous phase's withTiming targets the exact value that
    // the next phase starts from (e.g., exhale targets 0.1, next
    // inhale starts at 0.1). So the ball is already in position.
    // Snapping causes a brightness/position hop because the engine
    // ticker's currentLevel is sampled every 100ms and may differ
    // from the animation's actual position by a few pixels.

    const diff = levelTo - currentLevel;
    const isHold = Math.abs(diff) < HOLD_THRESHOLD;
    const isRising = diff > 0;
    const isExhale = diff < 0;
    const isSip = isRising && phaseRemainingMs < 1500 && diff < 0.35;

    if (isHold) {
      level.value = withRepeat(
        withTiming(levelTo + 0.003, { duration: 1500, easing: Easing.inOut(Easing.sin) }),
        -1,
        true,
      );
    } else if (isSip) {
      level.value = withTiming(levelTo, {
        duration: Math.max(phaseRemainingMs, 100),
        easing: SIP_EASING,
      });
    } else if (isExhale) {
      level.value = withTiming(levelTo, {
        duration: Math.max(phaseRemainingMs, 100),
        easing: EXHALE_EASING,
      });
    } else {
      level.value = withTiming(levelTo, {
        duration: Math.max(phaseRemainingMs, 100),
        easing: INHALE_EASING,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animationToken]);

  // Aura pulse — spikes on each phase change then decays
  const auraPulse = useSharedValue(0);

  // Trigger aura pulse on phase change
  useEffect(() => {
    if (isRunning) {
      auraPulse.value = 1;
      auraPulse.value = withTiming(0, { duration: 500, easing: Easing.out(Easing.quad) });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animationToken]);

  // Ball position — no scale, just vertical movement
  const ballStyle = useAnimatedStyle(() => {
    const translateY = interpolate(level.value, [LO, HI], [TRAVEL / 2, -TRAVEL / 2], 'clamp');
    return { transform: [{ translateY }] };
  });

  // Glow — follows ball, pulses on phase change
  const glowStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(level.value, [LO, HI], [TRAVEL / 2, -TRAVEL / 2], 'clamp') },
      { scale: interpolate(auraPulse.value, [0, 1], [1, 1.4]) },
    ],
    opacity: interpolate(auraPulse.value, [0, 1], [0.10, 0.25]),
  }));

  const outerGlowStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(level.value, [LO, HI], [TRAVEL / 2, -TRAVEL / 2], 'clamp') },
      { scale: interpolate(auraPulse.value, [0, 1], [1, 1.6]) },
    ],
    opacity: interpolate(auraPulse.value, [0, 1], [0.06, 0.18]),
  }));

  // Pill inner fill — static subtle tint, no animation
  const fillStyle = { height: PILL_HEIGHT * 0.15, opacity: 0.04 };

  // Count text follows the ball
  const countStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(level.value, [LO, HI], [TRAVEL / 2, -TRAVEL / 2], 'clamp') },
    ],
  }));

  // What to show on the ball:
  // - Inhale: nothing (just watch the ball rise)
  // - Sip: "+"
  // - Exhale: "1" "2" "3" "4" "5" "6"
  // - Not running: nothing
  let ballText = '';
  if (isRunning) {
    if (phaseLabel === 'Sip' || phaseLabel === 'Top-up') {
      ballText = '+';
    } else if (isExhalePhase && exhaleCount > 0) {
      ballText = String(exhaleCount);
    }
  }

  return (
    <View style={styles.container}>
      {/* Phase label above pill */}
      <Text style={styles.phaseLabel}>{phaseLabel}</Text>

      {/* Pill outline */}
      <View style={styles.pill}>
        {/* Inner fill */}
        <Animated.View style={[styles.fill, fillStyle]} />

        {/* Tick marks */}
        {[0.2, 0.4, 0.6, 0.8].map((pos) => (
          <View
            key={pos}
            style={[styles.tick, { bottom: PILL_WIDTH / 2 + TRAVEL * pos - 0.5 }]}
          />
        ))}

        {/* Outer glow */}
        <Animated.View style={[styles.outerGlow, outerGlowStyle]} />

        {/* Inner glow */}
        <Animated.View style={[styles.glow, glowStyle]} />

        {/* Ball */}
        <Animated.View style={[styles.ball, ballStyle]} />

        {/* Count circle — always present, rides with the ball */}
        <Animated.View style={[styles.countWrap, countStyle]}>
          <View style={styles.countCircleOuter3}>
            <View style={styles.countCircleOuter2}>
              <View style={styles.countCircleOuter}>
                <View style={styles.countCircleMid}>
                  <View style={styles.countCircle}>
                    <Text style={styles.countText}>{ballText}</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  phaseLabel: {
    fontSize: 15,
    fontWeight: '400',
    color: 'rgba(254,220,151,0.6)',
    marginBottom: 16,
    letterSpacing: 0.3,
  },
  pill: {
    width: PILL_WIDTH,
    height: PILL_HEIGHT,
    borderRadius: PILL_RADIUS,
    borderWidth: 1,
    borderColor: 'rgba(254,220,151,0.12)',
    backgroundColor: 'rgba(254,220,151,0.02)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  fill: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(254,220,151,0.05)',
    borderRadius: PILL_RADIUS,
  },
  tick: {
    position: 'absolute',
    left: 24,
    right: 24,
    height: 1,
    backgroundColor: 'rgba(254,220,151,0.06)',
    borderRadius: 0.5,
  },
  outerGlow: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(254,220,151,0.06)',
  },
  glow: {
    position: 'absolute',
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: 'rgba(254,220,151,0.10)',
  },
  ball: {
    width: BALL_SIZE,
    height: BALL_SIZE,
    borderRadius: BALL_RADIUS,
    backgroundColor: 'rgba(254,225,165,0.85)',
  },
  countWrap: {
    position: 'absolute',
    width: BALL_SIZE,
    height: BALL_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countCircleOuter3: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(254,228,170,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  countCircleOuter2: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(254,232,185,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  countCircleOuter: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,240,210,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  countCircleMid: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,245,225,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  countCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,250,240,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#033f63',
  },
});
