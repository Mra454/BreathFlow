# BreathFlow — Full App Specification Prompt

You are building **BreathFlow**, a mobile breathing exercise app using **Expo (SDK 55), React Native, TypeScript (strict mode), react-native-reanimated, expo-audio, expo-haptics, and expo-router** (file-based routing). The app guides users through timed breathing patterns with synchronized visuals, sound cues, and haptic feedback.

An initial version already exists. Your job is to enhance it into a complete, polished product based on the specification below. Preserve the existing architecture patterns (snapshot-driven engine, palette-based audio, modular visualizations) and extend them.

---

## 0. CODING RULES (non-negotiable)

- **TypeScript strict mode** — no `any` types, no `@ts-ignore`. All new code must be fully typed.
- **No new npm dependencies** unless explicitly called out in this spec. The existing stack (reanimated, react-native-svg, expo-audio, expo-haptics, pager-view, @react-native-async-storage/async-storage, expo-keep-awake) is sufficient. `@react-native-async-storage/async-storage` and `expo-keep-awake` are the two new dependencies you may add — AsyncStorage for persistence, expo-keep-awake to prevent screen dimming during sessions.
- **Deterministic behavior** — no `Math.random()` at render time. Seed any pseudo-random values from indices or stable keys.
- **No inline styles** in new components — use `StyleSheet.create()`.
- **Unused variables** — prefix with `_` if intentionally unused (e.g., `_index`). Delete anything truly dead.
- **Path aliases** — use `@/*` for `./src/*` imports, `@/assets/*` for `./assets/*`.
- **File structure** — new visualizations in `src/components/visualizations/`, new hooks in `src/hooks/`, types extend `src/types/breath.ts`, data extends `src/data/breathPatterns.ts`.
- **Accuracy over completeness** — if a pattern definition or value is ambiguous, implement only what is explicitly stated. Do not invent behavior.

---

## 1. BREATHING PATTERNS

The app ships with **20 breathing patterns** organized into 6 categories. Each pattern has: id, name, tagline, purpose, intent (typed), cadence label, default session duration, descriptor, audio palette, safety tier, category, an ordered array of phases with explicit keys, and optional beginner overrides.

### 1.1 Categories

| Category ID | Display Name | Description |
|-------------|-------------|-------------|
| `calm-sleep` | Calm & Sleep | Wind-down, parasympathetic activation, sleep induction |
| `focus-performance` | Focus & Performance | Structured patterns for concentration and pre-performance centering |
| `energy-activation` | Energy & Activation | Sympathetic activation, alertness, physical warm-up |
| `balance-wellness` | Balance & Wellness | General regulation, equilibrium, daily maintenance |
| `therapeutic` | Therapeutic | Clinically-informed patterns for respiratory health |
| `quick-reset` | Quick Reset | Single-breath or sub-minute interventions |

### 1.2 Safety Tiers

| Tier | UX Treatment |
|------|-------------|
| `green` | No warnings. Available immediately. |
| `yellow` | Brief comfort note shown before first use. The pattern's `safetyNote` is displayed, or a default: "This pattern includes breath holds or longer phases. Start with shorter durations and stop if uncomfortable." Dismissed with "Got it". Persisted via AsyncStorage key `safety-ack-{patternId}`. |
| `red` | Prominent modal with pattern's `safetyNote` (required), contraindication bullets, "I understand" checkbox, and "Continue" button (disabled until checked). Persisted via AsyncStorage. Pattern card shows a caution badge on the home screen. |

Safety acknowledgments are stored in AsyncStorage and will reset on app reinstall. This is intentional — re-acknowledging red-tier patterns after reinstall is a safety feature.

### 1.3 Phase Key Naming Convention

Every phase has a unique `key` within its pattern. Convention:
- Simple phases: `inhale`, `exhale`, `hold-top`, `hold-bottom`, `rest`
- Multi-step phases: `{phaseType}-{qualifier}` (e.g., `inhale-belly`, `inhale-ribs`, `inhale-chest`)
- Repeated rapid phases: use a single key (e.g., `rapid-inhale`, `rapid-exhale`) — the engine applies `phaseDurations` and `beginnerOverrides` to ALL phases sharing that key, which is the desired behavior for uniform adjustments.
- Wim Hof unique phases: `rapid-inhale`, `rapid-exhale`, `hold-empty`, `recovery-inhale`, `recovery-hold`

### 1.4 Pattern Definitions

**IMPORTANT**: Each pattern below must be implemented exactly as specified. The `phases` array defines the breathing cycle. `levelFrom` and `levelTo` (0–1) drive visualization amplitude — 0 = lungs empty, 1 = lungs full. Every field shown is required unless marked optional.

---

#### Calm & Sleep

**1. Extended Exhale** (existing — update metadata only)
- id: `extended-exhale`, name: "Extended Exhale", tagline: "Longer out-breath for downregulation.", intent: `Calm`, cadence: `4-6`, defaultSessionMinutes: 4, descriptor: "Stress reset", audioPalette: `extended`, safetyTier: `green`, category: `calm-sleep`
- Phases (unchanged):
  - `{ key: 'inhale', label: 'Inhale', durationSec: 4, phaseType: 'inhale', levelFrom: 0.12, levelTo: 1 }`
  - `{ key: 'exhale', label: 'Exhale', durationSec: 6, phaseType: 'exhale', levelFrom: 1, levelTo: 0.12 }`

**2. 4-7-8 Breathing** (existing — update metadata, add beginner overrides)
- id: `four-seven-eight`, name: "4-7-8", tagline: "Sleep-leaning cadence with holds.", intent: `Sleep`, cadence: `4-7-8`, defaultSessionMinutes: 4, descriptor: "Sleep support", audioPalette: `sleep`, safetyTier: `yellow`, category: `calm-sleep`
- safetyNote: "Long holds are not comfortable for everyone. Keep beginner mode on or shorten the hold."
- beginnerOverrides: `{ 'inhale': 3, 'hold-top': 5, 'exhale': 6 }`
- Phases (unchanged):
  - `{ key: 'inhale', label: 'Inhale', durationSec: 4, phaseType: 'inhale', levelFrom: 0.1, levelTo: 1 }`
  - `{ key: 'hold-top', label: 'Hold', durationSec: 7, phaseType: 'hold', levelFrom: 1, levelTo: 1 }`
  - `{ key: 'exhale', label: 'Exhale', durationSec: 8, phaseType: 'exhale', levelFrom: 1, levelTo: 0.1 }`

**3. Coherent Breathing** (existing — update metadata only)
- id: `coherent`, name: "Coherent Breathing", tagline: "A smooth 5-and-5 rhythm.", intent: `Calm`, cadence: `5-5`, defaultSessionMinutes: 5, descriptor: "Calm + Balance", audioPalette: `coherent`, safetyTier: `green`, category: `calm-sleep`
- Phases (unchanged):
  - `{ key: 'inhale', label: 'Inhale', durationSec: 5, phaseType: 'inhale', levelFrom: 0.12, levelTo: 1 }`
  - `{ key: 'exhale', label: 'Exhale', durationSec: 5, phaseType: 'exhale', levelFrom: 1, levelTo: 0.12 }`

**4. 2:1 Ratio Breathing** (NEW)
- id: `two-to-one`, name: "2:1 Ratio", tagline: "Exhale twice as long as you inhale.", purpose: "Deep parasympathetic activation through extended exhalation.", intent: `Calm`, cadence: `4-8`, defaultSessionMinutes: 5, descriptor: "Deep calm", audioPalette: `extended`, safetyTier: `green`, category: `calm-sleep`
- Phases:
  - `{ key: 'inhale', label: 'Inhale', durationSec: 4, phaseType: 'inhale', levelFrom: 0.1, levelTo: 1 }`
  - `{ key: 'exhale', label: 'Exhale', durationSec: 8, phaseType: 'exhale', levelFrom: 1, levelTo: 0.1 }`

**5. Bee Breath (Bhramari)** (NEW)
- id: `bee-breath`, name: "Bee Breath", tagline: "Hum your way to stillness.", purpose: "Vibration and humming activate the vagus nerve for deep calm. Hum audibly on the exhale.", intent: `Calm`, cadence: `4-10`, defaultSessionMinutes: 5, descriptor: "Humming calm", audioPalette: `bee`, safetyTier: `green`, category: `calm-sleep`
- Phases:
  - `{ key: 'inhale', label: 'Inhale', durationSec: 4, phaseType: 'inhale', levelFrom: 0.1, levelTo: 1 }`
  - `{ key: 'exhale', label: 'Hum', durationSec: 10, phaseType: 'exhale', levelFrom: 1, levelTo: 0.1 }`

---

#### Focus & Performance

**6. Box Breathing** (existing — update metadata only)
- id: `box`, name: "Box Breathing", tagline: "Steady structure for calm focus.", intent: `Focus`, cadence: `4-4-4-4`, defaultSessionMinutes: 4, descriptor: "Calm + Focus", audioPalette: `box`, safetyTier: `green`, category: `focus-performance`
- Phases (unchanged):
  - `{ key: 'inhale', label: 'Inhale', durationSec: 4, phaseType: 'inhale', levelFrom: 0.1, levelTo: 1 }`
  - `{ key: 'hold-top', label: 'Hold', durationSec: 4, phaseType: 'hold', levelFrom: 1, levelTo: 1 }`
  - `{ key: 'exhale', label: 'Exhale', durationSec: 4, phaseType: 'exhale', levelFrom: 1, levelTo: 0.1 }`
  - `{ key: 'hold-bottom', label: 'Hold', durationSec: 4, phaseType: 'rest', levelFrom: 0.1, levelTo: 0.1 }`

**7. Triangle Breathing** (NEW)
- id: `triangle`, name: "Triangle Breathing", tagline: "Three-phase focus without the bottom hold.", purpose: "A gentler structured pattern for people who find box breathing's bottom hold uncomfortable.", intent: `Focus`, cadence: `5-5-5`, defaultSessionMinutes: 4, descriptor: "Gentle focus", audioPalette: `box`, safetyTier: `green`, category: `focus-performance`
- Phases:
  - `{ key: 'inhale', label: 'Inhale', durationSec: 5, phaseType: 'inhale', levelFrom: 0.1, levelTo: 1 }`
  - `{ key: 'hold-top', label: 'Hold', durationSec: 5, phaseType: 'hold', levelFrom: 1, levelTo: 1 }`
  - `{ key: 'exhale', label: 'Exhale', durationSec: 5, phaseType: 'exhale', levelFrom: 1, levelTo: 0.1 }`

**8. Grounding Breath** (NEW)
- id: `grounding`, name: "Grounding Breath", tagline: "Asymmetric box for anxious moments.", purpose: "Combines box breathing structure with extended exhale emphasis for grounding during acute anxiety.", intent: `Focus`, cadence: `4-4-6-2`, defaultSessionMinutes: 4, descriptor: "Anxiety ground", audioPalette: `box`, safetyTier: `green`, category: `focus-performance`
- Phases:
  - `{ key: 'inhale', label: 'Inhale', durationSec: 4, phaseType: 'inhale', levelFrom: 0.1, levelTo: 1 }`
  - `{ key: 'hold-top', label: 'Hold', durationSec: 4, phaseType: 'hold', levelFrom: 1, levelTo: 1 }`
  - `{ key: 'exhale', label: 'Exhale', durationSec: 6, phaseType: 'exhale', levelFrom: 1, levelTo: 0.1 }`
  - `{ key: 'rest', label: 'Rest', durationSec: 2, phaseType: 'rest', levelFrom: 0.1, levelTo: 0.1 }`

---

#### Energy & Activation

**9. Wim Hof Power Breathing** (NEW — requires engine extension)
- id: `wim-hof`, name: "Wim Hof Power Breathing", tagline: "30 deep breaths, then hold.", purpose: "Alkalosis-inducing power breathing for energy, resilience, and altered-state exploration.", intent: `Energy`, cadence: `30×(2.5) + hold + recovery`, defaultSessionMinutes: 7, descriptor: "Power round", audioPalette: `energy`, safetyTier: `red`, category: `energy-activation`
- safetyNote: "Never practice in water, while driving, or standing. Contraindicated for epilepsy, pregnancy, and cardiovascular conditions. Tingling and lightheadedness are normal. Stop if you feel faint."
- beginnerOverrides: `{ 'rapid-inhale': 2, 'rapid-exhale': 1.5, 'hold-empty': 30, 'recovery-hold': 10 }` (also reduces to 15 rapid cycles — see beginner mode section)
- **Implementation**: Flatten into a single phase sequence representing **1 round**. The engine's cycle-repeat behavior will automatically produce ~2.7 rounds when session length is 7 minutes (1 round ≈ 153s ≈ 2.5 min: 30×2.5s rapid + 60s hold + 3s recovery + 15s recovery hold).
  - 30× interleaved (inhale, exhale, inhale, exhale... for 30 pairs = 60 phases):
    - `{ key: 'rapid-inhale', label: 'Inhale', durationSec: 1.5, phaseType: 'inhale', levelFrom: 0.2, levelTo: 0.8 }`
    - `{ key: 'rapid-exhale', label: 'Exhale', durationSec: 1, phaseType: 'exhale', levelFrom: 0.8, levelTo: 0.2 }`
  - `{ key: 'hold-empty', label: 'Hold (empty)', durationSec: 60, phaseType: 'rest', levelFrom: 0.05, levelTo: 0.05, skippable: true }`
  - `{ key: 'recovery-inhale', label: 'Recovery', durationSec: 3, phaseType: 'inhale', levelFrom: 0.05, levelTo: 1 }`
  - `{ key: 'recovery-hold', label: 'Recovery hold', durationSec: 15, phaseType: 'hold', levelFrom: 1, levelTo: 1 }`
- Total phases per round: 63. The `hold-empty` phase is **skippable** (see Section 1.6).
- **Level continuity note**: Rapid phases use a consistent 0.2↔0.8 range. The hold-empty starts at 0.05 (a small jump from 0.2 — acceptable, represents full exhale). Recovery-inhale starts at 0.05 matching hold-empty end. Recovery-hold ends at 1, then the cycle repeats with rapid-inhale at 0.2 (jump down — represents the start of a new power round). Reanimated `withTiming` smooths these transitions.

**10. Kapalabhati (Skull-Shining Breath)** (NEW)
- id: `kapalabhati`, name: "Kapalabhati", tagline: "Rapid exhale pulses for energy.", purpose: "Sharp, forceful exhales with passive inhales. Clears the mind and activates the core.", intent: `Energy`, cadence: `30×(1) + rest`, defaultSessionMinutes: 5, descriptor: "Breath pulses", audioPalette: `energy`, safetyTier: `red`, category: `energy-activation`
- safetyNote: "Contraindicated for pregnancy, hernia, recent abdominal surgery, epilepsy, and uncontrolled hypertension. Practice on an empty stomach."
- beginnerOverrides: `{ 'rapid-exhale': 0.7, 'rapid-inhale': 0.7, 'rest': 8 }` (also reduces to 15 rapid cycles)
- **Prep-inhale note**: The user should take a comfortable breath before the first rapid exhale. The prep-inhale phase below handles this — it is specific to Kapalabhati (do NOT add a prep-inhale to Wim Hof or Breath of Fire).
- Phases: 
  - `{ key: 'prep-inhale', label: 'Breathe in', durationSec: 3, phaseType: 'inhale', levelFrom: 0.1, levelTo: 0.6 }`
  - 30× interleaved:
    - `{ key: 'rapid-exhale', label: 'Pulse out', durationSec: 0.5, phaseType: 'exhale', levelFrom: 0.6, levelTo: 0.2 }`
    - `{ key: 'rapid-inhale', label: 'In', durationSec: 0.5, phaseType: 'inhale', levelFrom: 0.2, levelTo: 0.6 }`
  - `{ key: 'rest', label: 'Rest', durationSec: 5, phaseType: 'rest', levelFrom: 0.3, levelTo: 0.3 }`
- **Level continuity**: prep-inhale ends at 0.6, first rapid-exhale starts at 0.6 (continuous). Rapid cycle is 0.2↔0.6 (continuous). Last rapid-inhale ends at 0.6, rest starts at 0.3 (small jump — represents settling). Reanimated smooths this.

**11. Breath of Fire** (NEW)
- id: `breath-of-fire`, name: "Breath of Fire", tagline: "Rapid equal breathing for inner heat.", purpose: "Continuous rapid breathing from the Kundalini yoga tradition. Builds energy and core heat.", intent: `Energy`, cadence: `continuous rapid`, defaultSessionMinutes: 3, descriptor: "Inner fire", audioPalette: `energy`, safetyTier: `red`, category: `energy-activation`
- safetyNote: "Same precautions as Kapalabhati. Start with 30 seconds and build up. Stop if dizzy."
- beginnerOverrides: `{ 'rapid-inhale': 0.6, 'rapid-exhale': 0.6 }` (slower pace for beginners)
- Phases:
  - `{ key: 'rapid-inhale', label: 'In', durationSec: 0.4, phaseType: 'inhale', levelFrom: 0.2, levelTo: 0.7 }`
  - `{ key: 'rapid-exhale', label: 'Out', durationSec: 0.4, phaseType: 'exhale', levelFrom: 0.7, levelTo: 0.2 }`

**12. Lion's Breath** (NEW)
- id: `lions-breath`, name: "Lion's Breath", tagline: "Roar out the tension.", purpose: "Forceful exhale with face and tongue engagement. Releases jaw, throat, and facial tension.", intent: `Energy`, cadence: `4-4`, defaultSessionMinutes: 3, descriptor: "Tension release", audioPalette: `generic`, safetyTier: `green`, category: `energy-activation`
- Phases:
  - `{ key: 'inhale', label: 'Inhale', durationSec: 4, phaseType: 'inhale', levelFrom: 0.1, levelTo: 1 }`
  - `{ key: 'exhale', label: 'Roar', durationSec: 4, phaseType: 'exhale', levelFrom: 1, levelTo: 0.1 }`

---

#### Balance & Wellness

**13. Equal Breathing** (existing — update metadata)
- id: `equal`, name: "Equal Breathing", tagline: "Beginner-friendly symmetry.", intent: `Balance`, cadence: `4-4`, defaultSessionMinutes: 4, descriptor: "Beginner rhythm", audioPalette: `generic`, safetyTier: `green`, category: `balance-wellness`
- Phases (unchanged):
  - `{ key: 'inhale', label: 'Inhale', durationSec: 4, phaseType: 'inhale', levelFrom: 0.12, levelTo: 1 }`
  - `{ key: 'exhale', label: 'Exhale', durationSec: 4, phaseType: 'exhale', levelFrom: 1, levelTo: 0.12 }`

**14. Alternate Nostril Breathing** (NEW)
- id: `alternate-nostril`, name: "Alternate Nostril", tagline: "Balance through alternating flow.", purpose: "Traditional Nadi Shodhana pranayama. Balances the nervous system and calms the mind. Close right nostril → inhale left. Close left → exhale right. Inhale right. Close right → exhale left. That is one cycle.", intent: `Balance`, cadence: `4-4-4-4`, defaultSessionMinutes: 5, descriptor: "Nostril balance", audioPalette: `coherent`, safetyTier: `green`, category: `balance-wellness`
- Phases:
  - `{ key: 'inhale-left', label: 'In (left)', durationSec: 4, phaseType: 'inhale', levelFrom: 0.1, levelTo: 1 }`
  - `{ key: 'exhale-right', label: 'Out (right)', durationSec: 4, phaseType: 'exhale', levelFrom: 1, levelTo: 0.1 }`
  - `{ key: 'inhale-right', label: 'In (right)', durationSec: 4, phaseType: 'inhale', levelFrom: 0.1, levelTo: 1 }`
  - `{ key: 'exhale-left', label: 'Out (left)', durationSec: 4, phaseType: 'exhale', levelFrom: 1, levelTo: 0.1 }`

**15. Sitali (Cooling Breath)** (NEW)
- id: `sitali`, name: "Sitali Cooling Breath", tagline: "Cool inhale, warm exhale.", purpose: "Inhale through a curled tongue (or teeth) to cool the body. Reduces frustration and overheating.", intent: `Balance`, cadence: `5-5`, defaultSessionMinutes: 4, descriptor: "Cooling breath", audioPalette: `coherent`, safetyTier: `green`, category: `balance-wellness`
- Phases:
  - `{ key: 'inhale', label: 'Cool in', durationSec: 5, phaseType: 'inhale', levelFrom: 0.12, levelTo: 1 }`
  - `{ key: 'exhale', label: 'Warm out', durationSec: 5, phaseType: 'exhale', levelFrom: 1, levelTo: 0.12 }`

**16. Resonant Breathing** (NEW)
- id: `resonant`, name: "Resonant Breathing", tagline: "Optimal heart rate variability pace.", purpose: "Slower than coherent breathing, tuned to ~4.6 breaths per minute for maximum HRV.", intent: `Balance`, cadence: `6.5-6.5`, defaultSessionMinutes: 5, descriptor: "HRV optimal", audioPalette: `coherent`, safetyTier: `green`, category: `balance-wellness`
- Phases:
  - `{ key: 'inhale', label: 'Inhale', durationSec: 6.5, phaseType: 'inhale', levelFrom: 0.12, levelTo: 1 }`
  - `{ key: 'exhale', label: 'Exhale', durationSec: 6.5, phaseType: 'exhale', levelFrom: 1, levelTo: 0.12 }`
- Note: `durationSec` is a float. The engine already multiplies by 1000 to get ms (6500ms) — no special handling needed. The SettingsModal stepper for this pattern's phases should use `step: 0.5` (see Section 6.3).

---

#### Therapeutic

**17. Pursed Lip Breathing** (NEW)
- id: `pursed-lip`, name: "Pursed Lip Breathing", tagline: "Slow exhale through pursed lips.", purpose: "Clinically recommended for COPD and exercise recovery. Creates back-pressure that keeps airways open longer.", intent: `Calm`, cadence: `2-5`, defaultSessionMinutes: 5, descriptor: "Airway support", audioPalette: `extended`, safetyTier: `green`, category: `therapeutic`
- Phases:
  - `{ key: 'inhale', label: 'Nose in', durationSec: 2, phaseType: 'inhale', levelFrom: 0.15, levelTo: 1 }`
  - `{ key: 'exhale', label: 'Lips out', durationSec: 5, phaseType: 'exhale', levelFrom: 1, levelTo: 0.15 }`

**18. Buteyko Reduced Breathing** (NEW)
- id: `buteyko`, name: "Buteyko Breathing", tagline: "Breathe less, not more.", purpose: "Gentle nasal breathing with an extended pause to build CO2 tolerance. Useful for asthma management and reducing chronic hyperventilation.", intent: `Calm`, cadence: `3-3-pause`, defaultSessionMinutes: 5, descriptor: "CO2 tolerance", audioPalette: `generic`, safetyTier: `yellow`, category: `therapeutic`
- safetyNote: "The air hunger during the pause is intentional but should never become distressing. Reduce the pause if uncomfortable."
- beginnerOverrides: `{ 'pause': 5 }` (shorter pause for beginners)
- Phases:
  - `{ key: 'inhale', label: 'Gentle in', durationSec: 3, phaseType: 'inhale', levelFrom: 0.15, levelTo: 0.6 }`
  - `{ key: 'exhale', label: 'Gentle out', durationSec: 3, phaseType: 'exhale', levelFrom: 0.6, levelTo: 0.15 }`
  - `{ key: 'pause', label: 'Pause', durationSec: 10, phaseType: 'rest', levelFrom: 0.1, levelTo: 0.1 }`
- Note: `levelTo` for inhale is only 0.6 — Buteyko emphasizes gentle, reduced breathing, not deep breaths.

**19. Staircase Breathing** (NEW)
- id: `staircase`, name: "Staircase Breathing", tagline: "Inhale in steps, exhale smoothly.", purpose: "Segmented inhale builds lung awareness. Each step fills a different zone: belly, ribs, chest.", intent: `Calm`, cadence: `2-2-2-6`, defaultSessionMinutes: 4, descriptor: "Segmented fill", audioPalette: `generic`, safetyTier: `green`, category: `therapeutic`
- Phases:
  - `{ key: 'inhale-belly', label: 'Belly', durationSec: 2, phaseType: 'inhale', levelFrom: 0.1, levelTo: 0.4 }`
  - `{ key: 'inhale-ribs', label: 'Ribs', durationSec: 2, phaseType: 'inhale', levelFrom: 0.4, levelTo: 0.7 }`
  - `{ key: 'inhale-chest', label: 'Chest', durationSec: 2, phaseType: 'inhale', levelFrom: 0.7, levelTo: 1 }`
  - `{ key: 'exhale', label: 'Exhale', durationSec: 6, phaseType: 'exhale', levelFrom: 1, levelTo: 0.1 }`

---

#### Quick Reset

**20. Physiological Sigh** (existing — update metadata only)
- id: `physiological-sigh`, name: "Physiological Sigh", tagline: "Quick reset with a double inhale.", intent: `Reset`, cadence: `2-1-6`, defaultSessionMinutes: 3, descriptor: "Fast reset", audioPalette: `sigh`, safetyTier: `green`, category: `quick-reset`
- safetyNote: "Some people dislike rapid top-up inhales. Keep it gentle and skip if it feels activating."
- Phases (unchanged):
  - `{ key: 'inhale-primary', label: 'Inhale', durationSec: 2, phaseType: 'inhale', levelFrom: 0.1, levelTo: 0.78 }`
  - `{ key: 'inhale-topup', label: 'Top-up', durationSec: 1, phaseType: 'inhale2', levelFrom: 0.78, levelTo: 1 }`
  - `{ key: 'exhale', label: 'Long exhale', durationSec: 6, phaseType: 'exhale', levelFrom: 1, levelTo: 0.1 }`

---

### 1.5 Beginner Mode Overrides (complete table)

When `beginnerMode` is true AND a pattern has `beginnerOverrides`, apply the override durations in `resolvePattern()`. For patterns with repeated rapid phases (Wim Hof, Kapalabhati), beginner mode also reduces the cycle count:

| Pattern | beginnerOverrides | Beginner cycle change |
|---------|-------------------|-----------------------|
| 4-7-8 | `{ 'inhale': 3, 'hold-top': 5, 'exhale': 6 }` | — |
| Wim Hof | `{ 'rapid-inhale': 2, 'rapid-exhale': 1.5, 'hold-empty': 30, 'recovery-hold': 10 }` | 15 rapid cycles (not 30) |
| Kapalabhati | `{ 'rapid-exhale': 0.7, 'rapid-inhale': 0.7, 'rest': 8 }` | 15 rapid cycles (not 30) |
| Breath of Fire | `{ 'rapid-inhale': 0.6, 'rapid-exhale': 0.6 }` | — (already continuous) |
| Buteyko | `{ 'pause': 5 }` | — |

To implement beginner cycle reduction: add an optional `beginnerCycleCount?: number` field to `BreathPattern`. When `beginnerMode` is true and this field exists, `resolvePattern()` should truncate the repeated rapid phase pairs to this count before computing the cycle.

**Algorithm for beginner cycle truncation in `resolvePattern()`:**
1. Identify rapid phases: collect all phases whose `key` starts with `rapid-` (e.g., `rapid-inhale`, `rapid-exhale`).
2. Group them into consecutive pairs. A "pair" is two adjacent phases where both keys start with `rapid-`.
3. Keep only the first `beginnerCycleCount` pairs (= `beginnerCycleCount * 2` individual phases).
4. Preserve all non-rapid phases (prep-inhale, hold-empty, recovery-inhale, recovery-hold, rest) in their original relative positions — before the rapid block, after the rapid block.
5. Return the truncated phase array for cycle computation.

Example — Wim Hof with `beginnerCycleCount: 15`:
- Original: 60 rapid phases + hold-empty + recovery-inhale + recovery-hold = 63 phases
- Truncated: 30 rapid phases + hold-empty + recovery-inhale + recovery-hold = 33 phases

Example — Kapalabhati with `beginnerCycleCount: 15`:
- Original: prep-inhale + 60 rapid phases + rest = 62 phases
- Truncated: prep-inhale + 30 rapid phases + rest = 32 phases

**Override precedence in `resolvePattern()`:** User `phaseDurations` overrides (from settings modal) take priority over `beginnerOverrides`, which take priority over pattern default `durationSec`. Apply in this order:
1. Start with pattern default `durationSec` for each phase
2. If `beginnerMode` is true, apply `beginnerOverrides` for matching keys
3. Apply `phaseDurations` for matching keys (user's manual adjustments always win)

### 1.6 Skippable Phases

Some phases (e.g., Wim Hof's `hold-empty`) should be user-controllable in duration. Add a `skippable?: boolean` field to `BreathPhase`. When true:
- The session UI displays a "Tap to continue" button over the visualization area during that phase.
- Tapping calls a new `skipPhase()` method on the engine (see Section 8.1).
- The phase timer continues as normal if the user does not tap — the `durationSec` acts as a maximum.

---

## 2. VISUALIZATION SYSTEM

### 2.1 Existing Visualizations (keep and polish)

The app currently has 3 visualizations that all implement `VisualizationProps`:

1. **Orb** — Central glowing orb that expands/contracts with breath level. Aura layer + core layer.
2. **Square Path** — Dot traces a square perimeter based on cycleProgress. Inner square scales with level.
3. **Rings** — Concentric rings expand/contract with level. Central core shows phase label.

### 2.2 New Visualizations to Add

Add **3 new visualizations**, all implementing the same `VisualizationProps` interface so they slot into the existing carousel:

**4. Wave Visualization** (`WaveVisualization.tsx`)
- A smooth sine wave that rises and falls with the breath level.
- The wave should span the full width of the container.
- On inhale: wave amplitude increases, crests rise. On exhale: amplitude decreases, wave flattens.
- During holds: wave gently oscillates in place at current amplitude.
- Use 3 layered waves at slightly different phase offsets and opacities for depth (similar to how Rings uses 3 ring layers).
- Color: Use `palette.accent` for primary wave, `palette.accentSoft` for background waves.
- Render with react-native-svg `<Path>` using a computed sine curve. Recompute the SVG path `d` attribute in a `useDerivedValue` based on the animated level shared value.
- Phase label centered above the wave.
- All animation via Reanimated shared values — the SVG path is driven by `useAnimatedProps`, not React state.

**5. Particle Field Visualization** (`ParticleVisualization.tsx`)
- A field of **25 small circles** (particles) that drift inward toward center on exhale and outward on inhale. (25, not 40 — reduced for reliable 60fps on mid-range Android.)
- Particle base positions computed deterministically from index: `angle = (index / 25) * 2 * Math.PI`, `radius = 80 + (index % 5) * 15`. This is computed once at mount, not per frame.
- Animated position: each particle's actual radius is `baseRadius * currentLevel`. At level=1 particles are spread wide; at level=0 they cluster at center.
- Each particle has a subtle offset computed from `Math.sin(index * 1.7)` and `Math.cos(index * 2.3)` for organic feel. These are stable seeds, not random.
- Opacity of particles: `0.3 + 0.7 * currentLevel` (brighter when expanded).
- During holds: particles hold position (driven by level, which is stable during holds).
- Phase label at center.
- Use Reanimated `useAnimatedStyle` per particle. Create all 25 `Animated.View` elements once at mount. Do NOT create/destroy views.
- Particle size: 6px diameter circles with `borderRadius: 3`.

**6. Triangle Path Visualization** (`TriangleVisualization.tsx`)
- Same concept as SquarePathVisualization but tracing an equilateral triangle.
- A dot traces the triangle perimeter based on `cycleProgress`.
- Inner triangle scales with breath level.
- Compute dot position with `pointFromTriangleProgress(progress: number)`:
  - Triangle vertices: top center, bottom-left, bottom-right (inscribed in a circle of radius ~120px).
  - Progress 0–0.333: top → bottom-right edge
  - Progress 0.333–0.666: bottom-right → bottom-left edge
  - Progress 0.666–1: bottom-left → top edge
  - Linear interpolation within each segment.
- Particularly thematic for Triangle Breathing but available for all patterns.
- Use same styling approach as SquarePathVisualization (stroke, dot radius, inner shape opacity).

### 2.3 Visualization Carousel Updates

- Update the `VISUALS` array to include all 6: Orb, Square Path, Rings, Wave, Particles, Triangle Path.
- The carousel should remember the user's last-selected visualization per pattern using AsyncStorage with key `viz-pref-{patternId}`.
- **Default**: If no preference stored, default to index 0 (Orb).
- On page change, save the new preference to AsyncStorage (debounce not needed — page changes are infrequent).
- On mount, read the preference and set the initial page via `PagerView.setPageWithoutAnimation()`.

### 2.4 Responsive Sizing

Visualizations should use responsive sizing based on container dimensions, not hardcoded pixels. Use the container width from the parent layout. Cap visualization area at 320px on larger screens. For V1, portrait phone layout only is acceptable — add `// TODO: tablet/landscape support` comments to the carousel component.

---

## 3. AUDIO SYSTEM

### 3.1 Existing Audio Palettes (keep)

The app uses 9 audio files and maps them to named palettes (box, coherent, extended, sigh, sleep, generic) via `getCueSequence()`.

### 3.2 New Audio Palettes

Add 2 new palette mappings using the **existing audio files** (no new audio files needed):

**`energy` palette** — For Wim Hof, Kapalabhati, Breath of Fire:
- Inhale: `click`
- Exhale: `click`
- Hold/retention phases (phaseType `hold`): `warmLow` spread evenly (1 per second)
- Long empty-lung retention (key `hold-empty`, phaseType `rest`): `warmLow` at **1 cue every 15 seconds** (for a 60s hold, 4 sparse cues at 0s, 15s, 30s, 45s). This provides a subtle time reference without being intrusive during a silent hold. Implement by returning a sparse array with `Math.floor(durationSec / 15)` cues, spaced at 15s intervals.
- Rest phases with key `rest` (Kapalabhati rest between rounds): return an **empty array** `[]`. Override the `Math.max(1, ...)` floor in `getCueSequence` — add a check: if palette is `energy` and phase key is `rest`, return `[]`.

**`bee` palette** — For Bee Breath:
- Inhale: `airyHigh` (1 cue)
- Exhale (hum): `warmLow` spread at 1 cue per second (for a 10s exhale, 10 `warmLow` cues). This uses the existing `Math.round(durationSec)` count logic and works correctly.

### 3.3 Rapid-Phase Audio Handling (CRITICAL)

The current audio system schedules cues on a per-second grid and re-runs the scheduling effect every time `phaseElapsedMs` changes (100ms ticker). For phases under 1.5 seconds, this causes wasteful re-scheduling and potential audio glitches.

**Fix**: Add a `rapidMode` guard to `useBreathAudio`:

```
For any phase where durationSec < 1.5:
  1. Fire a single audio cue at phase start (delay 0) on the FIRST run of the effect for that phaseInstanceKey.
  2. Track fired phases via a ref: `firedPhasesRef = useRef<Set<string>>(new Set())`.
  3. On each effect run, check: if firedPhasesRef.current.has(phaseInstanceKey), return early.
  4. Otherwise, add phaseInstanceKey to the set, play the cue, and return.
  5. Clear the set when the session resets or a non-rapid phase plays.
```

This ensures each rapid phase gets exactly one cue at its start, with no re-scheduling overhead.

### 3.4 Audio Palette Type Update

```typescript
type AudioPalette = 'box' | 'coherent' | 'extended' | 'sigh' | 'sleep' | 'generic' | 'energy' | 'bee';
```

---

## 4. HOME SCREEN REDESIGN

### 4.1 Category-Based Layout

Replace the flat list of patterns with a **categorized layout**:

- Show category headers as section titles using the display names from Section 1.1.
- Under each category header, show a one-line description (from the Category table).
- Below the description, show pattern cards in a vertical list within each section.
- Categories appear in this order: Calm & Sleep, Focus & Performance, Energy & Activation, Balance & Wellness, Therapeutic, Quick Reset.
- When a search filter is active and a category has no matching patterns, hide that entire category section (header + description + cards).

### 4.2 Exercise Card Updates

Update `ExerciseCard` to show:
- Pattern name (bold, primary text)
- Tagline (secondary text, subtext color)
- Cadence label (monospace badge, e.g., "4-4-4-4")
- Intent badge (small pill, e.g., "Focus", "Calm")
- Descriptor label (e.g., "Stress reset")
- Safety tier indicator: red-tier patterns show a small "⚠" text badge. Yellow and green show nothing on the card itself (yellow safety note appears on first session entry).

### 4.3 Search / Filter

- Text input at the top of the home screen, above the first category.
- Filters pattern `name` and `tagline` fields (case-insensitive substring match).
- When filter text is empty, show all categories and patterns.
- When filter text is non-empty, show only matching patterns. Hide empty category sections entirely.
- Clearing the input (via X button or backspace) returns to full view.
- No debounce needed — filtering 20 items is instant.

### 4.4 Home Screen Theme

The home screen currently hardcodes the `night` palette. Keep this behavior — the home screen always uses night theme. Per-session theme selection remains in the session settings modal.

---

## 5. SAFETY SYSTEM

### 5.1 Safety Tier Implementation

Detailed in Section 1.2. Implementation notes:

**Yellow tier modal:**
- Appears on the session screen (`app/session/[patternId].tsx`) as a modal overlay, BEFORE the session can be started.
- If AsyncStorage has `safety-ack-{patternId}`, skip the modal and go straight to idle session state.
- If not acknowledged: show modal. After "Got it" tap, save to AsyncStorage and dismiss.

**Red tier modal:**
- Same location (session screen), same skip-if-acknowledged logic.
- Modal is more prominent: larger text, explicit checkbox, "Continue" button disabled until checked.
- The `safetyNote` text is split into a paragraph + bullet list. The bullet list is derived from the note — parse sentences that start with "Contraindicated for" or "Never practice" into bullets. Or simply render the full note as a paragraph.

### 5.2 Disclaimer

Keep the existing disclaimer box on the home screen. Append: "Patterns marked with ⚠ require additional awareness. Always breathe gently and stop if you feel dizzy, anxious, or uncomfortable."

---

## 6. SETTINGS ENHANCEMENTS

### 6.1 Settings Modal Phase Steppers — Deduplication

For patterns with more than 8 phases (Wim Hof: 63, Kapalabhati: 62), the SettingsModal must NOT render a stepper for every individual phase. Instead:
- Deduplicate by phase `key`: show one stepper row per unique key.
- The stepper label shows the key's label (e.g., "Inhale" for `rapid-inhale`).
- Changing the value updates `phaseDurations[key]`, which applies to ALL phases sharing that key via `resolvePattern()`.

### 6.2 Beginner Mode Toggle Behavior

- The beginner mode toggle in the SettingsModal applies on the next session start, not mid-session.
- When toggled and "Apply" is pressed: the engine resets (existing behavior when settings change triggers `resolvePattern` recomputation). This is acceptable — changing settings already resets.
- The session UI should briefly show "Settings applied — session restarted" as a toast or brief text when this happens.

### 6.3 Stepper Step Size

For phases with non-integer default durations (Resonant Breathing: 6.5s), the stepper should use `step: 0.5`. Detect this by checking if any phase in the pattern has a non-integer `durationSec`. If so, use 0.5 step for all steppers in that pattern. Otherwise, use 1.

---

## 7. TYPE SYSTEM UPDATES

Update `src/types/breath.ts` with these changes:

```typescript
// New union types
export type BreathIntent = 'Focus' | 'Calm' | 'Sleep' | 'Reset' | 'Energy' | 'Balance';
export type SafetyTier = 'green' | 'yellow' | 'red';
export type PatternCategory = 'calm-sleep' | 'focus-performance' | 'energy-activation' | 'balance-wellness' | 'therapeutic' | 'quick-reset';
export type AudioPalette = 'box' | 'coherent' | 'extended' | 'sigh' | 'sleep' | 'generic' | 'energy' | 'bee';

// Add to BreathPhase
export interface BreathPhase {
  // ... existing fields ...
  skippable?: boolean;  // NEW: if true, user can tap to advance past this phase
}

// Update BreathPattern
export interface BreathPattern {
  id: string;
  name: string;
  tagline: string;
  purpose: string;
  intent: BreathIntent;         // CHANGED from string
  cadenceLabel: string;
  defaultSessionMinutes: number;
  descriptor: string;
  audioPalette: AudioPalette;   // CHANGED from string union
  safetyTier: SafetyTier;       // NEW
  category: PatternCategory;    // NEW
  safetyNote?: string;          // Already exists on some patterns
  beginnerOverrides?: Record<string, number>;  // NEW: phaseKey → durationSec
  beginnerCycleCount?: number;  // NEW: for rapid-phase patterns in beginner mode
  phases: BreathPhase[];
}
```

---

## 8. ENGINE UPDATES

### 8.1 Add `skipPhase()` Control

Add a `skipPhase()` function to the `useBreathEngine` return value:
- When called during a running session: immediately advance to the next phase.
- Implementation: clear the current phase timeout, call the same phase-advance logic that `schedulePhaseTimeout` uses when a phase completes naturally.
- Only effective when the current phase has `skippable: true`. If the current phase is not skippable, `skipPhase()` is a no-op.
- The engine snapshot should expose `currentPhaseSkippable: boolean` for the UI to conditionally render the "Tap to continue" button.

### 8.2 Screen Wake Lock

Use `expo-keep-awake` to prevent the screen from dimming during an active session:
- Call `activateKeepAwakeAsync()` when the engine status is `running`.
- Call `deactivateKeepAwake()` when the engine status is `paused`, `completed`, or `idle`, or when the component unmounts.
- Implement in `SessionContent` component.
- This is critical for patterns with long phases (60s Wim Hof hold, 10s Bee Breath exhale) where the user is not touching the screen.

### 8.3 App Backgrounding

Add an `AppState` listener (from `react-native`) in the session screen:
- When app goes to background (`AppState.change` → 'background'): call `engine.pause()`.
- When app returns to foreground (`AppState.change` → 'active'): show paused state. User must manually resume.
- This prevents timer drift and ensures the session state is accurate when the user returns.
- Implement this in `SessionContent` component, not in the engine hook.

### 8.5 Back-Navigation Guard

When the user taps the Back button while a session is `running` or `paused`:
- Show a confirmation dialog: "Leave session? Your progress will be lost."
- Two options: "Stay" (dismiss) and "Leave" (navigate back).
- Use React Navigation's `beforeRemove` event listener on the screen to intercept back navigation.
- If the session is `idle` or `completed`, navigate back without prompting.

### 8.4 Session Completion

When the engine status transitions to `completed`:
- The visualization settles to a resting state (level ~0.3, gentle pulse via `withTiming` with `duration: 2000`).
- Show centered text: "Session complete" with total duration (formatted as "X min Y sec") and cycles completed.
- Two buttons: "Repeat" (calls `engine.restart()`) and "Done" (navigates back to home).
- No confetti, no rating prompt, no heavy animation.

---

## 9. IMPLEMENTATION PRIORITIES

Implement in this order. Each step should be verified before moving to the next.

1. **Type system updates** — Add new types, update interfaces in `src/types/breath.ts`
2. **Engine updates** — Add `skipPhase()`, ensure float durations work, verify sub-second phase handling
3. **Pattern data** — Add all 20 patterns with full metadata, phase keys, beginner overrides in `src/data/breathPatterns.ts`
4. **Audio system** — Add `energy` and `bee` palettes, implement rapid-mode guard in `useBreathAudio`
5. **Safety system** — Add AsyncStorage dependency, implement tier modals on session screen
6. **Home screen** — Category layout, updated ExerciseCard, search filter
7. **New visualizations** — Wave, Particles, Triangle Path
8. **Visualization carousel** — Add new vizs, AsyncStorage preference memory
9. **Beginner mode** — Override durations, cycle count reduction in `resolvePattern()`
10. **Settings modal** — Phase stepper deduplication, 0.5 step size, beginner toggle behavior
11. **Session completion** — Completion screen with stats
12. **Screen wake lock** — expo-keep-awake during running sessions
13. **App backgrounding** — AppState listener for auto-pause
14. **Back-navigation guard** — Confirmation dialog when leaving active session
15. **Verification** — Manually test each of the 20 patterns through at least one full cycle. Specifically verify:
    - Breath of Fire and Kapalabhati do not produce audio glitches
    - Wim Hof cycles through 3 rounds and the "Tap to continue" button works on the retention hold
    - Resonant Breathing's 6.5s phases display correctly in the settings stepper
    - Staircase Breathing's three inhale steps transition smoothly with correct level progression
    - All visualizations animate smoothly for both rapid (0.4s) and slow (10s) phases

---

## 10. CONSTRAINTS

- **No new npm dependencies** except `@react-native-async-storage/async-storage` (persistence) and `expo-keep-awake` (screen wake lock during sessions).
- **TypeScript strict mode** — no `any`, no `@ts-ignore`, all new code fully typed.
- **Deterministic** — no `Math.random()` at render time. Seed pseudo-random from stable indices.
- **Do not restructure the engine architecture**. The snapshot-driven `useBreathEngine` pattern works. Add `skipPhase()` as an extension, not a rewrite.
- **Keep the same file structure**. New files go in the appropriate existing directories.
- **Preserve both themes** (night and mist). All new visualizations must respect the palette system.
- **No external API calls**. Everything is local/offline.
- **Accessibility**: All interactive elements need `accessibilityLabel`. The "Tap to continue" button during skippable phases must be accessible.
- **Performance**: Visualizations must run at 60fps. Use `useAnimatedStyle` and shared values. All visualizations must use Reanimated `withTiming` to animate between level values — do NOT rely on the 100ms ticker for smooth visual updates. The ticker provides the data; Reanimated interpolates the animation.

---

## 11. WHAT SUCCESS LOOKS LIKE

When complete, a user should be able to:
1. Open the app and see 20 breathing patterns organized into 6 labeled categories
2. Search/filter patterns by name or tagline
3. See ⚠ indicators on red-tier pattern cards
4. Acknowledge safety warnings (yellow: brief note, red: checkbox confirmation) on first use
5. Start any pattern and see synchronized visual + audio + haptic guidance
6. Swipe between 6 different visualization styles during a session
7. Have their visualization preference remembered per pattern across sessions
8. Adjust session duration and individual phase timings in settings
9. Use beginner mode for gentler versions of advanced patterns (shorter holds, fewer rapid cycles)
10. Tap "Tap to continue" during Wim Hof retention holds to advance when ready
11. See a completion summary (duration, cycles) when a session ends
12. Have the session auto-pause when the app is backgrounded
13. Resume or restart from the paused state
