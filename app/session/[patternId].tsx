import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { getPatternById, getInitialSettings, resolvePattern } from '../../src/data/breathPatterns';
import { getPalette } from '../../src/constants/theme';
import { useBreathEngine } from '../../src/hooks/useBreathEngine';
import { useBreathAudio } from '../../src/hooks/useBreathAudio';
import { VisualizationCarousel } from '../../src/components/VisualizationCarousel';
import { SettingsModal } from '../../src/components/SettingsModal';
import type { BreathPattern } from '../../src/types/breath';
import type { ResolvedBreathPattern } from '../../src/types/breath';
import type { SessionSettings } from '../../src/types/breath';

function SessionContent({
  pattern,
  resolved,
  currentSettings,
}: {
  pattern: BreathPattern;
  resolved: ResolvedBreathPattern;
  currentSettings: SessionSettings;
}) {
  const router = useRouter();
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [settings, setSettings] = useState<SessionSettings>(currentSettings);
  const resolvedWithSettings = resolvePattern(pattern, settings);

  const { snapshot, controls } = useBreathEngine(resolvedWithSettings);
  useBreathAudio(resolvedWithSettings, snapshot, settings);

  const handleApplySettings = useCallback((next: SessionSettings) => {
    setSettings(next);
    setSettingsVisible(false);
  }, []);

  const palette = getPalette(settings.themeMode);

  return (
    <LinearGradient colors={[palette.background, palette.backgroundAlt]} style={{ flex: 1 }}>
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 8 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <Pressable onPress={() => router.back()}>
              <Text style={{ color: palette.accent, fontWeight: '600' }}>← Back</Text>
            </Pressable>
            <Text style={{ color: palette.subtext, fontSize: 14 }}>{pattern.name}</Text>
            <Pressable onPress={() => setSettingsVisible(true)}>
              <Text style={{ color: palette.accent, fontWeight: '600' }}>Settings</Text>
            </Pressable>
          </View>

          <Text style={{ color: palette.text, fontSize: 18, fontWeight: '700', marginBottom: 4 }}>
            {snapshot.currentPhase.label}
          </Text>
          <Text style={{ color: palette.subtext, fontSize: 13, marginBottom: 16 }}>
            Session: {Math.floor(snapshot.sessionRemainingMs / 60000)}:{String(Math.floor((snapshot.sessionRemainingMs % 60000) / 1000)).padStart(2, '0')} left
          </Text>

          <View style={{ flex: 1, minHeight: 280 }}>
            <VisualizationCarousel
              phaseLabel={snapshot.currentPhase.label}
              currentLevel={snapshot.currentLevel}
              levelTo={snapshot.currentPhase.levelTo}
              phaseRemainingMs={snapshot.phaseRemainingMs}
              cycleProgress={snapshot.cycleProgress}
              animationToken={snapshot.animationToken}
              isRunning={snapshot.status === 'running'}
              reducedMotion={false}
              palette={palette}
            />
          </View>

          <View style={{ flexDirection: 'row', gap: 12, marginTop: 16, marginBottom: 24 }}>
            {snapshot.status === 'idle' && (
              <Pressable
                onPress={controls.start}
                style={{
                  flex: 1,
                  backgroundColor: palette.accent,
                  paddingVertical: 14,
                  borderRadius: 999,
                  alignItems: 'center',
                }}>
                <Text style={{ color: palette.name === 'mist' ? '#fff' : '#07111F', fontWeight: '700' }}>Start</Text>
              </Pressable>
            )}
            {snapshot.status === 'running' && (
              <Pressable
                onPress={controls.pause}
                style={{
                  flex: 1,
                  backgroundColor: palette.surface,
                  borderWidth: 1,
                  borderColor: palette.border,
                  paddingVertical: 14,
                  borderRadius: 999,
                  alignItems: 'center',
                }}>
                <Text style={{ color: palette.text, fontWeight: '700' }}>Pause</Text>
              </Pressable>
            )}
            {snapshot.status === 'paused' && (
              <>
                <Pressable
                  onPress={controls.resume}
                  style={{
                    flex: 1,
                    backgroundColor: palette.accent,
                    paddingVertical: 14,
                    borderRadius: 999,
                    alignItems: 'center',
                  }}>
                  <Text style={{ color: palette.name === 'mist' ? '#fff' : '#07111F', fontWeight: '700' }}>Resume</Text>
                </Pressable>
                <Pressable
                  onPress={controls.restart}
                  style={{
                    flex: 1,
                    backgroundColor: palette.surface,
                    borderWidth: 1,
                    borderColor: palette.border,
                    paddingVertical: 14,
                    borderRadius: 999,
                    alignItems: 'center',
                  }}>
                  <Text style={{ color: palette.text, fontWeight: '700' }}>Restart</Text>
                </Pressable>
              </>
            )}
            {snapshot.status === 'completed' && (
              <>
                <Pressable
                  onPress={controls.restart}
                  style={{
                    flex: 1,
                    backgroundColor: palette.accent,
                    paddingVertical: 14,
                    borderRadius: 999,
                    alignItems: 'center',
                  }}>
                  <Text style={{ color: palette.name === 'mist' ? '#fff' : '#07111F', fontWeight: '700' }}>Again</Text>
                </Pressable>
                <Pressable
                  onPress={() => router.back()}
                  style={{
                    flex: 1,
                    backgroundColor: palette.surface,
                    borderWidth: 1,
                    borderColor: palette.border,
                    paddingVertical: 14,
                    borderRadius: 999,
                    alignItems: 'center',
                  }}>
                  <Text style={{ color: palette.text, fontWeight: '700' }}>Done</Text>
                </Pressable>
              </>
            )}
          </View>
        </View>

        <SettingsModal
          visible={settingsVisible}
          pattern={pattern}
          value={settings}
          palette={palette}
          onClose={() => setSettingsVisible(false)}
          onApply={handleApplySettings}
        />
      </SafeAreaView>
    </LinearGradient>
  );
}

export default function SessionScreen() {
  const { patternId } = useLocalSearchParams<{ patternId: string }>();
  const router = useRouter();

  const pattern = patternId ? getPatternById(patternId) : undefined;
  const initialSettings = pattern ? getInitialSettings(pattern) : null;
  const resolved = pattern && initialSettings ? resolvePattern(pattern, initialSettings) : null;

  if (!patternId || !pattern || !resolved || !initialSettings) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0a0e14' }}>
        <Text style={{ color: '#8b9cad', fontSize: 16 }}>Pattern not found</Text>
        <Pressable onPress={() => router.back()} style={{ marginTop: 16 }}>
          <Text style={{ color: '#5b9bd5', fontWeight: '600' }}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <SessionContent
      pattern={pattern}
      resolved={resolved}
      currentSettings={initialSettings}
    />
  );
}
