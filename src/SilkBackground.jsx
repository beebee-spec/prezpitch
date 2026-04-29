import React, { forwardRef, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Color } from 'three';
import * as THREE from 'three';

const hexToNormalizedRGB = (hex) => {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;
  return [r, g, b];
};

const vertexShader = `
varying vec2 vUv;
varying vec3 vPosition;

void main() {
  vPosition = position;
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
varying vec2 vUv;
varying vec3 vPosition;

uniform float uTime;
uniform vec3  uColor;
uniform float uSpeed;
uniform float uScale;
uniform float uRotation;
uniform float uNoiseIntensity;

const float e = 2.71828182845904523536;

float noise(vec2 texCoord) {
  float G = e;
  vec2  r = (G * sin(G * texCoord));
  return fract(r.x * r.y * (1.0 + texCoord.x));
}

vec2 rotateUvs(vec2 uv, float angle) {
  float c = cos(angle);
  float s = sin(angle);
  mat2  rot = mat2(c, -s, s, c);
  return rot * uv;
}

void main() {
  float rnd        = noise(gl_FragCoord.xy);
  vec2  uv         = rotateUvs(vUv * uScale, uRotation);
  vec2  tex        = uv * uScale;
  float tOffset    = uSpeed * uTime;

  tex.y += 0.03 * sin(8.0 * tex.x - tOffset);

  float pattern = 0.6 +
                  0.4 * sin(5.0 * (tex.x + tex.y +
                                   cos(3.0 * tex.x + 5.0 * tex.y) +
                                   0.02 * tOffset) +
                           sin(20.0 * (tex.x + tex.y - 0.1 * tOffset)));

  vec4 col = vec4(uColor, 1.0) * vec4(pattern) - rnd / 15.0 * uNoiseIntensity;
  col.a = 1.0;
  gl_FragColor = col;
}
`;

const color1 = new THREE.Color('#1e3a8a'); // Deep Blue
const color2 = new THREE.Color('#581c87'); // Deep Purple
const color3 = new THREE.Color('#0f766e'); // Deep Teal
const targetColor = new THREE.Color();

const SilkPlane = forwardRef(function SilkPlane({ uniforms, ...props }, ref) {
  useFrame((state, delta) => {
    if (ref.current) {
      const mat = ref.current.material;
      mat.uniforms.uTime.value += 0.1 * delta;
      
      // Slowly cycle through creative colors to break monotony
      const t = state.clock.elapsedTime * 0.1;
      const phase = t % 3;
      if (phase < 1) targetColor.lerpColors(color1, color2, phase);
      else if (phase < 2) targetColor.lerpColors(color2, color3, phase - 1);
      else targetColor.lerpColors(color3, color1, phase - 2);
      
      mat.uniforms.uColor.value.copy(targetColor);
    }
  });

  return (
    <mesh ref={ref} {...props}>
      <planeGeometry args={[1, 1, 1, 1]} />
      <shaderMaterial uniforms={uniforms} vertexShader={vertexShader} fragmentShader={fragmentShader} depthWrite={false} />
    </mesh>
  );
});

export default function SilkBackground({ speed = 5, scale = 1, color = '#1e3a8a', noiseIntensity = 1.5, rotation = 0 }) {
  const meshRef = useRef(null);

  const uniforms = useMemo(
    () => ({
      uSpeed: { value: speed },
      uScale: { value: scale },
      uNoiseIntensity: { value: noiseIntensity },
      uColor: { value: new Color(...hexToNormalizedRGB(color)) },
      uRotation: { value: rotation },
      uTime: { value: 0 }
    }),
    [speed, scale, noiseIntensity, color, rotation]
  );

  return (
    <SilkPlane ref={meshRef} uniforms={uniforms} scale={[250, 250, 1]} position={[0, 0, -45]} />
  );
}
