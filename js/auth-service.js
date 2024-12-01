// Import Firebase services
import { auth, db, FirebaseAuth } from './firebase-config.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { doc, getDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Authentication paths
const AUTH_PATHS = {
    login: '/login.html',
    signup: '/signup.html',
    dashboards: {
        employee: '/dashboard/employee-dashboard.html',
        company: '/dashboard/company-dashboard.html',
        startup: '/dashboard/startup-dashboard.html',
        freelancer: '/dashboard/freelancer-dashboard.html',
        recruitment: '/dashboard/recruitment-dashboard.html'
    }
};

class AuthService {
    constructor() {
        this.currentUser = null;
        this.userType = null;
        this.setupAuthListener();
    }

    // Set up authentication state listener
    setupAuthListener() {
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                try {
                    const userDoc = await getDoc(doc(db, 'users', user.uid));
                    if (userDoc.exists()) {
                        this.currentUser = user;
                        this.userType = userDoc.data().userType;
                        this.handleAuthenticatedNavigation();
                    } else {
                        console.error('User document not found');
                        await this.signOut();
                    }
                } catch (error) {
                    console.error('Error fetching user data:', error);
                    await this.signOut();
                }
            } else {
                this.currentUser = null;
                this.userType = null;
                this.handleUnauthenticatedNavigation();
            }
        });
    }

    // Handle navigation for authenticated users
    handleAuthenticatedNavigation() {
        const currentPath = window.location.pathname;
        
        // If on login or signup page, redirect to appropriate dashboard
        if (currentPath.includes('login.html') || currentPath.includes('signup.html')) {
            if (this.userType && AUTH_PATHS.dashboards[this.userType]) {
                window.location.href = AUTH_PATHS.dashboards[this.userType];
            }
        }
        // If on wrong dashboard, redirect to correct one
        else if (currentPath.includes('dashboard')) {
            const currentDashboard = Object.entries(AUTH_PATHS.dashboards)
                .find(([_, path]) => currentPath.includes(path));
            
            if (!currentDashboard || currentDashboard[0] !== this.userType) {
                window.location.href = AUTH_PATHS.dashboards[this.userType];
            }
        }
    }

    // Handle navigation for unauthenticated users
    handleUnauthenticatedNavigation() {
        const currentPath = window.location.pathname;
        
        // If trying to access dashboard while not authenticated
        if (currentPath.includes('dashboard')) {
            window.location.href = AUTH_PATHS.login;
        }
    }

    // Sign in user
    async signIn(email, password) {
        try {
            const result = await FirebaseAuth.signInUser(email, password);
            return result;
        } catch (error) {
            console.error('Sign in error:', error);
            throw error;
        }
    }

    // Sign up user
    async signUp(email, password, userData) {
        try {
            const result = await FirebaseAuth.registerUser(email, password, userData);
            return result;
        } catch (error) {
            console.error('Sign up error:', error);
            throw error;
        }
    }

    // Sign out user
    async signOut() {
        try {
            await FirebaseAuth.signOutUser();
            window.location.href = AUTH_PATHS.login;
        } catch (error) {
            console.error('Sign out error:', error);
            throw error;
        }
    }

    // Get current user data
    async getCurrentUserData() {
        if (!this.currentUser) return null;
        
        try {
            const userDoc = await getDoc(doc(db, 'users', this.currentUser.uid));
            if (userDoc.exists()) {
                return {
                    ...this.currentUser,
                    ...userDoc.data()
                };
            }
            return null;
        } catch (error) {
            console.error('Error fetching user data:', error);
            return null;
        }
    }

    // Check if user is authenticated
    isAuthenticated() {
        return !!this.currentUser;
    }

    // Get user type
    getUserType() {
        return this.userType;
    }
}

// Create and export singleton instance
const authService = new AuthService();
export default authService;
