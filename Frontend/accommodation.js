// Accommodation Details and Booking Functions

// View Accommodation Details
async function viewAccommodation(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/accommodations.php?id=${id}`);
        const data = await response.json();
        
        if (data.success) {
            showAccommodationModal(data.data);
        } else {
            alert('Failed to load accommodation details');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error loading accommodation details');
    }
}

// Show Accommodation Details Modal
function showAccommodationModal(accommodation) {
    const amenities = accommodation.amenities ? accommodation.amenities.join(', ') : 'Not specified';
    
    const modalHTML = `
        <div id="accommodationModal" class="modal" style="display: block;">
            <div class="modal-content" style="max-width: 800px;">
                <span class="close" onclick="closeAccommodationModal()">&times;</span>
                
                <div class="accommodation-details">
                    <img src="${accommodation.image_url || 'https://via.placeholder.com/800x400'}" 
                         alt="${accommodation.title}" 
                         style="width: 100%; height: 400px; object-fit: cover; border-radius: 10px; margin-bottom: 20px;">
                    
                    <h2 style="color: #667eea; margin-bottom: 10px;">${accommodation.title}</h2>
                    
                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 15px; color: #666;">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${accommodation.location}, ${accommodation.city}, ${accommodation.country}</span>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin: 20px 0; padding: 20px; background: #f9f9f9; border-radius: 10px;">
                        <div>
                            <strong>Type:</strong><br>
                            ${accommodation.type.charAt(0).toUpperCase() + accommodation.type.slice(1)}
                        </div>
                        <div>
                            <strong>Bedrooms:</strong><br>
                            <i class="fas fa-bed"></i> ${accommodation.bedrooms}
                        </div>
                        <div>
                            <strong>Bathrooms:</strong><br>
                            <i class="fas fa-bath"></i> ${accommodation.bathrooms}
                        </div>
                    </div>
                    
                    <div style="margin: 20px 0;">
                        <h3 style="margin-bottom: 10px;">Description</h3>
                        <p style="color: #666; line-height: 1.6;">${accommodation.description}</p>
                    </div>
                    
                    <div style="margin: 20px 0;">
                        <h3 style="margin-bottom: 10px;">Amenities</h3>
                        <p style="color: #666;">${amenities}</p>
                    </div>
                    
                    <div style="margin: 20px 0; padding: 20px; background: #f0f7ff; border-radius: 10px;">
                        <h3 style="margin-bottom: 10px;">Owner Information</h3>
                        <p><strong>Name:</strong> ${accommodation.owner_name}</p>
                        <p><strong>Email:</strong> ${accommodation.owner_email}</p>
                        ${accommodation.owner_phone ? `<p><strong>Phone:</strong> ${accommodation.owner_phone}</p>` : ''}
                    </div>
                    
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 30px; padding-top: 20px; border-top: 2px solid #e0e0e0;">
                        <div>
                            <h2 style="color: #667eea; margin: 0;">$${accommodation.price}/month</h2>
                        </div>
                        <button class="btn-primary" onclick="openBookingForm(${accommodation.id}, ${accommodation.price}, '${accommodation.title}')" style="padding: 15px 40px; background: linear-gradient(135deg, #667eea, #764ba2); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 16px;">
                            Book Now
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// Close Accommodation Modal
function closeAccommodationModal() {
    const modal = document.getElementById('accommodationModal');
    if (modal) {
        modal.remove();
    }
}

// Open Booking Form
function openBookingForm(accommodationId, price, title) {
    // Check if user is logged in
    if (!Auth.isLoggedIn()) {
        alert('Please login to book accommodation');
        closeAccommodationModal();
        openModal('loginModal');
        return;
    }
    
    // Close accommodation modal
    closeAccommodationModal();
    
    // Create booking form modal
    const bookingFormHTML = `
        <div id="bookingModal" class="modal" style="display: block;">
            <div class="modal-content" style="max-width: 600px;">
                <span class="close" onclick="closeBookingModal()">&times;</span>
                
                <h2 style="color: #667eea; margin-bottom: 20px;">Book Accommodation</h2>
                <h3 style="margin-bottom: 20px;">${title}</h3>
                
                <form id="bookingForm" onsubmit="submitBooking(event, ${accommodationId}, ${price})">
                    <div class="form-group">
                        <label>Move-in Date</label>
                        <input type="date" id="moveInDate" required min="${new Date().toISOString().split('T')[0]}">
                    </div>
                    
                    <div class="form-group">
                        <label>Duration (Months)</label>
                        <select id="durationMonths" required onchange="calculateTotal(${price})">
                            <option value="">Select Duration</option>
                            <option value="1">1 Month</option>
                            <option value="3">3 Months</option>
                            <option value="6">6 Months</option>
                            <option value="12">12 Months</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label>Payment Method</label>
                        <select id="paymentMethod" required>
                            <option value="">Select Payment Method</option>
                            <option value="credit_card">Credit Card</option>
                            <option value="debit_card">Debit Card</option>
                            <option value="paypal">PayPal</option>
                            <option value="bank_transfer">Bank Transfer</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label>Special Requests (Optional)</label>
                        <textarea id="specialRequests" rows="3" style="width: 100%; padding: 10px; border: 2px solid #e0e0e0; border-radius: 8px;"></textarea>
                    </div>
                    
                    <div style="background: #f9f9f9; padding: 20px; border-radius: 10px; margin: 20px 0;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                            <span>Monthly Rent:</span>
                            <strong>$${price}</strong>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                            <span>Duration:</span>
                            <strong id="displayDuration">-</strong>
                        </div>
                        <div style="display: flex; justify-content: space-between; padding-top: 10px; border-top: 2px solid #e0e0e0;">
                            <span style="font-size: 18px; font-weight: bold;">Total Amount:</span>
                            <strong style="font-size: 24px; color: #667eea;" id="totalAmount">$0</strong>
                        </div>
                    </div>
                    
                    <button type="submit" class="btn-submit" style="background: linear-gradient(135deg, #667eea, #764ba2);">
                        Confirm Booking
                    </button>
                </form>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', bookingFormHTML);
}

// Calculate Total Amount
function calculateTotal(monthlyPrice) {
    const duration = document.getElementById('durationMonths').value;
    const total = monthlyPrice * parseInt(duration || 0);
    
    document.getElementById('displayDuration').textContent = duration ? `${duration} month(s)` : '-';
    document.getElementById('totalAmount').textContent = `$${total.toFixed(2)}`;
}

// Submit Booking
async function submitBooking(event, accommodationId, price) {
    event.preventDefault();
    
    const moveInDate = document.getElementById('moveInDate').value;
    const durationMonths = document.getElementById('durationMonths').value;
    const paymentMethod = document.getElementById('paymentMethod').value;
    const specialRequests = document.getElementById('specialRequests').value;
    
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Processing...';
    submitBtn.disabled = true;
    
    try {
        const data = await Auth.authenticatedRequest(`${API_BASE_URL}/bookings.php`, {
            method: 'POST',
            body: JSON.stringify({
                accommodation_id: accommodationId,
                move_in_date: moveInDate,
                duration_months: parseInt(durationMonths),
                payment_method: paymentMethod,
                special_requests: specialRequests
            })
        });
        
        if (data.success) {
            closeBookingModal();
            alert(`Booking Successful!\n\nTotal Amount: $${data.data.total_amount}\nMonthly Rent: $${data.data.monthly_rent}\nDuration: ${data.data.duration_months} month(s)\n\n${data.message}`);
        } else {
            alert('Booking failed: ' + data.message);
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error processing booking');
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

// Close Booking Modal
function closeBookingModal() {
    const modal = document.getElementById('bookingModal');
    if (modal) {
        modal.remove();
    }
}

// Close modals when clicking outside
window.addEventListener('click', function(event) {
    if (event.target.classList.contains('modal')) {
        closeAccommodationModal();
        closeBookingModal();
    }
});