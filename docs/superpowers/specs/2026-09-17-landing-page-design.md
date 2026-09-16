# AiStudio landing page — design spec

Date: 2026-09-17
Status: approved for build (autonomous session; user asked for a "once in a lifetime" landing page with a proper repo, using the content from the previous draft)

## Brief

AiStudio embeds engineers inside private-equity funds, their deals and their portfolio companies, and ships production AI across the hold period. The previous draft (dark background, amber accent, Bricolage Grotesque, a Three.js constellation hero) was rejected as uninspiring. The new page must keep every fact and figure from that draft, describe clients only by sector and country, and be technically extraordinary without reading as a crypto or SaaS template.

Audience: partners and operating partners at mid-market PE funds, and the CEOs of their portfolio companies. Time-poor, allergic to hype, persuaded by specificity.

Physical scene: a partner opens the link on a MacBook in a glass-walled office at noon, then again on a phone in the back of a taxi. Daylight, not a dark room. The page has to hold up as a document as much as a show.

## Concept: the cyanotype

Engineering drawings were reproduced as cyanotypes: white lines on Prussian blue. AiStudio's work is literally documents (delivery notes, CAD drawings, emails, ERP exports) turned into structure. The page is built as one long print.

- The first half of the page is the **print**: white type and a white point-cloud on cyanotype blue.
- One scroll-driven moment **develops** the print into **paper**: blue ink on off-white. Method, principles, team and the close live on paper.
- The point-cloud is the one memorable object. It holds exactly 44,471 points, one per email in the flagship engagement, and re-forms into the shape of whatever the reader is looking at.

Colour strategy: committed two-tone. Cyanotype blue and paper. No third accent; emphasis comes from weight and width.

## Approaches considered

1. **Hold-period timeline as the page spine.** Clean narrative, but reads as an infographic and repeats every PE deck.
2. **Point-cloud substrate that re-forms per section (chosen).** One object, many formations, each formation is the actual shape of a real engagement (inbox → ledger, heat map, ring, plate, bins). Specific to the work; technically ambitious; degrades to a static sheet.
3. **Kinetic typographic dossier.** Variable-font choreography only. Falls into the editorial-typographic lane and carries no imagery.

## Tokens

Colour (OKLCH, sRGB fallback):

| token | value | hex |
|---|---|---|
| print | oklch(0.38 0.15 262) | #0f3a90 |
| print-deep | oklch(0.30 0.13 262) | #03266d |
| print-ink | oklch(0.97 0.01 240) | #eff6fb |
| print-ink-2 | oklch(0.86 0.05 240) | #b4d6ef |
| paper | oklch(0.975 0.006 250) | #f4f7fb |
| paper-2 | oklch(0.94 0.01 250) | #e6ecf2 |
| ink | oklch(0.22 0.04 262) | #101a2d |
| ink-2 | oklch(0.42 0.04 262) | #414d63 |
| blue | oklch(0.42 0.16 262) | #1545a2 |

Semantic vars (`--bg --fg --fg-2 --rule --btn-bg --btn-fg`) swap between the two sets; the swap is animated by GSAP over the development zone.

Type: **Archivo** variable (wdth 62–125, wght 100–900) for everything that speaks; **Azeret Mono** only inside document artifacts (ledger rows, title block, dimension labels), where monospace is what those documents look like in reality. Scale ratio 1.333. Display max 5.6rem. Letter-spacing floor -0.03em.

Layout: 12-column fluid grid, max 1320px, gutter clamp(20px, 5vw, 72px). Text left-aligned. Substrate sits right of centre on desktop, centred and dimmed under text on mobile. One structural device: a drawing-frame border with corner marks around the hero and a title block in its bottom-right corner.

## Page

1. **Hero (pinned, 260vh of scroll).** Headline "Forward-deployed AI for private equity." in expanded Archivo. Substrate in inbox scatter (four clusters, four shared inboxes). On scroll the headline compresses (wdth axis) and lifts away, the scatter snaps into a ledger sheet, and a caption counts 44,471 → 1 ledger. Title block carries the engagement metadata.
2. **Where we work (pinned, 320vh).** "Most AI vendors sell to one buyer. A fund has three." Three panels cross-fade while the substrate re-forms: heat map (diligence), ring (fund + portfolio), plate with holes (shop floor).
3. **Work (flow).** A ledger, not cards: seven rows with sector, country, status, the figure and one line; each expands for detail. Scrolling a row into view re-forms the substrate to that engagement's shape. Two earlier case studies follow as a short table with links. One "also in flight" paragraph.
4. **Development zone (100vh).** Theme vars tween from print to paper; the canvas fades out.
5. **Method.** Identify · Build · Run · Measure as a real four-step sequence (numbered, justified) on a path that draws on scroll, each with its real example.
6. **How we think.** "Ninety percent software. Ten percent AI." Four principles as large statements; the one in view sits at full weight and width.
7. **Team.** Two founders as engraved title-block plates, the forward-deployed paragraph, pedigree list, three advisors.
8. **Close.** "Bring us one company. We'll bring back a map." Book-a-conversation button and email. Substrate returns faintly as the ring in blue on paper.
9. **Footer.**

## Motion and tech

- Vite + TypeScript, no framework.
- Three.js `Points` with a custom GLSL material. Formations are stored as RGBA float DataTextures (xyz + a per-point value), morph = mix of two textures with per-point stagger and a curl swirl at mid-transition. Mid-morph retargets interpolate on the CPU into a scratch texture so a scrub reversal never pops.
- GSAP 3.15 with ScrollTrigger, SplitText, DrawSVGPlugin. Lenis for smooth scroll, driven by the GSAP ticker.
- Reduced motion: no Lenis, no swirl, no idle drift, formations set instantly, theme set instantly, all reveals resolve to their final state.
- Mobile: draw range cut to ~15k points, DPR capped at 1.5, pointer parallax off.
- Canvas is `aria-hidden`; content is complete without it.

## Non-goals

Naming clients. Photography. A third accent colour. Custom cursors. Sound.
