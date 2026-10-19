import { useState } from 'react'
import Icon from './Icon.jsx'
import Logo from './Logo.jsx'
import { Link, navigate } from '../router.jsx'
import { useStore } from '../store.jsx'

export function ThemeToggle() {
  const { theme, setTheme } = useStore()
  return (
    <button className="icon-btn" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}>
      <Icon name={theme === 'dark' ? 'sun' : 'moon'} />
    </button>
  )
}

export function goSection(id) {
  const scroll = () => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  if ((window.location.hash || '#/') !== '#/') {
    navigate('/')
    setTimeout(scroll, 120)
  } else scroll()
}

export function UserChip() {
  const { user, setUser, setModal } = useStore()
  if (!user) {
    return (
      <>
        <button className="btn btn-outline" onClick={() => setModal('login')}>Login</button>
        <Link to="/app/image" className="btn btn-primary">Get started</Link>
      </>
    )
  }
  return (
    <div className="user-chip">
      <span className="avatar" aria-hidden="true">{user.name.slice(0, 1).toUpperCase()}</span>
      <span className="u-name">{user.name}</span>
      <button className="link-btn" onClick={() => setUser(null)}>Sign out</button>
    </div>
  )
}

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const go = (id) => { setOpen(false); goSection(id) }
  return (
    <header className="nav">
      <div className="wrap nav-in">
        <Logo />
        <nav className={'nav-links' + (open ? ' open' : '')} aria-label="Main">
          <button onClick={() => { setOpen(false); navigate('/') }}>Home</button>
          <button onClick={() => go('features')}>Features</button>
          <button onClick={() => go('pricing')}>Pricing</button>
          <button onClick={() => go('about')}>About</button>
          <div className="nav-cta-m"><UserChip /></div>
        </nav>
        <div className="nav-right">
          <ThemeToggle />
          <div className="nav-cta"><UserChip /></div>
          <button className="icon-btn nav-burger" onClick={() => setOpen(!open)} aria-label="Menu" aria-expanded={open}><Icon name={open ? 'x' : 'menu'} /></button>
        </div>
      </div>
    </header>
  )
}
