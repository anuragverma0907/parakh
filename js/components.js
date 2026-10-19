/* DeepVerify shared UI components (React via htm, no build step) */
(function () {
  'use strict';
  var DV = window.DV;
  var html = (DV.html = htm.bind(React.createElement));
  var useState = React.useState, useEffect = React.useEffect, useRef = React.useRef;

  /* ---------- icons ---------- */
  function circ(cx, cy, r) {
    return 'M' + (cx - r) + ' ' + cy + 'a' + r + ' ' + r + ' 0 1 0 ' + (2 * r) + ' 0a' + r + ' ' + r + ' 0 1 0 ' + (-2 * r) + ' 0z';
  }
  var ICONS = {
    shield: 'M12 3l7 3v5c0 5-3.2 8.2-7 10-3.8-1.8-7-5-7-10V6l7-3z M9 12l2 2 4-4',
    image: 'M4 5h16v14H4z M4 16l5-5 4 4 3-3 4 4 ' + circ(9, 9, 1.5),
    video: 'M3 6h13v12H3z M16 10l5-3v10l-5-3',
    layers: 'M12 3l9 5-9 5-9-5 9-5z M3 13l9 5 9-5 M3 17l9 5 9-5',
    file: 'M6 3h8l4 4v14H6z M14 3v4h4 M9 12h6 M9 16h6',
    sliders: 'M4 7h9 M17 7h3 M4 17h3 M11 17h9 ' + circ(15, 7, 2) + ' ' + circ(9, 17, 2),
    upload: 'M12 16V4 M7 9l5-5 5 5 M4 20h16',
    download: 'M12 4v12 M7 11l5 5 5-5 M4 20h16',
    check: 'M5 12l5 5 9-10',
    alert: 'M12 4l9 16H3L12 4z M12 10v4 M12 17h.01',
    code: 'M8 8l-5 4 5 4 M16 8l5 4-5 4 M14 5l-4 14',
    mic: 'M12 3a3 3 0 0 1 3 3v5a3 3 0 0 1-6 0V6a3 3 0 0 1 3-3z M6 11a6 6 0 0 0 12 0 M12 17v4',
    link: 'M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1 M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1',
    sun: circ(12, 12, 4) + ' M12 2v2 M12 20v2 M2 12h2 M20 12h2 M5 5l1.4 1.4 M17.6 17.6L19 19 M5 19l1.4-1.4 M17.6 6.4L19 5',
    moon: 'M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z',
    arrow: 'M5 12h14 M13 6l6 6-6 6',
    back: 'M19 12H5 M11 6l-6 6 6 6',
    play: 'M7 4l13 8-13 8V4z',
    scan: 'M4 8V5a1 1 0 0 1 1-1h3 M16 4h3a1 1 0 0 1 1 1v3 M20 16v3a1 1 0 0 1-1 1h-3 M8 20H5a1 1 0 0 1-1-1v-3 M4 12h16',
    target: circ(12, 12, 8) + ' ' + circ(12, 12, 4) + ' M12 12h.01',
    copy: 'M9 9h11v11H9z M5 15V4h11',
    trash: 'M4 7h16 M9 7V4h6v3 M6 7l1 13h10l1-13',
    clock: circ(12, 12, 9) + ' M12 7v5l3 2',
    news: 'M4 5h13v14H4z M17 9h3v8a2 2 0 0 1-2 2 M8 9h5 M8 13h5',
    building: 'M5 21V4h9v17 M14 9h5v12 M8 8h3 M8 12h3 M8 16h3',
    users: circ(9, 8, 3) + ' M3 20a6 6 0 0 1 12 0 M16 6a3 3 0 0 1 0 6 M18 20a5 5 0 0 0-3-4.6',
    verify: circ(11, 11, 7) + ' M20 20l-4-4 M8.5 11l2 2 3-3.5',
    share: circ(18, 5, 3) + ' ' + circ(6, 12, 3) + ' ' + circ(18, 19, 3) + ' M8.6 13.5l6.8 4 M15.4 6.5l-6.8 4',
    chart: 'M4 20V4 M4 20h16 M8 16v-5 M12 16V8 M16 16v-3',
    key: circ(8, 15, 4) + ' M11 12l9-9 M16 7l3 3',
    plus: 'M12 5v14 M5 12h14',
    x: 'M6 6l12 12 M18 6L6 18'
  };
  DV.Icon = function Icon(p) {
    var size = p.size || 20;
    return html`<svg className=${'icon ' + (p.className || '')} width=${size} height=${size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d=${ICONS[p.name] || ''} /></svg>`;
  };

  DV.Logo = function Logo(p) {
    var s = p.size || 34;
    return html`<span className="logo-mark" style=${{ width: s, height: s }}>
      <svg width=${s * 0.62} height=${s * 0.62} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d=${ICONS.shield} /></svg>
    </span>`;
  };

  DV.Pill = function Pill(p) {
    return html`<span className=${'pill pill-' + (p.tone || 'neutral')}>${p.children}</span>`;
  };

  /* ---------- score ring ---------- */
  DV.ScoreRing = function ScoreRing(p) {
    var size = p.size || 132, sw = 10, r = (size - sw) / 2, c = 2 * Math.PI * r;
    var v = DV.clamp(p.value, 0, 100), mid = size / 2;
    return html`<div className=${'ring tone-' + p.tone} style=${{ width: size, height: size }}>
      <svg width=${size} height=${size} viewBox=${'0 0 ' + size + ' ' + size} role="img" aria-label=${(p.label || 'Score') + ' ' + Math.round(v) + ' percent'}>
        <circle className="ring-track" cx=${mid} cy=${mid} r=${r} fill="none" strokeWidth=${sw} />
        <circle className="ring-bar" cx=${mid} cy=${mid} r=${r} fill="none" strokeWidth=${sw} strokeLinecap="round" strokeDasharray=${c} strokeDashoffset=${c * (1 - v / 100)} transform=${'rotate(-90 ' + mid + ' ' + mid + ')'} />
      </svg>
      <div className="ring-text"><strong>${Math.round(v)}%</strong><span>${p.sub}</span></div>
    </div>`;
  };

  /* ---------- heatmap on a canvas ---------- */
  DV.Heatmap = function Heatmap(p) {
    var ref = useRef(null);
    useEffect(function () {
      var c = ref.current;
      if (!c) return undefined;
      var ctx = c.getContext('2d');
      var cancelled = false;
      function paint(img) {
        var W = 480;
        var ratio = img && img.naturalWidth ? DV.clamp(img.naturalHeight / img.naturalWidth, 0.5, 1.6) : (p.ratio || 1.25);
        var H = Math.round(W * ratio);
        c.width = W; c.height = H;
        if (img) ctx.drawImage(img, 0, 0, W, H); else DV.drawPortrait(ctx, W, H, p.seed || 3);
        if (p.show !== false) DV.paintHeat(ctx, W, H, p.regions || [], p.strength == null ? 0.8 : p.strength);
      }
      if (p.src) {
        var img = new Image();
        img.onload = function () { if (!cancelled) paint(img); };
        img.onerror = function () { if (!cancelled) paint(null); };
        img.src = p.src;
      } else paint(null);
      return function () { cancelled = true; };
    }, [p.src, p.regions, p.show, p.strength, p.seed, p.ratio]);
    return html`<canvas ref=${ref} className="heat-canvas" width="480" height="600" role="img" aria-label=${p.label || 'Attention map'}></canvas>`;
  };

  DV.HeatLegend = function HeatLegend() {
    return html`<div className="heat-legend" aria-hidden="true"><span>High influence</span><i></i><span>Low influence</span></div>`;
  };

  /* ---------- progress ---------- */
  DV.Progress = function Progress(p) {
    var pct = Math.round(DV.clamp(p.fraction, 0, 1) * 100);
    return html`<div className="progress" role="status" aria-live="polite">
      <div className="progress-top"><strong>${p.title || 'Analysing'}</strong><span>${pct}%</span></div>
      <div className="progress-bar"><i style=${{ width: pct + '%' }}></i></div>
      <p className="progress-label">${p.label}</p>
    </div>`;
  };

  /* ---------- drop zone ---------- */
  DV.Dropzone = function Dropzone(p) {
    var s = useState(false), over = s[0], setOver = s[1];
    var e = useState(''), err = e[0], setErr = e[1];
    var inputRef = useRef(null);
    function take(list) {
      var files = Array.prototype.slice.call(list || []);
      if (!files.length) return;
      var good = [], msg = '';
      files.forEach(function (f) { var m = DV.validateFile(f, p.kinds); if (m) msg = m; else good.push(f); });
      setErr(msg);
      if (good.length) p.onFiles(p.multiple ? good : good.slice(0, 1));
    }
    return html`<div className=${'dropzone' + (over ? ' is-over' : '') + (p.compact ? ' is-compact' : '')}
        onDragOver=${function (ev) { ev.preventDefault(); setOver(true); }}
        onDragLeave=${function () { setOver(false); }}
        onDrop=${function (ev) { ev.preventDefault(); setOver(false); take(ev.dataTransfer.files); }}>
      <span className="dz-icon"><${DV.Icon} name="upload" size=${26} /></span>
      <p className="dz-title">${p.title}</p>
      <p className="dz-or">or</p>
      <button type="button" className="btn btn-primary btn-sm" disabled=${!!p.disabled} onClick=${function () { if (inputRef.current) inputRef.current.click(); }}>Browse files</button>
      <label className="sr-only" htmlFor=${p.id}>${p.title}</label>
      <input ref=${inputRef} id=${p.id} className="sr-only" type="file" accept=${p.accept} multiple=${!!p.multiple} tabIndex="-1"
        onChange=${function (ev) { take(ev.target.files); ev.target.value = ''; }} />
      <p className="dz-hint">${p.hint}</p>
      ${err && html`<p className="dz-error" role="alert">${err}</p>`}
    </div>`;
  };

  /* ---------- region influence bars ---------- */
  DV.RegionBars = function RegionBars(p) {
    return html`<ul className="region-bars">
      ${(p.regions || []).map(function (r) {
        var pct = Math.round(r.influence * 100);
        var tone = pct >= 65 ? 'bad' : pct >= 40 ? 'warn' : 'ok';
        return html`<li key=${r.name}>
          <span className="rb-name">${r.name}</span>
          <span className="rb-track"><i className=${'rb-fill tone-' + tone} style=${{ width: pct + '%' }}></i></span>
          <span className="rb-val">${pct}%</span>
        </li>`;
      })}
    </ul>`;
  };

  /* ---------- video timeline bar ---------- */
  DV.TimelineBar = function TimelineBar(p) {
    return html`<div className="timeline">
      <div className="tl-track" role="group" aria-label="Risk by video segment">
        ${p.frames.map(function (f) {
          var lv = DV.levelFor(f.risk, p.threshold);
          return html`<button key=${f.i} type="button" className=${'tl-seg lvl-' + lv + (p.selected === f.i ? ' is-selected' : '')}
            onClick=${function () { if (p.onSelect) p.onSelect(f.i); }}
            title=${DV.fmtTime(f.t) + ', risk ' + f.risk + '%'}
            aria-label=${'Frame at ' + DV.fmtTime(f.t) + ', risk ' + f.risk + ' percent'}></button>`;
        })}
      </div>
      <div className="tl-axis"><span>00:00</span><span>${DV.fmtTime(p.duration / 2)}</span><span>${DV.fmtTime(p.duration)}</span></div>
      <div className="tl-legend">
        <span><i className="sw lvl-low"></i>Low risk</span>
        <span><i className="sw lvl-medium"></i>Medium risk</span>
        <span><i className="sw lvl-high"></i>High risk</span>
      </div>
    </div>`;
  };

  /* ---------- frame score line chart ---------- */
  DV.FrameChart = function FrameChart(p) {
    var W = 620, H = 240, L = 40, R = 14, T = 16, B = 30;
    var frames = p.frames, dur = p.duration || 1, t = p.threshold;
    function X(s) { return L + (s / dur) * (W - L - R); }
    function Y(v) { return T + (1 - v / 100) * (H - T - B); }
    var line = frames.map(function (f) { return X(f.t) + ',' + Y(f.risk); }).join(' L');
    var area = 'M' + X(frames[0].t) + ',' + Y(0) + ' L' + line + ' L' + X(frames[frames.length - 1].t) + ',' + Y(0) + ' Z';
    var yt = [0, 25, 50, 75, 100], xt = [0, 1, 2, 3, 4, 5];
    return html`<svg className="chart" viewBox=${'0 0 ' + W + ' ' + H} role="img" aria-label="Risk score for each analysed frame">
      <rect className="chart-zone" x=${L} y=${Y(100)} width=${W - L - R} height=${Y(t + 10) - Y(100)} />
      ${yt.map(function (v) { return html`<g key=${'y' + v}><line className="chart-grid" x1=${L} x2=${W - R} y1=${Y(v)} y2=${Y(v)} /><text x=${L - 8} y=${Y(v) + 4} textAnchor="end">${v}</text></g>`; })}
      ${xt.map(function (k) { var s = dur * k / 5; return html`<text key=${'x' + k} x=${X(s)} y=${H - 8} textAnchor="middle">${DV.fmtTime(s)}</text>`; })}
      <line className="chart-thr" x1=${L} x2=${W - R} y1=${Y(t)} y2=${Y(t)} />
      <text className="chart-thr-label" x=${W - R} y=${Y(t) - 5} textAnchor="end">Threshold ${t}</text>
      <path className="chart-area" d=${area} />
      <path className="chart-line" d=${'M' + line} fill="none" />
      ${frames.map(function (f) {
        var lv = DV.levelFor(f.risk, t), sel = p.selected === f.i;
        return html`<g key=${f.i} className="pt-wrap" tabIndex="0" role="button" aria-label=${'Frame at ' + DV.fmtTime(f.t) + ', risk ' + f.risk + ' percent'}
            onClick=${function () { if (p.onSelect) p.onSelect(f.i); }}
            onKeyDown=${function (ev) { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); if (p.onSelect) p.onSelect(f.i); } }}>
          <circle className=${'pt lvl-' + lv + (sel ? ' is-selected' : '')} cx=${X(f.t)} cy=${Y(f.risk)} r=${sel ? 6.5 : 4.5}><title>${DV.fmtTime(f.t) + ' - risk ' + f.risk + '%'}</title></circle>
        </g>`;
      })}
    </svg>`;
  };

  /* ---------- ROC curve (sample) ---------- */
  DV.RocChart = function RocChart(p) {
    var W = 250, H = 214, L = 36, R = 10, T = 10, B = 34;
    var k = p.auc / (1 - p.auc), pts = [];
    for (var i = 0; i <= 50; i++) { var x = i / 50; pts.push([x, 1 - Math.pow(1 - x, k)]); }
    function X(v) { return L + v * (W - L - R); }
    function Y(v) { return T + (1 - v) * (H - T - B); }
    var d = 'M' + pts.map(function (q) { return X(q[0]) + ',' + Y(q[1]); }).join(' L');
    var ticks = [0, 0.5, 1];
    return html`<svg className="chart chart-roc" viewBox=${'0 0 ' + W + ' ' + H} role="img" aria-label=${'ROC curve, area under curve ' + p.auc}>
      ${ticks.map(function (v) { return html`<g key=${v}>
        <line className="chart-grid" x1=${L} x2=${W - R} y1=${Y(v)} y2=${Y(v)} />
        <text x=${L - 6} y=${Y(v) + 4} textAnchor="end">${v}</text>
        <text x=${X(v)} y=${H - 16} textAnchor="middle">${v}</text></g>`; })}
      <line className="chart-diag" x1=${X(0)} y1=${Y(0)} x2=${X(1)} y2=${Y(1)} />
      <path className="chart-line" d=${d} fill="none" />
      <text x=${X(0.55)} y=${Y(0.32)} className="chart-note">AUC ${p.auc}</text>
      <text x=${(L + W - R) / 2} y=${H - 2} textAnchor="middle">False positive rate</text>
    </svg>`;
  };

  /* ---------- model evaluation + robustness (sample values) ---------- */
  DV.ModelPanel = function ModelPanel() {
    var m = DV.MODEL;
    var rows = [['Accuracy', m.metrics.accuracy], ['Precision', m.metrics.precision], ['Recall', m.metrics.recall], ['F1 score', m.metrics.f1]];
    return html`<div className="model-grid">
      <section className="panel">
        <header className="panel-head"><h3>Model evaluation</h3><${DV.Pill} tone="neutral">Sample values<//></header>
        <div className="model-eval">
          <dl className="kv kv-tight">
            ${rows.map(function (r) { return html`<div key=${r[0]}><dt>${r[0]}</dt><dd className="num">${r[1].toFixed(1)}%</dd></div>`; })}
          </dl>
          <${DV.RocChart} auc=${m.metrics.auc} />
        </div>
      </section>
      <section className="panel">
        <header className="panel-head"><h3>Robustness testing</h3><${DV.Pill} tone="neutral">Sample values<//></header>
        <p className="muted small">Accuracy drop after the input is degraded. Lower is better.</p>
        <ul className="robust">
          ${m.robustness.map(function (r) {
            return html`<li key=${r.label}><span className="rb-name">${r.label}</span><span className="rb-track"><i className="rb-fill tone-warn" style=${{ width: Math.min(100, r.drop * 10) + '%' }}></i></span><span className="rb-val">-${r.drop.toFixed(1)}%</span></li>`;
          })}
        </ul>
        <p className="foot-note">Placeholder figures. Replace <code>DV.MODEL</code> in <code>js/engine.js</code> with the results of your own ${m.dataset} evaluation.</p>
      </section>
    </div>`;
  };

  /* ---------- hero artwork ---------- */
  function FaceShapes() {
    return html`<g>
      <path d="M118 232c4-34 30-48 62-48s58 14 62 48z" fill="#2B3C6E" />
      <rect x="165" y="150" width="30" height="40" rx="10" fill="#D9A27E" />
      <ellipse cx="180" cy="104" rx="56" ry="66" fill="#1C1A22" />
      <ellipse cx="180" cy="112" rx="46" ry="58" fill="#E3AE88" />
      <path d="M134 100c4-30 22-44 46-44s42 14 46 44c-10-16-26-24-46-24s-36 8-46 24z" fill="#1C1A22" />
      <ellipse cx="163" cy="108" rx="9" ry="4.5" fill="#F7F4EC" /><ellipse cx="197" cy="108" rx="9" ry="4.5" fill="#F7F4EC" />
      <circle cx="163" cy="108" r="3.2" fill="#2B2118" /><circle cx="197" cy="108" r="3.2" fill="#2B2118" />
      <path d="M154 96l18-3 M188 93l18 3" stroke="#1C1A22" strokeWidth="3" strokeLinecap="round" fill="none" />
      <path d="M180 112l-5 20h11" stroke="#A9714E" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M166 146q14 9 28 0" stroke="#8E3B3B" strokeWidth="3.4" strokeLinecap="round" fill="none" />
    </g>`;
  }
  DV.FaceSplit = function FaceSplit(p) {
    var id = p.id || 'fs';
    return html`<svg className="face-split" viewBox="0 0 360 232" role="img" aria-label="A face split in two: the left half is the original, the right half shows a manipulation heat map">
      <defs>
        <clipPath id=${id + '-l'}><rect x="0" y="0" width="180" height="232" /></clipPath>
        <clipPath id=${id + '-r'}><rect x="180" y="0" width="180" height="232" /></clipPath>
        <radialGradient id=${id + '-h'}>
          <stop offset="0" stopColor="#E22424" stopOpacity="0.85" /><stop offset="0.4" stopColor="#FF9600" stopOpacity="0.6" />
          <stop offset="0.7" stopColor="#FAE43C" stopOpacity="0.3" /><stop offset="1" stopColor="#288CFF" stopOpacity="0" />
        </radialGradient>
        <linearGradient id=${id + '-bg'} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#1B2C58" /><stop offset="1" stopColor="#0B1330" /></linearGradient>
      </defs>
      <rect width="360" height="232" fill=${'url(#' + id + '-bg)'} />
      <g clipPath=${'url(#' + id + '-l)'}><${FaceShapes} /></g>
      <g clipPath=${'url(#' + id + '-r)'}>
        <${FaceShapes} />
        <g stroke="#7FE3FF" strokeOpacity="0.5" strokeWidth="0.8" fill="none">
          <ellipse cx="180" cy="112" rx="46" ry="58" /><ellipse cx="180" cy="112" rx="30" ry="58" /><ellipse cx="180" cy="112" rx="14" ry="58" />
          <path d="M134 112h92 M138 90h84 M138 134h84 M148 154h64 M150 72h60" />
        </g>
        <circle cx="180" cy="106" r="42" fill=${'url(#' + id + '-h)'} />
        <circle cx="180" cy="146" r="26" fill=${'url(#' + id + '-h)'} />
        <circle cx="158" cy="160" r="20" fill=${'url(#' + id + '-h)'} />
      </g>
      <line x1="180" y1="0" x2="180" y2="232" stroke="#FFFFFF" strokeOpacity="0.85" strokeWidth="1.5" />
      <circle cx="180" cy="116" r="9" fill="#0B1330" stroke="#FFFFFF" strokeWidth="1.5" />
      <path d="M176.5 116l2.5-2.5v5zM183.5 116l-2.5-2.5v5z" fill="#FFFFFF" />
    </svg>`;
  };

  DV.HeroVisual = function HeroVisual() {
    var nodes = [[24, 150], [120, 62], [196, 168], [292, 70], [372, 120]];
    return html`<div className="hv">
      <div className="hv-thread-box">
        <svg className="hv-thread" viewBox="0 0 420 200" aria-hidden="true">
          <defs><linearGradient id="hv-grad" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#4E9FA6" /><stop offset="0.55" stopColor="#C98A3A" /><stop offset="1" stopColor="#D2432F" /></linearGradient></defs>
          <path d="M24 150 C 60 70, 90 40, 120 62 S 170 170, 196 168 S 250 40, 292 70 S 350 140, 372 120" pathLength="1" fill="none" stroke="url(#hv-grad)" strokeWidth="3" strokeLinecap="round" />
          ${nodes.map(function (n, i) { return html`<circle key=${i} className="hv-node" cx=${n[0]} cy=${n[1]} r="6" />`; })}
        </svg>
        <span className="hv-tag mono">00:18 · risk 87%</span>
      </div>
      <div className="hv-card">
        <div className="hv-card-top"><span className="mono">SAMPLE SCAN</span><span className="hv-verdict"><${DV.Icon} name="alert" size=${14} />Manipulated · 87%</span></div>
        <${DV.FaceSplit} id="hero" />
        <div className="hv-labels mono"><span>Original</span><span>Deepfake</span></div>
      </div>
      <div className="hv-note">
        <span className="hv-note-icon"><${DV.Icon} name="target" size=${20} /></span>
        <div><strong>Why it was flagged</strong><span>Eye area and mouth region drove 74% of the decision.</span></div>
        <i className="dot dot-bad"></i>
      </div>
    </div>`;
  };
})();
