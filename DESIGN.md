# DESIGN.md

The system behind the site. Rationale and copy: `docs/site-brief.md`.

## Colour
Two ends, interpolated in OKLCH by scroll depth and written to `--bg`, `--fg`, `--fg-2`, `--accent`:

| | surface | floor |
|---|---|---|
| background | `oklch(0.972 0.007 250)` | `oklch(0.185 0.024 260)` |
| text | `oklch(0.2 0.028 262)` | `oklch(0.95 0.008 250)` |
| secondary | `oklch(0.47 0.03 258)` | `oklch(0.72 0.015 250)` |
| accent | `oklch(0.6 0.135 60)` | `oklch(0.78 0.13 72)` |

The accent is amber because that is the colour of light on a floor at night. It appears only on the rail car, the active floor's line, the solid button's hover fill and the field highlights on the sheet. `--fg-3` and `--rule` are derived with `color-mix` from the live tokens, so everything follows the descent for free.

Contrast floor: all small text at or above 4.5:1 at both ends and everywhere between, which is why signage uses `--fg-2` rather than a fainter tint. The large floor numerals use `--fg-4` and clear 3:1.

## Type
Host Grotesk (variable, self-hosted) for everything that speaks. Barlow Condensed for signage, and nothing else on the page is uppercase.

- hero `clamp(2.6rem, 6.4vw, 5.4rem)` / 560 / −0.03em / 0.99, max 13ch
- statement `clamp(2.05rem, 4.6vw, 4.2rem)` / 500 / −0.022em / 1.04, max 15ch
- lede `clamp(1.04rem, 1.2vw, 1.19rem)` / 1.55, max 46ch
- prose 1.05rem / 1.62, max 42ch in the descent
- signage 0.82rem, tracked 0.13em, uppercase

## Layout
`--max: 1180px`, `--gut: clamp(20px, 5vw, 88px)`, and a `--col` token so every hairline in the page aligns to the same content width. The descent uses a two-column grid: a numeral gauge, then the text. The rail is fixed to the right edge, clear of that column.

No cards. No logo wall. No icons. The structural devices are the floor numerals, the shaft, and one hairline per floor.

## Motion
One page-load sequence: the hero's lines rise out of a mask, then the supporting copy. On scroll: the background interpolates, the rail car follows, each statement rises once as it arrives, and the sheet is scrubbed. Buttons fill from the left. Nothing bounces. Every one of these has a reduced-motion form that resolves instantly, and the page is complete without JavaScript running.
