'use client'

import { useEffect, useRef } from 'react'

interface WaveformVisualizerProps {
  analyser: AnalyserNode | null
  isActive: boolean
  height?: number
}

export default function WaveformVisualizer({
  analyser,
  isActive,
  height = 80,
}: WaveformVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const draw = () => {
      const width = canvas.width
      const h = canvas.height

      ctx.clearRect(0, 0, width, h)

      if (!analyser || !isActive) {
        // Draw idle flat line
        const gradient = ctx.createLinearGradient(0, 0, width, 0)
        gradient.addColorStop(0, 'rgba(160, 120, 48, 0.2)')
        gradient.addColorStop(0.5, 'rgba(201, 168, 76, 0.4)')
        gradient.addColorStop(1, 'rgba(160, 120, 48, 0.2)')

        ctx.beginPath()
        ctx.moveTo(0, h / 2)
        ctx.lineTo(width, h / 2)
        ctx.strokeStyle = gradient
        ctx.lineWidth = 1
        ctx.stroke()
        return
      }

      const bufferLength = analyser.frequencyBinCount
      const dataArray = new Uint8Array(bufferLength)
      analyser.getByteFrequencyData(dataArray)

      const barWidth = (width / bufferLength) * 2.5
      let x = 0

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * h * 0.9

        // Create gradient for each bar
        const gradient = ctx.createLinearGradient(x, h - barHeight, x, h)
        gradient.addColorStop(0, '#f0c040')
        gradient.addColorStop(0.5, '#c9a84c')
        gradient.addColorStop(1, '#a07830')

        ctx.fillStyle = gradient

        // Draw mirrored bars (top + bottom)
        const centerY = h / 2
        const halfBar = barHeight / 2

        // Rounded rect for each bar
        const radius = Math.min(barWidth / 2, 3)
        const bx = x
        const by = centerY - halfBar
        const bw = Math.max(barWidth - 1, 1)
        const bh = Math.max(barHeight, 2)

        ctx.beginPath()
        ctx.roundRect(bx, by, bw, bh, radius)
        ctx.fill()

        // Glow effect
        ctx.shadowColor = '#f0c040'
        ctx.shadowBlur = barHeight > 20 ? 8 : 0

        x += barWidth + 1
        if (x > width) break
      }

      ctx.shadowBlur = 0
      rafRef.current = requestAnimationFrame(draw)
    }

    if (isActive && analyser) {
      rafRef.current = requestAnimationFrame(draw)
    } else {
      draw() // draw idle state once
    }

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
    }
  }, [analyser, isActive])

  // Resize canvas to match display size
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const resizeObserver = new ResizeObserver(() => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    })

    resizeObserver.observe(canvas)
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    return () => resizeObserver.disconnect()
  }, [])

  return (
    <div
      className="w-full relative overflow-hidden rounded-xl"
      style={{ height: `${height}px` }}
    >
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-gold/5 to-transparent rounded-xl" />
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ display: 'block' }}
      />
    </div>
  )
}
