import { useRef, useEffect } from 'react'
import { motion, useInView } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const STATS = [
  { value: 18.7, suffix: '%', prefix: '+', label: 'ROI Uplift', sub: 'Avg. per deployment' },
  { value: 8.5, suffix: '%', prefix: '−', label: 'CO₂ Reduction', sub: 'ESG Tier 1 certified' },
  { value: 12, suffix: '%', prefix: '', label: 'Waste Reduction', sub: 'Feed oxidation eliminated' },
  { value: 99.98, suffix: '%', prefix: '', label: 'System Uptime', sub: 'Across all deployments' },
  { value: 47, suffix: '', prefix: '', label: 'Causal Models', sub: 'In production' },
  { value: 0.05, suffix: '', prefix: '−', label: 'FCR Improvement', sub: 'Per animal per day' },
]

function StatCounter({ value, suffix, prefix, label, sub }) {
  const elRef = useRef(null)

  useEffect(() => {
    const el = elRef.current
    if (!el) return
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: el,
        start: 'top 85%',
        once: true,
        onEnter: () => {
          gsap.fromTo(
            { val: 0 },
            {
              val: value,
              duration: 1.6,
              ease: 'power2.out',
              onUpdate: function () {
                const v = this.targets()[0].val
                const formatted = value >= 10 ? v.toFixed(0) : v.toFixed(2)
                el.textContent = prefix + formatted + suffix
              }
            }
          )
        }
      })
    })
    return () => ctx.revert()
  }, [value, suffix, prefix])

  return (
    <div
      className="flex flex-col gap-2 p-5"
      style={{ border: '1px solid #e5e5e5', borderRadius: '2px' }}
    >
      <span
        ref={elRef}
        className="font-montserrat"
        style={{ fontSize: '30px', fontWeight: 300, color: '#3D5A52', letterSpacing: '0.04em' }}
      >
        {prefix}0{suffix}
      </span>
      <span
        className="font-montserrat"
        style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.15em', color: '#1a1a1a' }}
      >
        {label.toUpperCase()}
      </span>
      <span
        className="font-montserrat"
        style={{ fontSize: '10px', fontWeight: 400, letterSpacing: '0.03em', color: '#64748b' }}
      >
        {sub}
      </span>
    </div>
  )
}

export default function Leverage() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.2 })

  return (
    <section
      id="leverage"
      ref={ref}
      className="px-16 py-24"
      style={{ background: '#ffffff', borderTop: '1px solid #e5e5e5' }}
    >
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-14">
          <div className="w-8 h-px" style={{ background: '#3D5A52' }} />
          <span className="font-montserrat" style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.4em', color: '#3D5A52' }}>
            ECOSYSTEM LEVERAGE
          </span>
        </div>

        <div className="flex gap-16 items-start">
          {/* Left: headline + description */}
          <div className="w-72 flex-shrink-0">
            <motion.h2
              className="font-montserrat mb-6"
              style={{ fontSize: '28px', fontWeight: 300, letterSpacing: '0.12em', color: '#1a1a1a', lineHeight: 1.3 }}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6 }}
            >
              MEASURABLE<br />
              <span style={{ color: '#3D5A52' }}>OUTCOMES</span>
            </motion.h2>
            <motion.p
              className="font-montserrat"
              style={{ fontSize: '12px', fontWeight: 400, letterSpacing: '0.03em', color: '#64748b', lineHeight: 1.75 }}
              initial={{ opacity: 0, y: 12 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.15 }}
            >
              Every metric is derived from live deployments across Europe and Latin America.
              No projections — these are validated results from the Iluma Alliance stack.
            </motion.p>

            <motion.div
              className="mt-8 pt-8"
              style={{ borderTop: '1px solid #e5e5e5' }}
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ delay: 0.3 }}
            >
              <p className="font-montserrat mb-3" style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.25em', color: '#64748b' }}>
                CERTIFIED BY
              </p>
              {['ESG Tier 1', 'ISO 27001', 'CE Marking', 'FDA 21 CFR'].map(cert => (
                <div
                  key={cert}
                  className="flex items-center gap-2 mb-2"
                >
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5l2.5 2.5L8 3" stroke="#3D5A52" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span className="font-montserrat" style={{ fontSize: '10px', fontWeight: 500, letterSpacing: '0.08em', color: '#1a1a1a' }}>
                    {cert}
                  </span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right: stats grid */}
          <div className="flex-1 grid grid-cols-3 gap-3">
            {STATS.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 16 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.1 + i * 0.07 }}
              >
                <StatCounter {...stat} />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
