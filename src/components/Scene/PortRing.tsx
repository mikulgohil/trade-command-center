'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface PortRingProps {
  position: THREE.Vector3
}

export default function PortRing({ position }: PortRingProps) {
  const ringRef = useRef<THREE.Mesh>(null)
  const materialRef = useRef<THREE.MeshBasicMaterial>(null)

  useFrame(({ clock }) => {
    if (!ringRef.current || !materialRef.current) return

    // Pulse scale: 1.0 → 1.8 over 1.2s loop
    const t = (clock.elapsedTime % 1.2) / 1.2
    const scale = 1.0 + 0.8 * t
    ringRef.current.scale.setScalar(scale)

    // Fade opacity as ring expands
    materialRef.current.opacity = 1.0 - t

    // Billboard: always face camera
    ringRef.current.lookAt(ringRef.current.position.clone().multiplyScalar(2))
  })

  return (
    <mesh ref={ringRef} position={position}>
      <ringGeometry args={[0.06, 0.08, 32]} />
      <meshBasicMaterial
        ref={materialRef}
        color="#33D6FF"
        transparent
        opacity={1}
        side={THREE.DoubleSide}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </mesh>
  )
}
