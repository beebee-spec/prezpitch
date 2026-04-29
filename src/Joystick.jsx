import { useEffect, useRef, useState } from 'react'
import { useStore } from './store'

export default function JoystickUI() {
  const [isTouch, setIsTouch] = useState(false)
  const setJoystick = useStore((state) => state.setJoystick)
  
  // Use a ref for the base to calculate center
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
    const touch = e.targetTouches[0]
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
    
    // Normalize and cap distance
    const maxDist = 40
    const dist = Math.sqrt(dx * dx + dy * dy)
    if (dist > maxDist) {
      dx = (dx / dist) * maxDist
      dy = (dy / dist) * maxDist
    }
    
    setKnobPos({ x: dx, y: dy })
    
    // Output -1 to 1 vector
    // Invert Y so up is positive
    setJoystick(dx / maxDist, -dy / maxDist)
  }

  const handleEnd = () => {
    setKnobPos({ x: 0, y: 0 })
    setJoystick(0, 0)
  }

  return (
    <div style={{ position: 'absolute', bottom: '40px', left: '40px', zIndex: 1000, touchAction: 'none', pointerEvents: 'auto' }}>
      {/* Base */}
      <div 
        ref={baseRef}
        onTouchStart={handleTouch}
        onTouchMove={handleTouch}
        onTouchEnd={handleEnd}
        onTouchCancel={handleEnd}
        style={{
          width: '120px', height: '120px', 
          background: 'rgba(255, 255, 255, 0.1)', 
          borderRadius: '50%', 
          border: '2px solid rgba(255, 255, 255, 0.3)',
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          backdropFilter: 'blur(5px)'
        }}
      >
        {/* Knob */}
        <div style={{
          width: '50px', height: '50px',
          background: 'rgba(255, 255, 255, 0.5)',
          borderRadius: '50%',
          transform: `translate(${knobPos.x}px, ${knobPos.y}px)`,
          pointerEvents: 'none'
        }} />
      </div>
    </div>
  )
}
