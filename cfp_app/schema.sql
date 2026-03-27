-- ============================================================
-- Community Fridge Project: Database Schema
-- Version: 1.0  |  Compatible with: PostgreSQL / Supabase
-- ============================================================
-- HOW TO USE:
--   Option A (Supabase): Paste this into your Supabase SQL Editor
--                        and click "Run".
--   Option B (local):    psql -U postgres -d your_db -f schema.sql
--
-- All tables use ON CONFLICT DO NOTHING for safe re-runs.
-- Drop tables manually if you need a clean slate.
-- ============================================================


-- ============================================================
-- SECTION 1: VOLUNTEER MANAGEMENT
-- ============================================================

-- Core volunteer registry (one row per person)
CREATE TABLE IF NOT EXISTS volunteers (
    id              SERIAL PRIMARY KEY,
    name            TEXT NOT NULL,
    email           TEXT UNIQUE,
    phone           TEXT,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    joined_date     DATE NOT NULL DEFAULT CURRENT_DATE,
    notes           TEXT,                         -- freeform admin notes
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Skill tags: one row per (volunteer, skill) pair
-- A volunteer can have multiple tags (sack_lunch AND delivery, etc.)
-- EDIT: To add a new skill type, add it to the CHECK list below
--       AND also update SKILL_TAGS in config.py.
CREATE TABLE IF NOT EXISTS volunteer_tags (
    id              SERIAL PRIMARY KEY,
    volunteer_id    INTEGER NOT NULL REFERENCES volunteers(id) ON DELETE CASCADE,
    tag             TEXT NOT NULL CHECK (tag IN (
                        'sack_lunch',       -- Monday lunch assembly
                        'delivery',         -- Drives lunches / groceries out
                        'cleaning',         -- Daily fridge cleaning
                        'shopping',         -- Grocery shopping runs
                        'tovala_recovery',  -- Saturday Tovala food recovery
                        'stocking',         -- Pick up + stock fridge
                        'advisory'          -- Advisory team member
                    )),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (volunteer_id, tag)               -- prevents duplicate entries
);


-- ============================================================
-- SECTION 2: FRIDGE LOCATIONS
-- ============================================================

CREATE TABLE IF NOT EXISTS fridges (
    id              SERIAL PRIMARY KEY,
    name            TEXT NOT NULL,
    address         TEXT,
    city            TEXT NOT NULL DEFAULT 'Austin',
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    notes           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
-- SECTION 3: INITIATIVES (recurring volunteer activity templates)
-- ============================================================
-- An "initiative" is a recurring activity type, e.g. "Monday Sack Lunch".
-- Individual dates (occurrences) live in the "events" table below.

CREATE TABLE IF NOT EXISTS initiatives (
    id              SERIAL PRIMARY KEY,
    name            TEXT NOT NULL,              -- human-readable label
    initiative_type TEXT NOT NULL CHECK (initiative_type IN (
                        'sack_lunch',
                        'delivery',
                        'cleaning',
                        'shopping',
                        'tovala_recovery',
                        'stocking',
                        'fundraising',
                        'advisory_meeting',
                        'school_drive'
                    )),
    fridge_id       INTEGER REFERENCES fridges(id),  -- NULL = not fridge-specific
    day_of_week     TEXT CHECK (day_of_week IN (
                        'Monday', 'Tuesday', 'Wednesday',
                        'Thursday', 'Friday', 'Saturday', 'Sunday'
                    )),
    optimal_seats   INTEGER NOT NULL DEFAULT 1, -- "sweet spot" volunteer count
    max_seats       INTEGER,                    -- absolute max (can be NULL)
    is_recurring    BOOLEAN NOT NULL DEFAULT TRUE,
    description     TEXT,
    notes           TEXT,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
-- SECTION 4: EVENTS (specific dated occurrences of an initiative)
-- ============================================================
-- The app auto-generates rows here weekly for each recurring initiative.

CREATE TABLE IF NOT EXISTS events (
    id              SERIAL PRIMARY KEY,
    initiative_id   INTEGER NOT NULL REFERENCES initiatives(id) ON DELETE CASCADE,
    event_date      DATE NOT NULL,
    status          TEXT NOT NULL DEFAULT 'open' CHECK (status IN (
                        'open',       -- accepting sign-ups
                        'filled',     -- at or above optimal seats
                        'cancelled',  -- event won't happen
                        'completed'   -- event is in the past, done
                    )),
    notes           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (initiative_id, event_date)       -- one row per initiative per date
);

-- Volunteer sign-ups (who committed to which event)
CREATE TABLE IF NOT EXISTS event_signups (
    id              SERIAL PRIMARY KEY,
    event_id        INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    volunteer_id    INTEGER NOT NULL REFERENCES volunteers(id) ON DELETE CASCADE,
    skill_tag       TEXT,                    -- which role they're filling
    signed_up_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    confirmed       BOOLEAN NOT NULL DEFAULT FALSE,
    status          TEXT NOT NULL DEFAULT 'active' CHECK (status IN (
                        'active',     -- confirmed attendee
                        'cancelled',  -- backed out
                        'no_show'     -- didn't show
                    )),
    notes           TEXT,
    UNIQUE (event_id, volunteer_id)          -- one signup per person per event
);


-- ============================================================
-- SECTION 5: OUTREACH LOG
-- ============================================================
-- Track every time Karen (or the system) contacts a volunteer
-- about an upcoming gap. Useful for follow-up and accountability.

CREATE TABLE IF NOT EXISTS outreach_log (
    id              SERIAL PRIMARY KEY,
    event_id        INTEGER REFERENCES events(id) ON DELETE SET NULL,
    volunteer_id    INTEGER REFERENCES volunteers(id) ON DELETE SET NULL,
    method          TEXT NOT NULL CHECK (method IN ('text', 'email', 'phone', 'in_person')),
    message_sent    TEXT,                    -- copy of the message, if any
    sent_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    response        TEXT,                    -- volunteer's reply, optional
    notes           TEXT
);


-- ============================================================
-- SECTION 6: DONOR CRM
-- ============================================================

CREATE TABLE IF NOT EXISTS donors (
    id              SERIAL PRIMARY KEY,
    name            TEXT NOT NULL,
    email           TEXT,
    phone           TEXT,
    organization    TEXT,                    -- company / school / church name
    donor_type      TEXT CHECK (donor_type IN (
                        'individual',
                        'corporate',
                        'school',
                        'faith_org',
                        'government',
                        'other'
                    )),
    first_gift_date DATE,
    last_contact    DATE,
    notes           TEXT,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
-- SECTION 7: FOOD RECOVERY CONTACTS (e.g., Tovala)
-- ============================================================

CREATE TABLE IF NOT EXISTS food_recovery_contacts (
    id              SERIAL PRIMARY KEY,
    org_name        TEXT NOT NULL,           -- e.g., "Tovala"
    contact_name    TEXT,
    email           TEXT,
    phone           TEXT,
    pickup_day      TEXT,                    -- e.g., "Saturday AM"
    pickup_location TEXT,                    -- e.g., "Carol Stream"
    reallocation_notes TEXT,                 -- where food goes after pickup
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
-- SECTION 8: SCHOOL CONTACTS (for food drives)
-- ============================================================

CREATE TABLE IF NOT EXISTS school_contacts (
    id              SERIAL PRIMARY KEY,
    school_name     TEXT NOT NULL,
    contact_name    TEXT,
    email           TEXT,
    phone           TEXT,
    last_drive_date DATE,
    notes           TEXT,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
-- VIEWS (pre-built queries — use these in the app, not raw tables)
-- ============================================================

-- View 1: Event capacity dashboard (used by Karen Dashboard)
CREATE OR REPLACE VIEW vw_event_capacity AS
SELECT
    e.id                                                        AS event_id,
    e.event_date,
    i.name                                                      AS initiative_name,
    i.initiative_type,
    i.optimal_seats,
    COUNT(es.id)                                                AS seats_filled,
    GREATEST(0, i.optimal_seats - COUNT(es.id))                 AS seats_needed,
    ROUND(COUNT(es.id)::NUMERIC / NULLIF(i.optimal_seats, 0) * 100) AS fill_pct,
    e.status,
    COALESCE(f.name, 'General')                                 AS fridge_name,
    f.address                                                   AS fridge_address
FROM events e
JOIN  initiatives  i  ON e.initiative_id = i.id
LEFT JOIN event_signups es ON e.id = es.event_id AND es.status = 'active'
LEFT JOIN fridges f ON i.fridge_id = f.id
GROUP BY
    e.id, e.event_date, i.name, i.initiative_type,
    i.optimal_seats, e.status, f.name, f.address;


-- View 2: Volunteer roster with skills summary
CREATE OR REPLACE VIEW vw_volunteer_skills AS
SELECT
    v.id,
    v.name,
    v.email,
    v.phone,
    v.is_active,
    v.joined_date,
    v.notes,
    STRING_AGG(vt.tag, ',' ORDER BY vt.tag) AS skills   -- comma-separated
FROM volunteers v
LEFT JOIN volunteer_tags vt ON v.id = vt.volunteer_id
GROUP BY v.id, v.name, v.email, v.phone, v.is_active, v.joined_date, v.notes;


-- ============================================================
-- SEED DATA (safe to run multiple times; skips on conflict)
-- ============================================================

-- Austin fridges (6 current, 2 potential additions noted)
INSERT INTO fridges (name, address, city) VALUES
    ('Austin Market',          '123 Main St',         'Austin'),
    ('Riverside Community',    '456 Riverside Dr',    'Austin'),
    ('North Loop Fridge',      '789 North Loop Blvd', 'Austin'),
    ('East Austin Fridge',     '321 East Cesar',      'Austin'),
    ('South Congress Fridge',  '654 S Congress Ave',  'Austin'),
    ('Rundberg Fridge',        '987 Rundberg Ln',     'Austin')
ON CONFLICT DO NOTHING;

-- Core recurring initiatives
INSERT INTO initiatives (name, initiative_type, day_of_week, optimal_seats, max_seats, is_recurring, description)
VALUES
    -- Monday Sack Lunch (9 optimal, 11 max per Karen's notes)
    ('Monday Sack Lunch — Assembly',  'sack_lunch',      'Monday',    9,  11, TRUE,
     'Assemble sack lunches for community distribution. Sweet spot: 9 helpers.'),
    ('Monday Sack Lunch — Delivery',  'delivery',        'Monday',    3,   5, TRUE,
     'Drive assembled lunches out. Jen/Jules/Mary primary; 2 backups needed.'),
    ('Austin Market Cleaning',        'cleaning',        'Monday',    1,   2, TRUE,
     'Paul is primary cleaner. Back-up needed.'),

    -- Shopping runs (Tue–Fri, 5 locations, 12 total shoppers)
    ('Tuesday Shopping Run',          'shopping',        'Tuesday',   3,   4, TRUE,
     'Grocery shopping at assigned locations. ~3 shoppers per day needed.'),
    ('Wednesday Shopping Run',        'shopping',        'Wednesday', 3,   4, TRUE,
     'Grocery shopping at assigned locations.'),
    ('Thursday Shopping Run',         'shopping',        'Thursday',  3,   4, TRUE,
     'Grocery shopping at assigned locations.'),
    ('Friday Shopping Run',           'shopping',        'Friday',    3,   4, TRUE,
     'Grocery shopping at assigned locations.'),

    -- Saturday Tovala recovery (Carol Stream)
    ('Tovala Recovery — Carol Stream','tovala_recovery', 'Saturday',  2,   3, TRUE,
     'Food recovery from Tovala, Carol Stream site. Reallocate as needed.'),

    -- Advisory team
    ('Advisory Team Meeting',         'advisory_meeting', NULL,       6,   8, FALSE,
     'Monthly recap: org updates, financials, door-open data, fundraising, volunteer appreciation.')
ON CONFLICT DO NOTHING;

-- Tovala food recovery contact
INSERT INTO food_recovery_contacts (org_name, pickup_day, pickup_location, reallocation_notes) VALUES
    ('Tovala', 'Saturday AM', 'Carol Stream', 'Reallocate recovered food to fridges as needed.')
ON CONFLICT DO NOTHING;
