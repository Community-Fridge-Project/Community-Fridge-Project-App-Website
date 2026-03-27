/**
 * useContent.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Hook that merges Admin CMS overrides (localStorage) with site.config defaults.
 * All pages use this to ensure admin changes reflect in real-time.
 *
 * Usage:
 *   const content = useContent()
 *   content.pages.missionBody   → CMS value if set, else config default
 *   content.fridges             → CMS fridges if set, else FRIDGE_LOCATIONS
 *   content.slots               → CMS slots if set, else VOLUNTEER_SLOTS
 *   content.news                → CMS news if set, else DEFAULT_NEWS
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { useState, useEffect } from 'react'
import {
  ADMIN_CONFIG,
  HOME,
  TEAM,
  DONATE,
  CONTACT,
  FRIDGE_LOCATIONS,
  VOLUNTEER_SLOTS,
  DEFAULT_NEWS,
} from '../config/site.config'

// Default pages content — all admin-editable text across every page
export const DEFAULT_PAGES = {
  // ── Home ──────────────────────────────────────────────────────
  heroHeadline:    HOME.hero.headline,
  heroSub:         HOME.hero.subheadline,
  missionTitle:    HOME.mission.title,
  missionBody:     HOME.mission.body,
  stat0:           HOME.impactStats[0].value,
  stat0Label:      HOME.impactStats[0].label,
  stat1:           HOME.impactStats[1].value,
  stat1Label:      HOME.impactStats[1].label,
  stat2:           HOME.impactStats[2].value,
  stat2Label:      HOME.impactStats[2].label,
  stat3:           HOME.impactStats[3].value,
  stat3Label:      HOME.impactStats[3].label,

  // ── About ─────────────────────────────────────────────────────
  teamIntro:       TEAM.intro,
  ourStoryTitle:   TEAM.ourStory.title,
  ourStoryBody1:   TEAM.ourStory.body1,
  ourStoryBody2:   TEAM.ourStory.body2,
  founderName:     TEAM.organizers[0].name,
  founderRole:     TEAM.organizers[0].role,
  founderBio:      TEAM.organizers[0].bio,

  // ── Donate ────────────────────────────────────────────────────
  donateHeadline:  DONATE.headline,
  donateIntro:     DONATE.intro,
  dropoffNote:     DONATE.dropoffNote,

  // ── Contact ───────────────────────────────────────────────────
  contactHeadline: CONTACT.headline,
  contactIntro:    CONTACT.intro,
  contactEmail:    CONTACT.email,
  contactResponse: CONTACT.responseTime,
}

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(ADMIN_CONFIG.contentKey)
    if (raw) return JSON.parse(raw)
  } catch (_) {}
  return null
}

export function useContent() {
  const [data, setData] = useState(() => {
    const stored = loadFromStorage()
    return {
      pages:   stored?.pages   ?? { ...DEFAULT_PAGES },
      fridges: stored?.fridges ?? [...FRIDGE_LOCATIONS],
      slots:   stored?.slots   ?? [...VOLUNTEER_SLOTS],
      news:    stored?.news    ?? [...DEFAULT_NEWS],
    }
  })

  // Re-read whenever admin saves (storage event fires in same tab too via custom event)
  useEffect(() => {
    const sync = () => {
      const stored = loadFromStorage()
      if (stored) {
        setData({
          pages:   stored.pages   ?? { ...DEFAULT_PAGES },
          fridges: stored.fridges ?? [...FRIDGE_LOCATIONS],
          slots:   stored.slots   ?? [...VOLUNTEER_SLOTS],
          news:    stored.news    ?? [...DEFAULT_NEWS],
        })
      }
    }
    window.addEventListener('cfp-content-updated', sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener('cfp-content-updated', sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  return data
}
