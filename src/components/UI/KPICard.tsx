'use client'

import { formatTEU, formatPercent, formatHours, formatIndex } from '@/lib/formatters'
import type { KPIDefinition } from '@/data/kpis'
import AnimatedNumber from './AnimatedNumber'
import Sparkline from './Sparkline'

interface KPICardProps {
  definition: KPIDefinition
  value: number
}

const getFormatter = (format: KPIDefinition['format']): ((n: number) => string) => {
  switch (format) {
    case 'teu': return formatTEU
    case 'percent': return formatPercent
    case 'hours': return formatHours
    case 'index': return formatIndex
  }
}

export default function KPICard({ definition, value }: KPICardProps) {
  return (
    <div className="flex items-center gap-4 py-4">
      {/* Icon */}
      <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-accent-cyan/10 text-base shrink-0">
        {definition.icon}
      </div>

      {/* Label + Sparkline */}
      <div className="flex flex-col flex-1 min-w-0 gap-1.5">
        <span className="text-[13px] font-medium text-text-secondary leading-none truncate">
          {definition.label}
        </span>
        <Sparkline value={value} width={60} height={20} />
      </div>

      {/* Animated Value */}
      <div className="text-right shrink-0">
        <AnimatedNumber
          value={value}
          format={getFormatter(definition.format)}
          className="text-2xl font-bold leading-none text-text-primary tracking-tight"
        />
      </div>
    </div>
  )
}
