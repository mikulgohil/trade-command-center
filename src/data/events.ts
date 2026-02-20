export type EventSeverity = 'info' | 'warning' | 'critical'

export interface TradeEvent {
  id: string
  timestamp: string
  label: string
  severity: EventSeverity
  portId?: string
  routeId?: string
}

export interface EventTemplate {
  label: string
  severity: EventSeverity
  requiresPort: boolean
  requiresRoute: boolean
}

export const eventTemplates: EventTemplate[] = [
  { label: 'Vessel {vessel} arrived at {port}', severity: 'info', requiresPort: true, requiresRoute: false },
  { label: 'Berth allocation confirmed at {port}', severity: 'info', requiresPort: true, requiresRoute: false },
  { label: 'Container throughput exceeding forecast at {port}', severity: 'info', requiresPort: true, requiresRoute: false },
  { label: 'Customs clearance completed — batch release at {port}', severity: 'info', requiresPort: true, requiresRoute: false },
  { label: 'Reefer container monitoring nominal across {port}', severity: 'info', requiresPort: true, requiresRoute: false },
  { label: 'Congestion rising at {port} — dwell time +2.1h', severity: 'warning', requiresPort: true, requiresRoute: false },
  { label: 'Weather delay detected on {route} corridor', severity: 'warning', requiresPort: false, requiresRoute: true },
  { label: 'Vessel bunching alert — 3 arrivals within 4h at {port}', severity: 'warning', requiresPort: true, requiresRoute: false },
  { label: 'Equipment maintenance required at {port} Berth C', severity: 'warning', requiresPort: true, requiresRoute: false },
  { label: 'Port congestion critical at {port} — activating overflow', severity: 'critical', requiresPort: true, requiresRoute: false },
  { label: 'Route disruption — rerouting {route}', severity: 'critical', requiresPort: false, requiresRoute: true },
  { label: 'Severe weather warning — {route} corridor suspended', severity: 'critical', requiresPort: false, requiresRoute: true },
  { label: 'AI reroute activated — alternative path via {port}', severity: 'info', requiresPort: true, requiresRoute: false },
  { label: 'On-time performance recovered +0.6% after reroute', severity: 'info', requiresPort: false, requiresRoute: false },
  { label: 'Carbon efficiency improved — slow steaming activated on {route}', severity: 'info', requiresPort: false, requiresRoute: true },
]

export const vesselNames = [
  'MSC Aurora', 'Maersk Eindhoven', 'CMA CGM Marco Polo', 'COSCO Shipping Universe',
  'Ever Given', 'ONE Harmony', 'HMM Algeciras', 'Yang Ming Witness',
  'ZIM Mount Everest', 'Hapag-Lloyd Express',
]
