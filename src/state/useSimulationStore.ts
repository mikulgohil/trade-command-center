import { create } from 'zustand'
import { getInitialKPIValues, type KPIValues } from '@/data/kpis'
import { type TradeEvent } from '@/data/events'
import { type RouteStatus } from '@/data/routes'
import { updateKPIs, generateEvent } from '@/lib/simulation'
import { KPI_UPDATE_INTERVAL_MS, EVENT_MIN_INTERVAL_MS, EVENT_MAX_INTERVAL_MS } from '@/lib/constants'

interface SimulationState {
  kpis: KPIValues
  events: TradeEvent[]
  routeStatuses: Record<string, RouteStatus>
  isRunning: boolean
  setKPIs: (kpis: KPIValues) => void
  addEvent: (event: TradeEvent) => void
  setRouteStatus: (routeId: string, status: RouteStatus) => void
  startSimulation: () => void
  stopSimulation: () => void
}

let kpiInterval: ReturnType<typeof setInterval> | null = null
let eventTimeout: ReturnType<typeof setTimeout> | null = null
const recoveryTimeouts: ReturnType<typeof setTimeout>[] = []

function scheduleNextEvent() {
  const delay = EVENT_MIN_INTERVAL_MS + Math.random() * (EVENT_MAX_INTERVAL_MS - EVENT_MIN_INTERVAL_MS)
  eventTimeout = setTimeout(() => {
    const store = useSimulationStore.getState()
    if (!store.isRunning) return

    const event = generateEvent()
    store.addEvent(event)

    // Critical events trigger route status changes
    if (event.severity === 'critical' && event.routeId) {
      store.setRouteStatus(event.routeId, 'disrupted')
      const t = setTimeout(() => {
        useSimulationStore.getState().setRouteStatus(event.routeId!, 'normal')
      }, 15000 + Math.random() * 10000)
      recoveryTimeouts.push(t)
    } else if (event.severity === 'warning' && event.routeId) {
      store.setRouteStatus(event.routeId, 'congested')
      const t = setTimeout(() => {
        useSimulationStore.getState().setRouteStatus(event.routeId!, 'normal')
      }, 10000 + Math.random() * 8000)
      recoveryTimeouts.push(t)
    }

    scheduleNextEvent()
  }, delay)
}

export const useSimulationStore = create<SimulationState>((set, get) => ({
  kpis: getInitialKPIValues(),
  events: [],
  routeStatuses: {},
  isRunning: false,

  setKPIs: (kpis) => set({ kpis }),
  addEvent: (event) => set((state) => ({
    events: [event, ...state.events].slice(0, 50),
  })),
  setRouteStatus: (routeId, status) => set((state) => ({
    routeStatuses: { ...state.routeStatuses, [routeId]: status },
  })),

  startSimulation: () => {
    if (get().isRunning) return
    set({ isRunning: true })

    // KPI drift every 2.5 seconds
    kpiInterval = setInterval(() => {
      const state = useSimulationStore.getState()
      if (!state.isRunning) return
      set({ kpis: updateKPIs(state.kpis) })
    }, KPI_UPDATE_INTERVAL_MS)

    // Random events
    scheduleNextEvent()
  },

  stopSimulation: () => {
    set({ isRunning: false })
    if (kpiInterval) { clearInterval(kpiInterval); kpiInterval = null }
    if (eventTimeout) { clearTimeout(eventTimeout); eventTimeout = null }
    recoveryTimeouts.forEach(clearTimeout)
    recoveryTimeouts.length = 0
  },
}))
