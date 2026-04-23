// ============================================================
// community.js — Community posts + accommodation listing
// ============================================================

// ============================================================
// CREATE POST (Discussion or Question)
// ============================================================
async function createPost(e, postType) {
    e.preventDefault();

    if (!Auth.isLoggedIn()) {
        alert('Please login to create a post');
        openModal('loginModal');
        return;
    }

    const isDiscussion = postType === 'discussion';
    const title   = document.getElementById(isDiscussion ? 'postTitle'    : 'questionTitle').value.trim();
    const content = document.getElementById(isDiscussion ? 'postContent'  : 'questionContent').value.trim();
    const country = document.getElementById(isDiscussion ? 'postCountry'  : 'questionCountry').value;
    const btnId   = isDiscussion ? 'postSubmitBtn' : 'questionSubmitBtn';
    const btn     = document.getElementById(btnId);

    if (!title || !content) {
        alert('Title and content are required');
        return;
    }

    const originalText = btn.textContent;
    btn.textContent    = 'Posting...';
    btn.disabled       = true;

    try {
        const result = await Auth.authenticatedRequest(`${API_BASE_URL}/posts.php`, {
            method: 'POST',
            body: JSON.stringify({ title, content, post_type: postType, country: country || null })
        });

        if (result && result.success) {
            closeModal(isDiscussion ? 'newPostModal' : 'newQuestionModal');
            // Reset form
            document.getElementById(isDiscussion ? 'newPostForm' : 'newQuestionForm').reset();

            // Reload relevant tab
            if (isDiscussion) {
                loadDiscussions();
                switchTab('discussions');
            } else {
                loadQuestions();
                switchTab('questions');
            }

            showToast('✅ ' + (isDiscussion ? 'Discussion' : 'Question') + ' posted successfully!');
        } else {
            alert(result ? result.message : 'Failed to create post');
        }
    } catch (err) {
        console.error('createPost error:', err);
        alert('Network error. Please try again.');
    } finally {
        btn.textContent = originalText;
        btn.disabled    = false;
    }
}


// ============================================================
// SUBMIT ADD ACCOMMODATION (from modal form)
// ============================================================
async function submitAddAccommodation(e) {
    e.preventDefault();

    if (!Auth.isLoggedIn()) {
        alert('Please login to list accommodation');
        closeModal('addAccommodationModal');
        openModal('loginModal');
        return;
    }

    const btn = document.getElementById('accSubmitBtn');
    const originalText = btn.textContent;
    btn.textContent = 'Submitting...';
    btn.disabled    = true;

    const payload = {
        title:       document.getElementById('accTitle').value.trim(),
        description: document.getElementById('accDesc').value.trim(),
        country:     document.getElementById('accCountry').value,
        city:        document.getElementById('accCity').value.trim(),
        location:    document.getElementById('accLocation').value.trim(),
        type:        document.getElementById('accType').value,
        price:       parseFloat(document.getElementById('accPrice').value),
        bedrooms:    parseInt(document.getElementById('accBedrooms').value),
        bathrooms:   parseInt(document.getElementById('accBathrooms').value),
        image_url:   document.getElementById('accImageUrl').value.trim() || null
    };

    try {
        const result = await Auth.authenticatedRequest(`${API_BASE_URL}/accommodations.php`, {
            method: 'POST',
            body: JSON.stringify(payload)
        });

        if (result && result.success) {
            closeModal('addAccommodationModal');
            document.getElementById('addAccommodationForm').reset();
            showToast('✅ Accommodation listed successfully!');
            loadAccommodations(); // Refresh the grid
        } else {
            alert(result ? result.message : 'Failed to submit listing');
        }
    } catch (err) {
        console.error('submitAddAccommodation error:', err);
        alert('Network error. Please try again.');
    } finally {
        btn.textContent = originalText;
        btn.disabled    = false;
    }
}


// ============================================================
// SAVE / UNSAVE ACCOMMODATION (heart icon)
// ============================================================
async function toggleFavoriteAccommodation(accId, btn) {
    if (!Auth.isLoggedIn()) {
        alert('Please login to save accommodations');
        openModal('loginModal');
        return;
    }

    const isSaved = btn.classList.contains('saved');

    try {
        if (isSaved) {
            const result = await Auth.authenticatedRequest(
                `${API_BASE_URL}/favorites.php?item_type=accommodation&item_id=${accId}`,
                { method: 'DELETE' }
            );
            if (result && result.success) {
                btn.classList.remove('saved');
                btn.innerHTML = '<i class="far fa-heart"></i>';
                showToast('Removed from saved');
            }
        } else {
            const result = await Auth.authenticatedRequest(`${API_BASE_URL}/favorites.php`, {
                method: 'POST',
                body: JSON.stringify({ item_type: 'accommodation', item_id: accId })
            });
            if (result && result.success) {
                btn.classList.add('saved');
                btn.innerHTML = '<i class="fas fa-heart" style="color:#e55"></i>';
                showToast('✅ Saved to favorites!');
            } else if (result && result.message === 'Already in favorites') {
                btn.classList.add('saved');
                btn.innerHTML = '<i class="fas fa-heart" style="color:#e55"></i>';
            }
        }
    } catch (err) {
        console.error('toggleFavorite error:', err);
    }
}


// ============================================================
// TOAST NOTIFICATION (simple, no dependency)
// ============================================================
function showToast(msg) {
    // Re-use dashboard toast if available, else create a simple one
    const existing = document.getElementById('toast');
    if (existing) {
        const msgEl = document.getElementById('toastMsg');
        if (msgEl) msgEl.textContent = msg;
        existing.classList.add('show');
        setTimeout(() => existing.classList.remove('show'), 3000);
        return;
    }

    // Fallback: floating toast
    let toast = document.getElementById('communityToast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'communityToast';
        toast.style.cssText = `
            position:fixed;bottom:30px;right:30px;background:#333;color:#fff;
            padding:12px 20px;border-radius:10px;font-size:14px;z-index:9999;
            box-shadow:0 4px 20px rgba(0,0,0,0.3);transition:opacity 0.3s;opacity:0;
        `;
        document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.style.opacity = '1';
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => { toast.style.opacity = '0'; }, 3000);
}
