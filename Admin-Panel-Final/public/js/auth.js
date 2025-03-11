// Check if user is logged in
function checkAuth() {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    if (!isLoggedIn && !window.location.pathname.includes('login.html')) {
        window.location.href = '/login.html';
    }
}

// Handle login
function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (username === 'admin' && password === 'qwerty') {
        sessionStorage.setItem('isLoggedIn', 'true');
        window.location.href = '/index.html';
    } else {
        alert('Invalid username or password');
    }
}

// Handle logout
function handleLogout() {
    sessionStorage.removeItem('isLoggedIn');
    window.location.href = '/login.html';
}

// Toggle password visibility
function togglePassword() {
    const passwordInput = document.getElementById('password');
    const type = passwordInput.type === 'password' ? 'text' : 'password';
    passwordInput.type = type;
}

// Initialize auth functionality
document.addEventListener('DOMContentLoaded', () => {
    // Check authentication on every page
    checkAuth();

    // Login form handling
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
        
        const toggleBtn = document.querySelector('.toggle-password');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', togglePassword);
        }
    }

    // Logout button handling
    const logoutBtn = document.querySelector('.logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    } else {
        console.error('Logout button not found');
    }
});

// Add event listener for page loads and navigation
window.addEventListener('load', checkAuth);
window.addEventListener('popstate', checkAuth); 