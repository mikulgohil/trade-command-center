'use client'

import { useRef, useEffect } from 'react'

interface SparklineProps {
  value: number
  color?: string
  width?: number
  height?: number
  maxPoints?: number
}

export default function Sparkline({
  value,
  color = 'rgba(51, 214, 255, 0.4)',
  width = 60,
  height = 24,
  maxPoints = 20,
}: SparklineProps) {
  const historyRef = useRef<number[]>([value])
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    const history = historyRef.current
    history.push(value)
    if (history.length > maxPoints) {
      history.shift()
    }

    if (!svgRef.current) return

    const min = Math.min(...history)
    const max = Math.max(...history)
    const range = max - min || 1

    const points = history.map((v, i) => {
      const x = (i / (maxPoints - 1)) * width
      const y = height - ((v - min) / range) * (height - 4) - 2
      return `${x},${y}`
    }).join(' ')

    const polyline = svgRef.current.querySelector('polyline')
    if (polyline) {
      polyline.setAttribute('points', points)
    }
  }, [value, width, height, maxPoints])

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      className="overflow-visible"
    >
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={`0,${height / 2}`}
      />
    </svg>
  )
}
