'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useAutopilotTimeline } from '@/hooks/useAutopilotTimeline'
import { useAutopilotStore } from '@/state/useAutopilotStore'

/**
 * Mounts inside the R3F Canvas. Runs the autopilot timeline on mount,
 * reads GSAP proxy values in useFrame to drive camera + globe scale,
 * and listens for user interaction to interrupt.
 */
export default function AutopilotController() {
  const { camera, scene, gl } = useThree()
  const { proxyRef, buildAndPlay, kill } = useAutopilotTimeline()
  const globeMeshRef = useRef<THREE.Mesh | null>(null)
  const isActive = useAutopilotStore((s) => s.isActive)

  // Trigger autopilot start on mount (store.start sets isActive → true)
  useEffect(() => {
    const timer = setTimeout(() => {
      useAutopilotStore.getState().start()
    }, 100)
    return () => {
      clearTimeout(timer)
      kill()
    }
  }, [kill])

  // Play timeline whenever isActive becomes true (initial mount + replay)
  useEffect(() => {
    if (isActive) {
      buildAndPlay()
    }
  }, [isActive, buildAndPlay])

  // Listen for user interaction to interrupt
  const handleInterrupt = useCallback(() => {
    if (useAutopilotStore.getState().isActive) {
      kill()
    }
  }, [kill])

  useEffect(() => {
    const canvas = gl.domElement
    const events = ['mousedown', 'touchstart', 'wheel'] as const
    events.forEach((evt) => canvas.addEventListener(evt, handleInterrupt, { passive: true }))
    return () => {
      events.forEach((evt) => canvas.removeEventListener(evt, handleInterrupt))
    }
  }, [gl.domElement, handleInterrupt])

  // Drive camera and globe from proxy values each frame
  useFrame(() => {
    if (!useAutopilotStore.getState().isActive) return

    const proxy = proxyRef.current

    // Update camera position
    camera.position.set(proxy.cameraX, proxy.cameraY, proxy.cameraZ)
    camera.lookAt(proxy.targetX, proxy.targetY, proxy.targetZ)

    // Find globe mesh lazily (sphere with 96 segments = our globe)
    if (!globeMeshRef.current) {
      scene.traverse((child) => {
        if (
          child instanceof THREE.Mesh &&
          child.geometry?.parameters?.widthSegments === 96
        ) {
          globeMeshRef.current = child
        }
      })
    }

    if (globeMeshRef.current) {
      const s = proxy.globeScale
      globeMeshRef.current.scale.set(s, s, s)
    }
  })

  return null
}
