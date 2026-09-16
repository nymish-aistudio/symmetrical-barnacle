# DESIGN.md — the cyanotype system

See docs/superpowers/specs/2026-09-17-landing-page-design.md for the rationale.

## Colour
Two-tone. `print` #0f3a90 (cyanotype blue) with `print-ink` #eff6fb; `paper` #f4f7fb with `ink` #101a2d. Semantic vars `--bg --fg --fg-2 --rule --btn-bg --btn-fg` swap between the sets; the swap animates on scroll over the development zone. No third accent.

## Type
Archivo (variable; wdth 62–125, wght 100–900) for all speaking text. Azeret Mono only inside document artifacts. Scale 1.333: 0.8, 1, 1.333, 1.777, 2.369, 3.157, 4.209, 5.61 rem. Display letter-spacing -0.03em, line-height 0.96. Body 1.0625rem / 1.6, max 68ch. Light-on-dark body line-height +0.05.

## Layout
`--gut: clamp(20px, 5vw, 72px)`, `--max: 1320px`. Grid 12 columns. Left-aligned. Sections separated by rhythm, not rules: large gaps between ideas, tight gaps within.

## Structural devices (the only ones)
- Drawing frame: 1px frame with 12px corner marks around the hero viewport.
- Title block: a mono metadata block in the bottom-right of the frame.
- Ledger rows: full-width rows with a rule between, never cards.

## Motion
One page-load sequence (headline in, scatter breathes). Scroll-driven: hero morph, altitude morphs, development, method path draw, principle weight. Easing `expo.out` / `power3.out`; no bounce. Everything has a reduced-motion alternative.
