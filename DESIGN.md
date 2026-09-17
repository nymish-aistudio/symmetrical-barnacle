# DESIGN.md

The system behind the site. Rationale and copy: `docs/site-brief.md`.

## Colour
One palette, fixed. `--bg` `oklch(0.962 0.009 250)`, `--fg` `oklch(0.2 0.028 262)`, `--fg-2` `oklch(0.44 0.028 258)`, accent `oklch(0.57 0.135 58)`, a deep ochre. `--fg-3`, `--fg-4` and the rules are derived with `color-mix`.

The accent appears in four places only: the rail marker, the active chapter's line, the solid button's hover fill, and the field highlights on the sheet.

Contrast floor, measured against both the flat background and the darkest tone the backdrop can paint: small text at or above 5.4:1, the large chapter numerals above 3:1. `scripts/audit.mjs` checks this.

## Backdrop
A mesh gradient with grain from `@paper-design/shaders`, mounted full-viewport behind the page, five cool blue-grey stops, moving at speed 0.12. Capped at a 1920×1080 pixel budget and pixel ratio 1, because it is a soft gradient. Speed 0 under reduced motion, and the element removes itself if WebGL is unavailable, leaving the flat background colour.

## Type
Host Grotesk (variable, self-hosted) for everything that speaks. Barlow Condensed for signage, and nothing else on the page is uppercase.

- hero `clamp(2.6rem, 6.4vw, 5.4rem)` / 560 / −0.03em / 0.99, max 13ch
- statement `clamp(2.05rem, 4.6vw, 4.2rem)` / 500 / −0.022em / 1.04, max 15ch
- lede `clamp(1.04rem, 1.2vw, 1.19rem)` / 1.55, max 46ch
- prose 1.05rem / 1.62, max 42ch in the descent
- signage 0.82rem, tracked 0.13em, uppercase

## Layout
`--max: 1180px`, `--gut: clamp(20px, 5vw, 88px)`, and a `--col` token so every hairline in the page aligns to the same content width. The chapters use a two-column grid: a numeral, then the text, with a vertical rule between them running the height of the sequence. The rail is fixed to the right edge, clear of that column.

No cards. No logo wall. No icons. The structural devices are the chapter numerals, the vertical rule they sit against, and one hairline per chapter.

## Motion
One page-load sequence: the hero's lines rise out of a mask, then the supporting copy. On scroll: the rail car follows, each statement rises once as it arrives, and the sheet is scrubbed. The masked lines carry bottom padding and a matching negative margin, or the clip cuts the descenders off. Buttons fill from the left. Nothing bounces. Every one of these has a reduced-motion form that resolves instantly, and the page is complete without JavaScript running.
