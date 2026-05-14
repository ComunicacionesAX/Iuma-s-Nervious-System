import { useEffect, useRef, useCallback } from 'react'

const HAND_CONNECTIONS = [
  [0,1],[1,2],[2,3],[3,4],
  [0,5],[5,6],[6,7],[7,8],
  [0,9],[9,10],[10,11],[11,12],
  [0,13],[13,14],[14,15],[15,16],
  [0,17],[17,18],[18,19],[19,20],
  [5,9],[9,13],[13,17]
]
const FINGERTIPS = [4, 8, 12, 16, 20]

export default function HandTracker({ onIndexPosition, onPinch, videoRef }) {
  const canvasRef = useRef(null)
  const activeRef = useRef(false)

  const drawHand = useCallback((landmarks, canvas) => {
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    if (!landmarks) return
    const w = canvas.width, h = canvas.height

    ctx.strokeStyle = 'rgba(90,138,122,0.7)'
    ctx.lineWidth = 1.5
    HAND_CONNECTIONS.forEach(([a, b]) => {
      ctx.beginPath()
      ctx.moveTo((1 - landmarks[a].x) * w, landmarks[a].y * h)
      ctx.lineTo((1 - landmarks[b].x) * w, landmarks[b].y * h)
      ctx.stroke()
    })

    landmarks.forEach((lm, i) => {
      const x = (1 - lm.x) * w, y = lm.y * h
      const isTip = FINGERTIPS.includes(i)
      ctx.beginPath()
      ctx.arc(x, y, isTip ? 6 : 3, 0, Math.PI * 2)
      ctx.fillStyle = isTip ? 'rgba(61,90,82,0.95)' : 'rgba(90,138,122,0.65)'
      ctx.fill()
      if (isTip) {
        const g = ctx.createRadialGradient(x, y, 0, x, y, 22)
        g.addColorStop(0, 'rgba(90,138,122,0.45)')
        g.addColorStop(1, 'rgba(90,138,122,0)')
        ctx.beginPath()
        ctx.arc(x, y, 22, 0, Math.PI * 2)
        ctx.fillStyle = g
        ctx.fill()
      }
    })
  }, [])

  useEffect(() => {
    let hands = null
    let rafId = null
    activeRef.current = true

    const initMediaPipe = async () => {
      try {
        const Hands = (await import('@mediapipe/hands')).Hands
        hands = new Hands({
          locateFile: (file) =>
            `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1675469240/${file}`
        })
        hands.setOptions({
          maxNumHands: 1,
          modelComplexity: 0,           // lighter model — loads faster
          minDetectionConfidence: 0.65,
          minTrackingConfidence: 0.65
        })
        hands.onResults((results) => {
          const canvas = canvasRef.current
          if (!canvas) return
          if (results.multiHandLandmarks?.length > 0) {
            const lm = results.multiHandLandmarks[0]
            drawHand(lm, canvas)
            onIndexPosition?.({
              x: (1 - lm[8].x) * window.innerWidth,
              y: lm[8].y * window.innerHeight
            })
            const dist = Math.hypot(lm[4].x - lm[8].x, lm[4].y - lm[8].y)
            if (dist < 0.07) onPinch?.()
          } else {
            canvasRef.current?.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
            onIndexPosition?.(null)
          }
        })

        const video = videoRef?.current
        if (!video) return

        const processFrame = async () => {
          if (!activeRef.current) return
          if (video.readyState >= 2) await hands.send({ image: video })
          rafId = requestAnimationFrame(processFrame)
        }

        if (video.readyState >= 2) processFrame()
        else video.addEventListener('loadeddata', processFrame, { once: true })
      } catch (err) {
        console.warn('MediaPipe not available, mouse fallback active:', err)
      }
    }

    initMediaPipe()

    return () => {
      activeRef.current = false
      if (rafId) cancelAnimationFrame(rafId)
      hands?.close?.()
    }
  }, [drawHand, onIndexPosition, onPinch, videoRef])

  // Keep canvas full-screen
  useEffect(() => {
    const resize = () => {
      const c = canvasRef.current
      if (!c) return
      c.width = window.innerWidth
      c.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 10 }}
    />
  )
}
