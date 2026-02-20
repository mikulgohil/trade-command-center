export interface KPIDefinition {
  id: string
  label: string
  unit: string
  initial: number
  min: number
  max: number
  maxDelta: number
  format: 'teu' | 'percent' | 'hours' | 'index'
  icon: string
}

export const kpiDefinitions: KPIDefinition[] = [
  {
    id: 'throughput',
    label: 'Global Throughput',
    unit: 'TEU/day',
    initial: 47250,
    min: 18000,
    max: 75000,
    maxDelta: 850,
    format: 'teu',
    icon: '📦',
  },
  {
    id: 'vessels',
    label: 'Vessels in Motion',
    unit: 'active',
    initial: 342,
    min: 180,
    max: 520,
    maxDelta: 12,
    format: 'index',
    icon: '🚢',
  },
  {
    id: 'dwellTime',
    label: 'Avg Port Dwell Time',
    unit: 'hours',
    initial: 18.4,
    min: 8,
    max: 46,
    maxDelta: 1.2,
    format: 'hours',
    icon: '⏱',
  },
  {
    id: 'onTime',
    label: 'On-time Performance',
    unit: '%',
    initial: 91.2,
    min: 82.0,
    max: 96.5,
    maxDelta: 0.8,
    format: 'percent',
    icon: '✓',
  },
  {
    id: 'congestion',
    label: 'Congestion Index',
    unit: 'index',
    initial: 34,
    min: 0,
    max: 100,
    maxDelta: 5,
    format: 'index',
    icon: '⚡',
  },
  {
    id: 'carbon',
    label: 'Carbon Efficiency Index',
    unit: 'score',
    initial: 76,
    min: 40,
    max: 92,
    maxDelta: 3,
    format: 'index',
    icon: '🌿',
  },
]

export type KPIValues = Record<string, number>

export function getInitialKPIValues(): KPIValues {
  const values: KPIValues = {}
  for (const kpi of kpiDefinitions) {
    values[kpi.id] = kpi.initial
  }
  return values
}
