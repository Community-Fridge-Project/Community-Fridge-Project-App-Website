import { useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { BRAND, NAV_LINKS } from '../config/site.config'

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  const closeMobile = () => setMobileOpen(false)

  return (
    <header className="sticky top-0 z-50 bg-white border-b-2 border-brand-500 shadow-sm">
      <div className="section-container">
        <div className="flex items-center justify-between h-16 md:h-20">

          {/* ─── LOGO / BRAND NAME ──────────────────────────────── */}
          <Link
            to="/"
            onClick={closeMobile}
            className="flex items-center gap-3 group"
            aria-label={`${BRAND.name} — Home`}
          >
            {/* Fridge icon in brand green */}
            <div className="w-10 h-10 bg-brand-500 rounded-lg flex items-center justify-center
                            group-hover:bg-brand-600 transition-colors duration-200 flex-shrink-0">
              <span className="text-white text-xl" role="img" aria-hidden="true">🥦</span>
            </div>
            <div className="leading-none">
              <span className="block text-brand-600 font-extrabold text-lg md:text-xl tracking-tight">
                Community
              </span>
              <span className="block text-gray-800 font-extrabold text-lg md:text-xl tracking-tight -mt-0.5">
                Fridge Project
              </span>
            </div>
          </Link>

          {/* ─── DESKTOP NAV ────────────────────────────────────── */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-brand-100 text-brand-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
            <Link
              to="/volunteer"
              className="ml-3 btn-primary text-sm px-5 py-2"
            >
              Volunteer Now
            </Link>
          </nav>

          {/* ─── MOBILE MENU TOGGLE ─────────────────────────────── */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100
                       focus-visible:ring-2 focus-visible:ring-brand-500 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* ─── MOBILE DROPDOWN NAV ──────────────────────────────── */}
        {mobileOpen && (
          <nav
            className="md:hidden border-t border-gray-100 py-4 space-y-1"
            aria-label="Mobile navigation"
          >
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={closeMobile}
                className={({ isActive }) =>
                  `block px-4 py-3 rounded-lg text-base font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-brand-100 text-brand-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
            <div className="pt-2 px-4">
              <Link
                to="/volunteer"
                onClick={closeMobile}
                className="btn-primary w-full text-center"
              >
                Volunteer Now
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}
