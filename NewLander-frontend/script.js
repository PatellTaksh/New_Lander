// Hardcoded fallback data removed in favor of dynamic API fetching

// Initialize page
document.addEventListener('DOMContentLoaded', function () {
    loadAccommodations();
    loadDiscussions();
    loadQuestions();
    loadMentors();
    loadEvents();
    loadServices();

    // Check if user is logged in and update UI
    checkLoginStatus();

    // Smooth scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // Mobile menu toggle
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');

    if (hamburger) {
        hamburger.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }
});

// Load Accommodations from Backend
async function loadAccommodations(filters = {}) {
    const grid = document.getElementById('accommodationGrid');
    if (!grid) return;

    grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;color:#666">Loading accommodations...</div>';

    // Build query params from filters
    const params = [];
    if (filters.country && filters.country !== 'all') params.push(`country=${encodeURIComponent(filters.country)}`);
    if (filters.type    && filters.type    !== 'all') params.push(`type=${encodeURIComponent(filters.type)}`);
    if (filters.budget)                               params.push(`max_price=${encodeURIComponent(filters.budget)}`);
    const url = `${API_BASE_URL}/accommodations.php` + (params.length ? '?' + params.join('&') : '');

    const renderCard = (acc) => `
        <div class="accommodation-card" data-country="${acc.country}" data-type="${acc.type}" data-price="${acc.price}">
            <img src="${acc.image_url || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400'}"
                 alt="${acc.title}" class="accommodation-image"
                 onerror="this.src='https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400'">
            <div class="accommodation-info">
                <h3>${acc.title}</h3>
                <p><i class="fas fa-map-marker-alt"></i> ${acc.location}, ${acc.city}, ${acc.country}</p>
                <p><i class="fas fa-bed"></i> ${acc.bedrooms} Bed &nbsp;|&nbsp; <i class="fas fa-bath"></i> ${acc.bathrooms} Bath &nbsp;|&nbsp; ${acc.type.charAt(0).toUpperCase()+acc.type.slice(1)}</p>
                <p style="color:#666;font-size:0.9rem;margin:6px 0">${acc.description.substring(0,100)}${acc.description.length>100?'...':''}</p>
                <div class="accommodation-price">$${parseFloat(acc.price).toLocaleString()}/month</div>
                <div style="display:flex;gap:10px;margin-top:12px">
                    <button class="btn-view-details" onclick="viewAccommodation(${acc.id})" style="flex:1">View Details</button>
                    <button class="btn-save-acc" onclick="toggleFavoriteAccommodation(${acc.id}, this)"
                            style="padding:8px 12px;border:1.5px solid #ddd;border-radius:8px;cursor:pointer;background:white;font-size:14px"
                            title="Save to Favorites">
                        <i class="far fa-heart"></i>
                    </button>
                </div>
            </div>
        </div>`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.success && data.data.length > 0) {
            window.allAccommodations = data.data;
            // Add "List Your Accommodation" button before the grid
            const listBtn = document.querySelector('.btn-list-accommodation');
            if (!listBtn) {
                const filtersDiv = document.querySelector('.filters');
                if (filtersDiv) {
                    const btn = document.createElement('button');
                    btn.className = 'btn-filter btn-list-accommodation';
                    btn.style.background = 'linear-gradient(135deg,#667eea,#764ba2)';
                    btn.style.color = 'white';
                    btn.style.border = 'none';
                    btn.innerHTML = '<i class="fas fa-plus"></i> List Your Place';
                    btn.onclick = () => {
                        if (!Auth.isLoggedIn()) { alert('Please login first'); openModal('loginModal'); return; }
                        openModal('addAccommodationModal');
                    };
                    filtersDiv.appendChild(btn);
                }
            }
            grid.innerHTML = data.data.map(renderCard).join('');
        } else {
            grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;color:#888"><i class="fas fa-home" style="font-size:2rem;display:block;margin-bottom:12px"></i>No accommodations found. <br><br><button onclick="openModal(\'addAccommodationModal\')" class="btn-filter" style="background:linear-gradient(135deg,#667eea,#764ba2);color:white;border:none">List the First One!</button></div>';
        }
    } catch (error) {
        console.error('Error loading accommodations:', error);
        grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;color:#e55">Failed to load accommodations. Is XAMPP running?</div>';
    }
}

// Filter Accommodations — now uses server-side filtering via API
function filterAccommodation() {
    const country = document.getElementById('filterCountry').value;
    const type    = document.getElementById('filterType').value;
    const budget  = document.getElementById('filterBudget').value;
    loadAccommodations({ country, type, budget: budget || null });
}




// Load Discussions from API
async function loadDiscussions() {
    const list = document.getElementById('discussionsList');
    if (!list) return;
    list.innerHTML = '<div style="text-align:center;padding:30px;color:#888">Loading discussions...</div>';
    try {
        const res  = await fetch(`${API_BASE_URL}/posts.php?type=discussion`);
        const data = await res.json();
        if (data.success && data.data.length > 0) {
            renderPosts(data.data, list);
        } else {
            list.innerHTML = '<div style="text-align:center;padding:30px;color:#888">No discussions yet. Be the first to post!</div>';
        }
    } catch (e) {
        console.error('loadDiscussions error:', e);
        list.innerHTML = '<div style="text-align:center;padding:30px;color:#e55">Failed to load discussions.</div>';
    }
}

// Load Questions from API
async function loadQuestions() {
    const list = document.getElementById('questionsList');
    if (!list) return;
    list.innerHTML = '<div style="text-align:center;padding:30px;color:#888">Loading questions...</div>';
    try {
        const res  = await fetch(`${API_BASE_URL}/posts.php?type=question`);
        const data = await res.json();
        if (data.success && data.data.length > 0) {
            renderPosts(data.data, list);
        } else {
            list.innerHTML = '<div style="text-align:center;padding:30px;color:#888">No questions yet. Ask one!</div>';
        }
    } catch (e) {
        console.error('loadQuestions error:', e);
        list.innerHTML = '<div style="text-align:center;padding:30px;color:#e55">Failed to load questions.</div>';
    }
}

// Render posts helper
function renderPosts(posts, container) {
    container.innerHTML = posts.map(post => {
        const ini  = post.author_name ? post.author_name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2) : '?';
        const date = new Date(post.created_at).toLocaleDateString('en-US', {month:'short', day:'numeric'});
        return `
        <div class="post-card" data-post-id="${post.id}">
            <div class="post-header">
                <div class="post-avatar">${ini}</div>
                <div class="post-info">
                    <h4>${post.author_name || 'Anonymous'}</h4>
                    <div class="post-meta">${post.country || ''} ${post.country ? '•' : ''} ${date}</div>
                </div>
            </div>
            <div class="post-content">
                <h3>${post.title}</h3>
                <p>${post.content}</p>
            </div>
            <div class="post-actions">
                <span style="cursor:pointer" onclick="handleLike(${post.id}, this)">
                    <i class="fas fa-thumbs-up"></i> <span class="like-count">${post.likes}</span> Likes
                </span>
                <span style="cursor:pointer" onclick="toggleComments(${post.id}, this)">
                    <i class="fas fa-comment"></i> ${post.comments_count} Comments
                </span>
            </div>
            <div class="comments-section" id="comments-${post.id}" style="display:none;margin-top:10px;"></div>
        </div>`;
    }).join('');
}

// Load Mentors (Still mock data as no API exists for mentors yet)
const mentors = [
    {
        id: 1,
        name: "Dr. Sarah Johnson",
        avatar: "SJ",
        expertise: "PhD in Computer Science",
        country: "USA → Canada",
        experience: "5 years helping students"
    },
    {
        id: 2,
        name: "Raj Patel",
        avatar: "RP",
        expertise: "MBA Graduate",
        country: "India → UK",
        experience: "3 years mentoring"
    }
];

function loadMentors() {
    const grid = document.getElementById('mentorsList');
    if (!grid) return;
    grid.innerHTML = mentors.map(mentor => `
        <div class="mentor-card">
            <div class="mentor-avatar">${mentor.avatar}</div>
            <h3>${mentor.name}</h3>
            <p><strong>${mentor.expertise}</strong></p>
            <p><i class="fas fa-globe"></i> ${mentor.country}</p>
            <p><i class="fas fa-star"></i> ${mentor.experience}</p>
            <button class="btn-connect">Connect</button>
        </div>
    `).join('');
}

// Load Events from Backend
async function loadEvents(filters = {}) {
    const grid = document.getElementById('eventsGrid');
    if (!grid) return;
    
    grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;color:#666">Loading events...</div>';
    
    const params = [];
    if (filters.country && filters.country !== 'all') params.push(`country=${encodeURIComponent(filters.country)}`);
    if (filters.category && filters.category !== 'all') params.push(`category=${encodeURIComponent(filters.category)}`);
    const url = `${API_BASE_URL}/events.php` + (params.length ? '?' + params.join('&') : '');

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.success && data.data.length > 0) {
            grid.innerHTML = data.data.map(event => {
                const dateObj = new Date(event.event_date);
                const day = String(dateObj.getDate()).padStart(2, '0');
                const month = dateObj.toLocaleString('default', { month: 'short' });
                
                return `
                <div class="event-card" data-country="${event.country}" data-category="${event.category}">
                    <div class="event-date">
                        <div class="day">${day}</div>
                        <div class="month">${month}</div>
                    </div>
                    <div class="event-info">
                        <h3>${event.title}</h3>
                        <div class="event-detail">
                            <i class="fas fa-map-marker-alt"></i>
                            <span>${event.location}, ${event.city}</span>
                        </div>
                        <div class="event-detail">
                            <i class="fas fa-clock"></i>
                            <span>${event.event_time}</span>
                        </div>
                        <div class="event-detail">
                            <i class="fas fa-users"></i>
                            <span>${event.attendees_count || 0} Attending</span>
                        </div>
                        <button class="btn-register" onclick="alert('Please login to register for events!')">Register for Event</button>
                    </div>
                </div>
            `}).join('');
        } else {
            grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;color:#888"><i class="fas fa-calendar-times" style="font-size:2rem;display:block;margin-bottom:12px"></i>No upcoming events found.</div>';
        }
    } catch (error) {
        console.error('Error loading events:', error);
        grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;color:#e55">Failed to load events. Is XAMPP running?</div>';
    }
}

// Filter Events (uses backend)
function filterEvents() {
    const country = document.getElementById('eventCountry').value;
    const category = document.getElementById('eventCategory').value;
    loadEvents({ country, category });
}

// Load Services from Backend
async function loadServices() {
    const grid = document.getElementById('servicesGrid');
    if (!grid) return;
    
    grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;color:#666">Loading services...</div>';
    
    try {
        const res = await fetch(`${API_BASE_URL}/services.php`);
        const data = await res.json();
        
        if (data.success && data.data.length > 0) {
            grid.innerHTML = data.data.map(service => {
                // Map category to an icon
                const catLower = (service.category || '').toLowerCase();
                let icon = 'fa-handshake';
                if (catLower.includes('transport') || catLower.includes('airport')) icon = 'fa-plane';
                if (catLower.includes('setup') || catLower.includes('sim')) icon = 'fa-sim-card';
                if (catLower.includes('translation')) icon = 'fa-language';
                if (catLower.includes('housing') || catLower.includes('furniture')) icon = 'fa-couch';
                
                return `
                <div class="service-card">
                    <i class="fas ${icon}" style="font-size:2rem;color:#667eea;margin-bottom:15px"></i>
                    <h3>${service.title}</h3>
                    <p style="font-size:0.9rem;color:#666;margin:10px 0">${service.description}</p>
                    <p style="font-size:0.8rem;color:#888"><i class="fas fa-map-marker-alt"></i> ${service.city}, ${service.country}</p>
                    <p style="font-size:0.8rem;color:#888;margin-bottom:15px"><i class="fas fa-user"></i> ${service.provider_name || 'Expert'}</p>
                    <div class="service-price">$${parseFloat(service.price).toLocaleString()}</div>
                    <button class="btn-book" onclick="alert('Please log in to book this service!')">Book Service</button>
                </div>
            `}).join('');
        } else {
            grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;color:#888"><i class="fas fa-briefcase" style="font-size:2rem;display:block;margin-bottom:12px"></i>No services available right now.</div>';
        }
    } catch (e) {
        console.error('loadServices error:', e);
        grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;color:#e55">Failed to load services. Is XAMPP running?</div>';
    }
}

// Tab Switching
function switchTab(tabName) {
    // Remove active class from all tabs and content
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

    // Add active class to clicked tab and corresponding content
    event.target.classList.add('active');
    document.getElementById(tabName).classList.add('active');
}

// Modal Functions
function openModal(modalId) {
    document.getElementById(modalId).style.display = 'block';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Close modal when clicking outside
window.onclick = function (event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
}

// handleLogin / handleSignup are implemented in auth.js — do not redeclare here.

// Like a post
async function handleLike(postId, el) {
    if (!Auth.isLoggedIn()) {
        alert('Please login to like posts');
        return;
    }
    try {
        const data = await Auth.authenticatedRequest(`${API_BASE_URL}/posts.php`, {
            method: 'PUT',
            body: JSON.stringify({ post_id: postId, action: 'like' })
        });
        if (data && data.success) {
            el.querySelector('.like-count').textContent = data.data.likes;
        }
    } catch(e) { console.error(e); }
}

// Toggle comments section
async function toggleComments(postId, el) {
    const section = document.getElementById(`comments-${postId}`);
    if (!section) return;
    if (section.style.display === 'none') {
        section.style.display = 'block';
        section.innerHTML = '<p style="color:#888;padding:8px">Loading comments...</p>';
        try {
            const res  = await fetch(`${API_BASE_URL}/comments.php?post_id=${postId}`);
            const data = await res.json();
            if (data.success) {
                const html = data.data.map(c => `
                    <div style="padding:8px;border-bottom:1px solid #eee">
                        <strong>${c.author_name}</strong>: ${c.content}
                        <small style="color:#aaa;margin-left:8px">${new Date(c.created_at).toLocaleDateString()}</small>
                    </div>`).join('');
                section.innerHTML = (html || '<p style="color:#888;padding:8px">No comments yet.</p>') + `
                    <div style="padding:8px;display:flex;gap:8px">
                        <input id="commentInput-${postId}" type="text" placeholder="Add a comment..." style="flex:1;padding:8px;border:1px solid #ddd;border-radius:6px">
                        <button onclick="submitComment(${postId})" style="padding:8px 14px;background:#667eea;color:white;border:none;border-radius:6px;cursor:pointer">Post</button>
                    </div>`;
            }
        } catch(e) { section.innerHTML = '<p style="color:#e55">Failed to load comments</p>'; }
    } else {
        section.style.display = 'none';
    }
}

// Submit comment
async function submitComment(postId) {
    if (!Auth.isLoggedIn()) { alert('Please login to comment'); return; }
    const input   = document.getElementById(`commentInput-${postId}`);
    const content = input ? input.value.trim() : '';
    if (!content) return;
    try {
        const data = await Auth.authenticatedRequest(`${API_BASE_URL}/comments.php`, {
            method: 'POST',
            body: JSON.stringify({ post_id: postId, content })
        });
        if (data && data.success) {
            input.value = '';
            toggleComments(postId, null);   // close
            toggleComments(postId, null);   // reopen to reload
        } else {
            alert(data ? data.message : 'Failed to post comment');
        }
    } catch(e) { console.error(e); }
}

// Smooth scroll offset for fixed navbar
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offset = 80; // navbar height
            const targetPosition = target.offsetTop - offset;
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// Check login status and update UI
function checkLoginStatus() {
    // This function is defined in auth.js
    if (typeof Auth !== 'undefined' && Auth.isLoggedIn()) {
        const user = Auth.getCurrentUser();
        updateUIForLoggedInUser(user);
    }
}

// Update UI for logged in user
function updateUIForLoggedInUser(user) {
    const navButtons = document.querySelector('.nav-buttons');

    if (navButtons) {
        navButtons.innerHTML = `
            <div style="display: flex; align-items: center; gap: 1rem;">
                <span style="color: white; font-weight: 500;">Hello, ${user.full_name}</span>
                <button class="btn-login" onclick="viewProfile()">Profile</button>
                <button class="btn-signup" onclick="logoutUser()">Logout</button>
            </div>
        `;
    }
}

// Logout user
function logoutUser() {
    if (typeof Auth !== 'undefined' && confirm('Are you sure you want to logout?')) {
        Auth.logout();
    }
}

// Navigate to dashboard/profile
function viewProfile() {
    window.location.href = "dashboard.html";
}

//
function updateNavbar() {
    const navButtons = document.getElementById("navButtons");

    if (Auth.isLoggedIn()) {
        const user = Auth.getCurrentUser();

        navButtons.innerHTML = `
            <a href="dashboard.html">
                <button class="btn-login">Dashboard</button>
            </a>
            <button class="btn-signup" onclick="logoutUser()">Logout</button>

            <div class="hamburger" id="hamburger">
                <span></span>
                <span></span>
                <span></span>
            </div>
        `;
    }
}

function logoutUser() {
    Auth.logout();
}

// Run when page loads
document.addEventListener("DOMContentLoaded", function () {
    updateNavbar();
});