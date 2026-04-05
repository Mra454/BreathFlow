import { StyleSheet, View } from 'react-native';
import { useEffect } from 'react';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { VisualizationProps } from '../../types/breath';
import { motion, breathScale } from '../../constants/theme';

export function RingsVisualization({
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

  const ringStyle0 = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(level.value, [0, 1], [breathScale.ring0ScaleMin, breathScale.ring0ScaleMax]) }],
    opacity: interpolate(level.value, [0, 1], [breathScale.ringOpacityMin, breathScale.ring0OpacityMax]),
  }));
  const ringStyle1 = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(level.value, [0, 1], [breathScale.ring1ScaleMin, breathScale.ring1ScaleMax]) }],
    opacity: interpolate(level.value, [0, 1], [breathScale.ringOpacityMin, breathScale.ring1OpacityMax]),
  }));
  const ringStyle2 = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(level.value, [0, 1], [breathScale.ring2ScaleMin, breathScale.ring2ScaleMax]) }],
    opacity: interpolate(level.value, [0, 1], [breathScale.ringOpacityMin, breathScale.ring2OpacityMax]),
  }));
  const coreStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(level.value, [0, 1], [breathScale.coreMin, breathScale.coreMax]) }],
  }));

  const ringStyles = [ringStyle0, ringStyle1, ringStyle2];

  return (
    <View style={styles.container}>
      {ringStyles.map((ringStyle, index) => (
        <Animated.View
          key={index}
          style={[
            styles.ring,
            {
              width: 110 + (2 - index) * 42,
              height: 110 + (2 - index) * 42,
              borderColor: palette.accent,
            },
            ringStyle,
          ]}
        />
      ))}
      <Animated.View
        style={[
          styles.core,
          {
            backgroundColor: palette.accentSoft,
            borderColor: palette.border,
          },
          coreStyle,
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
  ring: {
    position: 'absolute',
    borderRadius: 999,
    borderWidth: 1,
  },
  core: {
    width: 86,
    height: 86,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
