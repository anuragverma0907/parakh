import { useEffect, useRef } from 'react'

function jet(t) {
  const c = (x) => Math.max(0, Math.min(1, x))
  return [
    255 * c(1.5 - Math.abs(4 * t - 3)),
    255 * c(1.5 - Math.abs(4 * t - 2)),
    255 * c(1.5 - Math.abs(4 * t - 1)),
  ]
}

/**
 * Draws `src` and overlays an attention map built from `points`
 * ([{x,y,r,v}] in 0..1 image coordinates). Replace `points` with the real
 * Grad-CAM / attention output from your model server later.
 */
export default function HeatmapImage({ src, points = [], opacity = 0.6, show = true, className = '', alt = '' }) {
  const ref = useRef(null)

  useEffect(() => {
    const img = new Image()
    img.onload = () => {
      const cv = ref.current
      if (!cv) return
      const W = img.naturalWidth
      const H = img.naturalHeight
      cv.width = W
      cv.height = H
      const ctx = cv.getContext('2d')
      ctx.drawImage(img, 0, 0)
      if (!show) return

      const heat = document.createElement('canvas')
      heat.width = W
      heat.height = H
      const hc = heat.getContext('2d')
      hc.globalCompositeOperation = 'lighter'
      points.forEach((p) => {
        const R = p.r * Math.max(W, H) * 1.1
        const g = hc.createRadialGradient(p.x * W, p.y * H, 0, p.x * W, p.y * H, R)
        g.addColorStop(0, `rgba(255,255,255,${Math.min(1, p.v)})`)
        g.addColorStop(1, 'rgba(255,255,255,0)')
        hc.fillStyle = g
        hc.fillRect(0, 0, W, H)
      })
      const d = hc.getImageData(0, 0, W, H)
      for (let i = 0; i < d.data.length; i += 4) {
        const a = d.data[i + 3] / 255
        const [r, g, b] = jet(Math.min(1, a))
        d.data[i] = r
        d.data[i + 1] = g
        d.data[i + 2] = b
        d.data[i + 3] = a < 0.06 ? 0 : 255 * Math.min(1, a * 1.4)
      }
      hc.globalCompositeOperation = 'source-over'
      hc.putImageData(d, 0, 0)
      ctx.globalAlpha = opacity
      ctx.drawImage(heat, 0, 0)
      ctx.globalAlpha = 1
    }
    img.src = src
  }, [src, points, opacity, show])

  return <canvas ref={ref} className={'heat-canvas ' + className} role="img" aria-label={alt} />
}

export function HeatLegend() {
  return (
    <div className="heat-legend" aria-hidden="true">
      <span>High influence</span>
      <i />
      <span>Low influence</span>
    </div>
  )
}
