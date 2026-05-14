import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LAYERS, LAYER_KEYS } from '../shared/LayerData'

const DWELL_FRAMES = 72 // ~1.2s at 60fps

export default function VirtualButtons({ activeLayer, onLayerChange, indexPos }) {
  const [dwellProgress, setDwellProgress] = useState({})
  const dwellCounters = useRef({})
  const buttonRects = useRef({})
  const buttonRefs = useRef({})

  // Update button rects for gesture hit detection
  useEffect(() => {
    const update = () => {
      LAYER_KEYS.forEach(key => {
        const el = buttonRefs.current[key]
        if (el) buttonRects.current[key] = el.getBoundingClientRect()
      })
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  // Gesture dwell detection
  useEffect(() => {
    if (!indexPos) {
      // Reset all counters if no hand
      dwellCounters.current = {}
      setDwellProgress({})
      return
    }

    LAYER_KEYS.forEach(key => {
      const rect = buttonRects.current[key]
      if (!rect) return

      const inside =
        indexPos.x >= rect.left && indexPos.x <= rect.right &&
        indexPos.y >= rect.top && indexPos.y <= rect.bottom

      if (inside) {
        dwellCounters.current[key] = (dwellCounters.current[key] || 0) + 1
        const progress = Math.min(dwellCounters.current[key] / DWELL_FRAMES, 1)
        setDwellProgress(prev => ({ ...prev, [key]: progress }))

        if (dwellCounters.current[key] >= DWELL_FRAMES) {
          dwellCounters.current[key] = 0
          onLayerChange(key)
        }
      } else {
        dwellCounters.current[key] = Math.max((dwellCounters.current[key] || 0) - 2, 0)
        setDwellProgress(prev => ({
          ...prev,
          [key]: Math.max((dwellCounters.current[key] || 0) / DWELL_FRAMES, 0)
        }))
      }
    })
  }, [indexPos, onLayerChange])

  return (
    <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col gap-3" style={{ zIndex: 20 }}>
      {LAYER_KEYS.map((key, i) => {
        const layer = LAYERS[key]
        const isActive = activeLayer === key
        const progress = dwellProgress[key] || 0
        const circumference = 2 * Math.PI * 22

        return (
          <motion.button
            key={key}
            ref={el => buttonRefs.current[key] = el}
            onClick={() => onLayerChange(key)}
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: i * 0.1, ease: 'easeOut' }}
            whileHover={{ scale: 1.02 }}
            className="relative flex items-center gap-3 pr-4 pl-3 py-3 text-left transition-all duration-200 select-none"
            style={{
              background: isActive ? 'rgba(61, 90, 82, 0.4)' : 'rgba(10, 15, 13, 0.7)',
              borderLeft: isActive ? '3px solid #3D5A52' : '3px solid rgba(61,90,82,0.2)',
              borderTop: '1px solid rgba(61,90,82,0.2)',
              borderRight: '1px solid rgba(61,90,82,0.2)',
              borderBottom: '1px solid rgba(61,90,82,0.2)',
              borderRadius: '2px',
              backdropFilter: 'blur(8px)',
              minWidth: '160px'
            }}
          >
            {/* Dwell ring */}
            <div className="relative flex-shrink-0" style={{ width: 50, height: 50 }}>
              <svg width="50" height="50" className="absolute inset-0">
                <circle
                  cx="25" cy="25" r="22"
                  fill="none"
                  stroke="rgba(61,90,82,0.2)"
                  strokeWidth="1.5"
                />
                <circle
                  cx="25" cy="25" r="22"
                  fill="none"
                  stroke="#3D5A52"
                  strokeWidth="1.5"
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference * (1 - progress)}
                  strokeLinecap="round"
                  transform="rotate(-90 25 25)"
                  style={{ transition: 'stroke-dashoffset 0.05s linear' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span
                  className="font-montserrat"
                  style={{
                    fontSize: '9px',
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    color: isActive ? '#5a8a7a' : 'rgba(90,138,122,0.6)'
                  }}
                >
                  {layer.code}
                </span>
              </div>
            </div>

            <div className="flex flex-col">
              <span
                className="font-montserrat text-white"
                style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.15em' }}
              >
                {layer.name}
              </span>
              <span
                className="font-montserrat mt-0.5"
                style={{ fontSize: '9px', fontWeight: 400, letterSpacing: '0.08em', color: '#5a8a7a' }}
              >
                {layer.sub}
              </span>
            </div>

            {isActive && (
              <motion.div
                className="absolute right-2 top-1/2 -translate-y-1/2 w-1 h-1 rounded-full"
                style={{ background: '#3D5A52' }}
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            )}
          </motion.button>
        )
      })}
    </div>
  )
}
