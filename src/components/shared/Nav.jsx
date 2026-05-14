import { motion } from 'framer-motion'

export default function Nav({ onGoLive }) {
  const scrollTo = (id) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-10"
      style={{ background: '#3D5A52', height: '64px' }}
      initial={{ y: -64 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
    >
      <div className="flex items-center gap-3">
        <div className="w-6 h-6 border border-white/60 flex items-center justify-center">
          <div className="w-2.5 h-2.5 bg-white/90" />
        </div>
        <span
          className="text-white font-montserrat font-300 tracking-widest text-xs uppercase"
          style={{ letterSpacing: '0.35em', fontWeight: 300 }}
        >
          ILUMA ALLIANCE
        </span>
      </div>

      <div className="flex items-center gap-8">
        {[
          { label: 'Technology', id: 'pillars' },
          { label: 'Digital System', id: 'digital-system' },
          { label: 'Ecosystem', id: 'leverage' },
        ].map(({ label, id }) => (
          <button
            key={id}
            onClick={() => scrollTo(id)}
            className="text-white/70 hover:text-white transition-colors duration-200 font-montserrat text-xs uppercase tracking-widest"
            style={{ letterSpacing: '0.2em', fontWeight: 500 }}
          >
            {label}
          </button>
        ))}

        <button
          onClick={onGoLive}
          className="flex items-center gap-2 text-white border border-white/40 px-4 py-2 hover:border-white/80 hover:bg-white/10 transition-all duration-200 text-xs uppercase tracking-widest"
          style={{ letterSpacing: '0.2em', fontWeight: 600, borderRadius: '2px' }}
        >
          <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
          Live Interface
        </button>
      </div>
    </motion.nav>
  )
}
