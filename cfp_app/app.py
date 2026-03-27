# ============================================================
# app.py — Community Fridge Project: Main Entry Point
# ============================================================
# HOW TO RUN:
#   cd cfp_app
#   streamlit run app.py
#
# PAGES (auto-discovered from the /pages folder):
#   1_👥_Manage_Volunteers.py  — Add / edit volunteer records & skills
#   2_📅_Events.py             — Create events, manage sign-ups
#   3_💰_Donor_CRM.py          — Donor contact database
#   4_🌐_Community_Portal.py   — Public-facing volunteer sign-up view
#
# CONFIGURATION:  config.py
# DATABASE UTILS: utils.py
# ============================================================

import streamlit as st
from datetime import date
import pandas as pd

from config import (
    APP_NAME, APP_SUBTITLE, APP_ICON, ADMIN_NAME,
    UPCOMING_DAYS_WINDOW, SKILL_TAGS, INITIATIVE_TYPES,
    STATUS_COLORS,
)
from utils import (
    get_upcoming_events,
    get_unfilled_events,
    get_all_volunteers,
    get_event_volunteers,
    get_volunteers_by_skill,
    generate_weekly_events,
    log_outreach,
    get_fill_color,
    skill_labels,
)


# ── Page Configuration ────────────────────────────────────────
st.set_page_config(
    page_title=f"{APP_NAME} — Admin",
    page_icon=APP_ICON,
    layout="wide",
    initial_sidebar_state="expanded",
)


# ── Global CSS ─────────────────────────────────────────────────
# High-contrast, large touch targets — designed for older volunteers
# and non-technical administrators on phone/tablet.
st.markdown(
    """
    <style>
    /* ── Base font: larger and more readable ─────────────────── */
    html, body, [class*="css"] {
        font-size: 17px !important;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        color: #1a1a1a;
    }

    /* ── Buttons: big tap targets, rounded, bold ─────────────── */
    .stButton > button {
        font-size: 1rem !important;
        font-weight: 600 !important;
        padding: 0.65rem 1.4rem !important;
        border-radius: 10px !important;
        transition: filter 0.15s;
    }
    .stButton > button:hover { filter: brightness(0.93); }

    /* ── Metric cards: light bg + border ─────────────────────── */
    [data-testid="metric-container"] {
        background: #f7f8fa;
        border-radius: 12px;
        padding: 1rem 1.2rem;
        border: 1px solid #dde1e7;
    }

    /* ── Sidebar nav links ───────────────────────────────────── */
    [data-testid="stSidebarNav"] a {
        font-size: 1.05rem !important;
        padding: 0.6rem 0.8rem !important;
        border-radius: 8px;
    }

    /* ── Inputs: larger for easier tapping ───────────────────── */
    input, textarea, select {
        font-size: 1rem !important;
    }

    /* ── Section header style ────────────────────────────────── */
    h2 { margin-top: 1.4rem; margin-bottom: 0.3rem; }
    h3 { margin-top: 1rem; }

    /* ── Event row card ──────────────────────────────────────── */
    .event-card {
        background: #ffffff;
        border: 1px solid #e4e7ec;
        border-radius: 12px;
        padding: 0.9rem 1.2rem;
        margin-bottom: 0.6rem;
    }

    /* ── Pill/badge span ─────────────────────────────────────── */
    .pill {
        display: inline-block;
        padding: 3px 10px;
        border-radius: 20px;
        font-size: 0.82rem;
        font-weight: 600;
        margin-right: 4px;
    }
    </style>
    """,
    unsafe_allow_html=True,
)


# ── Session State Defaults ─────────────────────────────────────
if "selected_event_id" not in st.session_state:
    st.session_state["selected_event_id"] = None
if "show_outreach" not in st.session_state:
    st.session_state["show_outreach"] = False


# ============================================================
# SIDEBAR
# ============================================================
with st.sidebar:
    st.markdown(f"## {APP_ICON} {APP_NAME}")
    st.caption(APP_SUBTITLE)
    st.divider()

    # Quick-status indicator
    try:
        unfilled = get_unfilled_events(UPCOMING_DAYS_WINDOW)
        gap_count = len(unfilled)
    except Exception:
        gap_count = 0

    if gap_count > 0:
        st.warning(f"⚠️  **{gap_count}** event{'s' if gap_count != 1 else ''} need volunteers")
    else:
        st.success("✅  All upcoming events are staffed")

    st.divider()
    st.caption(f"📅  {date.today().strftime('%A, %B %d, %Y')}")
    st.caption("Use the menu above ↑ to navigate pages")


# ============================================================
# PAGE HEADER
# ============================================================
st.title(f"{APP_ICON}  {ADMIN_NAME}'s Dashboard")
st.caption(f"Volunteer Coordination Hub  ·  Week of {date.today().strftime('%B %d, %Y')}")
st.divider()


# ============================================================
# ACTION BAR
# ============================================================
btn_col1, btn_col2, btn_col3 = st.columns([1.4, 1.4, 2])

with btn_col1:
    if st.button("🔄  Generate This Week's Events", use_container_width=True):
        with st.spinner("Creating event slots…"):
            n = generate_weekly_events(days_ahead=14)
        if n > 0:
            st.success(f"✅  Created {n} new event slot{'s' if n != 1 else ''}.")
        else:
            st.info("All events for the next 2 weeks already exist.")

with btn_col2:
    if st.button("📣  Find Gaps & Outreach", use_container_width=True):
        st.session_state["show_outreach"] = True

with btn_col3:
    st.caption(
        "**Tip:** Click **Generate** at the start of each week. "
        "Then use **Find Gaps** to see who to contact."
    )


# ============================================================
# SECTION 1 — THIS WEEK AT A GLANCE (summary metrics)
# ============================================================
st.subheader("📊  This Week at a Glance")

events_df = get_upcoming_events(UPCOMING_DAYS_WINDOW)

if events_df.empty:
    st.info(
        "No upcoming events found. Click **Generate This Week's Events** above "
        "to populate this week's schedule."
    )
else:
    # Aggregate metrics
    total_events        = len(events_df)
    fully_filled        = len(events_df[events_df["seats_needed"] <= 0])
    total_open_seats    = int(events_df["seats_needed"].clip(lower=0).sum())
    total_vols_sched    = int(events_df["seats_filled"].sum())
    fill_rate_avg       = events_df["fill_pct"].mean()

    m1, m2, m3, m4, m5 = st.columns(5)
    m1.metric("📅 Events This Week",      total_events)
    m2.metric("✅ Fully Staffed",          fully_filled)
    m3.metric("⚠️ Events with Gaps",      total_events - fully_filled)
    m4.metric("🔴 Open Seats",             total_open_seats)
    m5.metric("👥 Volunteers Scheduled",   total_vols_sched)

    st.divider()

    # ── Event Cards ──────────────────────────────────────────────
    st.subheader("📅  Upcoming Events")

    # Group by date for cleaner display
    events_df["event_date"] = pd.to_datetime(events_df["event_date"])
    grouped = events_df.groupby("event_date")

    for event_date, day_group in grouped:
        day_label = pd.Timestamp(event_date).strftime("%A, %B %d")
        st.markdown(f"##### 📆  {day_label}")

        for _, row in day_group.iterrows():
            fill_pct    = float(row.get("fill_pct") or 0)
            color       = get_fill_color(fill_pct)
            seats_need  = max(0, int(row["seats_needed"]))
            ev_type_lbl = INITIATIVE_TYPES.get(row["initiative_type"], row["initiative_type"])
            ev_id       = int(row["event_id"])

            with st.container():
                st.markdown('<div class="event-card">', unsafe_allow_html=True)
                c_name, c_fill, c_status, c_action = st.columns([4, 1.5, 1.5, 1])

                with c_name:
                    st.markdown(f"**{row['initiative_name']}**")
                    st.caption(f"{ev_type_lbl}  ·  {row['fridge_name']}")

                with c_fill:
                    st.markdown(
                        f"<span style='color:{color}; font-size:1.25rem; font-weight:700'>"
                        f"{int(row['seats_filled'])}/{int(row['optimal_seats'])}"
                        f"</span> <span style='color:#888; font-size:0.85rem'>filled</span>",
                        unsafe_allow_html=True,
                    )

                with c_status:
                    if seats_need == 0:
                        st.markdown(
                            "<span class='pill' style='background:#d1fadf; color:#166534'>✅ Full</span>",
                            unsafe_allow_html=True,
                        )
                    else:
                        st.markdown(
                            f"<span class='pill' style='background:#fee2e2; color:#991b1b'>"
                            f"🔴 {seats_need} needed"
                            f"</span>",
                            unsafe_allow_html=True,
                        )

                with c_action:
                    if st.button("👥 View", key=f"view_{ev_id}", use_container_width=True):
                        if st.session_state["selected_event_id"] == ev_id:
                            st.session_state["selected_event_id"] = None  # toggle off
                        else:
                            st.session_state["selected_event_id"] = ev_id

                st.markdown("</div>", unsafe_allow_html=True)

            # ── Inline volunteer detail panel ──────────────────
            if st.session_state["selected_event_id"] == ev_id:
                with st.expander(
                    f"👥  Volunteers for {row['initiative_name']} — {day_label}",
                    expanded=True,
                ):
                    vol_df = get_event_volunteers(ev_id)
                    if vol_df.empty:
                        st.info("Nobody has signed up yet.")

                        # Quick add from admin panel
                        with st.form(key=f"quick_add_{ev_id}"):
                            st.caption("Quick-add a volunteer:")
                            from utils import volunteer_select_options
                            opts = volunteer_select_options()
                            if opts:
                                chosen_label = st.selectbox("Volunteer", list(opts.keys()))
                                if st.form_submit_button("➕ Add"):
                                    vol_id = opts[chosen_label]
                                    from utils import signup_volunteer_for_event
                                    ok = signup_volunteer_for_event(ev_id, vol_id,
                                                                     row["initiative_type"])
                                    if ok:
                                        st.success(f"Added {chosen_label.split('  (')[0]}!")
                                        st.rerun()
                            else:
                                st.warning("No volunteers in the database yet.")
                    else:
                        display = vol_df[["name", "phone", "email", "skill_tag", "confirmed"]].copy()
                        display.columns = ["Name", "Phone", "Email", "Role", "Confirmed?"]
                        display["Role"] = display["Role"].apply(
                            lambda t: SKILL_TAGS.get(t, t or "General")
                        )
                        display["Confirmed?"] = display["Confirmed?"].map(
                            {True: "✅ Yes", False: "⏳ Pending"}
                        )
                        st.dataframe(display, use_container_width=True, hide_index=True)

        st.markdown("")   # spacing between days


# ============================================================
# SECTION 2 — DIRECT OUTREACH PANEL
# ============================================================
if st.session_state.get("show_outreach"):
    st.divider()
    st.subheader("📣  Gap Analysis — Who to Contact")

    unfilled_df = get_unfilled_events(UPCOMING_DAYS_WINDOW)

    if unfilled_df.empty:
        st.success("🎉  No gaps! Every event this week is fully staffed.")
        st.session_state["show_outreach"] = False
    else:
        st.markdown(
            f"**{len(unfilled_df)} event{'s' if len(unfilled_df) != 1 else ''}** "
            "are below their optimal volunteer count:"
        )
        for _, row in unfilled_df.iterrows():
            skill       = row.get("initiative_type", "")
            seats_need  = max(0, int(row["seats_needed"]))
            ev_label    = f"{row['initiative_name']}  —  " \
                          f"{pd.Timestamp(row['event_date']).strftime('%a, %b %d')}  " \
                          f"({seats_need} open)"

            with st.expander(f"🔴  {ev_label}"):
                avail = get_volunteers_by_skill(skill)
                if avail.empty:
                    st.warning(
                        f"No volunteers tagged with **{SKILL_TAGS.get(skill, skill)}** found. "
                        "Add skills to volunteers on the Manage Volunteers page."
                    )
                else:
                    st.markdown(
                        f"Volunteers with **{SKILL_TAGS.get(skill, skill)}** skill "
                        f"(not yet signed up):"
                    )
                    # Filter out already-signed-up volunteers
                    signed_up = get_event_volunteers(int(row["event_id"]))
                    signed_names = set(signed_up["name"].tolist()) if not signed_up.empty else set()

                    shown = 0
                    for _, vol in avail.iterrows():
                        if vol["name"] in signed_names:
                            continue
                        shown += 1
                        vc1, vc2, vc3, vc4 = st.columns([2.5, 2, 2, 1])
                        vc1.write(f"**{vol['name']}**")
                        vc2.write(vol.get("phone") or "—")
                        vc3.write(vol.get("email") or "—")
                        with vc4:
                            btn_key = f"outreach_{row['event_id']}_{vol['id']}"
                            if st.button("📱 Flag", key=btn_key, use_container_width=True):
                                log_outreach(
                                    event_id=int(row["event_id"]),
                                    volunteer_id=int(vol["id"]),
                                    method="text",
                                    notes="Flagged from admin dashboard",
                                )
                                st.success(f"Logged outreach for {vol['name']}.")
                    if shown == 0:
                        st.info("All available volunteers with this skill are already signed up.")

    if st.button("✖  Close Outreach Panel"):
        st.session_state["show_outreach"] = False
        st.rerun()


# ============================================================
# SECTION 3 — VOLUNTEER ROSTER SNAPSHOT
# ============================================================
st.divider()
st.subheader("👥  Volunteer Roster Snapshot")

vol_df = get_all_volunteers(active_only=True)

if vol_df.empty:
    st.info(
        "No volunteers in the database yet. "
        "Go to **Manage Volunteers** in the sidebar to add your first volunteer."
    )
else:
    # Skill breakdown metrics
    skill_cols = st.columns(len(SKILL_TAGS))
    for i, (tag_key, tag_label) in enumerate(SKILL_TAGS.items()):
        count = vol_df["skills"].str.contains(tag_key, na=False).sum()
        skill_cols[i].metric(tag_label, int(count))

    st.markdown("")

    with st.expander(f"View Full Roster ({len(vol_df)} active volunteers)", expanded=False):
        display_df = vol_df[["name", "phone", "email", "skills", "joined_date"]].copy()
        display_df["skills"] = display_df["skills"].apply(skill_labels)
        display_df["joined_date"] = pd.to_datetime(display_df["joined_date"]).dt.strftime("%b %d, %Y")
        display_df.columns = ["Name", "Phone", "Email", "Skills", "Joined"]
        st.dataframe(display_df, use_container_width=True, hide_index=True)
