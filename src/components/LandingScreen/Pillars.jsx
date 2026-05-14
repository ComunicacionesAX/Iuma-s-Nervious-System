import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const PILLARS = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect x="1" y="1" width="26" height="26" stroke="currentColor" strokeWidth="1"/>
        <circle cx="14" cy="14" r="4" stroke="currentColor" strokeWidth="1"/>
        <path d="M14 1v4M14 23v4M1 14h4M23 14h4" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
      </svg>
    ),
    code: '01',
    name: 'Hardware Sensing',
    desc: 'MEMS-grade biomarker sensors capturing metabolic data at 120Hz, designed for harsh agricultural environments.',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path d="M4 24V8l6-6h14v22H4z" stroke="currentColor" strokeWidth="1"/>
        <path d="M10 2v6H4M8 14h12M8 18h8" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
      </svg>
    ),
    code: '02',
    name: 'Inventory Intelligence',
    desc: 'Volumetric laser sensing for autonomous silo-to-consumption supply chain management with FIFO precision.',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <circle cx="6" cy="14" r="3" stroke="currentColor" strokeWidth="1"/>
        <circle cx="22" cy="6" r="3" stroke="currentColor" strokeWidth="1"/>
        <circle cx="22" cy="22" r="3" stroke="currentColor" strokeWidth="1"/>
        <path d="M9 14h6M16 8l3 4M16 20l3-4" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
      </svg>
    ),
    code: '03',
    name: 'Sovereign Connectivity',
    desc: 'AES-256 encrypted LPWAN mesh network engineered for 15km range in high-interference field conditions.',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path d="M4 20l6-8 4 4 4-6 6 10" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
        <rect x="1" y="1" width="26" height="26" stroke="currentColor" strokeWidth="1"/>
        <circle cx="22" cy="8" r="2" fill="currentColor" fillOpacity="0.3" stroke="currentColor" strokeWidth="1"/>
      </svg>
    ),
    code: '04',
    name: 'Prescriptive AI',
    desc: 'Causal intelligence translating biological signals into autonomous nutrition decisions and ESG-grade outcomes.',
  },
]

export default function Pillars() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.2 })

  return (
    <section
      id="pillars"
      ref={ref}
      className="px-16 py-24"
      style={{ background: '#ffffff', borderTop: '1px solid #e5e5e5' }}
    >
      <div className="max-w-5xl mx-auto">
        {/* Section header */}
        <div className="flex items-center gap-4 mb-14">
          <div className="w-8 h-px" style={{ background: '#3D5A52' }} />
          <span
            className="font-montserrat"
            style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.4em', color: '#3D5A52' }}
          >
            TECHNOLOGY PILLARS
          </span>
        </div>

        <motion.h2
          className="font-montserrat mb-14"
          style={{ fontSize: '32px', fontWeight: 300, letterSpacing: '0.15em', color: '#1a1a1a' }}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          FOUR INTEGRATED BRANDS
        </motion.h2>

        <div className="grid grid-cols-4 gap-4">
          {PILLARS.map((pillar, i) => (
            <motion.div
              key={pillar.code}
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ scale: 1.01, background: '#fafafa' }}
              className="flex flex-col gap-5 p-6 transition-colors duration-200"
              style={{
                border: '1px solid #e5e5e5',
                borderRadius: '2px',
                background: '#ffffff'
              }}
            >
              <div className="flex items-start justify-between">
                <div style={{ color: '#3D5A52' }}>{pillar.icon}</div>
                <span
                  className="font-montserrat"
                  style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.2em', color: '#64748b' }}
                >
                  {pillar.code}
                </span>
              </div>

              <div>
                <h3
                  className="font-montserrat mb-3"
                  style={{ fontSize: '13px', fontWeight: 600, letterSpacing: '0.12em', color: '#1a1a1a' }}
                >
                  {pillar.name.toUpperCase()}
                </h3>
                <p
                  className="font-montserrat"
                  style={{ fontSize: '12px', fontWeight: 400, letterSpacing: '0.02em', color: '#64748b', lineHeight: 1.7 }}
                >
                  {pillar.desc}
                </p>
              </div>

              <div className="mt-auto pt-4" style={{ borderTop: '1px solid #e5e5e5' }}>
                <span
                  className="font-montserrat"
                  style={{ fontSize: '8px', fontWeight: 700, letterSpacing: '0.2em', color: '#3D5A52' }}
                >
                  LEARN MORE →
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
