'use client'

import { useState, useRef, useEffect } from 'react'
import type { TradeEvent } from '@/data/events'

interface EventTickerProps {
  events: TradeEvent[]
  visible: boolean
}

const severityColor: Record<string, string> = {
  info: 'bg-accent-cyan',
  warning: 'bg-accent-amber',
  critical: 'bg-accent-red',
}

export default function EventTicker({ events, visible }: EventTickerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    if (!containerRef.current || isPaused) return
    const el = containerRef.current
    const scrollInterval = setInterval(() => {
      if (el.scrollLeft < el.scrollWidth - el.clientWidth) {
        el.scrollLeft += 1
      } else {
        el.scrollLeft = 0
      }
    }, 30)
    return () => clearInterval(scrollInterval)
  }, [isPaused])

  if (!visible) return null

  return (
    <div className="absolute bottom-6 left-8 right-8 z-10 pointer-events-auto">
      <div
        className="glass-panel flex items-center px-7 py-4 overflow-hidden"
        ref={containerRef}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className="flex items-center gap-8 whitespace-nowrap">
          {events.length === 0 ? (
            <span className="text-sm text-text-secondary">Monitoring global trade network...</span>
          ) : (
            events.map((event) => (
              <div key={event.id} className="flex items-center gap-3">
                <span className="text-xs text-text-secondary font-mono opacity-70">{event.timestamp}</span>
                <span className={`w-2 h-2 rounded-full ${severityColor[event.severity]} shrink-0`} />
                <span className="text-sm text-text-primary">{event.label}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
