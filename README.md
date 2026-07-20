# ⛓️ Chains — Disc Golf App Prototype

A polished, fully clickable prototype of a disc golf scorekeeping app (a UDisc
competitor) with an Apple-style, iOS-feeling design. This is a **demo, not
production software**: there is no backend and no real auth — everything runs
in the browser with mock data and `localStorage` persistence.

## Run it

```bash
npm install
npm run dev
```

Then open http://localhost:5173 — ideally in a mobile viewport (390 px wide) via
your browser dev tools, though it works on desktop too.

Sign in with either button (login is simulated) and you land in the app with
15 historical rounds, favorites, a social feed and two tournaments already
seeded.

## GitHub Pages

Every push to the default branch builds and deploys the app to GitHub Pages
via `.github/workflows/deploy.yml` (no configuration needed — the workflow
enables Pages on first run). The site appears at:

```
https://<your-username>.github.io/disc-golf-app/
```

The build uses a relative asset base and hash-based routing, so it works from
any hosting path without server-side rewrites.

## What's inside

**Fully functional**

- Start-round flow: searchable course list + map view → add friends/guests → play
- One-hole-at-a-time scoring screen with huge +/− steppers, one-tap Par,
  swipe/arrow hole navigation, live collapsible leaderboard, running totals
- Round finish: final leaderboard, colored scorecard grid, auto-save to history
- Round history with full scorecards
- Statistics computed from stored rounds: totals, averages, best round,
  best/toughest hole, score breakdown, and a score-development line chart with
  All / 3M / 1M ranges
- Course browsing: search, city filters, ratings, reviews, hole lists,
  favorites, Leaflet maps (CARTO basemaps, dark/light aware)
- Dark / Light / System theme, persisted

**Convincing mocks**

- Per-hole map with a stylized tee→basket diagram and simulated GPS distance countdown
- Weather + wind widget on the scoring screen
- "AI Insights" after each round — practice recommendations computed from your
  actual scores — plus a mid-round projected final score
- Tournaments (one live with standings + CTP, one upcoming), share-to-clipboard
- Social feed with likes and comments (persisted), friend profiles, create-group modal
- Chains Pro paywall with simulated purchase
- Apple/Google sign-in simulation

## Tech

React 18 · Vite · TypeScript · Tailwind CSS · React Router · Recharts ·
Leaflet · lucide-react. All state persists in `localStorage` under `chains.*`
keys — use **Settings → Reset demo data** to start fresh.
