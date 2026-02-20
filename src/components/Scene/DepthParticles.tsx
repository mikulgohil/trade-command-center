'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const PARTICLE_COUNT = 200
const SPREAD = 20
const DRIFT_SPEED = 0.003

export default function DepthParticles() {
  const pointsRef = useRef<THREE.Points>(null)

  const positions = useMemo(() => {
    const arr = new Float32Array(PARTICLE_COUNT * 3)
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      arr[i * 3] = (Math.random() - 0.5) * SPREAD
      arr[i * 3 + 1] = (Math.random() - 0.5) * SPREAD
      arr[i * 3 + 2] = (Math.random() - 0.5) * SPREAD
    }
    return arr
  }, [])

  useFrame((_, delta) => {
    if (!pointsRef.current) return
    const pos = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute
    const arr = pos.array as Float32Array

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      // Gentle upward drift
      arr[i * 3 + 1] += DRIFT_SPEED * delta * 60
      // Wrap around
      if (arr[i * 3 + 1] > SPREAD / 2) {
        arr[i * 3 + 1] = -SPREAD / 2
      }
    }
    pos.needsUpdate = true
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        color="#33D6FF"
        transparent
        opacity={0.15}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  )
}
