import { StyleSheet, View } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useEffect } from 'react';
import { VisualizationProps } from '../../types/breath';
import { motion, breathScale } from '../../constants/theme';

export function OrbVisualization({
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
          withTiming(levelTo + motion.holdMicroDrift, {
            duration: motion.holdDuration,
            easing: motion.holdEasing,
          }),
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

  const orbStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(level.value, [0, 1], [breathScale.orbMin, breathScale.orbMax]) }],
    opacity: interpolate(level.value, [0, 1], [breathScale.orbOpacityMin, breathScale.orbOpacityMax]),
  }));

  const auraStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(level.value, [0, 1], [breathScale.auraMin, breathScale.auraMax]) }],
    opacity: interpolate(level.value, [0, 1], [breathScale.auraOpacityMin, breathScale.auraOpacityMax]),
  }));

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.aura,
          { backgroundColor: palette.orbGlow },
          auraStyle,
        ]}
      />
      <Animated.View
        style={[
          styles.orb,
          {
            backgroundColor: palette.orbCore,
            borderColor: palette.border,
            shadowColor: palette.accent,
          },
          orbStyle,
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
  aura: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 999,
  },
  orb: {
    width: 180,
    height: 180,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.18,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
  },
});
