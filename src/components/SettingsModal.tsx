import {
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { useEffect, useMemo, useState } from 'react';
import { BreathPattern, ResolvedPalette, SessionSettings } from '../types/breath';
import { radii, spacing, typography } from '../constants/theme';

const SCREEN_HEIGHT = Dimensions.get('window').height;

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
  const displayValue = step < 1 ? value.toFixed(1) : String(value);
  return (
    <View style={[stepperStyles.row, { borderBottomColor: palette.border }]}>
      <Text style={[stepperStyles.label, { color: palette.text }]}>{label}</Text>
      <View style={stepperStyles.controls}>
        <Text style={{ color: palette.subtext, fontSize: 14 }}>
          {displayValue}{suffix}
        </Text>
        <View style={stepperStyles.buttons}>
          <Pressable
            onPress={() => onChange(Math.max(min, +(value - step).toFixed(2)))}
            style={[stepperStyles.button, { backgroundColor: palette.surface, borderColor: palette.border }]}>
            <Text style={[stepperStyles.buttonText, { color: palette.text }]}>-</Text>
          </Pressable>
          <Pressable
            onPress={() => onChange(Math.min(max, +(value + step).toFixed(2)))}
            style={[stepperStyles.button, { backgroundColor: palette.surface, borderColor: palette.border }]}>
            <Text style={[stepperStyles.buttonText, { color: palette.text }]}>+</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const stepperStyles = StyleSheet.create({
  row: {
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
  },
  label: {
    fontSize: 15,
    ...typography.medium,
    marginBottom: spacing.xs,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  buttons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  button: {
    width: 40,
    height: 40,
    borderRadius: radii.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 20,
    ...typography.semibold,
  },
});

interface ToggleRowProps {
  label: string;
  description?: string;
  value: boolean;
  palette: ResolvedPalette;
  onChange: (next: boolean) => void;
}

function ToggleRow({ label, description, value, palette, onChange }: ToggleRowProps) {
  return (
    <View style={[toggleStyles.row, { borderBottomColor: palette.border }]}>
      <View style={toggleStyles.textCol}>
        <Text style={[toggleStyles.label, { color: palette.text }]}>{label}</Text>
        {description ? (
          <Text style={[toggleStyles.desc, { color: palette.subtext }]}>{description}</Text>
        ) : null}
      </View>
      <Switch value={value} onValueChange={onChange} />
    </View>
  );
}

const toggleStyles = StyleSheet.create({
  row: {
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  textCol: {
    flex: 1,
  },
  label: {
    fontSize: 15,
    ...typography.medium,
  },
  desc: {
    fontSize: 13,
    ...typography.regular,
    marginTop: spacing.xs,
    lineHeight: 18,
  },
});

interface UniquePhaseEntry {
  key: string;
  label: string;
  durationSec: number;
}

function generateDurationChips(defaultMinutes: number): number[] {
  const raw = [defaultMinutes - 1, defaultMinutes, defaultMinutes + 1, defaultMinutes * 2];
  const filtered = raw.filter((v) => v >= 1 && v <= 20);
  return [...new Set(filtered)].sort((a, b) => a - b);
}

export function SettingsModal({ visible, pattern, value, palette, onClose, onApply }: SettingsModalProps) {
  const [draft, setDraft] = useState(value);
  const [moreExpanded, setMoreExpanded] = useState(false);
  const [timingExpanded, setTimingExpanded] = useState(false);

  useEffect(() => {
    setDraft(value);
    setMoreExpanded(false);
    setTimingExpanded(false);
  }, [value, visible]);

  const durationChips = useMemo(
    () => generateDurationChips(pattern.defaultSessionMinutes),
    [pattern.defaultSessionMinutes],
  );

  const uniquePhases = useMemo<UniquePhaseEntry[]>(() => {
    const seen = new Set<string>();
    const result: UniquePhaseEntry[] = [];
    for (const phase of pattern.phases) {
      if (!seen.has(phase.key)) {
        seen.add(phase.key);
        result.push({ key: phase.key, label: phase.label, durationSec: phase.durationSec });
      }
    }
    return result;
  }, [pattern.phases]);

  const hasSubSecond = useMemo(
    () => uniquePhases.some((p) => p.durationSec % 1 !== 0),
    [uniquePhases],
  );
  const stepSize = hasSubSecond ? 0.5 : 1;

  const hasRapidPhases = useMemo(
    () => pattern.phases.some((p) => p.durationSec < 1),
    [pattern.phases],
  );
  const minValue = hasRapidPhases ? 0.5 : 1;

  const volumeSteps = [0, 25, 50, 75, 100];

  const handleDismiss = () => {
    onApply(draft);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleDismiss}>
      <Pressable style={styles.overlay} onPress={handleDismiss}>
        <Pressable
          style={[
            styles.sheet,
            {
              backgroundColor: palette.surface,
              maxHeight: SCREEN_HEIGHT * 0.6,
            },
          ]}
          onPress={() => {}}>
          <View style={styles.dragHandleContainer}>
            <View style={[styles.dragHandle, { backgroundColor: palette.subtext }]} />
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent} bounces={false}>
            {/* Session length chips */}
            <Text style={[styles.sectionLabel, { color: palette.text }]}>Session length</Text>
            <View style={styles.chipRow}>
              {durationChips.map((min) => {
                const selected = draft.sessionMinutes === min;
                return (
                  <Pressable
                    key={min}
                    accessibilityRole="radio"
                    accessibilityState={{ selected }}
                    onPress={() => setDraft((c) => ({ ...c, sessionMinutes: min }))}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: selected ? palette.accent : palette.surface,
                        borderColor: selected ? palette.accent : palette.border,
                      },
                    ]}>
                    <Text
                      style={[
                        styles.chipText,
                        {
                          color: selected
                            ? palette.buttonText
                            : palette.subtext,
                        },
                      ]}>
                      {min} min
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Sound toggle */}
            <ToggleRow
              label="Sound"
              value={draft.soundEnabled}
              palette={palette}
              onChange={(soundEnabled) => setDraft((c) => ({ ...c, soundEnabled }))}
            />

            {/* Volume stepper (only when sound on) */}
            {draft.soundEnabled && (
              <View style={[styles.volumeRow, { borderBottomColor: palette.border }]}>
                <Text style={[styles.volumeLabel, { color: palette.text }]}>Volume</Text>
                <View style={styles.volumeChipRow}>
                  {volumeSteps.map((pct) => {
                    const selected = Math.round(draft.volume * 100) === pct;
                    return (
                      <Pressable
                        key={pct}
                        onPress={() => setDraft((c) => ({ ...c, volume: pct / 100 }))}
                        style={[
                          styles.volumeChip,
                          {
                            backgroundColor: selected ? palette.accent : palette.surface,
                            borderColor: selected ? palette.accent : palette.border,
                          },
                        ]}>
                        <Text
                          style={[
                            styles.volumeChipText,
                            {
                              color: selected
                                ? palette.buttonText
                                : palette.subtext,
                            },
                          ]}>
                          {pct}%
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            )}

            {/* More options expandable */}
            <Pressable
              onPress={() => setMoreExpanded((v) => !v)}
              style={styles.expandableHeader}>
              <Text style={[styles.expandableText, { color: palette.accent }]}>
                {moreExpanded ? 'Less options' : 'More options'}
              </Text>
            </Pressable>

            {moreExpanded && (
              <View>
                <ToggleRow
                  label="Haptics"
                  description="A light tactile cue on phase changes."
                  value={draft.hapticsEnabled}
                  palette={palette}
                  onChange={(hapticsEnabled) => setDraft((c) => ({ ...c, hapticsEnabled }))}
                />
                <ToggleRow
                  label="Beginner mode"
                  description="Gentler pace for advanced patterns."
                  value={draft.beginnerMode}
                  palette={palette}
                  onChange={(beginnerMode) => setDraft((c) => ({ ...c, beginnerMode }))}
                />
                <ToggleRow
                  label="Mist theme"
                  description="Switch to a brighter calming palette."
                  value={draft.themeMode === 'mist'}
                  palette={palette}
                  onChange={(isMist) =>
                    setDraft((c) => ({
                      ...c,
                      themeMode: isMist ? 'mist' : 'night',
                    }))
                  }
                />
              </View>
            )}

            {/* Timing expandable */}
            <Pressable
              onPress={() => setTimingExpanded((v) => !v)}
              style={styles.expandableHeader}>
              <Text style={[styles.expandableText, { color: palette.accent }]}>
                {timingExpanded ? 'Hide timing' : 'Timing'}
              </Text>
            </Pressable>

            {timingExpanded && (
              <View>
                {uniquePhases.map((phase) => (
                  <StepperRow
                    key={phase.key}
                    label={phase.label}
                    value={draft.phaseDurations[phase.key] ?? phase.durationSec}
                    min={minValue}
                    max={120}
                    step={stepSize}
                    palette={palette}
                    suffix=" sec"
                    onChange={(nextValue) =>
                      setDraft((c) => ({
                        ...c,
                        phaseDurations: {
                          ...c.phaseDurations,
                          [phase.key]: nextValue,
                        },
                      }))
                    }
                  />
                ))}
              </View>
            )}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  dragHandleContainer: {
    alignItems: 'center',
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    opacity: 0.4,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  sectionLabel: {
    fontSize: 15,
    ...typography.medium,
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },
  chipRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
    flexWrap: 'wrap',
  },
  chip: {
    height: 36,
    paddingHorizontal: spacing.md,
    borderRadius: radii.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipText: {
    fontSize: 14,
    ...typography.medium,
  },
  volumeRow: {
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
  },
  volumeLabel: {
    fontSize: 15,
    ...typography.medium,
    marginBottom: spacing.xs,
  },
  volumeChipRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  volumeChip: {
    height: 32,
    paddingHorizontal: spacing.md,
    borderRadius: radii.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  volumeChipText: {
    fontSize: 13,
    ...typography.medium,
  },
  expandableHeader: {
    paddingVertical: spacing.md,
  },
  expandableText: {
    fontSize: 14,
    ...typography.medium,
  },
});
