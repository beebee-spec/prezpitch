import { useEffect, useRef, useState } from 'react'
import { useStore } from './store'
import { audio } from './AudioEngine'

export default function JoystickUI() {
  const [isTouch, setIsTouch] = useState(false)
  const setJoystick = useStore((state) => state.setJoystick)
  const setZoom = useStore((state) => state.setZoom)
  const stunned = useStore((state) => state.stunned)
  
  const baseRef = useRef(null)
  const [knobPos, setKnobPos] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const onTouch = () => setIsTouch(true)
    window.addEventListener('touchstart', onTouch, { once: true })
    return () => window.removeEventListener('touchstart', onTouch)
  }, [])

  if (!isTouch) return null

  const handleTouch = (e) => {
    if (!baseRef.current) return
    let touch = null
    for(let i=0; i<e.touches.length; i++) {
        const rect = baseRef.current.getBoundingClientRect()
        const t = e.touches[i]
        if (t.clientX >= rect.left - 50 && t.clientX <= rect.right + 50 && t.clientY >= rect.top - 50 && t.clientY <= rect.bottom + 50) {
            touch = t
            break
        }
    }
    
    if (!touch) {
      setKnobPos({ x: 0, y: 0 })
      setJoystick(0, 0)
      return
    }

    const rect = baseRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    
    let dx = touch.clientX - centerX
    let dy = touch.clientY - centerY
    
    const maxDist = 40
    const dist = Math.sqrt(dx * dx + dy * dy)
    if (dist > maxDist) {
      dx = (dx / dist) * maxDist
      dy = (dy / dist) * maxDist
    }
    
    setKnobPos({ x: dx, y: dy })
    setJoystick(dx / maxDist, -dy / maxDist)
  }

  const handleEnd = () => {
    setKnobPos({ x: 0, y: 0 })
    setJoystick(0, 0)
  }

  return (
    <>
      <div style={{ position: 'absolute', bottom: '20px', left: '20px', zIndex: 1000, touchAction: 'none', pointerEvents: 'auto' }}>
        <div 
          ref={baseRef}
          onTouchStart={handleTouch}
          onTouchMove={handleTouch}
          onTouchEnd={handleEnd}
          onTouchCancel={handleEnd}
          style={{
            width: '100px', height: '100px', 
            background: 'rgba(255, 255, 255, 0.1)', 
            borderRadius: '50%', border: '2px solid rgba(255, 255, 255, 0.3)',
            display: 'flex', justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(5px)'
          }}
        >
          <div style={{
            width: '40px', height: '40px', background: 'rgba(255, 255, 255, 0.5)',
            borderRadius: '50%', transform: `translate(${knobPos.x}px, ${knobPos.y}px)`, pointerEvents: 'none'
          }} />
        </div>
      </div>

      <div 
        style={{ 
          position: 'absolute', bottom: '20px', right: '20px', zIndex: 1000, 
          width: '70px', height: '70px', borderRadius: '50%',
          background: stunned ? 'rgba(239, 68, 68, 0.5)' : 'rgba(74, 222, 128, 0.5)',
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          color: 'white', fontWeight: 'bold', fontSize: '14px', border: '2px solid rgba(255,255,255,0.5)',
          touchAction: 'none', pointerEvents: 'auto', backdropFilter: 'blur(5px)', userSelect: 'none'
        }}
        onTouchStart={(e) => {
            e.preventDefault()
            if(!stunned) setZoom(true)
        }}
        onTouchEnd={(e) => { e.preventDefault(); setZoom(false); }}
        onTouchCancel={(e) => { e.preventDefault(); setZoom(false); }}
      >
        ZOOM
      </div>
    </>
  )
}
