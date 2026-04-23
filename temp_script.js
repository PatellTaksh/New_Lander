
        // ── Constants ──────────────────────────────────────────
        const API_BASE_URL = "../NewLander-backend";

        // ── Protect page ───────────────────────────────────────
        if (!Auth.isLoggedIn()) {
            window.location.href = "login.html";
        }

        // ── Boot ───────────────────────────────────────────────
        document.addEventListener("DOMContentLoaded", loadDashboard);

        // ── Load everything from dashboard.php ─────────────────
        async function loadDashboard() {
            try {
                const response = await Auth.authenticatedRequest(`${API_BASE_URL}/dashboard.php`);

                if (response && response.success) {
                    const d = response.data;
                    populateUI(d.profile);
                    populateStats(d.stats);
                    populateUpcomingEvents(d.upcoming_events);
                    populateRecentBookings(d.recent_bookings);
                    populateRecentPosts(d.recent_posts);

                    document.getElementById("loading").style.display = "none";
                    document.getElementById("dashContent").style.display = "block";
                } else {
                    // Fallback: try profile only
                    const pRes = await Auth.authenticatedRequest(`${API_BASE_URL}/profile.php`);
                    if (pRes && pRes.success) {
                        populateUI(pRes.data);
                        document.getElementById("loading").style.display = "none";
                        document.getElementById("dashContent").style.display = "block";
                    } else {
                        showError("Failed to load dashboard. Please refresh.");
                    }
                }
            } catch (error) {
                console.error("loadDashboard error:", error);
                showError("Failed to connect to server. Is XAMPP running?");
            }
        }

        function showError(msg) {
            const el = document.getElementById("loading");
            if (el) el.innerHTML = `<i class="fas fa-exclamation-circle" style="color:#ef4444;animation:none;font-size:2rem"></i><br><br>${msg}`;
        }

        // ── Populate profile fields ────────────────────────────
        function populateUI(user) {
            const name  = user.full_name || "User";
            const email = user.email || "—";
            const from  = user.current_country || "—";
            const to    = user.destination_country || "—";
            const ini   = getInitials(name);

            // Navbar
            safeSet("navInitials", ini, true);
            safeSet("navName", "Hello, " + name.split(" ")[0]);

            // Hero
            safeSet("heroInitials", ini, true);
            safeSet("heroName", name);
            safeSet("heroEmail", email);
            safeSet("heroFrom", from);
            safeSet("heroTo", to);

            // Profile section
            safeSet("profileAvatar", ini, true);
            safeSet("profileName", name);
            safeSet("profileEmail", email);
            safeSet("routeFrom", from);
            safeSet("routeTo", to);
            if (user.bio)        safeSet("profileBio",  user.bio);
            if (user.phone)      safeSet("profilePhone", user.phone);
            if (user.university) safeSet("profileUniv",  user.university);

            // Pre-fill edit form
            safeVal("editName",  name);
            safeVal("editEmail", email);
            setSelect("editFrom", from);
            setSelect("editTo",   to);
            safeVal("editBio",      user.bio        || "");
            safeVal("editPhone",    user.phone       || "");
            safeVal("editUniversity", user.university || "");

            // Store for re-use
            window._currentUser = user;
        }

        // ── Populate stats cards ───────────────────────────────
        function populateStats(stats) {
            if (!stats) return;
            safeSet("statSavedAcc",    stats.saved_accommodations ?? "0", true);
            safeSet("statEvents",      stats.registered_events    ?? "0", true);
            safeSet("statPosts",       stats.community_posts       ?? "0", true);
            safeSet("statBookings",    stats.total_bookings        ?? "0", true);
        }

        // ── Populate upcoming events list ─────────────────────
        function populateUpcomingEvents(events) {
            const container = document.getElementById("upcomingEventsList");
            if (!container) return;

            if (!events || events.length === 0) {
                container.innerHTML = '<p style="color:#aaa;text-align:center;padding:20px">No upcoming events registered.</p>';
                return;
            }

            container.innerHTML = events.map(ev => {
                const d   = new Date(ev.event_date);
                const day = d.getDate();
                const mon = d.toLocaleString("en-US", { month: "short" });
                const catColors = { networking:"#2196F3", cultural:"#FF9800", orientation:"#4CAF50", workshop:"#9C27B0" };
                const col = catColors[ev.category] || "#667eea";
                return `
                <div class="event-row">
                    <div class="event-date-box" style="background:${col}">
                        <div class="day">${day}</div>
                        <div class="mon">${mon}</div>
                    </div>
                    <div class="event-details">
                        <h4>${ev.title}</h4>
                        <div class="event-meta">
                            <span><i class="fas fa-map-marker-alt"></i> ${ev.city}, ${ev.country}</span>
                            <span><i class="fas fa-clock"></i> ${ev.event_time || ""}</span>
                        </div>
                    </div>
                    <span class="status upcoming">${ev.category}</span>
                </div>`;
            }).join("");
        }

        // ── Populate recent bookings table ─────────────────────
        function populateRecentBookings(bookings) {
            const tbody = document.getElementById("bookingsTable");
            if (!tbody) return;

            if (!bookings || bookings.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#aaa;padding:20px">No bookings yet.</td></tr>';
                return;
            }

            tbody.innerHTML = bookings.map(b => {
                const statusClass = { pending:"pending", confirmed:"confirmed", cancelled:"cancelled", completed:"attended" }[b.status] || "pending";
                const icon = { apartment:"🏢", hostel:"🏨", shared:"🏠", pg:"🛏️" }[b.type] || "🏠";
                return `
                <tr data-bstatus="${b.status}">
                    <td>
                        <div class="td-prop">
                            <div class="td-icon">${icon}</div>
                            <div>
                                <div class="td-name">${b.title}</div>
                                <div class="td-sub">${b.city || ""}, ${b.country || ""}</div>
                            </div>
                        </div>
                    </td>
                    <td>${b.move_in_date}</td>
                    <td>$${parseFloat(b.monthly_rent).toLocaleString()}/mo × ${b.duration_months} mo</td>
                    <td><strong>$${parseFloat(b.total_amount).toLocaleString()}</strong></td>
                    <td><span class="status ${statusClass}">${b.status}</span></td>
                </tr>`;
            }).join("");
        }

        // ── Populate recent posts ──────────────────────────────
        function populateRecentPosts(posts) {
            const container = document.getElementById("myPostsList");
            if (!container) return;

            if (!posts || posts.length === 0) {
                container.innerHTML = '<p style="color:#aaa;text-align:center;padding:20px">You haven\'t posted anything yet.</p>';
                return;
            }

            container.innerHTML = posts.map(p => {
                const date = new Date(p.created_at).toLocaleDateString("en-US", { month:"short", day:"numeric" });
                return `
                <div style="padding:12px 0;border-bottom:1px solid #f5f5f8">
                    <div style="display:flex;justify-content:space-between;align-items:start">
                        <div>
                            <span style="font-size:0.72rem;text-transform:uppercase;font-weight:600;color:${p.post_type==='question'?'#FF9800':'#667eea'};background:${p.post_type==='question'?'#fff7ed':'#eff6ff'};padding:2px 8px;border-radius:10px">${p.post_type}</span>
                            <div style="font-weight:600;color:#2d3748;margin-top:6px">${p.title}</div>
                            <div style="font-size:0.8rem;color:#aaa;margin-top:4px">
                                <i class="fas fa-thumbs-up"></i> ${p.likes} &nbsp;
                                <i class="fas fa-comment"></i> ${p.comments_count} &nbsp;
                                ${date}
                            </div>
                        </div>
                        <button onclick="deleteMyPost(${p.id}, this)" style="background:none;border:none;cursor:pointer;color:#ef4444;font-size:0.8rem" title="Delete post">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>`;
            }).join("");
        }

        // ── Delete own post ────────────────────────────────────
        async function deleteMyPost(postId, btn) {
            if (!confirm("Delete this post?")) return;
            try {
                const res = await Auth.authenticatedRequest(`${API_BASE_URL}/posts.php?id=${postId}`, { method: "DELETE" });
                if (res && res.success) {
                    btn.closest("div[style]").remove();
                    showToast("✅ Post deleted");
                } else {
                    showToast("⚠️ " + (res ? res.message : "Failed to delete"));
                }
            } catch(e) { showToast("⚠️ Network error"); }
        }

        // ── Save profile (wired to API) ────────────────────────
        async function saveProfile(e) {
            e.preventDefault();

            const name = document.getElementById("editName").value.trim();
            const from = document.getElementById("editFrom").value;
            const to   = document.getElementById("editTo").value;
            const bio  = (document.getElementById("editBio")         || {}).value || "";
            const phone= (document.getElementById("editPhone")        || {}).value || "";
            const univ = (document.getElementById("editUniversity")   || {}).value || "";

            if (!name) { showToast("⚠️ Name cannot be empty."); return; }

            const btn = e.target.querySelector("[type=submit]") || e.target.querySelector("button");
            if (btn) { btn.disabled = true; btn.textContent = "Saving..."; }

            try {
                const result = await Auth.updateProfile({
                    full_name: name, current_country: from, destination_country: to,
                    bio, phone, university: univ
                });

                if (result && result.success) {
                    populateUI(result.data);
                    showToast("✅ Profile updated successfully!");
                } else {
                    showToast("⚠️ " + (result ? result.message : "Failed to update profile"));
                }
            } catch(err) {
                showToast("⚠️ Network error. Please try again.");
            } finally {
                if (btn) { btn.disabled = false; btn.textContent = "Save Changes"; }
            }
        }

        // ── Change password (wired to API) ─────────────────────
        async function changePassword(e) {
            e.preventDefault();

            const cur  = document.getElementById("curPw").value;
            const np   = document.getElementById("newPw").value;
            const conf = document.getElementById("confPw").value;

            if (!cur)          { showToast("⚠️ Enter your current password."); return; }
            if (np.length < 6) { showToast("⚠️ Password must be 6+ characters."); return; }
            if (np !== conf)   { showToast("⚠️ Passwords do not match."); return; }

            const btn = e.target.querySelector("button[type=submit]");
            if (btn) { btn.disabled = true; btn.textContent = "Updating..."; }

            try {
                const result = await Auth.changePassword(cur, np, conf);
                if (result && result.success) {
                    ["curPw","newPw","confPw"].forEach(id => document.getElementById(id).value = "");
                    document.getElementById("strengthFill").style.width = "0%";
                    document.getElementById("strengthLbl").textContent = "";
                    showToast("🔐 Password updated successfully!");
                } else {
                    showToast("⚠️ " + (result ? result.message : "Failed to change password"));
                }
            } catch(err) {
                showToast("⚠️ Network error.");
            } finally {
                if (btn) { btn.disabled = false; btn.textContent = "Update Password"; }
            }
        }

        // ── Helpers ────────────────────────────────────────────
        function getInitials(name) {
            const parts = name.trim().split(" ");
            return (parts[0][0] + (parts[1] ? parts[1][0] : "")).toUpperCase();
        }

        function safeSet(id, val, isText = false) {
            const el = document.getElementById(id);
            if (!el) return;
            if (isText) el.textContent = val; else el.textContent = val;
        }

        function safeVal(id, val) {
            const el = document.getElementById(id);
            if (el) el.value = val;
        }

        function setSelect(id, val) {
            const el = document.getElementById(id);
            if (!el) return;
            for (let opt of el.options) {
                if (opt.value === val) { el.value = val; break; }
            }
        }

        function checkStrength(val) {
            const fill = document.getElementById("strengthFill");
            const lbl  = document.getElementById("strengthLbl");
            if (!val) { fill.style.width = "0%"; lbl.textContent = ""; return; }
            let score = 0;
            if (val.length >= 6)        score++;
            if (val.length >= 10)       score++;
            if (/[A-Z]/.test(val))      score++;
            if (/[0-9]/.test(val))      score++;
            if (/[^A-Za-z0-9]/.test(val)) score++;
            const lvls = [
                { w:"20%", c:"#ef4444", t:"Weak" },
                { w:"40%", c:"#f97316", t:"Fair" },
                { w:"60%", c:"#eab308", t:"Good" },
                { w:"80%", c:"#22c55e", t:"Strong" },
                { w:"100%",c:"#22c55e", t:"Very Strong" }
            ];
            const l = lvls[Math.min(score - 1, 4)] || lvls[0];
            fill.style.width = l.w; fill.style.background = l.c;
            lbl.textContent = "Strength: " + l.t; lbl.style.color = l.c;
        }

        function togglePw(id, btn) {
            const inp = document.getElementById(id);
            if (inp.type === "password") { inp.type = "text";     btn.innerHTML = '<i class="fas fa-eye-slash"></i>'; }
            else                         { inp.type = "password"; btn.innerHTML = '<i class="fas fa-eye"></i>'; }
        }

        function showSection(name, navEl) {
            document.querySelectorAll(".section").forEach(s => s.classList.remove("active"));
            document.querySelectorAll(".sidebar-item").forEach(n => n.classList.remove("active"));
            const sec = document.getElementById("sec-" + name);
            if (sec) sec.classList.add("active");
            if (navEl) navEl.classList.add("active");
            closeSidebar();
            window.scrollTo({ top: 0, behavior: "smooth" });
        }

        function filterBookings(status, btn) {
            document.querySelectorAll(".filter-tabs .ftab").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            document.querySelectorAll("#bookingsTable tr").forEach(row => {
                row.style.display = (status === "all" || row.dataset.bstatus === status) ? "" : "none";
            });
        }

        function filterEvents(type, btn) {
            document.querySelectorAll("#sec-events .filter-tabs .ftab").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            document.querySelectorAll("#eventsList .card").forEach(card => {
                card.style.display = (type === "all" || card.dataset.etype === type) ? "" : "none";
            });
        }

        function cancelEvent(btn) {
            const card = btn.closest(".card");
            card.style.opacity = "0.4";
            card.style.pointerEvents = "none";
            showToast("❌ Event registration cancelled.");
        }

        function toggleSidebar() {
            document.getElementById("sidebar").classList.toggle("open");
            document.getElementById("overlay").classList.toggle("show");
        }

        function closeSidebar() {
            document.getElementById("sidebar").classList.remove("open");
            document.getElementById("overlay").classList.remove("show");
        }

        let _toastTimer;
        function showToast(msg) {
            const t = document.getElementById("toast");
            document.getElementById("toastMsg").textContent = msg;
            t.classList.add("show");
            clearTimeout(_toastTimer);
            _toastTimer = setTimeout(() => t.classList.remove("show"), 3000);
        }
    
