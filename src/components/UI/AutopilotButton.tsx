'use client'

import { useAutopilotStore } from '@/state/useAutopilotStore'

interface AutopilotButtonProps {
  onReplay: () => void
}

export default function AutopilotButton({ onReplay }: AutopilotButtonProps) {
  const isCompleted = useAutopilotStore((s) => s.isCompleted)
  const wasInterrupted = useAutopilotStore((s) => s.wasInterrupted)
  const isActive = useAutopilotStore((s) => s.isActive)

  const showButton = (isCompleted || wasInterrupted) && !isActive

  if (!showButton) return null

  return (
    <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20 pointer-events-auto">
      <button
        onClick={onReplay}
        className="px-6 py-3 rounded-full bg-accent-cyan/10 border border-accent-cyan/30 text-accent-cyan text-sm font-semibold tracking-wide backdrop-blur-xl transition-all duration-300 hover:bg-accent-cyan/20 hover:border-accent-cyan/50 hover:scale-105 active:scale-95"
      >
        Replay Demo &rarr;
      </button>
    </div>
  )
}
