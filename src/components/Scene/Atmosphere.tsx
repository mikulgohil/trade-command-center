'use client'

import * as THREE from 'three'
import { ATMOSPHERE_RADIUS } from '@/lib/constants'

export default function Atmosphere() {
  return (
    <mesh>
      <sphereGeometry args={[ATMOSPHERE_RADIUS, 64, 64]} />
      <meshBasicMaterial
        color="#33D6FF"
        transparent
        opacity={0.18}
        blending={THREE.AdditiveBlending}
        side={THREE.BackSide}
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  )
}
