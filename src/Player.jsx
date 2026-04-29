import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Image } from '@react-three/drei'
import { useStore } from './store'
import * as THREE from 'three'

// Simple global reference to player position for collision checking
export const playerPos = new THREE.Vector3()

export default function Player() {
  const playerRef = useRef()
  const speed = 10
  
  // Track keys
  const keys = useRef({ w: false, a: false, s: false, d: false, ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false })

  useEffect(() => {
    const down = (e) => { if (keys.current[e.key] !== undefined) keys.current[e.key] = true }
    const up = (e) => { if (keys.current[e.key] !== undefined) keys.current[e.key] = false }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
    }
  }, [])

  useFrame((state, delta) => {
    if (!playerRef.current) return
    const gameOver = useStore.getState().gameOver
    const storyIndex = useStore.getState().storyIndex
    if (gameOver || storyIndex !== -1) return // Freeze movement

    const joystick = useStore.getState().joystick
    let dx = 0
    let dy = 0

    // Keyboard
    if (keys.current.w || keys.current.ArrowUp) dy += 1
    if (keys.current.s || keys.current.ArrowDown) dy -= 1
    if (keys.current.d || keys.current.ArrowRight) dx += 1
    if (keys.current.a || keys.current.ArrowLeft) dx -= 1

    // Add Joystick
    dx += joystick.x
    dy += joystick.y

    // Normalize diagonal
    if (dx !== 0 || dy !== 0) {
      const length = Math.sqrt(dx * dx + dy * dy)
      // Cap at 1 so joystick doesn't stack with keyboard excessively
      if (length > 1) {
        dx /= length
        dy /= length
      }
    }

    // Apply speed
    playerRef.current.position.x += dx * speed * delta
    playerRef.current.position.y += dy * speed * delta
    
    // Bounds check
    const bounds = 20
    if (playerRef.current.position.x > bounds) playerRef.current.position.x = bounds
    if (playerRef.current.position.x < -bounds) playerRef.current.position.x = -bounds
    if (playerRef.current.position.y > bounds) playerRef.current.position.y = bounds
    if (playerRef.current.position.y < -bounds) playerRef.current.position.y = -bounds

    // Update global pos for AABB checks
    playerPos.copy(playerRef.current.position)
    
    // Camera follow
    state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, playerRef.current.position.x, 0.1)
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, playerRef.current.position.y, 0.1)

    // Bobbing animation
    const isMoving = Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1
    if (isMoving) {
      playerRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 15) * 0.1
    } else {
      playerRef.current.rotation.z = 0
    }
  })

  return (
    <group ref={playerRef} position={[0, 0, 0]}>
      <Image url="/images/cat.png" scale={[2, 2]} transparent />
    </group>
  )
}
