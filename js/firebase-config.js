// Import required Firebase modules
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { 
    getAuth, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { 
    getFirestore, 
    doc, 
    setDoc, 
    getDoc
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyBLngjeMo1fJ23WyjpGCzOLsjagJ0V5gvk",
    authDomain: "usersdata-6b760.firebaseapp.com",
    databaseURL: "https://usersdata-6b760.firebaseio.com",
    projectId: "usersdata-6b760",
    storageBucket: "usersdata-6b760.appspot.com",
    messagingSenderId: "1059253882266",
    appId: "1:1059253882266:web:9e86e8bd91faabd68abe23"
};

// Authentication bypass configuration
const BYPASS_EMAILS = [
    'employee@specyf.com',
    'company@specyf.com',
    'startup@specyf.com',
    'freelancer@specyf.com',
    'recruitment@specyf.com'
];

const BYPASS_MODE = true;

// Modify signInWithEmailAndPassword to handle bypass
const originalSignInWithEmailAndPassword = signInWithEmailAndPassword;
signInWithEmailAndPassword = async (auth, email, password) => {
    // Bypass mode active
    if (BYPASS_MODE && BYPASS_EMAILS.includes(email.toLowerCase())) {
        console.warn('[FIREBASE] AUTHENTICATION BYPASSED - NOT SECURE!');
        
        // Create a mock user credential
        return {
            user: {
                uid: 'bypass_' + Math.random().toString(36).substr(2, 9),
                email: email,
                getIdToken: async () => 'bypass_token'
            }
        };
    }

    // Original Firebase authentication
    return originalSignInWithEmailAndPassword(auth, email, password);
};

// Firebase Initialization with Error Handling
let app, auth, db;
try {
    // Initialize Firebase
    app = initializeApp(firebaseConfig);
    
    // Initialize Authentication
    auth = getAuth();
    auth.useDeviceLanguage();
    
    // Initialize Firestore
    db = getFirestore();
    
    console.log('Firebase initialized successfully');
} catch (error) {
    console.error('Firebase Initialization Error:', error);
    console.error('Error details:', error.code, error.message);
    alert('Failed to initialize Firebase. Please check your configuration.');
}

// Centralized Error Handler
function handleFirebaseError(error) {
    console.error('Firebase Error:', error.code, error.message);
    
    const errorMap = {
        'auth/email-already-in-use': 'Email is already registered',
        'auth/invalid-email': 'Invalid email address',
        'auth/operation-not-allowed': 'Operation not allowed',
        'auth/weak-password': 'Password is too weak',
        'auth/user-disabled': 'User account has been disabled',
        'auth/user-not-found': 'No user found with this email',
        'auth/wrong-password': 'Incorrect password',
        'auth/configuration-not-found': 'Firebase configuration not found. Please check your setup.'
    };

    return errorMap[error.code] || error.message || 'An unknown error occurred';
}

// Helper function to determine user type from email
function getUserTypeFromEmail(email) {
    const emailLower = email.toLowerCase();
    const userTypes = {
        'employee@specyf.com': 'employee',
        'company@specyf.com': 'company',
        'startup@specyf.com': 'startup',
        'freelancer@specyf.com': 'freelancer',
        'recruitment@specyf.com': 'recruitment'
    };
    
    return userTypes[emailLower] || 'employee';
}

// Authentication Service
const FirebaseAuth = {
    async registerUser(email, password, userData) {
        try {
            // Bypass registration in bypass mode
            if (BYPASS_MODE && BYPASS_EMAILS.includes(email.toLowerCase())) {
                return {
                    user: {
                        uid: 'bypass_' + Math.random().toString(36).substr(2, 9),
                        email: email
                    },
                    userData: userData
                };
            }

            // Original registration logic
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            
            // Store additional user data
            await setDoc(doc(db, 'users', userCredential.user.uid), userData);
            
            return {
                user: userCredential.user,
                userData: userData
            };
        } catch (error) {
            console.error('Registration error:', error);
            throw handleFirebaseError(error);
        }
    },

    async signInUser(email, password) {
        try {
            console.log('[FIREBASE] Attempting sign in:', email);
            
            // Bypass mode
            if (BYPASS_MODE && BYPASS_EMAILS.includes(email.toLowerCase())) {
                const userType = getUserTypeFromEmail(email);
                
                return {
                    user: {
                        uid: 'bypass_' + Math.random().toString(36).substr(2, 9),
                        email: email
                    },
                    userData: { 
                        userType: userType,
                        email: email
                    }
                };
            }

            // Original sign-in logic
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            
            // Fetch user document
            const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
            
            if (userDoc.exists()) {
                return {
                    user: userCredential.user,
                    userData: userDoc.data()
                };
            } else {
                throw new Error('User document not found');
            }
        } catch (error) {
            console.error('[FIREBASE] Sign-in error:', error);
            throw handleFirebaseError(error);
        }
    },

    async signOutUser() {
        try {
            await signOut(auth);
            return { message: 'Logout successful!' };
        } catch (error) {
            console.error('Logout Error:', error);
            const userMessage = handleFirebaseError(error);
            throw new Error(userMessage);
        }
    },

    async getCurrentUser() {
        return new Promise((resolve, reject) => {
            const unsubscribe = onAuthStateChanged(auth, (user) => {
                unsubscribe();
                resolve(user);
            }, reject);
        });
    }
};

// Export configurations and services
export { 
    app, 
    auth, 
    db, 
    FirebaseAuth,
    handleFirebaseError 
};
