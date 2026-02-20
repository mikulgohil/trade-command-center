'use client'

import dynamic from 'next/dynamic'
import UIOverlay from '@/components/UI/UIOverlay'
import BootSequence from '@/components/UI/BootSequence'

const SceneCanvas = dynamic(
  () => import('@/components/Scene/SceneCanvas'),
  { ssr: false }
)

export default function Home() {
  return (
    <main className="relative w-screen h-screen overflow-hidden bg-bg">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a1628] via-bg to-[#050d1a]" />

      {/* 3D Canvas */}
      <SceneCanvas />

      {/* UI Overlay */}
      <UIOverlay />

      {/* Cinematic boot-up sequence — plays on first load */}
      <BootSequence />
    </main>
  )
}
