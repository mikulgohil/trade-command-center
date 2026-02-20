'use client'

import { useMemo } from 'react'
import * as THREE from 'three'
import { Line } from '@react-three/drei'
import { routes, type RouteStatus } from '@/data/routes'
import { ports } from '@/data/ports'
import { createRouteCurve } from '@/lib/greatCircle'
import { GLOBE_RADIUS } from '@/lib/constants'
import { useSimulationStore } from '@/state/useSimulationStore'
import { useSelectionStore } from '@/state/useSelectionStore'

const STATUS_COLORS: Record<RouteStatus, string> = {
  normal: '#33D6FF',
  congested: '#FFB020',
  disrupted: '#FF4D6D',
}

const STATUS_OPACITY: Record<RouteStatus, number> = {
  normal: 0.2,
  congested: 0.6,
  disrupted: 0.85,
}

// Volume range for normalization
const MAX_VOLUME = 1200

function getLineWidth(volume: number): number {
  const t = volume / MAX_VOLUME
  return 0.6 + t * 2.4 // 0.6 to 3.0
}

function getVolumeOpacityBoost(volume: number): number {
  const t = volume / MAX_VOLUME
  return t * 0.15 // up to +0.15 opacity for high-volume routes
}

export default function Routes() {
  const routeStatuses = useSimulationStore((s) => s.routeStatuses)
  const selectedPortId = useSelectionStore((s) => s.selectedPortId)
  const routeData = useMemo(() => {
    return routes.map((route) => {
      const fromPort = ports.find((p) => p.id === route.fromPortId)
      const toPort = ports.find((p) => p.id === route.toPortId)
      if (!fromPort || !toPort) return null

      const curve = createRouteCurve(
        fromPort.lat, fromPort.lng,
        toPort.lat, toPort.lng,
        GLOBE_RADIUS
      )
      const points = curve.getPoints(128)

      return { route, points, curve }
    }).filter(Boolean) as { route: typeof routes[0]; points: THREE.Vector3[]; curve: THREE.CatmullRomCurve3 }[]
  }, [])

  return (
    <>
      {routeData.map(({ route, points }) => {
        const status = routeStatuses?.[route.id] ?? route.status
        const color = STATUS_COLORS[status]
        const baseOpacity = STATUS_OPACITY[status]
        let opacity = Math.min(baseOpacity + getVolumeOpacityBoost(route.volume), 1.0)
        let lineWidth = getLineWidth(route.volume)

        // Port connection web: highlight connected routes, dim others
        if (selectedPortId) {
          const isConnected = route.fromPortId === selectedPortId || route.toPortId === selectedPortId
          if (isConnected) {
            opacity = Math.min(opacity * 2.5, 1.0)
            lineWidth = Math.min(lineWidth * 1.5, 4.0)
          } else {
            opacity *= 0.08
          }
        }

        return (
          <Line
            key={route.id}
            points={points}
            color={color}
            lineWidth={lineWidth}
            transparent
            opacity={opacity}
            toneMapped={false}
          />
        )
      })}
    </>
  )
}

// Export for particle system
export { routes }
