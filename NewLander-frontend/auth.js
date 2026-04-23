// ================================
// API Base URL — points to XAMPP backend
// ================================
const API_BASE_URL = "../NewLander-backend";

// ================================
// AUTH OBJECT
// ================================
const Auth = {

    // ================================
    // SIGNUP
    // ================================
    async signup(formData) {
        try {
            const response = await fetch(`${API_BASE_URL}/signup.php`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    full_name: formData.fullName,
                    email: formData.email,
                    password: formData.password,
                    current_country: formData.currentCountry,
                    destination_country: formData.destinationCountry
                })
            });

            const data = await response.json();

            if (data.success) {
                localStorage.setItem("token", data.data.token);
                localStorage.setItem("user", JSON.stringify(data.data.user));
                return { success: true, data: data.data };
            } else {
                return { success: false, message: data.message };
            }

        } catch (error) {
            console.error("Signup error:", error);
            return { success: false, message: "Network error. Please try again." };
        }
    },

    // ================================
    // LOGIN
    // ================================
    async login(email, password) {
        try {
            const response = await fetch(`${API_BASE_URL}/login.php`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email: email,
                    password: password
                })
            });

            const data = await response.json();

            if (data.success) {
                localStorage.setItem("token", data.data.token);
                localStorage.setItem("user", JSON.stringify(data.data.user));
                return { success: true, data: data.data };
            } else {
                return { success: false, message: data.message };
            }

        } catch (error) {
            console.error("Login error:", error);
            return { success: false, message: "Network error. Please check backend." };
        }
    },

    // ================================
    // LOGOUT
    // ================================
    logout() {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "login.html"; // Redirect to login
    },

    // ================================
    // CHECK LOGIN
    // ================================
    isLoggedIn() {
        return localStorage.getItem("token") !== null;
    },

    // ================================
    // GET CURRENT USER
    // ================================
    getCurrentUser() {
        const user = localStorage.getItem("user");
        return user ? JSON.parse(user) : null;
    },

    // ================================
    // GET TOKEN
    // ================================
    getToken() {
        return localStorage.getItem("token");
    },

    // ================================
    // AUTH REQUEST (PROTECTED APIs)
    // ================================
    async authenticatedRequest(url, options = {}) {
        const token = this.getToken();

        if (!token) {
            window.location.href = "login.html";
            return;
        }

        const headers = {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
            ...options.headers
        };

        try {
            const response = await fetch(url, {
                ...options,
                headers
            });

            const data = await response.json();

            // Auto logout if token invalid/expired
            if (response.status === 401 || (data && data.message && data.message.toLowerCase().includes("expired"))) {
                this.logout();
            }

            return data;

        } catch (error) {
            console.error("API error:", error);
            throw error;
        }
    },

    // ================================
    // GET PROFILE
    // ================================
    async getProfile() {
        return this.authenticatedRequest(`${API_BASE_URL}/profile.php`);
    },

    // ================================
    // UPDATE PROFILE
    // ================================
    async updateProfile(profileData) {
        const result = await this.authenticatedRequest(`${API_BASE_URL}/profile.php`, {
            method: "PUT",
            body: JSON.stringify(profileData)
        });
        
        if (result && result.success) {
            const stored = this.getCurrentUser() || {};
            const updated = Object.assign(stored, result.data);
            localStorage.setItem("user", JSON.stringify(updated));
        }
        return result;
    },

    // ================================
    // CHANGE PASSWORD
    // ================================
    async changePassword(currentPassword, newPassword, confirmPassword) {
        return this.authenticatedRequest(`${API_BASE_URL}/change_password.php`, {
            method: "POST",
            body: JSON.stringify({
                current_password: currentPassword,
                new_password: newPassword,
                confirm_password: confirmPassword
            })
        });
    }
};

// Auto login check listener for protected pages
document.addEventListener("DOMContentLoaded", () => {
    // If on a page that is NOT login or signup and user is not logged in, redirect
    const path = window.location.pathname;
    if (!path.includes("login.html") && !path.includes("signup.html") && !path.includes("index.html") && path !== "/") {
        if (!Auth.isLoggedIn()) {
            window.location.href = "login.html";
        }
    }
});