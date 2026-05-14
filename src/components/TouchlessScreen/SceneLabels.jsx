import { motion } from 'framer-motion'
import { LAYERS } from '../shared/LayerData'

const LABEL_POSITIONS = [
  { top: '18%', left: '38%' },
  { top: '25%', left: '58%' },
  { top: '32%', left: '28%' },
  { top: '22%', left: '48%' },
]

export default function SceneLabels({ activeLayer }) {
  return (
    <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 5 }}>
      {Object.entries(LAYERS).map(([key, layer], i) => (
        <motion.div
          key={key}
          className="absolute"
          style={LABEL_POSITIONS[i]}
          initial={{ opacity: 0 }}
          animate={{ opacity: activeLayer === key ? 1 : 0.35 }}
          transition={{ duration: 0.4 }}
        >
          <div
            className="flex items-center gap-2 px-3 py-1.5"
            style={{
              background: 'rgba(10,15,13,0.6)',
              border: `1px solid ${activeLayer === key ? '#3D5A52' : 'rgba(61,90,82,0.2)'}`,
              borderRadius: '2px',
              backdropFilter: 'blur(4px)'
            }}
          >
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: activeLayer === key ? '#3D5A52' : 'rgba(61,90,82,0.4)' }}
            />
            <span
              className="font-montserrat text-white"
              style={{ fontSize: '8px', fontWeight: 700, letterSpacing: '0.2em' }}
            >
              {layer.name}
            </span>
            <span
              className="font-montserrat"
              style={{ fontSize: '7px', fontWeight: 400, letterSpacing: '0.1em', color: '#5a8a7a' }}
            >
              {layer.metrics[0].value}
            </span>
          </div>
          {/* Connecting line downward */}
          <div
            className="mx-auto mt-0.5"
            style={{
              width: '1px',
              height: '20px',
              background: `linear-gradient(to bottom, ${activeLayer === key ? 'rgba(61,90,82,0.6)' : 'rgba(61,90,82,0.2)'}, transparent)`
            }}
          />
        </motion.div>
      ))}

      {/* Bottom status bar */}
      <div
        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-6 px-6 py-2"
        style={{
          background: 'rgba(10,15,13,0.7)',
          border: '1px solid rgba(61,90,82,0.2)',
          borderRadius: '2px',
          backdropFilter: 'blur(8px)'
        }}
      >
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          <span className="font-montserrat text-white/50" style={{ fontSize: '8px', letterSpacing: '0.2em', fontWeight: 500 }}>
            SYSTEM LIVE
          </span>
        </div>
        <div className="w-px h-4" style={{ background: 'rgba(255,255,255,0.1)' }} />
        <span className="font-montserrat text-white/30" style={{ fontSize: '8px', letterSpacing: '0.15em', fontWeight: 400 }}>
          ILUMA ALLIANCE — BIOLOGICAL INTELLIGENCE
        </span>
        <div className="w-px h-4" style={{ background: 'rgba(255,255,255,0.1)' }} />
        <span className="font-montserrat" style={{ fontSize: '8px', letterSpacing: '0.15em', color: '#3D5A52', fontWeight: 600 }}>
          2,847 NODES ACTIVE
        </span>
      </div>
    </div>
  )
}
