import { Heart, Package, CheckCircle, XCircle, ShoppingBag } from 'lucide-react'
import { useContent } from '../hooks/useContent'
import { PageWithSidebar } from '../components/PageImageSidebar'

const CANNOT_DONATE = [
  'Raw meat',
  'Raw fish',
  'Alcohol',
  'Raw milk cheeses',
  'Unlabeled multi-ingredient items',
  'Half-eaten leftovers',
  'Leftovers',
  'Any food in a broken or unsealed container or package',
  'Any peanut products',
]

const CAN_DONATE = [
  'Sealed packaged food',
  'Cheeses',
  'Fresh fruit',
  'Fresh vegetables',
  'Table sauces',
  'Pastries',
  'Bread',
]

const PANTRY_ACCEPTS = [
  'Sealed and unexpired canned goods',
  'Pasta and rice',
  'Boxed shelf stable meal kits',
]

export default function Donate() {
  const { pages, images } = useContent()

  return (
    <>
      {/* ── PAGE HEADER ─────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-brand-600 to-brand-500 text-white py-20">
        <div className="section-container">
          <span className="badge-green bg-white/20 text-white border border-white/30 mb-4 block w-fit">
            Make a Difference
          </span>
          <h1 className="text-white mb-4">{pages.donateHeadline}</h1>
          <p className="text-brand-100 text-xl max-w-2xl">
            {pages.donateIntro}
          </p>
        </div>
      </section>

      <PageWithSidebar images={images.donate}>

      {/* ── FINANCIAL DONATIONS ─────────────────────────────────────── */}
      <section className="section-py bg-white">
        <div className="section-container">
          <div className="max-w-2xl mx-auto">
            <div className="bg-brand-50 border-2 border-brand-300 rounded-2xl p-8 text-center">
              <div className="flex justify-center mb-4">
                <a
                  href="https://www.communityofcongregations.org"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    src="/images/coc-logo.png"
                    alt="Community of Congregations"
                    className="h-16 w-auto object-contain hover:opacity-80 transition-opacity"
                    onError={e => { e.currentTarget.style.display = 'none' }}
                  />
                </a>
              </div>
              <p className="text-brand-800 font-bold text-lg mb-2">
                Donate Financially Through the Community of Congregations
              </p>
              <p className="text-gray-500 text-sm mb-6">
                Community of Congregations is a 501(c)(3) nonprofit organization.
                Your donation is tax-deductible.
              </p>
              <a
                href="https://www.communityofcongregations.org/give/"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary text-base px-8 py-3 inline-flex items-center gap-2"
              >
                <Heart size={18} />
                Donate Now
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── VISUAL DIVIDER ──────────────────────────────────────────── */}
      <div className="border-t-4 border-brand-100 mx-auto max-w-3xl" />

      {/* ── FOOD DONATIONS ──────────────────────────────────────────── */}
      <section className="section-py bg-white">
        <div className="section-container">
          <div className="max-w-3xl mx-auto">

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Package className="text-brand-600" size={24} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Food Donations</h2>
            </div>
            <p className="text-gray-600 mb-10 leading-relaxed">
              Food donations from individuals are crucial for keeping the fridge stocked and the
              community nourished. We ask that you follow our food donation guidelines:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">

              {/* Cannot donate */}
              <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <XCircle size={20} className="text-red-500 flex-shrink-0" />
                  <h3 className="font-bold text-red-700 text-base">What Cannot Be Donated</h3>
                </div>
                <ul className="space-y-2">
                  {CANNOT_DONATE.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-red-800 text-sm">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Can donate */}
              <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle size={20} className="text-brand-500 flex-shrink-0" />
                  <h3 className="font-bold text-brand-700 text-base">What Can Be Donated</h3>
                </div>
                <ul className="space-y-2">
                  {CAN_DONATE.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-brand-800 text-sm">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand-400 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Pantry accepts */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <ShoppingBag size={20} className="text-amber-600 flex-shrink-0" />
                <h3 className="font-bold text-amber-800 text-base">Pantries Can Accept</h3>
              </div>
              <ul className="flex flex-wrap gap-3">
                {PANTRY_ACCEPTS.map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-amber-800 text-sm
                                         bg-amber-100 rounded-lg px-3 py-1.5">
                    <CheckCircle size={14} className="text-amber-600 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>
      </section>

      </PageWithSidebar>
    </>
  )
}
