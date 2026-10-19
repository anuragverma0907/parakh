/* DeepVerify engine
 * ------------------------------------------------------------------
 * Everything that is not UI lives here: settings, storage, the
 * analysis pipeline, report builders.
 *
 * DEMO ENGINE: until a trained model is connected, scores are simulated
 * deterministically from the file (same file -> same result). Frame
 * extraction from videos is real. To connect a real model, open
 * Settings > "Connect an API" and implement the two endpoints
 * documented in DV.API_CONTRACT below.
 */
(function () {
  'use strict';
  var DV = (window.DV = window.DV || {});

  /* ---------- small utilities ---------- */
  DV.clamp = function (n, a, b) { return Math.min(b, Math.max(a, n)); };
  DV.sleep = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
  DV.uid = function (p) { return p + '_' + Date.now().toString(36) + Math.floor(Math.random() * 1e6).toString(36); };
  DV.fmtTime = function (s) {
    s = Math.max(0, Math.round(s));
    var m = Math.floor(s / 60), x = s % 60;
    return (m < 10 ? '0' : '') + m + ':' + (x < 10 ? '0' : '') + x;
  };
  DV.fmtBytes = function (n) {
    if (!n && n !== 0) return '';
    if (n < 1024) return n + ' B';
    if (n < 1048576) return (n / 1024).toFixed(0) + ' KB';
    if (n < 1073741824) return (n / 1048576).toFixed(1) + ' MB';
    return (n / 1073741824).toFixed(2) + ' GB';
  };
  DV.fmtDate = function (ts) {
    try {
      return new Date(ts).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
    } catch (e) { return ''; }
  };

  function hashStr(s) {
    var h = 2166136261;
    for (var i = 0; i < s.length; i++) { h = Math.imul(h ^ s.charCodeAt(i), 16777619); }
    return h >>> 0;
  }
  function rng(seed) {
    var a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  DV.hashStr = hashStr;

  /* ---------- settings + history (localStorage, always guarded) ---------- */
  var DEFAULTS = { threshold: 50, mode: 'demo', apiBase: '', apiKey: '', theme: 'system' };
  DV.DEFAULT_SETTINGS = DEFAULTS;
  DV.loadSettings = function () {
    try {
      var raw = localStorage.getItem('dv.settings.v1');
      return Object.assign({}, DEFAULTS, raw ? JSON.parse(raw) : {}, { apiKey: '' });
    } catch (e) { return Object.assign({}, DEFAULTS); }
  };
  DV.saveSettings = function (s) {
    try {
      var copy = Object.assign({}, s); delete copy.apiKey; // keys are never written to disk
      localStorage.setItem('dv.settings.v1', JSON.stringify(copy));
    } catch (e) { /* storage unavailable: the page still works */ }
  };
  DV.loadHistory = function () {
    try {
      var raw = localStorage.getItem('dv.history.v1');
      return raw ? JSON.parse(raw) : [];
    } catch (e) { return []; }
  };
  DV.saveHistory = function (list) {
    try {
      var slim = list.slice(0, 40).map(function (r) {
        var c = Object.assign({}, r);
        delete c.previewUrl;
        if (c.frames) c.frames = c.frames.map(function (f) { return { i: f.i, t: f.t, risk: f.risk, regions: f.regions }; });
        return c;
      });
      localStorage.setItem('dv.history.v1', JSON.stringify(slim));
    } catch (e) { /* ignore quota or privacy-mode errors */ }
  };

  /* ---------- model facts shown in the UI (SAMPLE values) ---------- */
  DV.METHODS = ['Deepfakes', 'Face2Face', 'FaceSwap', 'NeuralTextures'];
  DV.MODEL = {
    isSample: true,
    name: 'DeepVerify MVP',
    version: '0.1-demo',
    dataset: 'FaceForensics++',
    metrics: { accuracy: 94.2, precision: 91.7, recall: 88.9, f1: 90.3, auc: 0.96 },
    robustness: [
      { label: 'JPEG compression (quality 40)', drop: 4.2 },
      { label: 'Gaussian blur (sigma 2)', drop: 6.8 },
      { label: 'Resize to 50% and back', drop: 5.1 },
      { label: 'Gaussian noise (sigma 0.02)', drop: 7.4 }
    ]
  };

  DV.API_CONTRACT = {
    image: {
      request: 'POST /api/v1/detect/image  (multipart/form-data, field "file")',
      response: { prediction: 'fake', confidence: 0.87, risk_score: 68, elapsed_ms: 1840,
        regions: [{ name: 'Eye area', influence: 0.82, x: 0.5, y: 0.39, r: 0.13 }] }
    },
    video: {
      request: 'POST /api/v1/detect/video  (multipart/form-data, field "file")',
      response: { risk_score: 68, confidence: 0.87, duration: 48.0,
        frames: [{ t: 2.0, risk: 14 }, { t: 6.0, risk: 81 }] }
    }
  };

  /* ---------- verdict helpers ---------- */
  DV.verdictFor = function (risk, threshold) {
    var t = threshold == null ? 50 : threshold;
    if (risk < t - 15) return { key: 'real', label: 'Likely Real', short: 'Authentic', tone: 'ok' };
    if (risk < t + 10) return { key: 'suspicious', label: 'Suspicious', short: 'Suspicious', tone: 'warn' };
    return { key: 'fake', label: 'Likely Manipulated', short: 'Manipulated', tone: 'bad' };
  };
  DV.levelFor = function (risk, threshold) {
    var t = threshold == null ? 50 : threshold;
    if (risk < t - 10) return 'low';
    if (risk < t + 10) return 'medium';
    return 'high';
  };
  function confOf(risk) { return Math.round(DV.clamp(50 + Math.abs(risk - 50) * 0.9, 50, 99)); }

  /* ---------- face regions (attention map) ---------- */
  var REGION_DEFS = [
    { name: 'Eye area', x: 0.5, y: 0.39, r: 0.13 },
    { name: 'Mouth region', x: 0.5, y: 0.55, r: 0.09 },
    { name: 'Jawline and face edge', x: 0.5, y: 0.61, r: 0.12 },
    { name: 'Skin texture (cheeks)', x: 0.37, y: 0.49, r: 0.09 },
    { name: 'Hairline and forehead', x: 0.5, y: 0.27, r: 0.11 },
    { name: 'Nose bridge', x: 0.5, y: 0.46, r: 0.07 }
  ];
  function regionsFor(seed, risk, wide) {
    var r = rng(seed ^ 0x51ed270b);
    var out = REGION_DEFS.map(function (d) {
      var base = r() * 0.4;
      var boost = (risk / 100) * (0.25 + r() * 0.6);
      var inf = DV.clamp(base * (1 - risk / 160) + boost, 0.05, 0.98);
      var x = d.x + (r() - 0.5) * 0.03, y = d.y + (r() - 0.5) * 0.03, rad = d.r;
      if (wide) { x = 0.5 + (x - 0.5) * 0.56; y = 0.42 + (y - 0.42) * 1.25; rad = rad * 0.56; }
      return { name: d.name, influence: Math.round(inf * 100) / 100, x: x, y: y, r: rad };
    });
    out.sort(function (a, b) { return b.influence - a.influence; });
    return out;
  }
  DV.regionsFor = regionsFor;

  function methodsFor(seed, risk) {
    if (risk < 35) return [];
    var r = rng(seed ^ 0x2545f491);
    var w = DV.METHODS.map(function () { var v = r(); return v * v + 0.05; });
    var sum = w.reduce(function (a, b) { return a + b; }, 0);
    return DV.METHODS.map(function (n, i) { return { name: n, p: Math.round((w[i] / sum) * 100) }; })
      .sort(function (a, b) { return b.p - a.p; });
  }

  /* ---------- heatmap painter (canvas) ---------- */
  DV.paintHeat = function (ctx, w, h, regions, strength) {
    regions.forEach(function (r) {
      if (r.influence < 0.18) return;
      var cx = r.x * w, cy = r.y * h;
      var rad = r.r * w * (0.9 + r.influence * 0.9);
      var a = Math.pow(r.influence, 1.2) * strength;
      var g = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad);
      g.addColorStop(0, 'rgba(226,36,36,' + a + ')');
      g.addColorStop(0.35, 'rgba(255,150,0,' + (a * 0.85) + ')');
      g.addColorStop(0.65, 'rgba(250,228,60,' + (a * 0.5) + ')');
      g.addColorStop(1, 'rgba(40,140,255,0)');
      ctx.fillStyle = g;
      ctx.fillRect(cx - rad, cy - rad, rad * 2, rad * 2);
    });
  };

  /* ---------- placeholder portraits (sample image, demo thumbnails) ---------- */
  DV.drawPortrait = function (ctx, w, h, seed) {
    var r = rng(Math.imul(seed || 1, 2654435761) >>> 0);
    function pick(a) { return a[Math.floor(r() * a.length)]; }
    var bg = pick(['#2A3C6E', '#35503F', '#5A3A52', '#2F5566']);
    var skin = pick(['#E9B896', '#CB9468', '#9A6642', '#F2CFB0']);
    var top = pick(['#1F2B4D', '#4B2F34', '#2C4B42', '#3A3A52']);
    var hair = pick(['#2B1E16', '#14110F', '#6B4A2B', '#8A8A92']);
    var g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, bg); g.addColorStop(1, '#0B1330');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    var cx = w * 0.5, headY = h * 0.42;
    var rx = Math.min(w * 0.2, h * 0.2), ry = rx * 1.3;
    ctx.fillStyle = top; ctx.beginPath();
    ctx.ellipse(cx, h * 1.0, w * 0.42, h * 0.24, 0, Math.PI, 2 * Math.PI); ctx.fill();
    ctx.fillStyle = skin; ctx.fillRect(cx - rx * 0.34, headY + ry * 0.6, rx * 0.68, h * 0.2);
    ctx.fillStyle = hair; ctx.beginPath();
    ctx.ellipse(cx, headY - ry * 0.06, rx * 1.12, ry * 1.1, 0, 0, 2 * Math.PI); ctx.fill();
    ctx.fillStyle = skin; ctx.beginPath();
    ctx.ellipse(cx, headY + ry * 0.06, rx, ry, 0, 0, 2 * Math.PI); ctx.fill();
    ctx.fillStyle = hair; ctx.beginPath();
    ctx.ellipse(cx, headY - ry * 0.62, rx * 1.02, ry * 0.42, 0, Math.PI, 2 * Math.PI); ctx.fill();
    var ey = headY - ry * 0.04, ex = rx * 0.42;
    [-1, 1].forEach(function (s) {
      ctx.fillStyle = '#F7F4EC'; ctx.beginPath();
      ctx.ellipse(cx + s * ex, ey, rx * 0.2, ry * 0.085, 0, 0, 2 * Math.PI); ctx.fill();
      ctx.fillStyle = '#2B2118'; ctx.beginPath();
      ctx.arc(cx + s * ex, ey, rx * 0.075, 0, 2 * Math.PI); ctx.fill();
      ctx.strokeStyle = hair; ctx.lineWidth = Math.max(2, rx * 0.06); ctx.beginPath();
      ctx.moveTo(cx + s * ex - rx * 0.2, ey - ry * 0.17); ctx.lineTo(cx + s * ex + rx * 0.2, ey - ry * 0.2); ctx.stroke();
    });
    ctx.strokeStyle = 'rgba(80,45,25,0.55)'; ctx.lineWidth = Math.max(1.5, rx * 0.04);
    ctx.beginPath(); ctx.moveTo(cx, ey + ry * 0.05); ctx.lineTo(cx - rx * 0.07, headY + ry * 0.32); ctx.lineTo(cx + rx * 0.08, headY + ry * 0.33); ctx.stroke();
    ctx.strokeStyle = '#8E3B3B'; ctx.lineWidth = Math.max(2, rx * 0.07); ctx.beginPath();
    ctx.moveTo(cx - rx * 0.3, headY + ry * 0.56);
    ctx.quadraticCurveTo(cx, headY + ry * 0.7, cx + rx * 0.3, headY + ry * 0.56); ctx.stroke();
  };
  DV.portraitDataUrl = function (seed, w, h) {
    var c = document.createElement('canvas'); c.width = w; c.height = h;
    DV.drawPortrait(c.getContext('2d'), w, h, seed);
    return c.toDataURL('image/jpeg', 0.8);
  };
  DV.makeSampleFile = function () {
    return new Promise(function (resolve, reject) {
      try {
        var c = document.createElement('canvas'); c.width = 600; c.height = 750;
        DV.drawPortrait(c.getContext('2d'), 600, 750, 11);
        c.toBlob(function (blob) {
          if (!blob) { reject(new Error('Could not create the sample image.')); return; }
          var f = new File([blob], 'sample-portrait.png', { type: 'image/png' });
          f.dvDemoRisk = 74;
          resolve(f);
        }, 'image/png');
      } catch (e) { reject(e); }
    });
  };

  /* ---------- file validation ---------- */
  var IMG_OK = ['image/jpeg', 'image/png', 'image/webp'];
  DV.validateFile = function (file, kinds) {
    var kind = (file.type || '').split('/')[0];
    if (kinds.indexOf(kind) === -1) {
      var want = kinds.length === 1 && kinds[0] === 'image' ? 'a JPG, PNG or WEBP image'
        : kinds.length === 1 ? 'a video file (MP4, MOV or WEBM)' : 'an image or a video';
      return '"' + file.name + '" is not supported. Choose ' + want + '.';
    }
    if (kind === 'image' && IMG_OK.indexOf(file.type) === -1) return '"' + file.name + '" is not supported. Use JPG, PNG or WEBP.';
    if (kind === 'image' && file.size > 10 * 1048576) return '"' + file.name + '" is larger than 10 MB.';
    if (kind === 'video' && file.size > 500 * 1048576) return '"' + file.name + '" is larger than 500 MB.';
    return '';
  };

  /* ---------- image analysis ---------- */
  function finishImage(o) {
    var t = o.settings.threshold;
    var seed = hashStr([o.file.name, o.file.size].join('|'));
    var risk = Math.round(o.risk);
    return {
      id: DV.uid('img'), kind: 'image', name: o.file.name, size: o.file.size, createdAt: Date.now(),
      engine: o.engine || 'demo', threshold: t, risk: risk, authenticity: 100 - risk,
      confidence: o.confidence != null ? o.confidence : confOf(risk),
      prediction: risk >= t ? 'Fake' : 'Real',
      regions: o.regions || regionsFor(seed, risk, false),
      methods: o.methods || methodsFor(seed, risk),
      elapsedMs: o.elapsedMs
    };
  }
  DV.IMAGE_STAGES = ['Reading file', 'Detecting face', 'Extracting features', 'Running classifier', 'Building attention map'];

  function mockImage(file, settings, onStage) {
    var started = Date.now();
    var p = Promise.resolve();
    DV.IMAGE_STAGES.forEach(function (label, i) {
      p = p.then(function () {
        if (onStage) onStage(i, DV.IMAGE_STAGES.length, label);
        return DV.sleep(i === 3 ? 520 : 280);
      });
    });
    return p.then(function () {
      var seed = hashStr([file.name, file.size, file.lastModified || 0].join('|'));
      var r = rng(seed);
      var b = r();
      var risk = b < 0.45 ? 5 + r() * 26 : b < 0.62 ? 36 + r() * 22 : 62 + r() * 31;
      if (typeof file.dvDemoRisk === 'number') risk = file.dvDemoRisk;
      return finishImage({ file: file, settings: settings, risk: risk, engine: 'demo', elapsedMs: Date.now() - started });
    });
  }

  function apiPost(path, file, settings) {
    var fd = new FormData(); fd.append('file', file);
    var headers = {};
    if (settings.apiKey) headers['Authorization'] = 'Bearer ' + settings.apiKey;
    return fetch(settings.apiBase.replace(/\/+$/, '') + path, { method: 'POST', body: fd, headers: headers })
      .then(function (resp) {
        if (!resp.ok) throw new Error('The API answered with status ' + resp.status + '.');
        return resp.json();
      })
      .catch(function (e) {
        if (e instanceof TypeError) throw new Error('Could not reach the API at ' + settings.apiBase + '. Check the address and the CORS settings.');
        throw e;
      });
  }
  function frac(v) { return v != null && v <= 1 ? v * 100 : v; }

  DV.analyzeImage = function (file, settings, onStage) {
    if (settings.mode === 'api' && settings.apiBase) {
      var t0 = Date.now();
      if (onStage) onStage(0, 2, 'Uploading to the API');
      return apiPost('/api/v1/detect/image', file, settings).then(function (j) {
        if (onStage) onStage(1, 2, 'Reading the result');
        var conf = j.confidence != null ? Math.round(frac(j.confidence)) : null;
        var risk = j.risk_score != null ? j.risk_score : (j.prediction === 'fake' ? (conf || 80) : 100 - (conf || 80));
        return finishImage({ file: file, settings: settings, risk: risk, confidence: conf, regions: j.regions, engine: 'api', elapsedMs: j.elapsed_ms || Date.now() - t0 });
      });
    }
    return mockImage(file, settings, onStage);
  };

  /* ---------- video analysis ---------- */
  DV.extractFrames = function (file, count, opts) {
    opts = opts || {};
    var w = opts.w || 320, h = opts.h || 180;
    return new Promise(function (resolve, reject) {
      var url = URL.createObjectURL(file);
      var v = document.createElement('video');
      var frames = [], duration = 0, idx = 0, settled = false;
      var timer;
      function fail(msg) {
        if (settled) return; settled = true; clearTimeout(timer); URL.revokeObjectURL(url); reject(new Error(msg));
      }
      function done() {
        if (settled) return; settled = true; clearTimeout(timer); URL.revokeObjectURL(url);
        resolve({ duration: duration, frames: frames, width: v.videoWidth, height: v.videoHeight });
      }
      function seekNext() {
        if (idx >= count) { done(); return; }
        v.currentTime = Math.min(Math.max(duration - 0.05, 0), (idx + 0.5) * duration / count);
      }
      timer = setTimeout(function () { fail('Reading the video took too long. Try a shorter clip.'); }, 60000);
      v.preload = 'auto'; v.muted = true; v.playsInline = true;
      v.onerror = function () { fail('This video cannot be decoded in your browser. Try an MP4 (H.264) or WebM file.'); };
      v.onloadedmetadata = function () {
        duration = v.duration;
        if (!isFinite(duration) || duration <= 0) { fail('Could not read the length of this video.'); return; }
        seekNext();
      };
      v.onseeked = function () {
        try {
          var c = document.createElement('canvas'); c.width = w; c.height = h;
          var ctx = c.getContext('2d');
          var vw = v.videoWidth || w, vh = v.videoHeight || h;
          var s = Math.max(w / vw, h / vh);
          ctx.drawImage(v, (w - vw * s) / 2, (h - vh * s) / 2, vw * s, vh * s);
          frames.push({ t: (idx + 0.5) * duration / count, thumb: c.toDataURL('image/jpeg', 0.7) });
        } catch (e) { fail('Could not capture frames from this video.'); return; }
        idx++;
        if (opts.onProgress) opts.onProgress(idx, count);
        seekNext();
      };
      v.src = url;
    });
  };

  function scoreFrames(seed, n, profile) {
    var r = rng(seed ^ 0x9e3779b9);
    var tampered = profile === 'tampered' ? true : profile === 'clean' ? false : r() > 0.42;
    var risks = [], i;
    for (i = 0; i < n; i++) risks.push(9 + r() * 18);
    if (tampered) {
      var segs = profile === 'tampered' ? 2 : (r() > 0.55 ? 2 : 1);
      for (var s = 0; s < segs; s++) {
        var len = profile === 'tampered' ? (s === 0 ? 4 : 3) : 2 + Math.floor(r() * 3);
        var start = profile === 'tampered' ? (s === 0 ? Math.round(n * 0.28) : Math.round(n * 0.78)) : Math.floor(r() * Math.max(1, n - len));
        for (i = start; i < Math.min(n, start + len); i++) {
          var edge = i === start || i === start + len - 1;
          risks[i] = edge ? 48 + r() * 16 : 70 + r() * 22;
        }
      }
    }
    return risks.map(function (v) { return Math.round(DV.clamp(v + (r() - 0.5) * 8, 2, 98)); });
  }

  DV.segmentsFrom = function (frames, duration, t) {
    var step = duration / frames.length, out = [], cur = null;
    frames.forEach(function (f) {
      var lv = DV.levelFor(f.risk, t);
      if (lv === 'low') { if (cur) { out.push(cur); cur = null; } return; }
      if (!cur) cur = { start: Math.max(0, f.t - step / 2), end: Math.min(duration, f.t + step / 2), level: lv, peak: f.risk, frames: [f.i] };
      else {
        cur.end = Math.min(duration, f.t + step / 2); cur.frames.push(f.i);
        if (lv === 'high') cur.level = 'high';
        cur.peak = Math.max(cur.peak, f.risk);
      }
    });
    if (cur) out.push(cur);
    return out;
  };

  DV.buildVideoResult = function (o) {
    var t = o.settings.threshold;
    var seed = o.seed != null ? o.seed : hashStr(o.name + '|' + o.size);
    var risks = o.risks || scoreFrames(seed, o.frames.length, o.profile);
    var frames = o.frames.map(function (f, i) {
      return { i: i, t: f.t, thumb: f.thumb, risk: risks[i], regions: regionsFor(seed + i * 131, risks[i], true) };
    });
    var sorted = risks.slice().sort(function (a, b) { return b - a; });
    var topN = Math.max(1, Math.round(sorted.length * 0.3));
    var topMean = sorted.slice(0, topN).reduce(function (a, b) { return a + b; }, 0) / topN;
    var mean = risks.reduce(function (a, b) { return a + b; }, 0) / risks.length;
    var risk = Math.round(topMean * 0.7 + mean * 0.3);
    return {
      id: DV.uid('vid'), kind: 'video', name: o.name, size: o.size, createdAt: Date.now(),
      engine: o.engine || 'demo', threshold: t, risk: risk, authenticity: 100 - risk, confidence: confOf(risk),
      prediction: risk >= t ? 'Fake' : 'Real', duration: o.duration, frames: frames,
      segments: DV.segmentsFrom(frames, o.duration, t), elapsedMs: o.elapsedMs || 0,
      width: o.width, height: o.height, isDemoMedia: !!o.isDemoMedia
    };
  };

  DV.analyzeVideo = function (file, settings, onProgress) {
    var t0 = Date.now();
    onProgress = onProgress || function () {};
    return DV.extractFrames(file, 12, {
      onProgress: function (k, n) { onProgress('Extracting frames (' + k + ' of ' + n + ')', 0.08 + 0.55 * k / n); }
    }).then(function (ex) {
      var base = { name: file.name, size: file.size, duration: ex.duration, frames: ex.frames, settings: settings, width: ex.width, height: ex.height };
      if (settings.mode === 'api' && settings.apiBase) {
        onProgress('Sending to the API', 0.7);
        return apiPost('/api/v1/detect/video', file, settings).then(function (j) {
          var risks = ex.frames.map(function (f, i) {
            var jf = (j.frames || [])[i];
            return Math.round(jf ? jf.risk : (j.risk_score || 0));
          });
          return DV.buildVideoResult(Object.assign(base, { risks: risks, engine: 'api', elapsedMs: Date.now() - t0 }));
        });
      }
      onProgress('Scoring frames', 0.7);
      return DV.sleep(500).then(function () {
        onProgress('Building the timeline', 0.9);
        return DV.sleep(300);
      }).then(function () {
        return DV.buildVideoResult(Object.assign(base, { engine: 'demo', elapsedMs: Date.now() - t0 }));
      });
    });
  };

  /* Demo clip: synthetic frames, no file needed */
  DV.makeDemoVideo = function (settings) {
    var n = 12, duration = 48, frames = [];
    for (var i = 0; i < n; i++) {
      var c = document.createElement('canvas'); c.width = 320; c.height = 180;
      DV.drawPortrait(c.getContext('2d'), 320, 180, 11);
      frames.push({ t: (i + 0.5) * duration / n, thumb: c.toDataURL('image/jpeg', 0.7) });
    }
    return DV.buildVideoResult({ name: 'demo-interview.mp4', size: 19300000, duration: duration, frames: frames, settings: settings, profile: 'tampered', seed: 4242, isDemoMedia: true, elapsedMs: 2100 });
  };

  DV.makeExamples = function (settings) {
    var list = [];
    try {
      var vid = DV.makeDemoVideo(settings); vid.isExample = true; vid.createdAt = Date.now() - 86400000;
      var a = finishImage({ file: { name: 'example-press-photo.jpg', size: 482000 }, settings: settings, risk: 14, engine: 'demo', elapsedMs: 1700 });
      a.isExample = true; a.createdAt = Date.now() - 3600000 * 5; a.previewUrl = DV.portraitDataUrl(5, 480, 600);
      var b = finishImage({ file: { name: 'example-profile-picture.png', size: 311000 }, settings: settings, risk: 47, engine: 'demo', elapsedMs: 1900 });
      b.isExample = true; b.createdAt = Date.now() - 3600000 * 30; b.previewUrl = DV.portraitDataUrl(8, 480, 600);
      list = [vid, a, b];
    } catch (e) { list = []; }
    return list;
  };

  /* ---------- plain-language summaries and exports ---------- */
  DV.describe = function (res) {
    var v = DV.verdictFor(res.risk, res.threshold);
    if (res.kind === 'image') {
      var top = (res.regions || []).slice(0, 2).map(function (r) { return r.name.toLowerCase(); });
      var total = (res.regions || []).reduce(function (a, r) { return a + r.influence; }, 0) || 1;
      var share = Math.round(((res.regions || []).slice(0, 2).reduce(function (a, r) { return a + r.influence; }, 0) / total) * 100);
      if (v.key === 'real') return 'No significant signs of manipulation were found. The model\'s attention stayed spread across the face without one dominant region.';
      if (v.key === 'suspicious') return 'Some signals look inconsistent, mostly around the ' + top.join(' and the ') + '. The evidence is not strong enough for a firm call, so a manual review is recommended.';
      return 'The model found strong inconsistencies around the ' + top.join(' and the ') + ', which together drove about ' + share + '% of the decision. Treat this image as likely manipulated and check where it came from.';
    }
    var segs = res.segments || [];
    if (!segs.length) return 'No segment of the video crossed the suspicion threshold. Frame scores stayed low from start to end.';
    var first = segs[0];
    var peak = segs.reduce(function (a, s) { return Math.max(a, s.peak); }, 0);
    var where = segs.length === 1
      ? 'between ' + DV.fmtTime(first.start) + ' and ' + DV.fmtTime(first.end)
      : segs.length + ' segments, starting at ' + DV.fmtTime(first.start);
    return (v.key === 'fake' ? 'The video shows signs of manipulation, mainly ' : 'Parts of the video look inconsistent, mainly ') + where + ', with a peak frame risk of ' + peak + '%. The face region shows inconsistent texture and blending in those frames.' + (v.key === 'suspicious' ? ' Review the flagged segments by hand before drawing a conclusion.' : '');
  };

  DV.reportText = function (res) {
    var v = DV.verdictFor(res.risk, res.threshold);
    var L = [];
    L.push('DEEPVERIFY DETECTION REPORT');
    L.push('============================');
    L.push('File: ' + res.name + (res.size ? ' (' + DV.fmtBytes(res.size) + ')' : ''));
    L.push('Type: ' + res.kind);
    L.push('Analysed: ' + new Date(res.createdAt).toISOString());
    L.push('Engine: ' + (res.engine === 'api' ? 'Connected API' : 'Demo engine (simulated scores)'));
    L.push('');
    L.push('Verdict: ' + v.label);
    L.push('Prediction: ' + res.prediction);
    L.push('Risk score: ' + res.risk + '%');
    L.push('Authenticity score: ' + res.authenticity + '%');
    L.push('Confidence: ' + res.confidence + '%');
    L.push('Decision threshold: ' + res.threshold);
    L.push('');
    L.push('Summary');
    L.push(DV.describe(res));
    if (res.kind === 'video') {
      L.push(''); L.push('Suspicious segments');
      if (!res.segments.length) L.push('  none');
      res.segments.forEach(function (s) {
        L.push('  ' + DV.fmtTime(s.start) + ' - ' + DV.fmtTime(s.end) + '  ' + (s.level === 'high' ? 'High' : 'Medium') + ' risk (peak ' + s.peak + '%)');
      });
    } else {
      L.push(''); L.push('Region influence');
      res.regions.forEach(function (r) { L.push('  ' + r.name + ': ' + Math.round(r.influence * 100) + '%'); });
    }
    L.push('');
    L.push('This report is an AI-assisted estimate. It is not forensic proof; verify important media with a human reviewer.');
    return L.join('\n');
  };

  DV.csv = function (rows) {
    var head = ['file', 'type', 'size_bytes', 'verdict', 'risk_score', 'confidence', 'prediction'];
    var out = [head.join(',')];
    rows.forEach(function (r) {
      var v = DV.verdictFor(r.risk, r.threshold);
      out.push(['"' + r.name.replace(/"/g, '""') + '"', r.kind, r.size, v.label, r.risk, r.confidence, r.prediction].join(','));
    });
    return out.join('\n');
  };

  DV.saveText = function (name, text, mime) {
    var blob = new Blob([text], { type: mime || 'text/plain' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = name;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
  };
})();
