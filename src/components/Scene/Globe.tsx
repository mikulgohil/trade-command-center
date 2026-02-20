'use client'

import { useRef } from 'react'
import { useFrame, extend } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'
import GlobeMaterial from './GlobeMaterial'
import { GLOBE_RADIUS, GLOBE_SEGMENTS } from '@/lib/constants'

extend({ GlobeMaterial })

const sunDir = new THREE.Vector3()

/**
 * Approximate sun direction from current UTC time.
 * The sun's longitude ≈ -15 degrees per hour from noon at Greenwich.
 * Declination approximated by a simple sine over the year.
 */
function getSunDirection(date: Date): THREE.Vector3 {
  const hours = date.getUTCHours() + date.getUTCMinutes() / 60
  // Sun longitude: noon at Greenwich = 0, each hour = 15 degrees
  const sunLng = ((12 - hours) / 24) * Math.PI * 2

  // Approximate declination (-23.4° to +23.4° over the year)
  const dayOfYear = Math.floor(
    (date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000
  )
  const declination = (23.44 * Math.PI / 180) * Math.sin(((dayOfYear - 81) / 365) * Math.PI * 2)

  // Convert to cartesian (matching globe coordinate system)
  sunDir.set(
    Math.cos(declination) * Math.cos(sunLng),
    Math.sin(declination),
    -Math.cos(declination) * Math.sin(sunLng)
  )
  return sunDir.normalize()
}

export default function Globe() {
  const materialRef = useRef<THREE.ShaderMaterial>(null)
  const earthMap = useTexture('/textures/earth-dark.jpg')

  useFrame((_, delta) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value += delta
      // Update sun direction (changes very slowly, but keep in sync)
      getSunDirection(new Date())
      materialRef.current.uniforms.uSunDirection.value.copy(sunDir)
    }
  })

  return (
    <mesh>
      <sphereGeometry args={[GLOBE_RADIUS, GLOBE_SEGMENTS, GLOBE_SEGMENTS]} />
      <globeMaterial ref={materialRef} transparent={false} uEarthMap={earthMap} />
    </mesh>
  )
}
