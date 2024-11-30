// Dashboard JavaScript
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in
    const userData = JSON.parse(localStorage.getItem('userData'));
    const welcomeMessage = document.getElementById('welcomeMessage');
    const logoutButton = document.getElementById('logoutButton');
    const bookServiceBtn = document.getElementById('bookServiceBtn');
    const manageBookingsBtn = document.getElementById('manageBookingsBtn');
    const profileBtn = document.getElementById('profileBtn');
    const supportBtn = document.getElementById('supportBtn');

    // Update welcome message if user data exists
    if (userData && userData.name) {
        welcomeMessage.textContent = `Welcome, ${userData.name}!`;
    }

    // Logout functionality
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            // Clear user data and token
            localStorage.removeItem('userData');
            localStorage.removeItem('userToken');
            
            // Redirect to login page
            window.location.href = '../login.html';
        });
    }

    // Button event listeners
    if (bookServiceBtn) {
        bookServiceBtn.addEventListener('click', () => {
            window.location.href = 'book-service.html';
        });
    }

    if (manageBookingsBtn) {
        manageBookingsBtn.addEventListener('click', () => {
            // Placeholder for manage bookings page
            alert('Manage Bookings page coming soon!');
        });
    }

    if (profileBtn) {
        profileBtn.addEventListener('click', () => {
            // Placeholder for profile page
            alert('Profile page coming soon!');
        });
    }

    if (supportBtn) {
        supportBtn.addEventListener('click', () => {
            // Placeholder for support page
            alert('Support page coming soon!');
        });
    }

    // Redirect to login if no token exists
    const userToken = localStorage.getItem('userToken');
    if (!userToken) {
        window.location.href = '../login.html';
    }
});
