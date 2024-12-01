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

// Authentication Service
const FirebaseAuth = {
    async registerUser(email, password, userData) {
        try {
            console.log('Starting user registration...', { email, userType: userData.userType });
            
            // Create user in Firebase Authentication
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            console.log('User created in Firebase Auth:', user.uid);

            // Prepare user data for Firestore
            const userDataForStore = {
                email: user.email,
                userType: userData.userType,
                fullName: userData.fullName,
                createdAt: new Date().toISOString(),
                lastLogin: new Date().toISOString(),
                uid: user.uid
            };

            // Store user data in Firestore
            const userDocRef = doc(db, 'users', user.uid);
            await setDoc(userDocRef, userDataForStore);
            console.log('User data stored in Firestore');

            return {
                user,
                userData: userDataForStore,
                message: 'Registration successful!'
            };
        } catch (error) {
            console.error('Registration Error:', error);
            console.error('Error details:', { code: error.code, message: error.message });
            const userMessage = handleFirebaseError(error);
            throw new Error(userMessage);
        }
    },

    async signInUser(email, password) {
        try {
            console.log('[FIREBASE] Attempting sign in:', email);
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            console.log('[FIREBASE] Sign in successful, fetching user data');
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            
            if (!userDoc.exists()) {
                console.error('[FIREBASE] User document not found');
                throw new Error('User profile not found');
            }

            const userData = userDoc.data();
            console.log('[FIREBASE] User data retrieved:', {
                uid: user.uid,
                email: user.email,
                userType: userData.userType
            });

            return {
                user,
                userData,
                message: 'Login successful!'
            };
        } catch (error) {
            console.error('[FIREBASE] Login Error:', {
                code: error.code,
                message: error.message
            });

            // Detailed error handling
            switch (error.code) {
                case 'auth/invalid-credential':
                    throw new Error('Invalid email or password. Please try again.');
                case 'auth/user-not-found':
                    throw new Error('No account found with this email. Please sign up.');
                case 'auth/wrong-password':
                    throw new Error('Incorrect password. Please try again.');
                case 'auth/too-many-requests':
                    throw new Error('Too many login attempts. Please try again later.');
                default:
                    throw new Error(handleFirebaseError(error));
            }
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
