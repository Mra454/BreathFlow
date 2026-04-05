import { useCallback } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BREATH_PATTERNS, CATEGORY_META } from '../../src/data/breathPatterns';
import { getPalette, spacing, typography } from '../../src/constants/theme';
import { ExerciseCard } from '../../src/components/ExerciseCard';
import type { PatternCategory } from '../../src/types/breath';

export default function CategoryScreen() {
  const { categoryId } = useLocalSearchParams<{ categoryId: string }>();
  const router = useRouter();
  const palette = getPalette('night');

  const category = categoryId as PatternCategory;
  const meta = CATEGORY_META[category];
  const patterns = BREATH_PATTERNS.filter((p) => p.category === category);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handlePatternPress = useCallback(
    (patternId: string) => {
      router.push(`/session/${patternId}`);
    },
    [router],
  );

  if (!meta) {
    return (
      <View style={[styles.flex, { backgroundColor: palette.background }]}>
        <SafeAreaView edges={['top']} style={styles.flex}>
          <Pressable onPress={handleBack} style={styles.backButton}>
            <Text style={[styles.backArrow, { color: palette.accent }]}>
              {'\u2190'}
            </Text>
          </Pressable>
          <View style={styles.errorContainer}>
            <Text style={[styles.errorText, { color: palette.subtext }]}>
              Category not found
            </Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={[styles.flex, { backgroundColor: palette.background }]}>
      <SafeAreaView edges={['top']} style={styles.flex}>
        {/* Back arrow */}
        <Pressable
          onPress={handleBack}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Text style={[styles.backArrow, { color: palette.accent }]}>
            {'\u2190'}
          </Text>
        </Pressable>

        {/* Header */}
        <View style={styles.headerContainer}>
          <Text style={[styles.heading, { color: palette.text }]}>
            {meta.displayName}
          </Text>
          <Text style={[styles.description, { color: palette.subtext }]}>
            {meta.description}
          </Text>
        </View>

        {/* Pattern list */}
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {patterns.map((pattern) => (
            <ExerciseCard
              key={pattern.id}
              pattern={pattern}
              palette={palette}
              onPress={() => handlePatternPress(pattern.id)}
              showBeginnerBadge={pattern.safetyTier === 'red'}
            />
          ))}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.lg,
    marginTop: spacing.lg,
  },
  backArrow: {
    fontSize: 24,
  },
  headerContainer: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
  },
  heading: {
    fontSize: 28,
    ...typography.regular,
  },
  description: {
    fontSize: 15,
    ...typography.regular,
    marginTop: spacing.sm,
    lineHeight: 22,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 16,
  },
});
