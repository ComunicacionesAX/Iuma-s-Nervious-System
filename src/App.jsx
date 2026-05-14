import { useState, useEffect, useCallback, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import TouchlessScreen from './components/TouchlessScreen'
import LandingScreen from './components/LandingScreen'
import CustomCursor from './components/shared/CustomCursor'

const EXPO = [0.76, 0, 0.24, 1]

export default function App() {
  const [screen, setScreen] = useState('touchless')
  const [audioEnabled, setAudioEnabled] = useState(false)
  const [showAudioBanner, setShowAudioBanner] = useState(true)
  const synthRef = useRef(null)

  const enableAudio = useCallback(async () => {
    setShowAudioBanner(false)
    try {
      const Tone = await import('tone')
      await Tone.getContext().resume()

      const hum = new Tone.Oscillator(60, 'sine')
      const vol = new Tone.Volume(-42)
      const reverb = new Tone.Reverb({ decay: 4, wet: 0.6 })
      hum.chain(vol, reverb, Tone.getDestination())
      hum.start()

      synthRef.current = {
        ping: () => {
          try {
            const s = new Tone.Synth({
              oscillator: { type: 'triangle' },
              envelope: { attack: 0.01, decay: 0.1, sustain: 0, release: 0.12 }
            }).toDestination()
            s.volume.value = -24
            s.triggerAttackRelease(880, '32n')
            setTimeout(() => s.dispose(), 600)
          } catch (_) {}
        }
      }
      setAudioEnabled(true)
    } catch (e) {
      console.warn('Audio unavailable:', e)
    }
  }, [])

  const skipAudio = useCallback(() => setShowAudioBanner(false), [])

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
      if (e.key === 'Escape') setShowAudioBanner(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <>
      <CustomCursor screen={screen} />

      {/* Audio welcome banner — large, centred, impossible to miss */}
      <AnimatePresence>
        {showAudioBanner && !audioEnabled && (
          <motion.div
            key="audio-banner"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 flex items-center justify-center"
            style={{ zIndex: 200, background: 'rgba(10,15,13,0.92)', backdropFilter: 'blur(12px)' }}
          >
            <motion.div
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.4 }}
              className="flex flex-col items-center gap-8 text-center"
              style={{ maxWidth: '420px' }}
            >
              {/* Logo mark */}
              <div className="w-10 h-10 border flex items-center justify-center" style={{ borderColor: '#3D5A52' }}>
                <div className="w-4 h-4" style={{ background: '#3D5A52' }} />
              </div>

              <div>
                <p className="font-montserrat text-white mb-2" style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.4em' }}>
                  ILUMA ALLIANCE
                </p>
                <h2 className="font-montserrat text-white" style={{ fontSize: '26px', fontWeight: 300, letterSpacing: '0.2em', lineHeight: 1.3 }}>
                  BIOLOGICAL INTELLIGENCE<br />PLATFORM
                </h2>
              </div>

              <div className="w-16 h-px" style={{ background: '#3D5A52' }} />

              <p className="font-montserrat" style={{ fontSize: '12px', fontWeight: 400, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.06em', lineHeight: 1.7 }}>
                This platform includes ambient audio for an immersive experience.
              </p>

              <div className="flex flex-col gap-3 w-full">
                <button
                  onClick={enableAudio}
                  className="font-montserrat text-white w-full py-4 flex items-center justify-center gap-3 transition-all duration-200 hover:opacity-90"
                  style={{ background: '#3D5A52', borderRadius: '2px', fontSize: '11px', fontWeight: 700, letterSpacing: '0.25em' }}
                >
                  {/* Speaker icon */}
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2 5v4l3 2V3L2 5zM8 3.5c1.5 1 2.5 2.1 2.5 3.5S9.5 9.5 8 10.5M9 1C11.3 2.5 13 4.6 13 7s-1.7 4.5-4 6" stroke="white" strokeWidth="1" strokeLinecap="round"/>
                  </svg>
                  ENABLE AUDIO &amp; ENTER
                </button>

                <button
                  onClick={skipAudio}
                  className="font-montserrat w-full py-3 transition-colors duration-200 hover:text-white/60"
                  style={{ fontSize: '10px', fontWeight: 500, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '2px' }}
                >
                  CONTINUE WITHOUT AUDIO
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Audio status pill (shown after banner is dismissed) */}
      {!showAudioBanner && (
        <div
          className="fixed flex items-center gap-2 px-3 py-1.5"
          style={{
            bottom: '18px', right: '18px', zIndex: 50,
            background: 'rgba(10,15,13,0.7)',
            border: '1px solid rgba(61,90,82,0.3)',
            borderRadius: '2px',
            backdropFilter: 'blur(8px)'
          }}
        >
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: audioEnabled ? '#3D5A52' : '#64748b' }} />
          <span className="font-montserrat" style={{ fontSize: '8px', fontWeight: 600, letterSpacing: '0.2em', color: audioEnabled ? '#5a8a7a' : '#64748b' }}>
            {audioEnabled ? 'AUDIO ON' : 'AUDIO OFF'}
          </span>
        </div>
      )}

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
