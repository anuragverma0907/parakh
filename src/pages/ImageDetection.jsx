import { useState } from 'react'
import Dropzone from '../components/Dropzone.jsx'
import Progress from '../components/Progress.jsx'
import ScoreRing from '../components/ScoreRing.jsx'
import HeatmapImage, { HeatLegend } from '../components/HeatmapImage.jsx'
import Icon from '../components/Icon.jsx'
import { downloadJson } from '../components/ReportView.jsx'
import { IMAGE_STAGES, REGION_LABELS, analyzeImage, fmtSize, summarize, validateFile, verdictOf } from '../services/engine.js'
import { navigate } from '../router.jsx'
import { useStore } from '../store.jsx'

export default function ImageDetection() {
  const { consume, refund, addReport } = useStore()
  const [stage, setStage] = useState(-1)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [mode, setMode] = useState('heat')
  const [opacity, setOpacity] = useState(0.6)
  const busy = stage >= 0

  const run = async ([file]) => {
    setError('')
    const bad = validateFile(file, 'image')
    if (bad) return setError(bad)
    if (!consume(1)) return
    setResult(null)
    setStage(0)
    try {
      const r = await analyzeImage(file, { onStage: setStage })
      setResult(r)
      addReport(r)
    } catch (e) {
      setError(e.message)
      refund(1)
    } finally {
      setStage(-1)
    }
  }
  const reset = () => { setResult(null); setError(''); }
  const v = result && verdictOf(result.risk)

  return (
    <>
      <p className="lead">Upload a photo to explore image analysis. Generated scores and attention maps are examples and do not verify authenticity.</p>
      {error && <div className="banner bad" role="alert"><Icon name="alert" size={16} />{error}</div>}

      {!result && !busy && (
        <Dropzone accept="image/jpeg,image/png,image/webp" onFiles={run} title="Drag and drop your image here" hint="Supported formats: JPG, PNG, WEBP (max 10 MB)" icon="image" />
      )}
      {busy && <Progress stages={IMAGE_STAGES} current={stage} title="Analyzing image" />}

      {result && (
        <div className="stack">
          <div className="grid-2">
            <div className="card pad">
              <div className="file-row">
                <Icon name="image" />
                <div><b>{result.fileName}</b><span className="sub small">{result.width}×{result.height} · {fmtSize(result.size)}</span></div>
                <button className="btn btn-ghost" onClick={reset}><Icon name="refresh" size={16} />Analyze another</button>
              </div>
              <img className="preview" src={result.preview} alt="Uploaded" />
            </div>
            <div className="card pad result-card">
              <span className={'chip ' + v.tone}>{v.label}</span>
              <ScoreRing value={result.authenticity} tone={v.tone} label="Authenticity score" />
              <p className="ring-cap">Authenticity score</p>
              <p className="sub center">{summarize(result)}</p>
              {result.demo && <p className="note center">Generated preview result — not an authenticity assessment.</p>}
            </div>
          </div>

          <div className="grid-2">
            <div className="card pad">
              <h3>Analysis details</h3>
              <table className="kv">
                <tbody>
                  <tr><th>Prediction</th><td><b className={v.tone}>{v.short}</b></td></tr>
                  <tr><th>Confidence score</th><td className="mono">{result.confidence}%</td></tr>
                  <tr><th>Risk score</th><td className="mono">{result.risk}%</td></tr>
                  <tr><th>Likely method</th><td>{result.technique || 'None found'}</td></tr>
                  <tr><th>Detected regions</th><td>{Object.entries(result.regions).filter(([, s]) => s > 0.6).map(([k]) => REGION_LABELS[k]).join(', ') || 'None'}</td></tr>
                </tbody>
              </table>
              <div className="row mt">
                <button className="btn btn-primary" onClick={() => navigate('/app/reports/' + result.id)}><Icon name="file" size={16} />View full report</button>
                <button className="btn btn-ghost" onClick={() => downloadJson(result)}><Icon name="code" size={16} />Export JSON</button>
              </div>
            </div>
            <div className="card pad">
              <div className="between">
                <h3>Attention map</h3>
                <div className="seg" role="group" aria-label="View">
                  <button className={mode === 'heat' ? 'on' : ''} onClick={() => setMode('heat')}>Heatmap</button>
                  <button className={mode === 'orig' ? 'on' : ''} onClick={() => setMode('orig')}>Original</button>
                </div>
              </div>
              <HeatmapImage src={result.preview} points={result.heat} opacity={opacity} show={mode === 'heat'} alt="Attention map" />
              <div className="between mt">
                <HeatLegend />
                <label className="slider">Overlay<input type="range" min="0.2" max="0.9" step="0.05" value={opacity} onChange={(e) => setOpacity(+e.target.value)} /></label>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
