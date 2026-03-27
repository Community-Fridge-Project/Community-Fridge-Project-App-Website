import { Link } from 'react-router-dom'
import { Heart, Mail } from 'lucide-react'
import { BRAND, NAV_LINKS, FRIDGE_LOCATIONS } from '../config/site.config'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* ─── MAIN FOOTER GRID ──────────────────────────────────── */}
      <div className="section-container py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand column */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-brand-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xl" role="img" aria-hidden="true">🥦</span>
              </div>
              <div className="leading-none">
                <span className="block text-white font-extrabold text-lg">Community</span>
                <span className="block text-brand-400 font-extrabold text-lg -mt-0.5">Fridge Project</span>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
              {BRAND.tagline}. Neighbors feeding neighbors across Austin, TX.
              Free food, always available, no questions asked.
            </p>
            {BRAND.email && (
              <a
                href={`mailto:${BRAND.email}`}
                className="inline-flex items-center gap-2 mt-4 text-brand-400 hover:text-brand-300
                           text-sm font-medium transition-colors"
              >
                <Mail size={15} />
                {BRAND.email}
              </a>
            )}
          </div>

          {/* Navigation column */}
          <div>
            <h3 className="text-white font-bold text-base mb-4 uppercase tracking-wider text-sm">
              Navigate
            </h3>
            <ul className="space-y-2">
              {NAV_LINKS.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-gray-400 hover:text-brand-400 text-sm font-medium transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Fridge Locations column */}
          <div>
            <h3 className="text-white font-bold text-sm mb-4 uppercase tracking-wider">
              Our Fridges
            </h3>
            <ul className="space-y-2">
              {FRIDGE_LOCATIONS.slice(0, 6).map((loc) => (
                <li key={loc.id} className="text-gray-400 text-sm">
                  📍 {loc.neighborhood}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* ─── BOTTOM BAR ──────────────────────────────────────── */}
      <div className="border-t border-gray-800">
        <div className="section-container py-5 flex flex-col sm:flex-row items-center
                        justify-between gap-3 text-xs text-gray-500">
          <p>
            © {year} {BRAND.name}. All rights reserved.
          </p>
          <p className="flex items-center gap-1">
            Made with <Heart size={12} className="text-brand-500 fill-brand-500" /> for Austin neighbors
          </p>
          <Link
            to="/admin"
            className="text-gray-600 hover:text-gray-400 transition-colors"
            aria-label="Admin portal"
          >
            Admin
          </Link>
        </div>
      </div>
    </footer>
  )
}
