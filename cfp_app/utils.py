# ============================================================
# utils.py — Community Fridge Project: Database & App Utilities
# ============================================================
# PURPOSE: All database access and shared helper functions live here.
#
# ARCHITECTURE NOTE (for future developers):
#   • All DB queries return pandas DataFrames for easy display in Streamlit.
#   • get_connection() is cached by Streamlit so we reuse a single
#     connection across reruns instead of opening a new one each time.
#   • run_query()  → for SELECT statements (returns DataFrame)
#   • run_insert() → for INSERT / UPDATE / DELETE (returns True/False)
#   • All SQL is parameterized (%s placeholders) — never use f-strings
#     to build SQL, as that creates SQL injection vulnerabilities.
#
# EDIT SETTINGS IN: config.py  (not here)
# ============================================================

import os
import streamlit as st
import pandas as pd
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import date, timedelta
from typing import Optional

from config import (
    DB_CONFIG, DB_URL_ENV_VAR,
    SKILL_TAGS, INITIATIVE_TYPES, STATUS_COLORS,
    LOW_FILL_THRESHOLD, CRIT_FILL_THRESHOLD,
    UPCOMING_DAYS_WINDOW,
)


# ============================================================
# DATABASE CONNECTION
# ============================================================

@st.cache_resource(show_spinner=False)
def get_connection():
    """
    Open (and cache) a PostgreSQL connection.

    Resolution order:
      1. Environment variable DATABASE_URL  (e.g. Supabase connection string)
      2. DB_CONFIG dict in config.py         (local / fallback)

    The @st.cache_resource decorator means Streamlit keeps this object
    alive across reruns, avoiding a new TCP handshake on every page load.
    """
    db_url = os.getenv(DB_URL_ENV_VAR)
    try:
        if db_url:
            conn = psycopg2.connect(db_url, cursor_factory=RealDictCursor)
        else:
            conn = psycopg2.connect(
                host=DB_CONFIG["host"],
                port=DB_CONFIG["port"],
                dbname=DB_CONFIG["database"],
                user=DB_CONFIG["user"],
                password=DB_CONFIG["password"],
                cursor_factory=RealDictCursor,
            )
        return conn
    except Exception as e:
        st.error(
            f"⚠️ Could not connect to the database. "
            f"Check your DATABASE_URL or DB_CONFIG in config.py.\n\nError: {e}"
        )
        st.stop()


def _ensure_connection():
    """Return an open connection, reconnecting if the previous one closed."""
    conn = get_connection()
    if conn.closed:
        # Clear Streamlit's cache so get_connection() re-runs
        st.cache_resource.clear()
        conn = get_connection()
    return conn


# ============================================================
# CORE QUERY RUNNERS
# ============================================================

def run_query(sql: str, params: tuple = None) -> pd.DataFrame:
    """
    Execute a SELECT query and return a pandas DataFrame.

    Args:
        sql    — SQL string with %s placeholders for parameters
        params — tuple of values to bind (use None if no params)

    Returns:
        pd.DataFrame — empty DataFrame on error or no results

    Example:
        df = run_query(
            "SELECT * FROM volunteers WHERE is_active = %s",
            (True,)
        )
    """
    try:
        conn = _ensure_connection()
        with conn.cursor() as cur:
            cur.execute(sql, params)
            rows = cur.fetchall()
        if rows:
            return pd.DataFrame([dict(r) for r in rows])
        return pd.DataFrame()
    except Exception as e:
        st.error(f"Query error: {e}")
        return pd.DataFrame()


def run_insert(sql: str, params: tuple = None, return_id: bool = False):
    """
    Execute an INSERT, UPDATE, or DELETE statement.

    Args:
        sql        — SQL string with %s placeholders
        params     — tuple of values to bind
        return_id  — if True, appends RETURNING id and returns the new id

    Returns:
        If return_id=False: True on success, False on failure
        If return_id=True:  the new row's id (int) or None on failure

    Example:
        new_id = run_insert(
            "INSERT INTO volunteers (name, email) VALUES (%s, %s)",
            ("Jane Doe", "jane@example.com"),
            return_id=True
        )
    """
    if return_id and "RETURNING" not in sql.upper():
        sql = sql.rstrip(";") + " RETURNING id"
    try:
        conn = _ensure_connection()
        with conn.cursor() as cur:
            cur.execute(sql, params)
            result = cur.fetchone() if return_id else None
        conn.commit()
        return result["id"] if return_id and result else True
    except Exception as e:
        conn.rollback()
        st.error(f"Write error: {e}")
        return None if return_id else False


# ============================================================
# VOLUNTEER HELPERS
# ============================================================

def get_all_volunteers(active_only: bool = True) -> pd.DataFrame:
    """
    Fetch all volunteers with their skill tags merged into one column.

    Returns columns:
        id, name, email, phone, is_active, joined_date, notes, skills
        (skills = comma-separated tag keys, e.g. "cleaning,delivery")
    """
    sql = """
        SELECT
            v.id,
            v.name,
            v.email,
            v.phone,
            v.is_active,
            v.joined_date,
            v.notes,
            COALESCE(STRING_AGG(vt.tag, ',' ORDER BY vt.tag), '') AS skills
        FROM volunteers v
        LEFT JOIN volunteer_tags vt ON v.id = vt.volunteer_id
        WHERE (%s = FALSE OR v.is_active = TRUE)
        GROUP BY v.id, v.name, v.email, v.phone, v.is_active, v.joined_date, v.notes
        ORDER BY v.name
    """
    return run_query(sql, (active_only,))


def get_volunteers_by_skill(skill_tag: str) -> pd.DataFrame:
    """
    Return active volunteers who hold a specific skill tag.

    Args:
        skill_tag — one of the keys from SKILL_TAGS in config.py

    Returns columns: id, name, email, phone
    """
    sql = """
        SELECT v.id, v.name, v.email, v.phone
        FROM volunteers v
        JOIN volunteer_tags vt ON v.id = vt.volunteer_id
        WHERE vt.tag = %s AND v.is_active = TRUE
        ORDER BY v.name
    """
    return run_query(sql, (skill_tag,))


def get_volunteer_by_id(volunteer_id: int) -> Optional[dict]:
    """Return a single volunteer record as a dict, or None."""
    sql = "SELECT * FROM volunteers WHERE id = %s"
    df = run_query(sql, (volunteer_id,))
    return df.iloc[0].to_dict() if not df.empty else None


def add_volunteer(
    name: str,
    email: str,
    phone: str,
    tags: list,
    notes: str = "",
) -> Optional[int]:
    """
    Insert a new volunteer and their skill tags in a single transaction.

    Args:
        name   — full name (required)
        email  — email address (can be empty string)
        phone  — phone number (can be empty string)
        tags   — list of skill tag keys, e.g. ["sack_lunch", "delivery"]
        notes  — optional admin notes

    Returns:
        new volunteer id (int) on success, None on failure
    """
    sql_vol = """
        INSERT INTO volunteers (name, email, phone, notes)
        VALUES (%s, %s, %s, %s)
    """
    try:
        conn = _ensure_connection()
        with conn.cursor() as cur:
            cur.execute(
                sql_vol + " RETURNING id",
                (name, email or None, phone or None, notes or None),
            )
            new_id = cur.fetchone()["id"]
            for tag in tags:
                cur.execute(
                    """INSERT INTO volunteer_tags (volunteer_id, tag)
                       VALUES (%s, %s) ON CONFLICT DO NOTHING""",
                    (new_id, tag),
                )
        conn.commit()
        return new_id
    except Exception as e:
        conn.rollback()
        st.error(f"Could not add volunteer: {e}")
        return None


def update_volunteer(
    volunteer_id: int,
    name: str,
    email: str,
    phone: str,
    tags: list,
    notes: str = "",
    is_active: bool = True,
) -> bool:
    """
    Update an existing volunteer's info and replace their skill tags.

    Replaces all tags (delete + re-insert) to keep logic simple.
    """
    sql_upd = """
        UPDATE volunteers
        SET name=%s, email=%s, phone=%s, notes=%s, is_active=%s,
            updated_at=NOW()
        WHERE id=%s
    """
    try:
        conn = _ensure_connection()
        with conn.cursor() as cur:
            cur.execute(
                sql_upd,
                (name, email or None, phone or None, notes or None, is_active, volunteer_id),
            )
            # Replace all tags
            cur.execute("DELETE FROM volunteer_tags WHERE volunteer_id=%s", (volunteer_id,))
            for tag in tags:
                cur.execute(
                    """INSERT INTO volunteer_tags (volunteer_id, tag)
                       VALUES (%s, %s) ON CONFLICT DO NOTHING""",
                    (volunteer_id, tag),
                )
        conn.commit()
        return True
    except Exception as e:
        conn.rollback()
        st.error(f"Could not update volunteer: {e}")
        return False


def get_volunteer_tags(volunteer_id: int) -> list:
    """Return list of tag keys for a volunteer."""
    sql = "SELECT tag FROM volunteer_tags WHERE volunteer_id=%s ORDER BY tag"
    df = run_query(sql, (volunteer_id,))
    return df["tag"].tolist() if not df.empty else []


# ============================================================
# FRIDGE HELPERS
# ============================================================

def get_all_fridges(active_only: bool = True) -> pd.DataFrame:
    """Return fridge locations as a DataFrame."""
    sql = """
        SELECT id, name, address, city, is_active, notes
        FROM fridges
        WHERE (%s = FALSE OR is_active = TRUE)
        ORDER BY name
    """
    return run_query(sql, (active_only,))


def fridge_options() -> dict:
    """Return {name: id} dict for use in st.selectbox."""
    df = get_all_fridges()
    if df.empty:
        return {}
    return dict(zip(df["name"], df["id"]))


# ============================================================
# INITIATIVE HELPERS
# ============================================================

def get_all_initiatives(active_only: bool = True) -> pd.DataFrame:
    """Return all initiative templates."""
    sql = """
        SELECT i.id, i.name, i.initiative_type, i.day_of_week,
               i.optimal_seats, i.max_seats, i.is_recurring, i.is_active,
               i.description, f.name AS fridge_name
        FROM initiatives i
        LEFT JOIN fridges f ON i.fridge_id = f.id
        WHERE (%s = FALSE OR i.is_active = TRUE)
        ORDER BY i.day_of_week, i.name
    """
    return run_query(sql, (active_only,))


# ============================================================
# EVENT HELPERS
# ============================================================

def get_upcoming_events(days_ahead: int = UPCOMING_DAYS_WINDOW) -> pd.DataFrame:
    """
    Return events in the next N days with seat fill metrics.

    Uses the vw_event_capacity view defined in schema.sql.
    Returns columns: event_id, event_date, initiative_name, initiative_type,
                     optimal_seats, seats_filled, seats_needed, fill_pct,
                     status, fridge_name, fridge_address
    """
    sql = """
        SELECT *
        FROM vw_event_capacity
        WHERE event_date BETWEEN CURRENT_DATE AND (CURRENT_DATE + %s)
          AND status NOT IN ('cancelled', 'completed')
        ORDER BY event_date, initiative_name
    """
    return run_query(sql, (days_ahead,))


def get_unfilled_events(days_ahead: int = UPCOMING_DAYS_WINDOW) -> pd.DataFrame:
    """Return only events that are below their optimal seat count."""
    df = get_upcoming_events(days_ahead)
    if df.empty:
        return df
    return df[df["seats_needed"] > 0].copy()


def get_event_volunteers(event_id: int) -> pd.DataFrame:
    """
    Return volunteers who signed up for a specific event.

    Returns columns: name, phone, email, skill_tag, confirmed, status
    """
    sql = """
        SELECT
            v.name,
            v.phone,
            v.email,
            es.skill_tag,
            es.confirmed,
            es.status,
            es.signed_up_at
        FROM event_signups es
        JOIN volunteers v ON es.volunteer_id = v.id
        WHERE es.event_id = %s
        ORDER BY v.name
    """
    return run_query(sql, (event_id,))


def signup_volunteer_for_event(
    event_id: int,
    volunteer_id: int,
    skill_tag: str = None,
) -> bool:
    """
    Create a sign-up record. Safe to call multiple times (ON CONFLICT DO NOTHING).
    """
    sql = """
        INSERT INTO event_signups (event_id, volunteer_id, skill_tag)
        VALUES (%s, %s, %s)
        ON CONFLICT (event_id, volunteer_id) DO NOTHING
    """
    return run_insert(sql, (event_id, volunteer_id, skill_tag or None))


def cancel_signup(event_id: int, volunteer_id: int) -> bool:
    """Mark a sign-up as cancelled (soft delete)."""
    sql = """
        UPDATE event_signups
        SET status = 'cancelled'
        WHERE event_id = %s AND volunteer_id = %s
    """
    return run_insert(sql, (event_id, volunteer_id))


def generate_weekly_events(days_ahead: int = 14) -> int:
    """
    Auto-populate the events table for the next N days.

    Iterates over all active, recurring initiatives and creates a row
    in the events table for each matching weekday in the window.
    Safe to call multiple times (ON CONFLICT DO NOTHING).

    Returns:
        Number of new event rows created.
    """
    sql_init = """
        SELECT id, name, day_of_week
        FROM initiatives
        WHERE is_recurring = TRUE AND is_active = TRUE AND day_of_week IS NOT NULL
    """
    df = run_query(sql_init)
    if df.empty:
        return 0

    day_map = {
        "Monday": 0, "Tuesday": 1, "Wednesday": 2,
        "Thursday": 3, "Friday": 4, "Saturday": 5, "Sunday": 6,
    }

    today = date.today()
    created = 0

    try:
        conn = _ensure_connection()
        with conn.cursor() as cur:
            for _, row in df.iterrows():
                target_dow = day_map.get(row["day_of_week"])
                if target_dow is None:
                    continue
                for delta in range(days_ahead):
                    check_date = today + timedelta(days=delta)
                    if check_date.weekday() == target_dow:
                        cur.execute(
                            """
                            INSERT INTO events (initiative_id, event_date, status)
                            VALUES (%s, %s, 'open')
                            ON CONFLICT (initiative_id, event_date) DO NOTHING
                            """,
                            (int(row["id"]), check_date),
                        )
                        if cur.rowcount > 0:
                            created += 1
        conn.commit()
    except Exception as e:
        conn.rollback()
        st.error(f"Error generating events: {e}")

    return created


def log_outreach(
    event_id: int,
    volunteer_id: int,
    method: str,
    message: str = "",
    notes: str = "",
) -> bool:
    """Record that Karen (or the system) reached out to a volunteer."""
    sql = """
        INSERT INTO outreach_log (event_id, volunteer_id, method, message_sent, notes)
        VALUES (%s, %s, %s, %s, %s)
    """
    return run_insert(sql, (event_id, volunteer_id, method, message or None, notes or None))


# ============================================================
# DONOR HELPERS
# ============================================================

def get_all_donors() -> pd.DataFrame:
    """Return all active donors."""
    sql = """
        SELECT id, name, email, phone, organization,
               donor_type, first_gift_date, last_contact, notes
        FROM donors
        WHERE is_active = TRUE
        ORDER BY name
    """
    return run_query(sql)


def add_donor(
    name: str,
    email: str,
    phone: str,
    organization: str,
    donor_type: str,
    notes: str = "",
) -> bool:
    """Insert a new donor record."""
    sql = """
        INSERT INTO donors (name, email, phone, organization, donor_type, notes)
        VALUES (%s, %s, %s, %s, %s, %s)
    """
    return run_insert(
        sql,
        (name, email or None, phone or None, organization or None, donor_type, notes or None),
    )


def update_donor_contact(donor_id: int, notes: str = "") -> bool:
    """Stamp last_contact = today and optionally update notes."""
    sql = """
        UPDATE donors
        SET last_contact = CURRENT_DATE,
            notes = COALESCE(NULLIF(%s, ''), notes),
            updated_at = NOW()
        WHERE id = %s
    """
    return run_insert(sql, (notes, donor_id))


# ============================================================
# FOOD RECOVERY / SCHOOL CONTACT HELPERS
# ============================================================

def get_food_recovery_contacts() -> pd.DataFrame:
    """Return all active food recovery contacts (e.g., Tovala)."""
    sql = """
        SELECT id, org_name, contact_name, email, phone,
               pickup_day, pickup_location, reallocation_notes
        FROM food_recovery_contacts
        WHERE is_active = TRUE
        ORDER BY org_name
    """
    return run_query(sql)


def get_school_contacts() -> pd.DataFrame:
    """Return all active school contacts for food drives."""
    sql = """
        SELECT id, school_name, contact_name, email, phone,
               last_drive_date, notes
        FROM school_contacts
        WHERE is_active = TRUE
        ORDER BY school_name
    """
    return run_query(sql)


# ============================================================
# UI HELPER FUNCTIONS
# ============================================================

def get_fill_color(fill_pct) -> str:
    """
    Map a seat fill percentage to a status hex color.

    100+% → green  (STATUS_COLORS["filled"])
    60-99% → gray   (neutral)
    30-59% → amber  (low)
    0-29%  → red    (critical)
    """
    try:
        pct = float(fill_pct or 0)
    except (TypeError, ValueError):
        pct = 0.0
    if pct >= 100:
        return STATUS_COLORS["filled"]
    elif pct >= LOW_FILL_THRESHOLD * 100:
        return STATUS_COLORS["neutral"]
    elif pct >= CRIT_FILL_THRESHOLD * 100:
        return STATUS_COLORS["low"]
    else:
        return STATUS_COLORS["critical"]


def skill_labels(skills_csv: str) -> str:
    """
    Convert a comma-separated string of tag keys into display labels.

    Example:
        skill_labels("cleaning,delivery")
        → "🧹 Cleaning  🚗 Delivery"
    """
    if not skills_csv:
        return "—"
    tags = [t.strip() for t in skills_csv.split(",") if t.strip()]
    return "  ".join(SKILL_TAGS.get(t, t) for t in tags)


def volunteer_select_options(active_only: bool = True) -> dict:
    """
    Return {display_label: id} dict for use in Streamlit selectboxes.

    Example usage:
        options = volunteer_select_options()
        chosen = st.selectbox("Volunteer", list(options.keys()))
        vol_id = options[chosen]
    """
    df = get_all_volunteers(active_only)
    if df.empty:
        return {}
    # Format: "Jane Doe (🥪 Sack Lunch, 🚗 Delivery)"
    labels = df.apply(
        lambda r: f"{r['name']}  ({skill_labels(r['skills'])})" if r["skills"] else r["name"],
        axis=1,
    )
    return dict(zip(labels, df["id"]))
