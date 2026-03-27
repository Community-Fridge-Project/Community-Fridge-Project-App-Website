/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // ─── BRAND COLORS ──────────────────────────────────────────
      // Edit these to change the site-wide color palette.
      colors: {
        brand: {
          50:  '#f0faf0',
          100: '#d8f3d8',
          200: '#b0e7b0',
          300: '#7dd37d',
          400: '#4dba4d',
          500: '#3BAA35',   // ← Primary green (sampled from community fridge whiteboard)
          600: '#2d8a28',
          700: '#246e20',
          800: '#1e571b',
          900: '#174517',
          950: '#0b230c',
        },
        neutral: {
          50:  '#f8faf8',
          100: '#f0f4f0',
        }
      },
      // ─── TYPOGRAPHY ────────────────────────────────────────────
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      fontWeight: {
        // Titles use 700-800 for bold, clean look
      },
      // ─── SPACING / SIZING ──────────────────────────────────────
      maxWidth: {
        '8xl': '88rem',
      },
      // ─── SHADOWS ───────────────────────────────────────────────
      boxShadow: {
        'card': '0 2px 12px 0 rgba(59, 170, 53, 0.10)',
        'card-hover': '0 6px 24px 0 rgba(59, 170, 53, 0.18)',
      },
    },
  },
  plugins: [],
}
