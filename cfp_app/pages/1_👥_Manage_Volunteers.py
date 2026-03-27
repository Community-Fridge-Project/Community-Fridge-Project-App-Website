# ============================================================
# pages/1_👥_Manage_Volunteers.py
# ============================================================
# Admin page for managing the volunteer roster.
# Features:
#   • Add a new volunteer with skill tags
#   • Edit name, phone, email, skills, active status
#   • View/filter the full roster
# ============================================================

import streamlit as st
import pandas as pd

from config import APP_ICON, SKILL_TAGS
from utils import (
    get_all_volunteers,
    add_volunteer,
    update_volunteer,
    get_volunteer_tags,
    skill_labels,
)

st.set_page_config(page_title="Manage Volunteers", page_icon="👥", layout="wide")

st.title("👥  Manage Volunteers")
st.caption("Add, edit, or deactivate volunteers and their skill assignments.")
st.divider()


# ── Tab Layout ────────────────────────────────────────────────
tab_list, tab_add, tab_edit = st.tabs(["📋 Roster", "➕ Add Volunteer", "✏️ Edit Volunteer"])


# ============================================================
# TAB 1: ROSTER
# ============================================================
with tab_list:
    st.subheader("Current Volunteer Roster")

    show_inactive = st.checkbox("Show inactive volunteers", value=False)
    vol_df = get_all_volunteers(active_only=not show_inactive)

    if vol_df.empty:
        st.info("No volunteers found. Use the **Add Volunteer** tab to get started.")
    else:
        # Skill filter
        skill_filter = st.multiselect(
            "Filter by skill tag:",
            options=list(SKILL_TAGS.keys()),
            format_func=lambda k: SKILL_TAGS[k],
            default=[],
        )
        if skill_filter:
            mask = vol_df["skills"].apply(
                lambda s: any(tag in (s or "") for tag in skill_filter)
            )
            vol_df = vol_df[mask]

        st.caption(f"Showing {len(vol_df)} volunteer{'s' if len(vol_df) != 1 else ''}")

        display = vol_df[["name", "phone", "email", "skills", "is_active", "joined_date"]].copy()
        display["skills"]      = display["skills"].apply(skill_labels)
        display["is_active"]   = display["is_active"].map({True: "✅ Active", False: "⛔ Inactive"})
        display["joined_date"] = pd.to_datetime(display["joined_date"]).dt.strftime("%b %d, %Y")
        display.columns = ["Name", "Phone", "Email", "Skills", "Status", "Joined"]

        st.dataframe(display, use_container_width=True, hide_index=True)


# ============================================================
# TAB 2: ADD VOLUNTEER
# ============================================================
with tab_add:
    st.subheader("Add a New Volunteer")
    st.caption("Fields marked with * are required.")

    with st.form("add_volunteer_form", clear_on_submit=True):
        col1, col2 = st.columns(2)
        with col1:
            name  = st.text_input("Full Name *", placeholder="e.g. Jane Smith")
            phone = st.text_input("Phone Number", placeholder="e.g. (512) 555-0100")
        with col2:
            email = st.text_input("Email Address", placeholder="e.g. jane@example.com")
            notes = st.text_input("Admin Notes", placeholder="e.g. prefers morning shifts")

        st.markdown("**Skill Tags** — select all that apply:")
        # Render checkboxes in two rows for readability
        tag_keys    = list(SKILL_TAGS.keys())
        tag_labels  = list(SKILL_TAGS.values())
        half        = (len(tag_keys) + 1) // 2
        cb_cols     = st.columns(2)
        selected_tags = []
        for i, (key, label) in enumerate(zip(tag_keys, tag_labels)):
            col = cb_cols[0] if i < half else cb_cols[1]
            if col.checkbox(label, key=f"add_tag_{key}"):
                selected_tags.append(key)

        submitted = st.form_submit_button("➕  Add Volunteer", use_container_width=True)

        if submitted:
            if not name.strip():
                st.error("Name is required.")
            else:
                new_id = add_volunteer(
                    name=name.strip(),
                    email=email.strip(),
                    phone=phone.strip(),
                    tags=selected_tags,
                    notes=notes.strip(),
                )
                if new_id:
                    st.success(f"✅  {name.strip()} added to the roster! (ID: {new_id})")
                    st.balloons()


# ============================================================
# TAB 3: EDIT VOLUNTEER
# ============================================================
with tab_edit:
    st.subheader("Edit an Existing Volunteer")

    vol_df_all = get_all_volunteers(active_only=False)

    if vol_df_all.empty:
        st.info("No volunteers in the database yet.")
    else:
        # Search / select
        search = st.text_input("Search by name:", placeholder="Type to filter…")
        filtered = vol_df_all
        if search:
            filtered = vol_df_all[
                vol_df_all["name"].str.contains(search, case=False, na=False)
            ]

        if filtered.empty:
            st.warning("No volunteers match that name.")
        else:
            name_options = dict(zip(filtered["name"] + " (ID:" + filtered["id"].astype(str) + ")",
                                    filtered["id"]))
            chosen_label = st.selectbox("Select volunteer to edit:", list(name_options.keys()))
            vol_id = name_options[chosen_label]

            # Load current values
            row = vol_df_all[vol_df_all["id"] == vol_id].iloc[0]
            current_tags = get_volunteer_tags(vol_id)

            with st.form("edit_volunteer_form"):
                ec1, ec2 = st.columns(2)
                with ec1:
                    new_name  = st.text_input("Full Name *", value=row["name"])
                    new_phone = st.text_input("Phone", value=row["phone"] or "")
                    is_active = st.checkbox("Active volunteer", value=bool(row["is_active"]))
                with ec2:
                    new_email = st.text_input("Email", value=row["email"] or "")
                    new_notes = st.text_input("Notes", value=row["notes"] or "")

                st.markdown("**Skill Tags:**")
                tag_keys   = list(SKILL_TAGS.keys())
                tag_labels = list(SKILL_TAGS.values())
                half       = (len(tag_keys) + 1) // 2
                cb_cols    = st.columns(2)
                updated_tags = []
                for i, (key, label) in enumerate(zip(tag_keys, tag_labels)):
                    col = cb_cols[0] if i < half else cb_cols[1]
                    if col.checkbox(label, value=(key in current_tags), key=f"edit_tag_{key}"):
                        updated_tags.append(key)

                save = st.form_submit_button("💾  Save Changes", use_container_width=True)

                if save:
                    if not new_name.strip():
                        st.error("Name cannot be empty.")
                    else:
                        ok = update_volunteer(
                            volunteer_id=vol_id,
                            name=new_name.strip(),
                            email=new_email.strip(),
                            phone=new_phone.strip(),
                            tags=updated_tags,
                            notes=new_notes.strip(),
                            is_active=is_active,
                        )
                        if ok:
                            st.success(f"✅  {new_name.strip()} updated successfully.")
                            st.rerun()
