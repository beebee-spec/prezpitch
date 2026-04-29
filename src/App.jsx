import React from 'react'
import { Canvas } from '@react-three/fiber'
import { OrthographicCamera } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import ShaderBackground from './ShaderBackground'
import Player from './Player'
import Collectible from './Collectible'
import JoystickUI from './Joystick'
import { useStore } from './store'
import './index.css'

const INITIATIVES = [
  { id: 0, title: "Mystery Speaker", text: "Shattering the unknown with confetti." },
  { id: 1, title: "Unpopular Opinion", text: "A spicy, fiery debate podium." },
  { id: 2, title: "Civil Servant for a Day", text: "Experience the day-to-night cycle of an IAS officer's desk." },
  { id: 3, title: "The CSF Files", text: "Top-secret stamped documents opening up." },
  { id: 4, title: "CSF x Art", text: "A splash of paint covering a boring newspaper." }
]

function UI() {
  const { score, time, storyIndex, closeStory, gameOver } = useStore()
  
  return (
    <div className="ui-layer">
      <div className="score-board">
        <div>Votes: {score}</div>
        <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>Time: {time}s</div>
      </div>
      
      {storyIndex !== -1 && !gameOver && (
        <div className="story-modal">
          <h2>{INITIATIVES[storyIndex].title}</h2>
          <p>{INITIATIVES[storyIndex].text}</p>
          <button onClick={closeStory}>Continue Exploring</button>
        </div>
      )}

      {gameOver && (
        <div className="story-modal" style={{ border: '4px solid #fef08a' }}>
          <h2>VISION. ACTION. IMPACT.</h2>
          <p>You have collected all initiatives and {score} votes in {time} seconds!</p>
          <img src="/images/profile.jpeg" style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', margin: '10px' }} />
          <p>Vote Bhargabi Medhi for CSF KNC President (2026-27)</p>
          <button onClick={() => window.location.reload()}>Play Again</button>
        </div>
      )}
    </div>
  )
}

function GameLoop() {
  const tickTime = useStore(state => state.tickTime)
  React.useEffect(() => {
    const interval = setInterval(() => tickTime(), 1000)
    return () => clearInterval(interval)
  }, [tickTime])
  return null
}

export default function App() {
  // Generate random vote locations
  const votes = Array.from({ length: 30 }).map((_, i) => ({
    id: i,
    position: [(Math.random() - 0.5) * 40, (Math.random() - 0.5) * 40, 0]
  }))

  const initiatives = [
    { id: 0, position: [10, 10, 0] },
    { id: 1, position: [-10, 15, 0] },
    { id: 2, position: [15, -10, 0] },
    { id: 3, position: [-15, -15, 0] },
    { id: 4, position: [0, -18, 0] }
  ]

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <Canvas>
        <OrthographicCamera makeDefault position={[0, 0, 10]} zoom={40} />
        <ambientLight intensity={1} />
        
        <ShaderBackground />
        
        {votes.map(v => <Collectible key={`vote-${v.id}`} position={v.position} type="vote" />)}
        {initiatives.map(i => <Collectible key={`init-${i.id}`} position={i.position} type="initiative" id={i.id} />)}
        
        <Player />
        <GameLoop />
        
        <EffectComposer>
          <Bloom luminanceThreshold={0.5} luminanceSmoothing={0.9} height={300} />
        </EffectComposer>
      </Canvas>
      
      <JoystickUI />
      <UI />
    </div>
  )
}
