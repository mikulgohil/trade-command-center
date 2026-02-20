'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { usePerformanceStore } from '@/state/usePerformanceStore'
import { FPS_SAMPLE_DURATION_MS, FPS_LOW_THRESHOLD } from '@/lib/constants'

/**
 * Monitors FPS inside the R3F render loop.
 * If average FPS drops below threshold for the sample window,
 * sets reducedEffects = true in the performance store.
 */
export function useFPSMonitor() {
  const frames = useRef(0)
  const lastTime = useRef(performance.now())
  const lowCount = useRef(0)

  useFrame(() => {
    frames.current++
    const now = performance.now()
    const elapsed = now - lastTime.current

    if (elapsed >= FPS_SAMPLE_DURATION_MS) {
      const avgFPS = (frames.current / elapsed) * 1000
      frames.current = 0
      lastTime.current = now

      usePerformanceStore.getState().setFPS(Math.round(avgFPS))

      if (avgFPS < FPS_LOW_THRESHOLD) {
        lowCount.current++
        // Trigger after 2 consecutive low samples (~6s)
        if (lowCount.current >= 2) {
          usePerformanceStore.getState().setReducedEffects(true)
        }
      } else {
        lowCount.current = 0
      }
    }
  })
}
