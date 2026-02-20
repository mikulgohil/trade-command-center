'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { routes } from '@/data/routes'
import { ports } from '@/data/ports'
import { createRouteCurve } from '@/lib/greatCircle'
import { useSimulationStore } from '@/state/useSimulationStore'
import { GLOBE_RADIUS } from '@/lib/constants'

const STATUS_COLORS = {
  normal: new THREE.Color('#33D6FF'),
  congested: new THREE.Color('#FFB020'),
  disrupted: new THREE.Color('#FF4D6D'),
}

const VESSELS_PER_ROUTE = 2
const VESSEL_SIZE = 0.03
const VESSEL_SPEED = 0.06 // base speed along curve t (0-1)

interface VesselData {
  routeId: string
  curve: THREE.CatmullRomCurve3
  t: number // position along curve [0,1]
  speed: number
}

// Create a simple ship-like shape from triangles
function createShipGeometry(): THREE.BufferGeometry {
  const shape = new THREE.Shape()
  // Simple diamond/arrow shape
  shape.moveTo(0, VESSEL_SIZE)
  shape.lineTo(VESSEL_SIZE * 0.5, -VESSEL_SIZE * 0.3)
  shape.lineTo(0, -VESSEL_SIZE * 0.1)
  shape.lineTo(-VESSEL_SIZE * 0.5, -VESSEL_SIZE * 0.3)
  shape.closePath()
  const geo = new THREE.ShapeGeometry(shape)
  return geo
}

const tempVec = new THREE.Vector3()
const tempMatrix = new THREE.Matrix4()
const tempQuat = new THREE.Quaternion()
const tempColor = new THREE.Color()
const up = new THREE.Vector3(0, 1, 0)

export default function VesselIcons() {
  const meshRef = useRef<THREE.InstancedMesh>(null)

  // Build vessel data
  const vessels = useMemo(() => {
    const result: VesselData[] = []

    routes.forEach((route) => {
      const fromPort = ports.find((p) => p.id === route.fromPortId)
      const toPort = ports.find((p) => p.id === route.toPortId)
      if (!fromPort || !toPort) return

      const curve = createRouteCurve(
        fromPort.lat, fromPort.lng,
        toPort.lat, toPort.lng,
        GLOBE_RADIUS
      )

      for (let i = 0; i < VESSELS_PER_ROUTE; i++) {
        const baseSpeed = VESSEL_SPEED * (0.8 + Math.random() * 0.4)
        result.push({
          routeId: route.id,
          curve,
          t: i / VESSELS_PER_ROUTE + Math.random() * 0.1,
          speed: route.importance === 'high' ? baseSpeed * 1.2 : baseSpeed,
        })
      }
    })

    return result
  }, [])

  const totalVessels = vessels.length

  useFrame((_, delta) => {
    if (!meshRef.current) return
    const routeStatuses = useSimulationStore.getState().routeStatuses

    vessels.forEach((vessel, i) => {
      // Update position along curve
      vessel.t = (vessel.t + vessel.speed * delta) % 1.0

      // Get position and tangent
      const pos = vessel.curve.getPointAt(vessel.t)
      const tangent = vessel.curve.getTangentAt(vessel.t)

      // Normal from globe center
      const normal = pos.clone().normalize()

      // Build rotation: ship faces along tangent, oriented to globe surface
      const lookDir = tangent.clone()
      // Project tangent onto surface plane
      lookDir.sub(normal.clone().multiplyScalar(lookDir.dot(normal))).normalize()

      tempMatrix.identity()
      tempMatrix.makeTranslation(pos.x, pos.y, pos.z)

      // Slight Y-axis wobble for "floating at sea" effect
      const wobble = Math.sin(vessel.t * Math.PI * 4 + i) * 0.002
      pos.add(normal.clone().multiplyScalar(wobble))

      tempMatrix.lookAt(pos, pos.clone().add(lookDir), normal)
      tempMatrix.setPosition(pos)

      // Scale
      const s = 1.0
      tempMatrix.scale(tempVec.set(s, s, s))

      meshRef.current!.setMatrixAt(i, tempMatrix)

      // Color based on route status
      const status = routeStatuses[vessel.routeId] ?? 'normal'
      tempColor.copy(STATUS_COLORS[status])
      meshRef.current!.setColorAt(i, tempColor)
    })

    meshRef.current.instanceMatrix.needsUpdate = true
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true
  })

  const geometry = useMemo(() => createShipGeometry(), [])

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, undefined, totalVessels]}
    >
      <meshBasicMaterial
        toneMapped={false}
        transparent
        opacity={0.8}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </instancedMesh>
  )
}
