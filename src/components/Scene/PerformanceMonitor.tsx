'use client'

import { useFPSMonitor } from '@/hooks/useFPSMonitor'

/**
 * Invisible R3F component that runs the FPS monitor hook.
 * Placed inside the Canvas to access the render loop.
 */
export default function PerformanceMonitor() {
  useFPSMonitor()
  return null
}
