'use client'

import GlassPanel from './GlassPanel'
import type { Port } from '@/data/ports'

interface MobileDetailDrawerProps {
  port: Port | null
  onClose: () => void
}

export default function MobileDetailDrawer({ port, onClose }: MobileDetailDrawerProps) {
  if (!port) return null

  return (
    <div className="fixed inset-0 z-30 pointer-events-auto">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[rgba(0,0,0,0.5)]"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="absolute bottom-0 left-0 right-0 max-h-[70vh] overflow-y-auto animate-slide-up">
        <GlassPanel className="rounded-t-[20px] p-5">
          {/* Close handle */}
          <div className="flex justify-center mb-3">
            <div className="w-10 h-1 rounded-full bg-[rgba(255,255,255,0.2)]" />
          </div>

          {/* Header */}
          <div className="mb-4">
            <h2 className="text-lg font-bold text-text-primary">{port.name}</h2>
            <p className="text-[13px] text-text-secondary">{port.country} &middot; {port.region}</p>
          </div>

          {/* Port KPIs */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <MobilePortKPI label="Throughput" value={`${(port.throughput / 1000).toFixed(1)}K`} unit="TEU/day" />
            <MobilePortKPI label="Dwell Time" value={`${port.dwellTime.toFixed(1)}`} unit="hours" />
            <MobilePortKPI label="On-time" value={`${port.onTimePerformance.toFixed(1)}%`} />
            <MobilePortKPI label="Congestion" value={`${port.congestionIndex}`} unit="/100" />
          </div>

          {/* AI Recommendation */}
          <div>
            <h3 className="text-[12px] font-semibold text-text-secondary uppercase tracking-widest mb-2">
              AI Recommendation
            </h3>
            <p className="text-[13px] text-text-secondary leading-relaxed">
              {port.aiRecommendation}
            </p>
          </div>
        </GlassPanel>
      </div>
    </div>
  )
}

function MobilePortKPI({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-lg bg-[rgba(255,255,255,0.03)] p-3">
      <span className="text-[11px] font-medium text-text-secondary">{label}</span>
      <div className="flex items-baseline gap-1">
        <span className="text-lg font-bold text-text-primary">{value}</span>
        {unit && <span className="text-[11px] text-text-secondary">{unit}</span>}
      </div>
    </div>
  )
}
