import { useCallback, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ResolvedPalette, SafetyTier } from '../types/breath';
import { radii, spacing } from '../constants/theme';

const DEFAULT_YELLOW_NOTE =
  'This pattern includes breath holds or longer phases. Start with shorter durations and stop if uncomfortable.';

interface SafetyModalProps {
  visible: boolean;
  tier: SafetyTier;
  patternId: string;
  safetyNote?: string;
  palette: ResolvedPalette;
  onDismiss: () => void;
}

export function SafetyModal({
  visible,
  tier,
  patternId,
  safetyNote,
  palette,
  onDismiss,
}: SafetyModalProps) {
  const [checked, setChecked] = useState(false);

  const handleDismiss = useCallback(async () => {
    try {
      await AsyncStorage.setItem(`safety-ack-${patternId}`, 'true');
    } catch {
      // Storage write failed; proceed anyway
    }
    setChecked(false);
    onDismiss();
  }, [onDismiss, patternId]);

  const isRed = tier === 'red';
  const title = isRed ? 'Important safety information' : 'A note before you start';
  const body = isRed ? safetyNote ?? '' : safetyNote ?? DEFAULT_YELLOW_NOTE;

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={[styles.overlay, { backgroundColor: palette.overlay }]}>
        <View style={[styles.container, { backgroundColor: palette.surfaceStrong, borderColor: palette.border }]}>
          <Text style={[styles.title, { color: palette.text }]}>{title}</Text>
          <Text style={[styles.body, { color: palette.subtext }]}>{body}</Text>

          {isRed && (
            <Pressable
              onPress={() => setChecked((prev) => !prev)}
              style={styles.checkRow}
              accessibilityRole="checkbox"
              accessibilityState={{ checked }}>
              <View
                style={[
                  styles.checkbox,
                  {
                    borderColor: palette.accent,
                    backgroundColor: checked ? palette.accent : 'transparent',
                  },
                ]}>
                {checked && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={[styles.checkLabel, { color: palette.text }]}>
                I understand and wish to continue
              </Text>
            </Pressable>
          )}

          <Pressable
            onPress={handleDismiss}
            disabled={isRed && !checked}
            style={[
              styles.button,
              {
                backgroundColor: isRed && !checked ? palette.surface : palette.accent,
                borderColor: palette.border,
              },
            ]}>
            <Text
              style={[
                styles.buttonText,
                {
                  color:
                    isRed && !checked
                      ? palette.subtext
                      : palette.buttonText,
                },
              ]}>
              {isRed ? 'Continue' : 'Got it'}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  container: {
    width: '100%',
    maxWidth: 400,
    borderRadius: radii.lg,
    borderWidth: 1,
    padding: spacing.lg,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  checkLabel: {
    fontSize: 14,
    flex: 1,
  },
  button: {
    borderRadius: radii.pill,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonText: {
    fontWeight: '700',
    fontSize: 16,
  },
});
