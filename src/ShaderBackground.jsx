import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function ShaderBackground() {
  const material = useRef()
  
  useFrame((state) => {
    if (material.current) {
      material.current.uniforms.uTime.value = state.clock.elapsedTime
    }
  })

  const shader = {
    uniforms: {
      uTime: { value: 0 },
      uColor1: { value: new THREE.Color('#be185d') }, // Pink
      uColor2: { value: new THREE.Color('#1e3a8a') }  // Navy
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform vec3 uColor1;
      uniform vec3 uColor2;
      varying vec2 vUv;
      
      void main() {
        vec2 pos = vUv * 3.0;
        float wave = sin(pos.x + uTime * 0.5) * cos(pos.y + uTime * 0.3);
        float wave2 = sin(pos.y * 2.0 - uTime * 0.2);
        
        float blend = smoothstep(-1.0, 1.0, wave + wave2);
        vec3 finalColor = mix(uColor1, uColor2, blend);
        
        gl_FragColor = vec4(finalColor, 1.0);
      }
    `
  }

  return (
    <mesh position={[0, 0, -10]}>
      {/* Massive plane to cover the background */}
      <planeGeometry args={[100, 100]} />
      <shaderMaterial ref={material} args={[shader]} depthWrite={false} />
    </mesh>
  )
}
