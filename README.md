# Globe Command | Global Trade Command Center

A cinematic, interactive 3D command center that visualizes global trade orchestration — ports, shipping routes, KPIs, disruption response, and AI-powered predictions — built as a boardroom-ready POC.

![Next.js](https://img.shields.io/badge/Next.js-16.1-black?logo=next.js)
![Three.js](https://img.shields.io/badge/Three.js-r183-049EF4?logo=three.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript)
![Tailwind](https://img.shields.io/badge/Tailwind-v4-06B6D4?logo=tailwindcss)

---

## Overview

A real-time 3D globe visualization of a global port network featuring:

- **15 ports** across 9 regions with live KPI data
- **24 trade routes** with animated flow particles and vessel icons
- **AI predictions** with countdown timers and resolution tracking
- **Disruption simulation** with shockwave effects and smart rerouting
- **30-second cinematic autopilot** demo sequence
- **Synthesized audio** — ambient drone, event pings, alert sounds
- **Executive mode** — distraction-free 3-KPI view for boardroom display
- **Responsive** — desktop + mobile layouts with performance auto-scaling

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5.9 |
| 3D Engine | Three.js r183 via React Three Fiber + drei |
| Styling | Tailwind CSS v4 (CSS-first) |
| Animation | GSAP 3.14 |
| State | Zustand 5 (5 micro-stores) |
| Audio | Web Audio API (no external files) |
| Package Manager | pnpm |

---

## Getting Started

```bash
# Clone
git clone https://github.com/mikulgohil/trade-command-center.git
cd trade-command-center

# Install
pnpm install

# Dev server
pnpm dev

# Production build
pnpm build && pnpm start
```

Open [http://localhost:3000](http://localhost:3000) — the 30s autopilot demo plays automatically on load.

---

## Features

### 3D Globe

- Custom GLSL shader with ocean gradient, neon coastlines, lat/lng grid, fresnel rim glow, city lights on night side, and day/night terminator
- Hex grid tactical overlay with animated latitude pulse
- Terrain elevation displacement from height map
- Atmospheric halo shell with additive blending
- Volumetric cloud layer
- Ambient depth particles + starfield background

### Port Network

- 15 ports rendered as InstancedMesh markers for performance
- Hover tooltip projected from 3D → screen coordinates
- Click-to-fly camera animation (1.6s, expo.inOut easing)
- Pulsing selection ring on active port
- Port capacity rings showing utilization
- Detail panel with per-port KPIs and AI recommendations

### Trade Routes

- Great-circle arcs via spherical interpolation (slerp)
- Volume-proportional line widths
- Flow particles along routes (single InstancedMesh, ~432 particles)
- Ship/vessel icons traveling along curves with wobble animation
- Color-coded status: cyan (normal), amber (congested), red (disrupted)

### Live Simulation

- KPI drift every 2.5s with sparkline history
- Random events every 8-14s with severity classification
- Route status changes triggered by critical events
- Animated number counters (GSAP, 600ms roll)
- Bottom event ticker with severity-colored indicators

### AI & Disruption

- **Predictive Alerts** — AI badges appear on ports with countdown timers, probability %, and resolution tracking (70% occur / 30% averted)
- **Disruption Shockwave** — Expanding red ring pulses at disruption location (3 staggered rings)
- **Smart Rerouting** — Cyan alternative route draws on with label showing savings when a route is disrupted
- **Weather Layer** — Storm spirals, fog banks, and wind streaks spawn on the globe

### Autopilot Demo (30s)

| Time | Phase | Action |
|------|-------|--------|
| 0-3s | Boot | CRT-style boot sequence with typing text and progress bar |
| 3-10s | Pulse | Routes appear, KPI panel slides in, particles start |
| 10-18s | Focus | Camera flies to Jebel Ali, detail panel populates |
| 18-24s | Disruption | Route turns red, shockwave, alternative route appears |
| 24-30s | Summary | Camera zooms out, executive mode activates |

Click/touch anywhere to interrupt. "Replay Demo" button appears after completion.

### UI Overlays

- **Sankey Diagram** — SVG trade flow visualization by region (toggle from top bar)
- **Time Scrubber** — 24h timeline with play/pause and 4 speed options
- **World Clock Bar** — Live clocks for key port timezone cities
- **Executive Mode** — Minimal 3-KPI display for presentations

### Sound Design

All sounds synthesized via Web Audio API (zero external audio files):

| Sound | Trigger |
|-------|---------|
| Ambient drone | 55Hz + 82.5Hz through lowpass filter |
| Ping | Info events — sine sweep 1200 → 800Hz |
| Whoosh | Camera fly-to — filtered noise burst |
| Alert | Critical events — 3-pulse square wave |
| Warning | Warning events — triangle sweep |
| Resolve | Prediction averted — C-E-G ascending chime |

Toggle sound on/off from the top bar speaker icon.

---

## Project Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout with Inter font
│   ├── page.tsx                # Main composition: Scene + UI + Boot
│   └── globals.css             # Tailwind v4 + CSS design tokens
│
├── components/
│   ├── Scene/                  # 3D components (R3F)
│   │   ├── SceneCanvas.tsx     # R3F Canvas root
│   │   ├── Globe.tsx           # Globe mesh + custom shader
│   │   ├── GlobeMaterial.ts    # GLSL shader (ocean/grid/fresnel/noise)
│   │   ├── Atmosphere.tsx      # Additive backside sphere shell
│   │   ├── CloudLayer.tsx      # Volumetric cloud sphere
│   │   ├── HexGridOverlay.tsx  # Tactical hex grid shader
│   │   ├── GlobeElevation.tsx  # Terrain height displacement
│   │   ├── Ports.tsx           # InstancedMesh port markers
│   │   ├── PortRing.tsx        # Pulsing selection ring
│   │   ├── PortCapacityRings.tsx # Port utilization rings
│   │   ├── Routes.tsx          # Great-circle arc lines
│   │   ├── RouteParticles.tsx  # Flow particles (single InstancedMesh)
│   │   ├── VesselIcons.tsx     # Ship sprites along routes
│   │   ├── DisruptionShockwave.tsx # Expanding ring pulses
│   │   ├── SmartReroute.tsx    # AI reroute draw-on animation
│   │   ├── PredictiveAlerts.tsx # AI prediction badges
│   │   ├── WeatherLayer.tsx    # Storm/fog/wind systems
│   │   ├── Starfield.tsx       # Background star particles
│   │   ├── DepthParticles.tsx  # Ambient near-globe particles
│   │   ├── Lighting.tsx        # 3-light cinematic setup
│   │   ├── CameraController.tsx # OrbitControls + fly-to + auto-rotate
│   │   └── PerformanceMonitor.tsx # FPS-based quality scaling
│   │
│   ├── UI/                     # 2D overlay components
│   │   ├── UIOverlay.tsx       # Root overlay composition
│   │   ├── TopBar.tsx          # Title, controls, mode toggles
│   │   ├── LivePill.tsx        # Pulsing LIVE indicator
│   │   ├── SoundToggle.tsx     # Audio mute/unmute button
│   │   ├── KPIPanel.tsx        # Left panel: 6 KPI cards
│   │   ├── KPICard.tsx         # Single KPI with sparkline
│   │   ├── DetailPanel.tsx     # Right panel: port details + AI recs
│   │   ├── EventTicker.tsx     # Bottom scrolling event feed
│   │   ├── SankeyDiagram.tsx   # Regional trade flow SVG overlay
│   │   ├── TimeScrubber.tsx    # 24h timeline slider
│   │   ├── WorldClockBar.tsx   # Multi-timezone clock display
│   │   ├── BootSequence.tsx    # CRT-style loading sequence
│   │   ├── AutopilotButton.tsx # Replay demo button
│   │   ├── PortTooltip.tsx     # 3D-projected hover tooltip
│   │   ├── AnimatedNumber.tsx  # GSAP rolling counter
│   │   ├── Sparkline.tsx       # SVG mini sparkline
│   │   ├── GlassPanel.tsx      # Reusable glass-morphism container
│   │   ├── MobileKPISheet.tsx  # Bottom sheet (mobile)
│   │   └── MobileDetailDrawer.tsx # Detail drawer (mobile)
│   │
│   └── Autopilot/
│       └── AutopilotController.tsx # GSAP timeline → R3F bridge
│
├── data/
│   ├── ports.ts                # 15 ports with lat/lng, KPIs, AI recs
│   ├── routes.ts               # 24 trade routes with volume data
│   ├── kpis.ts                 # 6 global KPI definitions
│   ├── events.ts               # Event templates with severities
│   └── rerouteOptions.ts       # Alternative route definitions
│
├── state/
│   ├── useSelectionStore.ts    # Hovered/selected port
│   ├── useSimulationStore.ts   # KPI values, events, route statuses
│   ├── useAutopilotStore.ts    # Autopilot phase management
│   ├── useExecutiveStore.ts    # Executive mode toggle
│   └── usePerformanceStore.ts  # FPS tracking, quality flags
│
├── hooks/
│   ├── useAutopilotTimeline.ts # GSAP master timeline builder
│   ├── useFPSMonitor.ts        # FPS averaging + low-power detection
│   ├── useIdleTimer.ts         # 6s idle → auto-rotate
│   └── useIsMobile.ts          # Responsive breakpoint hook
│
└── lib/
    ├── constants.ts            # Globe radius, camera, timing values
    ├── greatCircle.ts          # Great-circle arc computation (slerp)
    ├── latLngToVector3.ts      # Lat/lng → 3D sphere position
    ├── simulation.ts           # KPI drift + event generator
    ├── sounds.ts               # Web Audio API sound synthesis
    └── formatters.ts           # Number formatting helpers
```

**67 source files** | **~4,800 lines of TypeScript**

---

## Architecture Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Globe shader | Custom `shaderMaterial()` | Full control over 4+ visual effects; `onBeforeCompile` is fragile across Three.js versions |
| Route arcs | Slerp → CatmullRomCurve3 | `.getPointAt(t)` needed for uniform-speed particle travel |
| Particles | Single InstancedMesh, CPU-driven | ~432 particles is trivial for CPU; simpler than GPU compute |
| GSAP + R3F | Tween plain objects → read in `useFrame` | Avoids 60fps React re-renders from state updates |
| State | 5 Zustand micro-stores | Prevents cross-concern re-renders; `getState()` in `useFrame` |
| Audio | Web Audio API synthesis | Zero external files; instant playback; full control over parameters |
| SSR | `dynamic()` with `ssr: false` | Three.js requires `window`; prevents hydration mismatches |
| Styling | CSS custom properties in `:root` | Tailwind v4 CSS-first approach; design tokens as variables |

---

## Performance

- **DPR cap**: `[1, 1.5]` — prevents 2x+ retina from tanking FPS
- **Auto-scaling**: FPS monitor triggers `reducedEffects` mode at < 45fps
  - Particles reduced 60%
  - Atmosphere hidden
  - DPR drops to 1.25
  - Sphere segments reduced to 64x64
  - Backdrop blur reduced to 8px
- **InstancedMesh**: Port markers, particles, vessel icons all share single draw calls
- **Zustand `getState()`**: All `useFrame` reads bypass React subscriptions
- **Cached curves**: Route arcs computed once, reused every frame

---

## Controls

| Action | Input |
|--------|-------|
| Orbit globe | Click + drag |
| Zoom | Scroll wheel / pinch |
| Select port | Click on port marker |
| Deselect | Click empty space |
| Interrupt autopilot | Any mouse/touch/scroll |
| Toggle executive mode | "Executive" button (top right) |
| Toggle Sankey | "Sankey" button (top right) |
| Toggle timeline | "Timeline" button (top right) |
| Toggle sound | Speaker icon (top right) |

---

## Browser Support

- Chrome 90+ (recommended)
- Firefox 90+
- Safari 15+
- Edge 90+

Requires WebGL 2.0 support.

---

## License

This is a personal proof-of-concept project for educational and portfolio purposes.

---

Built with React Three Fiber, GSAP, and a lot of GLSL.
