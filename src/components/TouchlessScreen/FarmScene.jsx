import { useEffect, useRef } from 'react'

// Pure Canvas 2D farm — zero WebGL dependency, works everywhere
export default function FarmScene() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    let W = window.innerWidth
    let H = window.innerHeight
    canvas.width = W
    canvas.height = H

    // ── Silo definitions (isometric x,y on screen) ─────────────────────
    const SILOS = [
      { x: 0.18, y: 0.38, h: 0.22, fill: 0.72 },
      { x: 0.30, y: 0.30, h: 0.26, fill: 0.55 },
      { x: 0.50, y: 0.27, h: 0.28, fill: 0.88 },
      { x: 0.68, y: 0.30, h: 0.24, fill: 0.42 },
      { x: 0.80, y: 0.38, h: 0.20, fill: 0.65 },
      { x: 0.40, y: 0.20, h: 0.18, fill: 0.30 },
      { x: 0.60, y: 0.21, h: 0.19, fill: 0.78 },
    ]

    // ── Sensor nodes ───────────────────────────────────────────────────
    const NODES = [
      { x: 0.20, y: 0.65 }, { x: 0.35, y: 0.72 }, { x: 0.50, y: 0.68 },
      { x: 0.65, y: 0.71 }, { x: 0.80, y: 0.64 }, { x: 0.28, y: 0.58 },
      { x: 0.72, y: 0.57 }, { x: 0.50, y: 0.55 }, { x: 0.42, y: 0.78 },
      { x: 0.60, y: 0.77 },
    ]

    // ── Particles ──────────────────────────────────────────────────────
    const PARTICLES = Array.from({ length: 180 }, () => ({
      x: Math.random(),
      y: Math.random() * 0.45 + 0.05,
      vx: (Math.random() - 0.5) * 0.0006,
      vy: (Math.random() - 0.5) * 0.0003,
      size: Math.random() * 2 + 0.5,
      alpha: Math.random() * 0.6 + 0.2,
    }))

    // ── Grid lines ─────────────────────────────────────────────────────
    const GRID_LINES = 18

    let frame = 0
    let animId

    const drawSilo = (sx, sy, sh, sfill, t) => {
      const x = sx * W
      const y = sy * H
      const w = W * 0.048
      const h = sh * H
      const bot = y + h * 0.3
      const top = bot - h

      // Shadow
      ctx.save()
      ctx.globalAlpha = 0.18
      ctx.fillStyle = '#000'
      ctx.beginPath()
      ctx.ellipse(x, bot + 4, w * 0.65, w * 0.18, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()

      // Body gradient
      const grad = ctx.createLinearGradient(x - w, top, x + w, bot)
      grad.addColorStop(0, '#2d5045')
      grad.addColorStop(0.4, '#4a7a68')
      grad.addColorStop(1, '#1e3830')
      ctx.fillStyle = grad
      ctx.beginPath()
      ctx.moveTo(x - w, top + w * 0.25)
      ctx.lineTo(x - w, bot - w * 0.25)
      ctx.quadraticCurveTo(x - w, bot, x, bot + w * 0.25)
      ctx.quadraticCurveTo(x + w, bot, x + w, bot - w * 0.25)
      ctx.lineTo(x + w, top + w * 0.25)
      ctx.quadraticCurveTo(x + w, top, x, top - w * 0.25)
      ctx.quadraticCurveTo(x - w, top, x - w, top + w * 0.25)
      ctx.fill()

      // Animated fill level
      const fillY = bot - (h - w * 0.5) * (sfill + Math.sin(t * 0.012 + sx * 5) * 0.04)
      const fillGrad = ctx.createLinearGradient(0, fillY, 0, bot)
      fillGrad.addColorStop(0, 'rgba(61,255,160,0.35)')
      fillGrad.addColorStop(1, 'rgba(61,180,120,0.12)')
      ctx.fillStyle = fillGrad
      ctx.beginPath()
      ctx.moveTo(x - w * 0.85, bot - w * 0.2)
      ctx.lineTo(x - w * 0.85, Math.max(fillY, top + w * 0.3))
      ctx.lineTo(x + w * 0.85, Math.max(fillY, top + w * 0.3))
      ctx.lineTo(x + w * 0.85, bot - w * 0.2)
      ctx.fill()

      // Emissive green strip
      const stripAlpha = 0.5 + Math.sin(t * 0.04 + sx * 4) * 0.2
      const stripGrad = ctx.createLinearGradient(x - w, 0, x + w, 0)
      stripGrad.addColorStop(0, `rgba(61,255,160,0)`)
      stripGrad.addColorStop(0.5, `rgba(61,255,160,${stripAlpha})`)
      stripGrad.addColorStop(1, `rgba(61,255,160,0)`)
      ctx.strokeStyle = stripGrad
      ctx.lineWidth = 1.5
      const midY = top + (bot - top) * 0.5
      ctx.beginPath()
      ctx.moveTo(x - w * 0.85, midY)
      ctx.lineTo(x + w * 0.85, midY)
      ctx.stroke()

      // Top cap
      ctx.fillStyle = '#5a9a80'
      ctx.beginPath()
      ctx.ellipse(x, top, w, w * 0.28, 0, 0, Math.PI * 2)
      ctx.fill()

      // Cap highlight
      ctx.fillStyle = 'rgba(200,255,230,0.2)'
      ctx.beginPath()
      ctx.ellipse(x - w * 0.3, top - w * 0.05, w * 0.4, w * 0.1, -0.3, 0, Math.PI * 2)
      ctx.fill()
    }

    const drawNode = (nx, ny, t, i) => {
      const x = nx * W
      const y = ny * H
      const pulse = 0.7 + Math.sin(t * 0.05 + i * 0.9) * 0.3
      const r = 5

      // Outer glow
      const glow = ctx.createRadialGradient(x, y, 0, x, y, 28)
      glow.addColorStop(0, `rgba(61,255,160,${0.25 * pulse})`)
      glow.addColorStop(1, 'rgba(61,255,160,0)')
      ctx.fillStyle = glow
      ctx.beginPath()
      ctx.arc(x, y, 28, 0, Math.PI * 2)
      ctx.fill()

      // Core
      ctx.fillStyle = `rgba(120,255,200,${pulse})`
      ctx.beginPath()
      ctx.arc(x, y, r, 0, Math.PI * 2)
      ctx.fill()

      // Ring
      ctx.strokeStyle = `rgba(61,255,160,${pulse * 0.6})`
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.arc(x, y, r * 2.5, 0, Math.PI * 2)
      ctx.stroke()
    }

    const drawConnections = (t) => {
      const EDGES = [[0,1],[1,2],[2,3],[3,4],[0,5],[5,2],[2,7],[7,3],[6,4],[7,8],[7,9]]
      EDGES.forEach(([a, b]) => {
        const ax = NODES[a].x * W, ay = NODES[a].y * H
        const bx = NODES[b].x * W, by = NODES[b].y * H
        // Travelling dot
        const tOff = (t * 0.008 + a * 0.3) % 1
        const px = ax + (bx - ax) * tOff
        const py = ay + (by - ay) * tOff

        ctx.strokeStyle = 'rgba(61,200,130,0.18)'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(ax, ay)
        ctx.lineTo(bx, by)
        ctx.stroke()

        ctx.fillStyle = 'rgba(120,255,190,0.7)'
        ctx.beginPath()
        ctx.arc(px, py, 2.5, 0, Math.PI * 2)
        ctx.fill()
      })
    }

    const drawGrid = () => {
      ctx.strokeStyle = 'rgba(61,90,82,0.2)'
      ctx.lineWidth = 0.5
      const gridTop = H * 0.5
      const vanishX = W * 0.5
      const vanishY = H * 0.12

      for (let i = 0; i <= GRID_LINES; i++) {
        const frac = i / GRID_LINES
        const bx = frac * W
        ctx.beginPath()
        ctx.moveTo(vanishX + (bx - vanishX) * ((gridTop - vanishY * 2) / (H - vanishY * 2)), gridTop)
        ctx.lineTo(bx, H)
        ctx.stroke()
      }
      for (let i = 0; i <= 10; i++) {
        const y = gridTop + (H - gridTop) * (i / 10)
        const spread = (y - gridTop) / (H - gridTop)
        ctx.beginPath()
        ctx.moveTo(vanishX - spread * W * 0.5, y)
        ctx.lineTo(vanishX + spread * W * 0.5, y)
        ctx.stroke()
      }
    }

    const drawParticles = (t) => {
      PARTICLES.forEach(p => {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0) p.x = 1
        if (p.x > 1) p.x = 0
        if (p.y < 0.05) p.y = 0.48
        if (p.y > 0.48) p.y = 0.05

        const flicker = 0.6 + Math.sin(t * 0.1 + p.x * 10) * 0.4
        ctx.fillStyle = `rgba(80,200,140,${p.alpha * flicker})`
        ctx.beginPath()
        ctx.arc(p.x * W, p.y * H, p.size, 0, Math.PI * 2)
        ctx.fill()
      })
    }

    const drawROIPanel = (t) => {
      const px = W * 0.06
      const py = H * 0.26
      const pw = W * 0.16
      const ph = H * 0.13
      const float = Math.sin(t * 0.018) * H * 0.008

      ctx.save()
      ctx.globalAlpha = 0.82

      // Panel bg
      ctx.fillStyle = 'rgba(8,20,14,0.9)'
      ctx.strokeStyle = 'rgba(61,180,120,0.7)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.roundRect(px, py + float, pw, ph, 2)
      ctx.fill()
      ctx.stroke()

      ctx.globalAlpha = 1
      ctx.fillStyle = '#3dffaa'
      ctx.font = `bold ${W * 0.008}px monospace`
      ctx.fillText('ROI PROJECTION', px + 12, py + float + ph * 0.28)

      ctx.fillStyle = '#ffffff'
      ctx.font = `bold ${W * 0.022}px monospace`
      ctx.fillText('+18.7%', px + 12, py + float + ph * 0.58)

      ctx.fillStyle = '#3dffaa'
      ctx.font = `bold ${W * 0.007}px monospace`
      ctx.fillText('CO₂ REDUCTION  −8.5%', px + 12, py + float + ph * 0.82)

      ctx.restore()
    }

    const render = () => {
      animId = requestAnimationFrame(render)
      frame++

      // Background
      const bg = ctx.createLinearGradient(0, 0, 0, H)
      bg.addColorStop(0, '#060e09')
      bg.addColorStop(1, '#0a1a10')
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, W, H)

      drawGrid()
      drawParticles(frame)
      drawConnections(frame)

      // Draw silos back-to-front
      ;[...SILOS].sort((a, b) => a.y - b.y).forEach(s => drawSilo(s.x, s.y, s.h, s.fill, frame))

      NODES.forEach((n, i) => drawNode(n.x, n.y, frame, i))
      drawROIPanel(frame)

      // Subtle vignette
      const vig = ctx.createRadialGradient(W/2, H/2, H*0.3, W/2, H/2, H*0.85)
      vig.addColorStop(0, 'rgba(0,0,0,0)')
      vig.addColorStop(1, 'rgba(6,14,9,0.65)')
      ctx.fillStyle = vig
      ctx.fillRect(0, 0, W, H)
    }

    render()

    const onResize = () => {
      W = window.innerWidth
      H = window.innerHeight
      canvas.width = W
      canvas.height = H
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }}
    />
  )
}
