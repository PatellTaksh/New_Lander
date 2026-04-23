document.addEventListener("DOMContentLoaded", async () => {
    
    // ==========================================
    // 1. Authentication Check
    // ==========================================
    if (!Auth.isLoggedIn()) {
        window.location.href = "login.html";
        return;
    }

    // ==========================================
    // 2. UI Interactivity (Sidebar)
    // ==========================================
    const sidebar = document.getElementById('sidebar');
    const openBtn = document.getElementById('openSidebar');
    const closeBtn = document.getElementById('closeSidebar');

    if (openBtn && sidebar) {
        openBtn.addEventListener('click', () => sidebar.classList.add('active'));
    }
    if (closeBtn && sidebar) {
        closeBtn.addEventListener('click', () => sidebar.classList.remove('active'));
    }

    // Logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            Auth.logout();
        });
    }

    // ==========================================
    // 3. Data Loading Helpers
    // ==========================================
    function setTextAndRemoveSkeleton(id, text, isStat = false) {
        const el = document.getElementById(id);
        if (el) {
            el.textContent = text !== undefined && text !== null ? text : (isStat ? "0" : "-");
            el.classList.remove('skeleton-text', 'skeleton-text-small');
        }
    }

    function getInitials(name) {
        if (!name) return "U";
        return name.charAt(0).toUpperCase();
    }

    // ==========================================
    // 4. Fetch and Render Dashboard Data
    // ==========================================
    try {
        // Fetch via Centralized Auth Class
        const response = await Auth.authenticatedRequest(`${API_BASE_URL}/dashboard.php`, {
            method: 'GET'
        });

        if (!response || !response.success) {
            throw new Error(response ? response.message : "Failed to load dashboard data");
        }

        const data = response.data;

        // --- Render Header & Welcome ---
        const fullName = data.profile.full_name || "User";
        const firstName = fullName.split(' ')[0];
        
        document.getElementById('welcomeMessage').textContent = `Welcome back, ${firstName}!`;
        document.getElementById('headerName').textContent = firstName;
        
        const initials = getInitials(firstName);
        document.getElementById('headerInitials').textContent = initials;
        document.getElementById('mainAvatar').textContent = initials;

        // --- Render Profile Details ---
        setTextAndRemoveSkeleton("fullName", fullName);
        setTextAndRemoveSkeleton("university", data.profile.university || "University not specified");
        setTextAndRemoveSkeleton("email", data.profile.email);
        setTextAndRemoveSkeleton("currentCountry", data.profile.current_country);
        setTextAndRemoveSkeleton("destinationCountry", data.profile.destination_country);
        setTextAndRemoveSkeleton("phone", data.profile.phone || "No phone added");

        // --- Render Stats ---
        setTextAndRemoveSkeleton("statBookings", data.stats.total_bookings, true);
        setTextAndRemoveSkeleton("statEvents", data.stats.registered_events, true);
        setTextAndRemoveSkeleton("statPosts", data.stats.community_posts, true);
        setTextAndRemoveSkeleton("statSavedAcc", data.stats.saved_accommodations, true);

        // --- Render Recent Bookings ---
        const bookingsBox = document.getElementById("recentBookingsList");
        if (!data.recent_bookings || data.recent_bookings.length === 0) {
            bookingsBox.innerHTML = `<div class="empty-state"><i class="fas fa-home" style="font-size:2rem; color:#cbd5e1; margin-bottom:10px;"></i><br>No recent bookings found.</div>`;
        } else {
            bookingsBox.innerHTML = data.recent_bookings.map(item => `
                <div class="list-item">
                    <div class="item-icon blue-light"><i class="fas fa-building"></i></div>
                    <div class="item-info">
                        <h4>${item.title || "Accommodation"}</h4>
                        <p><i class="fas fa-map-marker-alt"></i> ${item.city}, ${item.country}</p>
                    </div>
                    <div class="item-status status-${item.status ? item.status.toLowerCase() : 'pending'}">
                        ${item.status || "Pending"}
                    </div>
                </div>
            `).join("");
        }

        // --- Render Upcoming Events ---
        const eventsBox = document.getElementById("upcomingEventsList");
        if (!data.upcoming_events || data.upcoming_events.length === 0) {
            eventsBox.innerHTML = `<div class="empty-state"><i class="fas fa-calendar" style="font-size:2rem; color:#cbd5e1; margin-bottom:10px;"></i><br>No upcoming events.</div>`;
        } else {
            eventsBox.innerHTML = data.upcoming_events.map(item => {
                const dateObj = new Date(item.event_date);
                const day = dateObj.getDate();
                const month = dateObj.toLocaleString('default', { month: 'short' });
                
                return `
                <div class="list-item">
                    <div class="item-date">
                        <span class="day">${day}</span>
                        <span class="month">${month}</span>
                    </div>
                    <div class="item-info">
                        <h4>${item.title}</h4>
                        <p><i class="fas fa-clock"></i> ${item.event_time} &bull; <i class="fas fa-map-pin"></i> ${item.city}</p>
                    </div>
                </div>
                `;
            }).join("");
        }

        // --- Render Recent Posts ---
        const postsBox = document.getElementById("myPostsList");
        if (!data.recent_posts || data.recent_posts.length === 0) {
            postsBox.innerHTML = `<div class="empty-state"><i class="fas fa-comment-dots" style="font-size:2rem; color:#cbd5e1; margin-bottom:10px;"></i><br>You haven't posted yet.</div>`;
        } else {
            postsBox.innerHTML = data.recent_posts.map(item => `
                <div class="list-item post-item">
                    <div class="item-info">
                        <h4>${item.title}</h4>
                        <div class="post-meta">
                            <span><i class="fas fa-heart"></i> ${item.likes || 0}</span>
                            <span><i class="fas fa-comment"></i> ${item.comments_count || 0}</span>
                        </div>
                    </div>
                </div>
            `).join("");
        }

    } catch (error) {
        console.error("Dashboard Load Error:", error);
        const errorBanner = document.getElementById('errorBanner');
        if (errorBanner) {
            errorBanner.textContent = error.message || "A network error occurred. Please try refreshing the page.";
            errorBanner.style.display = 'flex';
        }
    }
});
