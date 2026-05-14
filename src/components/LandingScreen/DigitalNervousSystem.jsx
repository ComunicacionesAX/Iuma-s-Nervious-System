import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { LAYERS, LAYER_KEYS } from '../shared/LayerData'

// ── Visualization: SENTO — animated ECG pulse wave ──────────────────────────
function SentoViz() {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let frame = 0
    let rafId

    const draw = () => {
      rafId = requestAnimationFrame(draw)
      frame++
      const w = canvas.width
      const h = canvas.height
      ctx.clearRect(0, 0, w, h)

      // ECG line
      ctx.beginPath()
      ctx.strokeStyle = '#3D5A52'
      ctx.lineWidth = 1.5
      const offset = frame * 2

      for (let x = 0; x < w; x++) {
        const pos = (x + offset) % w
        const t = pos / w
        let y = h / 2

        // QRS complex pattern
        const phase = (t * 4) % 1
        if (phase < 0.1) y = h / 2 - 4 * (phase / 0.1) * 8
        else if (phase < 0.12) y = h / 2 + (phase - 0.1) / 0.02 * 30
        else if (phase < 0.18) y = h / 2 - 60 * ((phase - 0.12) / 0.06)
        else if (phase < 0.22) y = h / 2 - 60 + 60 * ((phase - 0.18) / 0.04)
        else if (phase < 0.28) y = h / 2 + 8 - 8 * ((phase - 0.22) / 0.06)
        else y = h / 2 + Math.sin(phase * Math.PI * 2) * 3

        if (x === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.stroke()

      // Trailing glow
      ctx.beginPath()
      ctx.strokeStyle = 'rgba(61,90,82,0.15)'
      ctx.lineWidth = 4
      for (let x = 0; x < w; x++) {
        const pos = (x + offset) % w
        const t = pos / w
        const phase = (t * 4) % 1
        let y = h / 2
        if (phase < 0.18) y = h / 2 - 60 * ((phase - 0.12) / 0.06)
        else if (phase < 0.22) y = h / 2 - 60 + 60 * ((phase - 0.18) / 0.04)
        if (x === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.stroke()

      // Live indicator
      const dotX = (frame * 2) % w
      ctx.beginPath()
      ctx.arc(dotX, h / 2, 4, 0, Math.PI * 2)
      ctx.fillStyle = '#3D5A52'
      ctx.fill()
    }
    draw()
    return () => cancelAnimationFrame(rafId)
  }, [])

  return (
    <div className="w-full h-full flex flex-col justify-center gap-4">
      <div className="flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#3D5A52' }} />
        <span className="font-montserrat" style={{ fontSize: '8px', fontWeight: 700, letterSpacing: '0.3em', color: '#3D5A52' }}>
          LIVE BIOMARKER FEED — 120 Hz
        </span>
      </div>
      <canvas ref={canvasRef} width={480} height={120} className="w-full" style={{ height: '120px' }} />
    </div>
  )
}

// ── Visualization: INSYLO — silo bars + FIFO arrows ──────────────────────────
function InsyloViz() {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let frame = 0
    let rafId

    const SILOS = [0.85, 0.62, 0.45, 0.78, 0.30, 0.91]

    const draw = () => {
      rafId = requestAnimationFrame(draw)
      frame++
      const w = canvas.width
      const h = canvas.height
      ctx.clearRect(0, 0, w, h)

      const siloW = 50
      const gap = (w - SILOS.length * siloW) / (SILOS.length + 1)

      SILOS.forEach((fill, i) => {
        const animFill = fill + Math.sin(frame * 0.02 + i) * 0.03
        const x = gap + i * (siloW + gap)
        const maxH = h - 30
        const fillH = maxH * animFill

        // Silo outline
        ctx.strokeStyle = 'rgba(61,90,82,0.3)'
        ctx.lineWidth = 1
        ctx.strokeRect(x, 10, siloW, maxH)

        // Fill
        ctx.fillStyle = `rgba(61,90,82,${0.15 + animFill * 0.5})`
        ctx.fillRect(x + 1, 10 + maxH - fillH, siloW - 2, fillH - 1)

        // Percentage
        ctx.fillStyle = '#3D5A52'
        ctx.font = 'bold 9px monospace'
        ctx.textAlign = 'center'
        ctx.fillText(Math.round(animFill * 100) + '%', x + siloW / 2, h - 2)
      })

      // FIFO arrows
      if (Math.floor(frame / 30) % 2 === 0) {
        const arrowX = gap + siloW + gap / 2
        const arrowAlpha = (frame % 30) / 30
        ctx.strokeStyle = `rgba(61,90,82,${arrowAlpha * 0.8})`
        ctx.lineWidth = 1
        for (let i = 0; i < SILOS.length - 1; i++) {
          const ax = gap + i * (siloW + gap) + siloW + gap / 4
          const ay = h / 2 + 10
          ctx.beginPath()
          ctx.moveTo(ax, ay)
          ctx.lineTo(ax + gap / 2, ay)
          ctx.moveTo(ax + gap / 2 - 5, ay - 4)
          ctx.lineTo(ax + gap / 2, ay)
          ctx.lineTo(ax + gap / 2 - 5, ay + 4)
          ctx.stroke()
        }
      }
    }
    draw()
    return () => cancelAnimationFrame(rafId)
  }, [])

  return (
    <div className="w-full h-full flex flex-col justify-center gap-3">
      <div className="flex items-center gap-2">
        <span className="font-montserrat" style={{ fontSize: '8px', fontWeight: 700, letterSpacing: '0.3em', color: '#3D5A52' }}>
          SILO INVENTORY — FIFO ROTATION
        </span>
      </div>
      <canvas ref={canvasRef} width={480} height={140} className="w-full" style={{ height: '140px' }} />
    </div>
  )
}

// ── Visualization: BLUE SENSOR — network graph ───────────────────────────────
function BlueSensorViz() {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let frame = 0
    let rafId

    const NODES = Array.from({ length: 10 }, (_, i) => ({
      x: 40 + Math.random() * (canvas.width - 80),
      y: 20 + Math.random() * (canvas.height - 40)
    }))
    const EDGES = [[0,1],[1,2],[2,3],[3,4],[4,5],[5,0],[0,6],[6,7],[7,8],[8,9],[9,3]]

    // Packets along edges
    const PACKETS = EDGES.map(() => ({ t: Math.random() }))

    const draw = () => {
      rafId = requestAnimationFrame(draw)
      frame++
      const w = canvas.width
      const h = canvas.height
      ctx.clearRect(0, 0, w, h)

      // Edges
      EDGES.forEach(([a, b]) => {
        ctx.beginPath()
        ctx.moveTo(NODES[a].x, NODES[a].y)
        ctx.lineTo(NODES[b].x, NODES[b].y)
        ctx.strokeStyle = 'rgba(61,90,82,0.25)'
        ctx.lineWidth = 1
        ctx.stroke()
      })

      // Packets
      PACKETS.forEach((pkt, i) => {
        pkt.t = (pkt.t + 0.008) % 1
        const [a, b] = EDGES[i]
        const px = NODES[a].x + (NODES[b].x - NODES[a].x) * pkt.t
        const py = NODES[a].y + (NODES[b].y - NODES[a].y) * pkt.t
        ctx.beginPath()
        ctx.arc(px, py, 3, 0, Math.PI * 2)
        ctx.fillStyle = '#5a8a7a'
        ctx.fill()
        // Trail
        const grad = ctx.createRadialGradient(px, py, 0, px, py, 10)
        grad.addColorStop(0, 'rgba(61,90,82,0.4)')
        grad.addColorStop(1, 'rgba(61,90,82,0)')
        ctx.beginPath()
        ctx.arc(px, py, 10, 0, Math.PI * 2)
        ctx.fillStyle = grad
        ctx.fill()
      })

      // Nodes
      NODES.forEach((node, i) => {
        const pulse = Math.sin(frame * 0.05 + i) * 0.3 + 0.7
        ctx.beginPath()
        ctx.arc(node.x, node.y, 5, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(61,90,82,${pulse})`
        ctx.fill()
        ctx.strokeStyle = 'rgba(90,138,122,0.5)'
        ctx.lineWidth = 1
        ctx.stroke()
      })
    }
    draw()
    return () => cancelAnimationFrame(rafId)
  }, [])

  return (
    <div className="w-full h-full flex flex-col justify-center gap-3">
      <div className="flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#3D5A52' }} />
        <span className="font-montserrat" style={{ fontSize: '8px', fontWeight: 700, letterSpacing: '0.3em', color: '#3D5A52' }}>
          MESH NETWORK — AES-256 LIVE
        </span>
      </div>
      <canvas ref={canvasRef} width={480} height={150} className="w-full" style={{ height: '150px' }} />
    </div>
  )
}

// ── Visualization: ASIMETRIX — live recommendation table ─────────────────────
function AsimetrixViz() {
  const rows = [
    { param: 'Feed Rate', current: '2.84 kg/day', rec: '2.71 kg/day', delta: '−4.6%', roi: '+1.2%' },
    { param: 'FCR Index', current: '1.82', rec: '1.77', delta: '−0.05', roi: '+2.7%' },
    { param: 'CO₂ Output', current: '3.2 kg/day', rec: '2.93 kg/day', delta: '−8.5%', roi: 'ESG ↑' },
    { param: 'Water Use', current: '4.1 L/kg', rec: '3.9 L/kg', delta: '−4.9%', roi: '+0.8%' },
  ]

  return (
    <div className="w-full h-full flex flex-col justify-center gap-4">
      <div className="flex items-center gap-2">
        <span className="font-montserrat" style={{ fontSize: '8px', fontWeight: 700, letterSpacing: '0.3em', color: '#3D5A52' }}>
          LIVE PRESCRIPTIONS — CAUSAL AI
        </span>
      </div>
      <div style={{ border: '1px solid rgba(61,90,82,0.2)', borderRadius: '2px', overflow: 'hidden' }}>
        <table className="w-full" style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'rgba(61,90,82,0.08)' }}>
              {['Parameter', 'Current', 'Recommended', 'Delta', 'ROI'].map(h => (
                <th key={h} className="text-left py-2 px-3 font-montserrat" style={{ fontSize: '7px', fontWeight: 700, letterSpacing: '0.2em', color: '#64748b' }}>
                  {h.toUpperCase()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <motion.tr
                key={row.param}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                style={{ borderTop: '1px solid rgba(61,90,82,0.1)' }}
              >
                <td className="py-2.5 px-3 font-montserrat" style={{ fontSize: '10px', fontWeight: 500, color: '#1a1a1a' }}>{row.param}</td>
                <td className="py-2.5 px-3 font-montserrat" style={{ fontSize: '10px', color: '#64748b' }}>{row.current}</td>
                <td className="py-2.5 px-3 font-montserrat" style={{ fontSize: '10px', fontWeight: 600, color: '#3D5A52' }}>{row.rec}</td>
                <td className="py-2.5 px-3 font-montserrat" style={{ fontSize: '10px', color: '#ef4444' }}>{row.delta}</td>
                <td className="py-2.5 px-3 font-montserrat" style={{ fontSize: '10px', fontWeight: 700, color: '#3D5A52' }}>{row.roi}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const VIZ_MAP = {
  sento: SentoViz,
  insylo: InsyloViz,
  bluesensor: BlueSensorViz,
  asimetrix: AsimetrixViz,
}

export default function DigitalNervousSystem() {
  const [activeLayer, setActiveLayer] = useState('sento')
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.2 })
  const ActiveViz = VIZ_MAP[activeLayer]

  return (
    <section
      id="digital-system"
      ref={ref}
      className="px-16 py-24"
      style={{ background: '#f0f5f3', borderTop: '1px solid #e5e5e5' }}
    >
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-14">
          <div className="w-8 h-px" style={{ background: '#3D5A52' }} />
          <span className="font-montserrat" style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.4em', color: '#3D5A52' }}>
            DIGITAL NERVOUS SYSTEM
          </span>
        </div>

        <motion.h2
          className="font-montserrat mb-14"
          style={{ fontSize: '32px', fontWeight: 300, letterSpacing: '0.15em', color: '#1a1a1a' }}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          FOUR INTELLIGENT LAYERS
        </motion.h2>

        <div className="flex gap-8">
          {/* Left: interactive visualization */}
          <div
            className="flex-1 flex flex-col justify-center p-8"
            style={{
              background: '#ffffff',
              border: '1px solid #e5e5e5',
              borderRadius: '2px',
              minHeight: '280px'
            }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={activeLayer}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.28 }}
                className="w-full h-full"
              >
                <ActiveViz />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right: layer buttons */}
          <div className="flex flex-col gap-2 w-64">
            {LAYER_KEYS.map((key, i) => {
              const layer = LAYERS[key]
              const isActive = activeLayer === key
              return (
                <motion.button
                  key={key}
                  onClick={() => setActiveLayer(key)}
                  initial={{ opacity: 0, x: 20 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.1 + i * 0.08 }}
                  className="flex flex-col gap-1.5 p-4 text-left transition-all duration-200"
                  style={{
                    background: isActive ? '#ffffff' : 'transparent',
                    border: '1px solid',
                    borderColor: isActive ? '#3D5A52' : '#e5e5e5',
                    borderLeft: isActive ? '3px solid #3D5A52' : '3px solid transparent',
                    borderRadius: '2px'
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-montserrat" style={{ fontSize: '8px', fontWeight: 700, letterSpacing: '0.25em', color: isActive ? '#3D5A52' : '#64748b' }}>
                      {layer.code}
                    </span>
                    <div className="flex-1 h-px" style={{ background: isActive ? 'rgba(61,90,82,0.3)' : '#e5e5e5' }} />
                  </div>
                  <span className="font-montserrat" style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.12em', color: isActive ? '#1a1a1a' : '#64748b' }}>
                    {layer.name}
                  </span>
                  <span className="font-montserrat" style={{ fontSize: '10px', fontWeight: 400, color: '#64748b', letterSpacing: '0.03em' }}>
                    {layer.sub}
                  </span>
                  {isActive && (
                    <div className="flex gap-2 mt-1 flex-wrap">
                      {layer.metrics.slice(0, 2).map(m => (
                        <span
                          key={m.label}
                          className="font-montserrat px-2 py-0.5"
                          style={{ fontSize: '8px', fontWeight: 700, letterSpacing: '0.1em', background: 'rgba(61,90,82,0.08)', color: '#3D5A52', borderRadius: '2px' }}
                        >
                          {m.label}: {m.value}
                        </span>
                      ))}
                    </div>
                  )}
                </motion.button>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
