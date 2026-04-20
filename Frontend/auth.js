// ================================
// API Base URL
// ================================
const API_BASE_URL = "http://localhost/NewLander-backend";


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
        window.location.href = "index.html";   // ✅ FIXED redirect
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

            // Auto logout if token invalid
            if (response.status === 401) {
                this.logout();
            }

            return data;

        } catch (error) {
            console.error("API error:", error);
            throw error;
        }
    }
};


// ================================
// HANDLE LOGIN FORM
// ================================
function handleLogin(e) {
    e.preventDefault();

    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    const btn = e.target.querySelector("button");
    const originalText = btn.textContent;

    btn.textContent = "Logging in...";
    btn.disabled = true;

    Auth.login(email, password).then(result => {

        if (result.success) {
            alert("Login successful! Welcome " + result.data.user.full_name);

            setTimeout(() => {
                window.location.href = "index.html";
            }, 1000);

        } else {
            alert(result.message);
            btn.textContent = originalText;
            btn.disabled = false;
        }

    });
}


// ================================
// HANDLE SIGNUP FORM
// ================================
function handleSignup(e) {
    e.preventDefault();

    const formData = {
        fullName: document.getElementById("fullName").value,
        email: document.getElementById("email").value,
        password: document.getElementById("password").value,
        currentCountry: document.getElementById("currentCountry").value,
        destinationCountry: document.getElementById("destCountry").value
    };

    const btn = e.target.querySelector("button");
    const originalText = btn.innerHTML;

    btn.innerHTML = "Creating...";
    btn.disabled = true;

    Auth.signup(formData).then(result => {

        if (result.success) {
            alert("Account created successfully!");

            setTimeout(() => {
                window.location.href = "index.html";
            }, 1000);

        } else {
            alert(result.message);
            btn.innerHTML = originalText;
            btn.disabled = false;
        }

    });
}


// ================================
// AUTO LOGIN CHECK
// ================================
document.addEventListener("DOMContentLoaded", () => {
    if (Auth.isLoggedIn()) {
        console.log("User already logged in");
    }
});