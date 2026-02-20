'use client'

import { useRef, useState, useEffect } from 'react'
import gsap from 'gsap'

const BOOT_LINES = [
  { text: 'ESTABLISHING SECURE UPLINK...', delay: 0 },
  { text: 'MARITIME TELEMETRY FEED — ONLINE', delay: 0.4 },
  { text: 'PORT NETWORK HANDSHAKE — 15 NODES', delay: 0.7 },
  { text: 'ROUTE CORRIDORS MAPPED — 24 ACTIVE', delay: 1.0 },
  { text: 'AI PREDICTION ENGINE — OPERATIONAL', delay: 1.3 },
  { text: 'GLOBAL TRADE COMMAND CENTER — READY', delay: 1.7 },
]

const TOTAL_DURATION = 3800 // ms

export default function BootSequence() {
  const containerRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLDivElement>(null)
  const linesRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    if (!containerRef.current) return

    const tl = gsap.timeline({
      onComplete: () => {
        // Fade out the entire overlay
        gsap.to(containerRef.current, {
          opacity: 0,
          duration: 0.6,
          ease: 'power2.in',
          onComplete: () => setVisible(false),
        })
      },
    })

    // Title typing effect
    if (titleRef.current) {
      const titleText = titleRef.current.querySelector('.boot-title-text')
      if (titleText) {
        gsap.set(titleText, { width: 0 })
        tl.to(titleText, {
          width: 'auto',
          duration: 1.2,
          ease: 'steps(28)',
        }, 0)
      }
    }

    // Progress bar
    if (progressRef.current) {
      tl.to(progressRef.current, {
        width: '100%',
        duration: 2.8,
        ease: 'power1.inOut',
      }, 0.2)
    }

    // Boot lines appear one by one
    if (linesRef.current) {
      const lines = linesRef.current.querySelectorAll('.boot-line')
      lines.forEach((line, i) => {
        const config = BOOT_LINES[i]
        if (!config) return
        gsap.set(line, { opacity: 0, x: -8 })
        tl.to(line, {
          opacity: 1,
          x: 0,
          duration: 0.25,
          ease: 'power2.out',
        }, config.delay + 0.3)
      })
    }

    // Flash the "READY" line green
    tl.to({}, {
      duration: 0.01,
      onComplete: () => {
        if (!linesRef.current) return
        const lines = linesRef.current.querySelectorAll('.boot-line')
        const lastLine = lines[lines.length - 1]
        if (lastLine) {
          (lastLine as HTMLElement).style.color = '#3DFF88'
        }
      },
    }, 2.3)

    // Scanline flicker at midpoint
    if (containerRef.current) {
      const scanline = containerRef.current.querySelector('.boot-scanline')
      if (scanline) {
        tl.to(scanline, { opacity: 0.08, duration: 0.1, yoyo: true, repeat: 3 }, 1.0)
      }
    }

    return () => {
      tl.kill()
    }
  }, [])

  if (!visible) return null

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{ background: '#020810' }}
    >
      {/* Scanline overlay */}
      <div
        className="boot-scanline absolute inset-0 pointer-events-none"
        style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.02) 2px, rgba(255,255,255,0.02) 4px)',
          opacity: 0.5,
        }}
      />

      {/* CRT vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.6) 100%)',
        }}
      />

      {/* Content container */}
      <div className="relative z-10 w-full max-w-lg px-8">
        {/* Main title */}
        <div ref={titleRef} className="mb-8">
          <div
            className="boot-title-text overflow-hidden whitespace-nowrap font-mono text-sm tracking-[0.3em] uppercase"
            style={{ color: '#33D6FF', borderRight: '2px solid #33D6FF' }}
          >
            INITIALIZING GLOBAL TRADE NETWORK
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div
            className="h-[2px] w-full rounded-full overflow-hidden"
            style={{ background: 'rgba(51,214,255,0.15)' }}
          >
            <div
              ref={progressRef}
              className="h-full rounded-full"
              style={{ width: '0%', background: 'linear-gradient(90deg, #33D6FF, #19E6C1)' }}
            />
          </div>
        </div>

        {/* System readout lines */}
        <div ref={linesRef} className="space-y-2">
          {BOOT_LINES.map((line, i) => (
            <div
              key={i}
              className="boot-line flex items-center gap-3 font-mono text-xs"
              style={{ color: 'rgba(255,255,255,0.5)', opacity: 0 }}
            >
              <span
                className="inline-block w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{
                  background: i === BOOT_LINES.length - 1 ? '#3DFF88' : '#33D6FF',
                  boxShadow: `0 0 6px ${i === BOOT_LINES.length - 1 ? '#3DFF88' : '#33D6FF'}`,
                }}
              />
              <span className="tracking-wider">{line.text}</span>
            </div>
          ))}
        </div>

        {/* Bottom branding */}
        <div className="mt-12 text-center">
          <div
            className="font-mono text-[10px] tracking-[0.5em] uppercase"
            style={{ color: 'rgba(255,255,255,0.2)' }}
          >
            DP WORLD | COMMAND CENTER v3.0
          </div>
        </div>
      </div>
    </div>
  )
}
