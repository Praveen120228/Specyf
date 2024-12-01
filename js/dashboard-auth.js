// Import Firebase configuration and authentication
import { auth, db, FirebaseAuth } from './firebase-config.js';
import { onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { doc, getDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Base URL for GitHub Pages
const BASE_URL = '/Specyf';

// Authentication Service for Dashboard
export const AuthService = {
    // Get current user with additional profile data
    async getCurrentUser() {
        return new Promise((resolve, reject) => {
            onAuthStateChanged(auth, async (user) => {
                if (user) {
                    try {
                        // Get additional user data from Firestore
                        const userDoc = await getDoc(doc(db, 'users', user.uid));
                        const userData = userDoc.exists() ? userDoc.data() : {};
                        
                        resolve({
                            ...user,
                            ...userData
                        });
                    } catch (error) {
                        console.error('Error fetching user data:', error);
                        reject(error);
                    }
                } else {
                    resolve(null);
                }
            }, reject);
        });
    },

    // Logout user
    async logout() {
        try {
            await signOut(auth);
            window.location.href = `${BASE_URL}/login.html`;
        } catch (error) {
            console.error('Logout error:', error);
            throw error;
        }
    },

    // Check if user is authenticated and has correct role
    async validateAccess(requiredRole) {
        const user = await this.getCurrentUser();
        
        if (!user) {
            window.location.href = `${BASE_URL}/login.html`;
            return false;
        }

        if (user.userType !== requiredRole) {
            window.location.href = `${BASE_URL}/dashboard/${user.userType}-dashboard.html`;
            return false;
        }

        return true;
    }
};
