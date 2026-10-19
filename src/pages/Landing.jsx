import Icon from '../components/Icon.jsx'
import FaceArt from '../components/FaceArt.jsx'
import { Link, navigate } from '../router.jsx'
import { goSection } from '../components/Navbar.jsx'
import { PLANS, useStore } from '../store.jsx'

const FEATURES = [
  ['image', 'Image detection', 'Explore photo upload with generated verdicts and confidence scores.'],
  ['video', 'Video analysis', 'Explore browser-based frame extraction and risk scores.'],
  ['flame', 'Heat maps', 'Explore generated sample maps in the detection results.'],
  ['file_text', 'Reports', 'View and download reports saved in this browser.'],
  ['settings', 'Settings', 'Manage local preferences and saved reports.'],
]

const STEPS = [
  ['upload', 'Upload', 'Drop in an image or video.'],
  ['sparkle', 'Analysis preview', 'Extract frames locally and generate example scores.'],
  ['gauge', 'Results', 'Review the verdict and confidence-score interface.'],
  ['file_text', 'Report', 'Timeline, heat maps and a report to keep.'],
]

const COMING = [
  ['mic', 'Audio deepfake detection', 'Catch cloned and synthetic voices.'],
  ['layers', 'Batch processing', 'Scan whole folders from the CLI.'],
  ['settings', 'Server integration', 'Not connected.'],
  ['link', 'Live and URL verification', 'Check public media by link.'],
]

const USERS = [
  ['user', 'Individuals', 'Check media before you share or trust it.'],
  ['news', 'News and media', 'Verify sources before you publish.'],
  ['building', 'Businesses', 'Protect your brand and your customers.'],
  ['shield', 'Verification teams', 'Triage suspicious content at scale.'],
  ['grad', 'Education and research', 'Teach and study media forensics.'],
  ['users', 'Social platforms', 'Screen uploads automatically.'],
]

const TEAM = [
  ['Agrima Tripathi', 'Technical Writer'],
  ['Anurag Verma', 'Frontend Developer'],
  ['Nishu Kumari', 'Frontend Developer'],
  ['Shivang Saxena', 'Backend & Auth'],
  ['Tanu Thakur', 'Backend, Database & Auth'],
  ['Yash Gupta', 'Frontend Developer'],
  ['Charvi Goyal', 'Data Science & Database'],
  ['Aditya Verma', 'AI/ML & Backend'],
]

const TIERS = [
  { id: 'free', name: 'Free', price: '$0', unit: '/ month', pts: ['5 sample scans a day', 'Image result previews', 'Browser-based workflow'], cta: 'Get started' },
  { id: 'pro', name: 'Pro', price: '$19', unit: '/ month', pts: ['100 sample scans a day', 'Generated heat maps', 'Saved reports'], cta: 'Upgrade', hot: true },
  { id: 'business', name: 'Business', price: '$99', unit: '/ month', pts: ['Batch processing', 'Reports', 'Usage display'], cta: 'Choose Business' },
  { id: 'enterprise', name: 'Enterprise', price: 'Custom', unit: '', pts: ['Extended workspace', 'Expanded dashboard', 'Account controls'], cta: 'Contact sales' },
]

export default function Landing() {
  const { plan, setPlan, toast } = useStore()
  const choose = (id) => {
    if (id === 'enterprise') return toast('Enterprise is custom. Add your sales contact here.', 'info')
    setPlan(id)
    if (id !== 'free') toast(`Switched to ${PLANS[id].name}. No payment was taken.`, 'ok')
    navigate('/app/image')
  }
  return (
    <main>
      <section className="hero">
        <div className="wrap hero-in">
          <div className="hero-copy">
            <p className="kicker">Media authenticity workspace</p>
            <h1>Deepfake analysis. <span>Clearer insights.</span></h1>
            <p className="hero-sub">Explore image and video analysis, reports, timelines and heat maps. Scores are generated examples and do not verify media authenticity.</p>
            <div className="row">
              <Link to="/app/image" className="btn btn-primary btn-lg"><Icon name="upload" size={18} />Start detection</Link>
              <button className="btn btn-outline btn-lg" onClick={() => goSection('features')}>Learn more</button>
            </div>
            <dl className="hero-stats">
              <div><dt>Analysis</dt><dd>Preview</dd></div>
              <div><dt>Scores</dt><dd>Generated</dd></div>
              <div><dt>Video previews</dt><dd>In browser</dd></div>
            </dl>
          </div>
          <div className="hero-art">
            <FaceArt />
            <div className="hero-note">
              <b>Analysis overview</b>
              <ul><li>Attention map</li><li>Facial regions</li><li>Risk and confidence scores</li></ul>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="sec">
        <div className="wrap">
          <h2 className="sec-h">Our key features</h2>
          <p className="sec-p">Explore the available tools using local files and generated example results.</p>
          <div className="feat-grid">
            {FEATURES.map(([i, t, d]) => (
              <div key={t} className="feat">
                <span className="feat-ic"><Icon name={i} size={22} /></span>
                <h3>{t}</h3>
                <p>{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="sec alt">
        <div className="wrap">
          <h2 className="sec-h">From upload to report in four steps</h2>
          <ol className="steps">
            {STEPS.map(([i, t, d], n) => (
              <li key={t}>
                <span className="step-n">{n + 1}</span>
                <Icon name={i} size={22} />
                <h3>{t}</h3>
                <p>{d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="sec">
        <div className="wrap split">
          <div>
            <h2 className="sec-h left">Show where, when and why</h2>
            <p className="sec-p left">Explore how a future detection product could present evidence. This demo uses generated scores and does not assess whether media is authentic.</p>
            <ul className="ticks">
              <li><Icon name="check" size={16} />Generated heat maps demonstrate the results layout</li>
              <li><Icon name="check" size={16} />A sample timeline displays low, medium and high risk segments</li>
              <li><Icon name="check" size={16} />Sample reports and performance charts are available</li>
            </ul>
            <Link to="/app/video" className="btn btn-primary">Try video detection</Link>
          </div>
          <div className="mini-timeline card pad">
            <h3>Suspicious timeline</h3>
            <div className="tl-bar static">
              {['low','low','low','medium','high','high','high','medium','low','low','low','low'].map((l, i) => <i key={i} className={'tl-seg ' + l} />)}
            </div>
            <div className="tl-axis"><span>00:00</span><span>00:10</span><span>00:20</span><span>00:30</span><span>00:40</span><span>00:45</span></div>
            <p className="sub small">Sample timeline only; no video was analyzed.</p>
          </div>
        </div>
      </section>

      <section className="sec alt">
        <div className="wrap">
          <h2 className="sec-h">Who can use it</h2>
          <div className="user-grid">
            {USERS.map(([i, t, d]) => (
              <div key={t} className="user"><Icon name={i} size={22} /><div><h3>{t}</h3><p>{d}</p></div></div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="sec">
        <div className="wrap">
          <h2 className="sec-h">Plans</h2>
          <p className="sec-p">Choose a plan to update your workspace. Plan selection is saved in this browser; online checkout is not available yet.</p>
          <div className="tiers">
            {TIERS.map((t) => (
              <div key={t.id} className={'tier' + (t.hot ? ' hot' : '')}>
                {t.hot && <span className="tier-tag">Most popular</span>}
                <h3>{t.name}</h3>
                <p className="price"><b>{t.price}</b>{t.unit}</p>
                <ul>{t.pts.map((p) => <li key={p}><Icon name="check" size={15} />{p}</li>)}</ul>
                <button className={'btn full ' + (t.hot ? 'btn-primary' : 'btn-outline')} onClick={() => choose(t.id)}>{plan === t.id ? 'Current plan' : t.cta}</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="about" className="sec alt">
        <div className="wrap">
          <h2 className="sec-h">About the project</h2>
          <p className="sec-p">Pixpect brings image and video workflows, batch processing, reports and performance dashboards together in one workspace. Scores and metrics shown here are examples.</p>
          <h3 className="mini-h">Coming soon</h3>
          <div className="soon">
            {COMING.map(([i, t, d]) => (
              <div key={t}><Icon name={i} size={20} /><b>{t}</b><span>{d}</span></div>
            ))}
          </div>
        </div>
      </section>

      <section className="cta">
        <div className="wrap cta-in">
          <div>
            <h2>Check your first file</h2>
            <p>Choose a local image to explore the analysis experience. Generated scores are examples only.</p>
          </div>
          <Link to="/app/image" className="btn btn-primary btn-lg">Start detection</Link>
        </div>
      </section>

      <section className="sec team-section">
        <div className="wrap">
          <div className="team-panel card">
            <header className="team-head">
              <div className="team-brand">
                <span className="team-brand-mark" aria-hidden="true">MnM</span>
                <span className="team-brand-tagline">Innovate · Build · Deliver</span>
              </div>
              <h2>Our Developers</h2>
              <span className="team-count">8 Members</span>
            </header>
            <div className="team-grid">
              {TEAM.map(([name, role]) => (
                <article className="team-member" key={name}>
                  <span className="team-avatar" aria-hidden="true">
                    {name.split(' ').map((part) => part[0]).join('')}
                  </span>
                  <span className="team-member-info">
                    <b>{name}</b>
                    <span>{role}</span>
                  </span>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
