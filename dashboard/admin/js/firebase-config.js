// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.x.x/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.x.x/firebase-analytics.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.x.x/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/9.x.x/firebase-storage.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.x.x/firebase-auth.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBKtvUg0opUeDFNLkKflAhhde5Y3yybAx8",
    authDomain: "specyf-admin-dashboard.firebaseapp.com",
    projectId: "specyf-admin-dashboard",
    storageBucket: "specyf-admin-dashboard.firebasestorage.app",
    messagingSenderId: "3029017996",
    appId: "1:3029017996:web:fa4583bb9c3c57719ea2a9",
    measurementId: "G-R2Y8V5F9ZM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

export { app, db, storage, auth };
