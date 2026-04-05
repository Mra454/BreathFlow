import { StyleSheet, View } from 'react-native';
import { useEffect } from 'react';
import Svg, { Path } from 'react-native-svg';
import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { VisualizationProps } from '../../types/breath';
import { motion } from '../../constants/theme';

const AnimatedPath = Animated.createAnimatedComponent(Path as any) as any;

const WIDTH = 300;
const HEIGHT = 160;
const CENTER_Y = 100;
const POINTS = 20;
const FREQUENCY = Math.PI * 4;

function buildWavePath(amplitude: number, phaseOffset: number): string {
  'worklet';
  let d = '';
  for (let i = 0; i <= POINTS; i++) {
    const x = (i / POINTS) * WIDTH;
    const y =
      CENTER_Y + amplitude * Math.sin((i / POINTS) * FREQUENCY + phaseOffset);
    d += i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
  }
  return d;
}

const WAVE_CONFIGS = [
  { offset: 0, opacity: 0.9, isPrimary: true },
  { offset: Math.PI / 3, opacity: 0.5, isPrimary: false },
  { offset: (2 * Math.PI) / 3, opacity: 0.25, isPrimary: false },
] as const;

export function WaveVisualization({
  currentLevel,
  levelTo,
  phaseRemainingMs,
  animationToken,
  isRunning,
  reducedMotion,
  palette,
}: VisualizationProps) {
  const level = useSharedValue(currentLevel);

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

  const wave0Props = useAnimatedProps(() => {
    const amplitude = level.value * 50;
    return { d: buildWavePath(amplitude, WAVE_CONFIGS[0].offset) } as any;
  });

  const wave1Props = useAnimatedProps(() => {
    const amplitude = level.value * 50;
    return { d: buildWavePath(amplitude, WAVE_CONFIGS[1].offset) } as any;
  });

  const wave2Props = useAnimatedProps(() => {
    const amplitude = level.value * 50;
    return { d: buildWavePath(amplitude, WAVE_CONFIGS[2].offset) } as any;
  });

  const waveAnimatedProps = [wave0Props, wave1Props, wave2Props];

  return (
    <View style={styles.container}>
      <Svg width={WIDTH} height={HEIGHT}>
        {WAVE_CONFIGS.map((config, index) => (
          <AnimatedPath
            key={index}
            animatedProps={waveAnimatedProps[index]}
            stroke={config.isPrimary ? palette.accent : palette.accentSoft}
            strokeWidth={config.isPrimary ? 3 : 2}
            fill="transparent"
            opacity={config.opacity}
          />
        ))}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
