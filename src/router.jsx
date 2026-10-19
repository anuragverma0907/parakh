import { useEffect, useState } from 'react'

// Tiny hash router (no dependency): routes look like  #/app/image
const read = () => (window.location.hash.replace(/^#/, '') || '/')

export function useRoute() {
  const [path, setPath] = useState(read)
  useEffect(() => {
    const on = () => setPath(read())
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  return path
}

export function navigate(to) {
  window.location.hash = to
  window.scrollTo({ top: 0 })
}

export function Link({ to, children, className, onClick, ...rest }) {
  return (
    <a
      href={'#' + to}
      className={className}
      onClick={(e) => {
        onClick && onClick(e)
        window.scrollTo({ top: 0 })
      }}
      {...rest}
    >
      {children}
    </a>
  )
}
