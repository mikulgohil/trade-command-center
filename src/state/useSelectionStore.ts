import { create } from 'zustand'

interface SelectionState {
  hoveredPortId: string | null
  selectedPortId: string | null
  setHovered: (id: string | null) => void
  setSelected: (id: string | null) => void
  clearSelection: () => void
}

export const useSelectionStore = create<SelectionState>((set) => ({
  hoveredPortId: null,
  selectedPortId: null,
  setHovered: (id) => set({ hoveredPortId: id }),
  setSelected: (id) => set({ selectedPortId: id }),
  clearSelection: () => set({ hoveredPortId: null, selectedPortId: null }),
}))
