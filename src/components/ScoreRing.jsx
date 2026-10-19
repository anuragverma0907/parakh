import { useEffect, useState } from 'react'

// Ring shows authenticity (higher = more likely real)
export default function ScoreRing({ value, tone, size = 132, label }) {
  const [v, setV] = useState(0)
  useEffect(() => {
    const id = requestAnimationFrame(() => setV(value))
    return () => cancelAnimationFrame(id)
  }, [value])
  const r = (size - 16) / 2
  const c = 2 * Math.PI * r
  return (
    <div className={'ring ' + tone} style={{ width: size, height: size }} role="img" aria-label={`${label || 'Score'} ${value}%`}>
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} className="ring-track" />
        <circle
          cx={size / 2} cy={size / 2} r={r} className="ring-val"
          strokeDasharray={c} strokeDashoffset={c * (1 - v / 100)}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="ring-num">{value}<small>%</small></div>
    </div>
  )
}
