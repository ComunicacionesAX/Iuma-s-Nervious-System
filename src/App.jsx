import { useState, useEffect, useCallback, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import TouchlessScreen from './components/TouchlessScreen'
import LandingScreen from './components/LandingScreen'
import CustomCursor from './components/shared/CustomCursor'

const EXPO = [0.76, 0, 0.24, 1]

export default function App() {
  const [screen, setScreen] = useState('touchless')
  const [audioEnabled, setAudioEnabled] = useState(false)
  const [entered, setEntered] = useState(false)   // controls welcome gate
  const synthRef = useRef(null)

  const startWithAudio = useCallback(async () => {
    setEntered(true)
    try {
      // Tone.js v14 — start() must be called from a user gesture
      const T = await import('tone')
      await T.start()                        // unlocks the AudioContext

      const hum = new T.Oscillator({ frequency: 60, type: 'sine' })
      const vol = new T.Volume(-44)
      const reverb = new T.Reverb({ decay: 5, wet: 0.55 })
      await reverb.generate()               // pre-compute IR
      hum.connect(vol)
      vol.connect(reverb)
      reverb.toDestination()
      hum.start()

      synthRef.current = {
        ping() {
          try {
            const s = new T.Synth({
              oscillator: { type: 'triangle' },
              envelope: { attack: 0.005, decay: 0.09, sustain: 0, release: 0.1 }
            }).toDestination()
            s.volume.value = -22
            s.triggerAttackRelease(880, '32n')
            setTimeout(() => s.dispose(), 600)
          } catch (_) {}
        }
      }
      setAudioEnabled(true)
    } catch (e) {
      console.warn('Audio init failed:', e)
    }
  }, [])

  const startSilent = useCallback(() => setEntered(true), [])

  const goLanding = useCallback(() => {
    synthRef.current?.ping()
    setScreen('landing')
    setTimeout(() => window.scrollTo({ top: 0 }), 50)
  }, [])

  const goLive = useCallback(() => {
    synthRef.current?.ping()
    setScreen('touchless')
    window.scrollTo({ top: 0 })
  }, [])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Tab') { e.preventDefault(); setScreen(s => s === 'touchless' ? 'landing' : 'touchless') }
      if (e.key === 'Escape' && !entered) setEntered(true)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [entered])

  return (
    <>
      <CustomCursor screen={screen} />

      {/* ── Welcome gate ─────────────────────────────────────────────── */}
      {!entered && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 200,
            background: '#0d1a14',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '36px', textAlign: 'center', maxWidth: '400px', padding: '0 24px' }}>

            {/* Logo mark */}
            <div style={{ width: 44, height: 44, border: '1px solid #3D5A52', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 18, height: 18, background: '#3D5A52' }} />
            </div>

            <div>
              <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 10, fontWeight: 700, letterSpacing: '0.45em', color: '#5a8a7a', marginBottom: 12 }}>
                ILUMA ALLIANCE
              </p>
              <h1 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 24, fontWeight: 300, letterSpacing: '0.2em', color: '#ffffff', lineHeight: 1.4, margin: 0 }}>
                BIOLOGICAL<br />INTELLIGENCE<br />PLATFORM
              </h1>
            </div>

            <div style={{ width: 48, height: 1, background: '#3D5A52' }} />

            <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 12, fontWeight: 400, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.04em', lineHeight: 1.75, margin: 0 }}>
              Esta plataforma incluye sonido ambiente.<br />
              ¿Deseas activarlo?
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%' }}>
              <button
                onClick={startWithAudio}
                style={{
                  fontFamily: 'Montserrat, sans-serif', fontSize: 11, fontWeight: 700,
                  letterSpacing: '0.25em', color: '#ffffff',
                  background: '#3D5A52', border: 'none', borderRadius: 2,
                  padding: '16px 24px', cursor: 'pointer', width: '100%'
                }}
              >
                ▶ &nbsp;ACTIVAR AUDIO Y ENTRAR
              </button>

              <button
                onClick={startSilent}
                style={{
                  fontFamily: 'Montserrat, sans-serif', fontSize: 10, fontWeight: 500,
                  letterSpacing: '0.2em', color: 'rgba(255,255,255,0.35)',
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.12)', borderRadius: 2,
                  padding: '12px 24px', cursor: 'pointer', width: '100%'
                }}
              >
                CONTINUAR SIN AUDIO
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ── Audio status pill ─────────────────────────────────────────── */}
      {entered && (
        <div style={{
          position: 'fixed', bottom: 18, right: 18, zIndex: 50,
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '6px 12px',
          background: 'rgba(10,15,13,0.7)',
          border: '1px solid rgba(61,90,82,0.3)',
          borderRadius: 2, backdropFilter: 'blur(8px)'
        }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: audioEnabled ? '#3D5A52' : '#64748b' }} />
          <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 8, fontWeight: 600, letterSpacing: '0.2em', color: audioEnabled ? '#5a8a7a' : '#64748b' }}>
            {audioEnabled ? 'AUDIO ON' : 'AUDIO OFF'}
          </span>
        </div>
      )}

      {/* ── Screens ───────────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {screen === 'touchless' ? (
          <motion.div
            key="touchless"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: EXPO }}
            style={{ position: 'fixed', inset: 0, zIndex: 1 }}
          >
            <TouchlessScreen onNavigateLanding={goLanding} />
          </motion.div>
        ) : (
          <motion.div
            key="landing"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: EXPO }}
            style={{ position: 'relative', zIndex: 1, minHeight: '100vh' }}
          >
            <LandingScreen onGoLive={goLive} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
