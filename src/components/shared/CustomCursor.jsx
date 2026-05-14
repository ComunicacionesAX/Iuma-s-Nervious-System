import { useEffect, useRef } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

export default function CustomCursor({ screen }) {
  const cursorX = useMotionValue(-100)
  const cursorY = useMotionValue(-100)
  const springX = useSpring(cursorX, { stiffness: 500, damping: 30 })
  const springY = useSpring(cursorY, { stiffness: 500, damping: 30 })
  const sizeRef = useRef(30)
  const ringRef = useRef(null)
  const isDark = screen === 'touchless'

  useEffect(() => {
    document.body.classList.add('custom-cursor-active')

    const move = (e) => {
      cursorX.set(e.clientX)
      cursorY.set(e.clientY)
    }

    const onMouseOver = (e) => {
      const el = e.target
      if (el.tagName === 'BUTTON' || el.tagName === 'A' || el.closest('button') || el.closest('a')) {
        if (ringRef.current) {
          ringRef.current.style.width = '48px'
          ringRef.current.style.height = '48px'
          ringRef.current.style.marginLeft = '-24px'
          ringRef.current.style.marginTop = '-24px'
        }
      } else {
        if (ringRef.current) {
          ringRef.current.style.width = '30px'
          ringRef.current.style.height = '30px'
          ringRef.current.style.marginLeft = '-15px'
          ringRef.current.style.marginTop = '-15px'
        }
      }
    }

    const onMouseDown = () => {
      if (ringRef.current) {
        ringRef.current.style.transform = 'scale(0.27)'
        ringRef.current.style.transition = 'all 0.08s ease'
      }
    }

    const onMouseUp = () => {
      if (ringRef.current) {
        ringRef.current.style.transform = 'scale(1.15)'
        setTimeout(() => {
          if (ringRef.current) ringRef.current.style.transform = 'scale(1)'
        }, 150)
      }
    }

    window.addEventListener('mousemove', move)
    window.addEventListener('mouseover', onMouseOver)
    window.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mouseup', onMouseUp)

    return () => {
      document.body.classList.remove('custom-cursor-active')
      window.removeEventListener('mousemove', move)
      window.removeEventListener('mouseover', onMouseOver)
      window.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mouseup', onMouseUp)
    }
  }, [cursorX, cursorY])

  const ringColor = isDark ? '#3D5A52' : '#3D5A52'
  const dotColor = isDark ? '#5a8a7a' : '#3D5A52'

  return (
    <div className="pointer-events-none fixed inset-0" style={{ zIndex: 9999 }}>
      {/* Dot */}
      <motion.div
        style={{
          position: 'fixed',
          left: springX,
          top: springY,
          width: '4px',
          height: '4px',
          borderRadius: '50%',
          background: dotColor,
          marginLeft: '-2px',
          marginTop: '-2px',
        }}
      />
      {/* Ring */}
      <motion.div
        ref={ringRef}
        style={{
          position: 'fixed',
          left: springX,
          top: springY,
          width: '30px',
          height: '30px',
          borderRadius: '50%',
          border: `1px solid ${ringColor}`,
          marginLeft: '-15px',
          marginTop: '-15px',
          transition: 'width 0.2s ease, height 0.2s ease, margin 0.2s ease, transform 0.2s ease',
          opacity: 0.7
        }}
      />
    </div>
  )
}
