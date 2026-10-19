import Logo from './Logo.jsx'
import { goSection } from './Navbar.jsx'
import { Link } from '../router.jsx'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="wrap foot-in">
        <div>
          <Logo />
          <p className="sub">Authentic media. A safer digital world.</p>
        </div>
        <nav aria-label="Footer">
          <button onClick={() => goSection('features')}>Features</button>
          <button onClick={() => goSection('pricing')}>Pricing</button>
          <button onClick={() => goSection('about')}>About</button>
          <Link to="/app/api">Settings</Link>
          <Link to="/app/performance">Performance</Link>
        </nav>
        <p className="sub small">© 2026 Pixpect. Generated scores and performance metrics are examples, not authenticity assessments.</p>
      </div>
    </footer>
  )
}
