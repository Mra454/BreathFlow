import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import type { BreathPattern, ResolvedPalette } from '../types/breath';
import { motion, radii, spacing, typography } from '../constants/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface ExerciseCardProps {
  pattern: BreathPattern;
  palette: ResolvedPalette;
  onPress: () => void;
  showBeginnerBadge: boolean;
}

export function ExerciseCard({ pattern, palette, onPress, showBeginnerBadge }: ExerciseCardProps) {
  const isRedTier = pattern.safetyTier === 'red';
  const durationLabel = `${pattern.defaultSessionMinutes} min`;
  const scale = useSharedValue(1);

  const pressStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => {
        scale.value = withTiming(motion.pressScale, { duration: motion.pressDuration });
      }}
      onPressOut={() => {
        scale.value = withTiming(1, { duration: motion.pressDuration });
      }}
      accessibilityRole="button"
      accessibilityLabel={`${pattern.name}. ${pattern.tagline}. ${durationLabel}`}
      style={[styles.card, pressStyle]}
    >
      <View style={[styles.accentBar, { backgroundColor: palette.accent, opacity: 0.3 }]} />
      <View style={[styles.content, { backgroundColor: palette.surface }]}>
        <View style={styles.topRow}>
          <View style={styles.textBlock}>
            <Text style={[styles.name, { color: palette.text }]}>{pattern.name}</Text>
            <Text style={[styles.tagline, { color: palette.subtext }]}>{pattern.tagline}</Text>
            {isRedTier && (
              <View style={styles.badgeRow}>
                <Text style={[styles.advancedLabel, { color: palette.subtext }]}>Advanced</Text>
                {showBeginnerBadge && (
                  <View style={[styles.beginnerPill, { backgroundColor: palette.accentSoft }]}>
                    <Text style={[styles.beginnerPillText, { color: palette.accent }]}>Beginner pace</Text>
                  </View>
                )}
              </View>
            )}
          </View>
          <View style={[styles.durationPill, { backgroundColor: palette.backgroundAlt }]}>
            <Text style={[styles.durationText, { color: palette.subtext }]}>{durationLabel}</Text>
          </View>
        </View>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    minHeight: 72,
    marginBottom: spacing.md,
    borderRadius: radii.md,
    overflow: 'hidden',
  },
  accentBar: {
    width: 3,
  },
  content: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    flexDirection: 'column',
    justifyContent: 'center',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  textBlock: {
    flex: 1,
    marginRight: spacing.sm,
  },
  name: {
    fontSize: 18,
    ...typography.medium,
  },
  tagline: {
    fontSize: 14,
    ...typography.regular,
    marginTop: spacing.xs,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  advancedLabel: {
    fontSize: 13,
    ...typography.regular,
  },
  beginnerPill: {
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  beginnerPillText: {
    fontSize: 13,
    ...typography.medium,
  },
  durationPill: {
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    alignSelf: 'center',
  },
  durationText: {
    fontSize: 13,
    ...typography.regular,
  },
});
