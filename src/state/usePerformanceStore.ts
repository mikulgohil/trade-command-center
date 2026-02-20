import { create } from 'zustand'

interface PerformanceState {
  fps: number
  reducedEffects: boolean
  setFPS: (fps: number) => void
  setReducedEffects: (reduced: boolean) => void
}

export const usePerformanceStore = create<PerformanceState>((set) => ({
  fps: 60,
  reducedEffects: false,
  setFPS: (fps) => set({ fps }),
  setReducedEffects: (reduced) => set({ reducedEffects: reduced }),
}))
