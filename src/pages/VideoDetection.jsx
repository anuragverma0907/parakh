import { useEffect, useRef, useState } from 'react'
import Dropzone from '../components/Dropzone.jsx'
import Progress from '../components/Progress.jsx'
import ScoreRing from '../components/ScoreRing.jsx'
import Timeline from '../components/Timeline.jsx'
import FrameChart from '../components/FrameChart.jsx'
import HeatmapImage from '../components/HeatmapImage.jsx'
import Icon from '../components/Icon.jsx'
import { VIDEO_STAGES, analyzeVideo, fmtSize, fmtTime, summarize, validateFile, verdictOf, levelOf } from '../services/engine.js'
import { navigate } from '../router.jsx'
import { useStore } from '../store.jsx'

export default function VideoDetection() {
  const { consume, refund, addReport } = useStore()
  const [stage, setStage] = useState(-1)
  const [result, setResult] = useState(null)
  const [src, setSrc] = useState(null)
  const [error, setError] = useState('')
  const [now, setNow] = useState(0)
  const [heatFrame, setHeatFrame] = useState(null)
  const vid = useRef(null)
  const busy = stage >= 0

  useEffect(() => () => src && URL.revokeObjectURL(src), [src])

  const run = async ([file]) => {
    setError('')
    const bad = validateFile(file, 'video')
    if (bad) return setError(bad)
    if (!consume(1)) return
    setResult(null)
    setStage(0)
    try {
      const r = await analyzeVideo(file, { onStage: setStage })
      setSrc(URL.createObjectURL(file))
      setResult(r)
      setHeatFrame(null)
      addReport(r)
    } catch (e) {
      setError(e.message)
      refund(1)
    } finally {
      setStage(-1)
    }
  }
  const seekTo = (t) => {
    if (vid.current) {
      vid.current.currentTime = t
      vid.current.play().catch(() => {})
    }
  }
  const v = result && verdictOf(result.risk)

  return (
    <>
      <p className="lead">Upload a video to explore video analysis. Frames are extracted in your browser; generated scores and timestamps are examples, not an authenticity assessment.</p>
      {error && <div className="banner bad" role="alert"><Icon name="alert" size={16} />{error}</div>}

      {!result && !busy && (
        <Dropzone accept="video/mp4,video/quicktime,video/webm,video/x-matroska" onFiles={run} title="Drag and drop your video here" hint="Supported formats: MP4, MOV, WEBM, MKV (max 500 MB)" icon="video" />
      )}
      {busy && <Progress stages={VIDEO_STAGES} current={stage} title="Analyzing video" />}

      {result && (
        <div className="stack">
          <div className="grid-2 video-top">
            <div className="card pad">
              <div className="file-row">
                <Icon name="video" />
                <div><b>{result.fileName}</b><span className="sub small">{result.width}×{result.height} · {fmtTime(result.duration)} · {fmtSize(result.size)}</span></div>
                <button className="btn btn-ghost" onClick={() => { setResult(null); setSrc(null) }}><Icon name="refresh" size={16} />Analyze another</button>
              </div>
              <video ref={vid} src={src} controls playsInline className="player" onTimeUpdate={(e) => setNow(e.currentTarget.currentTime)} />
            </div>
            <div className="card pad result-card">
              <span className={'chip ' + v.tone}>{result.risk >= 35 ? 'Potentially manipulated' : 'Likely real'}</span>
              <div className="row center-row">
                <div className="col-c"><ScoreRing value={result.risk} tone={v.tone} size={116} label="Manipulation score" /><p className="ring-cap">Manipulation score</p></div>
                <div className="col-c"><div className="big mono">{result.confidence}%</div><p className="ring-cap">Confidence</p></div>
              </div>
              <p className="sub center">{summarize(result)}</p>
              {result.demo && <p className="note center">Generated scores are examples; frames were read from your file in this browser.</p>}
              <button className="btn btn-primary full" onClick={() => navigate('/app/reports/' + result.id)}><Icon name="file" size={16} />View full report</button>
            </div>
          </div>

          <div className="card pad">
            <h3>Suspicious timeline</h3>
            <p className="sub">Select a segment to jump to it in the video.</p>
            <Timeline duration={result.duration} segments={result.segments} current={now} onSeek={seekTo} />
            {result.suspicious.length > 0 && (
              <ul className="ts-list">
                {result.suspicious.map((s, i) => (
                  <li key={i}>
                    <i className={'dot ' + s.level} />
                    <button className="link-btn mono" onClick={() => seekTo(s.start)}>{fmtTime(s.start)} to {fmtTime(s.end)}</button>
                    <b className={s.level}>{s.level === 'high' ? 'High risk' : 'Medium risk'}</b>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="grid-2">
            <div className="card pad">
              <div className="between"><h3>Frame analysis</h3>{heatFrame != null && <button className="link-btn" onClick={() => setHeatFrame(null)}>Hide attention map</button>}</div>
              <div className="frames">
                {result.frames.map((f, i) => (
                  <button key={i} type="button" className={'frame ' + levelOf(f.score) + (heatFrame === i ? ' sel' : '')} onClick={() => { seekTo(f.t); setHeatFrame(i) }}>
                    <img src={f.thumb} alt={`Frame at ${fmtTime(f.t)}`} />
                    <span className="mono">{fmtTime(f.t)}</span>
                    <b className="mono">{Math.round(f.score * 100)}%</b>
                  </button>
                ))}
              </div>
              {heatFrame != null && (
                <div className="frame-heat">
                  <HeatmapImage src={result.frames[heatFrame].thumb} points={result.frames[heatFrame].heat} alt="Frame attention map" />
                  <p className="sub small">Attention map for the frame at {fmtTime(result.frames[heatFrame].t)}.</p>
                </div>
              )}
            </div>
            <div className="card pad">
              <h3>Frame scores over time</h3>
              <FrameChart series={result.series} duration={result.duration} />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
