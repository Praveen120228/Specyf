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

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBXGGtvn8_Sp5LMaP7TPAyxt8VpcaUwR_0",
    authDomain: "usersdata-6b760.firebaseapp.com",
    projectId: "usersdata-6b760",
    storageBucket: "usersdata-6b760.appspot.com",
    messagingSenderId: "19070397931",
    appId: "1:19070397931:web:0fdb7e6a0c0a3f4d5e8c7b"
};

// Dummy user credentials for testing
const DUMMY_USERS = {
    'employee@test.com': {
        password: 'test123',
        userType: 'employee',
        name: 'Test Employee',
        role: 'Software Developer'
    },
    'company@test.com': {
        password: 'test123',
        userType: 'company',
        name: 'Test Company',
        industry: 'Technology'
    },
    'startup@test.com': {
        password: 'test123',
        userType: 'startup',
        name: 'Test Startup',
        stage: 'Seed'
    },
    'freelancer@test.com': {
        password: 'test123',
        userType: 'freelancer',
        name: 'Test Freelancer',
        skills: ['Web Development', 'UI/UX']
    },
    'recruitment@test.com': {
        password: 'test123',
        userType: 'recruitment',
        name: 'Test Recruiter',
        agency: 'Test Recruitment Agency'
    }
};

// Firebase Initialization with Error Handling
let app, auth, db;
try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    console.log('[FIREBASE] Initialized successfully');
} catch (error) {
    console.error('[FIREBASE] Initialization error:', error);
}

// Authentication Service
const FirebaseAuth = {
    async registerUser(email, password, userData) {
        try {
            // Check if it's a dummy user
            if (DUMMY_USERS[email.toLowerCase()]) {
                console.log('[AUTH] Using dummy user for registration:', email);
                return {
                    user: {
                        uid: 'dummy_' + Math.random().toString(36).substr(2, 9),
                        email: email
                    },
                    userData: { ...DUMMY_USERS[email.toLowerCase()], ...userData }
                };
            }

            // Regular Firebase registration
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            await setDoc(doc(db, 'users', userCredential.user.uid), userData);
            
            return {
                user: userCredential.user,
                userData: userData
            };
        } catch (error) {
            console.error('[AUTH] Registration error:', error);
            throw handleAuthError(error);
        }
    },

    async signInUser(email, password) {
        try {
            console.log('[AUTH] Attempting sign in:', email);
            
            // Check for dummy users first
            const dummyUser = DUMMY_USERS[email.toLowerCase()];
            if (dummyUser && password === dummyUser.password) {
                console.log('[AUTH] Dummy user login successful:', email);
                return {
                    user: {
                        uid: 'dummy_' + Math.random().toString(36).substr(2, 9),
                        email: email,
                        getIdToken: async () => 'dummy_token'
                    },
                    userData: dummyUser
                };
            }

            // Regular Firebase authentication
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
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
            console.error('[AUTH] Sign-in error:', error);
            throw handleAuthError(error);
        }
    },

    async signOut() {
        try {
            await auth.signOut();
            console.log('[AUTH] User signed out successfully');
        } catch (error) {
            console.error('[AUTH] Sign out error:', error);
            throw error;
        }
    }
};

// Error handling helper
function handleAuthError(error) {
    // Default error message
    let message = 'An error occurred during authentication.';
    
    // Check if error is a Firebase Auth error with code
    if (error && error.code) {
        switch (error.code) {
            case 'auth/email-already-in-use':
                message = 'This email is already registered.';
                break;
            case 'auth/invalid-email':
                message = 'Invalid email address.';
                break;
            case 'auth/operation-not-allowed':
                message = 'Email/password accounts are not enabled.';
                break;
            case 'auth/weak-password':
                message = 'Password should be at least 6 characters.';
                break;
            case 'auth/user-disabled':
                message = 'This account has been disabled.';
                break;
            case 'auth/user-not-found':
            case 'auth/wrong-password':
                message = 'Invalid email or password.';
                break;
            default:
                // If it's a Firebase error but not one we explicitly handle
                message = error.message || 'Authentication error occurred.';
        }
    } else if (error && error.message) {
        // If it's a regular error with a message
        message = error.message;
    }
    
    // Create and return an error object
    const authError = new Error(message);
    authError.code = error?.code || 'auth/unknown';
    return authError;
}

export default FirebaseAuth;
