import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const KPI_ITEMS = [
  { value: 4, suffix: '', label: 'Integrated Brands', prefix: '' },
  { value: 99.98, suffix: '%', label: 'System Uptime', prefix: '' },
  { value: 14200, suffix: '+', label: 'Silos Monitored', prefix: '' },
  { value: 18.7, suffix: '%', label: 'Avg. ROI Uplift', prefix: '+' },
]

function Counter({ value, suffix, prefix, label }) {
  const elRef = useRef(null)

  useEffect(() => {
    const el = elRef.current
    if (!el) return

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: el,
        start: 'top 85%',
        onEnter: () => {
          gsap.fromTo(
            { val: 0 },
            {
              val: value,
              duration: 1.8,
              ease: 'power2.out',
              onUpdate: function () {
                const v = this.targets()[0].val
                const formatted = value >= 100
                  ? Math.round(v).toLocaleString()
                  : v.toFixed(value % 1 !== 0 ? 2 : 0)
                el.textContent = prefix + formatted + suffix
              }
            }
          )
        },
        once: true
      })
    })
    return () => ctx.revert()
  }, [value, suffix, prefix])

  return (
    <div className="flex flex-col gap-2">
      <span
        ref={elRef}
        className="font-montserrat"
        style={{ fontSize: '36px', fontWeight: 300, color: '#3D5A52', letterSpacing: '0.05em' }}
      >
        {prefix}0{suffix}
      </span>
      <span
        className="font-montserrat"
        style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.25em', color: '#64748b' }}
      >
        {label.toUpperCase()}
      </span>
    </div>
  )
}

const headlineLines = [
  { text: 'Designing Nutrition,', em: false },
  { text: 'Enhancing Lives.', em: true },
]

export default function Hero({ onGoLive }) {
  return (
    <section
      id="hero"
      className="relative flex flex-col justify-center px-16 landing-scroll"
      style={{ minHeight: '100vh', background: '#ffffff', paddingTop: '120px', paddingBottom: '80px' }}
    >
      {/* Subtle grid background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(rgba(61,90,82,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(61,90,82,0.04) 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }}
      />

      <div className="relative max-w-5xl mx-auto w-full">
        {/* Overline */}
        <motion.div
          className="flex items-center gap-4 mb-12"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="w-8 h-px" style={{ background: '#3D5A52' }} />
          <span
            className="font-montserrat"
            style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.4em', color: '#3D5A52' }}
          >
            ILUMA ALLIANCE — BIOLOGICAL INTELLIGENCE PLATFORM
          </span>
        </motion.div>

        {/* Main headline */}
        <div className="flex flex-col gap-1 mb-16">
          {headlineLines.map((line, i) => (
            <div key={i} style={{ overflow: 'hidden' }}>
              <motion.h1
                className="font-montserrat"
                style={{
                  fontSize: 'clamp(40px, 6vw, 72px)',
                  fontWeight: 300,
                  letterSpacing: '0.05em',
                  lineHeight: 1.1,
                  color: line.em ? '#3D5A52' : '#1a1a1a'
                }}
                initial={{ y: 80, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.2 + i * 0.12, ease: [0.76, 0, 0.24, 1] }}
              >
                {line.text}
              </motion.h1>
            </div>
          ))}
        </div>

        {/* Subtext + CTA row */}
        <div className="flex items-start gap-16 mb-20">
          <motion.p
            className="font-montserrat max-w-sm"
            style={{ fontSize: '14px', fontWeight: 400, letterSpacing: '0.03em', color: '#64748b', lineHeight: 1.75 }}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            A vertically integrated Biological Intelligence stack — from MEMS sensors to causal AI —
            engineered to optimise animal nutrition, reduce waste, and deliver measurable ESG outcomes.
          </motion.p>

          <motion.div
            className="flex flex-col gap-3 flex-shrink-0"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <button
              onClick={onGoLive}
              className="font-montserrat flex items-center gap-3 px-6 py-4 text-white transition-all duration-200 hover:opacity-90"
              style={{
                background: '#3D5A52',
                borderRadius: '2px',
                fontSize: '10px',
                fontWeight: 600,
                letterSpacing: '0.2em'
              }}
            >
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse flex-shrink-0" />
              LAUNCH LIVE INTERFACE
            </button>

            <button
              onClick={() => document.getElementById('digital-system')?.scrollIntoView({ behavior: 'smooth' })}
              className="font-montserrat flex items-center gap-3 px-6 py-4 transition-all duration-200 hover:bg-accent-pale"
              style={{
                border: '1px solid #e5e5e5',
                borderRadius: '2px',
                fontSize: '10px',
                fontWeight: 600,
                letterSpacing: '0.2em',
                color: '#1a1a1a'
              }}
            >
              EXPLORE THE SYSTEM
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 2v10M2 7l5 5 5-5" stroke="#3D5A52" strokeWidth="1" strokeLinecap="round"/>
              </svg>
            </button>
          </motion.div>
        </div>

        {/* KPI counters */}
        <motion.div
          className="grid grid-cols-4 gap-8 pt-10"
          style={{ borderTop: '1px solid #e5e5e5' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          {KPI_ITEMS.map((kpi) => (
            <Counter key={kpi.label} {...kpi} />
          ))}
        </motion.div>
      </div>
    </section>
  )
}
