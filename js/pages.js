(function () {
  'use strict';
  var DV = window.DV;
  var html = DV.html;
  var useState = React.useState, useEffect = React.useEffect, useRef = React.useRef;

  function copyText(text, done) {
    function fallback() { done(false); }
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(function () { done(true); }, fallback);
      else fallback();
    } catch (e) { fallback(); }
  }

  function useFlash() {
    var s = useState(''), msg = s[0], set = s[1];
    return [msg, function (m) { set(m); setTimeout(function () { set(''); }, 2200); }];
  }

  var FEATURES = [
    { icon: 'image', title: 'Image deepfake detection', text: 'Upload a photo and get a prediction, a confidence score and an authenticity score in seconds.' },
    { icon: 'video', title: 'Video and frame-level detection', text: 'Videos are split into frames and each frame is scored, so you see where manipulation is likely.' },
    { icon: 'clock', title: 'Suspicious timestamp timeline', text: 'Flagged segments get a start and end time. Click one to jump straight to it in the player.' },
    { icon: 'target', title: 'Attention and heat maps', text: 'A heat map shows which part of the face pushed the model toward a suspicious result.' },
    { icon: 'file', title: 'Verification report', text: 'Prediction, risk score, flagged segments and model details in one summary you can keep or share.' },
    { icon: 'chart', title: 'Performance and robustness checks', text: 'Accuracy, precision, recall, ROC and drops under compression and blur are part of the product.' }
  ];
  var STEPS = [
    { icon: 'upload', title: 'Upload', text: 'Drop in an image or a video. Images up to 10 MB, videos up to 500 MB.' },
    { icon: 'scan', title: 'AI analysis', text: 'The face is located. Videos are sampled into frames.' },
    { icon: 'verify', title: 'Prediction', text: 'Each image or frame is classified as real or suspicious.' },
    { icon: 'chart', title: 'Scores', text: 'A confidence score and an authenticity or risk score are calculated.' },
    { icon: 'file', title: 'Result', text: 'You get the verdict, the evidence and a report.' }
  ];
  var ROADMAP = [
    { icon: 'image', title: 'Image detection', status: 'In this build', tone: 'ok' },
    { icon: 'video', title: 'Video and frame-level detection', status: 'In this build', tone: 'ok' },
    { icon: 'target', title: 'Heat maps and timeline', status: 'In this build', tone: 'ok' },
    { icon: 'file', title: 'Verification reports', status: 'In this build', tone: 'ok' },
    { icon: 'layers', title: 'Batch processing', status: 'Interface ready', tone: 'warn' },
    { icon: 'code', title: 'API integration', status: 'Interface ready', tone: 'warn' },
    { icon: 'mic', title: 'Audio and voice deepfake detection', status: 'Planned', tone: 'neutral' },
    { icon: 'link', title: 'Live and URL verification', status: 'Planned', tone: 'neutral' }
  ];
  var TIERS = [
    { name: 'Free', price: '$0', per: '/ month', who: 'For individuals', items: ['Limited scans', 'Basic analysis', 'Watermarked results'], cta: 'Start free', href: '#image' },
    { name: 'Pro', price: '$19', per: '/ month', who: 'For regular checkers', items: ['More scans', 'Detailed analysis and heat maps', 'Verification reports'], cta: 'Upgrade', featured: true },
    { name: 'Business', price: '$99', per: '/ month', who: 'For teams and newsrooms', items: ['API access', 'Batch processing', 'Priority support'], cta: 'Contact sales' },
    { name: 'Enterprise', price: 'Custom', per: '', who: 'For platforms', items: ['Custom detection solution', 'Dedicated dashboard', 'SLA and support'], cta: 'Contact us' }
  ];
  var AUDIENCE = [
    { icon: 'users', title: 'Individuals', text: 'Check a suspicious photo or clip before you share it.' },
    { icon: 'news', title: 'News and media', text: 'Screen user-submitted footage before it goes to air.' },
    { icon: 'building', title: 'Businesses', text: 'Protect your brand and staff from impersonation.' },
    { icon: 'verify', title: 'Verification teams', text: 'Work through queues in bulk and keep a report trail.' },
    { icon: 'share', title: 'Social platforms', text: 'Screen uploads through the API as they arrive.' }
  ];
  var SAMPLE_FRAMES = [12, 18, 15, 22, 71, 84, 88, 79, 31, 17, 20, 14].map(function (r, i) { return { i: i, t: (i + 0.5) * 4, risk: r }; });

  DV.Landing = function Landing(p) {
    var s = useState(''), note = s[0], setNote = s[1];
    return html`<div className="landing">
      <header className="nav"><div className="wrap nav-in">
        <a className="brand" href="#home"><${DV.Logo} /><span>DeepVerify</span></a>
        <nav className="nav-links" aria-label="Sections">
          <a href="#features">Features</a><a href="#pipeline">How it works</a><a href="#performance">Performance</a><a href="#pricing">Pricing</a>
        </nav>
        <div className="nav-actions">
          <button type="button" className="icon-btn" onClick=${p.onToggleTheme} aria-label="Switch between light and dark theme"><${DV.Icon} name=${p.isDark ? 'sun' : 'moon'} size=${18} /></button>
          <a className="btn btn-primary btn-sm" href="#image">Start detection</a>
        </div>
      </div></header>

      <section className="hero" id="home"><div className="wrap hero-in">
        <div className="hero-copy">
          <span className="chip chip-lg"><i className="dot dot-accent"></i>Explainable AI · Media authenticity</span>
          <h1><span className="h-ink">Detect deepfakes.</span><em className="h-accent">Verify what's</em><span className="h-green">real.</span></h1>
          <p className="lead">Upload an image or a video. DeepVerify shows whether it was altered, which frames are suspect, and which part of the face drove the result.</p>
          <div className="hero-actions">
            <a className="btn btn-primary btn-lg" href="#image">Start detection <${DV.Icon} name="arrow" size=${18} /></a>
            <a className="btn btn-ghost btn-lg" href="#pipeline">See how it works</a>
          </div>
          <div className="stat-row">
            <div className="stat"><${DV.Icon} name="layers" size=${20} /><strong>4</strong><span>Manipulation methods</span></div>
            <div className="stat"><${DV.Icon} name="clock" size=${20} /><strong>Per frame</strong><span>Video timeline</span></div>
            <div className="stat"><${DV.Icon} name="target" size=${20} /><strong>Heat maps</strong><span>Why it was flagged</span></div>
          </div>
        </div>
        <${DV.HeroVisual} />
      </div><div className="hero-curve" aria-hidden="true"></div></section>

      <section className="band" id="features"><div className="wrap">
        <div className="eyebrow mono"><i></i>What it does</div>
        <h2 className="h2">Not just <em>real or fake.</em> The evidence behind it.</h2>
        <p className="sub">Every result comes with a score, a place and a reason, so a reviewer can decide with more than a label.</p>
        <div className="grid-3 feat-grid">
          ${FEATURES.map(function (f) {
            return html`<article key=${f.title} className="card feat">
              <span className="tile"><${DV.Icon} name=${f.icon} size=${24} /></span>
              <h3>${f.title}</h3><p>${f.text}</p>
            </article>`;
          })}
        </div>
      </div></section>

      <section className="band band-warm" id="pipeline"><div className="wrap">
        <div className="eyebrow mono"><i></i>How it works</div>
        <h2 className="h2">Upload, analyse, <em>decide.</em></h2>
        <p className="sub">The first version is this straight line. Timeline, heat maps, reports, audio and the API are built on top of it.</p>
        <ol className="steps">
          ${STEPS.map(function (st, i) {
            return html`<li key=${st.title} className="step card">
              <span className="step-no mono">${'0' + (i + 1)}</span>
              <span className="tile tile-sm"><${DV.Icon} name=${st.icon} size=${20} /></span>
              <h3>${st.title}</h3><p>${st.text}</p>
            </li>`;
          })}
        </ol>
      </div></section>

      <section className="band band-deep" id="explain"><div className="wrap split">
        <div>
          <div className="eyebrow mono"><i></i>Show where, when and why</div>
          <h2 className="h2 on-deep">A verdict you can <em>check for yourself.</em></h2>
          <p className="sub on-deep">The model points at the evidence: the face regions that mattered and the exact seconds that look wrong.</p>
          <ul className="deep-list">
            <li><span className="tile tile-deep"><${DV.Icon} name="target" size=${22} /></span><div><strong>Attention maps</strong><span>Heat maps mark the regions that pushed the score up.</span></div></li>
            <li><span className="tile tile-deep"><${DV.Icon} name="clock" size=${22} /></span><div><strong>Suspicious timestamps</strong><span>Flagged segments come with a start time, an end time and a risk level.</span></div></li>
            <li><span className="tile tile-deep"><${DV.Icon} name="file" size=${22} /></span><div><strong>Overall assessment</strong><span>One plain-language summary and a downloadable report.</span></div></li>
          </ul>
          <a className="btn btn-primary btn-lg" href="#image">Try it live <${DV.Icon} name="arrow" size=${18} /></a>
        </div>
        <div className="preview card-deep" aria-label="Example result">
          <div className="preview-top"><span className="mono">EXAMPLE RESULT</span><${DV.Pill} tone="bad">Likely manipulated<//></div>
          <div className="preview-body">
            <${DV.ScoreRing} value=${68} tone="bad" sub="Risk score" label="Risk score" size=${116} />
            <div className="preview-regions">
              <${DV.RegionBars} regions=${[{ name: 'Eye area', influence: 0.82 }, { name: 'Mouth region', influence: 0.67 }, { name: 'Jawline and face edge', influence: 0.41 }, { name: 'Skin texture (cheeks)', influence: 0.22 }]} />
            </div>
          </div>
          <p className="preview-cap mono">FRAME RISK OVER 48 SECONDS</p>
          <${DV.TimelineBar} frames=${SAMPLE_FRAMES} duration=${48} threshold=${50} />
        </div>
      </div></section>

      <section className="band" id="performance"><div className="wrap">
        <div className="eyebrow mono"><i></i>Model performance</div>
        <h2 className="h2">Built to be <em>tested.</em></h2>
        <p className="sub">Evaluation and robustness checks sit in the product, next to the results. The figures below are sample values for this front end.</p>
        <div className="dataset card">
          <div><strong>Training data: ${DV.MODEL.dataset}</strong><span>Original videos plus four manipulation methods.</span></div>
          <ul className="chips">${DV.METHODS.map(function (m) { return html`<li key=${m} className="chip">${m}</li>`; })}</ul>
        </div>
        <${DV.ModelPanel} />
      </div></section>

      <section className="band band-warm" id="roadmap"><div className="wrap">
        <div className="eyebrow mono"><i></i>Roadmap</div>
        <h2 className="h2">What works today, <em>what comes next.</em></h2>
        <div className="grid-4 road-grid">
          ${ROADMAP.map(function (r) {
            return html`<article key=${r.title} className="card road">
              <span className="tile tile-sm"><${DV.Icon} name=${r.icon} size=${20} /></span>
              <h3>${r.title}</h3><${DV.Pill} tone=${r.tone}>${r.status}<//>
            </article>`;
          })}
        </div>
      </div></section>

      <section className="band" id="pricing"><div className="wrap">
        <div className="eyebrow mono"><i></i>Plans</div>
        <h2 className="h2">Free to try, <em>built to scale.</em></h2>
        <p className="sub">Deepfake detection as a service: limited scans for everyone, more depth and an API for teams.</p>
        <div className="grid-4 price-grid">
          ${TIERS.map(function (t) {
            return html`<article key=${t.name} className=${'card tier' + (t.featured ? ' is-featured' : '')}>
              <header><h3>${t.name}</h3><span className="muted small">${t.who}</span></header>
              <p className="price"><strong>${t.price}</strong><span>${t.per}</span></p>
              <ul className="tick-list">${t.items.map(function (it) { return html`<li key=${it}><${DV.Icon} name="check" size=${16} />${it}</li>`; })}</ul>
              ${t.href
                ? html`<a className="btn btn-ghost btn-block" href=${t.href}>${t.cta}</a>`
                : html`<button type="button" className=${'btn btn-block ' + (t.featured ? 'btn-primary' : 'btn-ghost')} onClick=${function () { setNote(t.name); }}>${t.cta}</button>`}
            </article>`;
          })}
        </div>
        ${note && html`<p className="foot-note" role="status">Billing and sales contact are not connected in this front end yet (${note} plan).</p>`}
      </div></section>

      <section className="band band-warm" id="audience"><div className="wrap">
        <div className="eyebrow mono"><i></i>Who uses it</div>
        <h2 className="h2">For anyone who has to <em>trust what they see.</em></h2>
        <div className="grid-5 aud-grid">
          ${AUDIENCE.map(function (a) {
            return html`<article key=${a.title} className="card aud"><span className="tile tile-sm"><${DV.Icon} name=${a.icon} size=${20} /></span><h3>${a.title}</h3><p>${a.text}</p></article>`;
          })}
        </div>
      </div></section>

      <section className="cta"><div className="wrap cta-in">
        <div><h2>Check your first <em>file.</em></h2><p>It takes under a minute. No account is needed in this demo.</p></div>
        <a className="btn btn-primary btn-lg" href="#image">Open the dashboard <${DV.Icon} name="arrow" size=${18} /></a>
      </div></section>

      <footer className="foot"><div className="wrap foot-in">
        <span className="brand"><${DV.Logo} size=${28} /><span>DeepVerify</span></span>
        <span className="muted small">© 2026 DeepVerify. Authentic media, a safer digital world.</span>
        <span className="muted small">AI assists. It never replaces human review.</span>
      </div></footer>
    </div>`;
  };

  function PageHead(p) {
    return html`<header className="page-head"><div><h1>${p.title}</h1><p>${p.sub}</p></div>${p.children}</header>`;
  }
  function Row(p) { return html`<div><dt>${p.k}</dt><dd className=${p.num ? 'num' : ''}>${p.children}</dd></div>`; }
  function EnginePill(p) { return html`<${DV.Pill} tone="neutral">${p.engine === 'api' ? 'Connected API' : 'Demo engine'}<//>`; }

  function ResultActions(p) {
    var f = useFlash(), msg = f[0], flash = f[1];
    return html`<div className="actions">
      <button type="button" className="btn btn-primary btn-sm" onClick=${function () { p.onOpenReport(p.res.id); }}><${DV.Icon} name="file" size=${16} />View full report</button>
      <button type="button" className="btn btn-ghost btn-sm" onClick=${function () { try { DV.saveText('deepverify-report-' + p.res.id + '.txt', DV.reportText(p.res)); } catch (e) { flash('Download is not available here.'); } }}><${DV.Icon} name="download" size=${16} />Download report</button>
      <button type="button" className="btn btn-ghost btn-sm" onClick=${function () { copyText(DV.reportText(p.res), function (ok) { flash(ok ? 'Report copied.' : 'Copy is not available here.'); }); }}><${DV.Icon} name="copy" size=${16} />Copy summary</button>
      ${p.onReset && html`<button type="button" className="btn btn-quiet btn-sm" onClick=${p.onReset}>Analyse another</button>`}
      <span className="flash" role="status">${msg}</span>
    </div>`;
  }

  DV.ImagePage = function ImagePage(p) {
    var a = useState(null), file = a[0], setFile = a[1];
    var b = useState(''), preview = b[0], setPreview = b[1];
    var c = useState(null), busy = c[0], setBusy = c[1];
    var d = useState(null), result = d[0], setResult = d[1];
    var e = useState(''), error = e[0], setError = e[1];
    var f = useState(true), overlay = f[0], setOverlay = f[1];
    var g = useState(0.8), strength = g[0], setStrength = g[1];

    function run(fl) {
      setError(''); setResult(null); setFile(fl);
      var url = URL.createObjectURL(fl);
      setPreview(url); setBusy({ i: 0, n: DV.IMAGE_STAGES.length, label: 'Starting' });
      DV.analyzeImage(fl, p.settings, function (i, n, label) { setBusy({ i: i, n: n, label: label }); })
        .then(function (res) { res.previewUrl = url; setResult(res); setBusy(null); p.onResult(res); })
        .catch(function (err) { setBusy(null); setError(err.message || 'The analysis failed. Try again.'); });
    }
    function sample() {
      DV.makeSampleFile().then(run).catch(function (err) { setError(err.message); });
    }
    function reset() { setFile(null); setPreview(''); setResult(null); setError(''); setBusy(null); }

    var v = result ? DV.verdictFor(result.risk, result.threshold) : null;
    var flagged = result ? result.regions.filter(function (r) { return r.influence >= 0.5; }).map(function (r) { return r.name; }) : [];

    return html`<div className="page">
      <${PageHead} title="Image detection" sub="Upload an image to check whether it is real or manipulated." />
      <div className="grid-2">
        <section className="panel">
          <header className="panel-head"><h3>Upload</h3></header>
          ${preview && html`<div className="preview-box"><img src=${preview} alt=${'Uploaded image ' + (file ? file.name : '')} /><div className="preview-meta"><strong>${file && file.name}</strong><span>${file && DV.fmtBytes(file.size)}</span></div></div>`}
          <${DV.Dropzone} id="img-file" kinds=${['image']} accept="image/jpeg,image/png,image/webp" compact=${!!preview} disabled=${!!busy}
            title=${preview ? 'Drop another image here' : 'Drag and drop your image here'} hint="Supported formats: JPG, PNG, WEBP (max 10 MB)" onFiles=${function (l) { run(l[0]); }} />
          <div className="sample-row"><span className="muted small">No image at hand?</span><button type="button" className="btn btn-quiet btn-sm" disabled=${!!busy} onClick=${sample}>Try with a sample image</button></div>
        </section>

        <section className="panel" aria-live="polite">
          <header className="panel-head"><h3>Result</h3>${result && html`<${EnginePill} engine=${result.engine} />`}</header>
          ${busy ? html`<${DV.Progress} title="Analysing image" fraction=${(busy.i + 1) / busy.n} label=${busy.label + '...'} />`
            : error ? html`<div className="notice notice-bad" role="alert"><${DV.Icon} name="alert" size=${18} /><div><strong>Could not analyse this image</strong><p>${error}</p></div></div>`
            : result ? html`<div>
                <div className="result-hero">
                  <div className="result-thumb"><img src=${result.previewUrl} alt="" /><span className=${'badge badge-' + v.tone}>${v.short}</span></div>
                  <div className="result-score">
                    <${DV.ScoreRing} value=${result.authenticity} tone=${v.tone} sub="Authenticity" label="Authenticity score" />
                    <strong className=${'verdict-text tone-' + v.tone}>${v.label}</strong>
                  </div>
                </div>
                <p className="result-sum">${DV.describe(result)}</p>
                <${ResultActions} res=${result} onOpenReport=${p.onOpenReport} onReset=${reset} />
              </div>`
            : html`<div className="empty"><span className="tile"><${DV.Icon} name="scan" size=${24} /></span><strong>Your result appears here</strong><p>You get a prediction, a confidence score and a risk score, plus an attention map of the face.</p></div>`}
        </section>
      </div>

      ${result && html`<div className="grid-2">
        <section className="panel">
          <header className="panel-head"><h3>Analysis details</h3></header>
          <dl className="kv">
            <${Row} k="Prediction">${result.prediction}<//>
            <${Row} k="Confidence score" num=${true}>${result.confidence}%<//>
            <${Row} k="Risk score" num=${true}>${result.risk}%<//>
            <${Row} k="Detected regions">${flagged.length && result.risk >= result.threshold - 15 ? flagged.join(', ') : 'None'}<//>
            ${result.methods && result.methods.length ? html`<${Row} k="Closest method">${result.methods[0].name} (${result.methods[0].p}%)<//>` : ''}
            <${Row} k="Decision threshold" num=${true}>${result.threshold}<//>
            <${Row} k="Analysis time" num=${true}>${(result.elapsedMs / 1000).toFixed(1)} s<//>
          </dl>
        </section>
        <section className="panel">
          <header className="panel-head"><h3>Attention map</h3></header>
          <div className="heat-wrap"><${DV.Heatmap} src=${result.previewUrl} regions=${result.regions} show=${overlay} strength=${strength} label="Attention map over the uploaded image" /></div>
          <${DV.HeatLegend} />
          <div className="controls">
            <label className="check" htmlFor="ov-on"><input id="ov-on" type="checkbox" checked=${overlay} onChange=${function (ev) { setOverlay(ev.target.checked); }} />Show overlay</label>
            <label className="range-label" htmlFor="ov-str">Strength<input id="ov-str" type="range" min="0.2" max="1" step="0.05" value=${strength} onChange=${function (ev) { setStrength(parseFloat(ev.target.value)); }} /></label>
          </div>
          <${DV.RegionBars} regions=${result.regions} />
          ${result.engine === 'demo' && html`<p className="foot-note">Demo engine: region positions are illustrative and are not located on your photo.</p>`}
        </section>
      </div>`}
    </div>`;
  };

  DV.VideoPage = function VideoPage(p) {
    var a = useState(null), file = a[0], setFile = a[1];
    var b = useState(''), preview = b[0], setPreview = b[1];
    var c = useState(null), busy = c[0], setBusy = c[1];
    var d = useState(null), result = d[0], setResult = d[1];
    var e = useState(''), error = e[0], setError = e[1];
    var f = useState(0), sel = f[0], setSel = f[1];
    var vref = useRef(null);

    function worst(res) {
      var best = 0;
      res.frames.forEach(function (fr, i) { if (fr.risk > res.frames[best].risk) best = i; });
      return best;
    }
    function run(fl) {
      setError(''); setResult(null); setFile(fl);
      var url = URL.createObjectURL(fl);
      setPreview(url); setBusy({ label: 'Reading the video', fraction: 0.03 });
      DV.analyzeVideo(fl, p.settings, function (label, fraction) { setBusy({ label: label, fraction: fraction }); })
        .then(function (res) { res.previewUrl = url; setResult(res); setSel(worst(res)); setBusy(null); p.onResult(res); })
        .catch(function (err) { setBusy(null); setError(err.message || 'The analysis failed. Try again.'); });
    }
    function demo() {
      setError(''); setFile(null); setPreview('');
      setBusy({ label: 'Preparing the demo clip', fraction: 0.4 });
      setTimeout(function () {
        try {
          var res = DV.makeDemoVideo(p.settings);
          setResult(res); setSel(worst(res)); setBusy(null); p.onResult(res);
        } catch (err) { setBusy(null); setError('Could not build the demo clip in this browser.'); }
      }, 350);
    }
    function reset() { setFile(null); setPreview(''); setResult(null); setError(''); setBusy(null); }
    function seek(t) {
      var v = vref.current;
      if (v) { try { v.currentTime = t; v.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); } catch (err) {} }
    }

    var v = result ? DV.verdictFor(result.risk, result.threshold) : null;
    var fr = result ? result.frames[Math.min(sel, result.frames.length - 1)] : null;

    return html`<div className="page">
      <${PageHead} title="Video detection" sub="Upload a video to analyse frames and find the moments that look manipulated." />
      <div className="grid-2">
        <section className="panel">
          <header className="panel-head"><h3>Upload</h3></header>
          <${DV.Dropzone} id="vid-file" kinds=${['video']} accept="video/*" disabled=${!!busy}
            title="Drag and drop your video here" hint="Supported formats: MP4, MOV, WEBM (max 500 MB)" onFiles=${function (l) { run(l[0]); }} />
          <div className="sample-row"><span className="muted small">No video at hand?</span><button type="button" className="btn btn-quiet btn-sm" disabled=${!!busy} onClick=${demo}>Load the demo timeline</button></div>
          ${busy && html`<${DV.Progress} title="Analysing video" fraction=${busy.fraction} label=${busy.label + '...'} />`}
          ${error && html`<div className="notice notice-bad" role="alert"><${DV.Icon} name="alert" size=${18} /><div><strong>Could not analyse this video</strong><p>${error}</p></div></div>`}
        </section>
        <section className="panel">
          <header className="panel-head"><h3>Preview</h3>${file && html`<span className="muted small">${file.name}</span>`}</header>
          ${preview ? html`<video ref=${vref} className="player" src=${preview} controls preload="metadata"></video>`
            : result && fr ? html`<div className="player player-demo"><img src=${fr.thumb} alt=${'Frame at ' + DV.fmtTime(fr.t)} /><span className="mono">DEMO FRAME ${DV.fmtTime(fr.t)}</span></div>`
            : html`<div className="empty"><span className="tile"><${DV.Icon} name="video" size=${24} /></span><strong>Your video appears here</strong><p>Frames are read in your browser. Nothing is uploaded in demo mode.</p></div>`}
        </section>
      </div>

      ${result && html`<div className="stack">
        <div className="grid-2">
          <section className="panel">
            <header className="panel-head"><h3>Analysis results</h3><${EnginePill} engine=${result.engine} /></header>
            <div className=${'verdict-box tone-bg-' + v.tone}>
              <${DV.Icon} name=${v.tone === 'ok' ? 'check' : 'alert'} size=${22} />
              <div><strong>${v.label}</strong><span>${result.name}</span></div>
            </div>
            <div className="res-row">
              <${DV.ScoreRing} value=${result.risk} tone=${v.tone} sub="Manipulation" label="Manipulation score" />
              <dl className="kv kv-tight">
                <${Row} k="Confidence" num=${true}>${result.confidence}%<//>
                <${Row} k="Frames analysed" num=${true}>${result.frames.length}<//>
                <${Row} k="Duration" num=${true}>${DV.fmtTime(result.duration)}<//>
                <${Row} k="Flagged segments" num=${true}>${result.segments.length}<//>
              </dl>
            </div>
            <p className="result-sum">${DV.describe(result)}</p>
            <${ResultActions} res=${result} onOpenReport=${p.onOpenReport} onReset=${reset} />
          </section>
          <section className="panel">
            <header className="panel-head"><h3>Suspicious timeline</h3></header>
            <${DV.TimelineBar} frames=${result.frames} duration=${result.duration} threshold=${result.threshold} selected=${sel} onSelect=${setSel} />
            <h4 className="h4">Flagged segments</h4>
            ${result.segments.length ? html`<ul className="seg-list">
              ${result.segments.map(function (s, i) {
                return html`<li key=${i}><button type="button" className="seg-item" onClick=${function () { setSel(s.frames[0]); seek(s.start); }}>
                  <i className=${'sw lvl-' + s.level}></i>
                  <span className="mono">${DV.fmtTime(s.start)} - ${DV.fmtTime(s.end)}</span>
                  <${DV.Pill} tone=${s.level === 'high' ? 'bad' : 'warn'}>${s.level === 'high' ? 'High risk' : 'Medium risk'}<//>
                  <span className="muted small num">peak ${s.peak}%</span>
                </button></li>`;
              })}
            </ul>` : html`<p className="muted">No segment crossed the threshold.</p>`}
          </section>
        </div>

        <section className="panel">
          <header className="panel-head"><h3>Frame analysis</h3><span className="muted small">Select a frame to inspect it</span></header>
          <div className="frame-grid">
            ${result.frames.map(function (f) {
              var lv = DV.levelFor(f.risk, result.threshold);
              return html`<button key=${f.i} type="button" className=${'frame lvl-' + lv + (sel === f.i ? ' is-selected' : '')} onClick=${function () { setSel(f.i); }}>
                <img src=${f.thumb} alt=${'Frame at ' + DV.fmtTime(f.t)} />
                <span className="frame-meta mono"><span>${DV.fmtTime(f.t)}</span><strong>${f.risk}%</strong></span>
              </button>`;
            })}
          </div>
        </section>

        <div className="grid-2">
          <section className="panel">
            <header className="panel-head"><h3>Frame scores</h3></header>
            <${DV.FrameChart} frames=${result.frames} duration=${result.duration} threshold=${result.threshold} selected=${sel} onSelect=${setSel} />
          </section>
          <section className="panel">
            <header className="panel-head"><h3>Attention map, ${fr ? DV.fmtTime(fr.t) : ''}</h3>${fr && html`<${DV.Pill} tone=${DV.verdictFor(fr.risk, result.threshold).tone}>risk ${fr.risk}%<//>`}</header>
            <div className="heat-wrap heat-wide">${fr && html`<${DV.Heatmap} src=${fr.thumb} regions=${fr.regions} ratio=${0.5625} label=${'Attention map for the frame at ' + DV.fmtTime(fr.t)} />`}</div>
            <${DV.HeatLegend} />
          </section>
        </div>
      </div>`}
    </div>`;
  };

  DV.BatchPage = function BatchPage(p) {
    var a = useState([]), items = a[0], setItems = a[1];
    var b = useState(false), running = b[0], setRunning = b[1];
    var f = useFlash(), msg = f[0], flash = f[1];

    function update(id, patch) {
      setItems(function (list) { return list.map(function (it) { return it.id === id ? Object.assign({}, it, patch) : it; }); });
    }
    function add(files) {
      setItems(function (list) {
        return list.concat(files.map(function (fl) {
          return { id: DV.uid('b'), file: fl, kind: fl.type.indexOf('video') === 0 ? 'video' : 'image', status: 'queued', res: null, err: '' };
        }));
      });
    }
    function runAll() {
      if (running) return;
      setRunning(true);
      var queue = items.filter(function (it) { return it.status === 'queued' || it.status === 'error'; });
      var chain = Promise.resolve();
      queue.forEach(function (it) {
        chain = chain.then(function () {
          update(it.id, { status: 'running', err: '' });
          var job = it.kind === 'video' ? DV.analyzeVideo(it.file, p.settings) : DV.analyzeImage(it.file, p.settings);
          return job.then(function (res) { update(it.id, { status: 'done', res: res }); p.onResult(res); })
            .catch(function (err) { update(it.id, { status: 'error', err: err.message || 'Failed' }); });
        });
      });
      chain.then(function () { setRunning(false); });
    }
    var done = items.filter(function (i) { return i.res; });
    var counts = { real: 0, suspicious: 0, fake: 0 };
    done.forEach(function (i) { counts[DV.verdictFor(i.res.risk, i.res.threshold).key]++; });
    var pending = items.filter(function (i) { return i.status === 'queued' || i.status === 'error'; }).length;
    var csv = DV.csv(done.map(function (i) { return i.res; }));
    var statusTone = { queued: 'neutral', running: 'warn', done: 'ok', error: 'bad' };

    return html`<div className="page">
      <${PageHead} title="Batch processing" sub="Queue many images and videos, analyse them in one run and export the results." />
      <section className="panel">
        <header className="panel-head"><h3>Queue</h3>
          <div className="actions">
            <button type="button" className="btn btn-primary btn-sm" disabled=${running || !pending} onClick=${runAll}>${running ? 'Analysing...' : 'Analyse ' + (pending || '') + ' file' + (pending === 1 ? '' : 's')}</button>
            <button type="button" className="btn btn-quiet btn-sm" disabled=${running || !items.length} onClick=${function () { setItems([]); }}>Clear queue</button>
          </div>
        </header>
        <${DV.Dropzone} id="batch-files" kinds=${['image', 'video']} accept="image/jpeg,image/png,image/webp,video/*" multiple=${true} compact=${items.length > 0}
          title="Drag and drop images or videos here" hint="JPG, PNG, WEBP up to 10 MB. MP4, MOV, WEBM up to 500 MB." onFiles=${add} />
        ${items.length > 0 && html`<div className="table-wrap"><table className="table">
          <thead><tr><th>File</th><th>Type</th><th>Size</th><th>Status</th><th>Verdict</th><th className="num-col">Risk</th></tr></thead>
          <tbody>
            ${items.map(function (it) {
              var v = it.res ? DV.verdictFor(it.res.risk, it.res.threshold) : null;
              return html`<tr key=${it.id}>
                <td className="cell-file">${it.file.name}${it.err && html`<span className="cell-err">${it.err}</span>`}</td>
                <td>${it.kind}</td><td className="num">${DV.fmtBytes(it.file.size)}</td>
                <td><${DV.Pill} tone=${statusTone[it.status]}>${it.status}<//></td>
                <td>${v ? html`<${DV.Pill} tone=${v.tone}>${v.label}<//>` : '-'}</td>
                <td className="num-col num">${it.res ? it.res.risk + '%' : '-'}</td>
              </tr>`;
            })}
          </tbody></table></div>`}
      </section>
      ${done.length > 0 && html`<section className="panel">
        <header className="panel-head"><h3>Summary</h3>
          <div className="actions">
            <button type="button" className="btn btn-ghost btn-sm" onClick=${function () { copyText(csv, function (ok) { flash(ok ? 'CSV copied.' : 'Copy is not available here.'); }); }}><${DV.Icon} name="copy" size=${16} />Copy CSV</button>
            <button type="button" className="btn btn-ghost btn-sm" onClick=${function () { try { DV.saveText('deepverify-batch.csv', csv, 'text/csv'); } catch (e) { flash('Download is not available here.'); } }}><${DV.Icon} name="download" size=${16} />Download CSV</button>
            <span className="flash" role="status">${msg}</span>
          </div>
        </header>
        <div className="grid-4 tally">
          <div className="tile-stat"><span>Analysed</span><strong>${done.length}</strong></div>
          <div className="tile-stat tone-ok"><span>Likely real</span><strong>${counts.real}</strong></div>
          <div className="tile-stat tone-warn"><span>Suspicious</span><strong>${counts.suspicious}</strong></div>
          <div className="tile-stat tone-bad"><span>Likely manipulated</span><strong>${counts.fake}</strong></div>
        </div>
      </section>`}
    </div>`;
  };

  function ReportDetail(p) {
    var res = p.res, v = DV.verdictFor(res.risk, res.threshold);
    var f = useFlash(), msg = f[0], flash = f[1];
    var keyFrames = res.kind === 'video' ? res.frames.slice().sort(function (a, b) { return b.risk - a.risk; }).slice(0, 5).sort(function (a, b) { return a.t - b.t; }) : [];
    var fallbackSeed = DV.hashStr(res.name) % 9 + 1;
    return html`<div className="page">
      <${PageHead} title="Detection report" sub=${res.name + ' · ' + DV.fmtDate(res.createdAt)}>
        <div className="actions">
          <button type="button" className="btn btn-quiet btn-sm" onClick=${p.onBack}><${DV.Icon} name="back" size=${16} />All reports</button>
          <button type="button" className="btn btn-primary btn-sm" onClick=${function () { try { DV.saveText('deepverify-report-' + res.id + '.txt', DV.reportText(res)); } catch (e) { flash('Download is not available here.'); } }}><${DV.Icon} name="download" size=${16} />Download report</button>
          <button type="button" className="btn btn-ghost btn-sm" onClick=${function () { copyText(DV.reportText(res), function (ok) { flash(ok ? 'Report copied.' : 'Copy is not available here.'); }); }}><${DV.Icon} name="copy" size=${16} />Copy summary</button>
          <span className="flash" role="status">${msg}</span>
        </div>
      <//>
      <div className=${'banner tone-bg-' + v.tone}>
        <span className="banner-icon"><${DV.Icon} name=${v.tone === 'ok' ? 'check' : 'alert'} size=${26} /></span>
        <div className="banner-main"><strong>${v.label}</strong><span>${res.prediction === 'Fake' ? 'Signs of manipulation were detected.' : 'No strong signs of manipulation were detected.'}</span></div>
        <div className="banner-stat"><span>Overall risk score</span><strong className="num">${res.risk}%</strong></div>
        <div className="banner-stat"><span>Confidence</span><strong className="num">${res.confidence}%</strong></div>
        ${res.isExample && html`<${DV.Pill} tone="neutral">Example report<//>`}
      </div>

      <div className="grid-2">
        <section className="panel">
          <header className="panel-head"><h3>Summary</h3><${EnginePill} engine=${res.engine} /></header>
          <p className="result-sum">${DV.describe(res)}</p>
          <dl className="kv kv-tight">
            <${Row} k="Type">${res.kind}<//>
            <${Row} k="Prediction">${res.prediction}<//>
            <${Row} k="Authenticity score" num=${true}>${res.authenticity}%<//>
            <${Row} k="Decision threshold" num=${true}>${res.threshold}<//>
          </dl>
        </section>
        ${res.kind === 'video' ? html`<section className="panel">
          <header className="panel-head"><h3>Suspicious timestamps</h3></header>
          ${res.segments.length ? html`<ul className="seg-list">${res.segments.map(function (s, i) {
            return html`<li key=${i} className="seg-static"><i className=${'sw lvl-' + s.level}></i><span className="mono">${DV.fmtTime(s.start)} - ${DV.fmtTime(s.end)}</span><${DV.Pill} tone=${s.level === 'high' ? 'bad' : 'warn'}>${s.level === 'high' ? 'High risk' : 'Medium risk'}<//><span className="muted small num">peak ${s.peak}%</span></li>`;
          })}</ul>` : html`<p className="muted">No segment crossed the threshold.</p>`}
          <${DV.TimelineBar} frames=${res.frames} duration=${res.duration} threshold=${res.threshold} />
        </section>` : html`<section className="panel">
          <header className="panel-head"><h3>Region influence</h3></header>
          <${DV.RegionBars} regions=${res.regions} />
          ${res.methods && res.methods.length ? html`<p className="foot-note">Closest manipulation family: ${res.methods.map(function (m) { return m.name + ' ' + m.p + '%'; }).join(', ')}.</p>` : ''}
        </section>`}
      </div>

      ${res.kind === 'video' ? html`<div className="grid-2">
        <section className="panel">
          <header className="panel-head"><h3>Attention map, key frames</h3></header>
          <div className="keyframes">${keyFrames.map(function (fr) {
            return html`<figure key=${fr.i}><${DV.Heatmap} src=${fr.thumb} regions=${fr.regions} ratio=${0.5625} label=${'Attention map at ' + DV.fmtTime(fr.t)} /><figcaption className="mono">${DV.fmtTime(fr.t)} · ${fr.risk}%</figcaption></figure>`;
          })}</div>
          <${DV.HeatLegend} />
        </section>
        <section className="panel">
          <header className="panel-head"><h3>Frame scores</h3></header>
          <${DV.FrameChart} frames=${res.frames} duration=${res.duration} threshold=${res.threshold} />
        </section>
      </div>` : html`<section className="panel">
        <header className="panel-head"><h3>Attention map</h3></header>
        <div className="heat-wrap heat-narrow"><${DV.Heatmap} src=${res.previewUrl} seed=${fallbackSeed} regions=${res.regions} label="Attention map" /></div>
        <${DV.HeatLegend} />
        ${!res.previewUrl && html`<p className="foot-note">The original image is not stored, so the map is drawn on a placeholder portrait.</p>`}
      </section>`}

      <${DV.ModelPanel} />
      <p className="foot-note">This report is an AI-assisted estimate, not forensic proof. Verify important media with a human reviewer.</p>
    </div>`;
  }

  DV.ReportsPage = function ReportsPage(p) {
    var a = useState([]), examples = a[0], setExamples = a[1];
    var b = useState(false), confirm = b[0], setConfirm = b[1];
    useEffect(function () { if (!p.history.length) setExamples(DV.makeExamples(p.settings)); }, [p.history.length]);
    var list = p.history.length ? p.history : examples;
    var open = list.filter(function (r) { return r.id === p.reportId; })[0] || (p.reportId ? p.history.filter(function (r) { return r.id === p.reportId; })[0] : null);
    if (open) return html`<${ReportDetail} res=${open} onBack=${function () { p.onSelect(''); }} />`;

    return html`<div className="page">
      <${PageHead} title="Reports" sub="Every analysis is saved here in this browser, so you can reopen it or export it.">
        ${p.history.length > 0 && html`<div className="actions">${confirm
          ? html`<span className="small">Delete all saved reports?</span><button type="button" className="btn btn-danger btn-sm" onClick=${function () { p.onClear(); setConfirm(false); }}>Yes, delete</button><button type="button" className="btn btn-quiet btn-sm" onClick=${function () { setConfirm(false); }}>Cancel</button>`
          : html`<button type="button" className="btn btn-quiet btn-sm" onClick=${function () { setConfirm(true); }}><${DV.Icon} name="trash" size=${16} />Clear all</button>`}</div>`}
      <//>
      <section className="panel">
        ${!p.history.length && html`<div className="notice notice-info"><${DV.Icon} name="file" size=${18} /><div><strong>These are example reports</strong><p>Run an analysis and it will be saved here. <a href="#image">Analyse an image</a> or <a href="#video">a video</a>.</p></div></div>`}
        <div className="table-wrap"><table className="table">
          <thead><tr><th>File</th><th>Type</th><th>Analysed</th><th>Verdict</th><th className="num-col">Risk</th><th><span className="sr-only">Actions</span></th></tr></thead>
          <tbody>
            ${list.map(function (r) {
              var v = DV.verdictFor(r.risk, r.threshold);
              return html`<tr key=${r.id}>
                <td className="cell-file">${r.name}${r.isExample && html`<${DV.Pill} tone="neutral">Example<//>`}</td>
                <td>${r.kind}</td><td className="num">${DV.fmtDate(r.createdAt)}</td>
                <td><${DV.Pill} tone=${v.tone}>${v.label}<//></td>
                <td className="num-col num">${r.risk}%</td>
                <td className="cell-actions">
                  <button type="button" className="btn btn-ghost btn-sm" onClick=${function () { p.onSelect(r.id); }}>Open</button>
                  ${!r.isExample && html`<button type="button" className="icon-btn" aria-label=${'Delete report for ' + r.name} onClick=${function () { p.onDelete(r.id); }}><${DV.Icon} name="trash" size=${16} /></button>`}
                </td>
              </tr>`;
            })}
          </tbody></table></div>
      </section>
    </div>`;
  };

  var CURL = 'curl -X POST https://YOUR-HOST/api/v1/detect/image \\\n  -H "Authorization: Bearer YOUR_KEY" \\\n  -F "file=@photo.jpg"';
  var JS_SNIPPET = 'const fd = new FormData();\nfd.append("file", fileInput.files[0]);\nconst res = await fetch("https://YOUR-HOST/api/v1/detect/video", {\n  method: "POST",\n  headers: { Authorization: "Bearer YOUR_KEY" },\n  body: fd\n});\nconst { risk_score, frames } = await res.json();';

  function Code(p) {
    var f = useFlash(), msg = f[0], flash = f[1];
    return html`<div className="code">
      <div className="code-top"><span className="mono">${p.label}</span>
        <button type="button" className="btn btn-quiet btn-sm" onClick=${function () { copyText(p.text, function (ok) { flash(ok ? 'Copied' : 'Select and copy'); }); }}><${DV.Icon} name="copy" size=${14} />${msg || 'Copy'}</button></div>
      <pre><code>${p.text}</code></pre>
    </div>`;
  }

  DV.SettingsPage = function SettingsPage(p) {
    var s = p.settings;
    var a = useState(false), confirm = a[0], setConfirm = a[1];
    function set(k, v) { var o = {}; o[k] = v; p.onSettings(Object.assign({}, s, o)); }
    var bands = [Math.max(0, s.threshold - 15), s.threshold + 10];
    return html`<div className="page">
      <${PageHead} title="Settings" sub="Tune the decision threshold, connect a model API and manage saved data." />
      <div className="grid-2">
        <section className="panel">
          <header className="panel-head"><h3>Detection sensitivity</h3></header>
          <label className="range-block" htmlFor="thr">
            <span className="range-top"><span>Decision threshold</span><strong className="num">${s.threshold}</strong></span>
            <input id="thr" type="range" min="30" max="70" step="1" value=${s.threshold} onChange=${function (ev) { set('threshold', parseInt(ev.target.value, 10)); }} />
            <span className="range-ends muted small"><span>More sensitive</span><span>Fewer false alarms</span></span>
          </label>
          <p className="muted small">Risk below ${bands[0]} reads as likely real, ${bands[0]} to ${bands[1] - 1} as suspicious, ${bands[1]} and above as likely manipulated. Reports keep the threshold they were made with.</p>
          <h4 className="h4">Theme</h4>
          <div className="seg-control" role="radiogroup" aria-label="Theme">
            ${['system', 'light', 'dark'].map(function (t) {
              return html`<button key=${t} type="button" role="radio" aria-checked=${s.theme === t} className=${s.theme === t ? 'is-on' : ''} onClick=${function () { set('theme', t); }}>${t[0].toUpperCase() + t.slice(1)}</button>`;
            })}
          </div>
        </section>
        <section className="panel">
          <header className="panel-head"><h3>Detection engine</h3></header>
          <div className="seg-control" role="radiogroup" aria-label="Engine">
            <button type="button" role="radio" aria-checked=${s.mode === 'demo'} className=${s.mode === 'demo' ? 'is-on' : ''} onClick=${function () { set('mode', 'demo'); }}>Demo engine</button>
            <button type="button" role="radio" aria-checked=${s.mode === 'api'} className=${s.mode === 'api' ? 'is-on' : ''} onClick=${function () { set('mode', 'api'); }}>Connect an API</button>
          </div>
          ${s.mode === 'demo'
            ? html`<p className="muted small">The demo engine simulates scores so you can test the whole flow. Frames are still read from your video in the browser. Connect your trained model to get real predictions.</p>`
            : html`<div className="fields">
                <label htmlFor="api-base">API address</label>
                <input id="api-base" type="url" placeholder="https://your-host.example" value=${s.apiBase} onChange=${function (ev) { set('apiBase', ev.target.value.trim()); }} />
                <label htmlFor="api-key">API key (kept in memory only)</label>
                <input id="api-key" type="password" autoComplete="off" placeholder="Optional" value=${s.apiKey} onChange=${function (ev) { set('apiKey', ev.target.value); }} />
                ${!s.apiBase && html`<p className="muted small">Enter an address to switch analysis over to your API. Until then the demo engine is used.</p>`}
              </div>`}
        </section>
      </div>

      <section className="panel">
        <header className="panel-head"><h3>API contract</h3><${DV.Pill} tone="neutral">For your backend<//></header>
        <p className="muted">When an API address is set, the front end sends the file as multipart form data and expects these JSON responses. The same endpoints serve businesses who integrate detection into their own systems.</p>
        <div className="grid-2 code-grid">
          <${Code} label="Request, image (curl)" text=${CURL} />
          <${Code} label="Request, video (JavaScript)" text=${JS_SNIPPET} />
          <${Code} label="Response, image" text=${JSON.stringify(DV.API_CONTRACT.image.response, null, 2)} />
          <${Code} label="Response, video" text=${JSON.stringify(DV.API_CONTRACT.video.response, null, 2)} />
        </div>
      </section>

      <section className="panel">
        <header className="panel-head"><h3>Saved data</h3></header>
        <p className="muted">Reports are stored in this browser only. Uploaded files are never saved.</p>
        <div className="actions">${confirm
          ? html`<span className="small">Delete all saved reports?</span><button type="button" className="btn btn-danger btn-sm" onClick=${function () { p.onClearHistory(); setConfirm(false); }}>Yes, delete</button><button type="button" className="btn btn-quiet btn-sm" onClick=${function () { setConfirm(false); }}>Cancel</button>`
          : html`<button type="button" className="btn btn-ghost btn-sm" onClick=${function () { setConfirm(true); }}><${DV.Icon} name="trash" size=${16} />Delete saved reports</button>`}
        </div>
      </section>
    </div>`;
  };
})();
