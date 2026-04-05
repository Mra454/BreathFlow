import { View, StyleSheet } from 'react-native';
import { useEffect } from 'react';
import Svg, { Circle, Polygon } from 'react-native-svg';
import Animated, {
  Easing,
  interpolate,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { VisualizationProps } from '../../types/breath';
import { motion, breathScale } from '../../constants/theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle as any);

const SIZE = 248;
const CENTER = SIZE / 2;
const RADIUS = 100;

const V0 = { x: CENTER + RADIUS * Math.cos(-Math.PI / 2), y: CENTER + RADIUS * Math.sin(-Math.PI / 2) };
const V1 = { x: CENTER + RADIUS * Math.cos(Math.PI / 6), y: CENTER + RADIUS * Math.sin(Math.PI / 6) };
const V2 = { x: CENTER + RADIUS * Math.cos((5 * Math.PI) / 6), y: CENTER + RADIUS * Math.sin((5 * Math.PI) / 6) };

const TRIANGLE_POINTS = `${V0.x},${V0.y} ${V1.x},${V1.y} ${V2.x},${V2.y}`;

function pointFromTriangleProgress(progress: number): { x: number; y: number } {
  'worklet';
  const p = ((progress % 1) + 1) % 1;
  const third = 1 / 3;

  let fromX: number, fromY: number, toX: number, toY: number, t: number;

  if (p < third) {
    t = p / third;
    fromX = V0.x; fromY = V0.y;
    toX = V1.x; toY = V1.y;
  } else if (p < third * 2) {
    t = (p - third) / third;
    fromX = V1.x; fromY = V1.y;
    toX = V2.x; toY = V2.y;
  } else {
    t = (p - third * 2) / third;
    fromX = V2.x; fromY = V2.y;
    toX = V0.x; toY = V0.y;
  }

  return {
    x: fromX + (toX - fromX) * t,
    y: fromY + (toY - fromY) * t,
  };
}

export function TriangleVisualization({
  currentLevel,
  levelTo,
  phaseRemainingMs,
  cycleProgress,
  animationToken,
  isRunning,
  reducedMotion,
  palette,
}: VisualizationProps) {
  const level = useSharedValue(currentLevel);
  const progress = useSharedValue(cycleProgress ?? 0);

  useEffect(() => {
    progress.value = reducedMotion
      ? (cycleProgress ?? 0)
      : withTiming(cycleProgress ?? 0, { duration: 180, easing: Easing.linear });
  }, [cycleProgress, progress, reducedMotion]);

  useEffect(() => {
    level.value = currentLevel;
    if (isRunning && !reducedMotion) {
      const diff = levelTo - currentLevel;
      const isHold = Math.abs(diff) < motion.holdThreshold;

      if (isHold) {
        level.value = withRepeat(
          withTiming(levelTo + motion.holdMicroDrift, { duration: motion.holdDuration, easing: motion.holdEasing }),
          -1,
          true,
        );
      } else {
        const easing = diff > 0 ? motion.inhaleEasing : motion.exhaleEasing;
        level.value = withTiming(levelTo, {
          duration: Math.max(phaseRemainingMs, 100),
          easing,
        });
      }
    }
  }, [animationToken, currentLevel, isRunning, level, levelTo, phaseRemainingMs, reducedMotion]);

  const dotProps = useAnimatedProps(() => {
    const point = pointFromTriangleProgress(progress.value);
    return {
      cx: point.x,
      cy: point.y,
    } as any;
  });

  const innerTriangleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(level.value, [0, 1], [breathScale.squareMin, breathScale.squareMax]) }],
    opacity: interpolate(level.value, [0, 1], [breathScale.squareOpacityMin, breathScale.squareOpacityMax]),
  }));

  return (
    <View style={styles.container}>
      <Svg width={SIZE} height={SIZE}>
        <Polygon
          points={TRIANGLE_POINTS}
          stroke={palette.accent}
          strokeWidth={2}
          fill="transparent"
          opacity={0.88}
          strokeLinejoin="round"
        />
        {/* @ts-expect-error animated SVG prop types */}
        <AnimatedCircle animatedProps={dotProps} r={8} fill={palette.accent2} />
      </Svg>
      <Animated.View
        style={[
          styles.innerShape,
          { backgroundColor: palette.accentSoft, borderColor: palette.border },
          innerTriangleStyle,
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerShape: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
