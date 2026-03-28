import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BreathEngineSnapshot, ResolvedBreathPattern } from '../types/breath';
import { clamp, lerp } from '../utils/format';

export function useBreathEngine(pattern: ResolvedBreathPattern) {
  const [status, setStatus] = useState<BreathEngineSnapshot['status']>('idle');
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [cycleIndex, setCycleIndex] = useState(0);
  const [phaseElapsedMs, setPhaseElapsedMs] = useState(0);
  const [sessionElapsedMs, setSessionElapsedMs] = useState(0);
  const [animationToken, setAnimationToken] = useState(0);

  const tickerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const phaseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sessionStartedAtRef = useRef<number | null>(null);
  const phaseStartedAtRef = useRef<number | null>(null);
  const accumulatedSessionElapsedRef = useRef(0);
  const accumulatedPhaseElapsedRef = useRef(0);
  const currentPhaseIndexRef = useRef(0);
  const currentCycleIndexRef = useRef(0);

  const phases = pattern.phases;
  const currentPhase = phases[phaseIndex] ?? phases[0];

  const clearTimers = useCallback(() => {
    if (tickerRef.current) {
      clearInterval(tickerRef.current);
      tickerRef.current = null;
    }
    if (phaseTimeoutRef.current) {
      clearTimeout(phaseTimeoutRef.current);
      phaseTimeoutRef.current = null;
    }
  }, []);

  const syncNow = useCallback(() => {
    const now = Date.now();
    const runningSessionDelta = sessionStartedAtRef.current ? now - sessionStartedAtRef.current : 0;
    const runningPhaseDelta = phaseStartedAtRef.current ? now - phaseStartedAtRef.current : 0;
    const nextSessionElapsed = Math.min(
      pattern.sessionLengthMs,
      accumulatedSessionElapsedRef.current + runningSessionDelta,
    );
    const currentPhaseDurationMs = phases[currentPhaseIndexRef.current]?.durationMs ?? 0;
    const nextPhaseElapsed = Math.min(
      currentPhaseDurationMs,
      accumulatedPhaseElapsedRef.current + runningPhaseDelta,
    );

    setSessionElapsedMs(nextSessionElapsed);
    setPhaseElapsedMs(nextPhaseElapsed);

    return {
      sessionElapsedMs: nextSessionElapsed,
      phaseElapsedMs: nextPhaseElapsed,
    };
  }, [pattern.sessionLengthMs, phases]);

  const complete = useCallback(() => {
    clearTimers();
    sessionStartedAtRef.current = null;
    phaseStartedAtRef.current = null;
    accumulatedSessionElapsedRef.current = pattern.sessionLengthMs;
    accumulatedPhaseElapsedRef.current = 0;
    setStatus('completed');
    setSessionElapsedMs(pattern.sessionLengthMs);
  }, [clearTimers, pattern.sessionLengthMs]);

  const scheduleTicker = useCallback(() => {
    clearTimers();
    tickerRef.current = setInterval(() => {
      const { sessionElapsedMs: nextSessionElapsed } = syncNow();
      if (nextSessionElapsed >= pattern.sessionLengthMs) {
        complete();
      }
    }, 100);
  }, [clearTimers, complete, pattern.sessionLengthMs, syncNow]);

  const schedulePhaseTimeout = useCallback(
    (remainingMs: number) => {
      if (phaseTimeoutRef.current) {
        clearTimeout(phaseTimeoutRef.current);
      }

      phaseTimeoutRef.current = setTimeout(() => {
        const nextPhaseIndex =
          currentPhaseIndexRef.current === phases.length - 1 ? 0 : currentPhaseIndexRef.current + 1;
        const nextCycleIndex =
          nextPhaseIndex === 0 ? currentCycleIndexRef.current + 1 : currentCycleIndexRef.current;

        currentPhaseIndexRef.current = nextPhaseIndex;
        currentCycleIndexRef.current = nextCycleIndex;
        phaseStartedAtRef.current = Date.now();
        accumulatedPhaseElapsedRef.current = 0;

        setPhaseIndex(nextPhaseIndex);
        setCycleIndex(nextCycleIndex);
        setPhaseElapsedMs(0);
        setAnimationToken((token) => token + 1);

        schedulePhaseTimeout(phases[nextPhaseIndex].durationMs);
      }, remainingMs);
    },
    [phases],
  );

  const reset = useCallback(() => {
    clearTimers();
    sessionStartedAtRef.current = null;
    phaseStartedAtRef.current = null;
    accumulatedSessionElapsedRef.current = 0;
    accumulatedPhaseElapsedRef.current = 0;
    currentPhaseIndexRef.current = 0;
    currentCycleIndexRef.current = 0;

    setStatus('idle');
    setPhaseIndex(0);
    setCycleIndex(0);
    setPhaseElapsedMs(0);
    setSessionElapsedMs(0);
    setAnimationToken((token) => token + 1);
  }, [clearTimers]);

  const start = useCallback(() => {
    const now = Date.now();
    currentPhaseIndexRef.current = 0;
    currentCycleIndexRef.current = 0;
    accumulatedSessionElapsedRef.current = 0;
    accumulatedPhaseElapsedRef.current = 0;
    sessionStartedAtRef.current = now;
    phaseStartedAtRef.current = now;

    setStatus('running');
    setPhaseIndex(0);
    setCycleIndex(0);
    setPhaseElapsedMs(0);
    setSessionElapsedMs(0);
    setAnimationToken((token) => token + 1);

    scheduleTicker();
    schedulePhaseTimeout(phases[0].durationMs);
  }, [phases, schedulePhaseTimeout, scheduleTicker]);

  const pause = useCallback(() => {
    if (status !== 'running') {
      return;
    }

    const now = Date.now();
    const sessionDelta = sessionStartedAtRef.current ? now - sessionStartedAtRef.current : 0;
    const phaseDelta = phaseStartedAtRef.current ? now - phaseStartedAtRef.current : 0;

    accumulatedSessionElapsedRef.current = Math.min(
      pattern.sessionLengthMs,
      accumulatedSessionElapsedRef.current + sessionDelta,
    );
    accumulatedPhaseElapsedRef.current = Math.min(
      phases[currentPhaseIndexRef.current].durationMs,
      accumulatedPhaseElapsedRef.current + phaseDelta,
    );

    sessionStartedAtRef.current = null;
    phaseStartedAtRef.current = null;
    clearTimers();
    syncNow();
    setStatus('paused');
    setAnimationToken((token) => token + 1);
  }, [clearTimers, pattern.sessionLengthMs, phases, status, syncNow]);

  const resume = useCallback(() => {
    if (status !== 'paused') {
      return;
    }

    const now = Date.now();
    sessionStartedAtRef.current = now;
    phaseStartedAtRef.current = now;
    setStatus('running');
    setAnimationToken((token) => token + 1);

    const remainingMs =
      phases[currentPhaseIndexRef.current].durationMs - accumulatedPhaseElapsedRef.current;

    scheduleTicker();
    schedulePhaseTimeout(Math.max(remainingMs, 0));
  }, [phases, schedulePhaseTimeout, scheduleTicker, status]);

  const restart = useCallback(() => {
    reset();
    requestAnimationFrame(() => start());
  }, [reset, start]);

  useEffect(() => {
    reset();
  }, [pattern.id, pattern.sessionLengthMs, pattern.cycleDurationMs, reset]);

  useEffect(() => () => clearTimers(), [clearTimers]);

  const snapshot = useMemo<BreathEngineSnapshot>(() => {
    const phaseDurationMs = currentPhase.durationMs;
    const phaseProgress = phaseDurationMs === 0 ? 0 : clamp(phaseElapsedMs / phaseDurationMs);
    const currentLevel = lerp(currentPhase.levelFrom, currentPhase.levelTo, phaseProgress);

    const elapsedBeforePhase = phases
      .slice(0, phaseIndex)
      .reduce((sum, phase) => sum + phase.durationMs, 0);
    const cycleProgress = clamp((elapsedBeforePhase + phaseElapsedMs) / pattern.cycleDurationMs);

    return {
      status,
      phaseIndex,
      cycleIndex,
      sessionElapsedMs,
      sessionRemainingMs: Math.max(0, pattern.sessionLengthMs - sessionElapsedMs),
      sessionProgress: clamp(sessionElapsedMs / pattern.sessionLengthMs),
      phaseElapsedMs,
      phaseRemainingMs: Math.max(0, phaseDurationMs - phaseElapsedMs),
      phaseProgress,
      cycleProgress,
      currentLevel,
      animationToken,
      phaseInstanceKey: `${cycleIndex}-${phaseIndex}-${animationToken}`,
      currentPhase,
    };
  }, [
    animationToken,
    currentPhase,
    cycleIndex,
    pattern.cycleDurationMs,
    pattern.sessionLengthMs,
    phaseElapsedMs,
    phaseIndex,
    phases,
    sessionElapsedMs,
    status,
  ]);

  return {
    snapshot,
    controls: {
      start,
      pause,
      resume,
      restart,
      reset,
    },
  };
}
