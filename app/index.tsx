import { ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BREATH_PATTERNS } from '../src/data/breathPatterns';
import { getPalette, radii, spacing } from '../src/constants/theme';
import { ExerciseCard } from '../src/components/ExerciseCard';

export default function HomeScreen() {
  const router = useRouter();
  const palette = getPalette('night');

  return (
    <LinearGradient
      colors={[palette.background, palette.backgroundAlt]}
      style={{ flex: 1 }}>
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl }}>
          <Text style={{ color: palette.subtext, fontSize: 13, letterSpacing: 1.5, textTransform: 'uppercase' }}>
            Breath Atlas
          </Text>
          <Text
            style={{
              color: palette.text,
              fontSize: 34,
              fontWeight: '700',
              marginTop: spacing.xs,
              marginBottom: spacing.sm,
            }}>
            Breathing exercises with synced visuals and restrained sound.
          </Text>
          <Text style={{ color: palette.subtext, fontSize: 16, lineHeight: 24, marginBottom: spacing.lg }}>
            Choose a pattern, then swipe across multiple visual guidance styles without changing the cadence underneath.
          </Text>

          {BREATH_PATTERNS.map((pattern) => (
            <ExerciseCard
              key={pattern.id}
              pattern={pattern}
              palette={palette}
              onPress={() => router.push(`/session/${pattern.id}`)}
            />
          ))}

          <View
            style={{
              borderRadius: radii.lg,
              padding: spacing.lg,
              borderWidth: 1,
              borderColor: palette.border,
              backgroundColor: palette.surface,
              marginTop: spacing.sm,
            }}>
            <Text style={{ color: palette.text, fontWeight: '700', fontSize: 16, marginBottom: spacing.sm }}>
              Simple wellness disclaimer
            </Text>
            <Text style={{ color: palette.subtext, lineHeight: 22 }}>
              This prototype is for general wellness and guided pacing. It is not a medical product. Keep the breath gentle, shorten or remove holds if you feel strained, and stop if you feel lightheaded or uncomfortable.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}
