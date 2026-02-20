import { shaderMaterial } from '@react-three/drei'
import * as THREE from 'three'

const GlobeMaterial = shaderMaterial(
  {
    uTime: 0,
    uEarthMap: new THREE.Texture(),
    uOceanDeep: new THREE.Color('#061428'),
    uOceanMid: new THREE.Color('#0e2e55'),
    uLandColor: new THREE.Color('#0a4858'),
    uGridColor: new THREE.Color('#33D6FF'),
    uFresnelColor: new THREE.Color('#55EEFF'),
    uFresnelPower: 2.0,
    uGridOpacity: 0.10,
    uNoiseScale: 3.0,
    uNoiseStrength: 0.03,
    uSunDirection: new THREE.Vector3(1, 0, 0),
  },
  // Vertex shader
  /* glsl */ `
    varying vec3 vNormal;
    varying vec3 vWorldPosition;
    varying vec2 vUv;

    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      vec4 worldPos = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPos.xyz;
      gl_Position = projectionMatrix * viewMatrix * worldPos;
    }
  `,
  // Fragment shader
  /* glsl */ `
    uniform float uTime;
    uniform sampler2D uEarthMap;
    uniform vec3 uOceanDeep;
    uniform vec3 uOceanMid;
    uniform vec3 uLandColor;
    uniform vec3 uGridColor;
    uniform vec3 uFresnelColor;
    uniform float uFresnelPower;
    uniform float uGridOpacity;
    uniform float uNoiseScale;
    uniform float uNoiseStrength;
    uniform vec3 uSunDirection;

    varying vec3 vNormal;
    varying vec3 vWorldPosition;
    varying vec2 vUv;

    // Simplex noise
    vec3 mod289(vec3 x) { return x - floor(x / 289.0) * 289.0; }
    vec4 mod289(vec4 x) { return x - floor(x / 289.0) * 289.0; }
    vec4 permute(vec4 x) { return mod289((x * 34.0 + 1.0) * x); }
    vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

    float snoise(vec3 v) {
      const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
      const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
      vec3 i = floor(v + dot(v, C.yyy));
      vec3 x0 = v - i + dot(i, C.xxx);
      vec3 g = step(x0.yzx, x0.xyz);
      vec3 l = 1.0 - g;
      vec3 i1 = min(g.xyz, l.zxy);
      vec3 i2 = max(g.xyz, l.zxy);
      vec3 x1 = x0 - i1 + C.xxx;
      vec3 x2 = x0 - i2 + C.yyy;
      vec3 x3 = x0 - D.yyy;
      i = mod289(i);
      vec4 p = permute(permute(permute(
        i.z + vec4(0.0, i1.z, i2.z, 1.0))
        + i.y + vec4(0.0, i1.y, i2.y, 1.0))
        + i.x + vec4(0.0, i1.x, i2.x, 1.0));
      float n_ = 0.142857142857;
      vec3 ns = n_ * D.wyz - D.xzx;
      vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
      vec4 x_ = floor(j * ns.z);
      vec4 y_ = floor(j - 7.0 * x_);
      vec4 x = x_ * ns.x + ns.yyyy;
      vec4 y = y_ * ns.x + ns.yyyy;
      vec4 h = 1.0 - abs(x) - abs(y);
      vec4 b0 = vec4(x.xy, y.xy);
      vec4 b1 = vec4(x.zw, y.zw);
      vec4 s0 = floor(b0) * 2.0 + 1.0;
      vec4 s1 = floor(b1) * 2.0 + 1.0;
      vec4 sh = -step(h, vec4(0.0));
      vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
      vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
      vec3 p0 = vec3(a0.xy, h.x);
      vec3 p1 = vec3(a0.zw, h.y);
      vec3 p2 = vec3(a1.xy, h.z);
      vec3 p3 = vec3(a1.zw, h.w);
      vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
      p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
      vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
      m = m * m;
      return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
    }

    void main() {
      vec3 worldDir = normalize(vWorldPosition);

      // 1. Ocean gradient (latitude-based)
      float lat = asin(clamp(worldDir.y, -1.0, 1.0));
      float latFactor = smoothstep(-1.2, 0.4, lat);
      vec3 ocean = mix(uOceanDeep, uOceanMid, latFactor);

      // 2. Sample earth texture for land/ocean mask
      vec3 earthTex = texture2D(uEarthMap, vUv).rgb;
      float landMask = dot(earthTex, vec3(0.299, 0.587, 0.114));
      float land = smoothstep(0.18, 0.42, landMask);

      // Blend ocean and land
      vec3 base = mix(ocean, uLandColor, land);

      // Land inner glow — continents emit a soft cyan luminance
      vec3 landGlow = vec3(0.1, 0.65, 0.7) * land * 0.35;
      base += landGlow;

      // Bright neon coastline edge (the signature look)
      float coastInner = smoothstep(0.12, 0.20, landMask);
      float coastOuter = 1.0 - smoothstep(0.20, 0.35, landMask);
      float coastline = coastInner * coastOuter;
      base += uGridColor * coastline * 0.55;

      // 3. Lat/Lng grid — subtle, only on ocean so continents stay clean
      float latAngle = lat;
      float lngAngle = atan(worldDir.z, worldDir.x);

      float latLine = 1.0 - smoothstep(0.0, 0.025, abs(sin(latAngle * 18.0)));
      float lngLine = 1.0 - smoothstep(0.0, 0.025, abs(sin(lngAngle * 18.0)));
      float grid = max(latLine, lngLine) * uGridOpacity;

      // Grid mostly on ocean, faint over land
      grid *= mix(1.0, 0.15, land);

      // 4. Simplex noise for surface variation
      float noise = snoise(worldDir * uNoiseScale + uTime * 0.02) * uNoiseStrength;

      // 5. Fresnel rim glow — wide, bright cyan edge
      vec3 viewDir = normalize(cameraPosition - vWorldPosition);
      float fresnel = pow(1.0 - max(dot(vNormal, viewDir), 0.0), uFresnelPower);

      // Compose
      vec3 color = base + noise;
      color += uGridColor * grid * 0.6;
      color += uFresnelColor * fresnel * 0.9;

      // Day/Night terminator — gentle (night side still fairly visible)
      float sunDot = dot(worldDir, uSunDirection);
      float dayFactor = smoothstep(-0.15, 0.15, sunDot);
      color *= 0.55 + 0.45 * dayFactor;

      // Bright city lights on night side
      float nightIntensity = 1.0 - dayFactor;
      if (nightIntensity > 0.1 && land > 0.3) {
        float cityNoise = snoise(worldDir * 40.0);
        float cityDots = smoothstep(0.48, 0.60, cityNoise) * land * nightIntensity;
        color += vec3(1.0, 0.85, 0.5) * cityDots * 0.8;
      }

      gl_FragColor = vec4(color, 1.0);
    }
  `
)

// Extend R3F JSX
import type { ThreeElement } from '@react-three/fiber'

declare global {
  namespace React {
    namespace JSX {
      interface IntrinsicElements {
        globeMaterial: ThreeElement<typeof GlobeMaterial>
      }
    }
  }
}

export default GlobeMaterial
