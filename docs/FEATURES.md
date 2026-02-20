# Globe Command | Global Trade Command Center — Feature Roadmap

> Comprehensive feature catalog for enhancing the 3D command center POC.
> Stack: Next.js 16 + R3F + drei + GSAP + zustand + Tailwind v4

---

## How to Read This Document

Each feature includes:
- **Description** — What it does
- **Why It Matters** — Impact on the demo / boardroom impression
- **Complexity** — `Low` (1-2 files, <2hrs) | `Medium` (3-5 files, 2-6hrs) | `High` (6+ files, 6hrs+)
- **Dependencies** — What must exist first

Features are grouped into 8 categories. Within each category, features are ordered by recommended implementation priority.

---

## Table of Contents

1. [Cinematic & First Impressions](#1-cinematic--first-impressions)
2. [Globe Visual Enhancements](#2-globe-visual-enhancements)
3. [Route & Traffic Visualization](#3-route--traffic-visualization)
4. [Port Enhancements](#4-port-enhancements)
5. [Data & Analytics](#5-data--analytics)
6. [AI & Intelligence Features](#6-ai--intelligence-features)
7. [Interactivity & UX](#7-interactivity--ux)
8. [Post-Processing & Ambient Effects](#8-post-processing--ambient-effects)

---

## 1. Cinematic & First Impressions

### 1.1 Boot-Up Loading Sequence
**Description:** A cinematic intro before the globe appears — scanline effect, "INITIALIZING GLOBAL TRADE NETWORK..." text typing out, progress bar filling, data readouts flickering, then the globe materializes from particles coalescing into a sphere.

**Why It Matters:** First impression sets the entire tone. This transforms a "loading screen" into a dramatic reveal that hooks the audience instantly. Used by NASA Eyes, Stripe Globe, and most Awwwards-winning 3D sites.

**Complexity:** Medium
**Dependencies:** None — runs before everything else
**Implementation Notes:**
- GSAP master timeline with sequential labels
- Particles → sphere morph via shader (position attribute lerp)
- Text typing effect with monospace font + cursor blink
- Bloom post-processing ramps up during reveal
- Fade to normal scene state at end

---

### 1.2 Cinematic Camera Paths (Presentation Mode)
**Description:** Pre-defined camera sweeps triggered by arrow keys or a timeline UI. Each "slide" flies the camera to a different region, highlights relevant data, and narrates the story. Think: keynote presentation but inside the 3D scene.

**Slides example:**
1. Global overview — all routes pulsing
2. Zoom to Middle East — Jebel Ali focus with KPIs
3. Zoom to Asia-Pacific — Singapore/Shanghai comparison
4. Disruption event — Suez Canal blockage simulation
5. AI resolution — rerouting animation
6. Pull back — executive summary view

**Why It Matters:** Turns the POC into a self-running boardroom presentation. Executives don't need to interact — just watch. This is the #1 feature for "demo day" scenarios.

**Complexity:** Medium
**Dependencies:** Autopilot system (already exists), CameraController
**Implementation Notes:**
- Array of camera presets (position, target, duration, easing)
- Arrow keys / on-screen prev/next buttons to advance
- Each slide triggers specific store actions (select port, fire event, toggle mode)
- Subtle text overlays for slide titles ("Global Network Health")
- GSAP timeline per slide, chained sequentially

---

### 1.3 Sound Design Layer
**Description:** Ambient audio that responds to scene state:
- Low ambient hum (always playing, subtle)
- Soft "ping" on new events
- Whoosh on camera fly-to
- Alert tone on disruption events
- Heartbeat pulse on critical alerts
- Volume/mute toggle in UI

**Why It Matters:** Sound elevates the experience from "cool demo" to "immersive command center." Studies show audiovisual presentations are 43% more persuasive than visual-only. Every major cinematic web experience (Bruno Simon, SPAACE, STR8FIRE) uses sound.

**Complexity:** Medium
**Dependencies:** None
**Implementation Notes:**
- Howler.js for audio management (small library, reliable)
- Sound sprites (single audio file with multiple sounds)
- GSAP timeline triggers sound events via `onStart` / `onComplete` callbacks
- Spatial audio optional (Howler supports it) — sounds pan based on globe position
- Persist mute state in localStorage

---

### 1.4 Screenshot / Export Mode
**Description:** A button that hides all UI panels, centers the globe with a slight zoom, captures a high-resolution screenshot (2x or 4x), and offers download. Optional: export as video (5s loop).

**Why It Matters:** Executives want to put this in their slide decks. Give them a one-click way to capture a clean, stunning image. Low effort, high value.

**Complexity:** Low
**Dependencies:** None
**Implementation Notes:**
- R3F's `gl.domElement.toDataURL('image/png')` for canvas capture
- `html2canvas` for UI overlay if needed
- GSAP: animate panels out (300ms), wait, capture, animate back
- Download via temporary `<a>` element with blob URL

---

## 2. Globe Visual Enhancements

### 2.1 Day/Night Terminator Line
**Description:** A real-time shadow sweeping across the globe showing the current day/night boundary. The "night" side is darker with city lights glowing as dots. The terminator line has a soft gradient transition.

**Why It Matters:** Instantly adds realism. Viewers recognize it as "real" — it grounds the abstract data in the physical world. Shows which trade hubs are currently in business hours.

**Complexity:** Medium
**Dependencies:** Globe shader (GlobeMaterial.ts)
**Implementation Notes:**
- Calculate sun position from current UTC time (simple formula, no library needed)
- Pass sun direction as uniform to globe fragment shader
- `dot(normal, sunDir)` gives day/night factor
- Night side: darken base color by 60%, add city light dots (texture or procedural)
- Terminator transition: `smoothstep(-0.1, 0.1, dotProduct)` for soft edge
- Update sun uniform every 60s (terminator moves ~15 degrees/hour)

---

### 2.2 Cloud Layer
**Description:** A semi-transparent second sphere slightly larger than the globe with an animated noise texture simulating cloud cover. Rotates at a slightly different speed than the globe. Opacity varies by region.

**Why It Matters:** Adds atmospheric depth. The globe looks like a real planet rather than a data sphere. Very common in premium globe visualizations (Google Earth, Apple Maps globe).

**Complexity:** Low
**Dependencies:** Globe mesh
**Implementation Notes:**
- Second `SphereGeometry` at radius + 0.03
- Simplex noise shader with time-based animation
- `AdditiveBlending`, opacity 0.08-0.12
- Rotate Y-axis at 0.02 rad/s (different from globe)
- Hide in reduced performance mode

---

### 2.3 Starfield Background
**Description:** Replace the flat dark background with a subtle animated starfield using InstancedMesh or Points. Stars slowly rotate. Optional: add a faint Milky Way band texture.

**Why It Matters:** Removes the "floating in void" feeling. Creates depth and cinematic atmosphere. Every space/globe visualization benefits from this (Stripe Globe, GitHub Globe).

**Complexity:** Low
**Dependencies:** None
**Implementation Notes:**
- `Points` with `BufferGeometry` — 2000-4000 stars
- Random positions on a large sphere (radius 50-100)
- Size attenuation enabled, sizes 0.01-0.04
- Very slow rotation (0.001 rad/frame)
- Optional twinkle: animate opacity via shader with `sin(time + random)`
- Already have `DepthParticles.tsx` — could enhance that component

---

### 2.4 Hex Grid Overlay
**Description:** Replace or augment the lat/lng grid lines with a hexagonal grid pattern on the globe surface. Hexes glow based on trade activity in that region. Creates a "tactical display" aesthetic.

**Why It Matters:** The hexagonal grid is the universal visual language for "command center" / "military-grade monitoring." It shifts the aesthetic from "Google Earth" to "sci-fi control room." Very strong wow factor.

**Complexity:** Medium
**Dependencies:** Globe shader
**Implementation Notes:**
- Hex grid computed in fragment shader (UV → hex coordinates)
- Each hex can be colored by a data texture (trade volume heatmap)
- Edge glow with `smoothstep` on hex boundary distance
- Animate hex fill on data changes
- Toggle between standard grid and hex grid in UI

---

### 2.5 Globe Terrain / Elevation
**Description:** Subtle 3D elevation on the globe surface — mountain ranges as slight bumps, ocean trenches as dips. Done via displacement mapping in the vertex shader.

**Why It Matters:** Adds tangible realism. Users can "see" continents pop out slightly. Combined with the day/night shader, creates a stunning earth-like appearance.

**Complexity:** Medium
**Dependencies:** Globe shader, elevation texture
**Implementation Notes:**
- Grayscale elevation texture (NASA SRTM data, freely available)
- Vertex shader: displace along normal by `texture2D(elevationMap, uv).r * 0.05`
- Keep displacement subtle (0.03-0.06) to not distort port positions
- Optional: color mapping (green lowlands → brown mountains → white peaks)
- Disable in reduced performance mode

---

### 2.6 Country Borders Overlay
**Description:** Subtle country border lines drawn on the globe surface. Highlighted on hover. Selected country's borders glow in accent color.

**Why It Matters:** Helps executives orient themselves geographically. When a port is selected, seeing the country boundary provides immediate context.

**Complexity:** High
**Dependencies:** GeoJSON data, globe shader or line meshes
**Implementation Notes:**
- Simplified world GeoJSON (~200KB)
- Convert to 3D line segments projected on sphere
- drei `<Line>` instances or single merged geometry
- Opacity 0.15 default, 0.6 on hover
- Performance concern: simplify geometry aggressively (topojson-simplify)

---

## 3. Route & Traffic Visualization

### 3.1 Ship/Vessel Icons on Routes
**Description:** Small cargo ship sprites that travel along the great-circle arcs. Each ship has a direction indicator and slight wobble animation. Click a ship to see vessel details (name, cargo type, ETA, capacity utilization).

**Why It Matters:** Transforms abstract particles into recognizable objects. Executives immediately understand "those are ships moving cargo." The click interaction adds depth and data storytelling.

**Complexity:** Medium
**Dependencies:** Routes system, RouteParticles (can replace or augment)
**Implementation Notes:**
- Billboard sprites using drei `<Billboard>` or custom shader
- SVG ship icon rendered to texture (avoid external model files)
- 2-3 ships per route (fewer than particles, but more meaningful)
- Slight Y-axis oscillation (0.002 amplitude) for "floating" effect
- Click → detail popup with GSAP fade-in
- Ship direction: tangent of curve at current `t` parameter

---

### 3.2 Disruption Shockwave Effect
**Description:** When a disruption event fires, a visible shockwave ripple expands outward from the disruption point on the globe surface. The ripple is a ring that expands and fades. Affected routes flash red.

**Why It Matters:** Makes disruptions feel urgent and dramatic. Instead of just a text event in the ticker, the audience SEES the disruption propagate across the globe. High cinematic impact.

**Complexity:** Medium
**Dependencies:** Event system, globe shader or separate mesh
**Implementation Notes:**
- `RingGeometry` positioned at disruption lat/lng, oriented to globe normal
- GSAP: scale 0 → 3.0 over 1.5s, opacity 1.0 → 0.0
- Red/amber emissive material with `AdditiveBlending`
- Trigger from event system when severity === 'critical'
- Multiple rings staggered by 200ms for ripple effect
- After shockwave: affected routes flash red 3x

---

### 3.3 Smart Rerouting Animation
**Description:** When a disruption blocks a route, animate the old route fading to red/dashed, then a new "AI-recommended" route draws in with a cyan glow. A floating label shows "Reroute saves 2.3 days | -12% cost."

**Why It Matters:** This is the "hero moment" of the demo. It shows AI-powered logistics intelligence in action — the system doesn't just detect problems, it solves them visually. Executives love this narrative.

**Complexity:** Medium
**Dependencies:** Routes system, disruption events
**Implementation Notes:**
- Store maintains `alternativeRoutes` per disruption
- Old route: GSAP opacity 1.0 → 0.3, color → red, dash animation
- New route: draw-on animation (increase `drawRange` from 0 → full over 1.2s)
- Floating label: drei `<Html>` positioned at route midpoint
- KPI panel updates to show impact (on-time %, cost savings)
- Auto-triggers during autopilot disruption phase

---

### 3.4 Trade Volume Heatmap on Routes
**Description:** Route arc thickness and glow intensity vary based on trade volume. High-volume routes are thick and bright. Low-volume routes are thin and dim. Optional: animate thickness changes over time.

**Why It Matters:** Instantly communicates which trade corridors matter most. Executives can identify critical routes at a glance without reading numbers.

**Complexity:** Low
**Dependencies:** Routes data (add volume field)
**Implementation Notes:**
- `lineWidth` scaled by `route.volume / maxVolume * 3 + 0.5`
- Opacity scaled similarly (0.3 → 1.0)
- Optional glow: duplicate line with larger width + lower opacity + additive blend
- Color intensity: brighter cyan for higher volume

---

### 3.5 Route Traffic Flow Direction
**Description:** Particles on routes only flow in one direction (origin → destination), with an arrow indicator at the destination end. Two-way routes show particles going both ways with a slight offset.

**Why It Matters:** Clarifies trade flow direction — which ports are exporters vs importers. Adds data clarity to the visual.

**Complexity:** Low
**Dependencies:** RouteParticles, route data (add directionality)
**Implementation Notes:**
- Route data already has `from` and `to` — use to set particle direction
- Bidirectional routes: offset curve normals slightly for two parallel paths
- Small arrowhead sprite at destination end

---

## 4. Port Enhancements

### 4.1 Port Capacity Gauge Ring
**Description:** A circular progress ring around each port marker showing capacity utilization. 60% = partial ring (green). 85% = mostly full (amber). 95%+ = full ring (red, pulsing). The ring animates when capacity changes.

**Why It Matters:** Makes every port visually communicate its status without hovering. The globe becomes a real-time capacity heatmap. Executives can spot bottlenecks instantly.

**Complexity:** Medium
**Dependencies:** Ports data (add capacity field), Ports.tsx
**Implementation Notes:**
- `RingGeometry` with `thetaLength` based on capacity percentage
- Color: green (< 70%), amber (70-90%), red (> 90%)
- GSAP tween on `thetaLength` when capacity updates
- Pulsing animation (opacity 0.6 → 1.0) when > 90%
- Size: slightly larger than port marker
- Oriented to face camera (billboard) or fixed to globe surface

---

### 4.2 Port Connection Web
**Description:** When a port is selected, all its connected routes glow brightly while unrelated routes dim to near-invisible. Creates a "network graph" effect centered on the selected port.

**Why It Matters:** Focuses attention on what matters for the selected port. Shows its trade network at a glance. Great for storytelling: "Jebel Ali connects to 12 major ports across 3 continents."

**Complexity:** Low
**Dependencies:** Selection store, Routes
**Implementation Notes:**
- On port select: filter routes by `from === portId || to === portId`
- Connected routes: opacity 1.0, others: opacity 0.08
- GSAP transition over 400ms
- Connected ports: scale up slightly (1.2x)
- Unselected state: all routes return to normal opacity

---

### 4.3 Port Cluster Grouping
**Description:** When zoomed out, nearby ports merge into cluster markers with a count badge ("3 ports"). Zooming in separates them back into individual markers. Smooth transition animation.

**Why It Matters:** Prevents visual clutter when viewing the full globe. Common UX pattern from Google Maps that users intuitively understand.

**Complexity:** Medium
**Dependencies:** Ports.tsx, camera distance calculation
**Implementation Notes:**
- Calculate viewport distance between ports
- If distance < threshold: merge into cluster
- Cluster marker: larger circle with count label
- Click cluster → zoom to show individual ports
- GSAP: morphing animation between cluster and individual markers

---

### 4.4 Port Comparison Mode
**Description:** Select two ports to enter comparison mode. The detail panel splits into a side-by-side view with animated diff indicators. A connecting route between them highlights with transit metrics.

**Why It Matters:** Enables analytical storytelling: "Jebel Ali vs Singapore — which hub handles more throughput?" Executives love comparative data.

**Complexity:** Medium
**Dependencies:** DetailPanel, selection store (extend to multi-select)
**Implementation Notes:**
- Shift+click for second port selection
- Detail panel: two columns with shared KPI rows
- Color coding: green arrow for "winning" metric, red for "losing"
- Connecting route: highlighted with transit time label
- "Compare" button in detail panel header

---

## 5. Data & Analytics

### 5.1 World Clock Bar
**Description:** A row of 5-6 timezone clocks at the top showing current time in major trade hubs (Dubai, Singapore, Rotterdam, Shanghai, Los Angeles, London). Active business hours are highlighted in cyan.

**Why It Matters:** Grounds the global view in real-time context. Executives immediately see which markets are open. Simple addition with high informational value.

**Complexity:** Low
**Dependencies:** None
**Implementation Notes:**
- Simple component with `Intl.DateTimeFormat` for each timezone
- Update every minute
- "Business hours" (8am-6pm local) highlighted in accent color
- Small dot indicator: green if market open, dim if closed
- Position: top bar area or just below it

---

### 5.2 Disruption Timeline
**Description:** A horizontal timeline bar at the bottom showing disruption events over the last 24 hours. Events are dots colored by severity. Click an event to replay: camera flies to the location, KPIs rewind to that moment, route status changes.

**Why It Matters:** Adds a temporal dimension to the spatial data. Executives can review what happened and understand patterns. The "replay" feature is a powerful storytelling tool.

**Complexity:** High
**Dependencies:** Event system, simulation store, autopilot system
**Implementation Notes:**
- Event history stored in simulation store (circular buffer, last 50 events)
- SVG timeline with dots positioned by timestamp
- Click handler: save current state → apply historical state → fly camera → 3s hold → restore
- Scrub/hover to preview without committing
- Time markers every 4 hours

---

### 5.3 Global Trade Flow Sankey Diagram
**Description:** A toggle-able 2D overlay showing a Sankey diagram of trade flows between regions (Asia → Europe, Middle East → Africa, etc.). Width of flows = trade volume. Color = route health.

**Why It Matters:** Provides the "big picture" view that a 3D globe sometimes obscures. Sankey diagrams are C-suite-friendly — instantly readable without 3D literacy.

**Complexity:** High
**Dependencies:** Route data aggregated by region
**Implementation Notes:**
- D3.js sankey layout (or custom SVG)
- Overlay on top of dimmed globe
- GSAP transition: globe dims, Sankey fades in
- Click a flow → globe rotates to show those routes
- Toggle button in top bar

---

### 5.4 Carbon Footprint Tracker
**Description:** A KPI showing estimated CO2 emissions per route and globally. "Green routes" glow green, carbon-heavy routes glow amber. Toggle to show carbon overlay on the globe.

**Why It Matters:** ESG is a boardroom priority. Showing carbon awareness demonstrates forward-thinking. Globe Command has actual sustainability commitments — this aligns with their narrative.

**Complexity:** Low
**Dependencies:** Route data (add carbon estimate field), KPI system
**Implementation Notes:**
- New KPI card: "Carbon Intensity" with unit "kg CO2/TEU"
- Route color override when carbon mode active
- Carbon score = f(distance, vessel type, cargo weight)
- Simulated values with drift like other KPIs

---

### 5.5 Weather Layer
**Description:** Animated weather indicators on the globe — storm systems as spinning spiral icons, high winds as streak lines, fog as translucent patches. Weather events can trigger route disruptions.

**Why It Matters:** Weather is the #1 cause of maritime disruptions. Showing weather creates a direct cause-and-effect narrative: storm → disruption → reroute → recovery. Very compelling for logistics audiences.

**Complexity:** High
**Dependencies:** Globe, event system
**Implementation Notes:**
- Weather zones as textured quads on globe surface
- Storm: rotating spiral sprite with particle trail
- Integration with event system: weather spawns disruption events
- Simulated weather patterns (not real API — this is a POC)
- Toggle in top bar

---

### 5.6 Performance Benchmarks Panel
**Description:** A slide-out panel showing port performance benchmarks: average dwell time, crane moves/hour, truck turnaround time. Compared against industry averages with green/red indicators.

**Why It Matters:** Moves beyond high-level KPIs into operational detail. Shows the system has depth — it's not just a pretty globe, it has real operational intelligence.

**Complexity:** Low
**Dependencies:** Port data (add benchmark fields), DetailPanel
**Implementation Notes:**
- Expandable section in DetailPanel
- 4-5 benchmark metrics per port
- Bar chart showing port vs industry average
- Color coding: green = above average, red = below
- Animated bars on panel open

---

## 6. AI & Intelligence Features

### 6.1 AI Chat Panel
**Description:** A slide-out panel with a conversational AI interface. Users type natural language queries like "What's the fastest route from Jebel Ali to Rotterdam?" or "Show me all disrupted routes in Asia." The AI responds with text AND triggers visual actions (highlights routes, flies camera, shows data).

**Why It Matters:** This is the "future of logistics" narrative. It shows the command center isn't just a dashboard — it's an intelligent assistant. Massive boardroom impact. This is what differentiates a POC from a static visualization.

**Complexity:** High
**Dependencies:** All existing systems (camera, routes, ports, KPIs)
**Implementation Notes:**
- Slide-out panel with chat message UI
- Pre-defined query patterns with regex matching (no actual LLM needed for POC)
- Each pattern triggers a sequence: text response + visual action
- Example queries:
  - "Show disrupted routes" → filter routes, fly to affected area
  - "Compare Jebel Ali and Singapore" → enter comparison mode
  - "What's our carbon footprint?" → toggle carbon overlay
  - "Run disruption scenario" → trigger autopilot disruption phase
- Typing animation for AI responses (GSAP stagger on characters)
- Optional: integrate with actual Claude API for real responses

---

### 6.2 Predictive Alert System
**Description:** "AI predicts congestion at Singapore in 4 hours" — shows a pulsing yellow warning icon on the port before the event happens. A countdown timer ticks down. When the prediction resolves (congestion occurs or is averted), the icon updates.

**Why It Matters:** Shifts the narrative from reactive to predictive. "Our system doesn't just show you what's happening — it tells you what WILL happen." This is the gold standard for logistics C-suite demos.

**Complexity:** Medium
**Dependencies:** Event system, port markers
**Implementation Notes:**
- Prediction queue in simulation store
- Generated 30-60s before actual event fires
- Warning icon: animated exclamation triangle at port position
- Countdown timer in tooltip
- Resolution: icon morphs to checkmark (averted) or alert (occurred)
- Probability percentage that updates as time progresses

---

### 6.3 What-If Scenario Simulator
**Description:** A panel where users can trigger hypothetical scenarios: "What if Suez Canal closes?" — the system simulates the impact: affected routes turn red, KPIs shift, alternative routes appear, recovery timeline shows. Side-by-side comparison of current vs simulated state.

**Why It Matters:** Digital twin capability — the holy grail of logistics technology. Shows the system can model future outcomes, not just display current state. Extremely impressive for boardroom demos.

**Complexity:** High
**Dependencies:** Full simulation system, routes, KPIs
**Implementation Notes:**
- Scenario templates: Suez closure, port strike, weather event, demand surge
- Each scenario defines: affected routes, KPI impacts, recovery timeline
- Split-screen or overlay comparing "current" vs "scenario"
- Timeline slider to see impact progression
- "Apply" button to make scenario the active state
- Reset button to return to normal

---

### 6.4 Anomaly Detection Highlights
**Description:** The system automatically highlights anomalies — a port with unusually high dwell time, a route with unexpected delays, a KPI that deviated from its forecast. Anomalies pulse with a soft red glow and appear in a dedicated "Anomalies" section.

**Why It Matters:** Shows intelligent monitoring without manual oversight. The system surfaces problems before humans notice them.

**Complexity:** Medium
**Dependencies:** Simulation store, KPI history
**Implementation Notes:**
- Simple anomaly detection: value > mean + 2*stddev
- Maintain rolling statistics for each KPI and port metric
- Anomaly marker: red-orange pulsing ring on affected port
- Anomaly panel: slide-out list with severity, description, recommendation
- Auto-clears after value normalizes

---

### 6.5 Natural Language Search
**Description:** A search bar where users type port names, countries, route names, or natural queries. Results highlight on the globe in real-time as you type. "Singapore" → Singapore port pulses. "disrupted" → all disrupted routes glow.

**Why It Matters:** Fast navigation for executives who don't want to hunt-and-click on a 3D globe. Professional UX pattern that makes the tool feel production-ready.

**Complexity:** Medium
**Dependencies:** Ports data, routes data, selection store
**Implementation Notes:**
- Command palette UI (Cmd+K pattern)
- Fuzzy matching with simple scoring (no Fuse.js needed for 15 ports)
- Categories: Ports, Routes, Actions, Scenarios
- Keyboard navigation (arrow keys + enter)
- Selected result triggers camera fly-to + selection

---

## 7. Interactivity & UX

### 7.1 Keyboard Shortcuts + Help Overlay
**Description:** Keyboard shortcuts for power users: `1-9` jump to port presets, `Space` toggles autopilot, `E` toggles executive mode, `D` toggles disruption mode, `?` shows help overlay.

**Why It Matters:** Makes live demos faster and smoother. The presenter doesn't need to click tiny UI buttons — just press keys. The help overlay shows professionalism.

**Complexity:** Low
**Dependencies:** None
**Implementation Notes:**
- `useEffect` with `keydown` listener
- Shortcut map object for easy extension
- Help overlay: glass panel with two-column layout (key + action)
- Show briefly on first load, then on `?` press
- Prevent shortcuts when chat/search is focused

---

### 7.2 Time Scrubber
**Description:** A horizontal slider that lets you scrub through simulated 24 hours of trade activity. Globe, routes, KPIs, and events all react to the scrubbed time position. Play/pause/speed controls.

**Why It Matters:** Temporal dimension is the most requested feature in data dashboards. Shows patterns invisible in real-time: rush hours, time-zone-based trading peaks, overnight maintenance windows.

**Complexity:** High
**Dependencies:** Full simulation system with time-based state
**Implementation Notes:**
- Store: `simulationTime` (0-86400 seconds)
- All simulation data keyed by time
- Slider UI with time labels (00:00, 06:00, 12:00, 18:00)
- Playback speeds: 1x, 10x, 60x, 360x
- Day/night terminator syncs with scrubbed time
- Port capacity and route status change over time

---

### 7.3 Minimap
**Description:** A small 2D flat world map in the bottom-right corner showing the current camera view as a highlighted rectangle. Click anywhere on the minimap to jump the globe to that location.

**Why It Matters:** Spatial orientation aid — users always know where they're looking. Common in games and mapping tools. Adds a layer of polish.

**Complexity:** Medium
**Dependencies:** Camera position → lat/lng conversion
**Implementation Notes:**
- SVG world map (simplified, ~50KB)
- Camera frustum projected to 2D viewport rectangle
- Port dots on minimap match globe ports
- Click handler: convert 2D position to lat/lng → fly camera
- Semi-transparent glass panel styling

---

### 7.4 Drag-to-Create Route
**Description:** Hold Shift + click Port A, drag to Port B — a hypothetical route arc appears with estimated transit time, distance, cost, and carbon footprint. "Add to network" saves it.

**Why It Matters:** Transforms from a viewer into a planning tool. Executives can ask "what if we opened a new route?" and see it instantly. Very interactive.

**Complexity:** Medium
**Dependencies:** Great circle system, ports, route creation
**Implementation Notes:**
- Drag state in interaction store
- Preview arc updates in real-time during drag
- Snap to nearest port within threshold
- On release: show route info popup
- "Add to network" → adds to routes store, particles start flowing

---

### 7.5 Multi-Language Support
**Description:** Toggle between English, Arabic, Mandarin, and Hindi — the four key languages for Globe Command's markets. UI labels, KPI names, and port names switch. RTL support for Arabic.

**Why It Matters:** Globe Command operates globally. Showing Arabic support in a Dubai-focused demo is very impressive. RTL layout demonstrates production readiness.

**Complexity:** Medium
**Dependencies:** All UI text externalized
**Implementation Notes:**
- i18n JSON files per language
- Zustand store for active language
- RTL: `dir="rtl"` on root + mirror layout
- Number formatting respects locale
- Font: Inter supports Latin + Arabic glyphs

---

### 7.6 Accessibility Controls
**Description:** Controls for font size scaling, color contrast boost, reduced motion mode, and high contrast port markers. Accessible via settings gear icon.

**Why It Matters:** Shows professionalism and inclusion. Some executives may have visual preferences. Reduced motion is important for photosensitive users.

**Complexity:** Low
**Dependencies:** CSS custom properties (already in place)
**Implementation Notes:**
- Settings panel with toggles
- Font scale: multiply all rem values by 1.0/1.15/1.3
- High contrast: boost text opacity to 1.0, borders to 0.3
- Reduced motion: disable particles, slow animations 3x
- Persist in localStorage

---

## 8. Post-Processing & Ambient Effects

### 8.1 Bloom Post-Processing
**Description:** Selective bloom on emissive elements — port markers glow, route arcs have soft halos, disruption events flare. Creates a neon-on-dark aesthetic that screams "premium command center."

**Why It Matters:** Single biggest visual upgrade for the least code. Bloom transforms flat colors into luminous, cinematic visuals. Used by virtually every Awwwards-winning 3D project.

**Complexity:** Low
**Dependencies:** R3F postprocessing setup
**Implementation Notes:**
- `@react-three/postprocessing` + `EffectComposer`
- `Bloom` effect: intensity 0.5, luminanceThreshold 0.6, radius 0.8
- Emissive materials on ports, routes, atmosphere
- Performance: half-resolution bloom pass
- Toggle off in reduced performance mode

---

### 8.2 Depth of Field
**Description:** Subtle depth-of-field blur — far side of globe slightly blurry, focused port sharp. Shifts focus during camera fly-to transitions for cinematic feel.

**Why It Matters:** Mimics real camera optics. Adds physical realism and draws eye to the focal point. Common in film and high-end web experiences.

**Complexity:** Low
**Dependencies:** Postprocessing setup
**Implementation Notes:**
- `DepthOfField` effect from postprocessing
- Focus distance: camera-to-target distance
- Bokeh scale: 2-4 (subtle, not aggressive)
- GSAP tweens focus distance during fly-to transitions
- Disable on mobile / reduced performance

---

### 8.3 Chromatic Aberration on Transitions
**Description:** Brief chromatic aberration (RGB split) effect during camera transitions and disruption events. Lasts 300-500ms, subtle intensity. Creates a "sensor glitch" feel.

**Why It Matters:** Adds cinematic edge. Used sparingly, it makes transitions feel impactful. Common in sci-fi UI aesthetics (Iron Man, Westworld control rooms).

**Complexity:** Low
**Dependencies:** Postprocessing setup
**Implementation Notes:**
- `ChromaticAberration` effect, normally offset 0
- On transition: GSAP tween offset to [0.003, 0.003] over 150ms, then back to 0
- On disruption: stronger offset [0.006, 0.006] with brief screen shake
- Keep very subtle — this can look cheap if overdone

---

### 8.4 Vignette
**Description:** Subtle edge darkening around the viewport. Draws focus to the center (globe). Always on, very light.

**Why It Matters:** Cheapest way to add cinematic quality. Every film, every premium dashboard uses vignette. 3 lines of code, permanent visual upgrade.

**Complexity:** Low
**Dependencies:** Postprocessing setup
**Implementation Notes:**
- `Vignette` effect: darkness 0.5, offset 0.3
- Static — no animation needed
- Consider slightly stronger vignette during executive mode

---

### 8.5 Screen-Space Ambient Occlusion (SSAO)
**Description:** Subtle shadow in crevices and where objects meet — adds depth to the globe surface and port markers. Very subtle, mostly visible at close zoom.

**Why It Matters:** Adds 3D depth perception without visible light sources. Makes the globe feel solid rather than flat-shaded.

**Complexity:** Low
**Dependencies:** Postprocessing setup
**Implementation Notes:**
- `SSAO` from postprocessing
- Low sample count (8-16) for performance
- Small radius, subtle intensity
- Only visible benefit at close camera distances

---

### 8.6 God Rays / Volumetric Light
**Description:** Soft light rays emanating from behind the globe, simulating a star (sun) behind the planet. Creates a dramatic backlit silhouette effect.

**Why It Matters:** The "hero shot" effect. When the globe is backlit with subtle god rays, it looks like a cinematic space shot. Extremely high wow factor for minimal effort.

**Complexity:** Medium
**Dependencies:** Lighting setup, postprocessing
**Implementation Notes:**
- Light source positioned behind globe
- `GodRays` effect from postprocessing (or custom shader)
- Alternative: simple gradient plane behind globe with additive blending
- Intensity varies with camera angle (stronger when looking toward light)
- Ties in with day/night terminator if implemented

---

## Feature Dependency Graph

```
Boot Sequence (1.1)
  └── needs nothing, enhances first impression

Starfield (2.3) + Vignette (8.4) + Bloom (8.1)
  └── instant visual upgrade, no dependencies

Day/Night (2.1) + Cloud Layer (2.2)
  └── globe shader enhancements

Port Capacity Rings (4.1) + Port Connection Web (4.2)
  └── build on existing port system

Disruption Shockwave (3.2) → Smart Rerouting (3.3)
  └── shockwave sets up the rerouting payoff

AI Chat (6.1) ← depends on most other systems
  └── build last as it orchestrates everything

Presentation Mode (1.2) ← depends on autopilot + all visual features
  └── build near-end as a capstone
```

---

## Recommended Implementation Order

### Wave 1 — Instant Visual Impact (Low-Hanging Fruit)
| # | Feature | Complexity | Impact |
|---|---------|------------|--------|
| 8.1 | Bloom Post-Processing | Low | Very High |
| 8.4 | Vignette | Low | Medium |
| 2.3 | Starfield Background | Low | High |
| 3.4 | Trade Volume on Routes | Low | Medium |
| 5.1 | World Clock Bar | Low | Medium |

### Wave 2 — Globe Realism
| # | Feature | Complexity | Impact |
|---|---------|------------|--------|
| 2.1 | Day/Night Terminator | Medium | Very High |
| 2.2 | Cloud Layer | Low | High |
| 4.1 | Port Capacity Rings | Medium | High |
| 4.2 | Port Connection Web | Low | High |
| 8.2 | Depth of Field | Low | Medium |

### Wave 3 — Storytelling & Drama
| # | Feature | Complexity | Impact |
|---|---------|------------|--------|
| 1.1 | Boot-Up Loading Sequence | Medium | Very High |
| 3.2 | Disruption Shockwave | Medium | Very High |
| 3.3 | Smart Rerouting Animation | Medium | Very High |
| 6.2 | Predictive Alerts | Medium | High |
| 1.3 | Sound Design | Medium | High |

### Wave 4 — Intelligence Layer
| # | Feature | Complexity | Impact |
|---|---------|------------|--------|
| 6.1 | AI Chat Panel | High | Very High |
| 6.3 | What-If Simulator | High | Very High |
| 6.5 | Natural Language Search | Medium | High |
| 6.4 | Anomaly Detection | Medium | Medium |

### Wave 5 — Polish & Presentation
| # | Feature | Complexity | Impact |
|---|---------|------------|--------|
| 1.2 | Presentation Mode | Medium | Very High |
| 1.4 | Screenshot/Export | Low | Medium |
| 7.1 | Keyboard Shortcuts | Low | Medium |
| 5.2 | Disruption Timeline | High | High |
| 7.3 | Minimap | Medium | Medium |

### Wave 6 — Advanced (If Time Permits)
| # | Feature | Complexity | Impact |
|---|---------|------------|--------|
| 2.4 | Hex Grid Overlay | Medium | High |
| 2.5 | Globe Terrain/Elevation | Medium | High |
| 3.1 | Ship/Vessel Icons | Medium | High |
| 5.3 | Sankey Diagram | High | High |
| 5.5 | Weather Layer | High | High |
| 7.2 | Time Scrubber | High | Very High |

---

## Summary Statistics

| Category | Feature Count | Low | Medium | High |
|----------|:---:|:---:|:---:|:---:|
| Cinematic & First Impressions | 4 | 1 | 3 | 0 |
| Globe Visual Enhancements | 6 | 2 | 3 | 1 |
| Route & Traffic | 5 | 2 | 3 | 0 |
| Port Enhancements | 4 | 1 | 3 | 0 |
| Data & Analytics | 6 | 2 | 1 | 3 |
| AI & Intelligence | 5 | 0 | 3 | 2 |
| Interactivity & UX | 6 | 2 | 3 | 1 |
| Post-Processing & Ambient | 6 | 5 | 1 | 0 |
| **Total** | **42** | **15** | **20** | **7** |

---

*Document created: 2026-02-20*
*Last updated: 2026-02-20*
