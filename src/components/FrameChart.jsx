import { fmtTime } from '../services/engine.js'

export default function FrameChart({ series, duration }) {
  const W = 640, H = 220, L = 38, R = 12, T = 14, B = 28
  const x = (t) => L + (t / duration) * (W - L - R)
  const y = (s) => T + (1 - s) * (H - T - B)
  const path = series.map((p, i) => (i ? 'L' : 'M') + x(p.t).toFixed(1) + ' ' + y(p.score).toFixed(1)).join(' ')
  const area = path + ` L${x(duration).toFixed(1)} ${y(0)} L${x(0)} ${y(0)} Z`
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="chart" role="img" aria-label="Manipulation score per frame over time">
      <rect x={L} y={y(1)} width={W - L - R} height={y(0.6) - y(1)} className="band-high" />
      {[0, 0.5, 1].map((g) => (
        <g key={g}>
          <line x1={L} x2={W - R} y1={y(g)} y2={y(g)} className="grid" />
          <text x={L - 8} y={y(g) + 4} textAnchor="end" className="axis">{g.toFixed(1)}</text>
        </g>
      ))}
      <text x={W - R - 4} y={y(1) + 14} textAnchor="end" className="axis hi">High risk</text>
      <path d={area} className="area" />
      <path d={path} className="line" />
      {[0, 0.25, 0.5, 0.75, 1].map((f) => (
        <text key={f} x={x(duration * f)} y={H - 8} textAnchor={f === 0 ? 'start' : f === 1 ? 'end' : 'middle'} className="axis">
          {fmtTime(duration * f)}
        </text>
      ))}
    </svg>
  )
}
