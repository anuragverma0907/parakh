import Icon from './Icon.jsx'

export default function Progress({ stages, current, title }) {
  return (
    <div className="progress card" aria-live="polite">
      <h3>{title}</h3>
      <ol>
        {stages.map((s, i) => (
          <li key={s} className={i < current ? 'done' : i === current ? 'now' : ''}>
            <span className="pg-dot">{i < current ? <Icon name="check" size={13} stroke={3} /> : null}</span>
            {s}
          </li>
        ))}
      </ol>
      <div className="pg-bar"><i style={{ width: Math.min(100, ((current + 0.5) / stages.length) * 100) + '%' }} /></div>
    </div>
  )
}
