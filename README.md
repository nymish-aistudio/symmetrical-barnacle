# AiStudio — Go where the work is

The company site, built as a descent through a building. Scroll takes you from the altitude where a company is a row in a spreadsheet, down through the deal and the company to the floor where the work is, to one sheet of paper becoming a system, and back out to see the whole column.

## Stack

React 19, React Three Fiber 9, drei 10, postprocessing, GSAP 3.15 (ScrollTrigger, SplitText, ScrambleText), Lenis, maath, Vite 8, TypeScript. Fonts are self-hosted (Host Grotesk, Barlow Condensed). No runtime requests leave the page except the Calendly link.

## Run

```bash
pnpm install
pnpm dev          # http://127.0.0.1:5173
pnpm build        # typecheck + production build to dist/
pnpm preview      # serve dist/ on http://127.0.0.1:4173
```

## Where things live

| path | what |
|---|---|
| `src/story.ts` | every word on the page, the chapter order, camera stations, founders |
| `src/scene/CameraRig.tsx` | the spline, dwell curve, damping, parallax, floor-crossing pulses |
| `src/scene/Column.tsx` | the glass floors, edges, struts, etched plaques |
| `src/scene/floors/` | one file per floor: fund, deal, company, plant |
| `src/scene/Sheet.tsx` | the delivery note, its highlights, the particle stream, the record |
| `src/scene/Effects.tsx` | bloom, depth of field, aberration, grain, vignette |
| `src/scene/Atmosphere.tsx` | background and fog by depth; writes `--bg` for the DOM |
| `src/ui/` | nav, elevator panel, chapters, loader, footer |
| `src/audio/drone.ts` | the opt-in room tone |
| `src/styles/index.css` | tokens and layout |
| `docs/superpowers/specs/` | the design spec |

## Visual QA

Two headless scripts drive a locally cached Chromium (Playwright's or Puppeteer's; set `CHROME_PATH` to use another).

```bash
node scripts/stations.mjs                       # hold the camera at each station, plain materials, no post
node scripts/stations.mjs --ids fund,sheet      # a subset
node scripts/stations.mjs --mobile              # 390×844
node scripts/shots.mjs --q "fx=0&glass=0&snap=1" # ride the real scroll through every chapter
node scripts/shots.mjs --reduce --q "fx=0&glass=0"
node scripts/shots.mjs --og                     # writes public/og.png from the surface, full effects (slow)
```

Software rendering is slow with glass and post-processing on, so composition checks use the debug switches. Debug switches on the page itself: `?fx=0`, `?glass=0`, `?snap=1`, `?cam=<chapter id>`.

## Content rules

Public copy describes the kind of work and the company's own principles, people and places. Nothing traceable to a client appears on the site.

## Deploy

Static output in `dist/`. Any static host. The Open Graph image URL in `index.html` assumes `https://www.aistudio.ae`; change it if the domain differs.
