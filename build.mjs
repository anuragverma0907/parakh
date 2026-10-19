import { build } from 'esbuild'
import fs from 'node:fs'
const out = await build({
  entryPoints: ['src/main.jsx'], bundle: true, write: false, minify: true, format: 'iife',
  jsx: 'automatic', loader: { '.jsx': 'jsx' }, outdir: 'dist', target: 'es2020',
  define: { 'process.env.NODE_ENV': '"production"', 'import.meta.env': '{}' },
})
let js = '', css = ''
for (const f of out.outputFiles) f.path.endsWith('.css') ? (css = f.text) : (js = f.text)
const logoData = fs.readFileSync('public/pixpect-logo.png').toString('base64')
js = js.replaceAll('/pixpect-logo.png', `data:image/png;base64,${logoData}`)
const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1.0"/><title>Pixpect | परख</title><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;500;600&family=Sora:wght@500;600;700&display=swap"/><style>${css}</style></head><body><div id="root"></div><script>${js.replace(/<\/script/g, '<\\/script')}</script></body></html>`
fs.mkdirSync('dist', { recursive: true })
fs.writeFileSync('dist/index.html', html)
console.log('dist/index.html', (html.length / 1024).toFixed(0) + ' KB')
