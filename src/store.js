import { create } from 'zustand'

export const useStore = create((set) => ({
  score: 0,
  time: 0,
  storyIndex: -1,
  initiativesCollected: [],
  gameOver: false,
  
  joystick: { x: 0, y: 0 },
  dashActive: false,
  stunned: false,
  
  addScore: (points) => set((state) => ({ score: Math.max(0, state.score + points) })),
  collectInitiative: (id) => set((state) => {
    if (state.initiativesCollected.includes(id)) return state
    const newItems = [...state.initiativesCollected, id]
    const sequentialStoryIndex = newItems.length - 1 // Sequentially show 0, 1, 2, 3, 4
    return {
      initiativesCollected: newItems,
      storyIndex: sequentialStoryIndex,
      score: state.score + 50,
      gameOver: newItems.length >= 5
    }
  }),
  closeStory: () => set({ storyIndex: -1 }),
  setJoystick: (x, y) => set({ joystick: { x, y } }),
  setDash: (active) => set({ dashActive: active }),
  setStunned: (stunned) => set({ stunned }),
  tickTime: () => set((state) => ({ time: state.time + 1 }))
}))
