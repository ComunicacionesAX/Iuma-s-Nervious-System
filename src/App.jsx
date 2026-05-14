import { useState, useEffect, useCallback, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import TouchlessScreen from './components/TouchlessScreen'
import LandingScreen from './components/LandingScreen'
import CustomCursor from './components/shared/CustomCursor'

const EXPO = [0.76, 0, 0.24, 1]

export default function App() {
  const [screen, setScreen] = useState('touchless') // 'touchless' | 'landing'
  const [audioEnabled, setAudioEnabled] = useState(false)
  const [audioReady, setAudioReady] = useState(false)
  const synthRef = useRef(null)

  // Optional Tone.js ambient audio
  const enableAudio = useCallback(async () => {
    try {
      const { default: Tone } = await import('tone')
      await Tone.start()

      // Low ambient hum
      const hum = new Tone.Oscillator(60, 'sine')
      const vol = new Tone.Volume(-42).toDestination()
      const reverb = new Tone.Reverb(4).toDestination()
      hum.connect(vol)
      vol.connect(reverb)
      hum.start()

      synthRef.current = {
        ping: () => {
          const ping = new Tone.Synth({
            oscillator: { type: 'triangle' },
            envelope: { attack: 0.01, decay: 0.08, sustain: 0, release: 0.1 }
          })
          const pingVol = new Tone.Volume(-28).toDestination()
          ping.connect(pingVol)
          ping.triggerAttackRelease(880, '16n')
          setTimeout(() => ping.dispose(), 500)
        }
      }

      setAudioReady(true)
      setAudioEnabled(true)
    } catch (e) {
      console.warn('Audio unavailable:', e)
    }
  }, [])

  const goLanding = useCallback(() => {
    synthRef.current?.ping()
    setScreen('landing')
    // Scroll to top of landing
    setTimeout(() => window.scrollTo({ top: 0 }), 50)
  }, [])

  const goLive = useCallback(() => {
    synthRef.current?.ping()
    setScreen('touchless')
    window.scrollTo({ top: 0 })
  }, [])

  // Keyboard shortcut: Tab toggles screens
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Tab') {
        e.preventDefault()
        setScreen(s => s === 'touchless' ? 'landing' : 'touchless')
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <>
      <CustomCursor screen={screen} />

      {/* Audio toggle */}
      <div
        className="fixed z-50 flex items-center gap-2"
        style={{ bottom: '20px', right: '20px' }}
      >
        {!audioEnabled && (
          <button
            onClick={enableAudio}
            className="font-montserrat flex items-center gap-2 px-3 py-2 transition-all duration-200"
            style={{
              background: screen === 'touchless' ? 'rgba(10,15,13,0.8)' : 'rgba(255,255,255,0.9)',
              border: '1px solid rgba(61,90,82,0.3)',
              borderRadius: '2px',
              fontSize: '8px',
              fontWeight: 600,
              letterSpacing: '0.2em',
              color: screen === 'touchless' ? '#5a8a7a' : '#3D5A52',
              backdropFilter: 'blur(8px)'
            }}
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M2 3.5v3l2 1.5V2L2 3.5zM6 2.5C7.1 3.2 8 4 8 5s-.9 1.8-2 2.5M6.5 1C8.2 2 9.5 3.4 9.5 5S8.2 8 6.5 9" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round"/>
            </svg>
            ENABLE AMBIENT AUDIO
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {screen === 'touchless' ? (
          <motion.div
            key="touchless"
            initial={{ opacity: 0, scale: 1.04, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.6, ease: EXPO }}
            style={{ position: 'fixed', inset: 0, zIndex: 1 }}
          >
            <TouchlessScreen onNavigateLanding={goLanding} />
          </motion.div>
        ) : (
          <motion.div
            key="landing"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20, scale: 0.98 }}
            transition={{ duration: 0.6, ease: EXPO }}
            style={{ position: 'relative', zIndex: 1, minHeight: '100vh' }}
          >
            <LandingScreen onGoLive={goLive} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
