import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export default function FarmScene() {
  const mountRef = useRef(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const W = window.innerWidth
    const H = window.innerHeight

    // ── Renderer ────────────────────────────────────────────────────────
    let renderer
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false })
    } catch (e) {
      console.warn('WebGL not available:', e)
      return
    }
    renderer.setSize(W, H)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x0a0f0d, 1)
    mount.appendChild(renderer.domElement)

    // ── Scene ────────────────────────────────────────────────────────────
    const scene = new THREE.Scene()
    scene.fog = new THREE.FogExp2(0x0a0f0d, 0.025)

    const camera = new THREE.PerspectiveCamera(55, W / H, 0.1, 200)
    camera.position.set(0, 7, 20)
    camera.lookAt(0, 0, 0)

    // ── Lights — bright enough to see ───────────────────────────────────
    scene.add(new THREE.AmbientLight(0xffffff, 0.6))

    const key = new THREE.DirectionalLight(0xaaffdd, 2.0)
    key.position.set(8, 14, 10)
    scene.add(key)

    const fill = new THREE.DirectionalLight(0x44ffaa, 0.8)
    fill.position.set(-8, 6, -4)
    scene.add(fill)

    // ── Floor ────────────────────────────────────────────────────────────
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(80, 80),
      new THREE.MeshStandardMaterial({ color: 0x162018, roughness: 1 })
    )
    floor.rotation.x = -Math.PI / 2
    floor.position.y = -1.5
    scene.add(floor)

    const grid = new THREE.GridHelper(60, 60, 0x3D5A52, 0x243028)
    grid.position.y = -1.49
    grid.material.opacity = 0.5
    grid.material.transparent = true
    scene.add(grid)

    // ── Silos — visible teal/grey ────────────────────────────────────────
    const siloData = [
      [-8, -6], [-4, -8], [4, -8], [8, -6], [-6, -12], [6, -12]
    ]
    const siloGroup = new THREE.Group()
    siloData.forEach(([x, z]) => {
      const h = 5 + Math.random() * 2.5

      // Body — visible mid-grey teal
      const body = new THREE.Mesh(
        new THREE.CylinderGeometry(0.95, 0.95, h, 20),
        new THREE.MeshStandardMaterial({ color: 0x4a6860, roughness: 0.4, metalness: 0.6 })
      )
      body.position.set(x, h / 2 - 1.5, z)
      siloGroup.add(body)

      // Bright emissive green strip
      const strip = new THREE.Mesh(
        new THREE.CylinderGeometry(0.97, 0.97, h * 0.5, 20, 1, true),
        new THREE.MeshBasicMaterial({ color: 0x3dffaa, transparent: true, opacity: 0.25, side: THREE.DoubleSide })
      )
      strip.position.set(x, h / 2 - 1.5, z)
      siloGroup.add(strip)

      // Animated fill — bright green
      const fillH = h * 0.35
      const fill = new THREE.Mesh(
        new THREE.CylinderGeometry(0.72, 0.72, fillH, 16),
        new THREE.MeshBasicMaterial({ color: 0x5affcc, transparent: true, opacity: 0.3 })
      )
      fill.position.set(x, -1.5 + fillH / 2, z)
      fill.userData = { isFill: true, baseY: -1.5, maxH: h * 0.5 }
      siloGroup.add(fill)

      // Top cap highlight
      const cap = new THREE.Mesh(
        new THREE.CylinderGeometry(0.95, 0.95, 0.12, 20),
        new THREE.MeshStandardMaterial({ color: 0x7addc0, roughness: 0.3, metalness: 0.8 })
      )
      cap.position.set(x, h - 1.5 + 0.06, z)
      siloGroup.add(cap)
    })
    scene.add(siloGroup)

    // ── Sensor nodes — bright teal spheres ───────────────────────────────
    const nodePos = [
      [-5, 0.5, -2], [5, 0.5, -2], [-3, 0.5, 2.5], [3, 0.5, 2.5],
      [-7, 0.5, 0], [7, 0.5, 0], [0, 0.5, -4], [0, 0.5, 3.5]
    ]
    const nodeLights = []
    const nodeGroup = new THREE.Group()
    nodePos.forEach(([x, y, z]) => {
      // Outer glow sphere
      const glow = new THREE.Mesh(
        new THREE.SphereGeometry(0.35, 12, 12),
        new THREE.MeshBasicMaterial({ color: 0x3dffaa, transparent: true, opacity: 0.15 })
      )
      glow.position.set(x, y, z)
      nodeGroup.add(glow)

      // Core sphere
      const core = new THREE.Mesh(
        new THREE.SphereGeometry(0.18, 12, 12),
        new THREE.MeshBasicMaterial({ color: 0x7affcc })
      )
      core.position.set(x, y, z)
      nodeGroup.add(core)

      // Point light
      const light = new THREE.PointLight(0x3dffaa, 1.5, 7)
      light.position.set(x, y, z)
      nodeGroup.add(light)
      nodeLights.push(light)
    })
    scene.add(nodeGroup)

    // ── Connection lines ─────────────────────────────────────────────────
    const lineMat = new THREE.LineBasicMaterial({ color: 0x3dffaa, transparent: true, opacity: 0.3 })
    [[0,1],[0,2],[1,3],[2,4],[3,5],[4,6],[5,7],[0,6],[1,7]].forEach(([a, b]) => {
      const geo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(...nodePos[a]),
        new THREE.Vector3(...nodePos[b])
      ])
      scene.add(new THREE.Line(geo, lineMat))
    })

    // ── Ceiling particles ────────────────────────────────────────────────
    const PC = 240
    const pArr = new Float32Array(PC * 3)
    const pVel = []
    for (let i = 0; i < PC; i++) {
      pArr[i*3]   = (Math.random() - 0.5) * 32
      pArr[i*3+1] = 8 + Math.random() * 3
      pArr[i*3+2] = (Math.random() - 0.5) * 22
      pVel.push({ x: (Math.random()-0.5)*0.04, z: (Math.random()-0.5)*0.04 })
    }
    const pGeo = new THREE.BufferGeometry()
    pGeo.setAttribute('position', new THREE.BufferAttribute(pArr, 3))
    const particles = new THREE.Points(pGeo, new THREE.PointsMaterial({ color: 0x5affcc, size: 0.12, transparent: true, opacity: 0.75 }))
    scene.add(particles)

    // ── Floating ROI panel ───────────────────────────────────────────────
    const pc = document.createElement('canvas')
    pc.width = 256; pc.height = 128
    const ctx = pc.getContext('2d')
    ctx.fillStyle = '#0a1a10'
    ctx.fillRect(0, 0, 256, 128)
    ctx.strokeStyle = '#3dffaa'
    ctx.lineWidth = 1.5
    ctx.strokeRect(2, 2, 252, 124)
    ctx.fillStyle = '#3dffaa'
    ctx.font = 'bold 10px monospace'
    ctx.fillText('ROI PROJECTION', 14, 26)
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 32px monospace'
    ctx.fillText('+18.7%', 14, 66)
    ctx.fillStyle = '#3dffaa'
    ctx.font = 'bold 10px monospace'
    ctx.fillText('CO₂ REDUCTION', 14, 92)
    ctx.fillStyle = '#7affcc'
    ctx.font = 'bold 22px monospace'
    ctx.fillText('−8.5%', 14, 118)

    const panel = new THREE.Mesh(
      new THREE.PlaneGeometry(3.8, 1.9),
      new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(pc), transparent: true, side: THREE.DoubleSide })
    )
    panel.position.set(-5.5, 4, -3)
    panel.rotation.y = 0.35
    scene.add(panel)

    // ── Mouse parallax ───────────────────────────────────────────────────
    const mouse = { x: 0, y: 0 }
    const onMouse = e => {
      mouse.x = (e.clientX / window.innerWidth  - 0.5) * 2
      mouse.y = (e.clientY / window.innerHeight - 0.5) * 2
    }
    window.addEventListener('mousemove', onMouse)

    // ── Animation loop ───────────────────────────────────────────────────
    let frame = 0, animId
    const animate = () => {
      animId = requestAnimationFrame(animate)
      frame++

      scene.rotation.y += 0.0004
      camera.position.x += (mouse.x * 2 - camera.position.x) * 0.018
      camera.position.y += (-mouse.y * 0.8 + 7 - camera.position.y) * 0.018
      camera.lookAt(scene.position)

      // Pulse lights
      nodeLights.forEach((l, i) => { l.intensity = 1.0 + Math.sin(frame * 0.05 + i * 0.9) * 0.6 })

      // Animate fills
      siloGroup.children.forEach(c => {
        if (!c.userData.isFill) return
        const t = Math.sin(frame * 0.009 + c.position.x * 0.25) * 0.5 + 0.5
        const nh = 0.4 + t * c.userData.maxH
        c.scale.y = nh / (c.userData.maxH * 0.5)
        c.position.y = c.userData.baseY + nh / 2
      })

      // Move particles
      for (let i = 0; i < PC; i++) {
        pArr[i*3]   += pVel[i].x
        pArr[i*3+2] += pVel[i].z
        if (pArr[i*3]   >  16 || pArr[i*3]   < -16) pVel[i].x *= -1
        if (pArr[i*3+2] >  11 || pArr[i*3+2] < -11) pVel[i].z *= -1
      }
      pGeo.attributes.position.needsUpdate = true

      panel.rotation.y = 0.35 + Math.sin(frame * 0.012) * 0.06
      panel.position.y = 4 + Math.sin(frame * 0.016) * 0.12

      renderer.render(scene, camera)
    }
    animate()

    // ── Resize ───────────────────────────────────────────────────────────
    const onResize = () => {
      const w = window.innerWidth, h = window.innerHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('mousemove', onMouse)
      window.removeEventListener('resize', onResize)
      scene.traverse(o => {
        if (o.geometry) o.geometry.dispose()
        if (o.material) {
          if (Array.isArray(o.material)) o.material.forEach(m => m.dispose())
          else o.material.dispose()
        }
      })
      renderer.dispose()
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement)
    }
  }, [])

  return (
    <div
      ref={mountRef}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', background: '#0a0f0d' }}
    />
  )
}
