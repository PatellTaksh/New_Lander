// Sample Data
const accommodations = [
    {
        id: 1,
        title: "Modern Studio Apartment",
        location: "Manhattan, New York",
        country: "usa",
        type: "apartment",
        price: 1200,
        image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400",
        description: "Fully furnished studio near Columbia University",
        bedrooms: 1,
        bathrooms: 1
    },
    {
        id: 2,
        title: "Shared Room in Student Hostel",
        location: "London, UK",
        country: "uk",
        type: "hostel",
        price: 450,
        image: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400",
        description: "Clean and safe student accommodation",
        bedrooms: 1,
        bathrooms: 1
    },
    {
        id: 3,
        title: "Cozy PG Near University",
        location: "Toronto, Canada",
        country: "canada",
        type: "pg",
        price: 600,
        image: "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=400",
        description: "Paying guest accommodation with meals included",
        bedrooms: 1,
        bathrooms: 1
    },
    {
        id: 4,
        title: "2 Bedroom Apartment",
        location: "Sydney, Australia",
        country: "australia",
        type: "apartment",
        price: 1500,
        image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400",
        description: "Spacious apartment near UNSW",
        bedrooms: 2,
        bathrooms: 1
    },
    {
        id: 5,
        title: "Private Room in Shared House",
        location: "Boston, USA",
        country: "usa",
        type: "shared",
        price: 800,
        image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400",
        description: "Private room with shared kitchen and living area",
        bedrooms: 1,
        bathrooms: 1
    },
    {
        id: 6,
        title: "Student Dormitory",
        location: "Cambridge, UK",
        country: "uk",
        type: "hostel",
        price: 550,
        image: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=400",
        description: "University managed dormitory",
        bedrooms: 1,
        bathrooms: 1
    }
];

const discussions = [
    {
        id: 1,
        author: "Priya Sharma",
        avatar: "PS",
        title: "Tips for finding accommodation in New York",
        content: "I recently moved to NYC for my masters. Here are some tips that helped me find a great place...",
        country: "USA",
        date: "2 days ago",
        likes: 24,
        comments: 8
    },
    {
        id: 2,
        author: "Chen Wei",
        avatar: "CW",
        title: "Best areas to live in London as a student",
        content: "After living in London for 2 years, I can recommend these neighborhoods for students...",
        country: "UK",
        date: "5 days ago",
        likes: 18,
        comments: 12
    },
    {
        id: 3,
        author: "Ahmed Hassan",
        avatar: "AH",
        title: "Public transport guide for Toronto",
        content: "Getting around Toronto is easy once you understand the TTC system. Here's what you need to know...",
        country: "Canada",
        date: "1 week ago",
        likes: 31,
        comments: 5
    }
];

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
    },
    {
        id: 3,
        name: "Maria Garcia",
        avatar: "MG",
        expertise: "Medical Student",
        country: "Spain → Australia",
        experience: "2 years experience"
    },
    {
        id: 4,
        name: "John Chen",
        avatar: "JC",
        expertise: "Engineering Graduate",
        country: "China → USA",
        experience: "4 years helping students"
    }
];

const events = [
    {
        id: 1,
        title: "International Student Welcome Mixer",
        date: "2026-02-15",
        day: "15",
        month: "Feb",
        location: "New York University",
        city: "New York",
        country: "usa",
        category: "networking",
        time: "6:00 PM - 9:00 PM",
        attendees: 45
    },
    {
        id: 2,
        title: "Career Fair for International Students",
        date: "2026-02-20",
        day: "20",
        month: "Feb",
        location: "Imperial College",
        city: "London",
        country: "uk",
        category: "networking",
        time: "10:00 AM - 4:00 PM",
        attendees: 120
    },
    {
        id: 3,
        title: "Diwali Celebration",
        date: "2026-02-25",
        day: "25",
        month: "Feb",
        location: "Community Center",
        city: "Toronto",
        country: "canada",
        category: "cultural",
        time: "5:00 PM - 10:00 PM",
        attendees: 80
    },
    {
        id: 4,
        title: "Student Orientation Workshop",
        date: "2026-03-01",
        day: "01",
        month: "Mar",
        location: "University of Sydney",
        city: "Sydney",
        country: "australia",
        category: "orientation",
        time: "2:00 PM - 5:00 PM",
        attendees: 60
    }
];

const services = [
    {
        id: 1,
        title: "Airport Pickup Service",
        icon: "fa-plane",
        price: "$50",
        description: "Safe and reliable airport pickup for new arrivals"
    },
    {
        id: 2,
        title: "SIM Card Assistance",
        icon: "fa-sim-card",
        price: "$15",
        description: "Help setting up local phone and internet"
    },
    {
        id: 3,
        title: "Document Translation",
        icon: "fa-language",
        price: "$30/page",
        description: "Professional translation services"
    },
    {
        id: 4,
        title: "Local Guide Service",
        icon: "fa-map-marked-alt",
        price: "$40",
        description: "Personal guide to show you around the city"
    },
    {
        id: 5,
        title: "Furniture Rental",
        icon: "fa-couch",
        price: "$100/month",
        description: "Rent furniture for your new place"
    },
    {
        id: 6,
        title: "Language Tutoring",
        icon: "fa-book-reader",
        price: "$25/hour",
        description: "One-on-one language lessons"
    }
];

// Initialize page
document.addEventListener('DOMContentLoaded', function () {
    loadAccommodations();
    loadDiscussions();
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
async function loadAccommodations() {
    const grid = document.getElementById('accommodationGrid');

    try {
        // Show loading state
        grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #666;">Loading accommodations...</div>';

        const response = await fetch(`${API_BASE_URL}/accommodations.php`);
        const data = await response.json();

        if (data.success && data.data.length > 0) {
            // Store accommodations globally for filtering
            window.allAccommodations = data.data;

            grid.innerHTML = data.data.map(acc => `
                <div class="accommodation-card" data-country="${acc.country}" data-type="${acc.type}" data-price="${acc.price}">
                    <img src="${acc.image_url || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400'}" alt="${acc.title}" class="accommodation-image">
                    <div class="accommodation-info">
                        <h3>${acc.title}</h3>
                        <p><i class="fas fa-map-marker-alt"></i> ${acc.location}, ${acc.city}</p>
                        <p><i class="fas fa-bed"></i> ${acc.bedrooms} Bedroom | <i class="fas fa-bath"></i> ${acc.bathrooms} Bathroom</p>
                        <p>${acc.description}</p>
                        <div class="accommodation-price">${acc.price}/month</div>
                        <button class="btn-view-details" onclick="viewAccommodation(${acc.id})">View Details</button>
                    </div>
                </div>
            `).join('');
        } else {
            // Show sample accommodations if no data in database
            grid.innerHTML = accommodations.map(acc => `
                <div class="accommodation-card" data-country="${acc.country}" data-type="${acc.type}" data-price="${acc.price}">
                    <img src="${acc.image}" alt="${acc.title}" class="accommodation-image">
                    <div class="accommodation-info">
                        <h3>${acc.title}</h3>
                        <p><i class="fas fa-map-marker-alt"></i> ${acc.location}</p>
                        <p><i class="fas fa-bed"></i> ${acc.bedrooms} Bedroom | <i class="fas fa-bath"></i> ${acc.bathrooms} Bathroom</p>
                        <p>${acc.description}</p>
                        <div class="accommodation-price">${acc.price}/month</div>
                        <button class="btn-view-details" onclick="viewAccommodation(${acc.id})">View Details</button>
                    </div>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading accommodations:', error);
        // Fallback to sample data
        grid.innerHTML = accommodations.map(acc => `
            <div class="accommodation-card" data-country="${acc.country}" data-type="${acc.type}" data-price="${acc.price}">
                <img src="${acc.image}" alt="${acc.title}" class="accommodation-image">
                <div class="accommodation-info">
                    <h3>${acc.title}</h3>
                    <p><i class="fas fa-map-marker-alt"></i> ${acc.location}</p>
                    <p><i class="fas fa-bed"></i> ${acc.bedrooms} Bedroom | <i class="fas fa-bath"></i> ${acc.bathrooms} Bathroom</p>
                    <p>${acc.description}</p>
                    <div class="accommodation-price">${acc.price}/month</div>
                    <button class="btn-view-details" onclick="viewAccommodation(${acc.id})">View Details</button>
                </div>
            </div>
        `).join('');
    }
}

// Filter Accommodations
function filterAccommodation() {
    const country = document.getElementById('filterCountry').value;
    const type = document.getElementById('filterType').value;
    const budget = document.getElementById('filterBudget').value;

    const cards = document.querySelectorAll('.accommodation-card');

    cards.forEach(card => {
        const cardCountry = card.dataset.country;
        const cardType = card.dataset.type;
        const cardPrice = parseInt(card.dataset.price);

        let show = true;

        if (country !== 'all' && cardCountry !== country) show = false;
        if (type !== 'all' && cardType !== type) show = false;
        if (budget && cardPrice > parseInt(budget)) show = false;

        card.style.display = show ? 'block' : 'none';
    });
}

// Load Discussions
function loadDiscussions() {
    const list = document.getElementById('discussionsList');
    list.innerHTML = discussions.map(post => `
        <div class="post-card">
            <div class="post-header">
                <div class="post-avatar">${post.avatar}</div>
                <div class="post-info">
                    <h4>${post.author}</h4>
                    <div class="post-meta">${post.country} • ${post.date}</div>
                </div>
            </div>
            <div class="post-content">
                <h3>${post.title}</h3>
                <p>${post.content}</p>
            </div>
            <div class="post-actions">
                <span><i class="fas fa-thumbs-up"></i> ${post.likes} Likes</span>
                <span><i class="fas fa-comment"></i> ${post.comments} Comments</span>
                <span><i class="fas fa-share"></i> Share</span>
            </div>
        </div>
    `).join('');
}

// Load Mentors
function loadMentors() {
    const grid = document.getElementById('mentorsList');
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

// Load Events
function loadEvents() {
    const grid = document.getElementById('eventsGrid');
    grid.innerHTML = events.map(event => `
        <div class="event-card" data-country="${event.country}" data-category="${event.category}">
            <div class="event-date">
                <div class="day">${event.day}</div>
                <div class="month">${event.month}</div>
            </div>
            <div class="event-info">
                <h3>${event.title}</h3>
                <div class="event-detail">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>${event.location}, ${event.city}</span>
                </div>
                <div class="event-detail">
                    <i class="fas fa-clock"></i>
                    <span>${event.time}</span>
                </div>
                <div class="event-detail">
                    <i class="fas fa-users"></i>
                    <span>${event.attendees} Attending</span>
                </div>
                <button class="btn-register">Register for Event</button>
            </div>
        </div>
    `).join('');
}

// Filter Events
function filterEvents() {
    const country = document.getElementById('eventCountry').value;
    const category = document.getElementById('eventCategory').value;

    const cards = document.querySelectorAll('.event-card');

    cards.forEach(card => {
        const cardCountry = card.dataset.country;
        const cardCategory = card.dataset.category;

        let show = true;

        if (country !== 'all' && cardCountry !== country) show = false;
        if (category !== 'all' && cardCategory !== category) show = false;

        card.style.display = show ? 'block' : 'none';
    });
}

// Load Services
function loadServices() {
    const grid = document.getElementById('servicesGrid');
    grid.innerHTML = services.map(service => `
        <div class="service-card">
            <i class="fas ${service.icon}"></i>
            <h3>${service.title}</h3>
            <p>${service.description}</p>
            <div class="service-price">${service.price}</div>
            <button class="btn-book">Book Service</button>
        </div>
    `).join('');
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

// Handle Login
function handleLogin(e) {
    e.preventDefault();
    alert('Login functionality would be connected to backend authentication system');
    closeModal('loginModal');
}

// Handle Signup
function handleSignup(e) {
    e.preventDefault();
    alert('Signup functionality would be connected to backend user registration system');
    closeModal('signupModal');
}

// View Accommodation Details
function viewAccommodation(id) {
    const acc = accommodations.find(a => a.id === id);
    alert(`View details for: ${acc.title}\n\nThis would open a detailed page with:\n- More photos\n- Full description\n- Amenities list\n- Contact landlord option\n- Map location\n- Reviews`);
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

// View user profile
function viewProfile() {
    if (typeof Auth !== 'undefined') {
        Auth.getProfile().then(result => {
            if (result.success) {
                alert(`Profile Info:\n\nName: ${result.data.full_name}\nEmail: ${result.data.email}\nFrom: ${result.data.current_country}\nTo: ${result.data.destination_country}`);
            }
        });
    }
}

// Logout user
function logoutUser() {
    if (typeof Auth !== 'undefined' && confirm('Are you sure you want to logout?')) {
        Auth.logout();
    }
}

// Profile
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