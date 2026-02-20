'use client'

import { useRef } from 'react'
import { useFrame, extend } from '@react-three/fiber'
import { useTexture, shaderMaterial } from '@react-three/drei'
import * as THREE from 'three'
import { GLOBE_RADIUS, GLOBE_SEGMENTS } from '@/lib/constants'

/**
 * Terrain elevation layer — renders a wireframe-like displaced sphere
 * that gives the globe a subtle 3D terrain feel.
 * Uses the earth texture as a height map: brighter pixels = land = higher elevation.
 */

const ElevationMaterial = shaderMaterial(
  {
    uEarthMap: new THREE.Texture(),
    uDisplacement: 0.04,
    uColor: new THREE.Color('#1a3a4a'),
    uOpacity: 0.15,
  },
  // Vertex shader — displace along normal based on texture brightness
  /* glsl */ `
    uniform sampler2D uEarthMap;
    uniform float uDisplacement;

    varying vec3 vNormal;
    varying vec3 vWorldPosition;
    varying float vElevation;

    void main() {
      vNormal = normalize(normalMatrix * normal);

      // Sample earth texture for elevation
      vec3 tex = texture2D(uEarthMap, uv).rgb;
      float height = dot(tex, vec3(0.299, 0.587, 0.114));

      // Only displace land areas (brightness > threshold)
      float landMask = smoothstep(0.18, 0.5, height);
      float displacement = landMask * uDisplacement;
      vElevation = landMask;

      vec3 displaced = position + normal * displacement;
      vec4 worldPos = modelMatrix * vec4(displaced, 1.0);
      vWorldPosition = worldPos.xyz;
      gl_Position = projectionMatrix * viewMatrix * worldPos;
    }
  `,
  // Fragment shader — subtle wireframe-ish terrain lines
  /* glsl */ `
    uniform vec3 uColor;
    uniform float uOpacity;

    varying vec3 vNormal;
    varying vec3 vWorldPosition;
    varying float vElevation;

    void main() {
      vec3 viewDir = normalize(cameraPosition - vWorldPosition);
      float fresnel = pow(1.0 - max(dot(vNormal, viewDir), 0.0), 3.0);

      // Only show terrain on elevated (land) areas
      float alpha = vElevation * uOpacity * (0.3 + fresnel * 0.7);

      // Slight color shift for higher elevation
      vec3 col = mix(uColor, uColor * 1.5, vElevation * 0.5);

      gl_FragColor = vec4(col, alpha);
    }
  `
)

extend({ ElevationMaterial })

import type { ThreeElement } from '@react-three/fiber'
declare global {
  namespace React {
    namespace JSX {
      interface IntrinsicElements {
        elevationMaterial: ThreeElement<typeof ElevationMaterial>
      }
    }
  }
}

const ELEVATION_RADIUS = GLOBE_RADIUS + 0.005

export default function GlobeElevation() {
  const matRef = useRef<THREE.ShaderMaterial>(null)
  const earthMap = useTexture('/textures/earth-dark.jpg')

  return (
    <mesh>
      <sphereGeometry args={[ELEVATION_RADIUS, GLOBE_SEGMENTS, GLOBE_SEGMENTS]} />
      <elevationMaterial
        ref={matRef}
        transparent
        depthWrite={false}
        side={THREE.FrontSide}
        uEarthMap={earthMap}
      />
    </mesh>
  )
}
