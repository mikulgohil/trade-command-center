'use client'

import { useRef, useState, useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Line, Html } from '@react-three/drei'
import { useSimulationStore } from '@/state/useSimulationStore'
import { ports } from '@/data/ports'
import { rerouteOptions, type RerouteOption } from '@/data/rerouteOptions'
import { createRouteCurve } from '@/lib/greatCircle'
import { GLOBE_RADIUS } from '@/lib/constants'

interface ActiveReroute {
  id: string
  option: RerouteOption
  points: THREE.Vector3[]
  midpoint: THREE.Vector3
  startTime: number
  drawProgress: number // 0 → 1 animation
}

const DRAW_DURATION = 1.2 // seconds to draw the route
const DISPLAY_DURATION = 12 // seconds to keep visible

export default function SmartReroute() {
  const [activeReroutes, setActiveReroutes] = useState<ActiveReroute[]>([])
  const lastStatusesRef = useRef<Record<string, string>>({})

  // Build curve points for a reroute option
  const buildReroutePoints = (option: RerouteOption): { points: THREE.Vector3[]; midpoint: THREE.Vector3 } => {
    const allPoints: THREE.Vector3[] = []
    const waypoints = option.waypointPortIds

    for (let i = 0; i < waypoints.length - 1; i++) {
      const fromPort = ports.find((p) => p.id === waypoints[i])
      const toPort = ports.find((p) => p.id === waypoints[i + 1])
      if (!fromPort || !toPort) continue

      const curve = createRouteCurve(fromPort.lat, fromPort.lng, toPort.lat, toPort.lng, GLOBE_RADIUS)
      const segPoints = curve.getPoints(64)

      // Skip first point of subsequent segments to avoid duplicates
      if (i > 0) segPoints.shift()
      allPoints.push(...segPoints)
    }

    // Midpoint for label positioning
    const midIdx = Math.floor(allPoints.length / 2)
    const midpoint = allPoints[midIdx]?.clone() ?? new THREE.Vector3()
    // Push midpoint slightly outward from globe for label visibility
    midpoint.normalize().multiplyScalar(GLOBE_RADIUS + 0.4)

    return { points: allPoints, midpoint }
  }

  // Watch for route status changes to trigger reroutes
  useEffect(() => {
    const unsub = useSimulationStore.subscribe((state) => {
      const currentStatuses = state.routeStatuses
      const prev = lastStatusesRef.current

      Object.entries(currentStatuses).forEach(([routeId, status]) => {
        // Trigger reroute when a route becomes disrupted
        if (status === 'disrupted' && prev[routeId] !== 'disrupted') {
          const option = rerouteOptions.find((r) => r.originalRouteId === routeId)
          if (!option) return

          const { points, midpoint } = buildReroutePoints(option)
          if (points.length < 2) return

          setActiveReroutes((prev) => {
            // Don't duplicate
            if (prev.some((r) => r.option.originalRouteId === routeId)) return prev
            return [...prev, {
              id: `reroute-${routeId}-${Date.now()}`,
              option,
              points,
              midpoint,
              startTime: performance.now() / 1000,
              drawProgress: 0,
            }]
          })
        }
      })

      lastStatusesRef.current = { ...currentStatuses }
    })

    return unsub
  }, [])

  // Animate draw-on and cleanup expired reroutes
  useFrame(() => {
    const now = performance.now() / 1000
    let needsUpdate = false

    setActiveReroutes((prev) => {
      const next = prev.map((reroute) => {
        const elapsed = now - reroute.startTime
        const drawProgress = Math.min(elapsed / DRAW_DURATION, 1.0)
        if (drawProgress !== reroute.drawProgress) needsUpdate = true
        return { ...reroute, drawProgress }
      }).filter((reroute) => {
        const elapsed = now - reroute.startTime
        return elapsed < DISPLAY_DURATION
      })

      return next.length !== prev.length || needsUpdate ? next : prev
    })
  })

  return (
    <>
      {activeReroutes.map((reroute) => {
        // Compute visible points based on draw progress
        const visibleCount = Math.max(2, Math.floor(reroute.points.length * reroute.drawProgress))
        const visiblePoints = reroute.points.slice(0, visibleCount)

        return (
          <group key={reroute.id}>
            {/* Alternative route line — bright cyan */}
            <Line
              points={visiblePoints}
              color="#19E6C1"
              lineWidth={2.5}
              transparent
              opacity={0.85}
              toneMapped={false}
            />

            {/* Glow line — wider, dimmer */}
            <Line
              points={visiblePoints}
              color="#33D6FF"
              lineWidth={5}
              transparent
              opacity={0.2}
              toneMapped={false}
            />

            {/* Label at midpoint — only show after draw completes */}
            {reroute.drawProgress >= 1.0 && (
              <Html
                position={reroute.midpoint}
                center
                style={{ pointerEvents: 'none' }}
              >
                <div
                  className="px-3 py-1.5 rounded-lg whitespace-nowrap"
                  style={{
                    background: 'rgba(8, 16, 35, 0.92)',
                    border: '1px solid rgba(25, 230, 193, 0.4)',
                    backdropFilter: 'blur(8px)',
                  }}
                >
                  <div className="text-[10px] font-mono tracking-wider" style={{ color: '#19E6C1' }}>
                    {reroute.option.label}
                  </div>
                  <div className="text-[9px] font-mono mt-0.5" style={{ color: 'rgba(255,255,255,0.6)' }}>
                    {reroute.option.savings}
                  </div>
                </div>
              </Html>
            )}
          </group>
        )
      })}
    </>
  )
}
