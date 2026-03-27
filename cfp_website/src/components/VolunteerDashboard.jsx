/**
 * VolunteerDashboard.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Visual dashboard showing volunteer slot availability.
 *
 * Props:
 *   previewMode (bool) — if true, shows only first 4 slots (used on Home page).
 *                        if false, shows all slots (used on Volunteer page).
 *   slots (array)      — override default slots from site.config (used by Admin CMS).
 *
 * Static shell: slot data comes from site.config.js → VOLUNTEER_SLOTS.
 * To wire to Supabase: replace VOLUNTEER_SLOTS import with a useEffect/fetch hook.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { VOLUNTEER_SLOTS } from '../config/site.config'

// ─── STATUS LOGIC ─────────────────────────────────────────────────────────────
function getSlotStatus(slot) {
  const pct = slot.filled / slot.optimal

  if (slot.filled >= slot.max)       return 'full'
  if (slot.filled >= slot.optimal)   return 'good'
  if (pct >= 0.6)                    return 'warning'
  return 'open'
}

const STATUS_META = {
  full: {
    label: 'Full',
    badgeClass: 'bg-red-100 text-red-700',
    cardClass:  'slot-card-full',
    barClass:   'bg-red-500',
    emoji:      '🔴',
  },
  good: {
    label: 'Filled',
    badgeClass: 'bg-brand-100 text-brand-700',
    cardClass:  'slot-card-good',
    barClass:   'bg-brand-500',
    emoji:      '✅',
  },
  warning: {
    label: 'A Few Spots Left',
    badgeClass: 'bg-yellow-100 text-yellow-700',
    cardClass:  'slot-card-warning',
    barClass:   'bg-yellow-500',
    emoji:      '🟡',
  },
  open: {
    label: 'Needs Volunteers',
    badgeClass: 'bg-brand-100 text-brand-600',
    cardClass:  'slot-card-open',
    barClass:   'bg-brand-400',
    emoji:      '🟢',
  },
}

// ─── FILL BAR ──────────────────────────────────────────────────────────────────
function FillBar({ filled, max, barClass }) {
  const pct = Math.min((filled / max) * 100, 100)
  return (
    <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden mt-3">
      <div
        className={`${barClass} h-2.5 rounded-full transition-all duration-500`}
        style={{ width: `${pct}%` }}
        role="progressbar"
        aria-valuenow={filled}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={`${filled} of ${max} slots filled`}
      />
    </div>
  )
}

// ─── SLOT CARD ─────────────────────────────────────────────────────────────────
function SlotCard({ slot }) {
  const status = getSlotStatus(slot)
  const meta   = STATUS_META[status]
  const open   = slot.max - slot.filled

  return (
    <div className={`slot-card ${meta.cardClass}`}>
      {/* Header row */}
      <div className="flex items-start justify-between gap-2 mb-1">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-2xl flex-shrink-0" role="img" aria-hidden="true">
            {slot.icon}
          </span>
          <h4 className="font-bold text-gray-900 text-base leading-snug truncate">
            {slot.activity}
          </h4>
        </div>
        <span className={`${meta.badgeClass} text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 whitespace-nowrap`}>
          {meta.emoji} {meta.label}
        </span>
      </div>

      {/* Day */}
      <p className="text-xs text-gray-500 font-medium mb-2 ml-9">
        📅 {slot.day}
      </p>

      {/* Notes */}
      {slot.notes && (
        <p className="text-xs text-gray-600 mb-3 ml-9 leading-relaxed italic">
          {slot.notes}
        </p>
      )}

      {/* Progress */}
      <div className="ml-9">
        <div className="flex items-center justify-between text-xs text-gray-500 font-medium">
          <span>{slot.filled} / {slot.optimal} volunteers</span>
          <span className="font-bold text-gray-700">
            {status === 'full'
              ? 'No spots available'
              : `${open} spot${open !== 1 ? 's' : ''} open`
            }
          </span>
        </div>
        <FillBar filled={slot.filled} max={slot.optimal} barClass={meta.barClass} />
      </div>
    </div>
  )
}

// ─── LEGEND ────────────────────────────────────────────────────────────────────
function Legend() {
  return (
    <div className="flex flex-wrap gap-4 items-center justify-center text-xs font-medium text-gray-600 mb-8">
      {Object.entries(STATUS_META).map(([key, meta]) => (
        <span key={key} className={`${meta.badgeClass} px-3 py-1.5 rounded-full`}>
          {meta.emoji} {meta.label}
        </span>
      ))}
    </div>
  )
}

// ─── SUMMARY BAR ───────────────────────────────────────────────────────────────
function SummaryBar({ slots }) {
  const full    = slots.filter(s => getSlotStatus(s) === 'full').length
  const open    = slots.filter(s => ['open', 'warning'].includes(getSlotStatus(s))).length
  const total   = slots.length

  return (
    <div className="bg-brand-50 border border-brand-200 rounded-xl p-5 mb-8
                    flex flex-wrap gap-6 items-center justify-center md:justify-start">
      <div className="text-center">
        <p className="text-3xl font-extrabold text-brand-600">{total}</p>
        <p className="text-xs text-gray-500 font-medium">Activities</p>
      </div>
      <div className="w-px h-10 bg-brand-200 hidden md:block" />
      <div className="text-center">
        <p className="text-3xl font-extrabold text-green-600">{total - full}</p>
        <p className="text-xs text-gray-500 font-medium">Accepting Volunteers</p>
      </div>
      <div className="w-px h-10 bg-brand-200 hidden md:block" />
      <div className="text-center">
        <p className="text-3xl font-extrabold text-yellow-600">{open}</p>
        <p className="text-xs text-gray-500 font-medium">Urgently Needed</p>
      </div>
      <div className="w-px h-10 bg-brand-200 hidden md:block" />
      <div className="text-center">
        <p className="text-3xl font-extrabold text-red-500">{full}</p>
        <p className="text-xs text-gray-500 font-medium">Fully Staffed</p>
      </div>
    </div>
  )
}

// ─── MAIN EXPORT ───────────────────────────────────────────────────────────────
export default function VolunteerDashboard({ previewMode = false, slots: propSlots }) {
  // Use prop slots (from Admin CMS) or fall back to config defaults
  const allSlots = propSlots ?? VOLUNTEER_SLOTS

  // Preview mode: show first 4 cards only (sorted by urgency)
  const sortedSlots = [...allSlots].sort((a, b) => {
    const order = { open: 0, warning: 1, full: 2, good: 3 }
    return order[getSlotStatus(a)] - order[getSlotStatus(b)]
  })

  const displaySlots = previewMode ? sortedSlots.slice(0, 4) : sortedSlots

  return (
    <div>
      {!previewMode && (
        <>
          <SummaryBar slots={allSlots} />
          <Legend />
        </>
      )}

      {/* Slot grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {displaySlots.map((slot) => (
          <SlotCard key={slot.id} slot={slot} />
        ))}
      </div>

      {/* Data freshness notice */}
      <p className="text-center text-xs text-gray-400 mt-6 italic">
        📊 Slot availability is updated by our admin team.
        {previewMode ? '' : ' Contact Karen to sign up for a volunteer slot.'}
      </p>
    </div>
  )
}
