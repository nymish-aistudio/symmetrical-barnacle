> **Superseded.** This describes the WebGL build, which was stopped on 2026-09-18 as too much.
> The site that shipped is the 2D editorial build: see `docs/site-brief.md` and `DESIGN.md`.
> Kept for the reasoning behind the story, which carried over unchanged.

# AiStudio site — design spec (v2, "Go where the work is")

Date: 2026-09-17
Status: built. Supersedes v1 (the cyanotype), which was rejected for publishing engagement specifics and for reading as a marketing page rather than a story.

## Brief

A single-page site for AiStudio, written in the founders' voice, that tells one story: the work of a company happens far below the altitude at which it is bought, and AiStudio goes down there. No client details of any kind. Reference for ambition: igloo.inc (Awwwards Site of the Year 2024): one hard idea, scroll as the sequencing device, a single signature object, sound and transitions as texture.

## The one idea: the descent

Scroll is a descent through a building. Each chapter is a floor.

| station | plaque | what you see | what is said |
|---|---|---|---|
| 00 | Surface | looking down the atrium from above | Go where the work is. |
| −1 | The fund | a spreadsheet made of light; companies stand up out of it as towers | From up here, a company is a row. |
| −2 | The deal | the data room: piles of documents tethered to a dark silhouette with lit windows | The data room is what a company chooses to show. |
| −3 | The company | desks, screens, and email travelling between them | Down here, the business runs on paper. |
| −4 | The floor | machines, carts, orders hanging on paper, amber work lights, sparks | This is where we sit. |
| −5 | The sheet | one delivery note; its fields light up and stream into a record | One document at a time, the paper becomes a system. |
| — | How we build | the sheet and the record together | Ninety percent software. Ten percent AI. Four rules. |
| ↑ | Every altitude | the camera leaves the atrium; the whole column, threads of light between floors | One team, every altitude. |
| — | Who we are | the column from the other side | We learned this where mistakes cost money. |
| — | Start | the column from above and in front | Bring us one company. |

Colour temperature follows depth: cold at altitude, warm at the floor, neutral outside. The elevator panel on the right is the navigation.

## Content rules

Company facts, principles, founders, advisors, locations: yes. Anything traceable to a client (figures, sectors, countries, timelines): no. The delivery note is fictional and archetypal.

## Tokens

Background is computed from depth (`#0e131c` cold → `#1a130d` warm → `#0f1219` outside) and written to `--bg`. Text `#eef1f5`; secondary at 66% and 42%. One warm accent (`#f3b562`) lives only in the floor's lights.

Type: Host Grotesk (variable, self-hosted) for all speaking text; Barlow Condensed as the signage system (plaques, elevator panel, buttons, floor labels etched in the 3D scene). Both are the only two families. The mark is the brand file (`public/logo-src.png`), recoloured white for the dark ground.

Interactive colour: ice blue `#9fc2ff` for the elevator car, hover fills and active lines. Amber `#f3a94f` stays in the floor's work lights.

## Build

- React 19 + React Three Fiber 9 + drei 10, Vite 8, TypeScript.
- Glass floors: one merged geometry with a clear physical material (clearcoat, low roughness, ~22% opacity) so four floors stay legible through one another; the earlier transmission material blurred everything below it and was removed. Edges, struts and a survey grid on every slab as lines.
- Every prop carries a baked edge outline (one line geometry per prop family). Small boxes read at a distance by their edges, not their shading.
- Props are instanced meshes generated procedurally from a seeded PRNG; positions spread evenly around each ring so any camera sees several.
- Camera rides a centripetal Catmull–Rom spline through per-chapter stations; scroll picks the position with a dwell curve so it holds near each station; maath damping smooths it; the pointer breathes on it. Crossing a floor spikes chromatic aberration.
- Environment: a gradient sky dome that warms with depth, a survey-grid ground far below, forty ghost buildings in the fog around ours ("a partner sees forty of these"), and light falling down the atrium. A key light from above so the props read as solid.
- Post: SMAA, bloom kept to the true lights (threshold 0.9), chromatic aberration only on floor crossings, a whisper of grain, vignette, ACES. No depth of field: it was the main source of softness. Resolution is decided while the loader is up (a short performance sample can step it down) and then locked, because post-processing buffers must not resize mid-scroll.
- Lenis smooth scroll drives progress; GSAP ScrollTrigger reveals chapter text (masked lines, blur-in) and scrambles the plaque.
- Reduced motion: no smooth scroll, no idle motion, instant chapter text, effects static. Mobile: fewer instances, no transmission, no depth of field, camera steps back on portrait.
- Debug switches for QA: `?fx=0` (no post), `?glass=0` (plain slabs), `?snap=1` (camera snaps), `?cam=<id>` (hold a station).

## Real things (v2.2)

Procedural boxes never read as a place, so every floor is furnished with real low-poly models (Kenney, CC0) drawn through one instanced mesh per part:

- The fund: the spreadsheet of light stays, with a boardroom at the west end (a long table, ten chairs, laptops, a screen on the wall).
- The deal: four rows of tables stacked with archive boxes and binders, a wall of open shelving, and the target as an architectural model on a plinth, lit by a spot; tethers run from the boxes to the model.
- The company: twelve desk clusters with monitors that glow, filing along the west wall, a kitchen corner and a lounge on the east, plants, floor lamps, and email travelling between screens.
- The floor: a seven-segment conveyor with boxes riding it, two robot arms working, machines and pipes along the south, a catwalk and turning cogs on the west, pallets, a crane whose arm swings, a loader driving a loop and a parked flatbed.
- Below: an industrial district on the ground with chimneys, tanks, containers and three vehicles on road loops. Around: a skyline of textured towers at 135–255 units whose facades glow from their own colormap.

Lighting is a Poly Haven night HDRI at low intensity plus a key light; post adds a light desaturation so the kits sit in the night. The furniture kit's pastel materials are re-toned by name (chairs to slate, wood to warm grey).

## Environment (v2.1)

A gradient sky dome with a horizon glow that warms with depth; a survey-grid ground far below; a skyline of thirty-six dark towers at 95–205 units with drawn edges, floor lines and lit windows ("a partner sees forty of these"); light falling down the atrium; a key light from above and a cool fill from behind so props read as solid. Fog is thin (0.0085) so the skyline keeps its contrast. Anti-aliasing is SMAA; bloom is kept to the true lights; depth of field is light; grain is a whisper; resolution adapts to frame rate. Sound was removed. Interactive colour is ice blue `#9fc2ff`.

## Non-goals

Client details. Photography. Third-party fonts at runtime. Cursors. Sound.
