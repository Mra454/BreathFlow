import { Modal, Pressable, ScrollView, Switch, Text, View } from 'react-native';
import { useEffect, useState } from 'react';
import { BreathPattern, ResolvedPalette, SessionSettings } from '../types/breath';
import { radii, spacing } from '../constants/theme';

interface SettingsModalProps {
  visible: boolean;
  pattern: BreathPattern;
  value: SessionSettings;
  palette: ResolvedPalette;
  onClose: () => void;
  onApply: (next: SessionSettings) => void;
}

interface StepperRowProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  palette: ResolvedPalette;
  suffix?: string;
  onChange: (next: number) => void;
}

function StepperRow({ label, value, min, max, step = 1, palette, suffix = '', onChange }: StepperRowProps) {
  return (
    <View
      style={{
        paddingVertical: spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: palette.border,
      }}>
      <Text style={{ color: palette.text, fontSize: 15, fontWeight: '600', marginBottom: spacing.xs }}>
        {label}
      </Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={{ color: palette.subtext }}>{value}{suffix}</Text>
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          <Pressable
            onPress={() => onChange(Math.max(min, value - step))}
            style={{
              width: 40,
              height: 40,
              borderRadius: radii.pill,
              backgroundColor: palette.surface,
              borderWidth: 1,
              borderColor: palette.border,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Text style={{ color: palette.text, fontSize: 20, fontWeight: '700' }}>−</Text>
          </Pressable>
          <Pressable
            onPress={() => onChange(Math.min(max, value + step))}
            style={{
              width: 40,
              height: 40,
              borderRadius: radii.pill,
              backgroundColor: palette.surface,
              borderWidth: 1,
              borderColor: palette.border,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Text style={{ color: palette.text, fontSize: 20, fontWeight: '700' }}>+</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

interface ToggleRowProps {
  label: string;
  description?: string;
  value: boolean;
  palette: ResolvedPalette;
  onChange: (next: boolean) => void;
}

function ToggleRow({ label, description, value, palette, onChange }: ToggleRowProps) {
  return (
    <View
      style={{
        paddingVertical: spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: palette.border,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: spacing.sm,
      }}>
      <View style={{ flex: 1 }}>
        <Text style={{ color: palette.text, fontSize: 15, fontWeight: '600' }}>{label}</Text>
        {description ? (
          <Text style={{ color: palette.subtext, fontSize: 13, marginTop: 4, lineHeight: 18 }}>
            {description}
          </Text>
        ) : null}
      </View>
      <Switch value={value} onValueChange={onChange} />
    </View>
  );
}

export function SettingsModal({ visible, pattern, value, palette, onClose, onApply }: SettingsModalProps) {
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    setDraft(value);
  }, [value, visible]);

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View
        style={{
          flex: 1,
          backgroundColor: palette.overlay,
          justifyContent: 'flex-end',
        }}>
        <View
          style={{
            maxHeight: '88%',
            borderTopLeftRadius: radii.lg,
            borderTopRightRadius: radii.lg,
            backgroundColor: palette.surfaceStrong,
            borderWidth: 1,
            borderColor: palette.border,
            paddingTop: spacing.lg,
          }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingHorizontal: spacing.lg,
              marginBottom: spacing.md,
            }}>
            <View>
              <Text style={{ color: palette.text, fontSize: 22, fontWeight: '700' }}>Session settings</Text>
              <Text style={{ color: palette.subtext, marginTop: 4 }}>{pattern.name}</Text>
            </View>
            <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="Close settings">
              <Text style={{ color: palette.accent, fontWeight: '700' }}>Close</Text>
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.xl }}>
            <StepperRow
              label="Session length"
              value={draft.sessionMinutes}
              min={1}
              max={20}
              palette={palette}
              suffix=" min"
              onChange={(sessionMinutes) => setDraft((current) => ({ ...current, sessionMinutes }))}
            />
            <StepperRow
              label="Volume"
              value={Math.round(draft.volume * 100)}
              min={0}
              max={100}
              step={5}
              palette={palette}
              suffix="%"
              onChange={(next) => setDraft((current) => ({ ...current, volume: next / 100 }))}
            />
            <ToggleRow
              label="Sound"
              description="Keep the cues subtle. Muting only disables sounds, not the timing engine."
              value={draft.soundEnabled}
              palette={palette}
              onChange={(soundEnabled) => setDraft((current) => ({ ...current, soundEnabled }))}
            />
            <ToggleRow
              label="Haptics"
              description="A light tactile cue on phase changes when supported."
              value={draft.hapticsEnabled}
              palette={palette}
              onChange={(hapticsEnabled) => setDraft((current) => ({ ...current, hapticsEnabled }))}
            />
            <ToggleRow
              label="High contrast"
              description="Increase contrast for text, controls, and progress bars."
              value={draft.highContrast}
              palette={palette}
              onChange={(highContrast) => setDraft((current) => ({ ...current, highContrast }))}
            />
            <ToggleRow
              label="Beginner mode"
              description="Keeps the interface simpler and nudges you toward gentler defaults."
              value={draft.beginnerMode}
              palette={palette}
              onChange={(beginnerMode) => setDraft((current) => ({ ...current, beginnerMode }))}
            />
            <ToggleRow
              label="Mist theme"
              description="Switch from the default dark session palette to a brighter calming palette."
              value={draft.themeMode === 'mist'}
              palette={palette}
              onChange={(isMist) =>
                setDraft((current) => ({
                  ...current,
                  themeMode: isMist ? 'mist' : 'night',
                }))
              }
            />

            <Text
              style={{
                color: palette.text,
                fontSize: 18,
                fontWeight: '700',
                marginTop: spacing.lg,
                marginBottom: spacing.xs,
              }}>
              Pattern timing
            </Text>
            <Text style={{ color: palette.subtext, lineHeight: 20, marginBottom: spacing.sm }}>
              Any timing changes apply the next time you start the session.
            </Text>

            {pattern.phases.map((phase) => (
              <StepperRow
                key={phase.key}
                label={phase.label}
                value={draft.phaseDurations[phase.key] ?? phase.durationSec}
                min={1}
                max={12}
                palette={palette}
                suffix=" sec"
                onChange={(nextValue) =>
                  setDraft((current) => ({
                    ...current,
                    phaseDurations: {
                      ...current.phaseDurations,
                      [phase.key]: nextValue,
                    },
                  }))
                }
              />
            ))}

            <View style={{ marginTop: spacing.lg, gap: spacing.sm }}>
              <Pressable
                onPress={() => onApply(draft)}
                style={{
                  backgroundColor: palette.accent,
                  borderRadius: radii.pill,
                  paddingVertical: 15,
                  alignItems: 'center',
                }}>
                <Text style={{ color: palette.name === 'mist' ? '#FFFFFF' : '#07111F', fontWeight: '700' }}>
                  Apply settings
                </Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
