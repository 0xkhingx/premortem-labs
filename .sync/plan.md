# PreMortem Labs — Build Plan

A premium AI-native biomedical research workspace. Dark, calm, technical. Linear/Cursor/Raycast/Notion-dark fusion with sage green (#3D6B52) accents.

## Scope

Single-page desktop-first workspace at `/` showing one realistic STZ/nicotinamide diabetes-induction protocol on Wistar rats. No backend, no auth — pure UI/UX showcase with realistic mock data and motion.

## Design System (`src/styles.css`)

- **Background stack** (oklch, warm-charcoal, not blue-black):
  - `--background`: ~oklch(0.16 0.005 60) — deep warm charcoal
  - `--surface-1` (sidebar/panels): ~oklch(0.19 0.005 60)
  - `--surface-2` (cards): ~oklch(0.22 0.006 60) with subtle top-light gradient
  - `--surface-3` (editor): ~oklch(0.18 0.004 60)
- **Foreground**: oklch(0.96 0.005 80) primary; oklch(0.68 0.008 70) muted; oklch(0.5 …) subtle
- **Accent (sage)**: `--primary` oklch(~0.55 0.07 150) ≈ #3D6B52, plus `--primary-glow` and `--gradient-sage`
- **Severity**: low (sage), medium (amber ~oklch 0.78 0.14 75), high (orange ~oklch 0.7 0.18 45), critical (rose ~oklch 0.65 0.2 25)
- **Borders**: hairline `oklch(1 0 0 / 0.06)`; focus ring sage at 30%
- **Radius**: base 18px (`--radius: 1.125rem`) → cards 16–20px
- **Shadows**: `--shadow-soft`, `--shadow-glow-sage` (sage at 18% blur 40px)
- **Typography**: load Plus Jakarta Sans + JetBrains Mono via Google Fonts in `__root.tsx` `head()`. Body 500/700 only. Mono for editor + chips.

## Layout (`src/routes/index.tsx` + components)

```text
┌──┬───────────────────────────────────────┬──────────────────┐
│  │  Top bar (protocol chip · title · …)  │                  │
│64│───────────────────────────────────────│  Intelligence    │
│px│                                       │  panel (380px)   │
│  │  Protocol editor (mono, line nums)    │  · Risk metrics  │
│  │                                       │  · Pre-flight    │
│  │                                       │  · Reasoning     │
│  │                                       │  · Citations     │
│  │              [Floating AI Copilot ⌄] │                  │
└──┴───────────────────────────────────────┴──────────────────┘
```

## Components (under `src/components/premortem/`)

1. **`AppSidebar.tsx`** — 64px rail. Icons (lucide): `FlaskConical` Protocols, `ListChecks` Validation Queue, `ShieldAlert` Risk Library, `BookOpen` Literature, `Ruler` Lab Standards. Bottom: `Settings`, avatar chip "AO" (Adaola O.). Tooltip on hover, soft sage hover bg, 1.05 icon scale.

2. **`WorkspaceTopBar.tsx`** — Protocol ID chip `PRT-2025-0142`, title "STZ/Nicotinamide Diabetes Induction — Wistar Rats", status pill "Draft", `cmd+k` search field, primary "Validate" button (sage gradient + subtle glow, `Sparkles` icon).

3. **`ProtocolEditor.tsx`** — IDE-style. Left gutter line numbers (mono, muted). Section headings as `## 1. Animal Model` styled. Inline risk highlights via wavy underline spans with hover popovers (`HoverCard`) explaining issue + suggestion. Realistic content covering: animal model & ethics (ARRIVE refs), housing/acclimation, fasting (12h overnight), STZ prep (citrate buffer pH 4.5, freshly dissolved, ice), nicotinamide pretreatment (110 mg/kg i.p., 15 min prior), STZ dose (55 mg/kg i.p.), confirmation (FBG ≥ 250 mg/dL at 72h via tail-vein glucometer), exclusion criteria, supplier (Sigma S0130 lot variability note). Severity minimap on right edge of editor (thin column with colored ticks at line offsets). Smooth scroll, faint editor glow.

4. **`IntelligencePanel.tsx`** — Right column, 380px, scrollable.
   - **`RiskMetricsCard`**: big "MEDIUM" pill, score 62/100, animated radial progress (framer-motion), three sub-bars (Methodology, Reproducibility, Ethics).
   - **`PreflightChecks`**: checklist with mixed states (pass/warn/fail) — ARRIVE 2.0 compliance ✓, STZ freshness handling ⚠ (>15 min on ice), dose calc 55 mg/kg ✓, fasting consistency ⚠ (duration variance), supplier lot variability ⚠.
   - **`ReasoningTimeline`**: vertical timeline with pulsing sage dot at active step. Items: "Parsing protocol structure…", "Checking fasting protocol…", "Analyzing STZ stability window…", "Comparing dosage thresholds (PubMed n=143)…", "Reviewing induction consistency…", "Cross-referencing ARRIVE 2.0…". Staggered fade-in, last one shows shimmer.
   - **`CitationsList`**: 3 expandable cards — Furman 2015 (Curr Protoc Pharmacol), Ghasemi 2014 (Acta Physiol Hung), Deeds 2011 (Lab Anim). Author · journal · year · DOI, expand for abstract snippet + relevance score.

5. **`FloatingCopilot.tsx`** — Anchored bottom-right of editor area, ~420×520, glass surface (backdrop-blur, low-opacity sage tint border, soft shadow). Header "Copilot · analyzing". Streaming-style messages (mock): user prompt + assistant suggestions with inline action chips ("Apply suggestion", "Insert citation"). Input with `Send` icon. Collapsible to a pill. Subtle entrance: slide+fade from 12px below.

6. **`Chips.tsx`** — Reusable: `MetadataChip`, `ReagentBadge` (with dot), `DosageTag` (mono), `AnimalModelIndicator`.

## Motion (framer-motion)

- Page mount: sidebar slide-in-left, top bar fade-down, editor fade-up (40ms stagger), intelligence panel slide-in-right.
- Reasoning timeline items: stagger 120ms, opacity+y.
- Risk score: animated count-up + radial sweep.
- Hover lift on cards: `y: -2`, soft shadow grow.
- Copilot: respects `prefers-reduced-motion`.

## Files to add

- `src/routes/index.tsx` — replace placeholder, compose layout.
- `src/routes/__root.tsx` — add Plus Jakarta Sans + JetBrains Mono `<link>` in `head()`, update title/description to PreMortem Labs.
- `src/styles.css` — replace token block with PreMortem palette + font-family + sage gradient/shadow tokens.
- `src/components/premortem/AppSidebar.tsx`
- `src/components/premortem/WorkspaceTopBar.tsx`
- `src/components/premortem/ProtocolEditor.tsx`
- `src/components/premortem/IntelligencePanel.tsx`
- `src/components/premortem/RiskMetricsCard.tsx`
- `src/components/premortem/PreflightChecks.tsx`
- `src/components/premortem/ReasoningTimeline.tsx`
- `src/components/premortem/CitationsList.tsx`
- `src/components/premortem/FloatingCopilot.tsx`
- `src/components/premortem/Chips.tsx`
- `src/lib/protocol-data.ts` — protocol text + risk annotations + checks + citations + reasoning steps.

## Dependencies

- Add `framer-motion` (not currently installed).
- Reuse existing shadcn `Button`, `Badge`, `HoverCard`, `Progress`, `Tooltip`, `ScrollArea`, `Card`, `Input`.

## Out of scope (this turn)

Multi-page routing (Validation Queue, Risk Library, etc. remain icon-only nav), real AI calls, persistence, auth, mobile layout (desktop ≥ 1280px target; graceful min-width 1024px).

## Acceptance

- Dark warm-charcoal background, no pure black, no blue startup tint.
- Sage `#3D6B52` only on validation/AI/progress affordances — never as page background.
- Plus Jakarta Sans loaded; only 500/700 weights used in components.
- Editor reads as a real biomedical protocol with at least 3 inline risk annotations.
- Intelligence panel has working animated risk score, staggered reasoning feed, expandable citations.
- Floating copilot has glass depth, collapsible, mock streaming reply.
