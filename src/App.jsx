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
  { 
    id: 0, 
    title: "Why am I running? (1/2)", 
    text: (
      <div style={{ textAlign: 'left', fontSize: '1.2rem' }}>
        <img src="/images/slide1.png" style={{ width: '100px', height: '100px', borderRadius: '10px', objectFit: 'cover', float: 'right', marginLeft: '15px', border: '2px dashed #be185d' }} alt="Graphic" />
        <p>1. A <strong>dot-connector</strong> with an <strong>endlessly curious mind</strong> — she <strong>researches deeply</strong>, <strong>writes sharply</strong>, and always makes even the driest <strong>current affairs</strong> feel <strong>genuinely human</strong>.</p>
        <p>2. Someone who doesn't just <strong>produce content</strong> — she <strong>crafts it</strong>. <strong>Complex ideas</strong>, made <strong>relatable</strong>. One <strong>sharp phrase</strong> that makes the audience actually <strong>feel something</strong>.</p>
      </div>
    )
  },
  { 
    id: 1, 
    title: "Why am I running? (2/2)", 
    text: (
      <div style={{ textAlign: 'left', fontSize: '1.2rem' }}>
        <img src="/images/slide2.png" style={{ width: '100px', height: '100px', borderRadius: '10px', objectFit: 'cover', float: 'right', marginLeft: '15px', border: '2px dashed #be185d' }} alt="Graphic" />
        <p>3. <strong>Street smart</strong>, <strong>people-smart</strong>, and <strong>quick to learn</strong> — she <strong>talks to anyone</strong>, <strong>reads any room</strong>, and <strong>applies what she picks up</strong> faster than most.</p>
        <p>4. <strong>Passionate</strong>, not performative. Two years in CSF with <strong>zero plans to stop caring</strong> — and <strong>every piece of work</strong> she's made proves exactly that.</p>
      </div>
    )
  },
  { 
    id: 2, 
    title: "What will I do? (1/2)", 
    text: (
      <div style={{ textAlign: 'left', fontSize: '1.2rem' }}>
        <img src="/images/slide3.png" style={{ width: '100px', height: '100px', borderRadius: '10px', objectFit: 'cover', float: 'right', marginLeft: '15px', border: '2px dashed #be185d' }} alt="Graphic" />
        <p><strong>Mystery Speaker</strong>: <strong>Clue-drops</strong> on social media to build <strong>anticipation</strong> rather than just announcing the name of the speaker.</p>
        <p><strong>Unpopular Opinion</strong>: Members pitch a <strong>controversial stance</strong>, the audience <strong>debates and votes</strong> to make it more <strong>engaging and alive</strong>.</p>
      </div>
    )
  },
  { 
    id: 3, 
    title: "What will I do? (2/2)", 
    text: (
      <div style={{ textAlign: 'left', fontSize: '1.2rem' }}>
        <img src="/images/slide4.png" style={{ width: '100px', height: '100px', borderRadius: '10px', objectFit: 'cover', float: 'right', marginLeft: '15px', border: '2px dashed #be185d' }} alt="Graphic" />
        <p><strong>Civil Servant for a Day</strong>: A storytelling series where members <strong>research and narrate</strong> what a <strong>real day in the life</strong> of a civil servant looks like.</p>
        <p><strong>CSF Files</strong>: Real <strong>governance problem solving</strong> through <strong>creative solutions</strong>.</p>
        <p><strong>CSF × ART</strong>: Current affairs through <strong>visual storytelling</strong> (political cartoons, infographics etc).</p>
      </div>
    )
  },
  { 
    id: 4, 
    title: "My Vision", 
    text: (
      <div style={{ textAlign: 'center', fontSize: '1.2rem' }}>
        <img src="/images/profile.jpeg" style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', margin: '0 auto 10px auto', display: 'block', border: '3px solid #be185d' }} alt="Bhargabi" />
        <p>I want CSF to be a space where people don't just show up — they <strong>show UP</strong>. Where our team isn't just a team — but a <strong>community</strong> that's building <strong>something real</strong>.</p>
        <p>I don't want to be remembered as a President who had <strong>great ideas</strong>. I want to be remembered as one who had great ideas — and actually <strong>made them happen</strong>.</p>
      </div>
    )
  }
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

function JourneyMap() {
  const initiativesCollected = useStore(state => state.initiativesCollected)
  const count = initiativesCollected.length
  
  return (
    <div className="journey-map">
      {[0, 1, 2, 3, 4].map(i => (
        <React.Fragment key={i}>
          <div className={`journey-node ${i < count ? 'filled' : ''}`} />
          {i < 4 && <div className={`journey-line ${i < count - 1 ? 'filled' : ''}`} />}
        </React.Fragment>
      ))}
    </div>
  )
}

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
      <JourneyMap />
      <div className="score-board">
        <div>Votes: {score}</div>
        <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>Time: {time}s</div>
      </div>
      
      {storyIndex !== -1 && !gameOver && (
        <div className="story-modal" style={{ width: '95%', maxWidth: '500px' }}>
          <h2>{INITIATIVES[storyIndex].title}</h2>
          {INITIATIVES[storyIndex].text}
          <button onClick={closeStory}>{storyIndex === 4 ? "Complete Pitch" : "Continue Playing"}</button>
        </div>
      )}

      {gameOver && (
        <div className="story-modal" style={{ border: '4px solid #fef08a' }}>
          <h2>VISION. ACTION. IMPACT.</h2>
          <p>You collected all pieces of the pitch and {score} votes in {time} seconds!</p>
          <p style={{ color: '#be185d', fontWeight: 'bold', fontSize: '1.8rem', marginTop: '20px' }}>Vote Bhargabi Medhi for CSF KNC President (2026-27)</p>
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
        
        <SilkBackground speed={5} color="#1e3a8a" noiseIntensity={1.5} rotation={0} />
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
