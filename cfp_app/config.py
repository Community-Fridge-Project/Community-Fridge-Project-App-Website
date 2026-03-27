# ============================================================
# config.py — Community Fridge Project: App Configuration
# ============================================================
# PURPOSE: This file is the ONE place to make non-code changes.
#          Karen or a volunteer coordinator can safely edit
#          anything in a block marked "EDIT HERE".
#
# HOW TO EDIT: Change the value to the RIGHT of the = sign.
#              Strings go inside quotes. Numbers do not.
#              Save the file, then restart the app.
# ============================================================


# ── App Identity ─────────────────────────────────────────────
# EDIT HERE ↓
APP_NAME      = "Community Fridge Project"
APP_SUBTITLE  = "Volunteer Coordination Hub"
APP_ICON      = "🥦"          # shown in browser tab and header
ADMIN_NAME    = "Karen"       # used in greeting ("Karen's Dashboard")
ADMIN_EMAIL   = ""            # EDIT HERE: e.g. "karen@cfp.org"
ADMIN_PHONE   = ""            # EDIT HERE: e.g. "+15125550100"
ORG_WEBSITE   = "https://communityfridgeproject.org"


# ── Database Connection ───────────────────────────────────────
# The app checks for a DATABASE_URL environment variable first
# (recommended for production / Supabase deployments).
# If not found, it falls back to the values below.
#
# HOW TO SET ENV VAR:
#   • Supabase/cloud: set DATABASE_URL in your hosting dashboard
#   • Local .env file: DATABASE_URL=postgresql://user:pass@host/db
#
# EDIT HERE (local / fallback only) ↓
DB_CONFIG = {
    "host":     "your-project.supabase.co",   # from Supabase → Settings → Database
    "port":     5432,
    "database": "postgres",
    "user":     "postgres",
    "password": "YOUR_DB_PASSWORD_HERE",      # ⚠️ Never commit real passwords to git!
}
DB_URL_ENV_VAR = "DATABASE_URL"   # name of the environment variable to check


# ── Volunteer Skill Tags ──────────────────────────────────────
# Each entry:  "database_key": "Display Label"
#
# Rules:
#   • The database_key MUST also be in the CHECK list in schema.sql
#   • The Display Label is what volunteers and Karen see on screen
#   • To add a new skill: (1) add it here, (2) add to schema.sql CHECK list,
#     (3) run ALTER TABLE volunteer_tags DROP CONSTRAINT ...; re-add with new value
#
# EDIT HERE ↓
SKILL_TAGS = {
    "sack_lunch":       "🥪 Sack Lunch",
    "delivery":         "🚗 Delivery",
    "cleaning":         "🧹 Cleaning",
    "shopping":         "🛒 Shopping",
    "tovala_recovery":  "♻️ Tovala Recovery",
    "stocking":         "📦 Stocking",
    "advisory":         "🤝 Advisory Team",
}

# Reverse lookup: display label → key (auto-built, do not edit)
SKILL_TAG_REVERSE = {v: k for k, v in SKILL_TAGS.items()}


# ── Initiative Types ──────────────────────────────────────────
# Mirrors the initiative_type CHECK constraint in schema.sql.
# EDIT HERE ↓
INITIATIVE_TYPES = {
    "sack_lunch":       "🥪 Sack Lunch",
    "delivery":         "🚗 Delivery",
    "cleaning":         "🧹 Cleaning",
    "shopping":         "🛒 Shopping",
    "tovala_recovery":  "♻️ Tovala Recovery",
    "stocking":         "📦 Stocking",
    "fundraising":      "💰 Fundraising",
    "advisory_meeting": "🤝 Advisory Meeting",
    "school_drive":     "🏫 School Food Drive",
}


# ── Days of Week ──────────────────────────────────────────────
DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]


# ── Dashboard Behavior ────────────────────────────────────────
# How many days ahead to show on the dashboard
# EDIT HERE ↓
UPCOMING_DAYS_WINDOW = 7

# Seat fill thresholds (as decimals: 0.60 = 60%)
# Below LOW  → amber warning
# Below CRIT → red alert
LOW_FILL_THRESHOLD  = 0.60   # EDIT HERE
CRIT_FILL_THRESHOLD = 0.30   # EDIT HERE


# ── Sack Lunch Specifics (from Karen's notes) ─────────────────
# EDIT HERE if these numbers change ↓
SACK_LUNCH_OPTIMAL     = 9    # "sweet spot" for Monday assembly
SACK_LUNCH_MAX_NORMAL  = 11   # max on the normal list
SACK_LUNCH_SUBSTITUTES = 5    # reliable substitutes
SACK_LUNCH_TOTAL_INCL_KAREN = 10  # including Karen herself


# ── Donor Types ───────────────────────────────────────────────
# EDIT HERE ↓
DONOR_TYPES = {
    "individual":  "👤 Individual",
    "corporate":   "🏢 Corporate",
    "school":      "🏫 School",
    "faith_org":   "⛪ Faith Organization",
    "government":  "🏛️ Government",
    "other":       "🔹 Other",
}


# ── Outreach Methods ──────────────────────────────────────────
OUTREACH_METHODS = ["text", "email", "phone", "in_person"]


# ── Status Colors (hex) ───────────────────────────────────────
# These are used in dashboard fill-rate indicators.
STATUS_COLORS = {
    "filled":   "#28a745",   # green  — at/above optimal
    "low":      "#fd7e14",   # amber  — below LOW_FILL_THRESHOLD
    "critical": "#dc3545",   # red    — below CRIT_FILL_THRESHOLD
    "neutral":  "#6c757d",   # gray   — informational
    "pending":  "#0d6efd",   # blue   — awaiting action
}


# ── Event Status Labels ───────────────────────────────────────
EVENT_STATUS_LABELS = {
    "open":      "🟢 Open",
    "filled":    "✅ Filled",
    "cancelled": "❌ Cancelled",
    "completed": "🏁 Completed",
}
