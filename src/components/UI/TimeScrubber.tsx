'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import { useSimulationStore } from '@/state/useSimulationStore'

interface TimeScrubberProps {
  visible: boolean
}

const TOTAL_SECONDS = 86400 // 24 hours
const SPEEDS = [
  { label: '1x', value: 1 },
  { label: '10x', value: 10 },
  { label: '60x', value: 60 },
  { label: '360x', value: 360 },
]

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
}

// Time markers every 6 hours
const TIME_MARKERS = [0, 21600, 43200, 64800, 86400]

export default function TimeScrubber({ visible }: TimeScrubberProps) {
  const [currentTime, setCurrentTime] = useState(0) // seconds into the day
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(60)
  const rafRef = useRef<number>(0)
  const lastFrameRef = useRef<number>(0)
  const sliderRef = useRef<HTMLDivElement>(null)

  // Playback loop
  useEffect(() => {
    if (!isPlaying) return

    lastFrameRef.current = performance.now()

    const tick = (now: number) => {
      const delta = (now - lastFrameRef.current) / 1000
      lastFrameRef.current = now

      setCurrentTime((prev) => {
        const next = prev + delta * speed
        return next >= TOTAL_SECONDS ? 0 : next
      })

      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [isPlaying, speed])

  // Scrub handler
  const handleScrub = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!sliderRef.current) return
    const rect = sliderRef.current.getBoundingClientRect()
    const t = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    setCurrentTime(t * TOTAL_SECONDS)
  }, [])

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    handleScrub(e)
    const onMove = (ev: MouseEvent) => {
      if (!sliderRef.current) return
      const rect = sliderRef.current.getBoundingClientRect()
      const t = Math.max(0, Math.min(1, (ev.clientX - rect.left) / rect.width))
      setCurrentTime(t * TOTAL_SECONDS)
    }
    const onUp = () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
    }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }, [handleScrub])

  if (!visible) return null

  const progress = currentTime / TOTAL_SECONDS

  return (
    <div
      className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20 pointer-events-auto"
      style={{ width: 'min(680px, 80vw)' }}
    >
      <div
        className="glass-panel px-5 py-3"
        style={{ borderRadius: 12 }}
      >
        {/* Top row: time display + controls */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            {/* Play/Pause */}
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex items-center justify-center w-7 h-7 rounded-md bg-white/5 hover:bg-white/10 transition-colors"
              style={{ color: 'rgba(255,255,255,0.7)' }}
            >
              {isPlaying ? (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                  <rect x="2" y="1" width="3" height="10" rx="0.5" />
                  <rect x="7" y="1" width="3" height="10" rx="0.5" />
                </svg>
              ) : (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                  <polygon points="2,1 11,6 2,11" />
                </svg>
              )}
            </button>

            {/* Current time */}
            <span
              className="font-mono text-sm tracking-wider"
              style={{ color: '#33D6FF', minWidth: 48 }}
            >
              {formatTime(currentTime)}
            </span>
          </div>

          {/* Speed selector */}
          <div className="flex items-center gap-1">
            {SPEEDS.map((s) => (
              <button
                key={s.value}
                onClick={() => setSpeed(s.value)}
                className="px-2 py-0.5 rounded text-[10px] font-mono transition-colors"
                style={{
                  color: speed === s.value ? '#33D6FF' : 'rgba(255,255,255,0.35)',
                  background: speed === s.value ? 'rgba(51,214,255,0.1)' : 'transparent',
                  border: speed === s.value ? '1px solid rgba(51,214,255,0.3)' : '1px solid transparent',
                }}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Slider track */}
        <div
          ref={sliderRef}
          className="relative h-6 cursor-pointer group"
          onMouseDown={handleMouseDown}
        >
          {/* Track background */}
          <div
            className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-[3px] rounded-full"
            style={{ background: 'rgba(255,255,255,0.08)' }}
          />

          {/* Progress fill */}
          <div
            className="absolute top-1/2 -translate-y-1/2 left-0 h-[3px] rounded-full"
            style={{
              width: `${progress * 100}%`,
              background: 'linear-gradient(90deg, #33D6FF, #19E6C1)',
            }}
          />

          {/* Time markers */}
          {TIME_MARKERS.map((t) => {
            const x = (t / TOTAL_SECONDS) * 100
            return (
              <div
                key={t}
                className="absolute top-1/2 -translate-y-1/2"
                style={{ left: `${x}%` }}
              >
                <div
                  className="w-px h-2"
                  style={{ background: 'rgba(255,255,255,0.2)' }}
                />
                <span
                  className="absolute top-3 -translate-x-1/2 text-[8px] font-mono"
                  style={{ color: 'rgba(255,255,255,0.25)' }}
                >
                  {formatTime(t === TOTAL_SECONDS ? 0 : t)}
                </span>
              </div>
            )
          })}

          {/* Scrubber handle */}
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full transition-transform group-hover:scale-125"
            style={{
              left: `${progress * 100}%`,
              background: '#33D6FF',
              boxShadow: '0 0 8px rgba(51,214,255,0.5)',
            }}
          />
        </div>
      </div>
    </div>
  )
}
