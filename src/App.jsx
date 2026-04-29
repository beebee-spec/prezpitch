import React, { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { PerspectiveCamera } from '@react-three/drei'
import { EffectComposer, Bloom, ChromaticAberration, Vignette, Pixelation } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import SilkBackground from './SilkBackground'
import DomeGallery from './DomeGallery'
import Player from './Player'
import Collectible from './Collectible'
import Obstacle from './Obstacle'
import JoystickUI from './Joystick'
import { useStore } from './store'
import { audio } from './AudioEngine'
import './index.css'

const INITIATIVES = [
  { id: 0, title: "Who is Bhargabi?", text: "Senior Content Member at CSF KNC. I've shown up, contributed, and grown over the last 2 years. I believe in the power of articulation—making the complex feel human." },
  { id: 1, title: "Why am I running?", text: "I have visions and I know how to put them into action. I want to build a tenure where people look back and say: that's when things really changed." },
  { id: 2, title: "Mystery Speaker & Unpopular Opinion", text: "Mystery Speaker: Building anticipation with clue-drops. Unpopular Opinion: A platform for spicy, thoughtful takes on policy. Members debate, audience votes." },
  { id: 3, title: "Day in the Life & CSF Files", text: "Civil Servant for a Day: Storytelling series narrating an officer's life. The CSF Files: Real governance problems solved creatively. CSF x Art: Visual storytelling." },
  { id: 4, title: "My Vision", text: "A space where people don't just show up—they show UP. Vote Bhargabi Medhi for President, CSF KNC 2026-27. Vision. Action. Impact." }
]

const ALL_IMAGES = [
  '/images/WhatsApp Image 2026-04-29 at 11.16.31 PM.jpeg',
  '/images/WhatsApp Image 2026-04-29 at 11.16.32 PM (1).jpeg',
  '/images/WhatsApp Image 2026-04-29 at 11.16.32 PM.jpeg',
  '/images/WhatsApp Image 2026-04-29 at 11.16.33 PM.jpeg',
  '/images/WhatsApp Image 2026-04-29 at 11.16.34 PM.jpeg',
  '/images/WhatsApp Image 2026-04-29 at 11.16.35 PM (1).jpeg',
  '/images/WhatsApp Image 2026-04-29 at 11.16.35 PM.jpeg',
  '/images/WhatsApp Image 2026-04-29 at 11.16.36 PM.jpeg',
  '/images/WhatsApp Image 2026-04-29 at 11.19.57 PM.jpeg',
  '/images/WhatsApp Image 2026-04-29 at 11.19.58 PM (1).jpeg',
  '/images/WhatsApp Image 2026-04-29 at 11.19.58 PM.jpeg',
  '/images/WhatsApp Image 2026-04-29 at 11.19.59 PM (1).jpeg',
  '/images/WhatsApp Image 2026-04-29 at 11.19.59 PM.jpeg',
  '/images/WhatsApp Image 2026-04-29 at 11.20.00 PM (1).jpeg',
  '/images/WhatsApp Image 2026-04-29 at 11.20.00 PM.jpeg',
  '/images/WhatsApp Image 2026-04-29 at 11.20.01 PM.jpeg',
  '/images/WhatsApp Image 2026-04-29 at 11.20.02 PM (1).jpeg',
  '/images/WhatsApp Image 2026-04-29 at 11.20.02 PM.jpeg',
  '/images/WhatsApp Image 2026-04-29 at 11.20.03 PM.jpeg',
  '/images/WhatsApp Image 2026-04-29 at 11.20.04 PM (1).jpeg',
  '/images/WhatsApp Image 2026-04-29 at 11.20.04 PM.jpeg',
]

function UI({ started, setStarted }) {
  const { score, time, storyIndex, closeStory, gameOver } = useStore()
  
  if (!started) {
    return (
      <div className="ui-layer" style={{ justifyContent: 'center', alignItems: 'center', background: 'rgba(0,0,0,0.8)', pointerEvents: 'auto' }}>
        <h1 style={{ fontFamily: 'Playfair Display', color: '#f472b6', fontSize: '4rem', margin: '0 0 20px 0', textAlign: 'center' }}>Vision. Action. Impact.</h1>
        <p style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Use WASD/Joystick to move. SPACE to dash.</p>
        <p style={{ color: '#fef08a', marginBottom: '0.5rem' }}>Collect Waffles to unlock the story. Collect Flowers for Votes!</p>
        <p style={{ color: '#ef4444', marginBottom: '2rem' }}>Avoid the bouncing red clouds!</p>
        <button className="start-btn" onClick={() => {
          audio.startBGM()
          setStarted(true)
        }}>Start Pitch</button>
      </div>
    )
  }

  return (
    <div className="ui-layer">
      <div className="glass-border"></div>
      <div className="score-board">
        <div>Votes: {score}</div>
        <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>Time: {time}s</div>
      </div>
      
      {storyIndex !== -1 && !gameOver && (
        <div className="story-modal">
          <h2>{INITIATIVES[storyIndex].title}</h2>
          <p>{INITIATIVES[storyIndex].text}</p>
          <button onClick={closeStory}>Continue Playing</button>
        </div>
      )}

      {gameOver && (
        <div className="story-modal" style={{ border: '4px solid #fef08a' }}>
          <h2>VISION. ACTION. IMPACT.</h2>
          <p>You collected all pieces of the pitch and {score} votes in {time} seconds!</p>
          <img src="/images/profile.jpeg" style={{ width: '150px', height: '150px', borderRadius: '50%', objectFit: 'cover', margin: '10px' }} />
          <p style={{ color: '#f472b6', fontWeight: 'bold' }}>Vote Bhargabi Medhi for CSF KNC President (2026-27)</p>
          <button onClick={() => window.location.reload()}>Replay</button>
        </div>
      )}
    </div>
  )
}

function GameLoop({ started }) {
  const tickTime = useStore(state => state.tickTime)
  React.useEffect(() => {
    if (!started) return
    const interval = setInterval(() => tickTime(), 1000)
    return () => clearInterval(interval)
  }, [tickTime, started])
  return null
}

export default function App() {
  const [started, setStarted] = useState(false)

  const votes = React.useMemo(() => Array.from({ length: 30 }).map((_, i) => ({
    id: i,
    initialPosition: [(Math.random() - 0.5) * 45, (Math.random() - 0.5) * 45, 0]
  })), [])

  const obstacles = React.useMemo(() => Array.from({ length: 8 }).map((_, i) => i), [])

  const initiatives = [
    { id: 0, initialPosition: [12, 12, 0] },
    { id: 1, initialPosition: [-15, 18, 0] },
    { id: 2, initialPosition: [18, -12, 0] },
    { id: 3, initialPosition: [-18, -18, 0] },
    { id: 4, initialPosition: [0, -22, 0] }
  ]

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 15]} fov={50} />
        <ambientLight intensity={1} />
        <fog attach="fog" args={['#1e3a8a', 15, 40]} />
        
        <SilkBackground speed={5} color="#be185d" noiseIntensity={1.5} rotation={0} />
        {started && <DomeGallery images={ALL_IMAGES} />}
        
        {votes.map(v => <Collectible key={`vote-${v.id}`} initialPosition={v.initialPosition} type="vote" />)}
        {initiatives.map(i => <Collectible key={`init-${i.id}`} initialPosition={i.initialPosition} type="initiative" id={i.id} />)}
        {obstacles.map(o => <Obstacle key={`obs-${o}`} />)}
        
        <Player />
        <GameLoop started={started} />
        
        <EffectComposer>
          <Bloom luminanceThreshold={0.4} luminanceSmoothing={0.9} height={300} />
          <ChromaticAberration blendFunction={BlendFunction.NORMAL} offset={[0.002, 0.002]} />
          <Vignette eskil={0.5} darkness={0.5} />
          <Pixelation granularity={2} />
        </EffectComposer>
      </Canvas>
      
      {started && <JoystickUI />}
      <UI started={started} setStarted={setStarted} />
    </div>
  )
}
