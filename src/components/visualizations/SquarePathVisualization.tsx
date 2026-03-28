import { Text, View } from 'react-native';
import { useEffect } from 'react';
import Svg, { Circle, Rect } from 'react-native-svg';
import Animated, {
  Easing,
  interpolate,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { VisualizationProps } from '../../types/breath';

const AnimatedCircle = Animated.createAnimatedComponent(Circle as any);

function pointFromSquareProgress(progress: number, size: number, inset: number) {
  const xMin = inset;
  const xMax = size - inset;
  const yMin = inset;
  const yMax = size - inset;
  const side = xMax - xMin;
  const perimeter = side * 4;
  const distance = progress * perimeter;

  if (distance <= side) {
    return { x: xMin + distance, y: yMin };
  }
  if (distance <= side * 2) {
    return { x: xMax, y: yMin + (distance - side) };
  }
  if (distance <= side * 3) {
    return { x: xMax - (distance - side * 2), y: yMax };
  }
  return { x: xMin, y: yMax - (distance - side * 3) };
}

export function SquarePathVisualization({
  phaseLabel,
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
  const size = 248;
  const inset = 34;

  useEffect(() => {
    progress.value = reducedMotion
      ? (cycleProgress ?? 0)
      : withTiming(cycleProgress ?? 0, { duration: 180, easing: Easing.linear });
  }, [cycleProgress, progress, reducedMotion]);

  useEffect(() => {
    level.value = currentLevel;
    if (isRunning && !reducedMotion) {
      level.value = withTiming(levelTo, {
        duration: Math.max(phaseRemainingMs, 100),
        easing: Easing.inOut(Easing.cubic),
      });
    }
  }, [animationToken, currentLevel, isRunning, level, levelTo, phaseRemainingMs, reducedMotion]);

  const dotProps = useAnimatedProps(() => {
    const point = pointFromSquareProgress(progress.value, size, inset);
    return {
      cx: point.x,
      cy: point.y,
    } as any;
  });

  const innerSquareStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(level.value, [0, 1], [0.76, 1.04]) }],
    opacity: interpolate(level.value, [0, 1], [0.62, 1]),
  }));

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size}>
        <Rect
          x={inset}
          y={inset}
          width={size - inset * 2}
          height={size - inset * 2}
          rx={18}
          stroke={palette.accent}
          strokeWidth={2}
          fill="transparent"
          opacity={0.88}
        />
        <AnimatedCircle animatedProps={dotProps} r={8} fill={palette.accent2} />
      </Svg>
      <Animated.View
        style={[
          {
            position: 'absolute',
            width: 112,
            height: 112,
            borderRadius: 24,
            backgroundColor: palette.accentSoft,
            borderWidth: 1,
            borderColor: palette.border,
            alignItems: 'center',
            justifyContent: 'center',
          },
          innerSquareStyle,
        ]}>
        <Text style={{ color: palette.text, fontWeight: '700' }}>{phaseLabel}</Text>
      </Animated.View>
    </View>
  );
}
