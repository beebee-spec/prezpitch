import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Image } from '@react-three/drei'

export default function DomeGallery({ images }) {
  const group1 = useRef()
  const group2 = useRef()
  const group3 = useRef()

  const items = useMemo(() => {
    // Duplicate images for denser, massive infinite gallery
    const arr = [...images, ...images, ...images]
    const count = arr.length
    const radius = 45 // massive screen-spanning radius
    const heightLevels = 3
    const itemsPerLevel = count / heightLevels
    
    const levels = [[], [], []]
    
    for (let i = 0; i < count; i++) {
      const level = i % heightLevels
      const angle = (i / itemsPerLevel) * Math.PI * 2
      
      const x = Math.sin(angle) * radius
      const z = Math.cos(angle) * radius
      const y = (level - 1) * 14
      
      levels[level].push({
        url: arr[i],
        position: [x, y, z],
        rotation: [0, angle + Math.PI, 0]
      })
    }
    return levels
  }, [images])

  useFrame((state, delta) => {
    // Alternating rotations
    if (group1.current) group1.current.rotation.y += delta * 0.05
    if (group2.current) group2.current.rotation.y -= delta * 0.05
    if (group3.current) group3.current.rotation.y += delta * 0.05
  })

  const renderLevel = (levelArr) => levelArr.map((item, i) => (
    <Image 
      key={i} 
      url={item.url} 
      position={item.position} 
      rotation={item.rotation} 
      scale={[12, 10]} 
      transparent
      opacity={0.5}
    />
  ))

  return (
    <group position={[0, 0, -35]}>
      <group ref={group1}>{renderLevel(items[0])}</group>
      <group ref={group2}>{renderLevel(items[1])}</group>
      <group ref={group3}>{renderLevel(items[2])}</group>
    </group>
  )
}
