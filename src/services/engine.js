/**
 * Pixpect media analysis service.
 *
 * Frontend-only demo: media is read in the browser and detection scores and
 * heatmaps are generated locally for the browser experience.
 */

export const MAX_IMAGE_MB = 10
export const MAX_VIDEO_MB = 500
export const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
export const VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/webm', 'video/x-matroska']

export const THRESH = { low: 35, high: 65 }
export const verdictOf = (risk) =>
  risk < THRESH.low
    ? { key: 'real', label: 'Likely Real', short: 'Real', tone: 'ok' }
    : risk < THRESH.high
    ? { key: 'suspicious', label: 'Suspicious', short: 'Suspicious', tone: 'warn' }
    : { key: 'fake', label: 'Manipulated (Likely)', short: 'Manipulated', tone: 'bad' }

export const levelOf = (s) => (s < 0.35 ? 'low' : s < 0.6 ? 'medium' : 'high')

/* ---------- helpers ---------- */
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const clamp = (x, a, b) => Math.min(b, Math.max(a, x))
function hash(str) {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}
function rng(seed) {
  let s = seed || 1
  return () => {
    s ^= s << 13
    s ^= s >>> 17
    s ^= s << 5
    s >>>= 0
    return s / 4294967296
  }
}
export const fmtTime = (t) => {
  const m = Math.floor(t / 60)
  const s = Math.floor(t % 60)
  return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0')
}
export const fmtSize = (b) => (b > 1e6 ? (b / 1e6).toFixed(1) + ' MB' : Math.max(1, Math.round(b / 1e3)) + ' KB')
const newId = () => 'DV-' + Date.now().toString(36).toUpperCase() + Math.floor(Math.random() * 46656).toString(36).toUpperCase()

export function validateFile(file, kind) {
  if (kind === 'image') {
    if (!IMAGE_TYPES.includes(file.type)) return 'Unsupported format. Use JPG, PNG or WEBP.'
    if (file.size > MAX_IMAGE_MB * 1e6) return `Image is larger than ${MAX_IMAGE_MB} MB. Try a smaller file.`
  } else {
    if (!VIDEO_TYPES.includes(file.type)) return 'Unsupported format. Use MP4, MOV, WEBM or MKV.'
    if (file.size > MAX_VIDEO_MB * 1e6) return `Video is larger than ${MAX_VIDEO_MB} MB. Trim it and try again.`
  }
  return null
}

/* ---------- generated face regions & heat ---------- */
const FACE = {
  eyes: [[0.37, 0.38], [0.63, 0.38]],
  mouth: [[0.5, 0.64]],
  jaw: [[0.5, 0.84]],
  skin: [[0.3, 0.58], [0.7, 0.58], [0.5, 0.5]],
  hairline: [[0.5, 0.2]],
}
export const REGION_LABELS = {
  eyes: 'Eye area',
  mouth: 'Mouth region',
  jaw: 'Jawline / face boundary',
  skin: 'Skin texture',
  hairline: 'Hairline blending',
}
function makeRegions(rand, intensity) {
  const regions = {}
  const keys = Object.keys(FACE)
  const hotChance = 0.3 + intensity * 0.5
  keys.forEach((k) => {
    const hot = rand() < hotChance
    regions[k] = clamp(intensity * (hot ? 0.75 + rand() * 0.25 : 0.2 + rand() * 0.25) + rand() * 0.05, 0.02, 0.99)
  })
  return regions
}
function heatFrom(regions, rand) {
  const pts = []
  Object.entries(FACE).forEach(([k, list]) =>
    list.forEach(([x, y]) =>
      pts.push({ x: x + (rand() - 0.5) * 0.04, y: y + (rand() - 0.5) * 0.04, r: 0.1 + rand() * 0.07, v: regions[k] })
    )
  )
  return pts
}
const TECHNIQUES = ['Deepfakes', 'FaceSwap', 'Face2Face', 'NeuralTextures']

/* ---------- media helpers ---------- */
export function readImage(file, max = 512) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      const k = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight))
      const c = document.createElement('canvas')
      c.width = Math.round(img.naturalWidth * k)
      c.height = Math.round(img.naturalHeight * k)
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height)
      URL.revokeObjectURL(url)
      resolve({ dataUrl: c.toDataURL('image/jpeg', 0.82), width: img.naturalWidth, height: img.naturalHeight })
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('This image could not be opened. Check that the file is not corrupted.'))
    }
    img.src = url
  })
}

function seek(v, t) {
  return new Promise((res) => {
    const done = () => {
      v.removeEventListener('seeked', done)
      res()
    }
    v.addEventListener('seeked', done)
    v.currentTime = t
    setTimeout(done, 3000)
  })
}

export async function extractFrames(file, count = 8) {
  const url = URL.createObjectURL(file)
  const v = document.createElement('video')
  v.muted = true
  v.preload = 'auto'
  v.playsInline = true
  v.src = url
  try {
    await new Promise((res, rej) => {
      v.onloadedmetadata = res
      v.onerror = () => rej(new Error('This video could not be read. Try MP4 (H.264).'))
      setTimeout(() => rej(new Error('Reading the video timed out. Try a shorter clip.')), 20000)
    })
    const duration = isFinite(v.duration) && v.duration > 0 ? v.duration : 10
    const W = 240
    const H = Math.round((W * (v.videoHeight || 9)) / (v.videoWidth || 16))
    const c = document.createElement('canvas')
    c.width = W
    c.height = H
    const ctx = c.getContext('2d')
    const frames = []
    for (let i = 0; i < count; i++) {
      const t = (duration * (i + 0.5)) / count
      await seek(v, t)
      ctx.drawImage(v, 0, 0, W, H)
      frames.push({ t, thumb: c.toDataURL('image/jpeg', 0.7) })
    }
    return { duration, frames, width: v.videoWidth, height: v.videoHeight }
  } finally {
    URL.revokeObjectURL(url)
  }
}

/* ---------- image analysis ---------- */
export const IMAGE_STAGES = ['Uploading file', 'Detecting face', 'Extracting features', 'Running detection model', 'Building attention map']
export const VIDEO_STAGES = ['Uploading file', 'Extracting frames', 'Scoring each frame', 'Locating suspicious segments', 'Building attention maps']

export async function analyzeImage(file, { onStage } = {}) {
  const preview = await readImage(file)

  const rand = rng(hash(file.name + file.size))
  for (let i = 0; i < IMAGE_STAGES.length; i++) {
    onStage && onStage(i)
    await sleep(380 + rand() * 260)
  }
  const fake = rand() < 0.5
  const risk = Math.round(fake ? 58 + rand() * 38 : 4 + rand() * 26)
  const regions = makeRegions(rand, risk / 100)
  return {
    id: newId(),
    type: 'image',
    fileName: file.name,
    size: file.size,
    width: preview.width,
    height: preview.height,
    createdAt: new Date().toISOString(),
    preview: preview.dataUrl,
    risk,
    authenticity: 100 - risk,
    confidence: Math.round(clamp(62 + (Math.abs(risk - 50) / 50) * 34 + rand() * 3, 55, 99)),
    technique: risk >= THRESH.low ? TECHNIQUES[Math.floor(rand() * 4)] : null,
    regions,
    heat: heatFrom(regions, rand),
    demo: true,
  }
}

/* ---------- video analysis ---------- */
export async function analyzeVideo(file, { onStage } = {}) {
  onStage && onStage(0)
  await sleep(300)
  onStage && onStage(1)
  const media = await extractFrames(file, 8)

  const { duration } = media
  const rand = rng(hash(file.name + file.size))
  onStage && onStage(2)
  await sleep(700)

  const hot = rand() < 0.5
  const N = clamp(Math.round(duration), 12, 60)
  const center = (0.25 + rand() * 0.5) * duration
  const width = (0.07 + rand() * 0.08) * duration
  const amp = 0.55 + rand() * 0.3
  const base = 0.06 + rand() * 0.12
  const series = Array.from({ length: N }, (_, i) => {
    const t = (i * duration) / (N - 1)
    const bump = hot ? amp * Math.exp(-(((t - center) / width) ** 2)) : 0
    return { t, score: clamp(base + (rand() - 0.5) * 0.1 + bump, 0.01, 0.99) }
  })
  const at = (t) => series.reduce((b, p) => (Math.abs(p.t - t) < Math.abs(b.t - t) ? p : b), series[0]).score

  onStage && onStage(3)
  await sleep(600)
  const SEG = 12
  const segments = Array.from({ length: SEG }, (_, i) => {
    const start = (i * duration) / SEG
    const end = ((i + 1) * duration) / SEG
    const pts = series.filter((p) => p.t >= start && p.t <= end)
    const score = pts.length ? pts.reduce((a, p) => a + p.score, 0) / pts.length : at(start)
    return { start, end, score, level: levelOf(score) }
  })
  const suspicious = []
  segments.forEach((s) => {
    if (s.level === 'low') return
    const last = suspicious[suspicious.length - 1]
    if (last && Math.abs(last.end - s.start) < 1e-6) {
      last.end = s.end
      last.score = Math.max(last.score, s.score)
      if (s.level === 'high') last.level = 'high'
    } else suspicious.push({ start: s.start, end: s.end, score: s.score, level: s.level })
  })

  onStage && onStage(4)
  await sleep(500)
  const frames = media.frames.map((f, i) => {
    const score = at(f.t)
    const fr = rng(hash(file.name + i))
    const regions = makeRegions(fr, score)
    return { t: f.t, thumb: f.thumb, score, regions, heat: heatFrom(regions, fr) }
  })
  const mean = series.reduce((a, p) => a + p.score, 0) / N
  const max = Math.max(...series.map((p) => p.score))
  const risk = Math.round(100 * (0.35 * mean + 0.65 * max))
  const worst = frames.reduce((b, f) => (f.score > b.score ? f : b), frames[0])

  return {
    id: newId(),
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
    confidence: Math.round(clamp(66 + (Math.abs(risk - 50) / 50) * 30 + rand() * 3, 55, 99)),
    technique: risk >= THRESH.low ? TECHNIQUES[Math.floor(rand() * 4)] : null,
    regions: worst.regions,
    heat: worst.heat,
    series,
    segments,
    suspicious,
    frames,
    demo: true,
  }
}

/* ---------- report text ---------- */
export function summarize(r) {
  const v = verdictOf(r.risk)
  if (r.type === 'video') {
    if (!r.suspicious?.length) return 'Generated example scores for this clip stayed below the suspicion threshold.'
    const s = r.suspicious.filter((x) => x.level === 'high')
    const list = (s.length ? s : r.suspicious).map((x) => `${fmtTime(x.start)} to ${fmtTime(x.end)}`).join(', ')
    return `${v.label} (generated example). The scores flagged the interval ${list}.`
  }
  if (v.key === 'real') return 'Generated example scores did not indicate a high manipulation risk.'
  const top = Object.entries(r.regions || {}).sort((a, b) => b[1] - a[1]).slice(0, 2).map(([k]) => REGION_LABELS[k].toLowerCase())
  return `${v.label} (generated example). Scores were highest around the ${top.join(' and ')}.`
}

/* ---------- reference model metrics (replace after training) ---------- */
export const METRICS = {
  accuracy: 94.2, precision: 91.7, recall: 88.9, f1: 90.3, auc: 0.962,
  dataset: 'Example data',
  byTechnique: [
    { name: 'Deepfakes', acc: 96.1 },
    { name: 'FaceSwap', acc: 94.8 },
    { name: 'Face2Face', acc: 92.9 },
    { name: 'NeuralTextures', acc: 88.7 },
  ],
  robustness: [
    { test: 'JPEG compression (quality 70)', drop: 4.2 },
    { test: 'Gaussian blur (sigma 1.5)', drop: 6.8 },
    { test: 'Resize to 50%', drop: 5.1 },
    { test: 'Gaussian noise', drop: 8.4 },
    { test: 'Brightness shift', drop: 2.3 },
  ],
}
