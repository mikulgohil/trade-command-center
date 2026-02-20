'use client'

import { useState, useEffect, useCallback } from 'react'
import { initSounds, toggleMute, getIsMuted, startAmbient, playPing, playAlert, playWarning } from '@/lib/sounds'
import { useSimulationStore } from '@/state/useSimulationStore'

export default function SoundToggle() {
  const [muted, setMuted] = useState(true)
  const [initialized, setInitialized] = useState(false)

  // Initialize sound on first user click anywhere
  useEffect(() => {
    const handler = () => {
      if (!initialized) {
        initSounds()
        startAmbient()
        setInitialized(true)
        setMuted(getIsMuted())
      }
    }
    window.addEventListener('click', handler, { once: true })
    window.addEventListener('touchstart', handler, { once: true })
    return () => {
      window.removeEventListener('click', handler)
      window.removeEventListener('touchstart', handler)
    }
  }, [initialized])

  // Listen to simulation events and play sounds
  useEffect(() => {
    let lastEventCount = 0

    const unsub = useSimulationStore.subscribe((state) => {
      if (!initialized) return
      const count = state.events.length
      if (count <= lastEventCount) {
        lastEventCount = count
        return
      }
      lastEventCount = count

      const latest = state.events[0]
      if (!latest) return

      switch (latest.severity) {
        case 'critical':
          playAlert()
          break
        case 'warning':
          playWarning()
          break
        case 'info':
          playPing()
          break
      }
    })

    return unsub
  }, [initialized])

  const handleToggle = useCallback(() => {
    if (!initialized) {
      initSounds()
      startAmbient()
      setInitialized(true)
    }
    const nowMuted = toggleMute()
    setMuted(nowMuted)
  }, [initialized])

  return (
    <button
      onClick={handleToggle}
      className="pointer-events-auto flex items-center justify-center w-8 h-8 rounded-lg transition-colors duration-200 hover:bg-white/10"
      style={{
        color: muted ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.7)',
      }}
      title={muted ? 'Unmute' : 'Mute'}
    >
      {muted ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M11 5L6 9H2v6h4l5 4V5z" />
          <line x1="23" y1="9" x2="17" y2="15" />
          <line x1="17" y1="9" x2="23" y2="15" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M11 5L6 9H2v6h4l5 4V5z" />
          <path d="M19.07 4.93a10 10 0 010 14.14" />
          <path d="M15.54 8.46a5 5 0 010 7.07" />
        </svg>
      )}
    </button>
  )
}
