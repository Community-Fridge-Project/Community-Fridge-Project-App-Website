import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { BRAND } from '../config/site.config'

// ─── FRIDGE ICON LOGO ─────────────────────────────────────────────────────────
function FridgeIcon({ size = 36 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Fridge body */}
      <rect x="2" y="1" width="20" height="26" rx="3" fill="white" opacity="0.93" />
      {/* Freezer / main compartment divider */}
      <line x1="2" y1="10" x2="22" y2="10" stroke="rgba(59,170,53,0.35)" strokeWidth="1.5" />
      {/* Freezer handle */}
      <line x1="6.5" y1="4.5" x2="6.5" y2="8" stroke="rgba(59,170,53,0.55)" strokeWidth="2" strokeLinecap="round" />
      {/* Main compartment handle */}
      <line x1="6.5" y1="14" x2="6.5" y2="21" stroke="rgba(59,170,53,0.55)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const closeMobile = () => setMobileOpen(false)

  const navLinkClass = ({ isActive }) =>
    `px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
      isActive
        ? 'bg-brand-100 text-brand-700'
        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
    }`

  const mobileNavLinkClass = ({ isActive }) =>
    `block px-4 py-3 rounded-lg text-base font-semibold transition-all duration-200 ${
      isActive ? 'bg-brand-100 text-brand-700' : 'text-gray-700 hover:bg-gray-100'
    }`

  return (
    <header className="sticky top-0 z-50 bg-white border-b-2 border-brand-500 shadow-sm">
      <div className="section-container">
        <div className="flex items-center justify-between h-16 md:h-20">

          {/* ─── LOGO ─────────────────────────────────────────── */}
          <Link
            to="/"
            onClick={closeMobile}
            className="flex items-center gap-3 group"
            aria-label={`${BRAND.name} — Home`}
          >
            <div className="h-14 flex items-center justify-center flex-shrink-0">
              <img
                src="/images/community-fridge-project-logo.png"
                alt=""
                className="h-full w-auto object-contain"
              />
            </div>
            <div className="leading-none">
              <span className="block text-brand-600 font-extrabold text-lg md:text-xl tracking-tight">
                The Community
              </span>
              <span className="block text-gray-800 font-extrabold text-lg md:text-xl tracking-tight -mt-0.5">
                Fridge Project
              </span>
            </div>
          </Link>

          {/* ─── DESKTOP NAV ──────────────────────────────────── */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
            <NavLink to="/" className={navLinkClass}>Home</NavLink>
            <NavLink to="/about" className={navLinkClass}>About Us</NavLink>
            <NavLink to="/volunteer" className={navLinkClass}>Volunteer</NavLink>
            <NavLink to="/donate" className={navLinkClass}>Support Us</NavLink>
            <NavLink to="/contact" className={navLinkClass}>Contact</NavLink>
            <a
              href="https://www.paypal.com/donate/?hosted_button_id=LK3CRNSRVGCBL"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-3 btn-primary text-sm px-5 py-2"
            >
              Donate
            </a>
          </nav>

          {/* ─── MOBILE TOGGLE ────────────────────────────────── */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* ─── MOBILE NAV ───────────────────────────────────── */}
        {mobileOpen && (
          <nav className="md:hidden border-t border-gray-100 py-4 space-y-1" aria-label="Mobile navigation">
            <NavLink to="/" onClick={closeMobile} className={mobileNavLinkClass}>Home</NavLink>
            <NavLink to="/about" onClick={closeMobile} className={mobileNavLinkClass}>About Us</NavLink>
            <NavLink to="/volunteer" onClick={closeMobile} className={mobileNavLinkClass}>Volunteer</NavLink>
            <NavLink to="/donate" onClick={closeMobile} className={mobileNavLinkClass}>Support Us</NavLink>
            <NavLink to="/contact" onClick={closeMobile} className={mobileNavLinkClass}>Contact</NavLink>
            <div className="pt-2 px-4">
            <a             
              href="https://www.paypal.com/donate/?hosted_button_id=LK3CRNSRVGCBL"
              target="_blank"
              rel="noopener noreferrer"
              onClick={closeMobile}
              className="btn-primary w-full text-center block"
            >
              Donate
            </a>
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}
