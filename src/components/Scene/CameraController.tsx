'use client'

import { useRef, useEffect, type ComponentRef } from 'react'
import { OrbitControls } from '@react-three/drei'
import { useIdleTimer } from '@/hooks/useIdleTimer'
import { useAutopilotStore } from '@/state/useAutopilotStore'
import {
  ORBIT_MIN_DISTANCE,
  ORBIT_MAX_DISTANCE,
  ORBIT_DAMPING,
  ORBIT_ROTATE_SPEED,
  AUTO_ROTATE_SPEED,
  IDLE_TIMEOUT_MS,
} from '@/lib/constants'

export default function CameraController() {
  const controlsRef = useRef<ComponentRef<typeof OrbitControls>>(null)
  const isIdle = useIdleTimer(IDLE_TIMEOUT_MS)
  const isAutopilotActive = useAutopilotStore((s) => s.isActive)

  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = isIdle && !isAutopilotActive
    }
  }, [isIdle, isAutopilotActive])

  return (
    <OrbitControls
      ref={controlsRef}
      enabled={!isAutopilotActive}
      enablePan={false}
      minDistance={ORBIT_MIN_DISTANCE}
      maxDistance={ORBIT_MAX_DISTANCE}
      dampingFactor={ORBIT_DAMPING}
      rotateSpeed={ORBIT_ROTATE_SPEED}
      autoRotate
      autoRotateSpeed={AUTO_ROTATE_SPEED}
      enableDamping
    />
  )
}
