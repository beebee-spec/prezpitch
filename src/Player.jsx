import { useRef, useEffect, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Image } from '@react-three/drei'
import { useStore } from './store'
import * as THREE from 'three'
import { audio } from './AudioEngine'

export const playerPos = new THREE.Vector3()

export default function Player() {
  const playerRef = useRef()
  const baseSpeed = 10
  const dashMultiplier = 3
  
  const keys = useRef({ w: false, a: false, s: false, d: false, ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false, ' ': false })
  const [dashCooldown, setDashCooldown] = useState(0)

  useEffect(() => {
    const down = (e) => { 
      if (keys.current[e.key] !== undefined) keys.current[e.key] = true 
      if (e.key === ' ') {
         // trigger dash
         if (!useStore.getState().stunned && dashCooldown <= 0) {
           useStore.getState().setDash(true)
           audio.playDash()
         }
      }
    }
    const up = (e) => { 
      if (keys.current[e.key] !== undefined) keys.current[e.key] = false 
      if (e.key === ' ') useStore.getState().setDash(false)
    }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
    }
  }, [dashCooldown])

  useFrame((state, delta) => {
    if (!playerRef.current) return
    const { gameOver, storyIndex, stunned, dashActive, setDash } = useStore.getState()
    
    if (gameOver || storyIndex !== -1) return

    if (stunned) {
      playerRef.current.rotation.z += delta * 10 // spin while stunned
      return
    }

    if (dashCooldown > 0) {
      setDashCooldown(prev => prev - delta)
      if (dashCooldown <= 0 && keys.current[' '] === false) setDash(false)
    }

    // Dash logic (mobile uses dashActive from store)
    let currentSpeed = baseSpeed
    if (dashActive && dashCooldown <= 0) {
      currentSpeed = baseSpeed * dashMultiplier
      setDashCooldown(1.5) // 1.5s cooldown
      setTimeout(() => useStore.getState().setDash(false), 200) // dash lasts 0.2s
    }

    const joystick = useStore.getState().joystick
    let dx = 0
    let dy = 0

    if (keys.current.w || keys.current.ArrowUp) dy += 1
    if (keys.current.s || keys.current.ArrowDown) dy -= 1
    if (keys.current.d || keys.current.ArrowRight) dx += 1
    if (keys.current.a || keys.current.ArrowLeft) dx -= 1

    dx += joystick.x
    dy += joystick.y

    if (dx !== 0 || dy !== 0) {
      const length = Math.sqrt(dx * dx + dy * dy)
      if (length > 1) {
        dx /= length
        dy /= length
      }
    }

    playerRef.current.position.x += dx * currentSpeed * delta
    playerRef.current.position.y += dy * currentSpeed * delta
    
    const bounds = 25
    if (playerRef.current.position.x > bounds) playerRef.current.position.x = bounds
    if (playerRef.current.position.x < -bounds) playerRef.current.position.x = -bounds
    if (playerRef.current.position.y > bounds) playerRef.current.position.y = bounds
    if (playerRef.current.position.y < -bounds) playerRef.current.position.y = -bounds

    playerPos.copy(playerRef.current.position)
    
    // Smooth camera follow
    state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, playerRef.current.position.x, 0.1)
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, playerRef.current.position.y, 0.1)

    const isMoving = Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1
    if (isMoving) {
      playerRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 15) * 0.1
    } else {
      playerRef.current.rotation.z = THREE.MathUtils.lerp(playerRef.current.rotation.z, 0, 0.1)
    }
    
    if (dashActive) {
      playerRef.current.scale.setScalar(2.5)
    } else {
      playerRef.current.scale.setScalar(2)
    }
  })

  return (
    <group ref={playerRef} position={[0, 0, 0]}>
      <Image url="/images/cat.png" scale={[1.5, 1.5]} transparent />
      {useStore.getState().stunned && (
        <mesh position={[0, 0, -0.1]}>
          <circleGeometry args={[1.2, 16]} />
          <meshBasicMaterial color="red" transparent opacity={0.5} />
        </mesh>
      )}
    </group>
  )
}
