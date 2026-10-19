
(() => {
  'use strict'

  const $ = (selector, root = document) => root.querySelector(selector)
  const root = $('#root')
  const plans = { free: 5, pro: 100, business: 1000, enterprise: Infinity }
  const regionNames = {
    eyes: 'Eye area',
    mouth: 'Mouth region',
    jaw: 'Jawline / face boundary',
    skin: 'Skin texture',
    hairline: 'Hairline blending',
  }
  const navigation = [
    ['image', 'Image detection', '▧'],
    ['video', 'Video detection', '▷'],
    ['batch', 'Batch processing', '▤'],
    ['reports', 'Reports', '▱'],
    ['performance', 'Model performance', '◴'],
    ['api', 'Settings', '⚙'],
  ]
  const team = [
    ['Agrima Tripathi', 'Technical Writer'],
    ['Anurag Verma', 'Frontend Developer'],
    ['Nishu Kumari', 'Frontend Developer'],
    ['Shivang Saxena', 'Backend & Auth'],
    ['Tanu Thakur', 'Backend, Database & Auth'],
    ['Yash Gupta', 'Frontend Developer'],
    ['Charvi Goyal', 'Data Science & Database'],
    ['Aditya Verma', 'AI/ML & Backend'],
  ]
  const imageStages = ['Reading image', 'Detecting face', 'Extracting features', 'Generating example score', 'Building attention map']
  const videoStages = ['Reading video', 'Extracting frames', 'Scoring each frame', 'Locating sample segments', 'Building attention maps']
  const state = {
    theme: load('dv.theme.v2', 'light'),
    plan: load('dv.plan', 'free'),
    usage: load('dv.usage', { date: today(), count: 0 }),
    history: load('dv.history', []),
    user: load('dv.user', null),
    result: null,
    busy: null,
    error: '',
    batch: [],
    batchBusy: false,
    videoFile: null,
    heatMode: 'heat',
    heatOpacity: 0.6,
    modal: '',
  }

  if (!state.usage || state.usage.date !== today()) state.usage = { date: today(), count: 0 }
  document.documentElement.setAttribute('data-theme', state.theme)

  function load(key, fallback) {
    try {
      const value = localStorage.getItem(key)
      return value ? JSON.parse(value) : fallback
    } catch (error) {
      console.warn(`Could not read ${key} from browser storage.`, error)
      return fallback
    }
  }

  function save(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value))
      return true
    } catch (error) {
      console.warn(`Could not save ${key} to browser storage.`, error)
      return false
    }
  }

  function today() {
    return new Date().toISOString().slice(0, 10)
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, (character) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    })[character])
  }

  function icon(name, size = 18) {
    const paths = {
      image: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="1.5"/><path d="m21 16-5-5-8 8"/>',
      video: '<rect x="3" y="6" width="13" height="12" rx="2"/><path d="m16 10 5-3v10l-5-3"/>',
      layers: '<path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m3 13 9 5 9-5"/>',
      file: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z"/><path d="M14 3v5h5M9 13h6M9 17h6"/>',
      upload: '<path d="M12 16V4m0 0L8 8m4-4 4 4M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3"/>',
      alert: '<path d="M12 3 2 20h20L12 3Z"/><path d="M12 10v5M12 18v.01"/>',
      check: '<path d="m5 12 5 5 9-10"/>',
      download: '<path d="M12 4v12m0 0 4-4m-4 4-4-4M4 18v1a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-1"/>',
      trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
      refresh: '<path d="M20 11a8 8 0 0 0-14.5-3M4 5v4h4M4 13a8 8 0 0 0 14.5 3M20 19v-4h-4"/>',
      moon: '<path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5Z"/>',
      sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
      code: '<path d="m8 8-5 4 5 4m8-8 5 4-5 4m-2-11-4 14"/>',
      arrow: '<path d="M5 12h14m-5-5 5 5-5 5"/>',
    }
    return `<svg class="icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.alert}</svg>`
  }

  function fmtSize(bytes) {
    return bytes > 1e6 ? `${(bytes / 1e6).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1e3))} KB`
  }

  function fmtTime(seconds) {
    const value = Math.max(0, Math.floor(seconds || 0))
    return `${String(Math.floor(value / 60)).padStart(2, '0')}:${String(value % 60).padStart(2, '0')}`
  }

  function verdict(risk) {
    if (risk < 35) return { key: 'real', label: 'Likely Real', short: 'Real', tone: 'ok' }
    if (risk < 65) return { key: 'suspicious', label: 'Suspicious', short: 'Suspicious', tone: 'warn' }
    return { key: 'fake', label: 'Manipulated (Likely)', short: 'Manipulated', tone: 'bad' }
  }

  function level(score) {
    return score < 0.35 ? 'low' : score < 0.6 ? 'medium' : 'high'
  }

  function seededRandom(seed) {
    let value = seed || 1
    return () => {
      value ^= value << 13
      value ^= value >>> 17
      value ^= value << 5
      return (value >>> 0) / 4294967296
    }
  }

  function seedFor(file) {
    let hash = 2166136261
    const text = `${file.name}${file.size}`
    for (let index = 0; index < text.length; index++) {
      hash ^= text.charCodeAt(index)
      hash = Math.imul(hash, 16777619)
    }
    return hash >>> 0
  }

  function heatPoints(regions, random) {
    return Object.entries({
      eyes: [[.37, .38], [.63, .38]],
      mouth: [[.5, .64]],
      jaw: [[.5, .84]],
      skin: [[.3, .58], [.7, .58], [.5, .5]],
      hairline: [[.5, .2]],
    }).flatMap(([key, positions]) => positions.map(([x, y]) => ({
      x: x + (random() - .5) * .04,
      y: y + (random() - .5) * .04,
      r: .1 + random() * .07,
      value: regions[key],
    })))
  }

  function makeRegions(random, intensity) {
    const regions = {}
    Object.keys(regionNames).forEach((key) => {
      const hot = random() < .3 + intensity * .5
      regions[key] = Math.min(.99, Math.max(.02, intensity * (hot ? .75 + random() * .25 : .2 + random() * .25) + random() * .05))
    })
    return regions
  }

  function validateFile(file, kind) {
    if (kind === 'image') {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) return 'Unsupported format. Use JPG, PNG or WEBP.'
      if (file.size > 10e6) return 'Image is larger than 10 MB. Try a smaller file.'
    } else {
      if (!['video/mp4', 'video/quicktime', 'video/webm', 'video/x-matroska'].includes(file.type)) return 'Unsupported format. Use MP4, MOV, WEBM or MKV.'
      if (file.size > 500e6) return 'Video is larger than 500 MB. Trim it and try again.'
    }
    return ''
  }

  function imageData(file, maxDimension = 512) {
    return new Promise((resolve, reject) => {
      const objectUrl = URL.createObjectURL(file)
      const image = new Image()
      image.onload = () => {
        const scale = Math.min(1, maxDimension / Math.max(image.naturalWidth, image.naturalHeight))
        const canvas = document.createElement('canvas')
        canvas.width = Math.round(image.naturalWidth * scale)
        canvas.height = Math.round(image.naturalHeight * scale)
        const context = canvas.getContext('2d')
        if (!context) {
          URL.revokeObjectURL(objectUrl)
          reject(new Error('Your browser could not prepare this image.'))
          return
        }
        context.drawImage(image, 0, 0, canvas.width, canvas.height)
        const preview = canvas.toDataURL('image/jpeg', .82)
        URL.revokeObjectURL(objectUrl)
        resolve({ preview, width: image.naturalWidth, height: image.naturalHeight })
      }
      image.onerror = () => {
        URL.revokeObjectURL(objectUrl)
        reject(new Error('This image could not be opened. Check that the file is not corrupted.'))
      }
      image.src = objectUrl
    })
  }

  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

  async function analyzeImage(file, onStage = () => {}) {
    const media = await imageData(file)
    const random = seededRandom(seedFor(file))
    for (let index = 0; index < imageStages.length; index++) {
      onStage(index, imageStages)
      await wait(240 + random() * 150)
    }
    const risk = Math.round(random() < .5 ? 58 + random() * 38 : 4 + random() * 26)
    const regions = makeRegions(random, risk / 100)
    return {
      id: `DV-${Date.now().toString(36).toUpperCase()}${Math.floor(Math.random() * 46656).toString(36).toUpperCase()}`,
      type: 'image',
      fileName: file.name,
      size: file.size,
      width: media.width,
      height: media.height,
      createdAt: new Date().toISOString(),
      preview: media.preview,
      risk,
      authenticity: 100 - risk,
      confidence: Math.round(Math.min(99, 62 + Math.abs(risk - 50) / 50 * 34 + random() * 3)),
      technique: risk >= 35 ? ['Deepfakes', 'FaceSwap', 'Face2Face', 'NeuralTextures'][Math.floor(random() * 4)] : null,
      regions,
      heat: heatPoints(regions, random),
      demo: true,
    }
  }

  function waitForMedia(element, eventName, errorMessage, timeout = 20000) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        cleanup()
        reject(new Error('Reading the video timed out. Try a shorter clip.'))
      }, timeout)
      const onReady = () => { cleanup(); resolve() }
      const onError = () => { cleanup(); reject(new Error(errorMessage)) }
      function cleanup() {
        clearTimeout(timer)
        element.removeEventListener(eventName, onReady)
        element.removeEventListener('error', onError)
      }
      element.addEventListener(eventName, onReady, { once: true })
      element.addEventListener('error', onError, { once: true })
    })
  }

  async function extractVideoFrames(file, count = 8) {
    const objectUrl = URL.createObjectURL(file)
    const video = document.createElement('video')
    video.muted = true
    video.preload = 'auto'
    video.playsInline = true
    video.src = objectUrl
    try {
      await waitForMedia(video, 'loadedmetadata', 'This video could not be read. Try MP4 (H.264).')
      const duration = Number.isFinite(video.duration) && video.duration > 0 ? video.duration : 10
      const width = 240
      const height = Math.max(1, Math.round(width * (video.videoHeight || 9) / (video.videoWidth || 16)))
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const context = canvas.getContext('2d')
      const frames = []
      for (let index = 0; index < count; index++) {
        const time = duration * (index + .5) / count
        if (Math.abs(video.currentTime - time) > .02) {
          const seeked = waitForMedia(video, 'seeked', 'Could not extract video frames.', 5000)
          video.currentTime = time
          await seeked
        }
        context.drawImage(video, 0, 0, width, height)
        frames.push({ t: time, thumb: canvas.toDataURL('image/jpeg', .7) })
      }
      return { duration, frames, width: video.videoWidth, height: video.videoHeight, objectUrl }
    } catch (error) {
      URL.revokeObjectURL(objectUrl)
      throw error
    }
  }

  async function analyzeVideo(file, onStage = () => {}) {
    onStage(0, videoStages)
    await wait(200)
    onStage(1, videoStages)
    const media = await extractVideoFrames(file)
    const duration = media.duration
    const random = seededRandom(seedFor(file))
    onStage(2, videoStages)
    await wait(400)
    const hot = random() < .5
    const count = Math.max(12, Math.min(60, Math.round(duration)))
    const center = (.25 + random() * .5) * duration
    const width = (.07 + random() * .08) * duration
    const amplitude = .55 + random() * .3
    const base = .06 + random() * .12
    const series = Array.from({ length: count }, (_, index) => {
      const time = index * duration / (count - 1)
      const bump = hot ? amplitude * Math.exp(-(((time - center) / width) ** 2)) : 0
      return { t: time, score: Math.max(.01, Math.min(.99, base + (random() - .5) * .1 + bump)) }
    })
    const at = (time) => series.reduce((best, point) => Math.abs(point.t - time) < Math.abs(best.t - time) ? point : best, series[0]).score
    onStage(3, videoStages)
    await wait(350)
    const segments = Array.from({ length: 12 }, (_, index) => {
      const start = index * duration / 12
      const end = (index + 1) * duration / 12
      const points = series.filter((point) => point.t >= start && point.t <= end)
      const score = points.length ? points.reduce((sum, point) => sum + point.score, 0) / points.length : at(start)
      return { start, end, score, level: level(score) }
    })
    const suspicious = []
    segments.forEach((segment) => {
      if (segment.level === 'low') return
      const last = suspicious[suspicious.length - 1]
      if (last && Math.abs(last.end - segment.start) < 1e-6) {
        last.end = segment.end
        last.score = Math.max(last.score, segment.score)
        if (segment.level === 'high') last.level = 'high'
      } else suspicious.push({ start: segment.start, end: segment.end, score: segment.score, level: segment.level })
    })
    onStage(4, videoStages)
    await wait(300)
    const frames = media.frames.map((frame, index) => {
      const score = at(frame.t)
      const frameRandom = seededRandom(seedFor({ name: `${file.name}${index}`, size: file.size }))
      const regions = makeRegions(frameRandom, score)
      return { ...frame, score, regions, heat: heatPoints(regions, frameRandom) }
    })
    const mean = series.reduce((sum, point) => sum + point.score, 0) / series.length
    const max = Math.max(...series.map((point) => point.score))
    const risk = Math.round(100 * (.35 * mean + .65 * max))
    const worst = frames.reduce((best, frame) => frame.score > best.score ? frame : best, frames[0])
    return {
      id: `DV-${Date.now().toString(36).toUpperCase()}${Math.floor(Math.random() * 46656).toString(36).toUpperCase()}`,
      type: 'video',
      fileName: file.name,
      size: file.size,
      width: media.width,
      height: media.height,
      duration,
      createdAt: new Date().toISOString(),
      preview: worst.thumb,
      risk,
      authenticity: 100 - risk,
      confidence: Math.round(Math.min(99, 66 + Math.abs(risk - 50) / 50 * 30 + random() * 3)),
      technique: risk >= 35 ? ['Deepfakes', 'FaceSwap', 'Face2Face', 'NeuralTextures'][Math.floor(random() * 4)] : null,
      regions: worst.regions,
      heat: worst.heat,
      series,
      segments,
      suspicious,
      frames,
      demo: true,
      objectUrl: media.objectUrl,
    }
  }

  function summarize(result) {
    const outcome = verdict(result.risk)
    if (result.type === 'video') {
      if (!result.suspicious?.length) return 'Generated example scores for this clip stayed below the suspicion threshold.'
      const flagged = result.suspicious.filter((item) => item.level === 'high')
      const intervals = (flagged.length ? flagged : result.suspicious).map((item) => `${fmtTime(item.start)} to ${fmtTime(item.end)}`).join(', ')
      return `${outcome.label} (generated example). The scores flagged the interval ${intervals}.`
    }
    if (outcome.key === 'real') return 'Generated example scores did not indicate a high manipulation risk.'
    const areas = Object.entries(result.regions || {}).sort((a, b) => b[1] - a[1]).slice(0, 2).map(([key]) => regionNames[key].toLowerCase())
    return `${outcome.label} (generated example). Scores were highest around the ${areas.join(' and ')}.`
  }

  function toast(message, tone = '') {
    const holder = $('#toasts')
    const node = document.createElement('div')
    node.className = `toast ${tone}`
    node.textContent = message
    holder.append(node)
    setTimeout(() => node.remove(), 3600)
  }

  function saveHistory() {
    state.history = state.history.slice(0, 12)
    if (!save('dv.history', state.history)) {
      state.history = state.history.map((item, index) => index < 3 ? item : {
        ...item,
        preview: null,
        frames: item.frames?.map((frame) => ({ ...frame, thumb: null })),
      })
      if (!save('dv.history', state.history.slice(0, 3))) {
        state.history = state.history.slice(0, 3)
        toast('Browser storage is full; only the latest reports could be saved.', 'warn')
      } else toast('Browser storage is low; older report previews were removed.', 'warn')
    }
  }

  function addReport(result) {
    const stored = { ...result }
    delete stored.objectUrl
    state.history = [stored, ...state.history.filter((item) => item.id !== result.id)]
    saveHistory()
    state.history = load('dv.history', state.history)
  }

  function currentUsage() {
    if (!state.usage || state.usage.date !== today()) state.usage = { date: today(), count: 0 }
    return state.usage.count
  }

  function consume(count = 1) {
    const limit = plans[state.plan] ?? plans.free
    if (limit - currentUsage() < count) {
      state.modal = 'upgrade'
      render()
      return false
    }
    state.usage = { date: today(), count: currentUsage() + count }
    save('dv.usage', state.usage)
    return true
  }

  function uploadZone(kind, multiple = false) {
    const image = kind === 'image'
    const accept = image ? 'image/jpeg,image/png,image/webp' : multiple
      ? 'image/jpeg,image/png,image/webp,video/mp4,video/quicktime,video/webm,video/x-matroska'
      : 'video/mp4,video/quicktime,video/webm,video/x-matroska'
    const title = multiple ? 'Drop several files here' : image ? 'Drag and drop your image here' : 'Drag and drop your video here'
    const hint = multiple ? 'Images up to 10 MB, videos up to 500 MB' : image ? 'Supported formats: JPG, PNG, WEBP (max 10 MB)' : 'Supported formats: MP4, MOV, WEBM, MKV (max 500 MB)'
    return `<div class="dropzone" data-drop="${kind}"><span class="dz-icon">${icon(image ? 'image' : kind === 'video' ? 'video' : 'layers', 34)}</span><p class="dz-title">${title}</p><span class="dz-or">or</span><button type="button" class="btn btn-primary" data-action="browse">Browse files</button><p class="dz-hint">${hint}</p><input type="file" hidden accept="${accept}" ${multiple ? 'multiple' : ''} data-file-input="${kind}"></div>`
  }

  function progressView() {
    const stages = state.busy.stages
    return `<div class="card pad progress-card"><div class="spinner" aria-hidden="true"></div><h3>${escapeHtml(state.busy.title)}</h3><p class="sub">${escapeHtml(stages[state.busy.stage] || 'Preparing analysis')}</p><div class="bar"><i style="width:${Math.round((state.busy.stage + 1) / stages.length * 100)}%"></i></div><p class="note">Generated example scores only — not an authenticity assessment.</p></div>`
  }

  function errorView() {
    return state.error ? `<div class="banner bad" role="alert">${icon('alert', 16)}${escapeHtml(state.error)}</div>` : ''
  }

  function scoreRing(value, tone, label) {
    const circumference = 2 * Math.PI * 48
    return `<div class="score-ring ${tone}" role="img" aria-label="${escapeHtml(label)} ${value}%"><svg viewBox="0 0 112 112"><circle class="ring-bg" cx="56" cy="56" r="48"/><circle class="ring-value" cx="56" cy="56" r="48" stroke-dasharray="${circumference}" stroke-dashoffset="${circumference * (1 - value / 100)}"/></svg><b>${value}%</b></div>`
  }

  function heatmap(result, opacity = state.heatOpacity, show = state.heatMode === 'heat') {
    const points = result.heat || []
    const spots = show ? points.map((point) => `<i class="heat-spot" style="left:${point.x * 100}%;top:${point.y * 100}%;width:${point.r * 220}%;height:${point.r * 220}%;opacity:${Math.min(.9, point.value * opacity)}"></i>`).join('') : ''
    return `<div class="heat-wrap"><img src="${result.preview || ''}" alt="Analysis preview"><div class="heat-overlay">${spots}</div></div>`
  }

  function fileRow(result, kind) {
    return `<div class="file-row">${icon(kind)}<div><b>${escapeHtml(result.fileName)}</b><span class="sub small">${result.width}×${result.height} · ${fmtSize(result.size)}${kind === 'video' ? ` · ${fmtTime(result.duration)}` : ''}</span></div><button type="button" class="btn btn-ghost" data-action="reset">${icon('refresh', 16)}Analyze another</button></div>`
  }

  function imageResult(result) {
    const outcome = verdict(result.risk)
    const regions = Object.entries(result.regions).sort((a, b) => b[1] - a[1]).map(([key, score]) => `<tr><th>${regionNames[key]}</th><td><div class="bar sm"><i class="${score > .6 ? 'hi' : score > .35 ? 'md' : ''}" style="width:${Math.round(score * 100)}%"></i></div></td><td class="mono">${Math.round(score * 100)}%</td></tr>`).join('')
    return `<div class="stack">
      <div class="grid-2">
        <div class="card pad">${fileRow(result, 'image')}<img class="preview" src="${result.preview}" alt="Uploaded image"></div>
        <div class="card pad result-card"><span class="chip ${outcome.tone}">${outcome.label}</span>${scoreRing(result.authenticity, outcome.tone, 'Authenticity score')}<p class="ring-cap">Authenticity score</p><p class="sub center">${summarize(result)}</p><p class="note center">Generated preview result — not an authenticity assessment.</p></div>
      </div>
      <div class="grid-2">
        <div class="card pad"><h3>Analysis details</h3><table class="kv"><tbody><tr><th>Prediction</th><td><b class="${outcome.tone}">${outcome.short}</b></td></tr><tr><th>Confidence score</th><td class="mono">${result.confidence}%</td></tr><tr><th>Risk score</th><td class="mono">${result.risk}%</td></tr><tr><th>Likely method</th><td>${escapeHtml(result.technique || 'None found')}</td></tr><tr><th>Detected regions</th><td>${Object.entries(result.regions).filter(([, score]) => score > .6).map(([key]) => regionNames[key]).join(', ') || 'None'}</td></tr></tbody></table><div class="row mt"><a class="btn btn-primary" href="#/app/reports/${encodeURIComponent(result.id)}">${icon('file', 16)}View full report</a><button class="btn btn-ghost" data-action="export-json">${icon('code', 16)}Export JSON</button></div></div>
        <div class="card pad"><div class="between"><h3>Attention map</h3><div class="seg"><button data-action="heat-mode" data-mode="heat" class="${state.heatMode === 'heat' ? 'on' : ''}">Heatmap</button><button data-action="heat-mode" data-mode="orig" class="${state.heatMode === 'orig' ? 'on' : ''}">Original</button></div></div>${heatmap(result)}<div class="between mt"><div class="heat-legend"><span>High influence</span><i></i><span>Low influence</span></div><label class="slider">Overlay<input data-action="opacity" type="range" min=".2" max=".9" step=".05" value="${state.heatOpacity}"></label></div></div>
      </div>
      <div class="card pad"><h3>Facial-region examples</h3><table class="kv"><tbody>${regions}</tbody></table></div>
    </div>`
  }

  function timeline(result, interactive = true, current = 0) {
    if (!result.segments?.length) return ''
    const parts = result.segments.map((segment) => `<button type="button" class="tl-seg ${segment.level}" style="flex:${segment.end - segment.start}" title="${fmtTime(segment.start)} to ${fmtTime(segment.end)} · ${Math.round(segment.score * 100)}%" ${interactive ? `data-seek="${segment.start}"` : ''}></button>`).join('')
    return `<div class="tl"><div class="tl-bar">${parts}<span class="tl-head" style="left:${Math.min(100, current / result.duration * 100)}%"></span></div><div class="tl-axis"><span>00:00</span><span>${fmtTime(result.duration / 4)}</span><span>${fmtTime(result.duration / 2)}</span><span>${fmtTime(result.duration * .75)}</span><span>${fmtTime(result.duration)}</span></div><div class="legend"><span><i class="dot low"></i>Low risk</span><span><i class="dot medium"></i>Medium risk</span><span><i class="dot high"></i>High risk</span></div></div>`
  }

  function lineChart(result) {
    const series = result.series || []
    if (!series.length) return ''
    const width = 640
    const height = 220
    const left = 38
    const top = 14
    const bottom = 28
    const x = (time) => left + time / result.duration * (width - left - 12)
    const y = (score) => top + (1 - score) * (height - top - bottom)
    const path = series.map((point, index) => `${index ? 'L' : 'M'}${x(point.t).toFixed(1)} ${y(point.score).toFixed(1)}`).join(' ')
    return `<svg viewBox="0 0 ${width} ${height}" class="chart" role="img" aria-label="Example manipulation score by frame"><rect x="${left}" y="${y(1)}" width="${width - left - 12}" height="${y(.6) - y(1)}" class="band-high"/><line x1="${left}" x2="${width - 12}" y1="${y(.5)}" y2="${y(.5)}" class="grid"/><line x1="${left}" x2="${width - 12}" y1="${y(0)}" y2="${y(0)}" class="grid"/><path d="${path} L${x(result.duration)} ${y(0)} L${left} ${y(0)} Z" class="area"/><path d="${path}" class="line"/><text x="${left - 8}" y="${y(1) + 4}" text-anchor="end" class="axis">1.0</text><text x="${left - 8}" y="${y(0) + 4}" text-anchor="end" class="axis">0.0</text><text x="${left}" y="${height - 7}" class="axis">00:00</text><text x="${width - 12}" y="${height - 7}" text-anchor="end" class="axis">${fmtTime(result.duration)}</text></svg>`
  }

  function videoResult(result) {
    const outcome = verdict(result.risk)
    const segments = result.suspicious.length ? `<ul class="ts-list">${result.suspicious.map((segment) => `<li><i class="dot ${segment.level}"></i><button class="link-btn mono" data-seek="${segment.start}">${fmtTime(segment.start)} to ${fmtTime(segment.end)}</button><b class="${segment.level}">${segment.level === 'high' ? 'High risk' : 'Medium risk'}</b></li>`).join('')}</ul>` : '<p class="sub">No suspicious example segments found.</p>'
    const frames = result.frames.map((frame, index) => `<button type="button" class="frame ${level(frame.score)}" data-seek="${frame.t}" title="Seek to ${fmtTime(frame.t)}"><img src="${frame.thumb}" alt="Video frame at ${fmtTime(frame.t)}"><span class="mono">${fmtTime(frame.t)}</span><b class="mono">${Math.round(frame.score * 100)}%</b></button>`).join('')
    return `<div class="stack">
      <div class="grid-2 video-top"><div class="card pad">${fileRow(result, 'video')}<video controls playsinline class="player" src="${result.objectUrl || ''}"></video></div><div class="card pad result-card"><span class="chip ${outcome.tone}">${outcome.label}</span><div class="row center-row"><div class="col-c">${scoreRing(result.risk, outcome.tone, 'Manipulation score')}<p class="ring-cap">Manipulation score</p></div><div class="col-c"><div class="big mono">${result.confidence}%</div><p class="ring-cap">Confidence</p></div></div><p class="sub center">${summarize(result)}</p><p class="note center">Frames were read locally. Scores are generated examples.</p><a class="btn btn-primary full" href="#/app/reports/${encodeURIComponent(result.id)}">${icon('file', 16)}View full report</a></div></div>
      <div class="card pad"><h3>Suspicious timeline</h3><p class="sub">Select a segment to jump to it in the video.</p>${timeline(result)}${segments}</div>
      <div class="grid-2"><div class="card pad"><h3>Frame analysis</h3><div class="frames">${frames}</div><div class="frame-heat"><div class="heat-wrap"><img src="${result.preview}" alt="Example attention map"><div class="heat-overlay">${(result.heat || []).map((point) => `<i class="heat-spot" style="left:${point.x * 100}%;top:${point.y * 100}%;width:${point.r * 220}%;height:${point.r * 220}%;opacity:${Math.min(.9, point.value * .6)}"></i>`).join('')}</div></div><p class="sub small">Example attention map for the highest-scoring frame.</p></div></div><div class="card pad"><h3>Frame scores over time</h3>${lineChart(result)}</div></div>
    </div>`
  }

  function imagePage() {
    const body = state.busy?.kind === 'image' ? progressView() : state.result?.type === 'image' ? imageResult(state.result) : uploadZone('image')
    return `<p class="lead">Upload a photo to explore image analysis. Generated scores and attention maps are examples and do not verify authenticity.</p>${errorView()}${body}`
  }

  function videoPage() {
    const body = state.busy?.kind === 'video' ? progressView() : state.result?.type === 'video' ? videoResult(state.result) : uploadZone('video')
    return `<p class="lead">Upload a video to explore browser-based frame analysis. Generated scores and timestamps are examples, not an authenticity assessment.</p>${errorView()}${body}`
  }

  function batchPage() {
    const completed = state.batch.filter((item) => item.status === 'done').length
    const rows = state.batch.map((item, index) => {
      const result = item.result
      const outcome = result ? verdict(result.risk) : null
      const status = item.status === 'error' ? `<span class="bad-text">${escapeHtml(item.error)}</span>` : item.status === 'running' ? '<span class="spin">Analyzing</span>' : escapeHtml(item.status)
      return `<tr><td class="trunc">${escapeHtml(item.file.name)}</td><td>${item.kind}</td><td class="mono">${fmtSize(item.file.size)}</td><td>${status}</td><td>${outcome ? `<span class="chip ${outcome.tone}">${outcome.short}</span>` : '–'}</td><td class="mono">${result ? `${result.risk}%` : '–'}</td><td>${result ? `<a class="link-btn" href="#/app/reports/${encodeURIComponent(result.id)}">Report</a>` : ''}</td></tr>`
    }).join('')
    const table = state.batch.length ? `<div class="card pad mt"><div class="between"><h3>Queue <span class="sub">(${completed}/${state.batch.length} done)</span></h3><div class="row"><button class="btn btn-ghost" data-action="export-csv" ${completed ? '' : 'disabled'}>${icon('download', 16)}Export CSV</button><button class="btn btn-ghost" data-action="clear-batch" ${state.batchBusy ? 'disabled' : ''}>${icon('trash', 16)}Clear</button></div></div><div class="table-wrap"><table class="table"><thead><tr><th>File</th><th>Type</th><th>Size</th><th>Status</th><th>Verdict</th><th>Risk</th><th></th></tr></thead><tbody>${rows}</tbody></table></div></div>` : ''
    return `<p class="lead">Process local image and video files in a batch. Generated scores are examples and reports are saved in this browser.</p>${errorView()}${uploadZone('batch', true)}${table}`
  }

  function reportList() {
    if (!state.history.length) return `<div class="empty card pad"><span class="empty-icon">${icon('file', 34)}</span><h3>No reports yet</h3><p class="sub">Every scan creates a report you can reopen, export and print.</p><div class="row"><a href="#/app/image" class="btn btn-primary">Scan an image</a><a href="#/app/video" class="btn btn-outline">Scan a video</a></div></div>`
    const rows = state.history.map((result) => {
      const outcome = verdict(result.risk)
      return `<tr class="click"><td><a href="#/app/reports/${encodeURIComponent(result.id)}">${result.preview ? `<img class="th" src="${result.preview}" alt="">` : '<span class="th"></span>'}</a></td><td class="trunc"><a href="#/app/reports/${encodeURIComponent(result.id)}">${escapeHtml(result.fileName)}</a></td><td>${result.type}</td><td><span class="chip ${outcome.tone}">${outcome.short}</span></td><td class="mono">${result.risk}%</td><td class="mono">${fmtSize(result.size)}</td><td class="mono">${new Date(result.createdAt).toLocaleDateString()}</td></tr>`
    }).join('')
    return `<div class="between"><p class="lead">Reports are stored in this browser. The latest 12 scans are saved.</p><button class="btn btn-ghost" data-action="clear-history">${icon('trash', 16)}Clear all</button></div><div class="card pad"><div class="table-wrap"><table class="table"><thead><tr><th></th><th>File</th><th>Type</th><th>Verdict</th><th>Risk</th><th>Size</th><th>Date</th></tr></thead><tbody>${rows}</tbody></table></div></div>`
  }

  function performancePage(compact = false) {
    const techniques = [['Deepfakes', 96.1], ['FaceSwap', 94.8], ['Face2Face', 92.9], ['NeuralTextures', 88.7]]
    const robustness = [['JPEG compression (quality 70)', 4.2], ['Gaussian blur (sigma 1.5)', 6.8], ['Resize to 50%', 5.1], ['Gaussian noise', 8.4], ['Brightness shift', 2.3]]
    return `<div class="perf"><p class="note">Reference values for layout only. These metrics are placeholders, not results from a trained detector or real evaluation.</p><div class="perf-grid ${compact ? 'compact' : ''}"><div class="card pad"><h3>Model evaluation</h3><table class="kv"><tbody><tr><th>Accuracy</th><td class="mono">94.2%</td></tr><tr><th>Precision</th><td class="mono">91.7%</td></tr><tr><th>Recall</th><td class="mono">88.9%</td></tr><tr><th>F1 score</th><td class="mono">90.3%</td></tr><tr><th>ROC AUC</th><td class="mono">0.962</td></tr></tbody></table><div class="roc"><svg viewBox="0 0 360 240" class="chart" role="img" aria-label="Example ROC curve, AUC 0.962"><line x1="40" x2="348" y1="206" y2="12" class="diag"/><path d="M40 206 C75 80 110 35 348 12 L348 206 Z" class="area"/><path d="M40 206 C75 80 110 35 348 12" class="line"/><text x="200" y="140" class="axis">AUC 0.962</text><text x="194" y="235" class="axis">False positive rate</text></svg></div></div><div class="card pad"><h3>Robustness testing</h3><p class="sub">Accuracy drop after the file is altered. Lower is better.</p><table class="kv"><tbody>${robustness.map(([test, drop]) => `<tr><th>${test}</th><td class="mono bad-text">-${drop}%</td></tr>`).join('')}</tbody></table>${compact ? '' : `<h3 class="mt">Accuracy by manipulation method</h3><div class="bars">${techniques.map(([name, accuracy]) => `<div class="bar-row"><span>${name}</span><div class="bar"><i style="width:${accuracy}%"></i></div><b class="mono">${accuracy}%</b></div>`).join('')}</div>`}</div></div></div>`
  }

  function reportDetail(id) {
    const result = state.history.find((item) => item.id === id)
    if (!result) return `<div class="empty card pad"><h3>Report not found</h3><p class="sub">It may have been cleared. Run a new scan to create one.</p><a href="#/app/image" class="btn btn-primary">Scan an image</a></div>`
    const outcome = verdict(result.risk)
    const isVideo = result.type === 'video'
    const evidence = isVideo
      ? `<div class="card pad"><h3>Suspicious timestamps</h3>${result.suspicious?.length ? `<ul class="ts-list">${result.suspicious.map((segment) => `<li><i class="dot ${segment.level}"></i><span class="mono">${fmtTime(segment.start)} to ${fmtTime(segment.end)}</span><b class="${segment.level}">${segment.level === 'high' ? 'High risk' : 'Medium risk'}</b></li>`).join('')}</ul>` : '<p class="sub">No suspicious example segments found.</p>'}${timeline(result, false)}</div>` : `<div class="card pad"><h3>Attention map</h3>${heatmap(result, .6, true)}<div class="heat-legend"><span>High influence</span><i></i><span>Low influence</span></div></div>`
    const extra = isVideo && result.frames?.length ? `<div class="grid-2"><div class="card pad"><h3>Example frame attention maps</h3><div class="frames">${result.frames.slice(0, 5).map((frame) => `<figure><img src="${frame.thumb || ''}" alt="Frame at ${fmtTime(frame.t)}"><figcaption class="mono">${fmtTime(frame.t)} · ${Math.round(frame.score * 100)}%</figcaption></figure>`).join('')}</div></div><div class="card pad"><h3>Frame scores</h3>${lineChart(result)}</div></div>` : ''
    const regions = !isVideo ? `<table class="kv"><tbody>${Object.entries(result.regions || {}).sort((a, b) => b[1] - a[1]).map(([key, score]) => `<tr><th>${regionNames[key]}</th><td><div class="bar sm"><i style="width:${Math.round(score * 100)}%"></i></div></td><td class="mono">${Math.round(score * 100)}%</td></tr>`).join('')}</tbody></table>` : ''
    return `<a class="back-link no-print" href="#/app/reports">${icon('arrow', 16)}All reports</a><article class="report"><header class="report-head"><div><h2>Detection report</h2><p class="sub mono">${escapeHtml(result.id)} · ${new Date(result.createdAt).toLocaleString()}</p></div><div class="row no-print"><button class="btn btn-ghost" data-action="export-json" data-report="${escapeHtml(result.id)}">${icon('code', 16)}Export JSON</button><button class="btn btn-primary" data-action="print">${icon('download', 16)}Print report</button></div></header><div class="banner">${icon('alert', 16)}Scores and heatmaps are generated examples and do not verify authenticity.</div><section class="rp-top"><div class="verdict-card ${outcome.tone}">${icon(outcome.tone === 'ok' ? 'check' : 'alert', 26)}<div><b>${outcome.label}</b><span>${escapeHtml(result.fileName)} · ${fmtSize(result.size)}${isVideo ? ` · ${fmtTime(result.duration)}` : ''}</span></div></div><div class="stat"><span>Overall risk score</span><b class="mono ${outcome.tone}">${result.risk}%</b></div><div class="stat"><span>Confidence</span><b class="mono">${result.confidence}%</b></div><div class="stat"><span>Likely method</span><b>${escapeHtml(result.technique || 'None found')}</b></div></section><section class="rp-grid"><div class="card pad"><h3>Summary</h3><p>${summarize(result)}</p>${regions}</div>${evidence}</section>${extra}<section><h3 class="sec-title">Model evaluation and robustness</h3>${performancePage(true)}</section></article>`
  }

  function settingsPage() {
    const usage = currentUsage()
    const limit = plans[state.plan] ?? plans.free
    const savedReports = state.history.length
    return `<p class="lead">Manage your local preferences, usage, plan and saved reports.</p><div class="banner">${icon('alert', 16)}Scores and heatmaps are generated examples, not an authenticity assessment. Uploaded media stays in your browser.</div><div class="grid-2"><div class="card pad"><h3>Workspace status</h3><table class="kv"><tbody><tr><th>Storage</th><td>This browser</td></tr><tr><th>Analysis scores</th><td>Generated examples</td></tr><tr><th>Plan</th><td>${escapeHtml(state.plan[0].toUpperCase() + state.plan.slice(1))}</td></tr><tr><th>Scans today</th><td>${usage}/${limit === Infinity ? '∞' : limit}</td></tr><tr><th>Saved reports</th><td>${savedReports} (this browser)</td></tr></tbody></table><label class="field mt">Plan<select data-setting="plan">${Object.keys(plans).map((plan) => `<option value="${plan}" ${state.plan === plan ? 'selected' : ''}>${plan[0].toUpperCase() + plan.slice(1)} (${plans[plan] === Infinity ? 'unlimited' : plans[plan] + ' scans/day'})</option>`).join('')}</select></label><label class="field mt">Appearance<select data-setting="theme"><option value="light" ${state.theme === 'light' ? 'selected' : ''}>Light</option><option value="dark" ${state.theme === 'dark' ? 'selected' : ''}>Dark</option><option value="system" ${state.theme === 'system' ? 'selected' : ''}>System</option></select></label></div><div class="card pad"><h3>Browser storage</h3><p class="note">Theme, usage counters and report history are stored locally in this browser. Clearing this browser&apos;s site data removes them.</p><h3 class="mt">Media privacy</h3><p class="note">Image previews and video frame extraction happen locally in your browser. Files are not uploaded to a server.</p><h3 class="mt">Analysis limitations</h3><p class="note">This frontend generates demonstration results. It does not contain or connect to a real deepfake detection model or API.</p><button class="btn btn-ghost mt" data-action="clear-history">${icon('trash', 16)}Clear saved reports</button></div></div>`
  }

  function landingPage() {
    const featureCards = [
      ['check', 'Binary Classification', 'Distinguishes authentic from manipulated faces with confidence scoring.'],
      ['layers', 'Temporal Frame Aggregation', 'Sequentially parses MP4 frames to isolate high-risk video segments.'],
      ['image', 'Attention Heatmaps', 'Visualises spatial facial regions influencing model predictions.'],
      ['refresh', 'Robustness Evaluation', 'Resilience testing across JPEG compression and Gaussian blur.'],
    ]
    const members = team.map(([name, role], index) => {
      const image = ['agrima-tripathi', 'anurag-verma', 'nishu-kumari', 'shivang-saxena', 'tanu-thakur', 'yash-gupta', 'charvi-goyal', 'aditya-verma'][index]
      return `<article class="developer-card"><img src="./public/team/${image}.png" alt="${escapeHtml(name)}" class="developer-avatar"><div class="developer-details"><b>${escapeHtml(name)}</b><span>${escapeHtml(role)}</span></div></article>`
    }).join('')
    return `<header class="site-nav"><div class="site-nav-inner"><a class="site-brand" href="#/" aria-label="Pixpect home"><img src="./public/pixpect-logo.png" alt="Pixpect | परख"></a><nav aria-label="Main navigation"><a href="#detection">Detection</a><a href="#project-overview">About the project</a><a href="#developers">Team</a></nav><div class="site-nav-actions"><button class="icon-btn" data-action="theme" aria-label="Toggle theme">${icon(state.theme === 'dark' ? 'sun' : 'moon')}</button><a class="btn btn-primary" href="#/app/image">Analyze an image</a></div></div></header>
      <main class="home-page">
        <section id="detection" class="detection-hero"><div class="home-container"><div class="hero-copy"><span class="home-eyebrow"><i></i>IMAGE &amp; VIDEO DEEPFAKE ANALYSIS</span><h1>Face detection for <span>images and videos.</span></h1><p>Explore media analysis with image-level scores, video frame timelines, and visual attention maps. Choose a photo or video to get started.</p><div class="detection-actions"><a class="btn btn-primary btn-lg" href="#/app/image">${icon('image', 19)}Detect faces in an image</a><a class="btn btn-outline btn-lg" href="#/app/video">${icon('video', 19)}Analyze a video</a></div><p class="hero-disclaimer">${icon('alert', 15)}Demo only: scores are generated examples, not a real authenticity assessment.</p></div><div class="detection-preview"><div class="preview-window"><div class="preview-window-head"><span></span><span></span><span></span><b>MEDIA ANALYSIS PREVIEW</b></div><div class="preview-window-content"><div class="preview-media">${icon('image', 32)}<span>IMAGE</span><i class="preview-scan-line"></i></div><div class="preview-analysis"><span class="chip ok">${icon('check', 14)}EXAMPLE RESULT</span><b>Authenticity score</b><strong>86<span>%</span></strong><div class="bar"><i style="width:86%"></i></div><small>Illustrative score only</small></div></div><div class="preview-frame-strip"><span>VIDEO FRAMES</span><i></i><i></i><i></i><i></i><b>Frame-by-frame review</b></div></div></div></div></section>
        <section class="scan-options home-container" aria-label="Choose media type"><a class="scan-option card" href="#/app/image"><span class="scan-option-icon">${icon('image', 22)}</span><span><b>Check an image</b><small>JPG, PNG, WEBP · up to 10 MB</small></span>${icon('arrow', 18)}</a><a class="scan-option card" href="#/app/video"><span class="scan-option-icon">${icon('video', 22)}</span><span><b>Analyze a video</b><small>MP4, MOV, WEBM, MKV · up to 500 MB</small></span>${icon('arrow', 18)}</a></section>
        <section id="project-overview" class="project-section"><div class="home-container"><header class="section-heading"><span class="home-eyebrow"><i></i>PROJECT OVERVIEW</span><span class="dataset-badge">Dataset reference: FaceForensics++</span></header><h2>Deepfake Face Detection System</h2><p class="project-description">A specialized platform designed to explore deepfake pictures, morphed images, and synthetic or AI-manipulated video frames. The application demonstrates a binary-classification workflow for images and frame-by-frame video review, with example confidence scores, attention maps, and suspicious timelines.</p><div class="project-features">${featureCards.map(([symbol, title, description]) => `<article class="project-feature card"><h3>${icon(symbol, 17)}${title}</h3><p>${description}</p></article>`).join('')}</div><p class="project-note">${icon('alert', 16)}This frontend currently generates demonstration scores in your browser. It is not connected to a trained detection model or the FaceForensics++ dataset.</p></div></section>
        <section class="how-section"><div class="home-container"><span class="home-eyebrow"><i></i>IMAGE + VIDEO WORKFLOW</span><h2>From media file to reviewable result</h2><div class="workflow-grid"><article><span>01</span><h3>Choose an image or video</h3><p>Select a supported file. Media is read locally in your browser.</p></article><article><span>02</span><h3>Inspect the analysis</h3><p>Explore example image scores or video frame-level risk timelines.</p></article><article><span>03</span><h3>Review and save</h3><p>Open a report, examine attention-map examples, and export your result.</p></article></div><div class="row workflow-actions"><a class="btn btn-primary" href="#/app/image">${icon('image', 17)}Try image detection</a><a class="btn btn-outline" href="#/app/video">${icon('video', 17)}Try video detection</a></div></div></section>
        <section class="domains-strip"><span class="coming-soon"><i></i>COMING SOON</span><span class="reserved-label">RESERVED DOMAINS</span><a href="https://parakh.xyz" target="_blank" rel="noopener noreferrer">parakh.xyz ↗</a><a href="https://pixpect.xyz" target="_blank" rel="noopener noreferrer">pixpect.xyz ↗</a></section>
        <section id="developers" class="developers-section"><div class="home-container"><header class="developers-header"><div class="team-brand"><span class="team-brand-mark" aria-hidden="true">&#10038;</span><span class="team-brand-copy"><b>MnM</b><small>Innovate &middot; Build &middot; Deliver</small></span></div><div><span class="home-eyebrow"><i></i>THE PEOPLE BEHIND THE PROJECT</span><h2>Our developers</h2></div><span class="team-count">8 Members</span></header><div class="developers-grid">${members}</div></div></section>
      </main>`
  }

  function modalView() {
    if (!state.modal) return ''
    if (state.modal === 'upgrade') return `<div class="modal-backdrop" data-action="close-modal"><section class="modal card pad" role="dialog" aria-modal="true" aria-labelledby="modal-title"><button class="icon-btn modal-close" data-action="close-modal" aria-label="Close">×</button><h2 id="modal-title">Daily scan limit reached</h2><p class="sub mt">Choose a sample plan with a higher local scan limit. No payment is processed.</p><label class="field mt">Plan<select data-setting="plan">${Object.keys(plans).map((plan) => `<option value="${plan}">${plan[0].toUpperCase() + plan.slice(1)} (${plans[plan] === Infinity ? 'unlimited' : plans[plan] + ' scans/day'})</option>`).join('')}</select></label><button class="btn btn-primary mt" data-action="upgrade-plan">Change plan</button></section></div>`
    return `<div class="modal-backdrop" data-action="close-modal"><form class="modal card pad" data-form="login" role="dialog" aria-modal="true" aria-labelledby="modal-title"><button type="button" class="icon-btn modal-close" data-action="close-modal" aria-label="Close">×</button><h2 id="modal-title">Local profile</h2><p class="sub mt">This demo saves a display name in this browser only.</p><label class="field mt">Name<input name="name" required maxlength="60" value="${escapeHtml(state.user?.name || '')}" placeholder="Your name"></label><button class="btn btn-primary mt" type="submit">Save profile</button></form></div>`
  }

  function appPage(page, id) {
    const active = navigation.find(([route]) => route === page) || navigation[0]
    const usage = currentUsage()
    const limit = plans[state.plan] ?? plans.free
    const pct = limit === Infinity ? 0 : Math.min(100, usage / limit * 100)
    let body = ''
    if (page === 'image') body = imagePage()
    else if (page === 'video') body = videoPage()
    else if (page === 'batch') body = batchPage()
    else if (page === 'reports') body = id ? reportDetail(id) : reportList()
    else if (page === 'performance') body = `<p class="lead">Sample performance charts for the frontend. Metrics are placeholders, not results from a trained detector or real evaluation.</p>${performancePage()}`
    else body = settingsPage()
    const title = page === 'api' ? 'Settings' : active[1]
    return `<div class="app"><aside class="side" id="sidebar"><div class="side-top"><a class="logo" href="#/"><img class="logo-img" src="./public/pixpect-logo.png" alt="Pixpect | परख"></a></div><nav aria-label="App">${navigation.map(([route, label, symbol]) => `<a href="#/app/${route}" class="side-link ${page === route ? 'active' : ''}" ${page === route ? 'aria-current="page"' : ''}><span aria-hidden="true">${symbol}</span>${label}</a>`).join('')}</nav><div class="usage card"><div class="usage-h"><b>${state.plan[0].toUpperCase() + state.plan.slice(1)} plan</b><span class="mono">${usage}/${limit === Infinity ? '∞' : limit}</span></div><div class="bar sm"><i class="${pct > 80 ? 'hi' : ''}" style="width:${pct}%"></i></div><p class="sub small">Sample scans today</p><button class="btn btn-outline full" data-action="upgrade">Change plan</button></div><a href="#/" class="side-link back">${icon('arrow', 16)}Back to site</a></aside><div class="scrim" data-action="close-menu"></div><div class="main"><header class="topbar"><button class="icon-btn burger" data-action="menu" aria-label="Open menu">☰</button><h1>${title}</h1><div class="row"><span class="pill warn">Sample results</span><button class="icon-btn" data-action="theme" aria-label="Toggle theme">${icon(state.theme === 'dark' ? 'sun' : 'moon')}</button>${state.user ? `<span class="avatar" title="${escapeHtml(state.user.name)}">${escapeHtml(state.user.name.slice(0, 1).toUpperCase())}</span><button class="link-btn" data-action="sign-out">Sign out</button>` : '<button class="btn btn-outline" data-action="login">Login</button>'}</div></header><main class="content">${body}</main></div></div>${modalView()}`
  }

  function render() {
    const route = (location.hash.replace(/^#\/?/, '') || '').split('/').filter(Boolean)
    if (!route.length || route[0] !== 'app') {
      root.innerHTML = landingPage() + modalView()
      return
    }
    const page = ['image', 'video', 'batch', 'reports', 'performance', 'api'].includes(route[1]) ? route[1] : 'image'
    root.innerHTML = appPage(page, page === 'reports' ? decodeURIComponent(route[2] || '') : '')
  }

  async function runAnalysis(file, kind, batchIndex = -1) {
    const error = validateFile(file, kind)
    if (error) throw new Error(error)
    const result = kind === 'video'
      ? await analyzeVideo(file, (stage, stages) => updateProgress(stage, stages, batchIndex))
      : await analyzeImage(file, (stage, stages) => updateProgress(stage, stages, batchIndex))
    return result
  }

  function updateProgress(stage, stages, batchIndex) {
    if (batchIndex >= 0) {
      state.batch[batchIndex].status = 'running'
      render()
      return
    }
    const kind = stages === videoStages ? 'video' : 'image'
    state.busy = { stage, stages, kind, title: kind === 'video' ? 'Analyzing video' : 'Analyzing image' }
    render()
  }

  async function startSingle(file, kind) {
    state.error = ''
    const problem = validateFile(file, kind)
    if (problem) {
      state.error = problem
      render()
      return
    }
    if (!consume()) return
    if (state.result?.objectUrl) URL.revokeObjectURL(state.result.objectUrl)
    state.result = null
    state.busy = { stage: 0, stages: kind === 'video' ? videoStages : imageStages, kind, title: kind === 'video' ? 'Analyzing video' : 'Analyzing image' }
    render()
    try {
      const result = await runAnalysis(file, kind)
      state.result = result
      state.videoFile = kind === 'video' ? file : null
      addReport(result)
      toast('Analysis example is ready.', 'ok')
    } catch (error) {
      state.error = error.message
      state.usage.count = Math.max(0, state.usage.count - 1)
      save('dv.usage', state.usage)
    } finally {
      state.busy = null
      render()
    }
  }

  async function startBatch(files) {
    if (state.batchBusy) return
    const incoming = Array.from(files).map((file) => {
      const kind = file.type.startsWith('video/') ? 'video' : 'image'
      const error = validateFile(file, kind)
      return { file, kind, status: error ? 'error' : 'queued', error: error || '' }
    })
    const valid = incoming.filter((item) => item.status === 'queued').length
    state.batch.push(...incoming)
    if (!valid) {
      render()
      return
    }
    if (!consume(valid)) {
      state.batch.splice(state.batch.length - incoming.length, incoming.length)
      render()
      return
    }
    state.batchBusy = true
    render()
    for (let index = state.batch.length - incoming.length; index < state.batch.length; index++) {
      const item = state.batch[index]
      if (item.status !== 'queued') continue
      try {
        item.result = await runAnalysis(item.file, item.kind, index)
        item.status = 'done'
        addReport(item.result)
        if (item.result.objectUrl) URL.revokeObjectURL(item.result.objectUrl)
        delete item.result.objectUrl
      } catch (error) {
        item.status = 'error'
        item.error = error.message
      }
      render()
    }
    state.batchBusy = false
    render()
    toast('Batch finished.', 'ok')
  }

  function download(name, content, type) {
    const url = URL.createObjectURL(new Blob([content], { type }))
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = name
    anchor.click()
    setTimeout(() => URL.revokeObjectURL(url), 500)
  }

  function exportJson(result) {
    if (!result) return toast('Report data could not be found.', 'warn')
    const { preview, frames, objectUrl, ...rest } = result
    const cleaned = { ...rest, frames: frames?.map(({ thumb, ...frame }) => frame) }
    download(`${result.id}.json`, JSON.stringify(cleaned, null, 2), 'application/json')
  }

  function exportCsv() {
    const completed = state.batch.filter((item) => item.result)
    if (!completed.length) return
    const rows = [['file', 'type', 'verdict', 'risk', 'confidence', 'report_id']]
    completed.forEach(({ file, kind, result }) => rows.push([file.name, kind, verdict(result.risk).short, result.risk, result.confidence, result.id]))
    const csv = rows.map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(',')).join('\r\n')
    download('pixpect-batch.csv', csv, 'text/csv')
  }

  function clearHistory() {
    if (!state.history.length || !window.confirm('Clear all saved reports from this browser?')) return
    state.history = []
    save('dv.history', [])
    render()
    toast('Saved reports cleared.', 'ok')
  }

  function setTheme(theme) {
    state.theme = theme
    document.documentElement.removeAttribute('data-theme')
    if (theme !== 'system') document.documentElement.setAttribute('data-theme', theme)
    save('dv.theme.v2', theme)
    render()
  }

  function changePlan(plan) {
    if (!(plan in plans)) return
    state.plan = plan
    save('dv.plan', plan)
    state.modal = ''
    render()
    toast(`Switched to the ${plan} sample plan. No payment was taken.`, 'ok')
  }

  root.addEventListener('click', (event) => {
    const action = event.target.closest('[data-action]')
    if (action) {
      const name = action.dataset.action
      if (name === 'browse') {
        action.closest('.dropzone')?.querySelector('input[type=file]')?.click()
      } else if (name === 'reset') {
        if (state.result?.objectUrl) URL.revokeObjectURL(state.result.objectUrl)
        state.result = null
        state.videoFile = null
        state.error = ''
        render()
      } else if (name === 'theme') {
        const next = state.theme === 'dark' ? 'light' : 'dark'
        setTheme(next)
      } else if (name === 'heat-mode') {
        state.heatMode = action.dataset.mode
        render()
      } else if (name === 'export-json') {
        const id = action.dataset.report
        exportJson(id ? state.history.find((item) => item.id === id) : state.result)
      } else if (name === 'export-csv') exportCsv()
      else if (name === 'clear-batch' && !state.batchBusy) { state.batch = []; render() }
      else if (name === 'clear-history') clearHistory()
      else if (name === 'print') window.print()
      else if (name === 'upgrade') { state.modal = 'upgrade'; render() }
      else if (name === 'upgrade-plan') changePlan($('[data-setting=plan]')?.value || 'pro')
      else if (name === 'choose-plan') changePlan(action.dataset.plan)
      else if (name === 'close-modal') {
        if (event.target === action || action.classList.contains('modal-close')) {
          state.modal = ''
          render()
        }
      } else if (name === 'login') { state.modal = 'login'; render() }
      else if (name === 'sign-out') { state.user = null; save('dv.user', null); render() }
      else if (name === 'menu') $('#sidebar')?.classList.add('open')
      else if (name === 'close-menu') $('#sidebar')?.classList.remove('open')
      else if (action.hasAttribute('data-seek')) {
        const targetTime = Number(action.dataset.seek)
        const player = $('.player')
        if (player) {
          player.currentTime = targetTime
          player.play().catch(() => {})
        }
      }
      return
    }
    const segment = event.target.closest('[data-seek]')
    if (segment) {
      const player = $('.player')
      if (player) {
        player.currentTime = Number(segment.dataset.seek)
        player.play().catch(() => {})
      }
    }
  })

  root.addEventListener('change', (event) => {
    const input = event.target
    if (input.matches('[data-file-input]')) {
      const files = Array.from(input.files || [])
      if (input.dataset.fileInput === 'batch') startBatch(files)
      else if (files[0]) startSingle(files[0], input.dataset.fileInput)
      input.value = ''
    } else if (input.matches('[data-setting=theme]')) setTheme(input.value)
    else if (input.matches('[data-setting=plan]')) changePlan(input.value)
    else if (input.matches('[data-action=opacity]')) {
      state.heatOpacity = Number(input.value)
      const overlay = $('.heat-overlay')
      if (overlay) overlay.querySelectorAll('.heat-spot').forEach((spot) => {
        const pointOpacity = Number(spot.style.opacity)
        spot.style.opacity = String(Math.min(.9, pointOpacity * (state.heatOpacity / .6)))
      })
    }
  })

  root.addEventListener('submit', (event) => {
    const form = event.target.closest('[data-form=login]')
    if (!form) return
    event.preventDefault()
    const name = new FormData(form).get('name')?.trim()
    if (!name) return
    state.user = { name }
    save('dv.user', state.user)
    state.modal = ''
    render()
    toast(`Welcome, ${name}.`, 'ok')
  })

  root.addEventListener('timeupdate', (event) => {
    if (!event.target.matches('.player') || !state.result?.duration) return
    const head = $('.tl-head')
    if (head) head.style.left = `${Math.min(100, event.target.currentTime / state.result.duration * 100)}%`
  }, true)

  root.addEventListener('dragover', (event) => {
    const zone = event.target.closest('[data-drop]')
    if (!zone) return
    event.preventDefault()
    zone.classList.add('over')
  })
  root.addEventListener('dragleave', (event) => event.target.closest('[data-drop]')?.classList.remove('over'))
  root.addEventListener('drop', (event) => {
    const zone = event.target.closest('[data-drop]')
    if (!zone) return
    event.preventDefault()
    zone.classList.remove('over')
    if (zone.dataset.drop === 'batch') startBatch(event.dataTransfer.files)
    else if (event.dataTransfer.files[0]) startSingle(event.dataTransfer.files[0], zone.dataset.drop)
  })
  window.addEventListener('hashchange', render)
  window.addEventListener('beforeunload', () => {
    if (state.result?.objectUrl) URL.revokeObjectURL(state.result.objectUrl)
  })
  render()
})()
