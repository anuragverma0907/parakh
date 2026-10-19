import { fmtTime } from '../services/engine.js'

export default function Timeline({ duration, segments, current = 0, onSeek }) {
  const pct = (t) => (t / duration) * 100
  const ticks = 5
  return (
    <div className="tl">
      <div className="tl-bar" role="list">
        {segments.map((s, i) => (
          <button
            key={i}
            role="listitem"
            type="button"
            className={'tl-seg ' + s.level}
            style={{ flex: s.end - s.start }}
            onClick={() => onSeek && onSeek(s.start)}
            title={`${fmtTime(s.start)} to ${fmtTime(s.end)} · ${s.level} risk (${Math.round(s.score * 100)}%)`}
            aria-label={`${fmtTime(s.start)} to ${fmtTime(s.end)}, ${s.level} risk`}
          />
        ))}
        <span className="tl-head" style={{ left: pct(Math.min(current, duration)) + '%' }} />
      </div>
      <div className="tl-axis">
        {Array.from({ length: ticks + 1 }, (_, i) => (
          <span key={i}>{fmtTime((duration * i) / ticks)}</span>
        ))}
      </div>
      <div className="legend">
        <span><i className="dot low" />Low risk</span>
        <span><i className="dot medium" />Medium risk</span>
        <span><i className="dot high" />High risk</span>
      </div>
    </div>
  )
}
