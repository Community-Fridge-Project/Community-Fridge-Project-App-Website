# ============================================================
# pages/2_📅_Events.py
# ============================================================
# Manage events and volunteer sign-ups.
# Features:
#   • View all upcoming events and their fill status
#   • Manually add/cancel volunteer sign-ups for any event
#   • Generate new event rows for recurring initiatives
#   • Add one-off (non-recurring) events
# ============================================================

import streamlit as st
import pandas as pd
from datetime import date, timedelta

from config import APP_ICON, INITIATIVE_TYPES, SKILL_TAGS, DAYS_OF_WEEK
from utils import (
    get_upcoming_events,
    get_event_volunteers,
    signup_volunteer_for_event,
    cancel_signup,
    generate_weekly_events,
    get_all_initiatives,
    get_fill_color,
    skill_labels,
    volunteer_select_options,
    run_insert,
    fridge_options,
)

st.set_page_config(page_title="Events", page_icon="📅", layout="wide")

st.title("📅  Events & Sign-Ups")
st.caption("View upcoming events, manage volunteer assignments, and generate weekly slots.")
st.divider()


# ── Tab Layout ────────────────────────────────────────────────
tab_events, tab_signups, tab_generate, tab_new = st.tabs([
    "📋 Upcoming Events",
    "✏️ Manage Sign-Ups",
    "🔄 Generate Events",
    "➕ Add One-Off Event",
])


# ============================================================
# TAB 1: UPCOMING EVENTS
# ============================================================
with tab_events:
    st.subheader("Upcoming Events")

    days_ahead = st.slider(
        "Show events for the next N days:", min_value=3, max_value=30, value=7, step=1
    )
    df = get_upcoming_events(days_ahead)

    if df.empty:
        st.info("No events found. Use **Generate Events** to create this week's slots.")
    else:
        # Color-coded fill table
        def color_fill(val):
            """Apply row background based on fill status."""
            return ""  # color is shown via the fill_pct column

        display = df[[
            "event_date", "initiative_name", "initiative_type",
            "seats_filled", "optimal_seats", "seats_needed", "fill_pct",
            "fridge_name", "status"
        ]].copy()

        display["event_date"]     = pd.to_datetime(display["event_date"]).dt.strftime("%a %b %d")
        display["initiative_type"]= display["initiative_type"].apply(
            lambda t: INITIATIVE_TYPES.get(t, t)
        )
        display["fill_pct"]       = display["fill_pct"].apply(lambda p: f"{int(p or 0)}%")
        display["seats_needed"]   = display["seats_needed"].astype(int)
        display.columns = [
            "Date", "Event", "Type",
            "Filled", "Optimal", "Needed", "Fill %",
            "Fridge", "Status"
        ]
        st.dataframe(display, use_container_width=True, hide_index=True)


# ============================================================
# TAB 2: MANAGE SIGN-UPS
# ============================================================
with tab_signups:
    st.subheader("Manage Volunteer Sign-Ups")
    st.caption("Add or remove a volunteer from a specific event.")

    df = get_upcoming_events(30)   # show 30 days for full selection

    if df.empty:
        st.info("No upcoming events. Generate events first.")
    else:
        # Build event label → event_id mapping
        df["event_date"] = pd.to_datetime(df["event_date"])
        df["label"] = df.apply(
            lambda r: f"{r['event_date'].strftime('%a %b %d')}  —  {r['initiative_name']}  "
                      f"({int(r['seats_filled'])}/{int(r['optimal_seats'])} filled)",
            axis=1,
        )
        event_options = dict(zip(df["label"], df["event_id"]))

        chosen_event_label = st.selectbox("Select Event:", list(event_options.keys()))
        chosen_event_id    = event_options[chosen_event_label]

        # Current sign-ups
        st.markdown("**Current Sign-Ups:**")
        vol_df = get_event_volunteers(chosen_event_id)

        if vol_df.empty:
            st.info("No volunteers signed up yet.")
        else:
            for _, vrow in vol_df.iterrows():
                v1, v2, v3, v4 = st.columns([2.5, 2, 2, 1])
                v1.write(f"**{vrow['name']}**")
                v2.write(vrow.get("phone") or "—")
                v3.write(SKILL_TAGS.get(vrow.get("skill_tag") or "", "General"))
                status_icon = "✅" if vrow["confirmed"] else "⏳"
                v4.write(f"{status_icon} {vrow['status']}")

        st.divider()

        # Add a volunteer
        with st.form("add_signup_form"):
            st.markdown("**Add a Volunteer:**")
            opts = volunteer_select_options()
            if not opts:
                st.warning("No volunteers found — add some on the Manage Volunteers page.")
            else:
                chosen_vol_label = st.selectbox("Volunteer:", list(opts.keys()))
                chosen_skill     = st.selectbox(
                    "Role for this event:",
                    options=list(SKILL_TAGS.keys()),
                    format_func=lambda k: SKILL_TAGS[k],
                )
                add_btn = st.form_submit_button("➕  Add to Event", use_container_width=True)
                if add_btn:
                    vol_id = opts[chosen_vol_label]
                    ok = signup_volunteer_for_event(chosen_event_id, vol_id, chosen_skill)
                    if ok:
                        st.success(
                            f"✅  {chosen_vol_label.split('  (')[0]} added to event."
                        )
                        st.rerun()

        st.divider()

        # Cancel a sign-up
        with st.form("cancel_signup_form"):
            st.markdown("**Remove a Volunteer:**")
            if vol_df.empty:
                st.info("No sign-ups to remove.")
                st.form_submit_button("Cancel Sign-Up", disabled=True)
            else:
                remove_opts = dict(zip(vol_df["name"], range(len(vol_df))))
                # We need volunteer IDs — re-query for now
                from utils import run_query
                id_df = run_query(
                    """SELECT v.id, v.name FROM event_signups es
                       JOIN volunteers v ON es.volunteer_id = v.id
                       WHERE es.event_id = %s""",
                    (chosen_event_id,),
                )
                if not id_df.empty:
                    id_map = dict(zip(id_df["name"], id_df["id"]))
                    remove_name = st.selectbox("Select volunteer to remove:", list(id_map.keys()))
                    if st.form_submit_button("🗑️  Remove", use_container_width=True):
                        ok = cancel_signup(chosen_event_id, id_map[remove_name])
                        if ok:
                            st.success(f"Removed {remove_name} from the event.")
                            st.rerun()


# ============================================================
# TAB 3: GENERATE EVENTS
# ============================================================
with tab_generate:
    st.subheader("Generate Recurring Events")
    st.markdown(
        "This creates event rows in the database for each active, recurring initiative "
        "within the specified window. It's safe to run multiple times — "
        "existing events are never duplicated."
    )

    days = st.slider("Generate events for the next N days:", 7, 28, 14)

    if st.button("🔄  Generate Events Now", use_container_width=False):
        with st.spinner("Generating…"):
            n = generate_weekly_events(days_ahead=days)
        st.success(f"✅  Done — {n} new event slot{'s' if n != 1 else ''} created.")

    st.divider()
    st.subheader("Active Recurring Initiatives")
    init_df = get_all_initiatives(active_only=True)
    if not init_df.empty:
        display_init = init_df[[
            "name", "initiative_type", "day_of_week",
            "optimal_seats", "max_seats", "fridge_name"
        ]].copy()
        display_init["initiative_type"] = display_init["initiative_type"].apply(
            lambda t: INITIATIVE_TYPES.get(t, t)
        )
        display_init.columns = ["Initiative", "Type", "Day", "Optimal Seats", "Max Seats", "Fridge"]
        st.dataframe(display_init, use_container_width=True, hide_index=True)


# ============================================================
# TAB 4: ADD ONE-OFF EVENT
# ============================================================
with tab_new:
    st.subheader("Add a One-Off Event")
    st.caption(
        "Use this for special events, fundraisers, or school drives "
        "that aren't part of the regular weekly schedule."
    )

    init_df = get_all_initiatives(active_only=True)
    if init_df.empty:
        st.warning("No initiatives exist yet. Contact your developer to add initiatives.")
    else:
        init_options = dict(zip(
            init_df["name"] + "  (" + init_df["initiative_type"] + ")",
            init_df["id"],
        ))

        with st.form("new_event_form", clear_on_submit=True):
            chosen_init_label = st.selectbox("Initiative:", list(init_options.keys()))
            event_date        = st.date_input("Event Date:", value=date.today() + timedelta(days=1))
            event_notes       = st.text_area("Notes (optional):", placeholder="Any special instructions…")

            if st.form_submit_button("➕  Add Event", use_container_width=True):
                init_id = init_options[chosen_init_label]
                ok = run_insert(
                    """INSERT INTO events (initiative_id, event_date, status, notes)
                       VALUES (%s, %s, 'open', %s)
                       ON CONFLICT (initiative_id, event_date) DO NOTHING""",
                    (init_id, event_date, event_notes or None),
                )
                if ok:
                    st.success(
                        f"✅  Event added for "
                        f"{event_date.strftime('%A, %B %d, %Y')}."
                    )
