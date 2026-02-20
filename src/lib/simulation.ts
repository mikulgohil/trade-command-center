import { kpiDefinitions, type KPIValues } from '@/data/kpis'
import { eventTemplates, vesselNames, type TradeEvent } from '@/data/events'
import { ports } from '@/data/ports'
import { routes } from '@/data/routes'
import { formatTimestamp } from './formatters'

let eventCounter = 100

/**
 * Drift a KPI value within its valid range by a random small amount.
 */
export function driftKPI(current: number, min: number, max: number, maxDelta: number): number {
  const delta = (Math.random() - 0.5) * 2 * maxDelta
  return Math.min(max, Math.max(min, current + delta))
}

/**
 * Update 2-3 randomly chosen KPIs by small amounts.
 */
export function updateKPIs(current: KPIValues): KPIValues {
  const updated = { ...current }
  const count = 2 + Math.floor(Math.random() * 2) // 2 or 3

  // Shuffle indices and pick first `count`
  const indices = kpiDefinitions
    .map((_, i) => i)
    .sort(() => Math.random() - 0.5)
    .slice(0, count)

  for (const i of indices) {
    const kpi = kpiDefinitions[i]
    updated[kpi.id] = driftKPI(current[kpi.id], kpi.min, kpi.max, kpi.maxDelta)
  }

  return updated
}

/**
 * Generate a random trade event from templates.
 */
export function generateEvent(): TradeEvent {
  const template = eventTemplates[Math.floor(Math.random() * eventTemplates.length)]
  const port = ports[Math.floor(Math.random() * ports.length)]
  const route = routes[Math.floor(Math.random() * routes.length)]
  const vessel = vesselNames[Math.floor(Math.random() * vesselNames.length)]

  const fromPort = ports.find((p) => p.id === route.fromPortId)
  const toPort = ports.find((p) => p.id === route.toPortId)
  const routeLabel = fromPort && toPort ? `${fromPort.name}–${toPort.name}` : 'Unknown'

  const label = template.label
    .replace('{port}', port.name)
    .replace('{route}', routeLabel)
    .replace('{vessel}', vessel)

  eventCounter++

  return {
    id: `evt-${eventCounter}`,
    timestamp: formatTimestamp(),
    label,
    severity: template.severity,
    portId: template.requiresPort ? port.id : undefined,
    routeId: template.requiresRoute ? route.id : undefined,
  }
}
