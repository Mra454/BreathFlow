import { StyleSheet, View } from 'react-native';
import { useEffect, useMemo } from 'react';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  SharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { VisualizationProps } from '../../types/breath';
import { motion } from '../../constants/theme';

const PARTICLE_COUNT = 25;
const CONTAINER_SIZE = 260;
const CENTER = CONTAINER_SIZE / 2;
const PARTICLE_SIZE = 6;
const PARTICLE_RADIUS = PARTICLE_SIZE / 2;

interface ParticleData {
  angle: number;
  baseRadius: number;
  offsetX: number;
  offsetY: number;
}

interface ParticleProps {
  data: ParticleData;
  level: SharedValue<number>;
  accentColor: string;
}

function Particle({ data, level, accentColor }: ParticleProps) {
  const animatedStyle = useAnimatedStyle(() => {
    const animatedRadius = data.baseRadius * level.value;
    const x =
      CENTER +
      (animatedRadius + data.offsetX) * Math.cos(data.angle) -
      PARTICLE_RADIUS;
    const y =
      CENTER +
      (animatedRadius + data.offsetY) * Math.sin(data.angle) -
      PARTICLE_RADIUS;
    const opacity = 0.3 + 0.7 * level.value;

    return {
      transform: [{ translateX: x }, { translateY: y }],
      opacity,
    };
  });

  return (
    <Animated.View
      style={[styles.particle, { backgroundColor: accentColor }, animatedStyle]}
    />
  );
}

export function ParticleVisualization({
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

  const particles = useMemo<ParticleData[]>(
    () =>
      Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
        angle: (i / PARTICLE_COUNT) * 2 * Math.PI,
        baseRadius: 80 + (i % 5) * 15,
        offsetX: Math.sin(i * 1.7) * 10,
        offsetY: Math.cos(i * 2.3) * 10,
      })),
    [],
  );

  return (
    <View style={styles.container}>
      <View style={styles.field}>
        {particles.map((data, index) => (
          <Particle
            key={index}
            data={data}
            level={level}
            accentColor={palette.accent}
          />
        ))}
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
  field: {
    width: CONTAINER_SIZE,
    height: CONTAINER_SIZE,
  },
  particle: {
    position: 'absolute',
    width: PARTICLE_SIZE,
    height: PARTICLE_SIZE,
    borderRadius: PARTICLE_RADIUS,
  },
});
