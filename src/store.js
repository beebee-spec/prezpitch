import { create } from 'zustand'

export const useStore = create((set) => ({
  score: 0,
  time: 0,
  storyIndex: -1,
  initiativesCollected: [],
  gameOver: false,
  
  // Joystick raw state
  joystick: { x: 0, y: 0 },
  
  addScore: (points) => set((state) => ({ score: state.score + points })),
  collectInitiative: (id) => set((state) => {
    if (state.initiativesCollected.includes(id)) return state
    const newItems = [...state.initiativesCollected, id]
    return {
      initiativesCollected: newItems,
      storyIndex: id,
      score: state.score + 100, // bonus for story items
      gameOver: newItems.length >= 5
    }
  }),
  closeStory: () => set({ storyIndex: -1 }),
  setJoystick: (x, y) => set({ joystick: { x, y } }),
  tickTime: () => set((state) => ({ time: state.time + 1 }))
}))
