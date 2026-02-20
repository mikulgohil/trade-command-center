'use client'

import { useRef, useMemo, useCallback } from 'react'
import { useFrame, useThree, type ThreeEvent } from '@react-three/fiber'
import * as THREE from 'three'
import { ports } from '@/data/ports'
import { latLngToVector3 } from '@/lib/latLngToVector3'
import { useSelectionStore } from '@/state/useSelectionStore'
import { GLOBE_RADIUS, PORT_SURFACE_OFFSET, PORT_MARKER_RADIUS, PORT_HOVER_SCALE } from '@/lib/constants'
import PortRing from './PortRing'

const tempMatrix = new THREE.Matrix4()
const tempVec = new THREE.Vector3()
const tempColor = new THREE.Color()

const NORMAL_COLOR = new THREE.Color('#33D6FF')
const HOVER_COLOR = new THREE.Color('#19E6C1')

export default function Ports() {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const { camera } = useThree()

  // Precompute port positions
  const portPositions = useMemo(() => {
    return ports.map((port) =>
      latLngToVector3(port.lat, port.lng, GLOBE_RADIUS + PORT_SURFACE_OFFSET)
    )
  }, [])

  // Set initial instance transforms
  useMemo(() => {
    if (!meshRef.current) return
    ports.forEach((_, i) => {
      tempMatrix.makeTranslation(portPositions[i].x, portPositions[i].y, portPositions[i].z)
      meshRef.current!.setMatrixAt(i, tempMatrix)
      meshRef.current!.setColorAt(i, NORMAL_COLOR)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true
  }, [portPositions])

  // Animate hovered port scale
  useFrame(() => {
    if (!meshRef.current) return
    const hoveredId = useSelectionStore.getState().hoveredPortId
    const selectedId = useSelectionStore.getState().selectedPortId

    ports.forEach((port, i) => {
      const isHovered = port.id === hoveredId
      const isSelected = port.id === selectedId
      const scale = isSelected ? PORT_HOVER_SCALE * 1.1 : isHovered ? PORT_HOVER_SCALE : 1.0

      tempVec.copy(portPositions[i])
      tempMatrix.makeTranslation(tempVec.x, tempVec.y, tempVec.z)
      tempMatrix.scale(tempVec.set(scale, scale, scale))
      meshRef.current!.setMatrixAt(i, tempMatrix)

      tempColor.copy(isHovered || isSelected ? HOVER_COLOR : NORMAL_COLOR)
      meshRef.current!.setColorAt(i, tempColor)
    })

    meshRef.current.instanceMatrix.needsUpdate = true
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true
  })

  const handlePointerOver = useCallback((e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    const idx = e.instanceId
    if (idx !== undefined && ports[idx]) {
      useSelectionStore.getState().setHovered(ports[idx].id)
      document.body.style.cursor = 'pointer'
    }
  }, [])

  const handlePointerOut = useCallback(() => {
    useSelectionStore.getState().setHovered(null)
    document.body.style.cursor = 'auto'
  }, [])

  const handleClick = useCallback((e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    const idx = e.instanceId
    if (idx !== undefined && ports[idx]) {
      useSelectionStore.getState().setSelected(ports[idx].id)
    }
  }, [])

  // Find selected port for ring
  const selectedPortId = useSelectionStore((s) => s.selectedPortId)
  const selectedIndex = ports.findIndex((p) => p.id === selectedPortId)
  const selectedPosition = selectedIndex >= 0 ? portPositions[selectedIndex] : null

  return (
    <>
      <instancedMesh
        ref={meshRef}
        args={[undefined, undefined, ports.length]}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onClick={handleClick}
      >
        <sphereGeometry args={[PORT_MARKER_RADIUS, 16, 16]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>

      {selectedPosition && (
        <PortRing position={selectedPosition} />
      )}
    </>
  )
}
