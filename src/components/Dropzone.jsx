import { useRef, useState } from 'react'
import Icon from './Icon.jsx'

export default function Dropzone({ accept, multiple = false, onFiles, title, hint, icon = 'upload', compact = false }) {
  const input = useRef(null)
  const [over, setOver] = useState(false)

  const handle = (list) => {
    const files = Array.from(list || [])
    if (files.length) onFiles(multiple ? files : [files[0]])
  }

  return (
    <div
      className={'dropzone' + (over ? ' over' : '') + (compact ? ' compact' : '')}
      onDragOver={(e) => { e.preventDefault(); setOver(true) }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => { e.preventDefault(); setOver(false); handle(e.dataTransfer.files) }}
    >
      <Icon name={icon} size={compact ? 26 : 34} className="dz-icon" />
      <p className="dz-title">{title}</p>
      <span className="dz-or">or</span>
      <button type="button" className="btn btn-primary" onClick={() => input.current.click()}>Browse files</button>
      <p className="dz-hint">{hint}</p>
      <input ref={input} type="file" hidden accept={accept} multiple={multiple} onChange={(e) => { handle(e.target.files); e.target.value = '' }} />
    </div>
  )
}
