// Base URL for GitHub Pages
const BASE_URL = '/Specyf';

// Authentication Service for Dashboard
export const AuthService = {
    // Get current user with additional profile data
    async getCurrentUser() {
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user') || 'null');

        if (!token || !user) {
            return null;
        }

        try {
            // Verify token with backend
            const response = await fetch('/api/auth/verify', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                // Token is invalid, clear storage
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                return null;
            }

            return user;
        } catch (error) {
            console.error('Error verifying user:', error);
            return null;
        }
    },

    // Logout user
    async logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = `${BASE_URL}/login.html`;
    },

    // Check if user is authenticated and has correct role
    async validateAccess(requiredRole) {
        const user = await this.getCurrentUser();
        
        if (!user) {
            window.location.href = `${BASE_URL}/login.html`;
            return false;
        }

        if (requiredRole && user.type.toLowerCase() !== requiredRole.toLowerCase()) {
            window.location.href = `${BASE_URL}/dashboard/${user.type.toLowerCase()}-dashboard.html`;
            return false;
        }

        return true;
    }
};
