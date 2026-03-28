import { Pressable, Text, View } from 'react-native';
import type { BreathPattern } from '../types/breath';
import type { ResolvedPalette } from '../types/breath';
import { radii, spacing } from '../constants/theme';

interface ExerciseCardProps {
  pattern: BreathPattern;
  palette: ResolvedPalette;
  onPress: () => void;
}

export function ExerciseCard({ pattern, palette, onPress }: ExerciseCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        borderRadius: radii.lg,
        padding: spacing.lg,
        borderWidth: 1,
        borderColor: palette.border,
        backgroundColor: palette.surface,
        marginBottom: spacing.sm,
      }}>
      <Text style={{ color: palette.text, fontWeight: '700', fontSize: 18, marginBottom: spacing.xs }}>
        {pattern.name}
      </Text>
      <Text style={{ color: palette.subtext, fontSize: 14, marginBottom: spacing.xs }}>
        {pattern.cadenceLabel}
      </Text>
      <Text style={{ color: palette.subtext, fontSize: 13, lineHeight: 20 }}>
        {pattern.tagline}
      </Text>
    </Pressable>
  );
}
