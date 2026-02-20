'use client'

import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import Globe from './Globe'
import Atmosphere from './Atmosphere'
import CloudLayer from './CloudLayer'
import Lighting from './Lighting'
import CameraController from './CameraController'
import Ports from './Ports'
import PortCapacityRings from './PortCapacityRings'
import Routes from './Routes'
import RouteParticles from './RouteParticles'
import DepthParticles from './DepthParticles'
import Starfield from './Starfield'
import PerformanceMonitor from './PerformanceMonitor'
import DisruptionShockwave from './DisruptionShockwave'
import SmartReroute from './SmartReroute'
import PredictiveAlerts from './PredictiveAlerts'
import HexGridOverlay from './HexGridOverlay'
import GlobeElevation from './GlobeElevation'
import VesselIcons from './VesselIcons'
import WeatherLayer from './WeatherLayer'
import PortTooltip from '@/components/UI/PortTooltip'
import AutopilotController from '@/components/Autopilot/AutopilotController'
import { CAMERA_FOV, CAMERA_NEAR, CAMERA_FAR, CAMERA_DEFAULT_POSITION } from '@/lib/constants'

export default function SceneCanvas() {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{
        fov: CAMERA_FOV,
        near: CAMERA_NEAR,
        far: CAMERA_FAR,
        position: CAMERA_DEFAULT_POSITION,
      }}
      gl={{
        antialias: true,
        preserveDrawingBuffer: false,
        toneMapping: 0, // NoToneMapping — we handle brightness manually
      }}
      style={{ position: 'absolute', inset: 0 }}
    >
      <color attach="background" args={['#020810']} />
      <Suspense fallback={null}>
        <Starfield />
        <Lighting />
        <Globe />
        <Atmosphere />
        <CloudLayer />
        <GlobeElevation />
        <HexGridOverlay />
        <DepthParticles />
        <WeatherLayer />
        <Routes />
        <RouteParticles />
        <VesselIcons />
        <Ports />
        <PortCapacityRings />
        <DisruptionShockwave />
        <SmartReroute />
        <PredictiveAlerts />
        <PortTooltip />
        <CameraController />
        <AutopilotController />
        <PerformanceMonitor />
      </Suspense>
    </Canvas>
  )
}
