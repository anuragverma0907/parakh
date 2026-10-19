import { METRICS } from '../services/engine.js'

function Roc({ auc }) {
  const k = (1 - auc) / auc
  const W = 360, H = 240, L = 40, R = 12, T = 12, B = 34
  const x = (v) => L + v * (W - L - R)
  const y = (v) => T + (1 - v) * (H - T - B)
  const pts = Array.from({ length: 41 }, (_, i) => {
    const f = i / 40
    return [f, Math.pow(f, k)]
  })
  const d = pts.map(([f, t], i) => (i ? 'L' : 'M') + x(f).toFixed(1) + ' ' + y(t).toFixed(1)).join(' ')
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="chart" role="img" aria-label={`ROC curve, AUC ${auc}`}>
      {[0, 0.5, 1].map((g) => (
        <g key={g}>
          <line x1={L} x2={W - R} y1={y(g)} y2={y(g)} className="grid" />
          <text x={L - 8} y={y(g) + 4} textAnchor="end" className="axis">{g}</text>
          <text x={x(g)} y={H - 16} textAnchor="middle" className="axis">{g}</text>
        </g>
      ))}
      <line x1={x(0)} y1={y(0)} x2={x(1)} y2={y(1)} className="diag" />
      <path d={d + ` L${x(1)} ${y(0)} L${x(0)} ${y(0)} Z`} className="area" />
      <path d={d} className="line" />
      <text x={x(0.55)} y={y(0.35)} className="axis">AUC {auc}</text>
      <text x={(L + W - R) / 2} y={H - 1} textAnchor="middle" className="axis">False positive rate</text>
    </svg>
  )
}

export default function ModelPerformance({ compact = false }) {
  const m = METRICS
  const tiles = [
    ['Accuracy', m.accuracy + '%'],
    ['Precision', m.precision + '%'],
    ['Recall', m.recall + '%'],
    ['F1 score', m.f1 + '%'],
  ]
  return (
    <div className="perf">
      <p className="note">Reference values for layout. Replace them in <code>services/engine.js</code> with results from your trained model on {m.dataset}.</p>
      <div className={'perf-grid' + (compact ? ' compact' : '')}>
        <div className="card">
          <h3>Model evaluation</h3>
          <table className="kv">
            <tbody>
              {tiles.map(([k, v]) => (
                <tr key={k}><th>{k}</th><td className="mono">{v}</td></tr>
              ))}
              <tr><th>ROC AUC</th><td className="mono">{m.auc}</td></tr>
            </tbody>
          </table>
          <div className="roc"><Roc auc={m.auc} /></div>
        </div>
        <div className="card">
          <h3>Robustness testing</h3>
          <p className="sub">Accuracy drop after the file is altered. Lower is better.</p>
          <table className="kv">
            <tbody>
              {m.robustness.map((r) => (
                <tr key={r.test}>
                  <th>{r.test}</th>
                  <td className="mono bad-text">-{r.drop}%</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!compact && (
            <>
              <h3 className="mt">Accuracy by manipulation method</h3>
              <div className="bars">
                {m.byTechnique.map((t) => (
                  <div key={t.name} className="bar-row">
                    <span>{t.name}</span>
                    <div className="bar"><i style={{ width: t.acc + '%' }} /></div>
                    <b className="mono">{t.acc}%</b>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
