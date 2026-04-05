# BreathFlow Design Rules

> 50 research-backed rules to elevate BreathFlow from "AI-built" to expert-level.
> Every rule includes a source. Rules are ordered by impact.

---

## Part 1: Kill the AI Look (Anti-Patterns Found in BreathFlow)

### Rule 1: Extract all inline styles into StyleSheet objects
**Current problem:** Every component defines styles inline — the #1 tell of AI-generated React Native code.
**Fix:** Create `StyleSheet.create()` blocks per component. Group shared patterns (card, pill button, section) into a shared `styles/` module.
- Source: [AI-Generated UI Anti-Patterns (BSWEN)](https://docs.bswen.com/blog/2026-03-20-ai-generated-ui-anti-patterns/)

### Rule 2: Eliminate hardcoded colors outside the palette
**Current problem:** Components use conditional hardcoded hex values like `'#07111F'`, `'#243448'`, `'#132033'` instead of palette tokens.
**Fix:** Add missing semantic tokens to `theme.ts`: `palette.buttonText`, `palette.buttonTextInverse`, `palette.visualizationLabel`. Zero raw hex values in components.
- Source: [Refactoring UI — Key Principles (Medium)](https://medium.com/design-bootcamp/top-20-key-points-from-refactoring-ui-by-adam-wathan-steve-schoger-d81042ac9802)

### Rule 3: Remove magic spacing numbers — use only token values
**Current problem:** `paddingHorizontal: 10`, `gap: 6`, `marginTop: 6` exist outside the spacing scale (4, 8, 16, 24, 32, 48).
**Fix:** Every spacing value must come from the token scale. If you need `6`, round to `spacing.xs (4)` or `spacing.sm (8)`. No exceptions.
- Source: [Atlassian Spacing Foundations](https://atlassian.design/foundations/spacing/)

### Rule 4: Stop wrapping every screen in an identical gradient
**Current problem:** Every screen uses `<LinearGradient colors={[palette.background, palette.backgroundAlt]}>` — a template pattern.
**Fix:** Vary backgrounds by context. Home screen: subtle gradient. Session screen: deeper, immersive gradient with a third color stop. Settings modal: solid surface color. Variety signals intentionality.
- Source: [AI-Generated UI Anti-Patterns (BSWEN)](https://docs.bswen.com/blog/2026-03-20-ai-generated-ui-anti-patterns/)

### Rule 5: Unify animation easing curves across all visualizations
**Current problem:** Orb uses `Easing.inOut(Easing.cubic)`, Rings uses `Easing.inOut(Easing.quad)` — different for no intentional reason.
**Fix:** Define a single `BREATH_EASING` constant. All breathing visualizations use the same curve. Document why that curve was chosen.
- Source: [Web Animation Best Practices (GitHub/uxderrick)](https://gist.github.com/uxderrick/07b81ca63932865ef1a7dc94fbe07838)

### Rule 6: Document all animation magic numbers
**Current problem:** Scale values like `0.72`, `1.06`, `1.21`, `1.34` appear without explanation.
**Fix:** Define named constants: `BREATH_SCALE_MIN = 0.72`, `BREATH_SCALE_MAX = 1.06`. Add a comment block explaining the rationale (e.g., "72% contraction feels natural without disappearing").
- Source: [Web Animation Best Practices (GitHub/uxderrick)](https://gist.github.com/uxderrick/07b81ca63932865ef1a7dc94fbe07838)

---

## Part 2: Animation & Motion (Make It Feel Alive)

### Rule 7: Keep micro-interactions under 300ms
Button press: 80-100ms. Modal entrance: 250-300ms. Page transitions: 300ms max. The breathing animations are long by design — everything else should be snappy.
- Source: [Web Animation Best Practices (GitHub/uxderrick)](https://gist.github.com/uxderrick/07b81ca63932865ef1a7dc94fbe07838)

### Rule 8: Use three distinct easing curves for three purposes
```
BREATH_EASING = Easing.inOut(Easing.cubic)     // Breathing visualizations (meditative)
ENTER_EASING  = Easing.out(Easing.cubic)        // Elements appearing (decelerating in)
EXIT_EASING   = Easing.in(Easing.cubic)         // Elements leaving (accelerating out)
```
- Source: [CSS/JS Animation Trends 2026 (WebPeak)](https://webpeak.org/blog/css-js-animation-trends/)

### Rule 9: Only animate `transform` and `opacity`
These are GPU-accelerated. Never animate `width`, `height`, `padding`, or layout properties — they trigger expensive repaints. BreathFlow currently does this correctly; keep it that way.
- Source: [Web Animation Best Practices (GitHub/uxderrick)](https://gist.github.com/uxderrick/07b81ca63932865ef1a7dc94fbe07838)

### Rule 10: Add press feedback to every touchable element
Scale to `0.96` on press (Reanimated `withTiming`, 80ms). Currently ExerciseCard and buttons have no press animation — they feel dead.
- Source: [Web Animation Best Practices (GitHub/uxderrick)](https://gist.github.com/uxderrick/07b81ca63932865ef1a7dc94fbe07838)

### Rule 11: Stagger list item entrances at 50ms intervals
When the home screen loads, cards should fade in sequentially (50ms delay between each), not all appear at once. Use `withDelay(index * 50, withTiming(...))`.
- Source: [UI/UX Evolution 2026: Micro-Interactions (Primotech)](https://primotech.com/ui-ux-evolution-2026-why-micro-interactions-and-motion-matter-more-than-ever/)

### Rule 12: Animate from contextually relevant origins
The settings modal slides from bottom (good). Card navigation should expand from the card's position. Visualizations should scale from center. Every animation needs a spatial origin that makes physical sense.
- Source: [Web Animation Best Practices (GitHub/uxderrick)](https://gist.github.com/uxderrick/07b81ca63932865ef1a7dc94fbe07838)

### Rule 13: Match breathing animation speed to actual breath rate
Animation duration should equal the phase duration exactly (currently implemented). But add a 200ms overlap between phases so transitions feel continuous rather than stepped.
- Source: [Meditation App Design (Purrweb)](https://www.purrweb.com/blog/designing-a-meditation-app-tips-step-by-step-guide/)

### Rule 14: Always respect `prefers-reduced-motion`
Provide reduced-motion alternatives for every animation. Not optional — it's both accessibility and craft. BreathFlow has a contrast toggle; add a reduce-motion toggle too.
- Source: [Web Animation Best Practices (GitHub/uxderrick)](https://gist.github.com/uxderrick/07b81ca63932865ef1a7dc94fbe07838)

---

## Part 3: Visual Hierarchy & Layout

### Rule 15: Design in grayscale first, add color last
Before changing any colors, verify hierarchy works without them. If you squint at a screen and can't tell what's most important, the layout has failed before color even enters the picture.
- Source: [7 Rules for Creating Gorgeous UI (learnui.design)](https://www.learnui.design/blog/7-rules-for-creating-gorgeous-ui-part-1.html)

### Rule 16: Double your whitespace
BreathFlow is a breathing app — the UI itself should breathe. Increase padding between cards from `spacing.sm (8)` to `spacing.md (16)`. Increase section gaps. Let emptiness be a design feature.
- Source: [7 Rules for Creating Gorgeous UI (learnui.design)](https://www.learnui.design/blog/7-rules-for-creating-gorgeous-ui-part-1.html)

### Rule 17: Remove decorative elements that don't convey information
Every border, shadow, and background color must earn its place. If removing a card border doesn't reduce clarity, remove it. The current `borderWidth: 1` on every card adds visual noise on dark themes.
- Source: [16 UI Design Tips (Adham Dannaway)](https://www.adhamdannaway.com/blog/ui-design/ui-design-tips)

### Rule 18: Use layered, hue-matched shadows instead of borders
Replace card borders with subtle shadows that match the background hue. On dark themes, use inner glow (`rgba(255,255,255,0.03)` top border) instead of full border outlines.
```
shadowColor: palette.accent,
shadowOffset: { width: 0, height: 2 },
shadowOpacity: 0.08,
shadowRadius: 12,
```
- Source: [Designing Beautiful Shadows (Josh W. Comeau)](https://www.joshwcomeau.com/css/designing-shadows/)

### Rule 19: Limit elevation to 4 levels
Define exactly: flat (background), raised (cards), floating (dropdowns/modals), overlay (popovers). Map each to a consistent shadow token.
- Source: [Elevation Design Patterns (designsystems.surf)](https://designsystems.surf/articles/depth-with-purpose-how-elevation-adds-realism-and-hierarchy)

### Rule 20: Apply the squint test to every screen
Blur your eyes. The most important element (the breathing visualization during a session, the pattern list on home) should still be the most visible thing. If the back button or a label competes, reduce its weight.
- Source: [16 UI Design Tips (Adham Dannaway)](https://www.adhamdannaway.com/blog/ui-design/ui-design-tips)

---

## Part 4: Typography

### Rule 21: Constrain to 4-5 type sizes maximum
Current scale appears to be: 13, 14, 15, 18, 22, 34. That's 6 sizes. Consolidate to:
```
LABEL   = 13px
BODY    = 16px
TITLE   = 20px
HEADING = 28px
DISPLAY = 36px
```
- Source: [Modular Scale (Imperavi)](https://imperavi.com/books/ui-typography/principles/modular-scale/)

### Rule 22: Use only two font weights: 400 and 600
Current code uses `'700'` and `'600'`. Pick one bold weight (600 is more refined than 700 for UI) and pair with regular 400. More weights = more noise.
- Source: [16 UI Design Tips (Adham Dannaway)](https://www.adhamdannaway.com/blog/ui-design/ui-design-tips)

### Rule 23: Set line-height to 1.5x for body text, 1.15x for headings
Body text at 16px → line-height 24px. Headings are large enough that tight leading (1.1-1.2) feels intentional and refined.
- Source: [16 UI Design Tips (Adham Dannaway)](https://www.adhamdannaway.com/blog/ui-design/ui-design-tips)

### Rule 24: Left-align all body text
Center alignment only for short headings or single-line labels. The phase label and timer text can be centered (they're short). Everything else: left-aligned.
- Source: [16 UI Design Tips (Adham Dannaway)](https://www.adhamdannaway.com/blog/ui-design/ui-design-tips)

### Rule 25: Create hierarchy through weight and color, not just size
Instead of making secondary text smaller, try making it `palette.subtext` color at the same size. Three levers: size, weight, and color. Use at least two simultaneously.
- Source: [Refactoring UI (Medium)](https://medium.com/design-bootcamp/top-20-key-points-from-refactoring-ui-by-adam-wathan-steve-schoger-d81042ac9802)

### Rule 26: Choose a custom typeface with a tall x-height
System fonts (SF Pro, Roboto) are fine but generic. Consider loading a single intentional font. For a breathing/wellness app:
- **Nunito** — rounded, warm, tall x-height
- **DM Sans** — geometric, modern calm
- **Plus Jakarta Sans** — refined, contemporary
One font, two weights. That's it.
- Source: [16 UI Design Tips (Adham Dannaway)](https://www.adhamdannaway.com/blog/ui-design/ui-design-tips)

---

## Part 5: Color

### Rule 27: Follow the 60-30-10 distribution
- 60% — `palette.background` (dominant)
- 30% — `palette.surface` (cards, secondary areas)
- 10% — `palette.accent` (interactive elements only)

The accent blue should appear ONLY on things you can tap or active states. Not on decorative text.
- Source: [60-30-10 Rule (Hype4 Academy)](https://hype4.academy/articles/design/60-30-10-rule-in-ui)

### Rule 28: Never use pure black (#000000)
BreathFlow's night theme uses `#0a0e14` (good — it's a dark blue-black, not pure black). Keep this. The `overlay: 'rgba(0,0,0,0.6)'` should shift to `rgba(10,14,20,0.7)` to match.
- Source: [Refactoring UI (Medium)](https://medium.com/design-bootcamp/top-20-key-points-from-refactoring-ui-by-adam-wathan-steve-schoger-d81042ac9802)

### Rule 29: Reserve accent color for interactive elements only
`palette.accent` should appear on: buttons, links, toggles, active states. NOT on static labels, visualization overlays, or decorative elements. Color teaches users what is tappable.
- Source: [16 UI Design Tips (Adham Dannaway)](https://www.adhamdannaway.com/blog/ui-design/ui-design-tips)

### Rule 30: Maintain WCAG contrast ratios
Body text: 4.5:1 minimum contrast. Large text (20px+): 3:1 minimum. Test both themes. The mist theme's `subtext: '#4a5f7a'` on `background: '#e8eef4'` needs verification.
- Source: [16 UI Design Tips (Adham Dannaway)](https://www.adhamdannaway.com/blog/ui-design/ui-design-tips)

### Rule 31: Don't rely on color alone as an indicator
Add secondary visual cues: icons for states, underlines for links, shapes for categories. ~8% of men have color blindness. The breathing phase label should pair color with an icon or shape change.
- Source: [16 UI Design Tips (Adham Dannaway)](https://www.adhamdannaway.com/blog/ui-design/ui-design-tips)

---

## Part 6: Spacing & Layout System

### Rule 32: Build everything on the 8px grid
All padding, margin, and gap: multiples of 8 (with 4 for fine detail). Current scale is correct (4, 8, 16, 24, 32, 48). The problem is enforcement — audit every component for off-grid values.
- Source: [Atlassian Spacing Foundations](https://atlassian.design/foundations/spacing/)

### Rule 33: Nested border-radius formula: inner = outer - padding
Card has `borderRadius: 16` and `padding: 24`? Inner elements get `borderRadius: max(0, 16 - 24) = 0` (no rounding). Card with `borderRadius: 16` and `padding: 8`? Inner elements get `borderRadius: 8`. This creates smooth concentric curves.
- Source: [Consistent Corner Radius Systems (Medium)](https://medium.com/design-bootcamp/building-a-consistent-corner-radius-system-in-ui-1f86eed56dd3)

### Rule 34: Use consistent gap patterns
Define three gap sizes: tight (8px, within a group), standard (16px, between items), loose (24-32px, between sections). Don't mix gap sizes arbitrarily.
- Source: [Atlassian Spacing Foundations](https://atlassian.design/foundations/spacing/)

---

## Part 7: Wellness App Specifics

### Rule 35: Use muted, nature-rooted palettes
Blues and greens for calm. Soft purples for balance. The current sky-blue accent (`#5b9bd5`) is solid. Avoid saturated neon — it increases arousal, the opposite of a breathing app's goal.
- Source: [Meditation App Design (Purrweb)](https://www.purrweb.com/blog/designing-a-meditation-app-tips-step-by-step-guide/)

### Rule 36: Eliminate sharp edges everywhere
All corners generously rounded. Use circles and organic shapes. BreathFlow's `radii.lg (16)` is good. Consider increasing card radius to 20-24 for a softer feel.
- Source: [Meditation App Design (Purrweb)](https://www.purrweb.com/blog/designing-a-meditation-app-tips-step-by-step-guide/)

### Rule 37: Use whitespace as a calming feature
In a wellness app, padding is expressive — it literally adds air to the screen. Dense layouts contradict the purpose. Every element should feel like it has room to breathe. Double the current spacing between cards and sections.
- Source: [Meditation App Design (Purrweb)](https://www.purrweb.com/blog/designing-a-meditation-app-tips-step-by-step-guide/)

### Rule 38: No aggressive pop-ups or disruptive animations
The interface should guide, not demand. Smooth, slow animations for UI transitions. Nothing should startle. The settings modal slide-up is fine — add a fade-in overlay to soften it.
- Source: [Meditation App Design (Purrweb)](https://www.purrweb.com/blog/designing-a-meditation-app-tips-step-by-step-guide/)

### Rule 39: Pulsing animations should match target breath rate
Breathing visualization speed = actual phase duration. Currently implemented correctly. Ensure visual rhythm feels naturally periodic (4-7 second cycles for most patterns).
- Source: [Meditation App Design (Purrweb)](https://www.purrweb.com/blog/designing-a-meditation-app-tips-step-by-step-guide/)

### Rule 40: Gamify progress without creating anxiety
Streak counters and progress indicators increase retention. But frame positively: "5 sessions this week" not "Don't break your streak!" No loss-aversion language.
- Source: [Meditation App Design (Purrweb)](https://www.purrweb.com/blog/designing-a-meditation-app-tips-step-by-step-guide/)

---

## Part 8: Consistency & Professional Polish

### Rule 41: Same elements must look identical everywhere
If a button is pill-shaped on the session screen, it's pill-shaped everywhere. If icons are outlined, all icons are outlined. If cards have 16px radius, every card has 16px radius. No exceptions.
- Source: [16 UI Design Tips (Adham Dannaway)](https://www.adhamdannaway.com/blog/ui-design/ui-design-tips)

### Rule 42: Distinguish primary vs secondary actions by visual weight
Primary: filled background, high contrast. Secondary: outlined or ghost, lower weight. Tertiary: text-only. Never give two buttons equal visual weight side by side. BreathFlow's current button hierarchy is correct — maintain it.
- Source: [Refactoring UI (Medium)](https://medium.com/design-bootcamp/top-20-key-points-from-refactoring-ui-by-adam-wathan-steve-schoger-d81042ac9802)

### Rule 43: One typeface, two weights, entire app
BreathFlow uses system fonts with two weights (600, 700). Consolidate to one custom font, two weights (400, 600). More refined than system defaults, less chaotic than multiple fonts.
- Source: [16 UI Design Tips (Adham Dannaway)](https://www.adhamdannaway.com/blog/ui-design/ui-design-tips)

### Rule 44: Don't overuse the brand accent
One of the most common amateur mistakes. `palette.accent` should cover <10% of screen area. Most of the interface should be neutral backgrounds and text colors.
- Source: [How to Improve UI Design Skills (Untitled UI)](https://www.untitledui.com/blog/ui-design-skills)

### Rule 45: Test with real content, not ideal strings
"Box Breathing" fits neatly. But what about "4-7-8 Relaxing Breath with Extended Exhale"? Long pattern names, long taglines, and edge-case data should be tested. If it breaks with real content, it's not done.
- Source: [How to Improve UI Design Skills (Untitled UI)](https://www.untitledui.com/blog/ui-design-skills)

---

## Part 9: Design System Architecture

### Rule 46: Define design tokens as the single source of truth
`theme.ts` should contain ALL visual decisions: colors, spacing, radii, typography sizes, animation durations, easing curves. No visual value should exist outside this file.
```typescript
export const motion = {
  breath: Easing.inOut(Easing.cubic),
  enter: Easing.out(Easing.cubic),
  exit: Easing.in(Easing.cubic),
  pressDuration: 80,
  transitionDuration: 250,
  staggerDelay: 50,
};
```
- Source: [Design Systems & Tokens (design.dev)](https://design.dev/guides/design-systems/)

### Rule 47: Create a shared StyleSheet for common patterns
```typescript
// styles/common.ts
export const cardStyle = StyleSheet.create({
  container: {
    borderRadius: radii.lg,
    padding: spacing.lg,
    backgroundColor: palette.surface,
    // shadow tokens, not border
  }
});
```
Components import and extend, not redefine.
- Source: [Design Systems & Tokens (design.dev)](https://design.dev/guides/design-systems/)

### Rule 48: Use semantic token names, not value-based names
`palette.accent` (good) not `palette.blue`. `spacing.md` (good) not `spacing.16`. `radii.lg` (good) not `radii.16`. Semantic names survive theme changes.
- Source: [Design Systems & Tokens (design.dev)](https://design.dev/guides/design-systems/)

---

## Part 10: Apple HIG & Material Design Alignment

### Rule 49: Follow Apple's four pillars for iOS
- **Clarity:** Interface understood at a glance
- **Deference:** UI serves the breathing content, not itself
- **Depth:** Visual layers communicate hierarchy
- **Consistency:** Familiar patterns reduce cognitive load
BreathFlow's minimal approach aligns well — don't add complexity that fights these pillars.
- Source: [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)

### Rule 50: Test on device, not just simulator
Screen density, touch targets (minimum 44pt), color rendering, and animation performance all differ on real hardware. The breathing animation must feel smooth at 60fps on a real device or the entire experience fails.
- Source: [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)

---

## Priority Implementation Order

### Immediate (highest impact, lowest effort)
1. Rule 2 — Move hardcoded colors into palette tokens
2. Rule 3 — Replace magic spacing numbers with tokens
3. Rule 5 — Unify easing curves
4. Rule 10 — Add press feedback to all touchables
5. Rule 17 — Remove unnecessary borders on dark theme

### Short term (high impact)
6. Rule 1 — Extract inline styles to StyleSheets
7. Rule 11 — Stagger card entrance animations
8. Rule 16 — Increase whitespace between elements
9. Rule 18 — Replace borders with subtle shadows
10. Rule 26 — Load a custom typeface

### Medium term (polish)
11. Rule 46 — Centralize all tokens (including motion)
12. Rule 4 — Vary gradient backgrounds per screen
13. Rule 33 — Fix nested border-radius math
14. Rule 6 — Document animation constants
15. Rule 40 — Add gentle progress tracking

---

## Sources Index

| # | Source | URL |
|---|--------|-----|
| 1 | AI-Generated UI Anti-Patterns (BSWEN) | https://docs.bswen.com/blog/2026-03-20-ai-generated-ui-anti-patterns/ |
| 2 | Web Animation Best Practices (uxderrick) | https://gist.github.com/uxderrick/07b81ca63932865ef1a7dc94fbe07838 |
| 3 | CSS/JS Animation Trends 2026 (WebPeak) | https://webpeak.org/blog/css-js-animation-trends/ |
| 4 | Framer Motion Guide (inhaq) | https://inhaq.com/blog/framer-motion-complete-guide-react-nextjs-developers.html |
| 5 | 7 Rules for Gorgeous UI (learnui.design) | https://www.learnui.design/blog/7-rules-for-creating-gorgeous-ui-part-1.html |
| 6 | Refactoring UI Key Points (Medium) | https://medium.com/design-bootcamp/top-20-key-points-from-refactoring-ui-by-adam-wathan-steve-schoger-d81042ac9802 |
| 7 | 16 UI Design Tips (Adham Dannaway) | https://www.adhamdannaway.com/blog/ui-design/ui-design-tips |
| 8 | Beautiful Shadows (Josh W. Comeau) | https://www.joshwcomeau.com/css/designing-shadows/ |
| 9 | 60-30-10 Color Rule (Hype4 Academy) | https://hype4.academy/articles/design/60-30-10-rule-in-ui |
| 10 | 60-30-10 Rule (UX Planet) | https://uxplanet.org/the-60-30-10-rule-a-foolproof-way-to-choose-colors-for-your-ui-design-d15625e56d25 |
| 11 | Modular Scale Typography (Imperavi) | https://imperavi.com/books/ui-typography/principles/modular-scale/ |
| 12 | Optical Alignment (Letterhanna Studio) | https://letterhanna.com/optical-alignment-baseline-grids-rhythmic-flow/ |
| 13 | Meditation App Design (Purrweb) | https://www.purrweb.com/blog/designing-a-meditation-app-tips-step-by-step-guide/ |
| 14 | Mental Health App Design (biz4group) | https://www.biz4group.com/blog/best-practices-in-mental-health-design |
| 15 | Apple Human Interface Guidelines | https://developer.apple.com/design/human-interface-guidelines/ |
| 16 | Material Design 3 Typography | https://m3.material.io/styles/typography/overview |
| 17 | Atlassian Spacing Foundations | https://atlassian.design/foundations/spacing/ |
| 18 | Design Systems & Tokens (design.dev) | https://design.dev/guides/design-systems/ |
| 19 | Corner Radius Systems (Medium) | https://medium.com/design-bootcamp/building-a-consistent-corner-radius-system-in-ui-1f86eed56dd3 |
| 20 | Elevation Patterns (designsystems.surf) | https://designsystems.surf/articles/depth-with-purpose-how-elevation-adds-realism-and-hierarchy |
| 21 | UI Design Skills (Untitled UI) | https://www.untitledui.com/blog/ui-design-skills |
| 22 | UI/UX Micro-Interactions 2026 (Primotech) | https://primotech.com/ui-ux-evolution-2026-why-micro-interactions-and-motion-matter-more-than-ever/ |
| 23 | Border-Radius Consistency (uidesign.tips) | https://www.uidesign.tips/ui-tips/border-radius-consistency |
