# AiStudio — landing page

Forward-deployed AI for private equity. A single-page site built as a cyanotype: the first half is white type and a 44,471-point substrate on Prussian blue; one scroll-driven moment develops it into blue ink on paper.

## Stack

- Vite 8 + TypeScript, no framework
- Three.js: one `Points` object with a custom GLSL material. Formations live in RGBA float textures; the GPU mixes two of them with a per-point stagger and a curl swirl. Mid-morph retargets are snapshotted on the CPU so nothing pops.
- GSAP 3.15 with ScrollTrigger, SplitText and DrawSVGPlugin
- Lenis smooth scroll, driven by the GSAP ticker
- Archivo (variable width and weight) and Azeret Mono from Google Fonts

## Run

```bash
pnpm install
pnpm dev          # http://127.0.0.1:5173
pnpm build        # typecheck + production build to dist/
pnpm preview      # serve dist/ on http://127.0.0.1:4173
```

## Visual QA

`scripts/shots.mjs` drives a locally cached headless Chromium through the page and writes a screenshot per scroll state.

```bash
node scripts/shots.mjs                 # desktop, ./shots
node scripts/shots.mjs --mobile        # 390×844, ./shots-m
node scripts/shots.mjs --reduce        # prefers-reduced-motion, ./shots-rm
node scripts/shots.mjs --og            # writes public/og.png from the hero
```

It looks for a Chromium in the Playwright or Puppeteer cache, then Brave. Set `CHROME_PATH` to point at another binary.

## Layout of the code

| path | what |
|---|---|
| `index.html` | all copy and structure |
| `src/styles/index.css` | tokens, type, layout, sections; the two-tone theme as semantic vars |
| `src/gl/formations.ts` | the six shapes: inbox, ledger, heat, ring, plate, bins |
| `src/gl/substrate.ts` | renderer, morph controller, camera poses, opacity owner |
| `src/gl/shaders/` | vertex and fragment shaders |
| `src/motion/` | one module per section: hero, altitudes, work, develop, method, principles, close |
| `docs/superpowers/specs/` | the design spec |
| `PRODUCT.md`, `DESIGN.md` | product context and the design system, for `/impeccable` |

## Content rules

Every figure comes from a real engagement. Clients are described by sector and country only. The one conversion is the Calendly link; the fallback is sharad@aistudio.ae.

## Deploy

Static output in `dist/`. Any static host works (Vercel, Netlify, Cloudflare Pages, S3). The Open Graph image URL in `index.html` assumes the site is served from `https://www.aistudio.ae`; change it if the domain differs.
