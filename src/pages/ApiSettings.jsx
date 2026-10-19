import Icon from '../components/Icon.jsx'
import { PLANS, useStore } from '../store.jsx'

export default function ApiSettings() {
  const { plan, usage, limit, history } = useStore()

  return (
    <>
      <p className="lead">Manage your local preferences, usage and saved reports.</p>
      <div className="banner"><Icon name="alert" size={16} />Scores and heatmaps are generated examples, not an authenticity assessment. Uploaded media stays in your browser.</div>
      <div className="grid-2">
        <div className="card pad">
          <h3>Workspace status</h3>
          <table className="kv"><tbody>
            <tr><th>Storage</th><td>This browser</td></tr>
            <tr><th>Analysis scores</th><td>Generated examples</td></tr>
            <tr><th>Plan</th><td>{PLANS[plan].name}</td></tr>
            <tr><th>Scans today</th><td>{usage.count}/{limit === Infinity ? '∞' : limit}</td></tr>
            <tr><th>Saved reports</th><td>{history.length} (this browser)</td></tr>
          </tbody></table>
        </div>
        <div className="card pad">
          <h3>Browser storage</h3>
          <p className="note">Theme, account details, usage counters and report history are stored locally in this browser. Clearing this browser&apos;s site data removes them.</p>
          <h3 className="mt">Media privacy</h3>
          <p className="note">Image previews and video frame extraction happen locally in your browser. Files are not uploaded to a server.</p>
        </div>
      </div>
    </>
  )
}
