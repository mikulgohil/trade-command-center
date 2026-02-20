“A cinematic, interactive 3D command center that visualizes Globe Command’s global trade orchestration in real time — ports, routes, KPIs, and disruption response — in a boardroom-ready experience.”

1) Non-Negotiables (Hard Rules)
Visual Quality Rules

No placeholder-looking UI (no raw HTML boxes; everything is glass, clean, aligned).

No external 3D models (no glTF downloads). Use only procedural geometry + shaders.

No cartoony / gaming HUD. Must feel enterprise premium.

No heavy postprocessing that risks glitches. Keep it subtle.

Engineering Rules

Zero console errors/warnings in production build.

Deterministic layout: font loading handled to avoid shifts.

Responsive: desktop and mobile supported.

Performance guardrails: DPR cap + degrade mode.

2) The Experience (Exact Storyboard)
2.1 Autopilot Demo Mode (30 seconds)

This is what makes management go “wow” on a projector.

0–3s: Cinematic Boot

Background fades from pure black to deep navy.

Globe appears with a gentle bloom rim.

Title fades in (top-left):
Globe Command | Global Trade Command Center

A “LIVE” pill appears top-right (subtle pulse).

3–10s: Global Trade Pulse

6–10 glowing trade routes appear sequentially (not all at once).

Each route has moving “flow particles” traveling along the arc.

KPI cards count up smoothly (rolling numbers).

10–18s: Port Focus (zoom + rotate)

Camera flies to Jebel Ali (or your main anchor port) — cinematic orbit.

Selected port marker pulses (ring expands and fades repeatedly).

Right panel populates with port details.

18–24s: Disruption Moment

A route turns amber/red (congestion event).

Bottom ticker announces a disruption (e.g., “Weather delay detected — rerouting”).

Alternative route appears in cyan/teal, and the KPI “On-time %” recovers by +0.6% (animated).

24–30s: Executive Summary

UI collapses into Executive Mode (cleaner).

Only 3 KPIs remain + globe.

End with subtle CTA bottom-left:
“Explore network →”

✅ Autopilot stops if user interacts (mouse/touch/scroll).

3) Layout & UI — Micro Specs
3.1 Viewport Layout (Desktop)

Canvas: full screen, fixed behind UI

UI overlay: absolute full screen, pointer events only on panels

Top Bar (Height: 64px)

Left:

Globe Command wordmark placeholder (text is fine if logo unavailable)

Separator dot

“Global Trade Command Center”

Right:

“LIVE” pill (rounded-full, 10px padding, subtle pulsing glow)

Executive Mode toggle (icon + label)

Left KPI Panel (Width: 360px)

Position: left 24px, top 96px
Glass panel with:

Panel title: “Network KPIs”

6 KPI cards stacked, each 72px height, 12px gap

KPI set (best for leadership):

Global Throughput (TEU/day)

Vessels in Motion

Avg Port Dwell Time

On-time Performance

Congestion Index

Carbon Efficiency Index

Each KPI card:

left: icon circle (24px)

center: label

right: big number (tabular)

micro sparkline line (simple SVG) optional

Right Detail Panel (Width: 420px)

Position: right 24px, top 96px
Content changes based on selection:

Default (no selection): “Hover a port to preview”

On port click:

Port name, country, region

5 KPIs

“Top Routes” list (3 items)

“AI Recommendations” block (text)

Bottom Ticker (Height: 56px)

Position: bottom 24px, left 24px, right 24px
Scrolling “event feed” with:

timestamp (HH:MM:SS)

event label

severity dot (cyan=info, amber=warn, red=critical)

Ticker scroll speed: steady; pauses on hover.

3.2 Mobile Layout

Globe full screen

Top bar stays

KPI panel becomes bottom sheet (collapsed to 56px; expand on tap)

Details appear as right drawer or modal

4) Visual Design Tokens (Exact)

Use tokens to keep consistent.

Base

bg: #071021

panel: rgba(255,255,255,0.06)

panelBorder: rgba(255,255,255,0.12)

textPrimary: rgba(255,255,255,0.92)

textSecondary: rgba(255,255,255,0.72)

Accents (Cinematic)

accentCyan: #33D6FF

accentTeal: #19E6C1

accentAmber: #FFB020

accentRed: #FF4D6D

accentGreen: #3DFF88

Glass Panel Style (Always)

background: panel

border: 1px solid panelBorder

backdrop blur: 16px

shadow: 0 20px 60px rgba(0,0,0,0.45)

radius: 20px

Text

Headline: 18–20px semi-bold

KPI number: 26–30px bold

KPI label: 12–13px medium

Use font-variant-numeric: tabular-nums

5) 3D Scene — Micro Specs (Procedural Only)
5.1 Renderer Setup

Canvas:

dpr: Math.min(window.devicePixelRatio, 1.5) (cap)

antialias: true

preserveDrawingBuffer: false

Background: transparent; UI handles background gradient

5.2 Camera

PerspectiveCamera

FOV: 38

Near: 0.1

Far: 200

Default position:

x: 0

y: 0

z: 6.0

OrbitControls:

enablePan: false

minDistance: 4.2

maxDistance: 9.0

dampingFactor: 0.08

rotateSpeed: 0.55

Auto rotate:

speed: 0.12

disabled during user interaction, re-enabled after 6s idle

5.3 Lighting (Cinematic but stable)

Ambient light: intensity 0.35

Directional key (upper-left): intensity 1.1

Fill (front): intensity 0.35

Rim/back light: intensity 0.7 (gives premium edge)

5.4 Globe Materials (No external textures)
Globe sphere

Geometry: SphereGeometry(2.3, 96, 96)

Shader/Material features:

Ocean base (dark navy gradient)

Lat/long grid (faint)

Noise modulation (subtle surface)

Fresnel rim (cyan/teal tint)

Night glow (very soft)

Implementation: custom ShaderMaterial OR MeshStandardMaterial + onBeforeCompile.
To reduce risk, do:

MeshStandardMaterial (base)

Add Fresnel via shader patch

Add grid via procedural UV math

Atmosphere shell

Second sphere: radius 2.36

Material: MeshBasicMaterial

blending: Additive

opacity: 0.08–0.14

color: cyan-ish

side: BackSide

5.5 Ports

Use InstancedMesh (performance)

Each port:

base marker: small cylinder or sphere

emissive strength depends on region activity

Marker size:

normal: 0.03–0.05

hover: 0.07

selected: 0.08 + pulsing ring

Hover ring:

PlaneGeometry ring + shader alpha

pulsing: scale from 1 → 1.8 every 1.2s

5.6 Routes (Great-circle arcs)

For each route:

compute points along great circle (64–128 segments)

raise arc height: 0.25–0.55 based on distance

Render style:

base line: faint (opacity 0.25)

active routes: brighter (opacity 0.85)

Flow effect options:

TubeGeometry + shader moving gradient (best)

Line + animated dash (simpler)

Particles traveling along curve (adds “wow”)

Use Option 3 + faint line: reliable + cinematic.

Particles:

12–30 per route depending on importance

speed: 0.15–0.45

size: 0.015–0.03

color: cyan for normal, amber/red for issues

6) Data — Provide a Solid Default Set (Realistic)
6.1 Must-have ports (12–18)

Include global spread:

Jebel Ali (UAE)

London Gateway (UK)

Rotterdam (NL)

Antwerp (BE)

Singapore

Hong Kong

Shanghai

Mumbai/Nhava Sheva (IN)

Jeddah (KSA)

Durban (ZA)

Santos (BR)

Los Angeles/Long Beach (US)

Vancouver (CA)

Sydney (AU)

Routes: 18–30.

✅ This looks “global” without being too heavy.

6.2 KPI Ranges (so numbers feel real)

TEU/day: 18,000–75,000

dwell: 8–46 hours

on-time: 82.0–96.5%

congestion index: 0–100

carbon index: 40–92 (higher is better)

6.3 Live Simulation (every 2.5s)

Update 2–3 KPIs slightly (±0.5–2.0%)

Randomly trigger 1 event every 8–14s:

“Congestion rising at Port X”

“Weather delay detected”

“Reroute activated”

If event severity is high:

one route changes color + label

7) Animations — Exact Timing & Curves
7.1 Global UI Entrance

Fade in background: 700ms (easeOut)

Globe scale 0.92 → 1.0: 900ms (expo.out)

KPI cards appear stagger:

each 90ms

slide up 12px + fade

7.2 Hover Port

marker scale 1 → 1.35: 160ms (power2.out)

tooltip fade: 120ms

ring opacity: 0 → 1: 120ms

7.3 Click Port (camera fly-to)

Total 1.6s

0–1.0s: rotate globe to bring port center

0.6–1.6s: zoom in slightly + settle

Use GSAP timeline with expo.inOut

7.4 Disruption Moment

route color transitions: 300ms

ticker event pops: 220ms

“AI reroute” new route draws in 900ms (stroke reveal)

7.5 Executive Mode Toggle

Collapse left + right panels:

width anim to 0 with fade: 420ms

Keep top bar + 3 KPIs only:

move to top center: 420ms

8) Executive Mode (Boardroom Optimized)

When ON:

Only show:

Title

3 KPIs (Throughput, On-time, Congestion)

Globe

Ticker minimal (optional)

Increase font sizes slightly

Reduce motion intensity:

fewer particles

less glow

auto-rotate slower

This is crucial for projection clarity.

9) Performance & Fallback Strategy
9.1 Low Power Detection

If:

FPS average < 45 over 3s
OR

deviceMemory <= 4 (if available)
Then enable reducedEffects:

reduce particles by 60%

disable atmosphere bloom-like additive (keep minimal)

reduce route particles by 50%

9.2 DPR Control

default cap 1.5

reduce to 1.25 if low-power

9.3 Avoid heavy postprocessing

Do NOT add SSAO / heavy bloom pipelines.
If you must add bloom: do it lightly and disable in reduced mode.

10) QA Checklist (Must Pass)
UI

No overflow on panels at 1280×720 and 1920×1080

Tooltips never go off-screen

Ticker never overlaps panels

3D

Orbit feels damped, premium

No Z-fighting on rings/lines

Ports are clickable reliably

Routes do not flicker

Data

Live updates do not jitter layout (use fixed widths for numbers)

No NaN values ever

Build

next build succeeds

No hydration mismatch warnings

No missing font flashes (use next/font)

11) Final Implementation Instructions to Claude (Mega Prompt)

Copy-paste this EXACTLY into Claude Code:

Build a projection-quality web POC called:
“Globe Command | Global Trade Command Center” (Cinematic Executive Demo).

Constraints:
- No designer, no external 3D models.
- Use procedural geometry + shaders only.
- Must be stable, premium, enterprise (not gaming).
- No console errors/warnings in production build.
- Must include Autopilot Demo Mode (30s storyboard) and Executive Mode toggle.

Tech:
Next.js (App Router) + TypeScript + Tailwind + R3F (three.js) + drei + GSAP + zustand.

Deliverables:
1) Full working project with clean structure:
   /components/Scene/* , /components/UI/* , /data/* , /state/*
2) 3D scene:
   - Globe with premium material: faint lat/long grid + noise + fresnel rim glow
   - Atmosphere shell (subtle additive)
   - Instanced ports (markers) with hover tooltip and click select
   - Great-circle routes with faint base line + moving particles flow effect
   - Subtle depth particles (disabled in reduced mode)
3) UI overlay:
   - Top bar (title + LIVE pill + Executive Mode toggle)
   - Left KPI panel (6 KPIs) with animated count-up
   - Right detail panel showing selected port KPIs + top routes + AI recommendations
   - Bottom event ticker with severity colors and smooth scrolling
4) Autopilot Demo Mode:
   - Runs on load for 30s, follows storyboard:
     boot → routes reveal → zoom to anchor port → disruption + reroute → executive summary
   - Stops on user interaction and can be restarted from a button
5) Performance:
   - DPR cap (<=1.5), low-power reducedEffects when FPS drops
   - Avoid heavy postprocessing; keep visuals stable.
6) QA:
   - Confirm no overflow, tooltips stay in viewport, no console errors.

Implementation detail requirements:
- Use design tokens for colors and spacing.
- Use next/font for typography to avoid layout shift.
- Use tabular-nums for all KPI numbers.
- Use fixed-width number containers to avoid layout jumping.
- All animations must be smooth and timed (GSAP).
- Keep interactions deterministic and robust.

Start steps:
A) Scaffold app + UI shell with dummy data.
B) Implement R3F globe with orbit controls + lighting.
C) Add ports with hover/click.
D) Add routes with particle flow.
E) Wire panels + data + simulation.
F) Implement Autopilot timeline.
G) Polish + QA, fix every warning.

12) Extra “WOW” Layer (Optional but Safe)

Add a “Trade Pulse” effect:

Every 6s, a soft wave emits from selected port across globe surface (shader ripple).

Very subtle, never distracting.

This feels expensive.