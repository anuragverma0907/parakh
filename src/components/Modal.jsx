import { useEffect } from 'react'
import Icon from './Icon.jsx'

export default function Modal({ title, onClose, children }) {
  useEffect(() => {
    const k = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [onClose])
  return (
    <div className="modal-back" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={title}>
        <button className="icon-btn modal-x" onClick={onClose} aria-label="Close"><Icon name="x" /></button>
        <h2>{title}</h2>
        {children}
      </div>
    </div>
  )
}
