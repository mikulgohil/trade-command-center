import { create } from 'zustand'

interface ExecutiveState {
  isExecutive: boolean
  toggle: () => void
}

export const useExecutiveStore = create<ExecutiveState>((set) => ({
  isExecutive: false,
  toggle: () => set((state) => ({ isExecutive: !state.isExecutive })),
}))
