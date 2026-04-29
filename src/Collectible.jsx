import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Image } from '@react-three/drei'
import { useStore } from './store'
import { playerPos } from './Player'

export default function Collectible({ position, type = 'vote', id = null }) {
  const ref = useRef()
  const [collected, setCollected] = useState(false)
  const addScore = useStore(state => state.addScore)
  const collectInitiative = useStore(state => state.collectInitiative)
  const collectedItems = useStore(state => state.initiativesCollected)
  
  if (type === 'initiative' && collectedItems.includes(id)) {
      if(!collected) setCollected(true)
  }

  useFrame((state) => {
    if (collected || !ref.current) return
    
    // Float animation
    ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2 + position[0]) * 0.2
    
    // Simple AABB Collision
    const dist = playerPos.distanceTo(ref.current.position)
    if (dist < 1.5) {
      setCollected(true)
      if (type === 'vote') {
        addScore(10)
      } else if (type === 'initiative') {
        collectInitiative(id)
      }
    }
  })

  if (collected) return null

  const url = type === 'vote' ? '/images/flower.png' : '/images/waffle.png'
  // Waffles are bigger and glow more
  const scale = type === 'vote' ? [1, 1] : [2, 2]
  // Add an emissive material for post-processing bloom
  return (
    <group ref={ref} position={position}>
      <Image url={url} scale={scale} transparent toneMapped={false} />
      {/* Bloom glow backing */}
      <mesh position={[0,0,-0.1]}>
         <circleGeometry args={[scale[0] * 0.6, 16]} />
         <meshBasicMaterial color={type === 'vote' ? '#f472b6' : '#fef08a'} transparent opacity={0.5} />
      </mesh>
    </group>
  )
}
