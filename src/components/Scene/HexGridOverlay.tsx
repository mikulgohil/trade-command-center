'use client'

import { useRef } from 'react'
import { useFrame, extend } from '@react-three/fiber'
import { shaderMaterial } from '@react-three/drei'
import * as THREE from 'three'
import { GLOBE_RADIUS, GLOBE_SEGMENTS } from '@/lib/constants'

const HEX_RADIUS = GLOBE_RADIUS + 0.015 // Just above globe surface

const HexGridMaterial = shaderMaterial(
  {
    uTime: 0,
    uOpacity: 0.12,
    uColor: new THREE.Color('#33D6FF'),
  },
  // Vertex shader
  /* glsl */ `
    varying vec3 vWorldPosition;
    varying vec3 vNormal;

    void main() {
      vNormal = normalize(normalMatrix * normal);
      vec4 worldPos = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPos.xyz;
      gl_Position = projectionMatrix * viewMatrix * worldPos;
    }
  `,
  // Fragment shader — hexagonal grid pattern
  /* glsl */ `
    uniform float uTime;
    uniform float uOpacity;
    uniform vec3 uColor;

    varying vec3 vWorldPosition;
    varying vec3 vNormal;

    // Hex grid function — returns distance to nearest hex edge
    float hexGrid(vec2 p, float scale) {
      p *= scale;
      vec2 h = vec2(1.0, sqrt(3.0));
      vec2 a = mod(p, h) - h * 0.5;
      vec2 b = mod(p - h * 0.5, h) - h * 0.5;
      vec2 gv = length(a) < length(b) ? a : b;
      float d = max(abs(gv.x), abs(gv.y * 0.577350269 + abs(gv.x) * 0.5));
      return d;
    }

    void main() {
      vec3 dir = normalize(vWorldPosition);

      // Convert 3D position to lat/lng for hex grid UV
      float lat = asin(clamp(dir.y, -1.0, 1.0));
      float lng = atan(dir.z, dir.x);

      // Scale correction for latitude compression near poles
      float cosLat = max(cos(lat), 0.01);

      vec2 hexUV = vec2(lng / cosLat, lat) * 5.5;
      float hex = hexGrid(hexUV, 1.0);

      // Edge glow — thin bright edges
      float edge = 1.0 - smoothstep(0.38, 0.44, hex);

      // Subtle fill glow — faint interior
      float fill = (1.0 - smoothstep(0.0, 0.44, hex)) * 0.08;

      // Animated pulse along latitude bands
      float pulse = sin(lat * 12.0 - uTime * 0.5) * 0.5 + 0.5;
      edge *= 0.7 + 0.3 * pulse;

      // Fresnel — stronger at edges for depth
      vec3 viewDir = normalize(cameraPosition - vWorldPosition);
      float fresnel = pow(1.0 - max(dot(vNormal, viewDir), 0.0), 2.5);

      float alpha = (edge + fill) * uOpacity * (0.6 + 0.4 * fresnel);

      // Fade near poles to hide distortion
      float poleFade = smoothstep(0.0, 0.3, abs(cos(lat)));
      alpha *= poleFade;

      gl_FragColor = vec4(uColor, alpha);
    }
  `
)

extend({ HexGridMaterial })

// Type declaration
import type { ThreeElement } from '@react-three/fiber'
declare global {
  namespace React {
    namespace JSX {
      interface IntrinsicElements {
        hexGridMaterial: ThreeElement<typeof HexGridMaterial>
      }
    }
  }
}

export default function HexGridOverlay() {
  const matRef = useRef<THREE.ShaderMaterial>(null)

  useFrame((_, delta) => {
    if (matRef.current) {
      matRef.current.uniforms.uTime.value += delta
    }
  })

  return (
    <mesh>
      <sphereGeometry args={[HEX_RADIUS, GLOBE_SEGMENTS, GLOBE_SEGMENTS]} />
      <hexGridMaterial
        ref={matRef}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        side={THREE.FrontSide}
      />
    </mesh>
  )
}
