import { useState } from 'react'
import Icon from './Icon.jsx'
import Logo from './Logo.jsx'
import { ThemeToggle } from './Navbar.jsx'
import { Link, navigate } from '../router.jsx'
import { PLANS, useStore } from '../store.jsx'

const NAV = [
  ['/app/image', 'Image detection', 'image'],
  ['/app/video', 'Video detection', 'video'],
  ['/app/batch', 'Batch processing', 'layers'],
  ['/app/reports', 'Reports', 'file'],
  ['/app/performance', 'Model performance', 'gauge'],
  ['/app/api', 'Settings', 'settings'],
]

export default function AppLayout({ path, title, children }) {
  const [open, setOpen] = useState(false)
  const { plan, usage, limit, user, setModal } = useStore()
  const pct = limit === Infinity ? 0 : Math.min(100, (usage.count / limit) * 100)
  return (
    <div className="app">
      <aside className={'side' + (open ? ' open' : '')}>
        <div className="side-top"><Logo /></div>
        <nav aria-label="App">
          {NAV.map(([to, label, icon]) => (
            <Link key={to} to={to} className={'side-link' + (path.startsWith(to) ? ' active' : '')} onClick={() => setOpen(false)}>
              <Icon name={icon} size={18} />{label}
            </Link>
          ))}
        </nav>
        <div className="usage card">
          <div className="usage-h"><b>{PLANS[plan].name} plan</b><span className="mono">{usage.count}/{limit === Infinity ? '∞' : limit}</span></div>
          <div className="bar sm"><i className={pct > 80 ? 'hi' : ''} style={{ width: pct + '%' }} /></div>
          <p className="sub small">Scans today</p>
          <button className="btn btn-outline full" onClick={() => setModal('upgrade')}>Change plan</button>
        </div>
        <Link to="/" className="side-link back"><Icon name="arrow" size={16} className="flip" />Back to site</Link>
      </aside>
      {open && <div className="scrim" onClick={() => setOpen(false)} />}
      <div className="main">
        <header className="topbar">
          <button className="icon-btn burger" onClick={() => setOpen(true)} aria-label="Open menu"><Icon name="menu" /></button>
          <h1>{title}</h1>
          <div className="row">
            <span className="pill warn">Sample results</span>
            <ThemeToggle />
            {user ? <span className="avatar" title={user.name}>{user.name.slice(0, 1).toUpperCase()}</span> : <button className="btn btn-outline" onClick={() => setModal('login')}>Login</button>}
          </div>
        </header>
        <div className="content">{children}</div>
      </div>
    </div>
  )
}
