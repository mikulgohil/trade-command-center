'use client'

import { useState } from 'react'
import KPICard from './KPICard'
import { kpiDefinitions, type KPIValues } from '@/data/kpis'

interface MobileKPISheetProps {
  values: KPIValues
  visible: boolean
}

export default function MobileKPISheet({ values, visible }: MobileKPISheetProps) {
  const [expanded, setExpanded] = useState(false)

  if (!visible) return null

  return (
    <div
      className="absolute bottom-0 left-0 right-0 z-20 pointer-events-auto transition-all duration-300 ease-out"
      style={{
        transform: expanded ? 'translateY(0)' : 'translateY(calc(100% - 56px))',
      }}
    >
      {/* Handle bar */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex flex-col items-center pt-2 pb-1 bg-transparent"
      >
        <div className="w-10 h-1 rounded-full bg-[rgba(255,255,255,0.2)]" />
        <span className="text-[11px] text-text-secondary mt-1.5">
          {expanded ? 'Collapse' : 'Network KPIs'}
        </span>
      </button>

      {/* Sheet content */}
      <div className="glass-panel rounded-t-[20px] px-4 pb-6 pt-2">
        <div className="flex flex-col gap-2">
          {kpiDefinitions.map((kpi) => (
            <KPICard
              key={kpi.id}
              definition={kpi}
              value={values[kpi.id] ?? kpi.initial}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
