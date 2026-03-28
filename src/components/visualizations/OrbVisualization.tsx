import { Text, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useEffect } from 'react';
import { VisualizationProps } from '../../types/breath';

export function OrbVisualization({
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
        easing: Easing.inOut(Easing.cubic),
      });
    }
  }, [animationToken, currentLevel, isRunning, level, levelTo, phaseRemainingMs, reducedMotion]);

  const orbStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(level.value, [0, 1], [0.72, 1.06]) }],
    opacity: interpolate(level.value, [0, 1], [0.75, 1]),
  }));

  const auraStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(level.value, [0, 1], [0.95, 1.45]) }],
    opacity: interpolate(level.value, [0, 1], [0.08, 0.28]),
  }));

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View
        style={[
          {
            position: 'absolute',
            width: 240,
            height: 240,
            borderRadius: 999,
            backgroundColor: palette.orbGlow,
          },
          auraStyle,
        ]}
      />
      <Animated.View
        style={[
          {
            width: 180,
            height: 180,
            borderRadius: 999,
            backgroundColor: palette.orbCore,
            borderWidth: 1,
            borderColor: palette.border,
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: palette.accent,
            shadowOpacity: 0.18,
            shadowRadius: 24,
            shadowOffset: { width: 0, height: 12 },
          },
          orbStyle,
        ]}>
        <Text style={{ color: palette.name === 'mist' ? '#243448' : '#132033', fontSize: 15, fontWeight: '700' }}>
          {phaseLabel}
        </Text>
        <Text
          style={{
            color: palette.name === 'mist' ? '#243448' : '#132033',
            marginTop: 6,
            fontSize: 11,
            letterSpacing: 1.8,
            textTransform: 'uppercase',
          }}>
          Breath Atlas
        </Text>
      </Animated.View>
    </View>
  );
}
