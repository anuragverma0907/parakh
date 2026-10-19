import Icon from './Icon.jsx'
import ScoreRing from './ScoreRing.jsx'
import Timeline from './Timeline.jsx'
import FrameChart from './FrameChart.jsx'
import HeatmapImage, { HeatLegend } from './HeatmapImage.jsx'
import ModelPerformance from './ModelPerformance.jsx'
import { fmtSize, fmtTime, REGION_LABELS, summarize, verdictOf } from '../services/engine.js'
import { useStore } from '../store.jsx'

export function downloadJson(r) {
  const { preview, frames, ...rest } = r
  const slim = { ...rest, frames: frames?.map(({ thumb, ...f }) => f) }
  const url = URL.createObjectURL(new Blob([JSON.stringify(slim, null, 2)], { type: 'application/json' }))
  const a = document.createElement('a')
  a.href = url
  a.download = `${r.id}.json`
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 500)
}

export default function ReportView({ r }) {
  const { toast } = useStore()
  const v = verdictOf(r.risk)
  const isVideo = r.type === 'video'
  const printIt = () => {
    try { window.print() } catch { toast('Printing is not available here. Use your browser menu to print.', 'warn') }
  }

  return (
    <article className="report">
      <header className="report-head">
        <div>
          <h2>Detection report</h2>
          <p className="sub mono">{r.id} · {new Date(r.createdAt).toLocaleString()}</p>
        </div>
        <div className="row no-print">
          <button className="btn btn-ghost" onClick={() => downloadJson(r)}><Icon name="code" size={16} />Export JSON</button>
          <button className="btn btn-primary" onClick={printIt}><Icon name="download" size={16} />Download report</button>
        </div>
      </header>

      {r.demo && <div className="banner"><Icon name="alert" size={16} />Scores and heatmaps are generated examples and do not verify the authenticity of this file.</div>}

      <section className="rp-top">
        <div className={'verdict-card ' + v.tone}>
          <Icon name={v.tone === 'ok' ? 'check' : 'alert'} size={26} />
          <div>
            <b>{v.label}</b>
            <span>{r.fileName} · {fmtSize(r.size)}{isVideo ? ' · ' + fmtTime(r.duration) : ''}</span>
          </div>
        </div>
        <div className="stat"><span>Overall risk score</span><b className={'mono ' + v.tone}>{r.risk}%</b></div>
        <div className="stat"><span>Confidence</span><b className="mono">{r.confidence}%</b></div>
        <div className="stat"><span>Likely method</span><b>{r.technique || 'None found'}</b></div>
      </section>

      <section className="rp-grid">
        <div className="card">
          <h3>Summary</h3>
          <p>{summarize(r)}</p>
          {!isVideo && (
            <table className="kv">
              <tbody>
                {Object.entries(r.regions).sort((a, b) => b[1] - a[1]).map(([k, s]) => (
                  <tr key={k}>
                    <th>{REGION_LABELS[k]}</th>
                    <td><div className="bar sm"><i className={s > 0.6 ? 'hi' : s > 0.35 ? 'md' : ''} style={{ width: s * 100 + '%' }} /></div></td>
                    <td className="mono">{Math.round(s * 100)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {isVideo ? (
          <div className="card">
            <h3>Suspicious timestamps</h3>
            {r.suspicious.length ? (
              <ul className="ts-list">
                {r.suspicious.map((s, i) => (
                  <li key={i}><i className={'dot ' + s.level} /><span className="mono">{fmtTime(s.start)} to {fmtTime(s.end)}</span><b className={s.level}>{s.level === 'high' ? 'High risk' : 'Medium risk'}</b></li>
                ))}
              </ul>
            ) : <p className="sub">No suspicious segments found.</p>}
            <Timeline duration={r.duration} segments={r.segments} />
          </div>
        ) : (
          <div className="card">
            <h3>Attention map</h3>
            <HeatmapImage src={r.preview} points={r.heat} alt="Attention map" />
            <HeatLegend />
          </div>
        )}
      </section>

      {isVideo && (
        <section className="rp-grid">
          <div className="card">
            <h3>Attention map (key frames)</h3>
            <div className="kf">
              {[...r.frames].sort((a, b) => b.score - a.score).slice(0, 5).sort((a, b) => a.t - b.t).map((f, i) => (
                <figure key={i}>
                  <HeatmapImage src={f.thumb} points={f.heat} alt={`Frame at ${fmtTime(f.t)}`} />
                  <figcaption className="mono">{fmtTime(f.t)} · {Math.round(f.score * 100)}%</figcaption>
                </figure>
              ))}
            </div>
            <HeatLegend />
          </div>
          <div className="card">
            <h3>Frame scores</h3>
            <FrameChart series={r.series} duration={r.duration} />
          </div>
        </section>
      )}

      <section>
        <h3 className="sec-title">Model evaluation and robustness</h3>
        <ModelPerformance compact />
      </section>
    </article>
  )
}
