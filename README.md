# AiStudio — Go where the work is

The company site. It walks the reader from the fund's seat to the desk where the work happens, one chapter at a time, then pulls back to show that the same team works in all three places.

The story, the content rules and every line of copy live in [`docs/site-brief.md`](docs/site-brief.md). That file is the source of truth; the markup follows it.

## How it is built

No 3D. The page is plain HTML, CSS and TypeScript with GSAP and Lenis, about 55 kB gzipped plus the shader backdrop.

- **The backdrop.** A slow mesh gradient with grain from [`@paper-design/shaders`](https://github.com/paper-design/shaders), mounted full-viewport behind the page. It gives the light somewhere to come from. It does not respond to scroll.
- **The index.** Chapter numerals set against a vertical rule down the left of the text, with a hairline per chapter crossing it.
- **The rail.** A fixed panel on the right: where you are, and a way to go straight there.

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
| `src/styles/index.css` | tokens, type, layout |
| `src/lib/backdrop.ts` | the shader backdrop |
| `src/lib/lift.ts` | the rail: active chapter and the marker |
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

`audit.mjs` is the gate before shipping. It must report no console errors, every anchor landing on its own section with the right rail entry lit, and every text sample above 4.5:1 against both the flat background and the darkest tone the backdrop can paint (3:1 for the large chapter numerals).

## Content rules

Nothing traceable to a client: no figures, sectors, countries, timelines or engagement details. Company facts, founders, advisors and locations are fine. One conversion, the Calendly link, with sharad@aistudio.ae as the fallback.

## Deploy

Static output in `dist/`, about 55 kB gzipped plus two self-hosted fonts. Any static host. The Open Graph image URL in `index.html` assumes `https://www.aistudio.ae`; change it if the domain differs.
