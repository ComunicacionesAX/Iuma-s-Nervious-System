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

  const requestCamera = useCallback(() => {
    setCameraStatus('idle')
    navigator.mediaDevices
      ?.getUserMedia({ video: { width: 1280, height: 720, facingMode: 'user' } })
      .then(stream => {
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.play().catch(() => {})
        }
        setCameraStatus('granted')
      })
      .catch(() => setCameraStatus('denied'))
  }, [])

  // Auto-request on mount
  useEffect(() => {
    requestCamera()
    return () => { streamRef.current?.getTracks().forEach(t => t.stop()) }
  }, [requestCamera])

  const handleIndexPosition = useCallback(pos => setIndexPos(pos), [])
  const handlePinch = useCallback(() => {
    if (pinchCooldown.current) return
    pinchCooldown.current = true
    setShowDeepDive(true)
    setTimeout(() => { pinchCooldown.current = false }, 4000)
  }, [])

  const cameraGranted = cameraStatus === 'granted'

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', background: '#0a0f0d' }}>

      {/* Camera feed */}
      <video
        ref={videoRef}
        autoPlay playsInline muted
        style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%',
          objectFit: 'cover', zIndex: 0,
          opacity: cameraGranted ? 0.45 : 0,
          transform: 'scaleX(-1)'
        }}
      />

      {/* Three.js farm — full opacity when no camera, blended when camera active */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 1,
        opacity: cameraGranted ? 0.8 : 1,
        mixBlendMode: cameraGranted ? 'screen' : 'normal'
      }}>
        <ErrorBoundary>
          <FarmScene />
        </ErrorBoundary>
      </div>

      {/* Edge vignette */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none',
        background: 'radial-gradient(ellipse at center, transparent 45%, rgba(10,15,13,0.65) 100%)'
      }} />

      {/* Floating HUD labels */}
      <SceneLabels activeLayer={activeLayer} />

      {/* Hand tracker canvas — only when camera live */}
      {cameraGranted && (
        <HandTracker
          onIndexPosition={handleIndexPosition}
          onPinch={handlePinch}
          videoRef={videoRef}
        />
      )}

      {/* Layer info panel — left */}
      <InfoPanel activeLayer={activeLayer} onFullOverview={onNavigateLanding} />

      {/* Layer buttons — right */}
      <VirtualButtons
        activeLayer={activeLayer}
        onLayerChange={key => setActiveLayer(key)}
        indexPos={indexPos}
      />

      {/* Top-left branding */}
      <div style={{ position: 'absolute', top: 24, left: 24, zIndex: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 20, height: 20, border: '1px solid rgba(255,255,255,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 8, height: 8, background: '#3D5A52' }} />
        </div>
        <span style={{ fontFamily: 'Montserrat,sans-serif', fontSize: 9, fontWeight: 700, letterSpacing: '0.4em', color: 'rgba(255,255,255,0.6)' }}>
          ILUMA ALLIANCE
        </span>
        <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.12)' }} />
        <span style={{ fontFamily: 'Montserrat,sans-serif', fontSize: 8, fontWeight: 400, letterSpacing: '0.25em', color: '#3D5A52' }}>
          TOUCHLESS INTERFACE
        </span>
      </div>

      {/* Top-right: camera status */}
      <div style={{ position: 'absolute', top: 24, right: 24, zIndex: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
        {/* Camera pill / enable button */}
        {cameraStatus === 'denied' ? (
          <button
            onClick={requestCamera}
            style={{
              fontFamily: 'Montserrat,sans-serif', fontSize: 8, fontWeight: 700,
              letterSpacing: '0.2em', color: '#fff',
              background: '#3D5A52', border: 'none', borderRadius: 2,
              padding: '6px 12px', cursor: 'pointer'
            }}
          >
            ACTIVAR CÁMARA
          </button>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{
              width: 6, height: 6, borderRadius: '50%',
              background: cameraGranted ? '#22c55e' : '#64748b'
            }} />
            <span style={{ fontFamily: 'Montserrat,sans-serif', fontSize: 8, letterSpacing: '0.2em', fontWeight: 500, color: 'rgba(255,255,255,0.35)' }}>
              {cameraGranted ? 'GESTOS ACTIVOS' : 'INICIANDO CÁMARA…'}
            </span>
          </div>
        )}

        <button
          onClick={onNavigateLanding}
          style={{
            fontFamily: 'Montserrat,sans-serif', fontSize: 8, fontWeight: 600,
            letterSpacing: '0.2em', color: 'rgba(255,255,255,0.45)',
            background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6
          }}
        >
          PLATAFORMA COMPLETA
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 6h8M6 2l4 4-4 4" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      {/* Camera permission prompt — shown when denied */}
      {cameraStatus === 'denied' && (
        <div style={{
          position: 'absolute', bottom: 80, left: '50%', transform: 'translateX(-50%)',
          zIndex: 20, textAlign: 'center',
          background: 'rgba(10,15,13,0.9)', border: '1px solid rgba(61,90,82,0.4)',
          borderRadius: 2, padding: '16px 24px', backdropFilter: 'blur(8px)'
        }}>
          <p style={{ fontFamily: 'Montserrat,sans-serif', fontSize: 11, fontWeight: 600, letterSpacing: '0.15em', color: '#fff', margin: '0 0 6px' }}>
            Para usar gestos, activa la cámara
          </p>
          <p style={{ fontFamily: 'Montserrat,sans-serif', fontSize: 10, color: 'rgba(255,255,255,0.45)', margin: 0, letterSpacing: '0.05em' }}>
            Haz clic en el candado 🔒 arriba → Cámara → Permitir → Recargar
          </p>
        </div>
      )}

      {/* Gesture hint */}
      {cameraGranted && !showDeepDive && (
        <motion.div
          style={{ position: 'absolute', bottom: 60, left: '50%', translateX: '-50%', zIndex: 20 }}
          initial={{ opacity: 0 }} animate={{ opacity: [0, 0.6, 0] }}
          transition={{ delay: 2.5, duration: 2, repeat: 2 }}
        >
          <p style={{ fontFamily: 'Montserrat,sans-serif', fontSize: 9, letterSpacing: '0.25em', color: 'rgba(255,255,255,0.35)', textAlign: 'center' }}>
            PELLIZCA PARA DEEP DIVE · MANO SOBRE BOTÓN PARA SELECCIONAR
          </p>
        </motion.div>
      )}

      {/* Deep Dive overlay */}
      <AnimatePresence>
        {showDeepDive && (
          <DeepDive activeLayer={activeLayer} onClose={() => setShowDeepDive(false)} />
        )}
      </AnimatePresence>
    </div>
  )
}
