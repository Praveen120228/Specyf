// Import Firebase services
import { auth, db, FirebaseAuth } from './firebase-config.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { doc, getDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Utility function for delay
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// Retry function with exponential backoff
async function retryOperation(operation, maxRetries = 3, initialDelay = 1000) {
    let lastError;
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await operation();
        } catch (error) {
            lastError = error;
            if (error.code === 'resource-exhausted' || error.message.includes('rate limit')) {
                const waitTime = initialDelay * Math.pow(2, i);
                console.log(`Rate limit hit, waiting ${waitTime}ms before retry ${i + 1}/${maxRetries}`);
                await delay(waitTime);
                continue;
            }
            throw error;
        }
    }
    throw lastError;
}

// Get the base URL for GitHub Pages
const getBaseUrl = () => {
    // For GitHub Pages
    if (window.location.hostname.includes('github.io')) {
        return '/Specyf';
    }
    // For local development
    return '';
};

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
        this.currentUser = null;
        this.userType = null;
        this.lastNavigatedPath = null;
        this.AUTHENTICATION_BYPASS = true; // Temporary authentication bypass
        this.setupAuthListener();
    }

    // Set up authentication state listener with retry mechanism
    setupAuthListener() {
        // If bypass is active, do nothing
        if (this.AUTHENTICATION_BYPASS) {
            console.warn('[AUTH] Authentication listener bypassed');
            return;
        }

        console.log('[AUTH] Setting up authentication listener');
        onAuthStateChanged(auth, async (user) => {
            console.log('[AUTH] Auth state changed:', user ? user.uid : 'No user');
            
            try {
                if (user) {
                    console.log('[AUTH] User authenticated, fetching user data');
                    const userDoc = await retryOperation(async () => {
                        const doc = await getDoc(doc(db, 'users', user.uid));
                        console.log('[AUTH] User document exists:', doc.exists());
                        return doc;
                    });

                    if (userDoc.exists()) {
                        const userData = userDoc.data();
                        console.log('[AUTH] User data retrieved:', {
                            uid: user.uid,
                            email: user.email,
                            userType: userData.userType
                        });

                        this.currentUser = user;
                        this.userType = userData.userType;
                        
                        // Explicitly navigate to dashboard
                        this.navigateToDashboard();
                    } else {
                        console.error('[AUTH] User document not found');
                        await this.signOut();
                    }
                } else {
                    console.log('[AUTH] No authenticated user');
                    this.currentUser = null;
                    this.userType = null;
                    
                    // Ensure we're on the login page if no user is authenticated
                    if (!window.location.pathname.includes('/login.html')) {
                        window.location.href = AUTH_PATHS.login;
                    }
                }
            } catch (error) {
                console.error('[AUTH] Authentication listener error:', error);
                await this.signOut();
            }
        }, (error) => {
            console.error('[AUTH] Auth state change error:', error);
        });
    }

    // Get the current path relative to base URL
    getRelativePath() {
        const baseUrl = getBaseUrl();
        const path = window.location.pathname;
        return baseUrl ? path.replace(baseUrl, '') : path;
    }

    // Handle navigation for authenticated users
    async handleAuthenticatedNavigation() {
        try {
            console.log('[NAV] Handling authenticated navigation');
            const currentPath = this.getRelativePath();
            console.log('[NAV] Current path:', currentPath);
            console.log('[NAV] User type:', this.userType);
            console.log('[NAV] Dashboards:', JSON.stringify(AUTH_PATHS.dashboards));

            // Prevent unnecessary redirects
            if (this.lastNavigatedPath === currentPath) {
                console.log('[NAV] Preventing duplicate navigation');
                return;
            }

            // Determine target dashboard
            const targetDashboard = AUTH_PATHS.dashboards[this.userType];
            console.log('[NAV] Target dashboard:', targetDashboard);

            // Redirect conditions
            const shouldRedirect = 
                currentPath.includes('login.html') || 
                currentPath.includes('signup.html') || 
                currentPath === '/' ||
                (currentPath.includes('dashboard') && !currentPath.includes(this.userType));

            if (shouldRedirect && targetDashboard) {
                console.log(`[NAV] Redirecting to ${targetDashboard}`);
                this.lastNavigatedPath = targetDashboard;
                window.location.href = targetDashboard;
                return;
            }

            // Update last navigated path
            this.lastNavigatedPath = currentPath;
        } catch (error) {
            console.error('[NAV] Navigation error:', error);
        }
    }

    // Handle navigation for unauthenticated users
    async handleUnauthenticatedNavigation() {
        try {
            console.log('[NAV] Handling unauthenticated navigation');
            const currentPath = this.getRelativePath();
            console.log('[NAV] Current unauthenticated path:', currentPath);

            // Prevent unnecessary redirects
            if (this.lastNavigatedPath === AUTH_PATHS.login) {
                console.log('[NAV] Preventing duplicate login redirect');
                return;
            }
            
            // If trying to access dashboard while not authenticated
            if (currentPath.includes('dashboard') || currentPath === '/') {
                console.log(`[NAV] Redirecting to login: ${AUTH_PATHS.login}`);
                this.lastNavigatedPath = AUTH_PATHS.login;
                window.location.href = this.lastNavigatedPath;
            }
        } catch (error) {
            console.error('[NAV] Unauthenticated navigation error:', error);
        }
    }

    // Explicit navigation method
    navigateToDashboard() {
        console.log('[NAV] Navigation Debug Info:', {
            hostname: window.location.hostname,
            pathname: window.location.pathname,
            baseUrl: getBaseUrl(),
            userType: this.userType
        });

        if (!this.userType) {
            console.error('[NAV] No user type found, redirecting to login');
            window.location.href = AUTH_PATHS.login;
            return;
        }

        const dashboardPath = AUTH_PATHS.dashboards[this.userType];
        
        if (dashboardPath) {
            console.log(`[NAV] Attempting navigation to: ${dashboardPath}`);
            
            // Construct absolute URL for GitHub Pages
            const isGitHubPages = window.location.hostname.includes('github.io');
            const fullUrl = isGitHubPages 
                ? `https://${window.location.host}${dashboardPath}`
                : dashboardPath;
            
            console.log(`[NAV] Full navigation URL: ${fullUrl}`);
            
            // Perform navigation
            try {
                window.location.href = fullUrl;
            } catch (error) {
                console.error('[NAV] Navigation failed:', error);
                // Fallback to direct path
                window.location.href = `/Specyf/dashboard/${this.userType}-dashboard.html`;
            }
        } else {
            console.error('[NAV] No dashboard path found for user type:', this.userType);
            window.location.href = AUTH_PATHS.login;
        }
    }

    // Fallback navigation method
    fallbackNavigation() {
        console.warn('[NAV] Attempting fallback navigation');
        
        // Try direct path navigation
        const directPath = `/dashboard/${this.userType}-dashboard.html`;
        console.log(`[NAV] Attempting direct path: ${directPath}`);
        
        window.location.href = directPath;
    }

    // Sign in user with retry mechanism
    async signIn(email, password) {
        try {
            const result = await retryOperation(async () => {
                return await FirebaseAuth.signInUser(email, password);
            });
            
            // Explicitly trigger navigation after successful login
            console.log('[AUTH] Login successful, navigating to dashboard');
            
            // Set current user and user type from result
            this.currentUser = result.user;
            this.userType = result.userData.userType;
            
            this.navigateToDashboard();
            
            return result;
        } catch (error) {
            console.error('Sign in error:', error);
            if (error.code === 'resource-exhausted' || error.message.includes('rate limit')) {
                throw new Error('Service is temporarily busy. Please try again in a few moments.');
            }
            throw error;
        }
    }

    // Sign up user with retry mechanism
    async signUp(email, password, userData) {
        try {
            console.log('Starting signup process...');
            const result = await retryOperation(async () => {
                return await FirebaseAuth.registerUser(email, password, userData);
            });
            console.log('Signup successful, user data:', result);
            return result;
        } catch (error) {
            console.error('Sign up error:', error);
            if (error.code === 'resource-exhausted' || error.message.includes('rate limit')) {
                throw new Error('Service is temporarily busy. Please try again in a few moments.');
            }
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
