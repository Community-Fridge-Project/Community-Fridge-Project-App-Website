/**
 * site.config.js — Community Fridge Project
 * ─────────────────────────────────────────────────────────────────────────────
 * SINGLE EDIT POINT for all site-wide configurable content.
 *
 * Instructions:
 *   • Update values here to change branding, copy, contact info, or operational data.
 *   • Do NOT hardcode content in page components — import from here instead.
 *   • To add a fridge location, push to FRIDGE_LOCATIONS.
 *   • To change volunteer slot defaults, edit VOLUNTEER_SLOTS.
 *   • Admin password is set in ADMIN_CONFIG (replace with Supabase auth later).
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ─── BRAND ──────────────────────────────────────────────────────────────────
export const BRAND = {
  name: 'Community Fridge Project',
  tagline: 'Free Food for All Neighbors',
  domain: 'communityfridgeproject.org',
  url: 'https://communityfridgeproject.org',
  email: 'hello@communityfridgeproject.org',
  phone: '',                          // Add phone number when available
  socialMedia: {
    instagram: '',                    // e.g. 'https://instagram.com/cfpaustin'
    facebook: '',
    twitter: '',
  },
  primaryColor: '#3BAA35',            // Keep in sync with tailwind.config.js brand-500
}

// ─── NAVIGATION ─────────────────────────────────────────────────────────────
export const NAV_LINKS = [
  { label: 'Home',       path: '/' },
  { label: 'About Us',   path: '/about' },
  { label: 'Volunteer',  path: '/volunteer' },
  { label: 'Donate',     path: '/donate' },
  { label: 'News',       path: '/news' },
  { label: 'Contact',    path: '/contact' },
]

// ─── HOME PAGE ───────────────────────────────────────────────────────────────
export const HOME = {
  hero: {
    headline: 'Neighbors Feeding Neighbors',
    subheadline: 'Free, fresh food — available to anyone, anytime.',
    ctaLabel: 'Get Involved',
    ctaPath: '/volunteer',
  },
  mission: {
    title: 'Our Mission',
    body: `The Community Fridge Project believes that no one should go hungry. We maintain a network
      of free community refrigerators across Austin where anyone can take what they need — no questions asked.
      Our fridges are stocked by volunteers, donors, and neighbors who believe in the power of mutual aid.`,
  },
  impactStats: [
    { value: '6+',    label: 'Community Fridges in Austin' },
    { value: '100+',  label: 'Active Volunteers' },
    { value: '1,000+', label: 'Meals Served Monthly' },
    { value: '0',     label: 'Cost to Take Food' },
  ],
  overview: {
    title: 'How It Works',
    steps: [
      {
        icon: '🥦',
        title: 'Donate Food',
        description: 'Drop off fresh produce, packaged goods, or prepared meals at any fridge location.',
      },
      {
        icon: '🙌',
        title: 'Volunteer',
        description: 'Help stock fridges, prepare sack lunches, or drive donations between locations.',
      },
      {
        icon: '🍱',
        title: 'Take What You Need',
        description: 'Our fridges are open 24/7 — take what you need, leave what you can.',
      },
    ],
  },
}

// ─── FRIDGE LOCATIONS ────────────────────────────────────────────────────────
// Add or remove fridge locations here. Used on the About and Volunteer pages.
export const FRIDGE_LOCATIONS = [
  { id: 1, name: 'Austin Market Fridge',     neighborhood: 'Central Austin',  address: 'Austin, TX' },
  { id: 2, name: 'East Side Community Fridge', neighborhood: 'East Austin',   address: 'Austin, TX' },
  { id: 3, name: 'South Austin Fridge',      neighborhood: 'South Austin',    address: 'Austin, TX' },
  { id: 4, name: 'North Loop Fridge',        neighborhood: 'North Loop',      address: 'Austin, TX' },
  { id: 5, name: 'Mueller Neighborhood Fridge', neighborhood: 'Mueller',      address: 'Austin, TX' },
  { id: 6, name: 'Rundberg Fridge',          neighborhood: 'Rundberg',        address: 'Austin, TX' },
]

// ─── VOLUNTEER SLOTS ─────────────────────────────────────────────────────────
// Default slot data used in the Volunteer Dashboard (static shell).
// Replace with Supabase query when wiring up the backend.
//
// Fields:
//   activity   — display name of the volunteer activity
//   day        — day of week
//   optimal    — ideal number of volunteers
//   max        — maximum volunteers allowed
//   filled     — currently signed-up count (pulled from DB later)
//   icon       — emoji for visual clarity
//   notes      — optional short description shown on the dashboard card
export const VOLUNTEER_SLOTS = [
  {
    id: 'monday-sack-lunch',
    activity: 'Monday Sack Lunch',
    day: 'Monday',
    optimal: 9,
    max: 11,
    filled: 7,
    icon: '🥪',
    notes: 'Prep and distribute sack lunches. Karen coordinates.',
  },
  {
    id: 'tuesday-shopping',
    activity: 'Tuesday Grocery Run',
    day: 'Tuesday',
    optimal: 3,
    max: 4,
    filled: 2,
    icon: '🛒',
    notes: 'Shop at 5 partner locations to stock fridges.',
  },
  {
    id: 'wednesday-shopping',
    activity: 'Wednesday Grocery Run',
    day: 'Wednesday',
    optimal: 3,
    max: 4,
    filled: 3,
    icon: '🛒',
    notes: '',
  },
  {
    id: 'thursday-shopping',
    activity: 'Thursday Grocery Run',
    day: 'Thursday',
    optimal: 3,
    max: 4,
    filled: 1,
    icon: '🛒',
    notes: '',
  },
  {
    id: 'friday-shopping',
    activity: 'Friday Grocery Run',
    day: 'Friday',
    optimal: 3,
    max: 4,
    filled: 3,
    icon: '🛒',
    notes: '',
  },
  {
    id: 'daily-cleaning',
    activity: 'Fridge Cleaning',
    day: 'Daily',
    optimal: 30,
    max: 35,
    filled: 22,
    icon: '🧹',
    notes: '6 fridges across Austin — daily wipe-downs and safety checks.',
  },
  {
    id: 'saturday-tovala',
    activity: 'Tovala Food Recovery',
    day: 'Saturday',
    optimal: 4,
    max: 6,
    filled: 3,
    icon: '🚗',
    notes: 'Saturday AMs at Carol Stream location. Driver required.',
  },
  {
    id: 'delivery-driving',
    activity: 'Delivery Driving',
    day: 'Mon–Fri',
    optimal: 3,
    max: 5,
    filled: 3,
    icon: '🚐',
    notes: 'Jen, Jules & Mary on regular routes. More drivers always welcome.',
  },
]

// ─── TEAM / ABOUT US ─────────────────────────────────────────────────────────
export const TEAM = {
  headline: 'Meet Our Community',
  intro: `The Community Fridge Project is powered by dedicated volunteers and organizers
    who believe access to food is a basic human right. We are neighbors helping neighbors.`,
  organizers: [
    {
      name: 'Karen',
      role: 'Founder & Lead Organizer',
      bio: 'Karen founded the Community Fridge Project with a single refrigerator and a big vision. She coordinates day-to-day operations, volunteer scheduling, and partnerships across Austin.',
    },
  ],
  advisory: {
    title: 'Advisory Team',
    description: '6-member advisory team meets monthly to guide strategy, community partnerships, and organizational growth.',
  },
}

// ─── NEWS & EVENTS (seed data — admin can override via CMS) ──────────────────
export const DEFAULT_NEWS = [
  {
    id: 1,
    type: 'news',
    title: 'Welcome to the Community Fridge Project Website!',
    date: '2026-03-27',
    excerpt: 'We\'re thrilled to launch our new website. Stay tuned for updates on volunteer opportunities, new fridge locations, and ways to get involved.',
    body: 'Full article coming soon.',
    author: 'Karen',
    published: true,
  },
  {
    id: 2,
    type: 'event',
    title: 'Monthly Advisory Meeting',
    date: '2026-04-15',
    excerpt: 'Join our monthly advisory team meeting to discuss expansion plans and community outreach.',
    body: 'Details to be announced.',
    author: 'Karen',
    published: true,
  },
]

// ─── DONATE PAGE ─────────────────────────────────────────────────────────────
export const DONATE = {
  headline: 'Support the Community Fridge Project',
  intro: `Every dollar and every food donation makes a direct impact. Your contribution helps us
    stock fridges, expand our network, and keep food accessible to every neighbor who needs it.`,
  monetaryOptions: [
    { amount: 10,  label: '$10', description: 'Stocks a fridge shelf for one day' },
    { amount: 25,  label: '$25', description: 'Covers a week of cleaning supplies' },
    { amount: 50,  label: '$50', description: 'Funds a full grocery run' },
    { amount: 100, label: '$100', description: 'Sponsors a fridge for a month' },
  ],
  foodItems: [
    'Fresh produce (fruits and vegetables)',
    'Non-perishable canned goods',
    'Bread and baked goods',
    'Dairy products (within date)',
    'Prepared meals (sealed and labeled)',
    'Baby food and formula',
  ],
  dropoffNote: 'Drop off at any of our 6 fridge locations — no appointment needed.',
  // Add payment processor link when ready (e.g. Venmo, PayPal, Stripe)
  paymentLink: '',
}

// ─── CONTACT PAGE ────────────────────────────────────────────────────────────
export const CONTACT = {
  headline: 'Get in Touch',
  intro: 'Have a question, want to partner with us, or need to report a fridge issue? We\'d love to hear from you.',
  email: BRAND.email,
  responseTime: 'We typically respond within 2 business days.',
}

// ─── ADMIN CONFIG ────────────────────────────────────────────────────────────
// ⚠️  TEMPORARY: password-based admin for the static shell.
//     Replace with Supabase Auth when wiring up the backend.
export const ADMIN_CONFIG = {
  password: 'cfp-admin-2026',          // ← Change this before going live
  sessionKey: 'cfp_admin_session',      // localStorage key for session token
  contentKey: 'cfp_admin_content',      // localStorage key for CMS content
}
