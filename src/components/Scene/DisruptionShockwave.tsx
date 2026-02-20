'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useSimulationStore } from '@/state/useSimulationStore'
import { ports } from '@/data/ports'
import { routes } from '@/data/routes'
import { latLngToVector3 } from '@/lib/latLngToVector3'
import { GLOBE_RADIUS } from '@/lib/constants'

interface ShockwaveRing {
  id: string
  position: THREE.Vector3
  normal: THREE.Vector3
  startTime: number
  ringIndex: number // 0, 1, 2 for staggered rings
}

const RING_COUNT = 3
const RING_STAGGER = 0.2 // seconds between each ring
const RING_DURATION = 1.5 // seconds per ring
const MAX_SCALE = 0.8
const SURFACE_OFFSET = 0.04

const ringGeo = new THREE.RingGeometry(0.08, 0.12, 48)
const ringMat = new THREE.MeshBasicMaterial({
  color: new THREE.Color('#FF4D6D'),
  transparent: true,
  opacity: 1.0,
  side: THREE.DoubleSide,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
  toneMapped: false,
})

export default function DisruptionShockwave() {
  const [rings, setRings] = useState<ShockwaveRing[]>([])
  const meshRefs = useRef<Map<string, THREE.Mesh>>(new Map())
  const lastEventCount = useRef(0)

  // Listen for critical/warning events and spawn shockwaves
  useEffect(() => {
    const unsub = useSimulationStore.subscribe((state) => {
      const eventCount = state.events.length
      if (eventCount <= lastEventCount.current) {
        lastEventCount.current = eventCount
        return
      }

      // Check latest event
      const latest = state.events[0]
      lastEventCount.current = eventCount

      if (!latest || (latest.severity !== 'critical' && latest.severity !== 'warning')) return

      // Find position: use portId or routeId to locate the disruption
      let position: THREE.Vector3 | null = null

      if (latest.portId) {
        const port = ports.find((p) => p.id === latest.portId)
        if (port) {
          position = latLngToVector3(port.lat, port.lng, GLOBE_RADIUS + SURFACE_OFFSET)
        }
      } else if (latest.routeId) {
        // Use the midpoint or origin of the route
        const route = routes.find((r) => r.id === latest.routeId)
        if (route) {
          const fromPort = ports.find((p) => p.id === route.fromPortId)
          if (fromPort) {
            position = latLngToVector3(fromPort.lat, fromPort.lng, GLOBE_RADIUS + SURFACE_OFFSET)
          }
        }
      }

      if (!position) return

      const normal = position.clone().normalize()
      const now = performance.now() / 1000

      const newRings: ShockwaveRing[] = []
      for (let i = 0; i < RING_COUNT; i++) {
        newRings.push({
          id: `${latest.id}-ring-${i}`,
          position: position.clone(),
          normal: normal.clone(),
          startTime: now + i * RING_STAGGER,
          ringIndex: i,
        })
      }

      setRings((prev) => [...prev, ...newRings])
    })

    return unsub
  }, [])

  // Animate rings each frame
  useFrame(() => {
    const now = performance.now() / 1000
    const expired: string[] = []

    rings.forEach((ring) => {
      const mesh = meshRefs.current.get(ring.id)
      if (!mesh) return

      const elapsed = now - ring.startTime
      if (elapsed < 0) {
        // Not started yet (staggered)
        mesh.visible = false
        return
      }

      const t = elapsed / RING_DURATION
      if (t > 1.0) {
        expired.push(ring.id)
        mesh.visible = false
        return
      }

      mesh.visible = true
      const scale = 1 + t * MAX_SCALE / 0.12 // scale relative to ring base size
      mesh.scale.set(scale, scale, 1)
      const mat = mesh.material as THREE.MeshBasicMaterial
      mat.opacity = (1 - t) * (ring.ringIndex === 0 ? 0.9 : 0.5)
    })

    // Clean up expired rings
    if (expired.length > 0) {
      setRings((prev) => prev.filter((r) => !expired.includes(r.id)))
      expired.forEach((id) => meshRefs.current.delete(id))
    }
  })

  const setMeshRef = useCallback((id: string) => (el: THREE.Mesh | null) => {
    if (el) {
      meshRefs.current.set(id, el)
    }
  }, [])

  return (
    <>
      {rings.map((ring) => {
        // Orient ring to face away from globe center
        const quaternion = new THREE.Quaternion()
        const up = new THREE.Vector3(0, 0, 1)
        quaternion.setFromUnitVectors(up, ring.normal)

        return (
          <mesh
            key={ring.id}
            ref={setMeshRef(ring.id)}
            position={ring.position}
            quaternion={quaternion}
            geometry={ringGeo}
            material={ringMat.clone()}
            visible={false}
          />
        )
      })}
    </>
  )
}
