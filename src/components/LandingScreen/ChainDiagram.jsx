import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { LAYERS, LAYER_KEYS } from '../shared/LayerData'

export default function ChainDiagram() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.2 })

  return (
    <section
      ref={ref}
      className="px-16 py-24"
      style={{ background: '#f0f5f3', borderTop: '1px solid #e5e5e5' }}
    >
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-14">
          <div className="w-8 h-px" style={{ background: '#3D5A52' }} />
          <span className="font-montserrat" style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.4em', color: '#3D5A52' }}>
            INTEGRATED VALUE CHAIN
          </span>
        </div>

        <div className="flex gap-16 items-center">
          {/* Left: description */}
          <div className="w-64 flex-shrink-0">
            <motion.h2
              className="font-montserrat mb-6"
              style={{ fontSize: '24px', fontWeight: 300, letterSpacing: '0.12em', color: '#1a1a1a', lineHeight: 1.4 }}
              initial={{ opacity: 0, x: -20 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6 }}
            >
              FROM SIGNAL<br />
              <span style={{ color: '#3D5A52' }}>TO DECISION</span>
            </motion.h2>
            <motion.p
              className="font-montserrat"
              style={{ fontSize: '12px', fontWeight: 400, letterSpacing: '0.03em', color: '#64748b', lineHeight: 1.75 }}
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ delay: 0.2 }}
            >
              The Iluma stack is the only fully integrated Biological Intelligence platform —
              every layer communicates in real-time to eliminate latency between sensing and action.
            </motion.p>

            <motion.div
              className="mt-8 flex flex-col gap-2"
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ delay: 0.4 }}
            >
              {['Zero third-party data gaps', 'Sub-10ms signal-to-decision', 'Sovereign data residency'].map(pt => (
                <div key={pt} className="flex items-start gap-2">
                  <div className="w-1 h-1 rounded-full mt-1.5 flex-shrink-0" style={{ background: '#3D5A52' }} />
                  <span className="font-montserrat" style={{ fontSize: '11px', fontWeight: 400, color: '#64748b', lineHeight: 1.6 }}>
                    {pt}
                  </span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right: chain */}
          <div className="flex-1 flex flex-col gap-2">
            {LAYER_KEYS.map((key, i) => {
              const layer = LAYERS[key]
              const isLast = i === LAYER_KEYS.length - 1

              return (
                <div key={key}>
                  <motion.div
                    initial={{ opacity: 0, x: 40 }}
                    animate={inView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.5, delay: 0.1 + i * 0.12 }}
                    whileHover={{ background: isLast ? 'rgba(61,90,82,0.06)' : '#f9f9f9' }}
                    className="flex items-center gap-5 px-5 py-4 transition-colors duration-200"
                    style={{
                      background: isLast ? 'rgba(61,90,82,0.04)' : '#ffffff',
                      border: '1px solid',
                      borderColor: isLast ? '#3D5A52' : '#e5e5e5',
                      borderTop: isLast ? '2px solid #3D5A52' : '1px solid #e5e5e5',
                      borderRadius: '2px'
                    }}
                  >
                    {/* Code */}
                    <span
                      className="font-montserrat flex-shrink-0"
                      style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.25em', color: '#3D5A52', width: '24px' }}
                    >
                      {layer.code}
                    </span>

                    {/* Divider */}
                    <div className="w-px h-8 flex-shrink-0" style={{ background: '#e5e5e5' }} />

                    {/* Name + sub */}
                    <div className="flex-shrink-0 w-36">
                      <div className="font-montserrat" style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.12em', color: '#1a1a1a' }}>
                        {layer.name}
                      </div>
                      <div className="font-montserrat mt-0.5" style={{ fontSize: '9px', fontWeight: 400, letterSpacing: '0.08em', color: '#64748b' }}>
                        {layer.sub}
                      </div>
                    </div>

                    {/* Tag */}
                    <div
                      className="flex-shrink-0 px-2 py-1"
                      style={{ border: '1px solid rgba(61,90,82,0.3)', borderRadius: '2px', background: 'rgba(61,90,82,0.06)' }}
                    >
                      <span className="font-montserrat" style={{ fontSize: '8px', fontWeight: 700, letterSpacing: '0.15em', color: '#3D5A52' }}>
                        {layer.tag.toUpperCase()}
                      </span>
                    </div>

                    {/* Metrics row */}
                    <div className="flex gap-4 ml-auto">
                      {layer.metrics.map(m => (
                        <div key={m.label} className="flex flex-col gap-0.5 text-right">
                          <span className="font-montserrat" style={{ fontSize: '11px', fontWeight: 600, color: isLast ? '#3D5A52' : '#1a1a1a', letterSpacing: '0.04em' }}>
                            {m.value}
                          </span>
                          <span className="font-montserrat" style={{ fontSize: '7px', fontWeight: 700, letterSpacing: '0.15em', color: '#64748b' }}>
                            {m.label.toUpperCase()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </motion.div>

                  {/* Connector arrow */}
                  {!isLast && (
                    <motion.div
                      className="flex justify-start ml-12 py-0.5"
                      initial={{ opacity: 0 }}
                      animate={inView ? { opacity: 1 } : {}}
                      transition={{ delay: 0.2 + i * 0.12 }}
                    >
                      <svg width="14" height="12" viewBox="0 0 14 12" fill="none">
                        <path d="M7 0v8M3 6l4 4 4-4" stroke="#3D5A52" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.4"/>
                      </svg>
                    </motion.div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
