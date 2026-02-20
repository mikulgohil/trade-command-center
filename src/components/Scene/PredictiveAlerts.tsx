'use client'

import { useRef, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Html } from '@react-three/drei'
import { useSimulationStore } from '@/state/useSimulationStore'
import { ports } from '@/data/ports'
import { latLngToVector3 } from '@/lib/latLngToVector3'
import { GLOBE_RADIUS, PORT_SURFACE_OFFSET } from '@/lib/constants'

interface PredictiveAlert {
  id: string
  portId: string
  position: THREE.Vector3
  message: string
  probability: number
  countdownEnd: number // timestamp when prediction resolves
  resolved: boolean
  resolvedAs: 'occurred' | 'averted' | null
}

const PREDICTION_TEMPLATES = [
  { msg: 'Congestion predicted in {time}', portBias: ['singapore', 'mumbai', 'los-angeles', 'shanghai'] },
  { msg: 'Vessel bunching alert in {time}', portBias: ['hong-kong', 'busan', 'rotterdam'] },
  { msg: 'Weather delay expected in {time}', portBias: ['santos', 'durban', 'vancouver'] },
  { msg: 'Equipment strain forecast in {time}', portBias: ['jebel-ali', 'antwerp', 'jeddah'] },
]

const PREDICTION_INTERVAL = 25000 // 25s between predictions
const PREDICTION_COUNTDOWN = 30 // seconds until resolution

function formatCountdown(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return m > 0 ? `${m}m ${s}s` : `${s}s`
}

export default function PredictiveAlerts() {
  const [alerts, setAlerts] = useState<PredictiveAlert[]>([])
  const lastPrediction = useRef(0)
  const alertMeshes = useRef<Map<string, THREE.Mesh>>(new Map())
  const resolvedIds = useRef<Set<string>>(new Set())

  // Generate predictions periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const sim = useSimulationStore.getState()
      if (!sim.isRunning) return

      // Don't stack too many
      setAlerts((prev) => {
        if (prev.filter((a) => !a.resolved).length >= 3) return prev

        const template = PREDICTION_TEMPLATES[Math.floor(Math.random() * PREDICTION_TEMPLATES.length)]
        const portPool = template.portBias
        const portId = portPool[Math.floor(Math.random() * portPool.length)]
        const port = ports.find((p) => p.id === portId)
        if (!port) return prev

        // Don't duplicate same port
        if (prev.some((a) => a.portId === portId && !a.resolved)) return prev

        const position = latLngToVector3(port.lat, port.lng, GLOBE_RADIUS + PORT_SURFACE_OFFSET + 0.08)
        const now = performance.now() / 1000
        const countdown = PREDICTION_COUNTDOWN + Math.random() * 15

        return [...prev, {
          id: `prediction-${Date.now()}-${portId}`,
          portId,
          position,
          message: template.msg.replace('{time}', formatCountdown(countdown)),
          probability: 65 + Math.floor(Math.random() * 30),
          countdownEnd: now + countdown,
          resolved: false,
          resolvedAs: null,
        }]
      })
    }, PREDICTION_INTERVAL)

    return () => clearInterval(interval)
  }, [])

  // Update alerts each frame — countdown + resolution
  useFrame(() => {
    const now = performance.now() / 1000

    setAlerts((prev) => {
      let changed = false
      const next = prev.map((alert) => {
        if (alert.resolved) return alert
        // Prevent double-resolution across batched updates
        if (resolvedIds.current.has(alert.id)) return alert

        const remaining = alert.countdownEnd - now
        if (remaining <= 0) {
          // Resolve: 70% chance it occurs, 30% averted
          const occurred = Math.random() < 0.7
          changed = true
          resolvedIds.current.add(alert.id)

          if (occurred) {
            // Defer store update to avoid cross-component setState during render
            setTimeout(() => {
              useSimulationStore.getState().addEvent({
                id: `pred-event-${alert.id}-${Math.random().toString(36).slice(2, 6)}`,
                timestamp: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                label: `AI prediction confirmed — congestion at ${ports.find((p) => p.id === alert.portId)?.name ?? alert.portId}`,
                severity: 'warning',
                portId: alert.portId,
              })
            }, 0)
          }

          return {
            ...alert,
            resolved: true,
            resolvedAs: occurred ? 'occurred' as const : 'averted' as const,
          }
        }

        return alert
      }).filter((alert) => {
        // Remove resolved alerts after 5s
        if (alert.resolved) {
          const elapsed = now - alert.countdownEnd
          if (elapsed >= 5) {
            resolvedIds.current.delete(alert.id)
            return false
          }
        }
        return true
      })

      return changed || next.length !== prev.length ? next : prev
    })
  })

  return (
    <>
      {alerts.map((alert) => {
        const remaining = Math.max(0, alert.countdownEnd - performance.now() / 1000)
        const isResolved = alert.resolved
        const iconColor = isResolved
          ? alert.resolvedAs === 'averted' ? '#3DFF88' : '#FF4D6D'
          : '#FFB020'

        return (
          <group key={alert.id} position={alert.position}>
            {/* Pulsing warning marker */}
            <mesh>
              <octahedronGeometry args={[0.04, 0]} />
              <meshBasicMaterial
                color={iconColor}
                transparent
                opacity={isResolved ? 0.5 : 0.9}
                toneMapped={false}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
              />
            </mesh>

            {/* HTML tooltip */}
            <Html
              center
              style={{ pointerEvents: 'none', transform: 'translateY(-24px)' }}
            >
              <div
                className="px-2 py-1 rounded-md whitespace-nowrap"
                style={{
                  background: 'rgba(8, 16, 35, 0.92)',
                  border: `1px solid ${iconColor}40`,
                  backdropFilter: 'blur(6px)',
                  minWidth: 120,
                }}
              >
                {!isResolved ? (
                  <>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px]" style={{ color: '#FFB020' }}>&#9888;</span>
                      <span className="text-[9px] font-mono tracking-wide" style={{ color: '#FFB020' }}>
                        AI PREDICTION
                      </span>
                    </div>
                    <div className="text-[8px] font-mono mt-0.5" style={{ color: 'rgba(255,255,255,0.7)' }}>
                      {alert.message}
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-[8px] font-mono" style={{ color: 'rgba(255,255,255,0.4)' }}>
                        {formatCountdown(remaining)}
                      </span>
                      <span className="text-[8px] font-mono" style={{ color: '#FFB020' }}>
                        {alert.probability}% likely
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px]">{alert.resolvedAs === 'averted' ? '✓' : '!'}</span>
                    <span
                      className="text-[9px] font-mono tracking-wide"
                      style={{ color: iconColor }}
                    >
                      {alert.resolvedAs === 'averted' ? 'AVERTED' : 'CONFIRMED'}
                    </span>
                  </div>
                )}
              </div>
            </Html>
          </group>
        )
      })}
    </>
  )
}
