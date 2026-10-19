import Icon from '../components/Icon.jsx'
import ReportView from '../components/ReportView.jsx'
import { fmtSize, verdictOf } from '../services/engine.js'
import { Link, navigate } from '../router.jsx'
import { useStore } from '../store.jsx'

export default function Reports({ id }) {
  const { history, clearHistory } = useStore()
  const r = id && history.find((h) => h.id === id)

  if (id) {
    return r ? (
      <>
        <Link to="/app/reports" className="back-link no-print"><Icon name="arrow" size={16} className="flip" />All reports</Link>
        <ReportView r={r} />
      </>
    ) : (
      <div className="empty card pad"><h3>Report not found</h3><p className="sub">It may have been cleared. Run a new scan to create one.</p><Link to="/app/image" className="btn btn-primary">Scan an image</Link></div>
    )
  }

  if (!history.length) {
    return (
      <div className="empty card pad">
        <Icon name="file" size={34} />
        <h3>No reports yet</h3>
        <p className="sub">Every scan creates a report you can reopen, export and share. Run your first scan to see it here.</p>
        <div className="row"><Link to="/app/image" className="btn btn-primary">Scan an image</Link><Link to="/app/video" className="btn btn-outline">Scan a video</Link></div>
      </div>
    )
  }

  return (
    <>
      <div className="between">
        <p className="lead">Reports are kept in this browser. The latest 12 scans are saved.</p>
        <button className="btn btn-ghost" onClick={clearHistory}><Icon name="trash" size={16} />Clear all</button>
      </div>
      <div className="card pad">
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th /><th>File</th><th>Type</th><th>Verdict</th><th>Risk</th><th>Size</th><th>Date</th></tr></thead>
            <tbody>
              {history.map((h) => {
                const v = verdictOf(h.risk)
                return (
                  <tr key={h.id} className="click" onClick={() => navigate('/app/reports/' + h.id)}>
                    <td>{h.preview ? <img className="th" src={h.preview} alt="" /> : <span className="th" />}</td>
                    <td className="trunc"><Link to={'/app/reports/' + h.id}>{h.fileName}</Link></td>
                    <td>{h.type}</td>
                    <td><span className={'chip ' + v.tone}>{v.short}</span></td>
                    <td className="mono">{h.risk}%</td>
                    <td className="mono">{fmtSize(h.size)}</td>
                    <td className="mono">{new Date(h.createdAt).toLocaleDateString()}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
