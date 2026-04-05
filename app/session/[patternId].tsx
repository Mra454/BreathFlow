import { useLocalSearchParams, useRouter, useNavigation } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Alert,
  Animated as RNAnimated,
  AppState,
  Dimensions,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import type { AppStateStatus } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getPatternById, getInitialSettings, resolvePattern } from '../../src/data/breathPatterns';
import { getPalette, radii, spacing, typography } from '../../src/constants/theme';
import { PressableScale } from '../../src/components/PressableScale';
import { useBreathEngine } from '../../src/hooks/useBreathEngine';
import { useBreathAudio } from '../../src/hooks/useBreathAudio';
import { VisualizationCarousel } from '../../src/components/VisualizationCarousel';
import { SettingsModal } from '../../src/components/SettingsModal';
import { SafetyModal } from '../../src/components/SafetyModal';
import type {
  BreathPattern,
  ResolvedBreathPattern,
  SessionSettings,
  ResolvedPalette,
} from '../../src/types/breath';

const SCREEN_WIDTH = Dimensions.get('window').width;

type SessionState = 'pre-session' | 'countdown' | 'running' | 'paused' | 'completed';

function formatTimeRemaining(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}:${String(sec).padStart(2, '0')}`;
}

function formatDuration(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  if (min === 0) return `${sec} sec`;
  return `${min} min ${sec} sec`;
}

function generateDurationChips(defaultMinutes: number): number[] {
  const raw = [defaultMinutes - 1, defaultMinutes, defaultMinutes + 1, defaultMinutes * 2];
  const filtered = raw.filter((v) => v >= 1 && v <= 20);
  return [...new Set(filtered)].sort((a, b) => a - b);
}

// ------------------------------------------------------------------
// Quick Reset instructional animation
// ------------------------------------------------------------------
function QuickResetDemo() {
  const progress = useRef(new RNAnimated.Value(0)).current;
  const [phase, setPhase] = useState<'nose' | 'sip' | 'out'>('nose');

  useEffect(() => {
    const cycle = () => {
      progress.setValue(0);
      setPhase('nose');

      // Nose in: 0 → 0.78 over 2s
      RNAnimated.timing(progress, { toValue: 0.78, duration: 2000, useNativeDriver: false }).start(() => {
        setPhase('sip');
        // Sip: 0.78 → 1.0 over 1s
        RNAnimated.timing(progress, { toValue: 1, duration: 1000, useNativeDriver: false }).start(() => {
          setPhase('out');
          // Mouth out: 1.0 → 0 over 6s
          RNAnimated.timing(progress, { toValue: 0, duration: 6000, useNativeDriver: false }).start(() => {
            // Pause 1s then repeat
            setTimeout(cycle, 1000);
          });
        });
      });
    };
    cycle();
    return () => {
      progress.stopAnimation();
    };
  }, [progress]);

  const DEMO_H = 180;
  const DEMO_W = 56;
  const DEMO_TRAVEL = DEMO_H - DEMO_W;
  const BALL_D = 28;

  const ballY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [DEMO_TRAVEL / 2, -DEMO_TRAVEL / 2],
  });

  const phaseLabels = { nose: 'Nose in', sip: 'Sip', out: 'Mouth out' };
  const phaseColors = { nose: 'rgba(254,220,151,0.7)', sip: 'rgba(254,220,151,0.9)', out: 'rgba(254,220,151,0.5)' };

  return (
    <View style={demoStyles.container}>
      {/* Mini pill */}
      <View style={demoStyles.pill}>
        <RNAnimated.View
          style={[demoStyles.ball, { transform: [{ translateY: ballY }] }]}
        />
      </View>

      {/* Phase steps */}
      <View style={demoStyles.steps}>
        <View style={demoStyles.stepRow}>
          <View style={[demoStyles.dot, { backgroundColor: phase === 'nose' ? 'rgba(254,220,151,0.8)' : 'rgba(254,220,151,0.2)' }]} />
          <Text style={[demoStyles.stepText, { opacity: phase === 'nose' ? 1 : 0.35 }]}>Nose in (2s)</Text>
        </View>
        <View style={demoStyles.stepRow}>
          <View style={[demoStyles.dot, { backgroundColor: phase === 'sip' ? 'rgba(254,220,151,0.8)' : 'rgba(254,220,151,0.2)' }]} />
          <Text style={[demoStyles.stepText, { opacity: phase === 'sip' ? 1 : 0.35 }]}>Quick sip (1s)</Text>
        </View>
        <View style={demoStyles.stepRow}>
          <View style={[demoStyles.dot, { backgroundColor: phase === 'out' ? 'rgba(254,220,151,0.8)' : 'rgba(254,220,151,0.2)' }]} />
          <Text style={[demoStyles.stepText, { opacity: phase === 'out' ? 1 : 0.35 }]}>Slow mouth out (6s)</Text>
        </View>
      </View>
    </View>
  );
}

const demoStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 28,
    paddingBottom: 28,
    marginBottom: 8,
  },
  pill: {
    width: 56,
    height: 180,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(254,220,151,0.12)',
    backgroundColor: 'rgba(254,220,151,0.02)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ball: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(254,225,165,0.85)',
  },
  steps: {
    gap: 16,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  stepText: {
    fontSize: 15,
    fontWeight: '400',
    color: 'rgba(254,220,151,0.6)',
  },
});

// ------------------------------------------------------------------
// Pre-session screen
// ------------------------------------------------------------------
function PreSessionView({
  pattern,
  settings,
  palette,
  safetyChecked,
  onBegin,
  onOpenSettings,
  onBack,
  onSettingsChange,
}: {
  pattern: BreathPattern;
  settings: SessionSettings;
  palette: ResolvedPalette;
  safetyChecked: boolean;
  onBegin: () => void;
  onOpenSettings: () => void;
  onBack: () => void;
  onSettingsChange: (next: SessionSettings) => void;
}) {
  const durationChips = useMemo(
    () => generateDurationChips(pattern.defaultSessionMinutes),
    [pattern.defaultSessionMinutes],
  );

  const isRedTier = pattern.safetyTier === 'red';
  const beginDisabled = !safetyChecked;

  return (
    <View style={styles.preSessionContainer}>
      {/* Back arrow */}
      <Pressable
        onPress={onBack}
        style={styles.backButton}
        accessibilityRole="button"
        accessibilityLabel="Go back">
        <Text style={[styles.backArrow, { color: palette.accent }]}>{'<-'}</Text>
      </Pressable>

      {/* Pattern name */}
      <Text style={[styles.prePatternName, { color: palette.text }]}>{pattern.name}</Text>

      {/* Tagline / purpose */}
      <Text style={[styles.preTagline, { color: palette.subtext }]} numberOfLines={3}>
        {pattern.id === 'physiological-sigh'
          ? 'Breathe in deeply through your nose, take a quick sip of air at the top, then slowly sigh out through your mouth.'
          : pattern.tagline}
      </Text>

      <View style={styles.preSpacer} />

      {/* Instructional demo for Quick Reset */}
      {pattern.id === 'physiological-sigh' && <QuickResetDemo />}

      <View style={styles.preSpacer} />

      {/* Beginner mode toggle for red-tier */}
      {isRedTier && (
        <View style={[styles.beginnerRow, { borderColor: palette.border }]}>
          <Text style={[styles.beginnerLabel, { color: palette.text }]}>Beginner pace</Text>
          <Switch
            value={settings.beginnerMode}
            onValueChange={(beginnerMode) =>
              onSettingsChange({ ...settings, beginnerMode })
            }
          />
        </View>
      )}

      {/* Duration selector chips */}
      <View style={styles.chipRow}>
        {durationChips.map((min) => {
          const selected = settings.sessionMinutes === min;
          return (
            <Pressable
              key={min}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              onPress={() => onSettingsChange({ ...settings, sessionMinutes: min })}
              style={[
                styles.durationChip,
                {
                  backgroundColor: selected ? palette.accent : palette.surface,
                  borderColor: selected ? palette.accent : palette.border,
                },
              ]}>
              <Text
                style={[
                  styles.durationChipText,
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

      <View style={{ height: spacing.lg }} />

      {/* Begin button */}
      <PressableScale
        onPress={onBegin}
        disabled={beginDisabled}
        accessibilityRole="button"
        accessibilityLabel="Begin breathing session"
        style={[
          styles.beginButton,
          {
            backgroundColor: beginDisabled ? palette.surface : palette.accent,
            opacity: beginDisabled ? 0.5 : 1,
          },
        ]}>
        <Text
          style={[
            styles.beginButtonText,
            {
              color: beginDisabled
                ? palette.subtext
                : palette.buttonText,
            },
          ]}>
          Begin
        </Text>
      </PressableScale>

      {/* Customize link */}
      <Pressable onPress={onOpenSettings} style={styles.customizeLink}>
        <Text style={[styles.customizeLinkText, { color: palette.accent, opacity: 0.7 }]}>
          Customize
        </Text>
      </Pressable>

      <View style={{ height: spacing.xl }} />
    </View>
  );
}

// ------------------------------------------------------------------
// Countdown overlay
// ------------------------------------------------------------------
const COUNTDOWN_STEPS = ['3', '2', '1', 'Breathe'];
const STEP_TOTAL_MS = 1000; // 400 fade in + 200 hold + 400 fade out

function CountdownOverlay({
  palette,
  onCancel,
  onComplete,
}: {
  palette: ResolvedPalette;
  onCancel: () => void;
  onComplete: () => void;
}) {
  const [stepIndex, setStepIndex] = useState(0);
  const opacity = useRef(new RNAnimated.Value(0)).current;
  const cancelledRef = useRef(false);

  useEffect(() => {
    cancelledRef.current = false;
    let step = 0;

    function runStep() {
      if (cancelledRef.current) return;
      if (step >= COUNTDOWN_STEPS.length) {
        onComplete();
        return;
      }
      setStepIndex(step);
      opacity.setValue(0);

      RNAnimated.sequence([
        RNAnimated.timing(opacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        RNAnimated.delay(200),
        RNAnimated.timing(opacity, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]).start(() => {
        step++;
        runStep();
      });
    }

    runStep();

    return () => {
      cancelledRef.current = true;
    };
  }, [onComplete, opacity]);

  const handleCancel = () => {
    cancelledRef.current = true;
    onCancel();
  };

  return (
    <Pressable
      style={[styles.countdownOverlay, { backgroundColor: palette.background }]}
      onPress={handleCancel}>
      <RNAnimated.Text
        style={[
          styles.countdownText,
          { color: palette.text, opacity },
        ]}>
        {COUNTDOWN_STEPS[stepIndex]}
      </RNAnimated.Text>
      <Text style={[styles.cancelHint, { color: palette.subtext }]}>Tap to cancel</Text>
    </Pressable>
  );
}

// ------------------------------------------------------------------
// Running session view
// ------------------------------------------------------------------
function RunningView({
  pattern,
  snapshot,
  controls,
  palette,
  screenReaderEnabled,
  onEnd,
}: {
  pattern: BreathPattern;
  snapshot: ReturnType<typeof useBreathEngine>['snapshot'];
  controls: ReturnType<typeof useBreathEngine>['controls'];
  palette: ResolvedPalette;
  screenReaderEnabled: boolean;
  onEnd: () => void;
}) {
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [showPatternName, setShowPatternName] = useState(true);
  const overlayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const sessionStartTimeRef = useRef(Date.now());

  // Phase label crossfade
  const [displayedPhaseLabel, setDisplayedPhaseLabel] = useState(snapshot.currentPhase.label);
  const phaseLabelOpacity = useRef(new RNAnimated.Value(1)).current;
  const prevPhaseIndexRef = useRef(snapshot.phaseIndex);
  const isRapidPhase = snapshot.currentPhase.durationMs < 1500;

  useEffect(() => {
    if (snapshot.phaseIndex !== prevPhaseIndexRef.current) {
      prevPhaseIndexRef.current = snapshot.phaseIndex;
      if (isRapidPhase) {
        setDisplayedPhaseLabel(snapshot.currentPhase.label);
      } else {
        RNAnimated.timing(phaseLabelOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start(() => {
          setDisplayedPhaseLabel(snapshot.currentPhase.label);
          RNAnimated.timing(phaseLabelOpacity, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }).start();
        });
      }
    }
  }, [snapshot.phaseIndex, snapshot.currentPhase.label, isRapidPhase, phaseLabelOpacity]);

  // Pre-transition: check if near phase end for crossfade
  useEffect(() => {
    if (
      !isRapidPhase &&
      snapshot.phaseRemainingMs < 450 &&
      snapshot.phaseRemainingMs > 50
    ) {
      const nextPhaseIndex =
        snapshot.phaseIndex === pattern.phases.length - 1 ? 0 : snapshot.phaseIndex + 1;
      const resolvedPhases = pattern.phases;
      const nextLabel = resolvedPhases[nextPhaseIndex]?.label ?? '';
      if (nextLabel && nextLabel !== displayedPhaseLabel) {
        RNAnimated.timing(phaseLabelOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start(() => {
          setDisplayedPhaseLabel(nextLabel);
          RNAnimated.timing(phaseLabelOpacity, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }).start();
        });
      }
    }
  }, [
    snapshot.phaseRemainingMs,
    snapshot.phaseIndex,
    pattern.phases,
    isRapidPhase,
    displayedPhaseLabel,
    phaseLabelOpacity,
  ]);

  // Show pattern name for first 5 seconds then fade out
  const patternNameOpacity = useRef(new RNAnimated.Value(1)).current;
  useEffect(() => {
    const timer = setTimeout(() => {
      RNAnimated.timing(patternNameOpacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start(() => setShowPatternName(false));
    }, 5000);
    return () => clearTimeout(timer);
  }, [patternNameOpacity]);

  // Auto-hide overlay after 4 seconds
  const scheduleOverlayHide = useCallback(() => {
    if (overlayTimerRef.current) clearTimeout(overlayTimerRef.current);
    if (screenReaderEnabled) return;
    overlayTimerRef.current = setTimeout(() => {
      setOverlayVisible(false);
    }, 4000);
  }, [screenReaderEnabled]);

  // Screen reader: always show overlay
  useEffect(() => {
    if (screenReaderEnabled) {
      setOverlayVisible(true);
    }
  }, [screenReaderEnabled]);

  // No auto-dim

  // Cleanup timers
  useEffect(() => {
    return () => {
      if (overlayTimerRef.current) clearTimeout(overlayTimerRef.current);
    };
  }, []);

  const handleTap = () => {
    if (snapshot.currentPhaseSkippable) {
      controls.skipPhase();
    } else {
      setOverlayVisible((v) => !v);
      if (!overlayVisible) {
        scheduleOverlayHide();
      }
    }
  };

  const handleLongPress = () => {
    setOverlayVisible(true);
    scheduleOverlayHide();
  };

  const handlePause = () => {
    controls.pause();
  };

  const handleClose = () => {
    Alert.alert(
      'End session?',
      'Your breathing session is still in progress.',
      [
        { text: 'Stay', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: () => {
            controls.reset();
            onEnd();
          },
        },
      ],
    );
  };

  // Skippable pulsing "Tap to breathe"
  const skipPulse = useRef(new RNAnimated.Value(0.4)).current;
  useEffect(() => {
    if (snapshot.currentPhaseSkippable) {
      const anim = RNAnimated.loop(
        RNAnimated.sequence([
          RNAnimated.timing(skipPulse, { toValue: 0.8, duration: 1000, useNativeDriver: true }),
          RNAnimated.timing(skipPulse, { toValue: 0.4, duration: 1000, useNativeDriver: true }),
        ]),
      );
      anim.start();
      return () => anim.stop();
    } else {
      skipPulse.setValue(0);
    }
  }, [snapshot.currentPhaseSkippable, skipPulse]);

  return (
    <View style={styles.runningContainer}>
      {/* Pattern name (fades after 5 seconds) */}
      {showPatternName && (
        <RNAnimated.Text
          style={[
            styles.runningPatternName,
            { color: palette.subtext, opacity: patternNameOpacity },
          ]}>
          {pattern.name}
        </RNAnimated.Text>
      )}

      {/* Visualization area */}
      <Pressable
        style={[
          styles.vizPressable,
          { opacity: 1 },
        ]}
        onPress={handleTap}
        onLongPress={handleLongPress}
        delayLongPress={500}>
        <VisualizationCarousel
          patternId={pattern.id}
          phaseLabel={displayedPhaseLabel}
          currentLevel={snapshot.currentLevel}
          levelTo={snapshot.currentPhase.levelTo}
          phaseRemainingMs={snapshot.phaseRemainingMs}
          cycleProgress={snapshot.cycleProgress}
          animationToken={snapshot.animationToken}
          isRunning={snapshot.status === 'running'}
          reducedMotion={false}
          palette={palette}
        />
      </Pressable>

      {/* Skippable hint */}
      {snapshot.currentPhaseSkippable && (
        <RNAnimated.Text style={[styles.skipHint, { color: palette.subtext, opacity: skipPulse }]}>
          Tap to breathe
        </RNAnimated.Text>
      )}

      {/* Bottom bar — countdown + pause, always visible */}
      <View style={styles.bottomBar}>
        <Text style={[styles.timeRemaining, { color: palette.subtext }]}>
          {formatTimeRemaining(snapshot.sessionRemainingMs)}
        </Text>
        <Pressable
          style={[styles.smallPauseBtn, { backgroundColor: palette.surface }]}
          onPress={handlePause}
          accessibilityRole="button"
          accessibilityLabel="Pause session">
          <View style={styles.pauseLines}>
            <View style={[styles.pauseLine, { backgroundColor: palette.subtext }]} />
            <View style={[styles.pauseLine, { backgroundColor: palette.subtext }]} />
          </View>
        </Pressable>
      </View>

      {/* Tap-to-reveal overlay */}
      {overlayVisible && (
        <View style={styles.overlayContainer} pointerEvents="box-none">
          {/* Top gradient */}
          <LinearGradient
            colors={[`${palette.background}CC`, 'transparent']}
            style={styles.overlayTopGradient}
            pointerEvents="none"
          />

          {/* Close button */}
          <Pressable
            style={styles.overlayClose}
            onPress={handleClose}
            accessibilityRole="button"
            accessibilityLabel="Close session">
            <Text style={[styles.overlayCloseText, { color: palette.subtext }]}>X</Text>
          </Pressable>

          {/* Pattern name center top */}
          <Text style={[styles.overlayPatternName, { color: palette.subtext }]}>
            {pattern.name}
          </Text>

          {/* Bottom gradient */}
          <LinearGradient
            colors={['transparent', `${palette.background}CC`]}
            style={styles.overlayBottomGradient}
            pointerEvents="none"
          />

          {/* Pause button */}
          <Pressable
            style={[styles.pauseButton, { backgroundColor: palette.surface }]}
            onPress={handlePause}
            accessibilityRole="button"
            accessibilityLabel="Pause session">
            <Text style={[styles.pauseButtonText, { color: palette.text }]}>Pause</Text>
          </Pressable>
        </View>
      )}

    </View>
  );
}

// ------------------------------------------------------------------
// Paused view
// ------------------------------------------------------------------
function PausedView({
  pattern,
  snapshot,
  controls,
  palette,
  onEnd,
}: {
  pattern: BreathPattern;
  snapshot: ReturnType<typeof useBreathEngine>['snapshot'];
  controls: ReturnType<typeof useBreathEngine>['controls'];
  palette: ResolvedPalette;
  onEnd: () => void;
}) {
  return (
    <View style={styles.pausedContainer}>
      {/* Visualization with gentle oscillation (isRunning=false triggers hold behavior) */}
      <View style={[styles.vizPressable, { opacity: 0.75 }]}>
        <VisualizationCarousel
          patternId={pattern.id}
          phaseLabel={snapshot.currentPhase.label}
          currentLevel={snapshot.currentLevel}
          levelTo={snapshot.currentPhase.levelTo}
          phaseRemainingMs={snapshot.phaseRemainingMs}
          cycleProgress={snapshot.cycleProgress}
          animationToken={snapshot.animationToken}
          isRunning={false}
          reducedMotion={false}
          palette={palette}
        />
      </View>

      {/* Overlay content */}
      <View style={styles.pausedOverlay}>
        <Text style={[styles.overlayPatternNamePaused, { color: palette.subtext }]}>
          {pattern.name}
        </Text>

        <View style={styles.pausedButtons}>
          <PressableScale
            onPress={controls.resume}
            style={[styles.pausedPrimaryButton, { backgroundColor: palette.accent }]}
            accessibilityRole="button"
            accessibilityLabel="Resume session">
            <Text
              style={[
                styles.pausedButtonText,
                { color: palette.buttonText },
              ]}>
              Resume
            </Text>
          </PressableScale>
          <PressableScale
            onPress={onEnd}
            style={[styles.pausedSecondaryButton, { backgroundColor: palette.surface }]}
            accessibilityRole="button"
            accessibilityLabel="End session">
            <Text style={[styles.pausedButtonText, { color: palette.text }]}>End</Text>
          </PressableScale>
        </View>
      </View>
    </View>
  );
}

// ------------------------------------------------------------------
// Completed view
// ------------------------------------------------------------------
function CompletedView({
  snapshot,
  palette,
  onDone,
  onRepeat,
}: {
  snapshot: ReturnType<typeof useBreathEngine>['snapshot'];
  palette: ResolvedPalette;
  onDone: () => void;
  onRepeat: () => void;
}) {
  const fadeAnim = useRef(new RNAnimated.Value(0)).current;

  useEffect(() => {
    RNAnimated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  return (
    <RNAnimated.View style={[styles.completedContainer, { opacity: fadeAnim }]}>
      <Text style={[styles.completedTitle, { color: palette.text }]}>Session complete</Text>
      <Text style={[styles.completedDetail, { color: palette.subtext }]}>
        {formatDuration(snapshot.sessionElapsedMs)}
      </Text>
      <Text style={[styles.completedCycles, { color: palette.subtext }]}>
        {snapshot.cycleIndex} cycles
      </Text>

      <View style={{ height: spacing.xl }} />

      <PressableScale
        onPress={onDone}
        style={[styles.doneButton, { backgroundColor: palette.accent }]}
        accessibilityRole="button"
        accessibilityLabel="Done">
        <Text
          style={[
            styles.doneButtonText,
            { color: palette.buttonText },
          ]}>
          Done
        </Text>
      </PressableScale>

      <Pressable onPress={onRepeat} style={styles.repeatLink}>
        <Text style={[styles.repeatLinkText, { color: palette.accent, opacity: 0.7 }]}>
          Repeat
        </Text>
      </Pressable>
    </RNAnimated.View>
  );
}

// ------------------------------------------------------------------
// Main session content
// ------------------------------------------------------------------
function SessionContent({
  pattern,
  currentSettings,
}: {
  pattern: BreathPattern;
  currentSettings: SessionSettings;
}) {
  const router = useRouter();
  const navigation = useNavigation();

  const [sessionState, setSessionState] = useState<SessionState>('pre-session');
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [settings, setSettings] = useState<SessionSettings>(currentSettings);
  const [safetyVisible, setSafetyVisible] = useState(false);
  const [safetyChecked, setSafetyChecked] = useState(false);
  const [screenReaderEnabled, setScreenReaderEnabled] = useState(false);

  const sessionStateRef = useRef<SessionState>(sessionState);
  sessionStateRef.current = sessionState;

  const resolvedWithSettings = useMemo(
    () => resolvePattern(pattern, settings),
    [pattern, settings],
  );

  const { snapshot, controls } = useBreathEngine(resolvedWithSettings);
  useBreathAudio(resolvedWithSettings, snapshot, settings);

  const palette = getPalette(settings.themeMode);

  // Phase flash — full screen golden wash on phase transitions
  const flashOpacity = useRef(new RNAnimated.Value(0)).current;
  useEffect(() => {
    if (sessionState === 'running') {
      flashOpacity.setValue(0.10);
      RNAnimated.timing(flashOpacity, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }).start();
    }
  }, [snapshot.animationToken, flashOpacity, sessionState]);

  // Sync engine status with our session state
  useEffect(() => {
    if (snapshot.status === 'completed' && sessionStateRef.current === 'running') {
      setSessionState('completed');
    }
  }, [snapshot.status]);

  // Check screen reader
  useEffect(() => {
    AccessibilityInfo.isScreenReaderEnabled().then(setScreenReaderEnabled).catch(() => {});
    const listener = AccessibilityInfo.addEventListener(
      'screenReaderChanged',
      setScreenReaderEnabled,
    );
    return () => listener.remove();
  }, []);

  // Safety modal: check on mount
  useEffect(() => {
    if (pattern.safetyTier === 'green') {
      setSafetyChecked(true);
      return;
    }
    let cancelled = false;
    AsyncStorage.getItem(`safety-ack-${pattern.id}`)
      .then((value) => {
        if (cancelled) return;
        if (value === 'true') {
          setSafetyChecked(true);
        } else {
          setSafetyVisible(true);
        }
      })
      .catch(() => {
        if (!cancelled) setSafetyVisible(true);
      });
    return () => {
      cancelled = true;
    };
  }, [pattern.id, pattern.safetyTier]);

  const handleSafetyDismiss = useCallback(() => {
    setSafetyVisible(false);
    setSafetyChecked(true);
  }, []);

  // Screen wake lock
  useEffect(() => {
    if (sessionState === 'running') {
      activateKeepAwakeAsync('breath-session').catch(() => {});
    } else {
      deactivateKeepAwake('breath-session');
    }
    return () => {
      deactivateKeepAwake('breath-session');
    };
  }, [sessionState]);

  // App backgrounding: pause on background
  useEffect(() => {
    const handleAppState = (nextState: AppStateStatus) => {
      if (nextState === 'background' || nextState === 'inactive') {
        if (sessionStateRef.current === 'running') {
          controls.pause();
          setSessionState('paused');
        }
      }
    };
    const subscription = AppState.addEventListener('change', handleAppState);
    return () => subscription.remove();
  }, [controls]);

  // Back-navigation guard
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove' as any, (e: any) => {
      const state = sessionStateRef.current;
      if (state === 'running' || state === 'paused') {
        e.preventDefault();
        Alert.alert(
          'End session?',
          'Your breathing session is still in progress.',
          [
            { text: 'Stay', style: 'cancel' },
            {
              text: 'Leave',
              style: 'destructive',
              onPress: () => {
                controls.reset();
                navigation.dispatch(e.data.action);
              },
            },
          ],
        );
      }
    });
    return unsubscribe;
  }, [controls, navigation]);

  const handleBegin = useCallback(() => {
    setSessionState('countdown');
  }, []);

  const handleCountdownCancel = useCallback(() => {
    setSessionState('pre-session');
  }, []);

  const handleCountdownComplete = useCallback(() => {
    controls.start();
    setSessionState('running');
  }, [controls]);

  const handleEndFromPaused = useCallback(() => {
    controls.reset();
    router.back();
  }, [controls, router]);

  const handleEndFromRunning = useCallback(() => {
    controls.reset();
    router.back();
  }, [controls, router]);

  const handleDone = useCallback(() => {
    router.back();
  }, [router]);

  const handleRepeat = useCallback(() => {
    controls.reset();
    setSessionState('countdown');
  }, [controls]);

  const handleApplySettings = useCallback((next: SessionSettings) => {
    setSettings(next);
    setSettingsVisible(false);
  }, []);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  // When engine pauses (from controls.pause()), update session state
  useEffect(() => {
    if (snapshot.status === 'paused' && sessionStateRef.current === 'running') {
      setSessionState('paused');
    }
  }, [snapshot.status]);

  return (
    <LinearGradient colors={[palette.background, palette.backgroundAlt]} style={styles.flex}>
      <SafeAreaView edges={['top', 'bottom']} style={styles.flex}>
        {sessionState === 'pre-session' && (
          <PreSessionView
            pattern={pattern}
            settings={settings}
            palette={palette}
            safetyChecked={safetyChecked}
            onBegin={handleBegin}
            onOpenSettings={() => setSettingsVisible(true)}
            onBack={handleBack}
            onSettingsChange={setSettings}
          />
        )}

        {sessionState === 'countdown' && (
          <CountdownOverlay
            palette={palette}
            onCancel={handleCountdownCancel}
            onComplete={handleCountdownComplete}
          />
        )}

        {sessionState === 'running' && (
          <RunningView
            pattern={pattern}
            snapshot={snapshot}
            controls={controls}
            palette={palette}
            screenReaderEnabled={screenReaderEnabled}
            onEnd={handleEndFromRunning}
          />
        )}

        {sessionState === 'paused' && (
          <PausedView
            pattern={pattern}
            snapshot={snapshot}
            controls={controls}
            palette={palette}
            onEnd={handleEndFromPaused}
          />
        )}

        {sessionState === 'completed' && (
          <CompletedView
            snapshot={snapshot}
            palette={palette}
            onDone={handleDone}
            onRepeat={handleRepeat}
          />
        )}

        <SettingsModal
          visible={settingsVisible}
          pattern={pattern}
          value={settings}
          palette={palette}
          onClose={() => {
            setSettingsVisible(false);
          }}
          onApply={handleApplySettings}
        />

        <SafetyModal
          visible={safetyVisible}
          tier={pattern.safetyTier}
          patternId={pattern.id}
          safetyNote={pattern.safetyNote}
          palette={palette}
          onDismiss={handleSafetyDismiss}
        />
      </SafeAreaView>

      {/* Phase transition flash — absolute over entire screen including safe area */}
      {sessionState === 'running' && (
        <RNAnimated.View
          style={[styles.phaseFlashFullScreen, { opacity: flashOpacity }]}
          pointerEvents="none"
        />
      )}
    </LinearGradient>
  );
}

// ------------------------------------------------------------------
// Root screen export
// ------------------------------------------------------------------
export default function SessionScreen() {
  const { patternId } = useLocalSearchParams<{ patternId: string }>();
  const router = useRouter();

  const pattern = patternId ? getPatternById(patternId) : undefined;
  const initialSettings = pattern ? getInitialSettings(pattern) : null;

  if (!patternId || !pattern || !initialSettings) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>Pattern not found</Text>
        <Pressable onPress={() => router.back()} style={styles.notFoundBack}>
          <Text style={styles.notFoundLink}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  return <SessionContent pattern={pattern} currentSettings={initialSettings} />;
}

// ------------------------------------------------------------------
// Styles
// ------------------------------------------------------------------
const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },

  // Pre-session
  preSessionContainer: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  backArrow: {
    fontSize: 24,
    fontWeight: '300',
  },
  prePatternName: {
    fontSize: 28,
    ...typography.regular,
    textAlign: 'center',
    marginTop: spacing.sm,
    letterSpacing: 0.5,
  },
  preTagline: {
    fontSize: 16,
    ...typography.regular,
    textAlign: 'center',
    marginTop: spacing.sm,
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  preInstructions: {
    fontSize: 14,
    ...typography.regular,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 20,
    paddingHorizontal: 24,
    opacity: 0.6,
  },
  preSpacer: {
    flex: 1,
  },
  beginnerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
  },
  beginnerLabel: {
    fontSize: 16,
    ...typography.regular,
  },
  chipRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  durationChip: {
    height: 36,
    paddingHorizontal: spacing.md,
    borderRadius: radii.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  durationChipText: {
    fontSize: 14,
    ...typography.medium,
  },
  beginButton: {
    height: 56,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  beginButtonText: {
    fontSize: 16,
    ...typography.semibold,
  },
  customizeLink: {
    alignItems: 'center',
    marginTop: spacing.md,
  },
  customizeLinkText: {
    fontSize: 14,
    ...typography.regular,
  },

  // Countdown
  countdownOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.95,
    zIndex: 10,
  },
  countdownText: {
    fontSize: 64,
    ...typography.regular,
  },
  cancelHint: {
    position: 'absolute',
    bottom: 80,
    fontSize: 13,
    opacity: 0.3,
  },

  // Running
  runningContainer: {
    flex: 1,
  },
  phaseFlashFullScreen: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(254,220,151,0.12)',
  },
  runningPatternName: {
    fontSize: 18,
    ...typography.regular,
    textAlign: 'center',
    paddingTop: spacing.md,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 5,
  },
  vizPressable: {
    flex: 1,
  },
  phaseLabel: {
    fontSize: 16,
    ...typography.regular,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  skipHint: {
    fontSize: 14,
    ...typography.regular,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: spacing.xxl,
    paddingHorizontal: spacing.lg,
    gap: 16,
  },
  timeRemaining: {
    fontSize: 14,
    ...typography.regular,
    opacity: 0.5,
  },
  smallPauseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  pauseLines: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  pauseLine: {
    width: 2.5,
    height: 12,
    borderRadius: 1.5,
  },

  // Overlay
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 20,
  },
  overlayTopGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  overlayBottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  overlayClose: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 25,
  },
  overlayCloseText: {
    fontSize: 24,
    fontWeight: '300',
  },
  overlayPatternName: {
    position: 'absolute',
    top: spacing.xl,
    left: 60,
    right: 60,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '400',
  },
  pauseButton: {
    position: 'absolute',
    bottom: spacing.xxl,
    alignSelf: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radii.pill,
  },
  pauseButtonText: {
    fontSize: 16,
    ...typography.semibold,
  },

  // Paused
  pausedContainer: {
    flex: 1,
  },
  pausedOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
  },
  overlayPatternNamePaused: {
    fontSize: 14,
    ...typography.regular,
    marginBottom: spacing.xl,
  },
  pausedButtons: {
    gap: spacing.md,
    width: SCREEN_WIDTH - 96,
  },
  pausedPrimaryButton: {
    height: 48,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pausedSecondaryButton: {
    height: 48,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pausedButtonText: {
    fontSize: 16,
    ...typography.semibold,
  },

  // Completed
  completedContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  completedTitle: {
    fontSize: 24,
    ...typography.regular,
    marginBottom: spacing.sm,
  },
  completedDetail: {
    fontSize: 16,
    ...typography.regular,
    marginTop: spacing.xs,
  },
  completedCycles: {
    fontSize: 14,
    ...typography.regular,
    marginTop: spacing.xs,
  },
  doneButton: {
    height: 56,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  doneButtonText: {
    fontSize: 16,
    ...typography.semibold,
  },
  repeatLink: {
    marginTop: spacing.md,
  },
  repeatLinkText: {
    fontSize: 14,
    ...typography.regular,
  },

  // Not found
  notFound: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#080C12',
  },
  notFoundText: {
    color: '#7A8A9A',
    fontSize: 16,
  },
  notFoundBack: {
    marginTop: 16,
  },
  notFoundLink: {
    color: '#4A8EC2',
    fontWeight: '600',
  },
});
