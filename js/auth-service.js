// Import required modules
import { getBaseUrl } from './utils.js';

// Authentication paths
const AUTH_PATHS = {
    login: `${getBaseUrl()}/login.html`,
    signup: `${getBaseUrl()}/signup.html`,
    dashboards: {
        employee: `${getBaseUrl()}/dashboard/employee-dashboard.html`,
        company: `${getBaseUrl()}/dashboard/company-dashboard.html`,
        startup: `${getBaseUrl()}/dashboard/startup-dashboard.html`,
        freelancer: `${getBaseUrl()}/dashboard/freelancer-dashboard.html`,
        recruitment: `${getBaseUrl()}/dashboard/recruitment-dashboard.html`
    }
};

class AuthService {
    constructor() {
        this.token = localStorage.getItem('token');
        this.user = JSON.parse(localStorage.getItem('user'));
    }

    async login(email, password) {
        console.log('Attempting to login with:', email, password);
        // Test credentials
        const testUsers = {
            'employee@specyf.com': { password: 'Employee123!', type: 'employee' },
            'company@specyf.com': { password: 'Company123!', type: 'company' },
            'recruiter@specyf.com': { password: 'Recruit123!', type: 'recruitment' },
            'freelancer@specyf.com': { password: 'Freelance123!', type: 'freelancer' }
        };

        // Check if email exists
        if (!testUsers[email]) {
            console.error('Invalid email:', email);
            throw new Error('Invalid email or password');
        }

        // Check password
        if (testUsers[email].password !== password) {
            console.error('Invalid password for:', email);
            throw new Error('Invalid email or password');
        }

        console.log('Login successful for:', email);

        // Create user data
        const userData = {
            email: email,
            userType: testUsers[email].type,
            name: email.split('@')[0]
        };

        console.log('Creating user data:', userData);

        // Store in localStorage
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('isLoggedIn', 'true');

        console.log('Stored user data in localStorage');

        // Redirect based on user type
        const dashboardPath = `/dashboard/${testUsers[email].type}-dashboard.html`;
        console.log('Redirecting to:', dashboardPath);
        window.location.href = dashboardPath;

        return { success: true, user: userData };
    }

    async logout() {
        this.token = null;
        this.user = null;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('isLoggedIn');
        window.location.href = AUTH_PATHS.login;
    }

    isAuthenticated() {
        return !!this.token || localStorage.getItem('isLoggedIn') === 'true';
    }

    getCurrentUser() {
        return this.user;
    }

    getToken() {
        return this.token;
    }

    // Redirect to appropriate dashboard based on user role
    redirectToDashboard(userType) {
        const dashboardPath = AUTH_PATHS.dashboards[userType.toLowerCase()];
        if (dashboardPath) {
            window.location.href = dashboardPath;
        } else {
            console.error('Invalid user type:', userType);
        }
    }
}

// Create and export singleton instance
const authService = new AuthService();
export default authService;
