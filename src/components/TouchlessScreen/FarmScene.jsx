import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export default function FarmScene({ activeLayer }) {
  const mountRef = useRef(null)
  const sceneRef = useRef(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(mount.clientWidth, mount.clientHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x000000, 0)
    mount.appendChild(renderer.domElement)

    // Scene + Camera
    const scene = new THREE.Scene()
    scene.fog = new THREE.FogExp2(0x0a0f0d, 0.035)

    const camera = new THREE.PerspectiveCamera(60, mount.clientWidth / mount.clientHeight, 0.1, 200)
    camera.position.set(0, 6, 18)
    camera.lookAt(0, 0, 0)

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x0a2a20, 0.4)
    scene.add(ambientLight)
    const dirLight = new THREE.DirectionalLight(0x3D5A52, 0.8)
    dirLight.position.set(5, 10, 5)
    scene.add(dirLight)

    // Floor
    const floorGeo = new THREE.PlaneGeometry(60, 60, 30, 30)
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x1a2420,
      roughness: 0.9,
      metalness: 0.1,
      wireframe: false
    })
    const floor = new THREE.Mesh(floorGeo, floorMat)
    floor.rotation.x = -Math.PI / 2
    floor.position.y = -1.5
    scene.add(floor)

    // Grid on floor
    const gridHelper = new THREE.GridHelper(40, 40, 0x3D5A52, 0x1e3028)
    gridHelper.position.y = -1.49
    gridHelper.material.opacity = 0.3
    gridHelper.material.transparent = true
    scene.add(gridHelper)

    // Silos
    const siloPositions = [
      [-8, 0, -6], [-4, 0, -8], [4, 0, -8], [8, 0, -6],
      [-6, 0, -12], [6, 0, -12]
    ]
    const siloGroup = new THREE.Group()
    siloPositions.forEach(([x, y, z]) => {
      const h = 5 + Math.random() * 2
      // Outer shell
      const geo = new THREE.CylinderGeometry(0.9, 0.9, h, 16)
      const mat = new THREE.MeshStandardMaterial({
        color: 0x2a3830,
        roughness: 0.6,
        metalness: 0.4
      })
      const silo = new THREE.Mesh(geo, mat)
      silo.position.set(x, y + h / 2 - 1.5, z)
      siloGroup.add(silo)

      // Glowing green strip
      const stripGeo = new THREE.CylinderGeometry(0.92, 0.92, h * 0.6, 16, 1, true)
      const stripMat = new THREE.MeshBasicMaterial({
        color: 0x3D5A52,
        transparent: true,
        opacity: 0.4,
        side: THREE.DoubleSide
      })
      const strip = new THREE.Mesh(stripGeo, stripMat)
      strip.position.set(x, y + h / 2 - 1.5, z)
      siloGroup.add(strip)

      // Emissive fill level cylinder (inner)
      const fillH = h * 0.3
      const fillGeo = new THREE.CylinderGeometry(0.7, 0.7, fillH, 16)
      const fillMat = new THREE.MeshBasicMaterial({ color: 0x3D5A52, transparent: true, opacity: 0.15 })
      const fill = new THREE.Mesh(fillGeo, fillMat)
      fill.position.set(x, y - 1.5 + fillH / 2, z)
      fill.userData.isFill = true
      fill.userData.baseY = y - 1.5
      fill.userData.maxH = h * 0.6
      siloGroup.add(fill)
    })
    scene.add(siloGroup)

    // Sensor nodes
    const nodePositions = [
      [-5, 0.5, -2], [5, 0.5, -2], [-3, 0.5, 2], [3, 0.5, 2],
      [-7, 0.5, 0], [7, 0.5, 0], [0, 0.5, -4], [0, 0.5, 3],
      [-2, 0.5, -6], [2, 0.5, -6]
    ]
    const nodeLights = []
    const nodeGroup = new THREE.Group()

    nodePositions.forEach(([x, y, z]) => {
      const geo = new THREE.SphereGeometry(0.15, 12, 12)
      const mat = new THREE.MeshBasicMaterial({ color: 0x5a8a7a })
      const node = new THREE.Mesh(geo, mat)
      node.position.set(x, y, z)
      nodeGroup.add(node)

      const light = new THREE.PointLight(0x3D5A52, 0.6, 4)
      light.position.set(x, y, z)
      nodeGroup.add(light)
      nodeLights.push(light)
    })
    scene.add(nodeGroup)

    // Connection lines between nodes
    const lineMat = new THREE.LineBasicMaterial({ color: 0x3D5A52, transparent: true, opacity: 0.3 })
    const pairs = [[0, 1], [0, 2], [1, 3], [2, 4], [3, 5], [4, 6], [5, 7], [6, 8], [7, 9], [2, 6], [3, 7]]
    pairs.forEach(([a, b]) => {
      const points = [
        new THREE.Vector3(...nodePositions[a]),
        new THREE.Vector3(...nodePositions[b])
      ]
      const lineGeo = new THREE.BufferGeometry().setFromPoints(points)
      scene.add(new THREE.Line(lineGeo, lineMat))
    })

    // Ceiling data mesh particles
    const particleCount = 200
    const particleGeo = new THREE.BufferGeometry()
    const positions = new Float32Array(particleCount * 3)
    const particleVelocities = []
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 30
      positions[i * 3 + 1] = 8 + Math.random() * 3
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20
      particleVelocities.push({
        x: (Math.random() - 0.5) * 0.04,
        z: (Math.random() - 0.5) * 0.04
      })
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    const particleMat = new THREE.PointsMaterial({
      color: 0x3D5A52,
      size: 0.08,
      transparent: true,
      opacity: 0.6
    })
    const particles = new THREE.Points(particleGeo, particleMat)
    scene.add(particles)

    // Floating glass UI panel
    const panelCanvas = document.createElement('canvas')
    panelCanvas.width = 256
    panelCanvas.height = 128
    const ctx = panelCanvas.getContext('2d')
    ctx.fillStyle = 'rgba(10, 30, 20, 0.85)'
    ctx.fillRect(0, 0, 256, 128)
    ctx.strokeStyle = '#3D5A52'
    ctx.lineWidth = 1
    ctx.strokeRect(1, 1, 254, 126)
    ctx.fillStyle = '#5a8a7a'
    ctx.font = 'bold 11px monospace'
    ctx.fillText('ROI PROJECTION', 16, 28)
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 28px monospace'
    ctx.fillText('+18.7%', 16, 62)
    ctx.fillStyle = '#5a8a7a'
    ctx.font = 'bold 11px monospace'
    ctx.fillText('CO₂ REDUCTION', 16, 86)
    ctx.fillStyle = '#3D5A52'
    ctx.font = 'bold 22px monospace'
    ctx.fillText('−8.5%', 16, 112)

    const panelTex = new THREE.CanvasTexture(panelCanvas)
    const panelGeo = new THREE.PlaneGeometry(3.5, 1.75)
    const panelMat = new THREE.MeshBasicMaterial({ map: panelTex, transparent: true, opacity: 0.9, side: THREE.DoubleSide })
    const panel = new THREE.Mesh(panelGeo, panelMat)
    panel.position.set(-5, 3.5, -3)
    panel.rotation.y = 0.4
    scene.add(panel)

    // Mouse parallax
    const mouse = { x: 0, y: 0 }
    const onMouseMove = (e) => {
      mouse.x = (e.clientX / window.innerWidth - 0.5) * 2
      mouse.y = (e.clientY / window.innerHeight - 0.5) * 2
    }
    window.addEventListener('mousemove', onMouseMove)

    // Animation loop
    let frame = 0
    let animId
    const animate = () => {
      animId = requestAnimationFrame(animate)
      frame++

      // Rotate scene slowly
      scene.rotation.y += 0.0005
      // Mouse parallax on camera
      camera.position.x += (mouse.x * 1.5 - camera.position.x) * 0.02
      camera.position.y += (-mouse.y * 0.5 + 6 - camera.position.y) * 0.02
      camera.lookAt(scene.position)

      // Pulse sensor lights
      nodeLights.forEach((light, i) => {
        light.intensity = 0.4 + Math.sin(frame * 0.05 + i * 0.8) * 0.3
      })

      // Animate fill levels
      siloGroup.children.forEach(child => {
        if (child.userData.isFill) {
          const t = Math.sin(frame * 0.008 + child.position.x * 0.3) * 0.5 + 0.5
          const newH = 0.5 + t * child.userData.maxH
          child.scale.y = newH / (child.userData.maxH * 0.5)
          child.position.y = child.userData.baseY + newH / 2
        }
      })

      // Animate particles
      const posArr = particles.geometry.attributes.position.array
      for (let i = 0; i < particleCount; i++) {
        posArr[i * 3] += particleVelocities[i].x
        posArr[i * 3 + 2] += particleVelocities[i].z
        if (posArr[i * 3] > 15 || posArr[i * 3] < -15) particleVelocities[i].x *= -1
        if (posArr[i * 3 + 2] > 10 || posArr[i * 3 + 2] < -10) particleVelocities[i].z *= -1
      }
      particles.geometry.attributes.position.needsUpdate = true

      // Pulse panel
      panel.rotation.y = 0.4 + Math.sin(frame * 0.01) * 0.05
      panel.position.y = 3.5 + Math.sin(frame * 0.015) * 0.1

      renderer.render(scene, camera)
    }
    animate()
    sceneRef.current = { renderer, scene, camera, animId }

    // Resize handler
    const onResize = () => {
      if (!mount) return
      camera.aspect = mount.clientWidth / mount.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(mount.clientWidth, mount.clientHeight)
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('resize', onResize)
      renderer.dispose()
      // Dispose geometries/materials
      scene.traverse(obj => {
        if (obj.geometry) obj.geometry.dispose()
        if (obj.material) {
          if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose())
          else obj.material.dispose()
        }
      })
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement)
    }
  }, [])

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 w-full h-full"
      style={{ zIndex: 1 }}
    />
  )
}
