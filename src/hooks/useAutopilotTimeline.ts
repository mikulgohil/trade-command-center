'use client'

import { useRef, useCallback } from 'react'
import gsap from 'gsap'
import { useAutopilotStore } from '@/state/useAutopilotStore'
import { useSimulationStore } from '@/state/useSimulationStore'
import { useSelectionStore } from '@/state/useSelectionStore'
import { useExecutiveStore } from '@/state/useExecutiveStore'
import { latLngToVector3 } from '@/lib/latLngToVector3'
import { ports } from '@/data/ports'
import { GLOBE_RADIUS, FLY_TO_DISTANCE, CAMERA_DEFAULT_POSITION } from '@/lib/constants'

// Proxy objects that GSAP tweens — read by AutopilotController in useFrame
export interface AutopilotProxy {
  cameraX: number
  cameraY: number
  cameraZ: number
  targetX: number
  targetY: number
  targetZ: number
  globeScale: number
  uiOpacity: number
}

export function createDefaultProxy(): AutopilotProxy {
  return {
    cameraX: CAMERA_DEFAULT_POSITION[0],
    cameraY: CAMERA_DEFAULT_POSITION[1],
    cameraZ: CAMERA_DEFAULT_POSITION[2],
    targetX: 0,
    targetY: 0,
    targetZ: 0,
    globeScale: 0.92,
    uiOpacity: 0,
  }
}

/**
 * Hook that builds and controls the GSAP master autopilot timeline.
 * Returns proxy ref (read in useFrame) and play/kill methods.
 */
export function useAutopilotTimeline() {
  const proxyRef = useRef<AutopilotProxy>(createDefaultProxy())
  const timelineRef = useRef<gsap.core.Timeline | null>(null)

  const buildAndPlay = useCallback(() => {
    // Reset proxy
    Object.assign(proxyRef.current, createDefaultProxy())

    const proxy = proxyRef.current
    const store = useAutopilotStore.getState()
    store.start()

    // Find Jebel Ali for the focus phase
    const jebelAli = ports.find((p) => p.id === 'jebel-ali')!
    const jebelAliPos = latLngToVector3(jebelAli.lat, jebelAli.lng, GLOBE_RADIUS)
    const cameraOffset = jebelAliPos.clone().normalize().multiplyScalar(FLY_TO_DISTANCE)

    // Disruption route: Jebel Ali → Rotterdam (r05)
    const disruptionRouteId = 'r05'

    const tl = gsap.timeline({
      paused: true,
      onComplete: () => {
        useAutopilotStore.getState().complete()
      },
    })

    // ─── BOOT (0–3s) ───
    tl.addLabel('boot', 0)
    tl.to(proxy, {
      globeScale: 1.0,
      duration: 2.5,
      ease: 'power2.out',
    }, 'boot')
    tl.to(proxy, {
      uiOpacity: 1,
      duration: 1.8,
      ease: 'power1.out',
    }, 'boot+=1.2')

    // ─── PULSE (3–10s) ───
    tl.addLabel('pulse', 3)
    tl.call(() => {
      useAutopilotStore.getState().setPhase('pulse')
      // Start simulation (KPI drift + events) during pulse
      useSimulationStore.getState().startSimulation()
    }, [], 'pulse')

    // ─── FOCUS (10–18s) ───
    tl.addLabel('focus', 10)
    tl.call(() => {
      useAutopilotStore.getState().setPhase('focus')
      // Select Jebel Ali to populate detail panel
      useSelectionStore.getState().setSelected('jebel-ali')
    }, [], 'focus')

    // Fly camera to Jebel Ali
    tl.to(proxy, {
      cameraX: cameraOffset.x,
      cameraY: cameraOffset.y,
      cameraZ: cameraOffset.z,
      targetX: jebelAliPos.x * 0.3,
      targetY: jebelAliPos.y * 0.3,
      targetZ: jebelAliPos.z * 0.3,
      duration: 1.6,
      ease: 'expo.inOut',
    }, 'focus')

    // Slight orbit while focused (subtle rotation around Y)
    tl.to(proxy, {
      cameraX: cameraOffset.x + 0.5,
      cameraY: cameraOffset.y + 0.3,
      duration: 6.4,
      ease: 'sine.inOut',
    }, 'focus+=1.6')

    // ─── DISRUPTION (18–24s) ───
    tl.addLabel('disruption', 18)
    tl.call(() => {
      useAutopilotStore.getState().setPhase('disruption')
      // Set route to congested first
      useSimulationStore.getState().setRouteStatus(disruptionRouteId, 'congested')
    }, [], 'disruption')

    // Escalate to disrupted after 1.5s
    tl.call(() => {
      useSimulationStore.getState().setRouteStatus(disruptionRouteId, 'disrupted')
      // Fire a critical event in the ticker
      useSimulationStore.getState().addEvent({
        id: `autopilot-disruption-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        label: 'Route disruption — Jebel Ali–Rotterdam corridor suspended',
        severity: 'critical',
      })
    }, [], 'disruption+=1.5')

    // Recovery event at 21s
    tl.call(() => {
      useSimulationStore.getState().setRouteStatus(disruptionRouteId, 'congested')
      useSimulationStore.getState().addEvent({
        id: `autopilot-reroute-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        label: 'AI reroute activated — alternative path via Singapore hub',
        severity: 'info',
      })
    }, [], 'disruption+=3.5')

    // Resolve at 23s
    tl.call(() => {
      useSimulationStore.getState().setRouteStatus(disruptionRouteId, 'normal')
      useSimulationStore.getState().addEvent({
        id: `autopilot-recovery-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        label: 'On-time performance recovered +0.6% after reroute',
        severity: 'info',
      })
    }, [], 'disruption+=5')

    // ─── SUMMARY (24–30s) ───
    tl.addLabel('summary', 24)
    tl.call(() => {
      useAutopilotStore.getState().setPhase('summary')
      // Deselect port
      useSelectionStore.getState().clearSelection()
    }, [], 'summary')

    // Fly camera back out
    tl.to(proxy, {
      cameraX: CAMERA_DEFAULT_POSITION[0],
      cameraY: CAMERA_DEFAULT_POSITION[1],
      cameraZ: CAMERA_DEFAULT_POSITION[2],
      targetX: 0,
      targetY: 0,
      targetZ: 0,
      duration: 2.0,
      ease: 'expo.inOut',
    }, 'summary')

    // Activate executive mode at 27s
    tl.call(() => {
      const execStore = useExecutiveStore.getState()
      if (!execStore.isExecutive) execStore.toggle()
    }, [], 'summary+=3')

    timelineRef.current = tl
    tl.play()
  }, [])

  const kill = useCallback(() => {
    if (timelineRef.current) {
      timelineRef.current.kill()
      timelineRef.current = null
    }
    // Reset proxy to interactive defaults
    const proxy = proxyRef.current
    proxy.cameraX = CAMERA_DEFAULT_POSITION[0]
    proxy.cameraY = CAMERA_DEFAULT_POSITION[1]
    proxy.cameraZ = CAMERA_DEFAULT_POSITION[2]
    proxy.targetX = 0
    proxy.targetY = 0
    proxy.targetZ = 0
    proxy.globeScale = 1.0
    proxy.uiOpacity = 1

    // Clean up store state
    useAutopilotStore.getState().interrupt()
    useSelectionStore.getState().clearSelection()
  }, [])

  return { proxyRef, buildAndPlay, kill }
}
