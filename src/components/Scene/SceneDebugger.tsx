'use client'

import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'

/**
 * Logs renderer stats + frame timing to the console every 2 seconds.
 * Detects frame spikes (>25ms) which would cause visible flicker.
 * Remove this component once debugging is complete.
 */
export default function SceneDebugger() {
  const { gl } = useThree()
  const lastLogTime = useRef(0)
  const frameCount = useRef(0)
  const spikeCount = useRef(0)
  const lastFrameTime = useRef(0)

  useFrame(({ clock }) => {
    const now = clock.elapsedTime
    const delta = now - lastFrameTime.current
    lastFrameTime.current = now

    frameCount.current++

    // Detect frame spikes (>25ms = <40fps)
    if (delta > 0.025 && now > 1) {
      spikeCount.current++
    }

    // Log every 2 seconds
    if (now - lastLogTime.current >= 2) {
      const info = gl.info
      const fps = Math.round(frameCount.current / (now - lastLogTime.current))
      console.log(
        `[DEBUG] FPS: ${fps} | Draw calls: ${info.render.calls} | Triangles: ${info.render.triangles} | Geometries: ${info.memory.geometries} | Textures: ${info.memory.textures} | Frame spikes: ${spikeCount.current}`
      )

      lastLogTime.current = now
      frameCount.current = 0
      spikeCount.current = 0
    }
  })

  return null
}
