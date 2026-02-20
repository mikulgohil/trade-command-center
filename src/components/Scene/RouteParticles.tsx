'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { routes, type RouteImportance, type RouteStatus } from '@/data/routes'
import { ports } from '@/data/ports'
import { createRouteCurve } from '@/lib/greatCircle'
import { GLOBE_RADIUS, PARTICLE_BASE_SIZE, PARTICLE_SPEED_MIN, PARTICLE_SPEED_MAX } from '@/lib/constants'
import { useSimulationStore } from '@/state/useSimulationStore'

const PARTICLES_PER_IMPORTANCE: Record<RouteImportance, number> = {
  high: 24,
  medium: 16,
  low: 10,
}

const STATUS_COLORS: Record<RouteStatus, THREE.Color> = {
  normal: new THREE.Color('#33D6FF'),
  congested: new THREE.Color('#FFB020'),
  disrupted: new THREE.Color('#FF4D6D'),
}

interface ParticleData {
  routeIndex: number
  progress: number
  speed: number
  curve: THREE.CatmullRomCurve3
}

const tempMatrix = new THREE.Matrix4()
const tempVec = new THREE.Vector3()
const tempColor = new THREE.Color()

export default function RouteParticles() {
  const meshRef = useRef<THREE.InstancedMesh>(null)

  // Build particle data array and route curves
  const { particles, totalCount } = useMemo(() => {
    const particleList: ParticleData[] = []

    routes.forEach((route, routeIndex) => {
      const fromPort = ports.find((p) => p.id === route.fromPortId)
      const toPort = ports.find((p) => p.id === route.toPortId)
      if (!fromPort || !toPort) return

      const curve = createRouteCurve(
        fromPort.lat, fromPort.lng,
        toPort.lat, toPort.lng,
        GLOBE_RADIUS
      )

      const count = PARTICLES_PER_IMPORTANCE[route.importance]
      const speedRange = PARTICLE_SPEED_MAX - PARTICLE_SPEED_MIN

      for (let i = 0; i < count; i++) {
        particleList.push({
          routeIndex,
          progress: Math.random(), // stagger initial positions
          speed: PARTICLE_SPEED_MIN + Math.random() * speedRange,
          curve,
        })
      }
    })

    return { particles: particleList, totalCount: particleList.length }
  }, [])

  // Animate particles along their curves
  useFrame((_, delta) => {
    if (!meshRef.current) return

    // Read store once per frame (not per particle)
    const storeStatuses = useSimulationStore.getState().routeStatuses

    particles.forEach((particle, i) => {
      // Advance progress
      particle.progress += particle.speed * delta
      if (particle.progress > 1) particle.progress -= 1

      // Sample position from curve
      particle.curve.getPointAt(particle.progress, tempVec)

      // Write transform
      tempMatrix.makeTranslation(tempVec.x, tempVec.y, tempVec.z)
      tempMatrix.scale(tempVec.set(PARTICLE_BASE_SIZE, PARTICLE_BASE_SIZE, PARTICLE_BASE_SIZE))
      meshRef.current!.setMatrixAt(i, tempMatrix)

      // Set color based on route status
      const route = routes[particle.routeIndex]
      const status = storeStatuses[route.id] ?? route.status
      tempColor.copy(STATUS_COLORS[status])
      meshRef.current!.setColorAt(i, tempColor)
    })

    meshRef.current.instanceMatrix.needsUpdate = true
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true
  })

  if (totalCount === 0) return null

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, totalCount]}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshBasicMaterial toneMapped={false} transparent opacity={0.9} />
    </instancedMesh>
  )
}
