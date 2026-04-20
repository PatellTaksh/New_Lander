// Event Details and Registration Functions

// View Event Details (called from event cards)
async function viewEventDetails(eventId) {
    try {
        // Add user_id to check if registered
        let url = `${API_BASE_URL}/events.php?id=${eventId}`;
        
        if (Auth.isLoggedIn()) {
            const user = Auth.getCurrentUser();
            url += `&user_id=${user.id}`;
        }
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.success) {
            showEventModal(data.data);
        } else {
            alert('Failed to load event details');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error loading event details');
    }
}

// Show Event Details Modal
function showEventModal(event) {
    const eventDate = new Date(event.event_date);
    const formattedDate = eventDate.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    
    const categoryColors = {
        'networking': '#2196F3',
        'cultural': '#FF9800',
        'orientation': '#4CAF50',
        'workshop': '#9C27B0'
    };
    
    const categoryColor = categoryColors[event.category] || '#667eea';
    
    // Check if event is full
    const isFull = event.max_attendees && event.attendees_count >= event.max_attendees;
    const spotsLeft = event.max_attendees ? event.max_attendees - event.attendees_count : null;
    
    const modalHTML = `
        <div id="eventModal" class="modal" style="display: block;">
            <div class="modal-content" style="max-width: 700px;">
                <span class="close" onclick="closeEventModal()">&times;</span>
                
                <div class="event-details">
                    <div style="background: linear-gradient(135deg, ${categoryColor}, ${categoryColor}dd); color: white; padding: 30px; border-radius: 10px; margin-bottom: 20px;">
                        <div style="display: inline-block; background: rgba(255,255,255,0.2); padding: 5px 15px; border-radius: 20px; margin-bottom: 10px; text-transform: uppercase; font-size: 12px; font-weight: 600;">
                            ${event.category}
                        </div>
                        <h2 style="margin: 10px 0; font-size: 28px;">${event.title}</h2>
                        <p style="opacity: 0.9; margin-top: 10px;">Organized by ${event.organizer_name}</p>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin: 25px 0;">
                        <div style="background: #f9f9f9; padding: 15px; border-radius: 10px;">
                            <i class="fas fa-calendar" style="color: ${categoryColor}; margin-right: 10px;"></i>
                            <strong>Date</strong><br>
                            <span style="color: #666; margin-left: 28px;">${formattedDate}</span>
                        </div>
                        
                        <div style="background: #f9f9f9; padding: 15px; border-radius: 10px;">
                            <i class="fas fa-clock" style="color: ${categoryColor}; margin-right: 10px;"></i>
                            <strong>Time</strong><br>
                            <span style="color: #666; margin-left: 28px;">${event.event_time}</span>
                        </div>
                        
                        <div style="background: #f9f9f9; padding: 15px; border-radius: 10px;">
                            <i class="fas fa-map-marker-alt" style="color: ${categoryColor}; margin-right: 10px;"></i>
                            <strong>Location</strong><br>
                            <span style="color: #666; margin-left: 28px;">${event.location}</span>
                        </div>
                        
                        <div style="background: #f9f9f9; padding: 15px; border-radius: 10px;">
                            <i class="fas fa-globe" style="color: ${categoryColor}; margin-right: 10px;"></i>
                            <strong>City</strong><br>
                            <span style="color: #666; margin-left: 28px;">${event.city}, ${event.country}</span>
                        </div>
                    </div>
                    
                    <div style="margin: 25px 0;">
                        <h3 style="margin-bottom: 10px; color: #333;">About This Event</h3>
                        <p style="color: #666; line-height: 1.8;">${event.description}</p>
                    </div>
                    
                    <div style="background: #f0f7ff; padding: 20px; border-radius: 10px; margin: 25px 0;">
                        <div style="display: flex; align-items: center; gap: 15px;">
                            <i class="fas fa-users" style="font-size: 32px; color: ${categoryColor};"></i>
                            <div>
                                <strong style="font-size: 24px; color: #333;">${event.attendees_count}</strong>
                                <span style="color: #666;"> ${event.attendees_count === 1 ? 'person is' : 'people are'} attending</span>
                                ${spotsLeft !== null ? `<br><span style="color: #666; font-size: 14px;">${spotsLeft} spots left</span>` : ''}
                            </div>
                        </div>
                    </div>
                    
                    ${event.organizer_email ? `
                    <div style="margin: 25px 0;">
                        <h3 style="margin-bottom: 10px; color: #333;">Contact Organizer</h3>
                        <p style="color: #666;">
                            <i class="fas fa-envelope" style="color: ${categoryColor}; margin-right: 10px;"></i>
                            ${event.organizer_email}
                        </p>
                    </div>
                    ` : ''}
                    
                    <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #e0e0e0;">
                        ${event.is_registered ? `
                            <div style="text-align: center;">
                                <p style="color: #4CAF50; font-weight: 600; margin-bottom: 15px;">
                                    <i class="fas fa-check-circle"></i> You are registered for this event
                                </p>
                                <button onclick="cancelEventRegistration(${event.id})" 
                                        style="padding: 12px 30px; background: #f44336; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
                                    Cancel Registration
                                </button>
                            </div>
                        ` : `
                            <button onclick="registerForEvent(${event.id}, '${event.title.replace(/'/g, "\\'")}', ${isFull})" 
                                    ${isFull ? 'disabled' : ''}
                                    style="width: 100%; padding: 15px; background: ${isFull ? '#ccc' : `linear-gradient(135deg, ${categoryColor}, ${categoryColor}dd)`}; color: white; border: none; border-radius: 8px; cursor: ${isFull ? 'not-allowed' : 'pointer'}; font-weight: 600; font-size: 16px;">
                                ${isFull ? 'Event Full' : 'Register for Event'}
                            </button>
                        `}
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// Register for Event
async function registerForEvent(eventId, eventTitle, isFull) {
    if (isFull) {
        alert('Sorry, this event is full!');
        return;
    }
    
    // Check if user is logged in
    if (!Auth.isLoggedIn()) {
        alert('Please login to register for events');
        closeEventModal();
        openModal('loginModal');
        return;
    }
    
    if (!confirm(`Do you want to register for:\n\n${eventTitle}\n\nYou will receive a confirmation email.`)) {
        return;
    }
    
    try {
        const data = await Auth.authenticatedRequest(`${API_BASE_URL}/event_registration.php`, {
            method: 'POST',
            body: JSON.stringify({
                event_id: eventId
            })
        });
        
        if (data.success) {
            closeEventModal();
            alert(`Registration Successful!\n\n${data.message}`);
            
            // Reload events to update count
            loadEvents();
        } else {
            alert('Registration failed: ' + data.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error processing registration');
    }
}

// Cancel Event Registration
async function cancelEventRegistration(eventId) {
    if (!confirm('Are you sure you want to cancel your registration?')) {
        return;
    }
    
    try {
        const data = await Auth.authenticatedRequest(`${API_BASE_URL}/event_registration.php?event_id=${eventId}`, {
            method: 'DELETE'
        });
        
        if (data.success) {
            closeEventModal();
            alert('Registration cancelled successfully');
            
            // Reload events to update count
            loadEvents();
        } else {
            alert('Failed to cancel registration: ' + data.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error cancelling registration');
    }
}

// Close Event Modal
function closeEventModal() {
    const modal = document.getElementById('eventModal');
    if (modal) {
        modal.remove();
    }
}

// Update the existing loadEvents function to add click handlers
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
                <button class="btn-register" onclick="viewEventDetails(${event.id})">View Details & Register</button>
            </div>
        </div>
    `).join('');
}