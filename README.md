# AiStudio — Go where the work is

The company site. One idea: the page is a descent. It starts at the surface, where a company is a row in a spreadsheet, and goes down floor by floor to the place where the work actually happens, then pulls back to show that one team works every altitude.

The story, the content rules and every line of copy live in [`docs/site-brief.md`](docs/site-brief.md). That file is the source of truth; the markup follows it.

## How the descent is built

There is no 3D. Three things carry it:

- **Colour.** The page background is a pure function of scroll position, interpolated in OKLCH from a cool off-white at the surface to near-black on the floor, and back to light when the page pulls back. Being stateless means a jump, a resize or a refresh can never leave the page half-lit. See `src/lib/descent.ts`.
- **The shaft.** One hairline runs the height of the descent with the floor numerals set against it and each floor's rule crossing it, so the section reads as a building.
- **The rail.** A fixed elevator panel on the right: where you are, and a way to go straight there.

The one piece of imagery is the sheet: a delivery note whose fields light up one by one as a record fills beside it. It is scrubbed, so the reader drives it.

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
| `index.html` | every word and the whole structure |
| `src/styles/index.css` | tokens, type, layout; the two ends of the descent |
| `src/lib/descent.ts` | background colour as a function of scroll |
| `src/lib/lift.ts` | the rail: active floor and the car |
| `src/lib/reveal.ts` | the page-load sequence and one reveal per section |
| `src/lib/sheet.ts` | the document becoming a record |
| `src/lib/scroll.ts` | smooth scroll and anchor handling |
| `docs/site-brief.md` | the storyline, content rules and copy |

## Checks

Both scripts drive a locally cached headless Chromium. Set `CHROME_PATH` to use another binary.

```bash
node scripts/shots.mjs                  # a screenshot per section, desktop
node scripts/shots.mjs --mobile         # 390×844
node scripts/shots.mjs --reduce         # prefers-reduced-motion
node scripts/shots.mjs --og             # rewrites public/og.png from the hero
node scripts/audit.mjs                  # anchors, rail, focus order, contrast, console
```

`audit.mjs` is the gate before shipping. It must report no console errors, every anchor landing on its own section with the right rail entry lit, the descent reaching full dark on the floor and full light at the close, and every text sample above 4.5:1 (3:1 for the large floor numerals).

## Content rules

Nothing traceable to a client: no figures, sectors, countries, timelines or engagement details. Company facts, founders, advisors and locations are fine. One conversion, the Calendly link, with sharad@aistudio.ae as the fallback.

## Deploy

Static output in `dist/`, about 55 kB gzipped plus two self-hosted fonts. Any static host. The Open Graph image URL in `index.html` assumes `https://www.aistudio.ae`; change it if the domain differs.
