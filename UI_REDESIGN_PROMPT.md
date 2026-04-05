# BreathFlow — UI Redesign Prompt

You are redesigning the UI of **BreathFlow**, an Expo/React Native breathing exercise app. The app's functionality is complete (20 patterns, 6 visualizations, audio, haptics, safety system). Your job is to **redesign every screen** for visual calm, simplicity, and polish — without changing the underlying data model, engine, or audio system.

---

## 0. DESIGN PHILOSOPHY

Every design decision must answer: **"Does this help the user breathe, or does it get in the way?"**

The best breathing app session screen is one the user doesn't look at. The visualization is for soft-focus or peripheral awareness, not active reading. The user may have their eyes closed. The app should feel like a quiet room, not a dashboard.

### Core Principles (non-negotiable)

1. **One action per screen.** The browse screen selects. The pre-session screen starts. The session screen breathes. The completion screen dismisses.
2. **Reduce, then reduce again.** If you're debating whether to show something, don't show it.
3. **Dark by default.** The app assumes dim rooms and evening use. Background should be near-black (#0A0E14 range). OLED-friendly.
4. **4 colors maximum per screen.** One dark background, one accent, one primary text, one muted text. That's it.
5. **Rounded everything.** 20px+ border radius on cards. Pill-shaped buttons. Fully round visualizations.
6. **Light font weights, generous sizing.** Body 16px+, headings 28-36px. Prefer weight 300-400. Bold (700) only for the single most important element on screen.
7. **Whitespace is a feature.** 40-60% of screen area should be empty space. Sections should have 32-48px spacing between them.
8. **Animate like a living thing.** Cubic easing everywhere. Never linear. Every motion accelerates and decelerates.

---

## 1. HOME SCREEN — Complete Redesign

### Current Problems
- Wall of identically-styled cards creates decision fatigue
- Too much metadata per card (cadence badge, intent pill, descriptor, tagline — 4 text elements + 2 badges)
- Category headers are plain text with no visual weight
- Search input adds UI complexity for 20 items (unnecessary)
- Disclaimer takes significant screen real estate
- No visual hierarchy — every pattern looks equally important
- Feels like a settings panel, not a wellness app

### New Design: Intent-Based Navigation

**Remove the flat scrolling list entirely.** Replace with a two-layer navigation:

#### Layer 1: Intent Selection (Home Screen)

The home screen shows **5 large, tappable intent cards** — one per user goal. Each card is a full-width rounded rectangle (20px radius) with generous height (120px), a subtle gradient background, and a single word + one-line subtitle:

| Intent | Label | Subtitle | Gradient (left→right) |
|--------|-------|----------|-----------------------|
| Calm & Sleep | "Wind Down" | "Slow your breath, quiet your mind" | `#0A1628` → `#142238` |
| Focus & Performance | "Sharpen" | "Structured breathing for clear thinking" | `#0A1628` → `#1A2040` |
| Energy & Activation | "Energize" | "Wake up your body and mind" | `#1A1018` → `#281828` |
| Balance & Wellness | "Balance" | "Find your center" | `#0A1A18` → `#142A22` |
| Therapeutic | "Breathe Well" | "Clinically-informed respiratory support" | `#0A1628` → `#182030` |

Quick Reset gets **special treatment**: a smaller card at the very top of the screen, above the intent cards, styled as a "quick action":
- Compact height (64px), full width
- If the `quick-reset` category has exactly 1 pattern: label "Quick Reset — Physiological Sigh", tapping goes directly to pre-session
- If the category has >1 pattern in the future: label "Quick Reset", tapping navigates to the category screen like any other intent card
- Subtitle: "One double-inhale sigh to reset your nervous system" (or category description if multiple patterns)

**Header**: 
- "BreathFlow" in light weight (300), 28px, centered, with generous top padding (48px from safe area)
- No subtitle, no description paragraph, no "Breath Atlas" branding
- The app name IS the header. Nothing else.

**First-launch hint**: On first app open (check AsyncStorage `onboarding-seen`), show a single dismissible card at the top of the screen, between the header and the quick-reset card: "Choose how you want to feel right now." — 15px, muted text, centered, with a small "✕" to dismiss. One-time only. This gives first-time users context for the intent cards without a multi-step onboarding flow.

**Disclaimer**: Move to a small "ℹ" icon button in the top-right corner that opens a bottom sheet. The disclaimer should NOT be on the home screen surface. On first launch (check AsyncStorage `disclaimer-seen`), the info sheet auto-opens once so the user sees the disclaimer without having to find it.

**Intent → Category mapping** (explicit, for the router):
```
"Wind Down"    → categoryId: "calm-sleep"
"Sharpen"      → categoryId: "focus-performance"  
"Energize"     → categoryId: "energy-activation"
"Balance"      → categoryId: "balance-wellness"
"Breathe Well" → categoryId: "therapeutic"
"Quick Reset"  → categoryId: "quick-reset"
```

**Search**: Remove entirely. With only 5 intent cards + 1 quick action, search is unnecessary. Pattern selection happens on the next screen.

**Safety indicators**: No safety badges on the home screen. Safety modals appear when opening a red-tier pattern — that's sufficient.

#### Layer 2: Pattern Selection (New Screen)

Tapping an intent card navigates to a **pattern selection screen** for that category. This screen shows:

- **Back arrow** (top-left, 44x44 hit target) — no text, just "←" in accent color, 24px top padding from safe area
- **Category name** as header (e.g., "Wind Down") — 28px, weight 300, 16px below back arrow
- **Category subtitle** — the description from CATEGORY_META, 15px, muted text, 8px below header
- **Pattern cards** in a vertical ScrollView, 32px top margin from subtitle, each showing:
  - Pattern name (18px, weight 500, primary text)
  - Tagline (14px, weight 400, muted text, 4px below name)
  - Duration badge: "4 min" — right-aligned, 13px, muted pill background
  - Card padding: 16px vertical, 16px horizontal (plus 3px for left bar)
  - Card min-height: 72px
  - That's it. No cadence labels, no intent badges, no descriptors.
- Cards have subtle left-border accent color (3px, accent color at 30% opacity) for visual rhythm
- 12px spacing between cards
- Cards use subtle `surface` background color with no visible border. The left-accent-bar is the only visual boundary.
- Horizontal padding: 24px on both sides

**Red-tier patterns** show a small "Advanced" label in muted text (13px) below the tagline. The safety modal appears on the pre-session screen when the user taps a red-tier pattern — not on this screen.

**Beginner mode indicator for red-tier patterns**: If `beginnerMode` is on (the default), red-tier pattern cards show "Beginner pace" in a small accent pill next to "Advanced". This reassures new users that the pattern will be gentler.

#### Navigation Structure

This requires adding a new route: `app/category/[categoryId].tsx`

```
Home (app/index.tsx)
  → Category (app/category/[categoryId].tsx)  [NEW]
    → Pre-Session (app/session/[patternId].tsx)
      → In-Session (same screen, different state)
```

For Quick Reset: Home → Pre-Session directly.

---

## 2. PRE-SESSION SCREEN — New Concept

### Current Problems
- The session screen immediately shows the visualization, controls, settings — all at once
- No moment of preparation between selecting and breathing
- Settings gear icon implies configuration work
- Phase label and timer visible before session starts — premature information

### New Design: The Commitment Moment

When navigating to a pattern (from category screen), show a **pre-session screen** before the breathing starts. This is a single, focused screen:

**Layout (top to bottom):**
1. **Back arrow** (top-left, same style as category screen)
2. **Pattern name** (28px, light weight, centered) — e.g., "Box Breathing"
3. **One-line purpose** (16px, muted text, centered, max 2 lines) — e.g., "Steady structure for calm focus"
4. **Spacer** (flex: 1)
5. **Duration selector** — horizontal row of pill-shaped chips. Algorithm for generating chips: start with the pattern's `defaultSessionMinutes`, then include `[default - 1, default, default + 1, default * 2]`, filtered to values ≥ 1 and ≤ 20, deduplicated. Always include the pattern default. E.g., for a 4-min default: `3` `4` `5` `8`. For a 7-min default (Wim Hof): `6` `7` `8` `14`. Selected chip uses accent background + dark text. Unselected chips use surface background + muted text. Chip height: 36px, horizontal padding 16px, 8px gap between chips.
6. **Beginner mode toggle** (visible only for red-tier patterns) — a simple toggle row: "Beginner pace" with a Switch. This is shown ABOVE the duration selector, not buried in settings. For green/yellow patterns, beginner mode is accessible only via settings.
7. **Spacer** (24px)
8. **"Begin" button** — large pill button (full width minus 48px padding, 56px height), accent color background, "Begin" in dark text, weight 600. This is THE primary action. When safety modal is active (not yet acknowledged), the Begin button renders disabled: surface background, muted text, `opacity: 0.5`.
9. **Settings link** — small text below Begin: "Customize" in muted accent color (14px). Tapping opens the settings bottom sheet. This is deliberately de-emphasized.
10. **Spacer** (32px + safe area bottom)

**Safety modals** appear automatically when the pre-session screen mounts for yellow/red patterns that haven't been acknowledged (checked via AsyncStorage `safety-ack-{patternId}`). The Begin button is disabled until the modal is dismissed.

**The 3-2-1 countdown**: After tapping "Begin", show a brief countdown overlay:
- Full-screen dark overlay (background color at 0.95 opacity)
- Large centered number: "3" → "2" → "1" → "Breathe" — 64px, weight 300
- Each number fades in and out (400ms in, 200ms hold, 400ms out)
- Then crossfade (600ms) to the in-session view
- **Cancel**: Tapping anywhere during the countdown cancels it and returns to pre-session state. Show a small "Tap to cancel" hint at the bottom (13px, muted, 30% opacity) during the countdown.
- The engine's `controls.start()` is called AFTER the countdown completes, not when "Begin" is tapped. The engine remains in `idle` during countdown.

---

## 3. IN-SESSION SCREEN — Radical Simplification

### Current Problems
- Header bar with Back, pattern name, and Settings visible during breathing — too many elements
- Phase label and session timer always visible — information overload
- Control buttons at bottom are always prominent
- The visualization shares attention with UI chrome
- No auto-dimming

### New Design: The Visualization IS the Screen

**Default state (running):**

**Pattern name at session start**: Show the pattern name (18px, muted text, centered) at the top of the screen for the first 5 seconds of the session, then fade it out (400ms). This gives the user context without permanent chrome. After the initial 5 seconds, the name is only accessible via the tap-to-reveal overlay.

The screen shows exactly **3 elements** (after the initial 5 seconds):
1. **The breathing visualization** — centered, taking up 60-70% of the screen. No containing box. No border. The visualization floats on the dark background.
2. **Phase label** — overlaid on or just below the visualization center. 16px, weight 400, muted text. Fades between phases with a 300ms crossfade. Text changes 200ms before the animation phase changes.
3. **Time remaining** — very small (13px), very muted (40% opacity), positioned at the bottom center with generous bottom padding (48px). Format: "4:32" not "4:32 left" — no extra words.

**That's it.** No header. No pattern name. No settings icon. No visible pause button.

**Hidden controls (appear on tap):**

Tapping the screen reveals an overlay that fades in (200ms) and auto-hides after 4 seconds:
- **Top-left**: "✕" close button (24px, muted text, 44x44 hit target)
- **Top-center**: Pattern name (14px, muted text)
- **Bottom-center**: Pause button (pill shape, "Pause", surface background)
- The overlay has a very subtle dark gradient at top and bottom edges to ensure text readability

**Gesture priority rules (critical — these resolve conflicts between tap, swipe, and skip):**
1. **Horizontal swipe** → always handled by PagerView (change visualization). No interference.
2. **Tap during skippable phase** → calls `skipPhase()`. Does NOT show overlay. The "Tap to breathe" label is the visual affordance.
3. **Tap during non-skippable phase** → toggles the control overlay (show/hide).
4. **Long-press (500ms) during skippable phase** → shows the control overlay (escape hatch to pause/exit during a hold).
5. Implementation: Wrap the visualization area in a `Pressable` with `onPress` and `onLongPress`. Check `snapshot.currentPhaseSkippable` in the `onPress` handler to decide behavior.

**Emergency exit (independent of overlay):**
- **iOS swipe-back gesture** and **Android hardware back button** always trigger the back-navigation guard (`Alert.alert`) directly, without requiring the overlay to be visible. This ensures ≤2 interactions to exit even during distress.
- The `beforeRemove` listener on the navigation handles this independently of the overlay state.

**Accessibility — screen reader support:**
- When `AccessibilityInfo.isScreenReaderEnabled` is true, NEVER auto-hide the controls. The overlay stays visible at all times so VoiceOver/TalkBack can navigate to pause/close buttons.
- All controls have `accessibilityRole="button"` and descriptive `accessibilityLabel` values.
- The phase label has `accessibilityLiveRegion="polite"` so screen readers announce phase changes.

**Paused state:**

When paused, the overlay stays visible permanently (doesn't auto-hide):
- Visualization freezes at current level (gentle 0.3% oscillation to feel alive, not frozen)
- Two buttons centered vertically: "Resume" (accent, pill) and "End" (surface/muted, pill)
- Pattern name visible at top
- Tapping "End" navigates back to home (no confirmation needed — the user already chose to pause)

**Skippable phases (Wim Hof hold):**

When `currentPhaseSkippable` is true:
- A pulsing "Tap to breathe" label appears below the phase label
- Tapping the screen calls `skipPhase()` (see gesture priority rule #2 above)
- The label pulses opacity between 0.4 and 0.8 with a 2-second sine cycle
- Long-press (500ms) shows the control overlay instead (rule #4)

**Completed state:**

Crossfade from the session to a centered completion card:
- "Session complete" (24px, light weight)
- Duration: "4 min 12 sec" (16px, muted)
- Cycles: "12 cycles" (14px, muted)
- Spacer (32px)
- "Done" button (accent, pill, full width) — navigates home
- "Repeat" text link below (muted accent, 14px)

**Auto-dimming:**
- 8 seconds after session starts (or after last tap), dim the UI:
  - Fade time remaining text to 0 opacity (hidden)
  - Reduce visualization container opacity to 0.75
  - Phase label remains at full opacity (it's the minimum viable information)
- Any tap restores full brightness for 8 seconds.
- This is a visual dim effect, not an actual screen brightness change. True black areas on OLED emit no light regardless.
- When accessibility "reduce transparency" is enabled, skip auto-dimming entirely.
- This is distinct from the screen wake lock (which prevents the device from sleeping).

### Visualization Carousel — Simplified

**Remove the dot indicators and labels from the carousel.** The user discovers swiping naturally, or they don't — either way is fine. The visualization should feel like it IS the app, not like it's a widget with navigation.

- Remove "Swipe to change the visual style" text
- Remove the labeled dots (Orb, Path, Rings, etc.)
- Just the PagerView with the visualizations, full-bleed
- The remembered preference per pattern still works silently via AsyncStorage

---

## 4. SETTINGS MODAL — Minimize and Hide

### Current Problems
- Too many options visible at once (session length, volume, sound, haptics, high contrast, beginner mode, theme, phase timing)
- Phase timing steppers for every phase is overwhelming
- Settings feel like a configuration screen for software, not a wellness app

### New Design: Progressive Disclosure

**Primary settings** (always visible in sheet):
- Session length — pill chips (same algorithm as pre-session duration selector)
- Sound toggle — on/off
- Volume — simple stepper (0%, 25%, 50%, 75%, 100%) only visible when sound is on. Users need in-app volume control independent of system volume for mixing with background music.

**"More options" expandable section** (collapsed by default, "More options" text link to expand):
- Haptics toggle
- Beginner mode toggle (with one-line description: "Gentler pace for advanced patterns")
- Theme toggle (Night / Mist)

**"Timing" expandable section** (collapsed by default):
- Phase steppers (deduplicated, as currently implemented)
- Only appears for users who want precise control

**Remove entirely:**
- High contrast toggle — enforce good contrast by default (see updated subtext color below)

**Visual style:**
- Bottom sheet (not full modal), max height 60% of screen
- Drag handle bar at top (small rounded rectangle, 40px wide, 4px tall, centered, muted color)
- **Draft-and-apply pattern**: The sheet maintains a draft copy of settings. Changes are applied when the sheet is dismissed (swipe down or tap outside), NOT on every individual change. This prevents the engine from restarting on every stepper tap.
- No "Apply" button and no "Close" button — dismissal applies. This is visually minimal but functionally equivalent to the current Apply flow.
- If the user opens settings during a running session, changing settings and dismissing the sheet will reset the session (same as current behavior, but only triggered once on dismiss).

---

## 5. EXERCISE CARD REDESIGN

### Current Card (too much)
```
┌─────────────────────────────┐
│ Staircase Breathing         │
│ Inhale in steps, exhale...  │
│ [2-2-2-6] [CALM] Segmented │
└─────────────────────────────┘
```

### New Card (just enough)
```
│ ▎ Staircase Breathing        │
│ ▎ Inhale in steps, exhale... │
│ ▎                    4 min   │
```

- No border, no box
- Subtle left accent bar (3px, accent color at 30%)
- Background: transparent or very subtle surface color
- Name: 18px, weight 500, primary text
- Tagline: 14px, weight 400, muted text
- Duration: right-aligned, 13px, muted, pill background
- No cadence badge, no intent pill, no descriptor
- Tapping the card navigates to pre-session

---

## 6. COLOR & TYPOGRAPHY REFINEMENT

### Updated Night Palette

```
background:    #080C12    (near OLED black — darker than current #0A0E14)
surface:       #111820    (cards, subtle elevation)
text:          #E2E8F0    (primary text — slightly warmer than pure white)
subtext:       #7A8A9A    (muted but accessible — ~5.5:1 contrast ratio on #080C12, meets WCAG AA)
accent:        #4A8EC2    (slightly desaturated blue — calmer than current #5B9BD5)
accentSoft:    #1A2E42    (accent at ~15% opacity — for selected states)
border:        #1A2230    (barely visible — borders should almost disappear)
```

### Mist Palette (light theme)

The mist palette is unchanged from the current implementation. The redesign focuses on the night (dark) theme as the default. The mist palette continues to work as-is for users who toggle it in settings. All new UI elements (intent cards, category screen, pre-session screen) must support both palettes — use `palette.background`, `palette.surface`, etc. from the existing `getPalette()` function. Do not hardcode night-theme hex values in components.

### Typography

Use the system font (San Francisco on iOS, Roboto on Android) but with deliberate weight choices:
- **Hero/App name**: 28px, weight 300, letter-spacing 0.5
- **Screen headings**: 24px, weight 300
- **Card titles**: 18px, weight 500
- **Body/taglines**: 15px, weight 400, line-height 22
- **Captions/timer**: 13px, weight 400, muted color
- **Buttons**: 16px, weight 600
- **Phase labels**: 16px, weight 400 (NOT bold — the visualization communicates the phase, not the text)

---

## 7. ANIMATION REFINEMENTS

### Breathing Visualization Easing

Replace the current `Easing.inOut(Easing.cubic)` with phase-specific easing:

- **Inhale**: `Easing.bezier(0.4, 0.0, 0.2, 1)` — gentle start, smooth acceleration, soft landing
- **Exhale**: `Easing.bezier(0.0, 0.0, 0.2, 1)` — immediate release, gradual deceleration (feels like "letting go")
- **Hold**: Don't freeze the visualization. Apply a subtle 0.3% scale oscillation with a 3-second sine cycle (`withRepeat(withTiming(...), -1, true)`). This "living stillness" prevents the app from looking broken.

### Screen Transitions

- **Home → Category**: Standard push navigation with fade (not slide)
- **Category → Pre-Session**: Standard push with fade
- **Pre-Session → In-Session** (after countdown): Crossfade, 600ms
- **In-Session → Completed**: Crossfade, 800ms (slower = more gentle)
- **Any screen → Back**: Fade, 300ms

Set this in `_layout.tsx`: `animation: 'fade'` (already set, but verify all new routes use it).

### Phase Label Transitions

Currently the phase label changes instantly. Instead:
- Fade out current label (200ms)
- Fade in new label (200ms, starting immediately after fade-out)
- Total crossfade: 400ms
- Start the crossfade 400ms BEFORE the animation phase changes. Implementation: in the render, check `snapshot.phaseRemainingMs < 450`. When true, begin fading out the current label and pre-render the next phase's label. Use `snapshot.phaseIndex` to look up the next phase in the pattern's phases array (wrapping to 0 at end).
- For rapid phases (< 1.5s), skip the crossfade — instant label change is fine at that speed.

---

## 8. ACCESSIBILITY REQUIREMENTS

These are not optional polish — they are required for the redesign:

1. **Screen reader support**: When `AccessibilityInfo.isScreenReaderEnabled` is true, never auto-hide the in-session control overlay. Keep pause/close buttons always accessible in the accessibility tree.
2. **Accessibility roles**: Intent cards → `accessibilityRole="button"` with label including subtitle (e.g., "Wind Down. Slow your breath, quiet your mind."). Duration chips → `accessibilityRole="radio"` with selected state. Begin → `accessibilityLabel="Begin breathing session"`.
3. **Phase announcements**: The phase label during a session should have `accessibilityLiveRegion="polite"` (Android) and `accessibilityRole="text"` so phase changes are announced to screen readers.
4. **Contrast**: Subtext color `#7A8A9A` on `#080C12` achieves ~5.5:1 ratio (WCAG AA). Primary text `#E2E8F0` on `#080C12` achieves ~13:1 (WCAG AAA). All text meets AA minimum.
5. **Reduce transparency**: When the system "reduce transparency" setting is active, skip the auto-dimming feature entirely.
6. **Touch targets**: All interactive elements must be at least 44x44px. The "✕" close, back arrow, duration chips, and intent cards all meet this.

---

## 9. NEW ROUTE STRUCTURE

```
app/
  _layout.tsx           (Stack with fade transitions)
  index.tsx             (Home — intent cards)
  category/
    [categoryId].tsx    (Pattern selection for a category) [NEW]
  session/
    [patternId].tsx     (Pre-session + In-session + Completed)
```

The session screen manages its own internal state machine:

```
pre-session ──[Begin tap]──→ countdown ──[auto after 3s]──→ running
                                │                              │
                          [tap to cancel]                [tap pause]
                                │                              │
                                ↓                              ↓
                          pre-session                       paused
                                                             │   │
                                                      [Resume] [End]
                                                         │       │
                                                         ↓       ↓
                                                      running   home
                                                         │
                                                  [session timer]
                                                         │
                                                         ↓
                                                     completed
                                                       │    │
                                                   [Done] [Repeat]
                                                     │       │
                                                     ↓       ↓
                                                   home   countdown
```

Key rules:
- "End" from paused goes directly to home (no completion screen — user chose to quit)
- "Repeat" from completed goes to countdown (not pre-session — preserve settings)
- The engine stays in `idle` during `pre-session` and `countdown`. `controls.start()` is called only when transitioning to `running`.
- Hardware back / iOS swipe-back triggers `Alert.alert` guard during `running` and `paused`. During `pre-session`, `countdown`, and `completed`, back navigation is unguarded.

This keeps it as one route with internal state, avoiding navigation complexity.

---

## 10. IMPLEMENTATION PRIORITIES

1. **Color & typography** — Update theme.ts with new palette, apply new font sizes/weights globally
2. **Home screen** — Intent cards, quick reset card, remove search, move disclaimer to info sheet
3. **Category screen** — New route, simplified pattern cards
4. **Pre-session screen** — Refactor session screen to start in pre-session state, add duration selector, countdown
5. **In-session simplification** — Remove header chrome, add tap-to-reveal overlay, add auto-dim
6. **Settings modal** — Convert to bottom sheet, progressive disclosure, remove low-value options
7. **Completion state** — Redesign with centered card layout
8. **Phase label animation** — Crossfade with pre-transition timing
9. **Visualization easing** — Phase-specific curves, hold oscillation
10. **Carousel cleanup** — Remove indicators and instructional text

---

## 11. WHAT NOT TO CHANGE

- The 20 breathing patterns and their phase data
- The breath engine (useBreathEngine)
- The audio system (useBreathAudio)
- The 6 visualization components internally (only their container/context changes)
- The safety modal logic (just move when it appears from session to pre-session)
- AsyncStorage persistence (viz preferences, safety acknowledgments)
- The VisualizationProps interface

---

## 12. WHAT SUCCESS LOOKS LIKE

A user opens the app and sees 5 calm, spacious intent cards and one quick-reset option. They tap "Wind Down" and see 5 patterns with just a name, tagline, and duration. They tap "4-7-8" and see a clean pre-session screen with a big "Begin" button. They tap Begin, see "3... 2... 1... Breathe", and then the visualization fills the screen with nothing else competing for attention. When they're done, a gentle completion card fades in. The entire experience feels like the app is breathing WITH them, not AT them.

The app should feel like: Calm meets Oak. Premium, minimal, quiet, warm-dark. It should NOT feel like: a dashboard, a fitness tracker, a configuration tool, or a medical device.
