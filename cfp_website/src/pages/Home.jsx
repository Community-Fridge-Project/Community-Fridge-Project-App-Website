import { Link } from 'react-router-dom'
import { ArrowRight, Heart, Users, DollarSign } from 'lucide-react'
import { HOME } from '../config/site.config'
import { useContent } from '../hooks/useContent'
import VolunteerDashboard from '../components/VolunteerDashboard'

// ─── PHOTO GALLERY ────────────────────────────────────────────────────────────
// Placeholder gallery — swap src values for real image paths in /public/images/
const GALLERY_IMAGES = [
  { src: null, alt: 'Community fridge stocked with fresh produce', label: 'Grace Episcopal Fridge' },
  { src: null, alt: 'Volunteers preparing sack lunches on Monday',  label: 'Monday Sack Lunch Crew' },
  { src: null, alt: 'Community members taking food from the fridge', label: 'Neighbors Helping Neighbors' },
  { src: null, alt: 'Volunteer cleaning and organizing fridge',      label: 'Fridge Maintenance Day' },
  { src: null, alt: 'Food donation drop-off at community fridge',    label: 'Food Donation Drop-Off' },
  { src: null, alt: 'Community fridge in Oak Park',                  label: 'Oak Park Fridge Network' },
]

function GalleryPlaceholder({ label }) {
  return (
    <div className="aspect-square bg-gradient-to-br from-brand-100 to-brand-200
                    rounded-xl flex flex-col items-center justify-center gap-2
                    border-2 border-brand-200 overflow-hidden
                    hover:from-brand-200 hover:to-brand-300 transition-all duration-300">
      <span className="text-4xl" role="img" aria-hidden="true">🥦</span>
      <span className="text-brand-700 text-xs font-semibold text-center px-3 leading-tight">
        {label}
      </span>
    </div>
  )
}

// ─── HOME PAGE ────────────────────────────────────────────────────────────────
export default function Home() {
  const { pages } = useContent()

  // Stats: prefer CMS overrides, fall back to site.config values
  const stats = [
    { value: pages.stat0,      label: pages.stat0Label },
    { value: pages.stat1,      label: pages.stat1Label },
    { value: pages.stat2,      label: pages.stat2Label },
    { value: pages.stat3,      label: pages.stat3Label },
  ]

  return (
    <>
      {/* ── HERO ──────────────────────────────────────────────────────── */}
      <section
        className="relative bg-gradient-to-br from-brand-600 via-brand-500 to-brand-400
                   text-white overflow-hidden"
        aria-label="Hero"
      >
        {/* Decorative circles */}
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-white/10 rounded-full pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-white/5 rounded-full pointer-events-none" />

        <div className="section-container py-20 md:py-32 relative">
          <div className="max-w-3xl">
            <span className="badge-green bg-white/20 text-white border border-white/30 mb-4 block w-fit">
              Oak Park, IL &amp; Austin Chicago · Free for Everyone
            </span>
            <h1 className="text-white mb-6">
              {pages.heroHeadline}
            </h1>
            <p className="text-xl md:text-2xl text-brand-100 mb-10 max-w-xl leading-relaxed font-medium">
              {pages.heroSub}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to={HOME.hero.ctaPath} className="btn-primary bg-white text-brand-600
                                                       hover:bg-brand-50 shadow-lg text-base px-8 py-4">
                {HOME.hero.ctaLabel}
                <ArrowRight size={18} />
              </Link>
              <Link to="/donate" className="btn-secondary border-white text-white
                                            hover:bg-white/10 text-base px-8 py-4">
                Donate Food
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── IMPACT STATS ──────────────────────────────────────────────── */}
      <section className="bg-white border-b border-gray-100" aria-label="Impact statistics">
        <div className="section-container py-10 md:py-14">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 text-center">
            {stats.map((stat, i) => (
              <div key={i}>
                <p className="text-3xl md:text-4xl font-extrabold text-brand-600 mb-1">
                  {stat.value}
                </p>
                <p className="text-sm md:text-base text-gray-500 font-medium">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MISSION STATEMENT ─────────────────────────────────────────── */}
      <section className="section-py bg-neutral-50" aria-labelledby="mission-heading">
        <div className="section-container">
          <div className="max-w-3xl mx-auto text-center">
            <span className="badge-green mb-4">Our Mission</span>
            <h2 id="mission-heading" className="mb-6">
              {pages.missionTitle}
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              {pages.missionBody}
            </p>
          </div>
        </div>
      </section>

      {/* ── PHOTO GALLERY ─────────────────────────────────────────────── */}
      <section className="section-py bg-white" aria-labelledby="gallery-heading">
        <div className="section-container">
          <div className="text-center mb-12">
            <span className="badge-green mb-4">In the Community</span>
            <h2 id="gallery-heading">Our Fridges &amp; Volunteers</h2>
            <p className="text-gray-500 mt-3 text-lg">
              Real neighbors making a real difference — every day, across Oak Park &amp; Austin Chicago.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {GALLERY_IMAGES.map((img, i) =>
              img.src ? (
                <div key={i} className="aspect-square rounded-xl overflow-hidden">
                  <img
                    src={img.src}
                    alt={img.alt}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
              ) : (
                <GalleryPlaceholder key={i} alt={img.alt} label={img.label} />
              )
            )}
          </div>
          <p className="text-center text-sm text-gray-400 mt-4 italic">
            📸 Add real photos by replacing placeholder images in /public/images/
          </p>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────────────── */}
      <section className="section-py bg-neutral-50" aria-labelledby="how-heading">
        <div className="section-container">
          <div className="text-center mb-12">
            <span className="badge-green mb-4">Simple &amp; Open</span>
            <h2 id="how-heading">{HOME.overview.title}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {HOME.overview.steps.map((step, i) => (
              <div key={i} className="card text-center group hover:border-brand-200">
                <div className="text-5xl mb-4" role="img" aria-hidden="true">{step.icon}</div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">{step.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── VOLUNTEER DASHBOARD PREVIEW ───────────────────────────────── */}
      <section className="section-py bg-white" aria-labelledby="dashboard-preview-heading">
        <div className="section-container">
          <div className="text-center mb-12">
            <span className="badge-green mb-4">Real-Time Needs</span>
            <h2 id="dashboard-preview-heading">Volunteer Opportunities</h2>
            <p className="text-gray-500 mt-3 text-lg max-w-2xl mx-auto">
              See where help is needed most this week. Spots fill fast!
            </p>
          </div>
          <VolunteerDashboard previewMode={true} />
          <div className="text-center mt-10">
            <Link to="/volunteer" className="btn-primary text-base px-8 py-4">
              View All Opportunities
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── GET INVOLVED CTA ──────────────────────────────────────────── */}
      <section className="bg-brand-600 text-white section-py" aria-labelledby="cta-heading">
        <div className="section-container">
          <div className="max-w-4xl mx-auto text-center">
            <h2 id="cta-heading" className="text-white mb-6">
              Ready to Make a Difference?
            </h2>
            <p className="text-brand-100 text-xl mb-10 max-w-2xl mx-auto">
              Whether you have 2 hours or 20, there's a way to contribute to your community.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
              <Link to="/volunteer"
                className="bg-white text-brand-600 hover:bg-brand-50 rounded-xl p-6
                           font-bold text-center transition-all duration-200 hover:shadow-lg
                           flex flex-col items-center gap-3">
                <Users size={32} className="text-brand-500" />
                <span>Volunteer</span>
              </Link>
              <Link to="/donate"
                className="bg-white text-brand-600 hover:bg-brand-50 rounded-xl p-6
                           font-bold text-center transition-all duration-200 hover:shadow-lg
                           flex flex-col items-center gap-3">
                <Heart size={32} className="text-brand-500" />
                <span>Donate Food</span>
              </Link>
              <Link to="/donate"
                className="bg-white text-brand-600 hover:bg-brand-50 rounded-xl p-6
                           font-bold text-center transition-all duration-200 hover:shadow-lg
                           flex flex-col items-center gap-3">
                <DollarSign size={32} className="text-brand-500" />
                <span>Give Financially</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
