import { create } from 'zustand'

export type AutopilotPhase = 'idle' | 'boot' | 'pulse' | 'focus' | 'disruption' | 'summary'

interface AutopilotState {
  isActive: boolean
  isCompleted: boolean
  wasInterrupted: boolean
  phase: AutopilotPhase
  start: () => void
  interrupt: () => void
  complete: () => void
  setPhase: (phase: AutopilotPhase) => void
  reset: () => void
}

export const useAutopilotStore = create<AutopilotState>((set) => ({
  isActive: false,
  isCompleted: false,
  wasInterrupted: false,
  phase: 'idle',

  start: () => set({ isActive: true, isCompleted: false, wasInterrupted: false, phase: 'boot' }),
  interrupt: () => set({ isActive: false, wasInterrupted: true, phase: 'idle' }),
  complete: () => set({ isActive: false, isCompleted: true, phase: 'idle' }),
  setPhase: (phase) => set({ phase }),
  reset: () => set({ isActive: false, isCompleted: false, wasInterrupted: false, phase: 'idle' }),
}))
