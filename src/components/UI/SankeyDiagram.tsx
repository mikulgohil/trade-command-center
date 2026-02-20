'use client'

import { useMemo } from 'react'
import { routes } from '@/data/routes'
import { ports } from '@/data/ports'

interface SankeyProps {
  visible: boolean
  onClose?: () => void
}

// Aggregate routes by region pairs
interface Flow {
  from: string
  to: string
  volume: number
  color: string
}

const REGION_POSITIONS: Record<string, { x: number; label: string }> = {
  'East Asia': { x: 0, label: 'East Asia' },
  'Southeast Asia': { x: 1, label: 'SE Asia' },
  'South Asia': { x: 2, label: 'S Asia' },
  'Middle East': { x: 3, label: 'Mid East' },
  'Europe': { x: 4, label: 'Europe' },
  'Africa': { x: 5, label: 'Africa' },
  'South America': { x: 6, label: 'S America' },
  'North America': { x: 7, label: 'N America' },
  'Oceania': { x: 8, label: 'Oceania' },
}

const FLOW_COLORS = [
  '#33D6FF', '#19E6C1', '#3DFF88', '#FFB020',
  '#FF6B6B', '#BB86FC', '#64B5F6', '#81C784',
]

const SVG_WIDTH = 900
const SVG_HEIGHT = 320
const NODE_WIDTH = 16
const PADDING_X = 60
const PADDING_Y = 40

export default function SankeyDiagram({ visible, onClose }: SankeyProps) {
  const { flows, regionVolumes, regions } = useMemo(() => {
    // Aggregate volumes by region pair
    const flowMap = new Map<string, number>()
    const regionVolMap = new Map<string, number>()

    routes.forEach((route) => {
      const fromPort = ports.find((p) => p.id === route.fromPortId)
      const toPort = ports.find((p) => p.id === route.toPortId)
      if (!fromPort || !toPort || fromPort.region === toPort.region) return

      const key = `${fromPort.region}→${toPort.region}`
      flowMap.set(key, (flowMap.get(key) ?? 0) + route.volume)
      regionVolMap.set(fromPort.region, (regionVolMap.get(fromPort.region) ?? 0) + route.volume)
      regionVolMap.set(toPort.region, (regionVolMap.get(toPort.region) ?? 0) + route.volume)
    })

    const flows: Flow[] = []
    let colorIdx = 0
    flowMap.forEach((volume, key) => {
      const [from, to] = key.split('→')
      flows.push({ from, to, volume, color: FLOW_COLORS[colorIdx % FLOW_COLORS.length] })
      colorIdx++
    })

    // Sort flows by volume descending
    flows.sort((a, b) => b.volume - a.volume)

    // Get active regions sorted by position
    const activeRegions = new Set<string>()
    flows.forEach((f) => { activeRegions.add(f.from); activeRegions.add(f.to) })
    const regions = Array.from(activeRegions).sort(
      (a, b) => (REGION_POSITIONS[a]?.x ?? 0) - (REGION_POSITIONS[b]?.x ?? 0)
    )

    return { flows, regionVolumes: regionVolMap, regions }
  }, [])

  if (!visible) return null

  // Layout: spread regions evenly
  const regionX = (region: string): number => {
    const idx = regions.indexOf(region)
    const usableWidth = SVG_WIDTH - PADDING_X * 2 - NODE_WIDTH
    return PADDING_X + (idx / Math.max(regions.length - 1, 1)) * usableWidth
  }

  // Track Y offsets for flow stacking per region
  const regionYOffsets: Record<string, number> = {}
  regions.forEach((r) => { regionYOffsets[r] = PADDING_Y })

  const maxVolume = Math.max(...flows.map((f) => f.volume), 1)
  const heightScale = (SVG_HEIGHT - PADDING_Y * 2) / (maxVolume * 0.6)

  return (
    <div
      className="absolute inset-0 z-30 flex items-center justify-center pointer-events-auto"
      style={{
        background: 'rgba(2, 8, 16, 0.85)',
        backdropFilter: 'blur(8px)',
        transition: 'opacity 0.4s ease',
      }}
      onClick={onClose}
    >
      <div className="relative" onClick={(e) => e.stopPropagation()}>
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center
            border border-white/10 bg-white/[0.06] hover:bg-white/[0.12] text-white/50 hover:text-white
            transition-all duration-200 z-10"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
        <h3
          className="text-sm font-medium tracking-wider uppercase mb-4 text-center"
          style={{ color: 'rgba(255,255,255,0.6)' }}
        >
          Global Trade Flow — Regional Corridors
        </h3>

        <svg width={SVG_WIDTH} height={SVG_HEIGHT} className="overflow-visible">
          {/* Region labels */}
          {regions.map((region) => {
            const x = regionX(region)
            const label = REGION_POSITIONS[region]?.label ?? region
            const vol = regionVolumes.get(region) ?? 0
            return (
              <g key={region}>
                <rect
                  x={x}
                  y={PADDING_Y - 4}
                  width={NODE_WIDTH}
                  height={SVG_HEIGHT - PADDING_Y * 2 + 8}
                  rx={4}
                  fill="rgba(51,214,255,0.15)"
                  stroke="rgba(51,214,255,0.3)"
                  strokeWidth={1}
                />
                <text
                  x={x + NODE_WIDTH / 2}
                  y={SVG_HEIGHT - 8}
                  textAnchor="middle"
                  fill="rgba(255,255,255,0.5)"
                  fontSize={10}
                  fontFamily="monospace"
                >
                  {label}
                </text>
                <text
                  x={x + NODE_WIDTH / 2}
                  y={PADDING_Y - 12}
                  textAnchor="middle"
                  fill="rgba(255,255,255,0.35)"
                  fontSize={8}
                  fontFamily="monospace"
                >
                  {(vol / 1000).toFixed(1)}M TEU
                </text>
              </g>
            )
          })}

          {/* Flow curves */}
          {flows.slice(0, 15).map((flow, i) => {
            const x1 = regionX(flow.from) + NODE_WIDTH
            const x2 = regionX(flow.to)
            const flowHeight = Math.max(2, flow.volume * heightScale * 0.08)

            const y1 = (regionYOffsets[flow.from] ?? PADDING_Y)
            const y2 = (regionYOffsets[flow.to] ?? PADDING_Y)
            regionYOffsets[flow.from] = y1 + flowHeight + 2
            regionYOffsets[flow.to] = y2 + flowHeight + 2

            const midX = (x1 + x2) / 2

            const pathD = `M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2} L ${x2} ${y2 + flowHeight} C ${midX} ${y2 + flowHeight}, ${midX} ${y1 + flowHeight}, ${x1} ${y1 + flowHeight} Z`

            return (
              <path
                key={i}
                d={pathD}
                fill={flow.color}
                fillOpacity={0.25}
                stroke={flow.color}
                strokeOpacity={0.5}
                strokeWidth={0.5}
              />
            )
          })}
        </svg>

        <div className="text-center mt-2">
          <span
            className="text-[10px] font-mono tracking-wider"
            style={{ color: 'rgba(255,255,255,0.25)' }}
          >
            Based on simulated annual trade volumes (thousands TEU)
          </span>
        </div>
      </div>
    </div>
  )
}
