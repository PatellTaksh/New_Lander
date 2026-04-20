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
        <div id="acco