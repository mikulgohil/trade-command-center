'use client'

import GlassPanel from './GlassPanel'
import type { Port } from '@/data/ports'

interface DetailPanelProps {
  port: Port | null
  visible: boolean
}

export default function DetailPanel({ port, visible }: DetailPanelProps) {
  if (!visible) return null

  return (
    <div
      className="absolute right-8 top-24 w-[420px] z-10 pointer-events-auto transition-all duration-300 ease-out"
      style={{ opacity: port ? 1 : 0.8, transform: port ? 'translateX(0)' : 'translateX(10px)' }}
    >
      <GlassPanel className="px-8 py-7">
        {!port ? (
          <div className="flex items-center justify-center h-32 text-text-secondary text-sm">
            Hover a port to preview
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {/* Header */}
            <div>
              <h2 className="text-xl font-bold text-text-primary leading-tight">{port.name}</h2>
              <p className="text-sm text-text-secondary mt-1">{port.country} · {port.region}</p>
            </div>

            {/* Divider */}
            <div className="h-px bg-divider" />

            {/* Port KPIs */}
            <div className="grid grid-cols-2 gap-3">
              <PortKPI label="Throughput" value={`${(port.throughput / 1000).toFixed(1)}K`} unit="TEU/day" />
              <PortKPI label="Dwell Time" value={`${port.dwellTime.toFixed(1)}`} unit="hours" />
              <PortKPI label="On-time" value={`${port.onTimePerformance.toFixed(1)}%`} />
              <PortKPI label="Congestion" value={`${port.congestionIndex}`} unit="/100" />
              <PortKPI label="Carbon Index" value={`${port.carbonIndex}`} unit="/100" />
            </div>

            {/* Top Routes */}
            <div>
              <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-[0.15em] mb-3">
                Top Routes
              </h3>
              <div className="flex flex-col gap-2">
                {port.topRoutes.map((route, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-sm text-text-primary">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent-cyan shrink-0" />
                    {route}
                  </div>
                ))}
              </div>
            </div>

            {/* AI Recommendation */}
            <div>
              <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-[0.15em] mb-3">
                AI Recommendation
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                {port.aiRecommendation}
              </p>
            </div>
          </div>
        )}
      </GlassPanel>
    </div>
  )
}

function PortKPI({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-xl bg-card p-3.5">
      <span className="text-[11px] font-medium text-text-secondary uppercase tracking-wide">{label}</span>
      <div className="flex items-baseline gap-1">
        <span className="text-lg font-bold text-text-primary">{value}</span>
        {unit && <span className="text-[11px] text-text-secondary">{unit}</span>}
      </div>
    </div>
  )
}
