'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { ports } from '@/data/ports'
import { latLngToVector3 } from '@/lib/latLngToVector3'
import { useSimulationStore } from '@/state/useSimulationStore'
import { GLOBE_RADIUS, PORT_SURFACE_OFFSET } from '@/lib/constants'

const RING_INNER = 0.055
const RING_OUTER = 0.07
const RING_SEGMENTS = 48
// Full ring index count: segments * phiSegments * 2 triangles * 3 indices
const FULL_INDEX_COUNT = RING_SEGMENTS * 1 * 2 * 3

function getCapacityColor(capacity: number): THREE.Color {
  if (capacity > 90) return new THREE.Color('#FF4D6D')   // red — critical
  if (capacity > 70) return new THREE.Color('#FFB020')   // amber — warning
  return new THREE.Color('#3DFF88')                       // green — healthy
}

interface RingData {
  position: THREE.Vector3
  normal: THREE.Vector3
  portId: string
  baseCapacity: number
}

export default function PortCapacityRings() {
  const groupRef = useRef<THREE.Group>(null)
  const ringsRef = useRef<THREE.Mesh[]>([])
  const materialsRef = useRef<THREE.MeshBasicMaterial[]>([])

  const ringData: RingData[] = useMemo(() => {
    return ports.map((port) => {
      const pos = latLngToVector3(port.lat, port.lng, GLOBE_RADIUS + PORT_SURFACE_OFFSET + 0.005)
      const normal = pos.clone().normalize()
      return {
        position: pos,
        normal,
        portId: port.id,
        baseCapacity: port.congestionIndex,
      }
    })
  }, [])

  useFrame(({ clock }) => {
    const kpis = useSimulationStore.getState().kpis
    const t = clock.elapsedTime

    ringData.forEach((data, i) => {
      const mesh = ringsRef.current[i]
      const material = materialsRef.current[i]
      if (!mesh || !material) return

      // Simulate per-port capacity with slight drift from global congestion
      const globalCongestion = kpis?.congestion ?? 30
      const capacity = Math.min(
        data.baseCapacity + (globalCongestion - 30) * 0.3 + Math.sin(t * 0.5 + i * 1.7) * 3,
        100
      )

      // Use drawRange to show partial arc — no geometry re-creation needed
      const indexCount = Math.round((capacity / 100) * FULL_INDEX_COUNT)
      mesh.geometry.setDrawRange(0, indexCount)

      // Update color
      const color = getCapacityColor(capacity)
      material.color.copy(color)

      // Pulse opacity when critical (>90%)
      if (capacity > 90) {
        material.opacity = 0.7 + Math.sin(t * 4) * 0.3
      } else {
        material.opacity = 0.6
      }

      // Orient ring to face outward from globe
      mesh.lookAt(data.position.clone().multiplyScalar(2))
    })
  })

  return (
    <group ref={groupRef}>
      {ringData.map((data, i) => (
        <mesh
          key={data.portId}
          ref={(el) => { if (el) ringsRef.current[i] = el }}
          position={data.position}
        >
          <ringGeometry args={[RING_INNER, RING_OUTER, RING_SEGMENTS, 1, 0, Math.PI * 2]} />
          <meshBasicMaterial
            ref={(el) => { if (el) materialsRef.current[i] = el }}
            color="#3DFF88"
            transparent
            opacity={0.6}
            side={THREE.DoubleSide}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  )
}
