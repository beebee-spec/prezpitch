import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Image } from '@react-three/drei'
import { useStore } from './store'
import { playerPos } from './Player'
import { audio } from './AudioEngine'

export default function Obstacle() {
  const ref = useRef()
  
  const startPos = useMemo(() => [(Math.random() - 0.5) * 40, (Math.random() - 0.5) * 40, 0], [])
  const velocity = useMemo(() => [Math.random() > 0.5 ? 4 : -4, Math.random() > 0.5 ? 4 : -4], [])

  useFrame((state, delta) => {
    if (!ref.current) return
    const { gameOver, storyIndex, stunned, setStunned, addScore } = useStore.getState()
    if (gameOver || storyIndex !== -1) return

    // Bouncing movement
    ref.current.position.x += velocity[0] * delta
    ref.current.position.y += velocity[1] * delta

    if (ref.current.position.x > 25 || ref.current.position.x < -25) velocity[0] *= -1
    if (ref.current.position.y > 25 || ref.current.position.y < -25) velocity[1] *= -1

    // Collision
    const dist = playerPos.distanceTo(ref.current.position)
    if (dist < 1.8 && !stunned) {
      audio.playDamage()
      setStunned(true)
      addScore(-5)
      setTimeout(() => useStore.getState().setStunned(false), 2000) // stunned for 2s
    }
  })

  return (
    <group ref={ref} position={startPos}>
      <Image url="/images/cloud.png" scale={[2, 2]} transparent />
      <mesh position={[0,0,-0.1]}>
         <circleGeometry args={[1.5, 16]} />
         <meshBasicMaterial color="#ef4444" transparent opacity={0.6} />
      </mesh>
    </group>
  )
}
