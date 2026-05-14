import { motion, AnimatePresence } from 'framer-motion'
import { LAYERS } from '../shared/LayerData'

export default function InfoPanel({ activeLayer, onFullOverview }) {
  const layer = LAYERS[activeLayer]
  if (!layer) return null

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={activeLayer}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="absolute left-6 top-1/2 -translate-y-1/2 flex flex-col gap-4"
        style={{
          zIndex: 20,
          maxWidth: '320px',
          background: 'rgba(10, 15, 13, 0.75)',
          border: '1px solid rgba(61, 90, 82, 0.3)',
          borderRadius: '2px',
          backdropFilter: 'blur(12px)',
          padding: '28px'
        }}
      >
        {/* Layer code + tag */}
        <div className="flex items-center gap-3">
          <span
            className="font-montserrat text-accent-mid"
            style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.25em' }}
          >
            LAYER {layer.code}
          </span>
          <div className="flex-1 h-px" style={{ background: 'rgba(61,90,82,0.4)' }} />
          <span
            className="font-montserrat"
            style={{
              fontSize: '8px', fontWeight: 700, letterSpacing: '0.2em',
              color: '#3D5A52', border: '1px solid rgba(61,90,82,0.5)',
              padding: '2px 8px', borderRadius: '2px'
            }}
          >
            {layer.tag}
          </span>
        </div>

        {/* Name */}
        <div>
          <h2
            className="font-montserrat text-white"
            style={{ fontSize: '22px', fontWeight: 300, letterSpacing: '0.35em', lineHeight: 1.1 }}
          >
            {layer.name}
          </h2>
          <p
            className="font-montserrat mt-1"
            style={{ fontSize: '10px', fontWeight: 400, letterSpacing: '0.1em', color: '#5a8a7a' }}
          >
            {layer.sub}
          </p>
        </div>

        {/* Divider */}
        <div className="h-px" style={{ background: 'rgba(61,90,82,0.3)' }} />

        {/* Title + Description */}
        <div>
          <p
            className="font-montserrat text-white"
            style={{ fontSize: '13px', fontWeight: 500, letterSpacing: '0.05em', lineHeight: 1.5 }}
          >
            {layer.title}
          </p>
          <p
            className="font-montserrat mt-3"
            style={{ fontSize: '11px', fontWeight: 400, letterSpacing: '0.03em', color: 'rgba(255,255,255,0.55)', lineHeight: 1.7 }}
          >
            {layer.desc}
          </p>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-3 gap-2 mt-1">
          {layer.metrics.map((m, i) => (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.07 }}
              className="flex flex-col gap-1"
              style={{
                background: 'rgba(61,90,82,0.1)',
                border: '1px solid rgba(61,90,82,0.25)',
                borderRadius: '2px',
                padding: '10px 8px'
              }}
            >
              <span
                className="font-montserrat"
                style={{ fontSize: '8px', fontWeight: 700, letterSpacing: '0.15em', color: '#5a8a7a' }}
              >
                {m.label.toUpperCase()}
              </span>
              <span
                className="font-montserrat text-white"
                style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.05em' }}
              >
                {m.value}
              </span>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.button
          onClick={onFullOverview}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          className="mt-2 font-montserrat text-white flex items-center gap-3 px-4 py-3 transition-all duration-200"
          style={{
            background: 'rgba(61,90,82,0.2)',
            border: '1px solid rgba(61,90,82,0.5)',
            borderRadius: '2px',
            fontSize: '10px',
            fontWeight: 600,
            letterSpacing: '0.2em'
          }}
        >
          <span className="flex-1 text-left">FULL PLATFORM OVERVIEW</span>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M1 7h12M7 1l6 6-6 6" stroke="#5a8a7a" strokeWidth="1" strokeLinecap="round"/>
          </svg>
        </motion.button>
      </motion.div>
    </AnimatePresence>
  )
}
