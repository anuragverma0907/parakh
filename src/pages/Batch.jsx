import { useState } from 'react'
import Dropzone from '../components/Dropzone.jsx'
import Icon from '../components/Icon.jsx'
import { analyzeImage, analyzeVideo, fmtSize, validateFile, verdictOf } from '../services/engine.js'
import { navigate } from '../router.jsx'
import { useStore } from '../store.jsx'

export default function Batch() {
  const { consume, addReport, toast } = useStore()
  const [rows, setRows] = useState([])
  const [running, setRunning] = useState(false)

  const patch = (i, p) => setRows((rs) => rs.map((r, j) => (j === i ? { ...r, ...p } : r)))

  const start = async (files) => {
    const base = rows.length
    const items = files.map((f) => {
      const kind = f.type.startsWith('video') ? 'video' : 'image'
      const err = validateFile(f, kind)
      return { file: f, kind, status: err ? 'error' : 'queued', error: err }
    })
    setRows((r) => [...r, ...items])
    const ok = items.filter((i) => i.status === 'queued').length
    if (!ok) return
    if (!consume(ok)) {
      setRows((r) => r.slice(0, base))
      return
    }
    setRunning(true)
    for (let i = 0; i < items.length; i++) {
      if (items[i].status !== 'queued') continue
      const idx = base + i
      patch(idx, { status: 'running' })
      try {
        const r = items[i].kind === 'video' ? await analyzeVideo(items[i].file) : await analyzeImage(items[i].file)
        addReport(r)
        patch(idx, { status: 'done', result: r })
      } catch (e) {
        patch(idx, { status: 'error', error: e.message })
      }
    }
    setRunning(false)
    toast('Batch finished.', 'ok')
  }

  const exportCsv = () => {
    const lines = ['file,type,verdict,risk,confidence,report_id']
    rows.filter((r) => r.result).forEach((r) => lines.push([`"${r.file.name}"`, r.kind, verdictOf(r.result.risk).short, r.result.risk, r.result.confidence, r.result.id].join(',')))
    const url = URL.createObjectURL(new Blob([lines.join('\n')], { type: 'text/csv' }))
    const a = document.createElement('a')
    a.href = url
    a.download = 'pixpect-batch.csv'
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 500)
  }

  const done = rows.filter((r) => r.status === 'done').length

  return (
    <>
      <p className="lead">Process local media files in a batch. Generated scores are examples and are saved to Reports in this browser.</p>
      <Dropzone multiple accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime,video/webm" onFiles={start} title="Drop several files here" hint="Images up to 10 MB, videos up to 500 MB" icon="layers" compact />

      {rows.length > 0 && (
        <div className="card pad mt">
          <div className="between">
            <h3>Queue <span className="sub">({done}/{rows.length} done)</span></h3>
            <div className="row">
              <button className="btn btn-ghost" disabled={!done} onClick={exportCsv}><Icon name="download" size={16} />Export CSV</button>
              <button className="btn btn-ghost" disabled={running} onClick={() => setRows([])}><Icon name="trash" size={16} />Clear</button>
            </div>
          </div>
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>File</th><th>Type</th><th>Size</th><th>Status</th><th>Verdict</th><th>Risk</th><th /></tr></thead>
              <tbody>
                {rows.map((r, i) => {
                  const v = r.result && verdictOf(r.result.risk)
                  return (
                    <tr key={i}>
                      <td className="trunc">{r.file.name}</td>
                      <td>{r.kind}</td>
                      <td className="mono">{fmtSize(r.file.size)}</td>
                      <td>{r.status === 'error' ? <span className="bad-text">{r.error}</span> : r.status === 'running' ? <span className="spin">Analyzing</span> : r.status}</td>
                      <td>{v ? <span className={'chip ' + v.tone}>{v.short}</span> : '–'}</td>
                      <td className="mono">{r.result ? r.result.risk + '%' : '–'}</td>
                      <td>{r.result && <button className="link-btn" onClick={() => navigate('/app/reports/' + r.result.id)}>Report</button>}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  )
}
