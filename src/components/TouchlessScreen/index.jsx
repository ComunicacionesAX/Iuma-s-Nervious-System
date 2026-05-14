import { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import FarmScene from './FarmScene'
import HandTracker from './HandTracker'
import VirtualButtons from './VirtualButtons'
import InfoPanel from './InfoPanel'
import DeepDive from './DeepDive'
import SceneLabels from './SceneLabels'

export default function TouchlessScreen({ onNavigateLanding }) {
  const [activeLayer, setActiveLayer] = useState('sento')
  const [showDeepDive, setShowDeepDive] = useState(false)
  const [indexPos, setIndexPos] = useState(null)
  const [cameraGranted, setCameraGranted] = useState(false)
  const [cameraError, setCameraError] = useState(false)
  const videoRef = useRef(null)
  const pinchCooldown = useRef(false)

  // Start camera
  useEffect(() => {
    let stream = null
    navigator.mediaDevices
      ?.getUserMedia({ video: { width: 1280, height: 720, facingMode: 'user' } })
      .then(s => {
        stream = s
        if (videoRef.current) {
          videoRef.current.srcObject = s
          videoRef.current.play()
          setCameraGranted(true)
        }
      })
      .catch(() => setCameraError(true))

    return () => {
      if (stream) stream.getTracks().forEach(t => t.stop())
    }
  }, [])

  const handleIndexPosition = useCallback((pos) => {
    setIndexPos(pos)
  }, [])

  const handlePinch = useCallback(() => {
    if (pinchCooldown.current) return
    pinchCooldown.current = true
    setShowDeepDive(true)
    setTimeout(() => { pinchCooldown.current = false }, 4000)
  }, [])

  const handleLayerChange = useCallback((key) => {
    setActiveLayer(key)
  }, [])

  return (
    <div
      className="relative w-screen h-screen overflow-hidden"
      style={{ background: '#0a0f0d' }}
    >
      {/* Camera video feed — mirrored, 50% opacity */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover"
        style={{
          zIndex: 0,
          opacity: cameraGranted ? 0.5 : 0,
          transform: 'scaleX(-1)',
          objectFit: 'cover'
        }}
      />

      {/* Three.js Farm Scene — always visible; blend with video when camera active */}
      <div
        className="absolute inset-0"
        style={{ zIndex: 1, mixBlendMode: cameraGranted ? 'screen' : 'normal', opacity: cameraGranted ? 0.75 : 1 }}
      >
        <FarmScene activeLayer={activeLayer} />
      </div>

      {/* Vignette overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 2,
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(10,15,13,0.7) 100%)'
        }}
      />

      {/* HUD labels floating over scene */}
      <SceneLabels activeLayer={activeLayer} />

      {/* MediaPipe hand tracker canvas */}
      {cameraGranted && (
        <HandTracker
          onIndexPosition={handleIndexPosition}
          onPinch={handlePinch}
          videoRef={videoRef}
        />
      )}

      {/* Info panel — left side */}
      <InfoPanel
        activeLayer={activeLayer}
        onFullOverview={onNavigateLanding}
      />

      {/* Virtual buttons — right side */}
      <VirtualButtons
        activeLayer={activeLayer}
        onLayerChange={handleLayerChange}
        indexPos={indexPos}
      />

      {/* Top left branding */}
      <motion.div
        className="absolute top-6 left-6 flex items-center gap-3"
        style={{ zIndex: 20 }}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="w-5 h-5 border border-white/40 flex items-center justify-center">
          <div className="w-2 h-2" style={{ background: '#3D5A52' }} />
        </div>
        <span
          className="font-montserrat text-white/70"
          style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.4em' }}
        >
          ILUMA ALLIANCE
        </span>
        <div className="w-px h-4" style={{ background: 'rgba(255,255,255,0.15)' }} />
        <span
          className="font-montserrat"
          style={{ fontSize: '8px', fontWeight: 400, letterSpacing: '0.25em', color: '#3D5A52' }}
        >
          TOUCHLESS INTERFACE
        </span>
      </motion.div>

      {/* Top right: camera status + navigation */}
      <motion.div
        className="absolute top-6 right-6 flex items-center gap-4"
        style={{ zIndex: 20 }}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: cameraGranted ? '#22c55e' : cameraError ? '#ef4444' : '#64748b' }}
          />
          <span
            className="font-montserrat text-white/40"
            style={{ fontSize: '8px', letterSpacing: '0.2em', fontWeight: 500 }}
          >
            {cameraGranted ? 'GESTURE ACTIVE' : cameraError ? 'MOUSE MODE' : 'INITIALIZING'}
          </span>
        </div>

        <button
          onClick={onNavigateLanding}
          className="font-montserrat text-white/50 hover:text-white/80 transition-colors duration-200 flex items-center gap-2"
          style={{ fontSize: '8px', letterSpacing: '0.2em', fontWeight: 600 }}
        >
          PLATFORM OVERVIEW
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 6h8M6 2l4 4-4 4" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
          </svg>
        </button>
      </motion.div>

      {/* Mouse fallback cursor indicator (when no hand tracking) */}
      {!cameraGranted && (
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 text-center" style={{ zIndex: 20 }}>
          <p
            className="font-montserrat text-white/30"
            style={{ fontSize: '9px', letterSpacing: '0.25em' }}
          >
            HOVER BUTTONS TO SELECT · CLICK TO EXPLORE
          </p>
        </div>
      )}

      {/* Pinch hint */}
      {cameraGranted && !showDeepDive && (
        <motion.div
          className="absolute bottom-16 left-1/2 -translate-x-1/2"
          style={{ zIndex: 20 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.7, 0] }}
          transition={{ delay: 3, duration: 2, repeat: 2 }}
        >
          <p
            className="font-montserrat text-white/40"
            style={{ fontSize: '9px', letterSpacing: '0.25em' }}
          >
            PINCH TO DEEP DIVE · DWELL ON LAYER TO SELECT
          </p>
        </motion.div>
      )}

      {/* Deep Dive overlay */}
      <AnimatePresence>
        {showDeepDive && (
          <DeepDive
            activeLayer={activeLayer}
            onClose={() => setShowDeepDive(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
