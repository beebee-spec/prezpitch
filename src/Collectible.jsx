import { useRef, useState, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Image } from '@react-three/drei'
import { useStore } from './store'
import { playerPos } from './Player'
import { audio } from './AudioEngine'

export default function Collectible({ initialPosition, type = 'vote', id = null }) {
  const ref = useRef()
  const [collected, setCollected] = useState(false)
  
  // Random drift properties
  const driftSpeed = useMemo(() => Math.random() * 2 + 1, [])
  const driftOffset = useMemo(() => Math.random() * Math.PI * 2, [])

  useFrame((state, delta) => {
    if (collected || !ref.current) return
    const { gameOver, storyIndex, initiativesCollected, addScore, collectInitiative } = useStore.getState()
    
    if (gameOver || storyIndex !== -1) return
    if (type === 'initiative' && initiativesCollected.includes(id)) {
        if(!collected) setCollected(true)
        return
    }

    // Drifting logic for votes
    if (type === 'vote') {
      ref.current.position.x = initialPosition[0] + Math.sin(state.clock.elapsedTime * driftSpeed + driftOffset) * 5
      ref.current.position.y = initialPosition[1] + Math.cos(state.clock.elapsedTime * driftSpeed * 0.8 + driftOffset) * 5
    } else {
      ref.current.position.y = initialPosition[1] + Math.sin(state.clock.elapsedTime * 2 + initialPosition[0]) * 0.5
    }
    
    const dist = playerPos.distanceTo(ref.current.position)
    if (dist < 1.8) {
      setCollected(true)
      if (type === 'vote') {
        audio.playBloop()
        addScore(10)
      } else if (type === 'initiative') {
        audio.playChord()
        collectInitiative(id)
      }
    }
  })

  if (collected) return null

  const url = type === 'vote' ? '/images/flower.png' : '/images/waffle.png'
  const scale = type === 'vote' ? [1, 1] : [2.5, 2.5]
  
  return (
    <group ref={ref} position={initialPosition}>
      <Image url={url} scale={scale} transparent toneMapped={false} />
      <mesh position={[0,0,-0.1]}>
         <circleGeometry args={[scale[0] * 0.6, 16]} />
         <meshBasicMaterial color={type === 'vote' ? '#f472b6' : '#fef08a'} transparent opacity={0.5} />
      </mesh>
    </group>
  )
}
