'use client'

import { useMemo } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { ports } from '@/data/ports'
import { latLngToVector3 } from '@/lib/latLngToVector3'
import { useSelectionStore } from '@/state/useSelectionStore'
import { GLOBE_RADIUS, PORT_SURFACE_OFFSET } from '@/lib/constants'

export default function PortTooltip() {
  const hoveredPortId = useSelectionStore((s) => s.hoveredPortId)
  const port = ports.find((p) => p.id === hoveredPortId)

  const position = useMemo(() => {
    if (!port) return new THREE.Vector3()
    return latLngToVector3(port.lat, port.lng, GLOBE_RADIUS + PORT_SURFACE_OFFSET + 0.08)
  }, [port])

  if (!port) return null

  return (
    <Html
      position={position}
      center
      distanceFactor={18}
      style={{
        pointerEvents: 'none',
        transition: 'opacity 120ms ease-out',
      }}
    >
      <div
        className="whitespace-nowrap pointer-events-none px-2 py-1"
        style={{
          background: 'rgba(8, 16, 35, 0.92)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '6px',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)',
        }}
      >
        <p className="text-[10px] font-semibold text-text-primary leading-tight">{port.name}</p>
        <p className="text-[9px] text-text-secondary leading-tight">{port.country}</p>
      </div>
    </Html>
  )
}
