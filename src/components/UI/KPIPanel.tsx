'use client'

import GlassPanel from './GlassPanel'
import KPICard from './KPICard'
import { kpiDefinitions, type KPIValues } from '@/data/kpis'

// Executive mode shows only these 3 KPIs
const EXECUTIVE_KPI_IDS = ['throughput', 'onTime', 'congestion']

interface KPIPanelProps {
  values: KPIValues
  visible: boolean
  executive?: boolean
}

export default function KPIPanel({ values, visible, executive = false }: KPIPanelProps) {
  if (!visible) return null

  const kpis = executive
    ? kpiDefinitions.filter((k) => EXECUTIVE_KPI_IDS.includes(k.id))
    : kpiDefinitions

  return (
    <div
      className={`absolute z-10 pointer-events-auto transition-all duration-[420ms] ease-out ${
        executive
          ? 'left-1/2 -translate-x-1/2 top-20 w-auto'
          : 'left-8 top-24 w-[420px]'
      }`}
      style={{ opacity: visible ? 1 : 0, transform: visible ? undefined : 'translateX(-20px)' }}
    >
      <GlassPanel className="px-8 py-6">
        {!executive && (
          <h2 className="text-xs font-semibold text-text-secondary uppercase tracking-[0.15em] mb-2">
            Network KPIs
          </h2>
        )}
        <div className={executive ? 'flex gap-6' : 'divide-y divide-divider'}>
          {kpis.map((kpi) => (
            <KPICard
              key={kpi.id}
              definition={kpi}
              value={values[kpi.id] ?? kpi.initial}
            />
          ))}
        </div>
      </GlassPanel>
    </div>
  )
}
