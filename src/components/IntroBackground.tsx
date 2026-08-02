import { useEffect, useRef } from 'react'

export function IntroBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const host = canvas?.parentElement
    const context = canvas?.getContext('2d')
    if (!canvas || !host || !context) return

    const image = new Image()
    const pointer = { x: 0, y: 0, targetX: 0, targetY: 0, energy: 0, targetEnergy: 0 }
    let width = 1
    let height = 1
    let frame = 0
    let loaded = false

    const resize = () => {
      const rect = host.getBoundingClientRect()
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5)
      width = Math.max(1, rect.width)
      height = Math.max(1, rect.height)
      canvas.width = Math.round(width * ratio)
      canvas.height = Math.round(height * ratio)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      context.setTransform(ratio, 0, 0, ratio, 0, 0)

      if (!pointer.x) {
        pointer.x = pointer.targetX = width * 0.72
        pointer.y = pointer.targetY = height * 0.48
      }
    }

    const onPointerMove = (event: PointerEvent) => {
      const rect = host.getBoundingClientRect()
      const inside = event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom
      pointer.targetEnergy = inside ? 1 : 0
      if (inside) {
        pointer.targetX = event.clientX - rect.left
        pointer.targetY = event.clientY - rect.top
      }
    }

    const drawWave = (time: number, y: number, opacity: number) => {
      const gradient = context.createLinearGradient(0, 0, width, 0)
      gradient.addColorStop(0, 'rgba(67,133,170,0)')
      gradient.addColorStop(0.48, `rgba(139,214,239,${opacity})`)
      gradient.addColorStop(0.82, `rgba(235,247,248,${opacity * 0.65})`)
      gradient.addColorStop(1, 'rgba(67,133,170,0)')
      context.strokeStyle = gradient
      context.lineWidth = 0.7
      context.beginPath()
      for (let x = 0; x <= width; x += 12) {
        const waveY = y + Math.sin(x * 0.012 + time * 0.0012) * 8 + Math.sin(x * 0.004 - time * 0.0008) * 5
        if (x === 0) context.moveTo(x, waveY)
        else context.lineTo(x, waveY)
      }
      context.stroke()
    }

    const render = (time: number) => {
      frame = requestAnimationFrame(render)
      if (!loaded) return

      pointer.x += (pointer.targetX - pointer.x) * 0.075
      pointer.y += (pointer.targetY - pointer.y) * 0.075
      pointer.energy += (pointer.targetEnergy - pointer.energy) * 0.055

      context.clearRect(0, 0, width, height)
      context.globalCompositeOperation = 'source-over'

      const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight)
      const sourceWidth = width / scale
      const sourceHeight = height / scale
      const focus = width < 760 ? 0.76 : 0.58
      const sourceX = Math.max(0, (image.naturalWidth - sourceWidth) * focus)
      const sourceY = Math.max(0, (image.naturalHeight - sourceHeight) * 0.5)
      const tile = width < 760 ? 52 : 68
      const radius = Math.max(175, Math.min(width, height) * 0.29)

      for (let y = 0; y < height; y += tile) {
        for (let x = 0; x < width; x += tile) {
          const tileWidth = Math.min(tile, width - x)
          const tileHeight = Math.min(tile, height - y)
          const centerX = x + tileWidth / 2
          const centerY = y + tileHeight / 2
          const dx = centerX - pointer.x
          const dy = centerY - pointer.y
          const distance = Math.hypot(dx, dy) || 1
          const proximity = Math.max(0, 1 - distance / radius)
          const lift = proximity * proximity * pointer.energy
          const ambient = Math.sin(time * 0.0011 + centerX * 0.009 + centerY * 0.013) * 0.65
          const offsetX = (dx / distance) * lift * 8 + ambient * 0.45
          const offsetY = (dy / distance) * lift * 8 + ambient * 0.9
          const expansion = lift * 3.4

          context.globalAlpha = 0.94 + lift * 0.06
          context.drawImage(
            image,
            sourceX + x / scale,
            sourceY + y / scale,
            tileWidth / scale,
            tileHeight / scale,
            x + offsetX - expansion,
            y + offsetY - expansion,
            tileWidth + expansion * 2 + 0.7,
            tileHeight + expansion * 2 + 0.7,
          )
        }
      }

      context.globalCompositeOperation = 'screen'
      context.globalAlpha = pointer.energy
      const glow = context.createRadialGradient(pointer.x, pointer.y, 0, pointer.x, pointer.y, radius * 0.9)
      glow.addColorStop(0, 'rgba(126,211,238,0.12)')
      glow.addColorStop(0.34, 'rgba(63,143,186,0.055)')
      glow.addColorStop(1, 'rgba(0,0,0,0)')
      context.fillStyle = glow
      context.fillRect(0, 0, width, height)

      context.globalAlpha = 1
      const travel = (time * 0.035) % (height + 260) - 130
      drawWave(time, travel, 0.16)
      drawWave(time + 460, travel + 34, 0.075)
      context.globalCompositeOperation = 'source-over'
    }

    const observer = new ResizeObserver(resize)
    observer.observe(host)
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    image.onload = () => {
      loaded = true
      resize()
    }
    image.src = '/back-intro.png'
    resize()
    frame = requestAnimationFrame(render)

    return () => {
      observer.disconnect()
      window.removeEventListener('pointermove', onPointerMove)
      cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <div className="intro-background" aria-hidden="true">
      <canvas ref={canvasRef} />
      <div className="intro-background__scan" />
      <div className="intro-background__blocks" />
    </div>
  )
}
