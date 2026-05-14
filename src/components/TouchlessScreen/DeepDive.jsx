import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { gsap } from 'gsap'
import { LAYERS } from '../shared/LayerData'

export default function DeepDive({ activeLayer, onClose }) {
  const layer = LAYERS[activeLayer]
  const valRefs = useRef([])
  const progressRef = useRef(null)

  useEffect(() => {
    if (!layer) return

    // GSAP count-up for numeric values
    valRefs.current.forEach((el, i) => {
      if (!el) return
      const rawVal = layer.deepDive[i]?.value || ''
      const num = parseFloat(rawVal.replace(/[^0-9.]/g, ''))
      if (!isNaN(num)) {
        gsap.fromTo(
          el,
          { textContent: '0' },
          {
            textContent: num,
            duration: 1.5,
            delay: 0.3 + i * 0.15,
            ease: 'power2.out',
            snap: { textContent: num < 10 ? 0.01 : 1 },
            onUpdate: function () {
              const curr = parseFloat(this.targets()[0].textContent)
              // Restore any prefix/suffix
              const prefix = rawVal.match(/^[^0-9]*/)[0]
              const suffix = rawVal.match(/[^0-9.]*$/)[0]
              el.textContent = prefix + (num < 10 ? curr.toFixed(1) : Math.round(curr).toLocaleString()) + suffix
            }
          }
        )
      }
    })

    // Progress bar animation
    if (progressRef.current) {
      gsap.fromTo(
        progressRef.current,
        { width: '0%' },
        {
          width: '100%',
          duration: 3,
          ease: 'power1.inOut',
          onComplete: onClose
        }
      )
    }

    // ESC key to close
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [layer, onClose])

  if (!layer) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      onClick={onClose}
      className="fixed inset-0 flex flex-col items-center justify-center"
      style={{
        zIndex: 100,
        background: 'rgba(10, 15, 13, 0.96)',
        backdropFilter: 'blur(20px)',
        cursor: 'pointer'
      }}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        onClick={e => e.stopPropagation()}
        className="flex flex-col items-center gap-8 text-center"
        style={{ maxWidth: '600px', width: '90%' }}
      >
        {/* Code */}
        <span
          className="font-montserrat"
          style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.4em', color: '#3D5A52' }}
        >
          LAYER {layer.code} — DEEP ANALYSIS
        </span>

        {/* Name */}
        <div>
          <h1
            className="font-montserrat text-white"
            style={{ fontSize: '48px', fontWeight: 300, letterSpacing: '0.3em', lineHeight: 1 }}
          >
            {layer.name}
          </h1>
          <p
            className="font-montserrat mt-3"
            style={{ fontSize: '12px', fontWeight: 400, letterSpacing: '0.15em', color: '#5a8a7a' }}
          >
            {layer.title}
          </p>
        </div>

        {/* Divider */}
        <div className="w-24 h-px" style={{ background: '#3D5A52' }} />

        {/* Deep dive stats */}
        <div className="grid grid-cols-3 gap-6 w-full">
          {layer.deepDive.map((stat, i) => (
            <div
              key={stat.label}
              className="flex flex-col items-center gap-2 py-6"
              style={{
                border: '1px solid rgba(61,90,82,0.3)',
                borderRadius: '2px',
                background: 'rgba(61,90,82,0.08)'
              }}
            >
              <span
                className="font-montserrat"
                style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.2em', color: '#5a8a7a' }}
              >
                {stat.label.toUpperCase()}
              </span>
              <span
                ref={el => valRefs.current[i] = el}
                className="font-montserrat text-white"
                style={{ fontSize: '28px', fontWeight: 300, letterSpacing: '0.1em' }}
              >
                {stat.value}
              </span>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div className="w-full" style={{ background: 'rgba(61,90,82,0.15)', height: '2px', borderRadius: '2px' }}>
          <div
            ref={progressRef}
            style={{ height: '100%', background: '#3D5A52', borderRadius: '2px', width: '0%' }}
          />
        </div>

        <p
          className="font-montserrat"
          style={{ fontSize: '9px', fontWeight: 400, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.3)' }}
        >
          CLICK ANYWHERE OR PRESS ESC TO CLOSE
        </p>
      </motion.div>
    </motion.div>
  )
}
