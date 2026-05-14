import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export default function FarmScene() {
  const mountRef = useRef(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    // Use window dimensions — clientWidth/Height can be 0 before paint
    const W = window.innerWidth
    const H = window.innerHeight

    // Renderer — opaque dark background so the scene is always visible
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false })
    renderer.setSize(W, H)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x0a0f0d, 1)
    mount.appendChild(renderer.domElement)

    // Scene
    const scene = new THREE.Scene()
    scene.fog = new THREE.FogExp2(0x0a0f0d, 0.03)

    // Camera
    const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 200)
    camera.position.set(0, 6, 18)
    camera.lookAt(0, 0, 0)

    // Lighting — brighter so objects are clearly visible
    scene.add(new THREE.AmbientLight(0x3a5a4a, 1.2))
    const dirLight = new THREE.DirectionalLight(0x7ab89a, 1.6)
    dirLight.position.set(5, 10, 8)
    scene.add(dirLight)
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.4)
    fillLight.position.set(-5, 5, -5)
    scene.add(fillLight)

    // Floor
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(60, 60),
      new THREE.MeshStandardMaterial({ color: 0x1a2420, roughness: 0.9 })
    )
    floor.rotation.x = -Math.PI / 2
    floor.position.y = -1.5
    scene.add(floor)

    // Grid
    const grid = new THREE.GridHelper(40, 40, 0x3D5A52, 0x1e3028)
    grid.position.y = -1.49
    grid.material.opacity = 0.4
    grid.material.transparent = true
    scene.add(grid)

    // Silos
    const siloPositions = [
      [-8, 0, -6], [-4, 0, -8], [4, 0, -8], [8, 0, -6],
      [-6, 0, -12], [6, 0, -12]
    ]
    const siloGroup = new THREE.Group()
    siloPositions.forEach(([x, , z]) => {
      const h = 5 + Math.random() * 2

      // Shell — lighter colour so it's visible
      const silo = new THREE.Mesh(
        new THREE.CylinderGeometry(0.9, 0.9, h, 16),
        new THREE.MeshStandardMaterial({ color: 0x3a5248, roughness: 0.5, metalness: 0.5 })
      )
      silo.position.set(x, h / 2 - 1.5, z)
      siloGroup.add(silo)

      // Emissive green strip
      const strip = new THREE.Mesh(
        new THREE.CylinderGeometry(0.93, 0.93, h * 0.55, 16, 1, true),
        new THREE.MeshBasicMaterial({ color: 0x3D5A52, transparent: true, opacity: 0.6, side: THREE.DoubleSide })
      )
      strip.position.set(x, h / 2 - 1.5, z)
      siloGroup.add(strip)

      // Animated fill level
      const fillH = h * 0.3
      const fill = new THREE.Mesh(
        new THREE.CylinderGeometry(0.7, 0.7, fillH, 16),
        new THREE.MeshBasicMaterial({ color: 0x5a8a7a, transparent: true, opacity: 0.35 })
      )
      fill.position.set(x, -1.5 + fillH / 2, z)
      fill.userData.isFill = true
      fill.userData.baseY = -1.5
      fill.userData.maxH = h * 0.55
      siloGroup.add(fill)
    })
    scene.add(siloGroup)

    // Sensor nodes + pulsing lights
    const nodePositions = [
      [-5, 0.5, -2], [5, 0.5, -2], [-3, 0.5, 2], [3, 0.5, 2],
      [-7, 0.5, 0], [7, 0.5, 0], [0, 0.5, -4], [0, 0.5, 3]
    ]
    const nodeLights = []
    const nodeGroup = new THREE.Group()
    nodePositions.forEach(([x, y, z]) => {
      const node = new THREE.Mesh(
        new THREE.SphereGeometry(0.2, 12, 12),
        new THREE.MeshBasicMaterial({ color: 0x5a8a7a })
      )
      node.position.set(x, y, z)
      nodeGroup.add(node)

      const light = new THREE.PointLight(0x5a8a7a, 1.2, 6)
      light.position.set(x, y, z)
      nodeGroup.add(light)
      nodeLights.push(light)
    })
    scene.add(nodeGroup)

    // Connection lines
    const lineMat = new THREE.LineBasicMaterial({ color: 0x3D5A52, transparent: true, opacity: 0.4 })
    [[0,1],[0,2],[1,3],[2,4],[3,5],[4,6],[5,7],[2,6],[3,7]].forEach(([a, b]) => {
      const geo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(...nodePositions[a]),
        new THREE.Vector3(...nodePositions[b])
      ])
      scene.add(new THREE.Line(geo, lineMat))
    })

    // Ceiling particles
    const PCount = 200
    const pPos = new Float32Array(PCount * 3)
    const pVel = []
    for (let i = 0; i < PCount; i++) {
      pPos[i * 3] = (Math.random() - 0.5) * 30
      pPos[i * 3 + 1] = 8 + Math.random() * 3
      pPos[i * 3 + 2] = (Math.random() - 0.5) * 20
      pVel.push({ x: (Math.random() - 0.5) * 0.04, z: (Math.random() - 0.5) * 0.04 })
    }
    const pGeo = new THREE.BufferGeometry()
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3))
    const particles = new THREE.Points(pGeo, new THREE.PointsMaterial({ color: 0x5a8a7a, size: 0.1, transparent: true, opacity: 0.7 }))
    scene.add(particles)

    // Floating ROI panel
    const pc = document.createElement('canvas')
    pc.width = 256; pc.height = 128
    const ctx = pc.getContext('2d')
    ctx.fillStyle = 'rgba(10,30,20,0.92)'
    ctx.fillRect(0, 0, 256, 128)
    ctx.strokeStyle = '#5a8a7a'
    ctx.lineWidth = 1.5
    ctx.strokeRect(2, 2, 252, 124)
    ctx.fillStyle = '#5a8a7a'
    ctx.font = 'bold 10px monospace'
    ctx.fillText('ROI PROJECTION', 14, 26)
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 30px monospace'
    ctx.fillText('+18.7%', 14, 62)
    ctx.fillStyle = '#5a8a7a'
    ctx.font = 'bold 10px monospace'
    ctx.fillText('CO₂ REDUCTION', 14, 86)
    ctx.fillStyle = '#7abcaa'
    ctx.font = 'bold 22px monospace'
    ctx.fillText('−8.5%', 14, 114)
    const panel = new THREE.Mesh(
      new THREE.PlaneGeometry(3.5, 1.75),
      new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(pc), transparent: true, side: THREE.DoubleSide })
    )
    panel.position.set(-5, 3.5, -3)
    panel.rotation.y = 0.4
    scene.add(panel)

    // Mouse parallax
    const mouse = { x: 0, y: 0 }
    const onMouse = (e) => {
      mouse.x = (e.clientX / window.innerWidth - 0.5) * 2
      mouse.y = (e.clientY / window.innerHeight - 0.5) * 2
    }
    window.addEventListener('mousemove', onMouse)

    // Animation
    let frame = 0
    let animId
    const animate = () => {
      animId = requestAnimationFrame(animate)
      frame++
      scene.rotation.y += 0.0005
      camera.position.x += (mouse.x * 1.5 - camera.position.x) * 0.02
      camera.position.y += (-mouse.y * 0.5 + 6 - camera.position.y) * 0.02
      camera.lookAt(scene.position)

      nodeLights.forEach((l, i) => { l.intensity = 0.8 + Math.sin(frame * 0.05 + i * 0.8) * 0.5 })

      siloGroup.children.forEach(child => {
        if (!child.userData.isFill) return
        const t = Math.sin(frame * 0.008 + child.position.x * 0.3) * 0.5 + 0.5
        const newH = 0.5 + t * child.userData.maxH
        child.scale.y = newH / (child.userData.maxH * 0.5)
        child.position.y = child.userData.baseY + newH / 2
      })

      const arr = pGeo.attributes.position.array
      for (let i = 0; i < PCount; i++) {
        arr[i * 3] += pVel[i].x
        arr[i * 3 + 2] += pVel[i].z
        if (arr[i * 3] > 15 || arr[i * 3] < -15) pVel[i].x *= -1
        if (arr[i * 3 + 2] > 10 || arr[i * 3 + 2] < -10) pVel[i].z *= -1
      }
      pGeo.attributes.position.needsUpdate = true

      panel.rotation.y = 0.4 + Math.sin(frame * 0.01) * 0.05
      panel.position.y = 3.5 + Math.sin(frame * 0.015) * 0.1

      renderer.render(scene, camera)
    }
    animate()

    // Resize
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
      scene.traverse(obj => {
        if (obj.geometry) obj.geometry.dispose()
        if (obj.material) {
          if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose())
          else obj.material.dispose()
        }
      })
      renderer.dispose()
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement)
    }
  }, [])

  return (
    <div
      ref={mountRef}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 1, background: '#0a0f0d' }}
    />
  )
}
