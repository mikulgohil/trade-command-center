'use client'

import { useRef, useState, useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { latLngToVector3 } from '@/lib/latLngToVector3'
import { GLOBE_RADIUS } from '@/lib/constants'

interface WeatherSystem {
  id: string
  type: 'storm' | 'fog' | 'wind'
  lat: number
  lng: number
  intensity: number // 0-1
  radius: number // visual radius
  rotation: number // current rotation
  lifetime: number // remaining seconds
}

// Pre-defined weather zones that cycle through
const WEATHER_ZONES = [
  { lat: 25, lng: 150, type: 'storm' as const, intensity: 0.8, radius: 0.15 },
  { lat: 10, lng: -30, type: 'storm' as const, intensity: 0.6, radius: 0.12 },
  { lat: 45, lng: -50, type: 'fog' as const, intensity: 0.4, radius: 0.2 },
  { lat: -30, lng: 80, type: 'wind' as const, intensity: 0.5, radius: 0.1 },
  { lat: 35, lng: 140, type: 'storm' as const, intensity: 0.7, radius: 0.14 },
  { lat: -15, lng: -70, type: 'fog' as const, intensity: 0.3, radius: 0.18 },
  { lat: 50, lng: -10, type: 'wind' as const, intensity: 0.4, radius: 0.11 },
]

const SPAWN_INTERVAL = 20000 // ms between spawning new weather
const STORM_COLOR = new THREE.Color('#FF6B6B')
const FOG_COLOR = new THREE.Color('#8899AA')
const WIND_COLOR = new THREE.Color('#FFB020')

function getWeatherColor(type: WeatherSystem['type']): THREE.Color {
  switch (type) {
    case 'storm': return STORM_COLOR
    case 'fog': return FOG_COLOR
    case 'wind': return WIND_COLOR
  }
}

// Create spiral geometry for storms
function createSpiralGeometry(): THREE.BufferGeometry {
  const points: number[] = []
  const arms = 3
  const pointsPerArm = 20

  for (let arm = 0; arm < arms; arm++) {
    const armOffset = (arm / arms) * Math.PI * 2
    for (let i = 0; i < pointsPerArm; i++) {
      const t = i / pointsPerArm
      const angle = armOffset + t * Math.PI * 3
      const r = t * 0.12
      points.push(Math.cos(angle) * r, Math.sin(angle) * r, 0)
    }
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3))
  return geometry
}

const spiralGeo = createSpiralGeometry()

export default function WeatherLayer() {
  const [systems, setSystems] = useState<WeatherSystem[]>([])
  const groupRef = useRef<THREE.Group>(null)
  const meshRefs = useRef<Map<string, THREE.Group>>(new Map())

  // Spawn weather systems periodically
  useEffect(() => {
    // Initial spawn
    const initial = WEATHER_ZONES.slice(0, 3).map((zone, i) => ({
      id: `weather-${i}`,
      ...zone,
      rotation: Math.random() * Math.PI * 2,
      lifetime: 30 + Math.random() * 30,
    }))
    setSystems(initial)

    const interval = setInterval(() => {
      setSystems((prev) => {
        if (prev.length >= 5) return prev
        const zone = WEATHER_ZONES[Math.floor(Math.random() * WEATHER_ZONES.length)]
        // Offset position slightly for variety
        const latOffset = (Math.random() - 0.5) * 20
        const lngOffset = (Math.random() - 0.5) * 30
        return [...prev, {
          id: `weather-${Date.now()}`,
          type: zone.type,
          lat: zone.lat + latOffset,
          lng: zone.lng + lngOffset,
          intensity: zone.intensity * (0.8 + Math.random() * 0.4),
          radius: zone.radius * (0.8 + Math.random() * 0.4),
          rotation: Math.random() * Math.PI * 2,
          lifetime: 25 + Math.random() * 35,
        }]
      })
    }, SPAWN_INTERVAL)

    return () => clearInterval(interval)
  }, [])

  // Animate and age weather systems
  useFrame((_, delta) => {
    setSystems((prev) => {
      let changed = false
      const next = prev.map((sys) => {
        const newLifetime = sys.lifetime - delta
        const newRotation = sys.rotation + delta * (sys.type === 'storm' ? 1.2 : 0.3)
        if (newLifetime !== sys.lifetime) changed = true
        return { ...sys, lifetime: newLifetime, rotation: newRotation }
      }).filter((sys) => sys.lifetime > 0)

      if (next.length !== prev.length) changed = true
      return changed ? next : prev
    })
  })

  // Compute positions
  const positions = useMemo(() => {
    const map = new Map<string, { pos: THREE.Vector3; normal: THREE.Vector3 }>()
    systems.forEach((sys) => {
      const pos = latLngToVector3(sys.lat, sys.lng, GLOBE_RADIUS + 0.05)
      const normal = pos.clone().normalize()
      map.set(sys.id, { pos, normal })
    })
    return map
  }, [systems])

  return (
    <group ref={groupRef}>
      {systems.map((sys) => {
        const data = positions.get(sys.id)
        if (!data) return null

        const color = getWeatherColor(sys.type)
        const fadeIn = Math.min(1, (30 + sys.lifetime - sys.lifetime) / 3) // 3s fade in
        const fadeOut = Math.min(1, sys.lifetime / 3) // 3s fade out
        const opacity = sys.intensity * Math.min(fadeIn, fadeOut) * 0.6

        // Orient to face away from globe
        const quaternion = new THREE.Quaternion()
        quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), data.normal)

        return (
          <group key={sys.id} position={data.pos} quaternion={quaternion}>
            {sys.type === 'storm' ? (
              // Storm: rotating spiral
              <group rotation={[0, 0, sys.rotation]}>
                <points geometry={spiralGeo}>
                  <pointsMaterial
                    color={color}
                    size={0.012}
                    transparent
                    opacity={opacity}
                    sizeAttenuation
                    depthWrite={false}
                    blending={THREE.AdditiveBlending}
                    toneMapped={false}
                  />
                </points>
              </group>
            ) : sys.type === 'fog' ? (
              // Fog: translucent disk
              <mesh>
                <circleGeometry args={[sys.radius, 24]} />
                <meshBasicMaterial
                  color={color}
                  transparent
                  opacity={opacity * 0.4}
                  side={THREE.DoubleSide}
                  depthWrite={false}
                  blending={THREE.AdditiveBlending}
                  toneMapped={false}
                />
              </mesh>
            ) : (
              // Wind: animated streak lines
              <group rotation={[0, 0, sys.rotation * 0.3]}>
                {[0, 1, 2].map((j) => {
                  const offset = j * 0.04 - 0.04
                  return (
                    <mesh key={j} position={[0, offset, 0]}>
                      <planeGeometry args={[sys.radius * 1.5, 0.003]} />
                      <meshBasicMaterial
                        color={color}
                        transparent
                        opacity={opacity * (1 - j * 0.25)}
                        side={THREE.DoubleSide}
                        depthWrite={false}
                        blending={THREE.AdditiveBlending}
                        toneMapped={false}
                      />
                    </mesh>
                  )
                })}
              </group>
            )}
          </group>
        )
      })}
    </group>
  )
}
