# DESIGN.md — the building

See docs/superpowers/specs/2026-09-17-landing-page-design.md.

## Colour
Computed from depth and written to `--bg`: cold `#0e131c` at altitude, warm `#1a130d` at the floor, neutral `#0f1219` outside the column. Text `#eef1f5`; `--fg-2` 66%, `--fg-3` 42%. Amber `#f3a94f` only in the floor's work lights. Ice blue `#9fc2ff` for interactive states: the elevator car, hover fills, active lines.

## Type
Host Grotesk (variable, 300–800) for statements and body. Barlow Condensed 500, uppercase, tracked 0.10–0.12em, as the one signage system: plaques, elevator panel, buttons, the labels etched on the floors. Statements clamp(2.1rem, 4.9vw, 4.7rem) at 500, −0.022em, line-height 1.02; the surface statement one step larger.

## Layout
Copy in a 620px column on the left over a soft scrim; the 3D subject sits right of centre. Elevator panel fixed right. On phones the copy sits in the bottom third and the camera steps back.

## Environment
Gradient sky dome with horizon glow (steel blue above, warming below with depth), survey-grid ground far below, a skyline of dark towers with drawn edges and lit windows, light shafts down the atrium, a key light from above and a cool fill from behind. Thin fog.

## Real things
Every floor is furnished with real low-poly models at 1.5× life size; the fund floor stays abstract (the higher you are, the more abstract the view). Kit pastels are re-toned by material name: chairs slate, wood warm grey, plants deep green. City facades glow faintly from their own colormap.

## Clarity rules
Clear glass, never frosted. Every prop outlined. No depth of field. Bloom only on true lights. Resolution locked after the loader.

## Motion
Scroll is the story. Camera dwell curve per chapter; chapter text reveals once per approach and reverses on leave; plaques scramble in; floors crossed pulse the aberration. Everything has a reduced-motion form.
