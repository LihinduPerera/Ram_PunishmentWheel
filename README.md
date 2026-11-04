# Party Roulette — Punishment Wheel

A neon, game-show style punishment wheel for friend groups. Pick a victim, spin the
wheel, and let the engine choose a dare. Every result is recorded, every skip is
respected, and the whole thing runs in the browser with no backend.

Built with **Next.js App Router**, **React**, **TypeScript**, **Tailwind CSS**,
**Motion**, and **Zustand**.

## Features

- **Animated SVG wheel** — the engine chooses the punishment first using secure
  randomness, then the wheel animates to that exact slice. The landing position
  always matches the result.
- **Six seed players** — Lihindu, Ravindu, Vibodha, Malindu, Pamudith, and Migara.
  Lihindu starts on the Easy profile; everyone else starts on Normal.
- **Eighteen seed punishments** — seven Easy, six Medium, and five Hard dares.
- **Difficulty profiles** — Easy favours gentle dares but still keeps a small
  chance of a Hard outcome. Normal is balanced. Hard leans into bigger
  performances. Random rolls a fresh profile on every spin.
- **All active punishments stay on the wheel** — tier weight is split evenly
  across the punishments inside that tier, so every active dare has a chance.
- **Full participant management** — add, edit, bench, reactivate, and delete
  players; tune each player's profile and avatar colour.
- **Full punishment management** — add, edit, delete, toggle on/off-wheel,
  search, and filter by difficulty or status.
- **History and statistics** — per-player leaderboard, tier breakdown, skip rate,
  total spins, and "most unlucky" stats, all derived from history.
- **Result flow** — Accept, Skip, Spin Again, or dismiss without resolving.
  Pending results survive a refresh.
- **Settings** — sound effects, ambient music, wheel animations, default
  difficulty, a profile weight matrix, and a full app reset.
- **Polished UX** — confetti, synthesized WebAudio sounds (no assets), reduced
  motion support, keyboard-friendly dialogs, toasts, empty states, and
  responsive layouts for desktop, tablet, and mobile.
- **Local-first** — players, punishments, history, and settings persist to
  `localStorage`. Corrupt or invalid stored data is sanitized on load.

## Getting Started

Requires Node.js 20.9 or newer (Next.js 16 requirement).

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm run start` | Serve the production build |
| `npm run typecheck` | Run TypeScript with `--noEmit` |
| `npm run lint` | Run ESLint |
| `npm test` | Run Vitest in watch mode |
| `npm run test:run` | Run the test suite once |

## How the wheel works

1. The engine resolves the player's profile (`easy`, `normal`, `hard`, or a
   random profile).
2. It builds a weighted pool from the active punishments. Each tier receives
   its configured weight, divided evenly among the dares in that tier. Missing
   tiers are dropped and the remaining weights renormalize.
3. `crypto.getRandomValues` (with a `Math.random` fallback) picks the punishment
   and a small landing jitter.
4. The wheel computes a clockwise target rotation and animates to the chosen
   slice. The pointer is guaranteed to sit inside that slice.
5. On reveal, a history entry is created with a snapshot of the player,
   punishment, difficulty, and timestamp. Accept marks it `accepted`; Skip marks
   it `skipped`.

Default profile weights:

| Profile | Easy | Medium | Hard |
| --- | ---: | ---: | ---: |
| Easy | 70% | 25% | 5% |
| Normal | 34% | 33% | 33% |
| Hard | 15% | 30% | 55% |

These can be edited from **Settings → Difficulty weight matrix**.

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Game screen with the wheel, crew picker, quick stats, and recent spins |
| `/participants` | Player management and per-player difficulty profiles |
| `/punishments` | Punishment CRUD, search, filters, and wheel counts |
| `/history` | Full spin history, filters, difficulty breakdown, and leaderboard |
| `/settings` | Atmosphere, default odds, weight matrix, and danger zone |

## Architecture

```text
src/
├─ app/                 # App Router pages, layout, global theme, icons
├─ components/
│  ├─ game/             # Game screen, quick stats, recent spins
│  ├─ history/          # History screen and rows
│  ├─ layout/           # Header, mobile nav, splash, providers
│  ├─ participants/     # Crew rail, avatars, player dialogs and screen
│  ├─ punishments/      # Punishment screen and form dialog
│  ├─ results/          # Result overlay, confetti, result copy
│  ├─ settings/         # Settings screen and weight matrix
│  ├─ ui/               # Buttons, fields, dialogs, cards, toasts, etc.
│  └─ wheel/            # SVG wheel, spin hook, controls
├─ constants/           # Seed data, difficulty metadata, timing constants
├─ lib/                 # Engine, wheel math, storage, stats, validation, audio
├─ store/               # Zustand store, slices, selectors, persistence
├─ tests/               # Vitest unit and integration tests
└─ types/               # Domain and store types
```

### Design decisions

- **Engine first, animation second.** The store chooses the punishment and hands
  the index to the wheel hook. The animation never decides the result.
- **Separate domain and transient state.** Only domain state is persisted.
  `isSpinning`, the pending outcome, and the result overlay reset on refresh.
- **History is the source of truth for statistics.** No duplicated counters, so
  deleting a player or punishment never rewrites past results.
- **Defensive storage adapter.** Every persisted field is sanitized; invalid
  entries are dropped and completely invalid lists fall back to seed data.
- **No audio assets.** Sound effects and ambient music are synthesized in the
  browser with the Web Audio API.
- **No extra UI libraries.** The component layer is custom, with Tailwind v4
  design tokens and native `<dialog>` elements for accessible modals.

## Testing

The suite covers the behaviours that matter most:

- Weighted pool construction, profile resolution, renormalization, zero weights,
  and empty pools
- Lihindu's Easy configuration and a 20,000-spin distribution check
- Wheel rotation math, winning-segment consistency, jitter bounds, and
  degenerate segment counts
- Participant and punishment CRUD, validation, selection, and mid-spin locking
- Spin flow, pending history, accept/skip/dismiss, spin-again tokens, and
  history caps
- Statistics, leaderboard ordering, difficulty breakdowns, and skip handling
- Storage sanitization, corrupt data recovery, persistence, and simulated
  refresh/rehydration

```bash
npm run test:run
```

## Notes

- The app is intentionally frontend-only. The store and storage adapter are
  structured so a backend could replace `localStorage` later.
- Keep dares playful and consensual. The UI includes safety reminders and a
  skip option on every result.
- Ambient music may wait for the first tap because browsers block autoplay.
- Play responsibly — no dangerous stunts, alcohol pressure, or cruelty.
