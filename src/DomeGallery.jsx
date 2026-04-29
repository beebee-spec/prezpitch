import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Image } from '@react-three/drei'
import * as THREE from 'three'

export default function DomeGallery({ images }) {
  const groupRef = useRef()

  // Generate a cylinder of images
  const items = useMemo(() => {
    const arr = []
    const count = images.length
    const radius = 25
    const heightLevels = 3
    
    for (let i = 0; i < count; i++) {
      const angle = (i / (count / heightLevels)) * Math.PI * 2
      const level = i % heightLevels
      
      const x = Math.sin(angle) * radius
      const z = Math.cos(angle) * radius
      const y = (level - 1) * 12 // -12, 0, 12
      
      arr.push({
        url: images[i],
        position: [x, y, z],
        // point towards center (0, y, 0)
        rotation: [0, angle + Math.PI, 0]
      })
    }
    return arr
  }, [images])

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.05
    }
  })

  return (
    <group ref={groupRef} position={[0, 0, -35]}>
      {items.map((item, i) => (
        <Image 
          key={i} 
          url={item.url} 
          position={item.position} 
          rotation={item.rotation} 
          scale={[10, 8]} 
          transparent
          opacity={0.6}
        />
      ))}
    </group>
  )
}
