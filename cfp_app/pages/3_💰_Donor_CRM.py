# ============================================================
# pages/3_💰_Donor_CRM.py
# ============================================================
# Secondary CRM for donor contacts.
# Features:
#   • View and search donor records
#   • Add a new donor
#   • Log a contact / update notes
#   • View food recovery and school contacts
# ============================================================

import streamlit as st
import pandas as pd
from datetime import date

from config import APP_ICON, DONOR_TYPES
from utils import (
    get_all_donors,
    add_donor,
    update_donor_contact,
    get_food_recovery_contacts,
    get_school_contacts,
    run_insert,
)

st.set_page_config(page_title="Donor CRM", page_icon="💰", layout="wide")

st.title("💰  Donor CRM")
st.caption("Manage donor contacts, track outreach, and view food recovery partners.")
st.divider()


# ── Tab Layout ────────────────────────────────────────────────
tab_donors, tab_add, tab_food_recovery, tab_schools = st.tabs([
    "📋 Donor List",
    "➕ Add Donor",
    "♻️ Food Recovery",
    "🏫 School Contacts",
])


# ============================================================
# TAB 1: DONOR LIST
# ============================================================
with tab_donors:
    st.subheader("Donor Contacts")

    donors_df = get_all_donors()

    if donors_df.empty:
        st.info("No donors in the database. Use **Add Donor** to get started.")
    else:
        # Search
        search = st.text_input("🔍  Search by name or organization:", placeholder="Type to filter…")
        filtered = donors_df
        if search:
            mask = (
                donors_df["name"].str.contains(search, case=False, na=False) |
                donors_df["organization"].str.contains(search, case=False, na=False)
            )
            filtered = donors_df[mask]

        # Type filter
        type_filter = st.multiselect(
            "Filter by donor type:",
            options=list(DONOR_TYPES.keys()),
            format_func=lambda k: DONOR_TYPES[k],
            default=[],
        )
        if type_filter:
            filtered = filtered[filtered["donor_type"].isin(type_filter)]

        st.caption(f"Showing {len(filtered)} donor{'s' if len(filtered) != 1 else ''}")

        if not filtered.empty:
            display = filtered[[
                "name", "organization", "donor_type", "email",
                "phone", "first_gift_date", "last_contact", "notes"
            ]].copy()
            display["donor_type"] = display["donor_type"].apply(
                lambda t: DONOR_TYPES.get(t or "", t or "—")
            )
            display["first_gift_date"] = pd.to_datetime(
                display["first_gift_date"], errors="coerce"
            ).dt.strftime("%b %d, %Y").fillna("—")
            display["last_contact"] = pd.to_datetime(
                display["last_contact"], errors="coerce"
            ).dt.strftime("%b %d, %Y").fillna("—")
            display.columns = [
                "Name", "Organization", "Type", "Email",
                "Phone", "First Gift", "Last Contact", "Notes"
            ]
            st.dataframe(display, use_container_width=True, hide_index=True)

    st.divider()

    # Log a contact
    st.subheader("Log a Donor Contact")
    donors_df2 = get_all_donors()
    if not donors_df2.empty:
        donor_opts = dict(zip(
            donors_df2["name"] + (
                "  (" + donors_df2["organization"].fillna("") + ")"
            ).str.replace("  ()", "", regex=False),
            donors_df2["id"],
        ))
        with st.form("log_contact_form", clear_on_submit=True):
            chosen = st.selectbox("Select donor:", list(donor_opts.keys()))
            contact_notes = st.text_area(
                "Notes from this interaction:", placeholder="e.g. Spoke on phone, interested in matching gift…"
            )
            if st.form_submit_button("📝  Log Contact (set Last Contact = Today)"):
                ok = update_donor_contact(donor_opts[chosen], contact_notes)
                if ok:
                    st.success("✅  Contact logged and last_contact date updated.")
                    st.rerun()


# ============================================================
# TAB 2: ADD DONOR
# ============================================================
with tab_add:
    st.subheader("Add a New Donor")
    st.caption("Fields marked with * are required.")

    with st.form("add_donor_form", clear_on_submit=True):
        c1, c2 = st.columns(2)
        with c1:
            d_name  = st.text_input("Full Name *", placeholder="e.g. Robert Johnson")
            d_email = st.text_input("Email", placeholder="robert@example.com")
            d_org   = st.text_input("Organization", placeholder="e.g. Austin Gives Foundation")
        with c2:
            d_phone = st.text_input("Phone", placeholder="(512) 555-0200")
            d_type  = st.selectbox(
                "Donor Type *",
                options=list(DONOR_TYPES.keys()),
                format_func=lambda k: DONOR_TYPES[k],
            )
        d_notes = st.text_area("Notes", placeholder="Any relevant background…")

        if st.form_submit_button("➕  Add Donor", use_container_width=True):
            if not d_name.strip():
                st.error("Name is required.")
            else:
                ok = add_donor(
                    name=d_name.strip(),
                    email=d_email.strip(),
                    phone=d_phone.strip(),
                    organization=d_org.strip(),
                    donor_type=d_type,
                    notes=d_notes.strip(),
                )
                if ok:
                    st.success(f"✅  {d_name.strip()} added to the donor database.")
                    st.balloons()


# ============================================================
# TAB 3: FOOD RECOVERY
# ============================================================
with tab_food_recovery:
    st.subheader("♻️  Food Recovery Contacts")
    st.caption("Organizations like Tovala that donate recovered food.")

    fr_df = get_food_recovery_contacts()

    if fr_df.empty:
        st.info("No food recovery contacts found.")
    else:
        for _, row in fr_df.iterrows():
            with st.container():
                st.markdown(f"**{row['org_name']}**")
                cols = st.columns(4)
                cols[0].metric("Contact", row.get("contact_name") or "—")
                cols[1].metric("Pickup Day", row.get("pickup_day") or "—")
                cols[2].metric("Location", row.get("pickup_location") or "—")
                if row.get("reallocation_notes"):
                    st.caption(f"Reallocation: {row['reallocation_notes']}")
                st.divider()

    # Quick-add food recovery contact
    with st.expander("➕  Add Food Recovery Contact"):
        with st.form("add_fr_form", clear_on_submit=True):
            fr_org      = st.text_input("Organization Name *")
            fr_contact  = st.text_input("Contact Person")
            fr_email    = st.text_input("Email")
            fr_phone    = st.text_input("Phone")
            fr_day      = st.text_input("Pickup Day", placeholder="e.g. Saturday AM")
            fr_loc      = st.text_input("Pickup Location", placeholder="e.g. Carol Stream")
            fr_notes    = st.text_area("Reallocation Notes")

            if st.form_submit_button("➕  Add Contact"):
                if not fr_org.strip():
                    st.error("Organization name is required.")
                else:
                    ok = run_insert(
                        """INSERT INTO food_recovery_contacts
                           (org_name, contact_name, email, phone,
                            pickup_day, pickup_location, reallocation_notes)
                           VALUES (%s, %s, %s, %s, %s, %s, %s)""",
                        (fr_org.strip(), fr_contact or None, fr_email or None,
                         fr_phone or None, fr_day or None, fr_loc or None,
                         fr_notes or None),
                    )
                    if ok:
                        st.success(f"✅  {fr_org.strip()} added.")
                        st.rerun()


# ============================================================
# TAB 4: SCHOOL CONTACTS
# ============================================================
with tab_schools:
    st.subheader("🏫  School Contacts")
    st.caption("School contacts for annual or seasonal food drives.")

    sc_df = get_school_contacts()

    if sc_df.empty:
        st.info("No school contacts yet.")
    else:
        display = sc_df[[
            "school_name", "contact_name", "email", "phone",
            "last_drive_date", "notes"
        ]].copy()
        display["last_drive_date"] = pd.to_datetime(
            display["last_drive_date"], errors="coerce"
        ).dt.strftime("%b %d, %Y").fillna("—")
        display.columns = ["School", "Contact", "Email", "Phone", "Last Drive", "Notes"]
        st.dataframe(display, use_container_width=True, hide_index=True)

    # Quick-add school
    with st.expander("➕  Add School Contact"):
        with st.form("add_school_form", clear_on_submit=True):
            sc_school   = st.text_input("School Name *")
            sc_contact  = st.text_input("Contact Person")
            sc_email    = st.text_input("Email")
            sc_phone    = st.text_input("Phone")
            sc_notes    = st.text_area("Notes")

            if st.form_submit_button("➕  Add School"):
                if not sc_school.strip():
                    st.error("School name is required.")
                else:
                    ok = run_insert(
                        """INSERT INTO school_contacts
                           (school_name, contact_name, email, phone, notes)
                           VALUES (%s, %s, %s, %s, %s)""",
                        (sc_school.strip(), sc_contact or None,
                         sc_email or None, sc_phone or None, sc_notes or None),
                    )
                    if ok:
                        st.success(f"✅  {sc_school.strip()} added.")
                        st.rerun()
