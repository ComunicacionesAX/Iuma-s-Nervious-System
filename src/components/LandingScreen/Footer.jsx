import { motion } from 'framer-motion'

export default function Footer({ onGoLive }) {
  return (
    <footer style={{ background: '#0a0f0d', borderTop: '1px solid rgba(61,90,82,0.2)' }}>
      {/* CTA band */}
      <div className="px-16 py-20" style={{ borderBottom: '1px solid rgba(61,90,82,0.15)' }}>
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <p
              className="font-montserrat text-white mb-3"
              style={{ fontSize: '24px', fontWeight: 300, letterSpacing: '0.15em' }}
            >
              EXPERIENCE THE PLATFORM
            </p>
            <p
              className="font-montserrat"
              style={{ fontSize: '12px', fontWeight: 400, letterSpacing: '0.05em', color: '#5a8a7a' }}
            >
              Launch the touchless interface — gesture-controlled, camera-enabled, live.
            </p>
          </div>

          <motion.button
            onClick={onGoLive}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="font-montserrat flex items-center gap-3 px-8 py-4 text-white"
            style={{
              background: '#3D5A52',
              borderRadius: '2px',
              fontSize: '10px',
              fontWeight: 600,
              letterSpacing: '0.2em',
              flexShrink: 0
            }}
          >
            <span className="w-1.5 h-1.5 bg-white/80 rounded-full animate-pulse" />
            LAUNCH LIVE INTERFACE
          </motion.button>
        </div>
      </div>

      {/* Bottom footer */}
      <div className="px-16 py-8 max-w-5xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border border-white/20 flex items-center justify-center">
            <div className="w-2 h-2" style={{ background: '#3D5A52' }} />
          </div>
          <span
            className="font-montserrat text-white/40"
            style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.4em' }}
          >
            ILUMA ALLIANCE
          </span>
        </div>

        <span
          className="font-montserrat"
          style={{ fontSize: '8px', fontWeight: 400, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.2)' }}
        >
          BIOLOGICAL INTELLIGENCE — CONFIDENTIAL PRESENTATION 2025
        </span>

        <div className="flex items-center gap-6">
          {['Privacy', 'Contact', 'ESG Report'].map(link => (
            <span
              key={link}
              className="font-montserrat cursor-pointer hover:text-white/60 transition-colors duration-200"
              style={{ fontSize: '9px', fontWeight: 500, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.25)' }}
            >
              {link.toUpperCase()}
            </span>
          ))}
        </div>
      </div>
    </footer>
  )
}
