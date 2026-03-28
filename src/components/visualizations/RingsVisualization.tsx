import { Text, View } from 'react-native';
import { useEffect } from 'react';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { VisualizationProps } from '../../types/breath';

export function RingsVisualization({
  phaseLabel,
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
      level.value = withTiming(levelTo, {
        duration: Math.max(phaseRemainingMs, 100),
        easing: Easing.inOut(Easing.quad),
      });
    }
  }, [animationToken, currentLevel, isRunning, level, levelTo, phaseRemainingMs, reducedMotion]);

  const ringStyle0 = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(level.value, [0, 1], [0.72, 1.08]) }],
    opacity: interpolate(level.value, [0, 1], [0.18, 0.34]),
  }));
  const ringStyle1 = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(level.value, [0, 1], [0.77, 1.21]) }],
    opacity: interpolate(level.value, [0, 1], [0.18, 0.28]),
  }));
  const ringStyle2 = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(level.value, [0, 1], [0.82, 1.34]) }],
    opacity: interpolate(level.value, [0, 1], [0.18, 0.22]),
  }));
  const coreStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(level.value, [0, 1], [0.85, 1.05]) }],
  }));

  const ringStyles = [ringStyle0, ringStyle1, ringStyle2];

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      {ringStyles.map((ringStyle, index) => (
        <Animated.View
          key={index}
          style={[
            {
              position: 'absolute',
              width: 110 + (2 - index) * 42,
              height: 110 + (2 - index) * 42,
              borderRadius: 999,
              borderWidth: 1,
              borderColor: palette.accent,
            },
            ringStyle,
          ]}
        />
      ))}
      <Animated.View
        style={[
          {
            width: 86,
            height: 86,
            borderRadius: 999,
            backgroundColor: palette.accentSoft,
            borderWidth: 1,
            borderColor: palette.border,
            alignItems: 'center',
            justifyContent: 'center',
          },
          coreStyle,
        ]}>
        <Text style={{ color: palette.text, fontWeight: '700' }}>{phaseLabel}</Text>
      </Animated.View>
    </View>
  );
}
