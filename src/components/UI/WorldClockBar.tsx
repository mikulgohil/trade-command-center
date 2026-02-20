'use client'

import { useState, useEffect } from 'react'

interface ClockCity {
  label: string
  timezone: string
}

const CITIES: ClockCity[] = [
  { label: 'Dubai', timezone: 'Asia/Dubai' },
  { label: 'Singapore', timezone: 'Asia/Singapore' },
  { label: 'Shanghai', timezone: 'Asia/Shanghai' },
  { label: 'Rotterdam', timezone: 'Europe/Amsterdam' },
  { label: 'London', timezone: 'Europe/London' },
  { label: 'Los Angeles', timezone: 'America/Los_Angeles' },
]

function isBusinessHours(date: Date, timezone: string): boolean {
  const hour = parseInt(
    new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: 'numeric',
      hour12: false,
    }).format(date)
  )
  return hour >= 8 && hour < 18
}

function formatTime(date: Date, timezone: string): string {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date)
}

export default function WorldClockBar({ visible }: { visible: boolean }) {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 30_000)
    return () => clearInterval(interval)
  }, [])

  if (!visible) return null

  return (
    <div className="absolute top-16 left-0 right-0 z-10 pointer-events-none">
      <div className="flex items-center justify-center gap-6 px-10 py-2">
        {CITIES.map((city) => {
          const active = isBusinessHours(now, city.timezone)
          const time = formatTime(now, city.timezone)

          return (
            <div
              key={city.timezone}
              className="flex items-center gap-2"
            >
              <span
                className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                  active ? 'bg-accent-green' : 'bg-white/20'
                }`}
              />
              <span className="text-[11px] font-medium text-text-secondary">
                {city.label}
              </span>
              <span
                className={`text-[11px] font-mono ${
                  active ? 'text-text-primary' : 'text-text-secondary'
                }`}
              >
                {time}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
