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
  const handsRef = useRef(null)
  const activeRef = useRef(false)

  const drawHand = useCallback((landmarks, canvas) => {
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    if (!landmarks) return

    const w = canvas.width
    const h = canvas.height

    // Draw connections
    ctx.strokeStyle = 'rgba(90, 138, 122, 0.7)'
    ctx.lineWidth = 1.5
    HAND_CONNECTIONS.forEach(([a, b]) => {
      const la = landmarks[a]
      const lb = landmarks[b]
      ctx.beginPath()
      ctx.moveTo((1 - la.x) * w, la.y * h)
      ctx.lineTo((1 - lb.x) * w, lb.y * h)
      ctx.stroke()
    })

    // Draw joints
    landmarks.forEach((lm, i) => {
      const x = (1 - lm.x) * w
      const y = lm.y * h
      const isTip = FINGERTIPS.includes(i)

      ctx.beginPath()
      ctx.arc(x, y, isTip ? 5 : 3, 0, Math.PI * 2)
      ctx.fillStyle = isTip ? 'rgba(61, 90, 82, 0.9)' : 'rgba(90, 138, 122, 0.6)'
      ctx.fill()

      // Fingertip glow
      if (isTip) {
        const grad = ctx.createRadialGradient(x, y, 0, x, y, 18)
        grad.addColorStop(0, 'rgba(61, 90, 82, 0.5)')
        grad.addColorStop(1, 'rgba(61, 90, 82, 0)')
        ctx.beginPath()
        ctx.arc(x, y, 18, 0, Math.PI * 2)
        ctx.fillStyle = grad
        ctx.fill()
      }
    })
  }, [])

  useEffect(() => {
    let hands = null
    let camera = null
    let rafId = null

    const initMediaPipe = async () => {
      try {
        // Dynamic import to avoid SSR issues
        const { Hands } = await import('@mediapipe/hands')

        hands = new Hands({
          locateFile: (file) =>
            `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1675469240/${file}`
        })

        hands.setOptions({
          maxNumHands: 1,
          modelComplexity: 1,
          minDetectionConfidence: 0.7,
          minTrackingConfidence: 0.7
        })

        hands.onResults((results) => {
          const canvas = canvasRef.current
          if (!canvas) return

          if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            const landmarks = results.multiHandLandmarks[0]
            drawHand(landmarks, canvas)

            // Index tip position (landmark 8), mirrored x
            const indexTip = landmarks[8]
            if (onIndexPosition) {
              onIndexPosition({
                x: (1 - indexTip.x) * window.innerWidth,
                y: indexTip.y * window.innerHeight
              })
            }

            // Pinch detection: thumb tip (4) to index tip (8)
            const thumbTip = landmarks[4]
            const dist = Math.hypot(thumbTip.x - indexTip.x, thumbTip.y - indexTip.y)
            if (dist < 0.07 && onPinch) onPinch()
          } else {
            const ctx = canvas.getContext('2d')
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            if (onIndexPosition) onIndexPosition(null)
          }
        })

        handsRef.current = hands
        activeRef.current = true

        // Process video frames
        const video = videoRef?.current
        if (video) {
          const processFrame = async () => {
            if (!activeRef.current) return
            if (video.readyState >= 2) {
              await hands.send({ image: video })
            }
            rafId = requestAnimationFrame(processFrame)
          }
          video.addEventListener('loadeddata', () => {
            processFrame()
          })
          // Start if already loaded
          if (video.readyState >= 2) processFrame()
        }
      } catch (err) {
        console.warn('MediaPipe unavailable, using mouse fallback:', err)
      }
    }

    initMediaPipe()

    return () => {
      activeRef.current = false
      if (rafId) cancelAnimationFrame(rafId)
      if (hands) hands.close()
    }
  }, [drawHand, onIndexPosition, onPinch, videoRef])

  // Resize canvas to match viewport
  useEffect(() => {
    const resize = () => {
      const canvas = canvasRef.current
      if (!canvas) return
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
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
