/**
 * Pre-defined alternative routes for disruption rerouting.
 * When a route is disrupted, the system shows an AI-recommended alternative.
 */
export interface RerouteOption {
  /** Original route ID that gets disrupted */
  originalRouteId: string
  /** Waypoint port IDs for the alternative path */
  waypointPortIds: string[]
  /** Label shown on the reroute overlay */
  label: string
  /** Savings description */
  savings: string
}

export const rerouteOptions: RerouteOption[] = [
  {
    originalRouteId: 'r05', // Jebel Ali → Rotterdam
    waypointPortIds: ['jebel-ali', 'singapore', 'hong-kong', 'rotterdam'],
    label: 'AI Reroute: Via Singapore Hub',
    savings: 'Saves 2.3 days | -12% cost',
  },
  {
    originalRouteId: 'r09', // Shanghai → Rotterdam
    waypointPortIds: ['shanghai', 'singapore', 'jebel-ali', 'rotterdam'],
    label: 'AI Reroute: Via Middle East Corridor',
    savings: 'Saves 1.8 days | -8% cost',
  },
  {
    originalRouteId: 'r11', // Shanghai → Los Angeles
    waypointPortIds: ['shanghai', 'busan', 'vancouver', 'los-angeles'],
    label: 'AI Reroute: Via Vancouver',
    savings: 'Saves 1.1 days | -5% cost',
  },
  {
    originalRouteId: 'r01', // Shanghai → Jebel Ali
    waypointPortIds: ['shanghai', 'hong-kong', 'singapore', 'jebel-ali'],
    label: 'AI Reroute: Via Southeast Asia',
    savings: 'Saves 0.9 days | -6% cost',
  },
  {
    originalRouteId: 'r02', // Singapore → Jebel Ali
    waypointPortIds: ['singapore', 'mumbai', 'jebel-ali'],
    label: 'AI Reroute: Via India',
    savings: 'Saves 1.5 days | -10% cost',
  },
]
