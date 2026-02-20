'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import TopBar from './TopBar'
import KPIPanel from './KPIPanel'
import DetailPanel from './DetailPanel'
import EventTicker from './EventTicker'
import AutopilotButton from './AutopilotButton'
import WorldClockBar from './WorldClockBar'
import SankeyDiagram from './SankeyDiagram'
import TimeScrubber from './TimeScrubber'
import MobileKPISheet from './MobileKPISheet'
import MobileDetailDrawer from './MobileDetailDrawer'
import { ports } from '@/data/ports'
import { useSelectionStore } from '@/state/useSelectionStore'
import { useSimulationStore } from '@/state/useSimulationStore'
import { useExecutiveStore } from '@/state/useExecutiveStore'
import { useAutopilotStore } from '@/state/useAutopilotStore'
import { useIsMobile } from '@/hooks/useIsMobile'

export default function UIOverlay() {
  const isMobile = useIsMobile()
  const isExecutive = useExecutiveStore((s) => s.isExecutive)
  const toggleExecutive = useExecutiveStore((s) => s.toggle)
  const kpiValues = useSimulationStore((s) => s.kpis)
  const events = useSimulationStore((s) => s.events)
  const autopilotPhase = useAutopilotStore((s) => s.phase)
  const isAutopilotActive = useAutopilotStore((s) => s.isActive)
  const [showSankey, setShowSankey] = useState(false)
  const [showTimeScrubber, setShowTimeScrubber] = useState(false)

  const selectedPortId = useSelectionStore((s) => s.selectedPortId)
  const clearSelection = useSelectionStore((s) => s.clearSelection)
  const selectedPort = useMemo(
    () => ports.find((p) => p.id === selectedPortId) ?? null,
    [selectedPortId]
  )

  // Start simulation on mount (simulation also gets started by autopilot during 'pulse' phase,
  // but this ensures it's running even after autopilot completes or is interrupted)
  useEffect(() => {
    if (!isAutopilotActive) {
      const sim = useSimulationStore.getState()
      if (!sim.isRunning) sim.startSimulation()
    }
    return () => useSimulationStore.getState().stopSimulation()
  }, [isAutopilotActive])

  // Replay handler resets state and replays
  const handleReplay = useCallback(() => {
    const exec = useExecutiveStore.getState()
    if (exec.isExecutive) exec.toggle()
    useSimulationStore.getState().stopSimulation()
    useAutopilotStore.getState().reset()
    setTimeout(() => {
      useAutopilotStore.getState().start()
    }, 50)
  }, [])

  // During autopilot boot, UI fades in. After boot, fully visible.
  const uiVisible = autopilotPhase !== 'boot'

  return (
    <div className="absolute inset-0 z-10 pointer-events-none">
      {/* Top Bar — always visible */}
      <TopBar
        isExecutive={isExecutive}
        onToggleExecutive={toggleExecutive}
        onToggleSankey={() => setShowSankey((s) => !s)}
        showSankey={showSankey}
        onToggleTimeScrubber={() => setShowTimeScrubber((s) => !s)}
        showTimeScrubber={showTimeScrubber}
      />

      {/* World Clock Bar — below top bar */}
      <WorldClockBar visible={uiVisible && !isExecutive} />

      {/* Executive mode: centered 3-KPI bar */}
      {isExecutive && uiVisible && (
        <KPIPanel values={kpiValues} visible={true} executive />
      )}

      {/* Desktop: full KPI panel + detail panel */}
      {!isMobile && !isExecutive && (
        <>
          <KPIPanel values={kpiValues} visible={uiVisible} />
          <DetailPanel port={selectedPort} visible={uiVisible} />
        </>
      )}

      {/* Mobile: bottom sheet for KPIs + drawer for details */}
      {isMobile && !isExecutive && (
        <>
          <MobileKPISheet values={kpiValues} visible={uiVisible} />
          <MobileDetailDrawer port={selectedPort} onClose={clearSelection} />
        </>
      )}

      {/* Bottom Event Ticker */}
      <EventTicker events={events} visible={uiVisible} />

      {/* Sankey Diagram Overlay */}
      <SankeyDiagram visible={showSankey} onClose={() => setShowSankey(false)} />

      {/* Time Scrubber */}
      <TimeScrubber visible={showTimeScrubber && uiVisible} />

      {/* Replay Demo Button */}
      <AutopilotButton onReplay={handleReplay} />
    </div>
  )
}
