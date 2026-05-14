import { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import FarmScene from './FarmScene'
import HandTracker from './HandTracker'
import VirtualButtons from './VirtualButtons'
import InfoPanel from './InfoPanel'
import DeepDive from './DeepDive'
import SceneLabels from './SceneLabels'
import ErrorBoundary from '../shared/ErrorBoundary'

export default function TouchlessScreen({ onNavigateLanding }) {
  const [activeLayer, setActiveLayer] = useState('sento')
  const [showDeepDive, setShowDeepDive] = useState(false)
  const [indexPos, setIndexPos] = useState(null)
  const [cameraStatus, setCameraStatus] = useState('idle') // idle | granted | denied
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const pinchCooldown = useRef(false)

  // ── Camera request — stable ref, empty deps ─────────────────────────
  const requestCamera = useCallback(() => {
    if (!navigator.mediaDevices) { setCameraStatus('denied'); return }
    navigator.mediaDevices
      .getUserMedia({ video: { width: 1280, height: 720, facingMode: 'user' } })
      .then(stream => {
        streamRef.current = stream
        const vid = videoRef.current
        if (vid) { vid.srcObject = stream; vid.play().catch(() => {}) }
        setCameraStatus('granted')
      })
      .catch(() => setCameraStatus('denied'))
  }, []) // ← empty — uses only refs and state setters (both stable)

  useEffect(() => {
    requestCamera()
    return () => { streamRef.current?.getTracks().forEach(t => t.stop()) }
  }, []) // ← run once on mount only

  const handleIndexPosition = useCallback(pos => setIndexPos(pos), [])

  const handlePinch = useCallback(() => {
    if (pinchCooldown.current) return
    pinchCooldown.current = true
    setShowDeepDive(true)
    setTimeout(() => { pinchCooldown.current = false }, 4000)
  }, [])

  const cameraGranted = cameraStatus === 'granted'

  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: '#0a0f0d' }}>

      {/* Camera feed */}
      <video
        ref={videoRef}
        autoPlay playsInline muted
        className="absolute inset-0 w-full h-full object-cover"
        style={{ zIndex: 0, opacity: cameraGranted ? 0.45 : 0, transform: 'scaleX(-1)' }}
      />

      {/* Three.js farm */}
      <div className="absolute inset-0" style={{ zIndex: 1 }}>
        <ErrorBoundary>
          <FarmScene />
        </ErrorBoundary>
      </div>

      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ zIndex: 2, background: 'radial-gradient(ellipse at center, transparent 45%, rgba(10,15,13,0.65) 100%)' }}
      />

      {/* HUD labels */}
      <SceneLabels activeLayer={activeLayer} />

      {/* Hand tracker — only when camera is live */}
      {cameraGranted && (
        <HandTracker onIndexPosition={handleIndexPosition} onPinch={handlePinch} videoRef={videoRef} />
      )}

      {/* Info panel */}
      <InfoPanel activeLayer={activeLayer} onFullOverview={onNavigateLanding} />

      {/* Layer buttons */}
      <VirtualButtons
        activeLayer={activeLayer}
        onLayerChange={key => setActiveLayer(key)}
        indexPos={indexPos}
      />

      {/* Top-left branding */}
      <motion.div
        className="absolute top-6 left-6 flex items-center gap-3"
        style={{ zIndex: 20 }}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="w-5 h-5 border border-white/30 flex items-center justify-center">
          <div className="w-2 h-2" style={{ background: '#3D5A52' }} />
        </div>
        <span className="font-montserrat text-white/60" style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.4em' }}>
          ILUMA ALLIANCE
        </span>
        <div className="w-px h-4 bg-white/10" />
        <span className="font-montserrat" style={{ fontSize: 8, fontWeight: 400, letterSpacing: '0.25em', color: '#3D5A52' }}>
          TOUCHLESS INTERFACE
        </span>
      </motion.div>

      {/* Top-right: camera status + navigation */}
      <motion.div
        className="absolute top-6 right-6 flex items-center gap-4"
        style={{ zIndex: 20 }}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        {cameraStatus === 'denied' ? (
          <button
            onClick={requestCamera}
            className="font-montserrat text-white px-3 py-1.5 transition-opacity hover:opacity-80"
            style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.2em', background: '#3D5A52', borderRadius: 2, border: 'none', cursor: 'pointer' }}
          >
            ACTIVAR CÁMARA
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: cameraGranted ? '#22c55e' : '#64748b' }} />
            <span className="font-montserrat text-white/30" style={{ fontSize: 8, letterSpacing: '0.2em', fontWeight: 500 }}>
              {cameraGranted ? 'GESTOS ACTIVOS' : 'INICIANDO…'}
            </span>
          </div>
        )}

        <button
          onClick={onNavigateLanding}
          className="font-montserrat text-white/40 hover:text-white/70 transition-colors flex items-center gap-2"
          style={{ fontSize: 8, fontWeight: 600, letterSpacing: '0.2em', background: 'none', border: 'none', cursor: 'pointer' }}
        >
          PLATAFORMA COMPLETA →
        </button>
      </motion.div>

      {/* Camera denied message */}
      {cameraStatus === 'denied' && (
        <div
          className="absolute left-1/2 -translate-x-1/2 text-center px-6 py-4"
          style={{ bottom: 80, zIndex: 20, background: 'rgba(10,15,13,0.9)', border: '1px solid rgba(61,90,82,0.4)', borderRadius: 2 }}
        >
          <p className="font-montserrat text-white" style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', marginBottom: 6 }}>
            Para usar gestos, activa la cámara
          </p>
          <p className="font-montserrat" style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.04em' }}>
            Candado 🔒 en la barra del navegador → Cámara → Permitir → Recargar
          </p>
        </div>
      )}

      {/* Pinch hint */}
      {cameraGranted && !showDeepDive && (
        <motion.div
          className="absolute bottom-16 left-1/2 -translate-x-1/2"
          style={{ zIndex: 20 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.6, 0] }}
          transition={{ delay: 3, duration: 2, repeat: 2 }}
        >
          <p className="font-montserrat text-white/35 text-center" style={{ fontSize: 9, letterSpacing: '0.25em' }}>
            PELLIZCA PARA DEEP DIVE · MANO SOBRE BOTÓN PARA SELECCIONAR
          </p>
        </motion.div>
      )}

      {/* Deep Dive */}
      <AnimatePresence>
        {showDeepDive && (
          <DeepDive activeLayer={activeLayer} onClose={() => setShowDeepDive(false)} />
        )}
      </AnimatePresence>
    </div>
  )
}
