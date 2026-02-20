'use client'

import { useEffect, useRef, useCallback, useState } from 'react'

export function useIdleTimer(timeoutMs: number = 6000) {
  const [isIdle, setIsIdle] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const resetTimer = useCallback(() => {
    setIsIdle(false)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setIsIdle(true), timeoutMs)
  }, [timeoutMs])

  useEffect(() => {
    const events = ['mousedown', 'mousemove', 'touchstart', 'wheel', 'keydown']
    events.forEach((e) => window.addEventListener(e, resetTimer, { passive: true }))

    // Start the idle timer
    timerRef.current = setTimeout(() => setIsIdle(true), timeoutMs)

    return () => {
      events.forEach((e) => window.removeEventListener(e, resetTimer))
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [resetTimer, timeoutMs])

  return isIdle
}
