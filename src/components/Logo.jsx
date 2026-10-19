import { Link } from '../router.jsx'

export default function Logo({ to = '/' }) {
  return (
    <Link to={to} className="logo" aria-label="Pixpect Parakh home">
      <img className="logo-img" src="/pixpect-logo.png" alt="Pixpect | परख" />
    </Link>
  )
}
