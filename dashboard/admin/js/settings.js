import { auth, db, storage } from './firebase-config.js';
import { updateProfile, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'https://www.gstatic.com/firebasejs/9.x.x/firebase-auth.js';
import { doc, getDoc, setDoc, updateDoc } from 'https://www.gstatic.com/firebasejs/9.x.x/firebase-firestore.js';
import { ref, uploadBytes, getDownloadURL } from 'https://www.gstatic.com/firebasejs/9.x.x/firebase-storage.js';

// DOM Elements
const profileForm = document.getElementById('profileForm');
const passwordForm = document.getElementById('passwordForm');
const notificationForm = document.getElementById('notificationForm');
const themeForm = document.getElementById('themeForm');
const profileImageUpload = document.getElementById('profileImage');
const currentProfileImage = document.getElementById('currentProfileImage');
const uploadBtn = document.querySelector('.upload-btn');

// Theme Management
const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');

// Initialize theme before page load
document.addEventListener('DOMContentLoaded', () => {
    initializeTheme();
    loadUserSettings();
    loadThemePreference();
});

function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    applyTheme(savedTheme);
    
    // Set the correct radio button
    const themeInput = document.querySelector(`input[name="theme"][value="${savedTheme}"]`);
    if (themeInput) {
        themeInput.checked = true;
    }
}

// Event Listeners
profileForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    await updateUserProfile();
});

passwordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    await updateUserPassword();
});

notificationForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    await updateNotificationPreferences();
});

if (themeForm) {
    themeForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const selectedTheme = document.querySelector('input[name="theme"]:checked');
        if (selectedTheme) {
            const newTheme = selectedTheme.value;
            applyTheme(newTheme);
            localStorage.setItem('theme', newTheme);
            showNotification('Theme updated successfully!', 'success');
        }
    });
}

uploadBtn.addEventListener('click', () => {
    profileImageUpload.click();
});

profileImageUpload.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (file) {
        await uploadProfileImage(file);
    }
});

// Functions
async function loadUserSettings() {
    try {
        const user = auth.currentUser;
        if (!user) return;

        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const userData = userDoc.data() || {};

        // Profile Settings
        document.getElementById('fullName').value = user.displayName || '';
        document.getElementById('email').value = user.email || '';
        document.getElementById('phone').value = userData.phone || '';
        currentProfileImage.src = user.photoURL || 'https://ui-avatars.com/api/?name=' + (user.displayName || 'User');

        // Notification Settings
        document.getElementById('emailNotifications').checked = userData.notifications?.email ?? true;
        document.getElementById('jobAlerts').checked = userData.notifications?.jobs ?? true;
        document.getElementById('marketingEmails').checked = userData.notifications?.marketing ?? false;

    } catch (error) {
        console.error('Error loading user settings:', error);
        showNotification('Error loading settings. Please try again.', 'error');
    }
}

async function updateUserProfile() {
    try {
        const user = auth.currentUser;
        if (!user) throw new Error('No user logged in');

        const fullName = document.getElementById('fullName').value;
        const phone = document.getElementById('phone').value;

        // Update Firebase Auth Profile
        await updateProfile(user, {
            displayName: fullName
        });

        // Update Firestore User Document
        await setDoc(doc(db, 'users', user.uid), {
            displayName: fullName,
            phone: phone,
            updatedAt: new Date().toISOString()
        }, { merge: true });

        showNotification('Profile updated successfully!', 'success');
    } catch (error) {
        console.error('Error updating profile:', error);
        showNotification('Error updating profile. Please try again.', 'error');
    }
}

async function updateUserPassword() {
    try {
        const user = auth.currentUser;
        if (!user) throw new Error('No user logged in');

        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (newPassword !== confirmPassword) {
            throw new Error('New passwords do not match');
        }

        // Re-authenticate user
        const credential = EmailAuthProvider.credential(user.email, currentPassword);
        await reauthenticateWithCredential(user, credential);

        // Update password
        await updatePassword(user, newPassword);

        // Clear form
        passwordForm.reset();
        showNotification('Password updated successfully!', 'success');
    } catch (error) {
        console.error('Error updating password:', error);
        showNotification(
            error.message === 'New passwords do not match'
                ? error.message
                : 'Error updating password. Please check your current password and try again.',
            'error'
        );
    }
}

async function updateNotificationPreferences() {
    try {
        const user = auth.currentUser;
        if (!user) throw new Error('No user logged in');

        const notifications = {
            email: document.getElementById('emailNotifications').checked,
            jobs: document.getElementById('jobAlerts').checked,
            marketing: document.getElementById('marketingEmails').checked
        };

        await updateDoc(doc(db, 'users', user.uid), {
            notifications,
            updatedAt: new Date().toISOString()
        });

        showNotification('Notification preferences updated!', 'success');
    } catch (error) {
        console.error('Error updating notification preferences:', error);
        showNotification('Error updating preferences. Please try again.', 'error');
    }
}

async function uploadProfileImage(file) {
    try {
        const user = auth.currentUser;
        if (!user) throw new Error('No user logged in');

        // Create a reference to the file location
        const storageRef = ref(storage, `profile_images/${user.uid}/${file.name}`);

        // Upload file
        await uploadBytes(storageRef, file);

        // Get download URL
        const downloadURL = await getDownloadURL(storageRef);

        // Update user profile
        await updateProfile(user, {
            photoURL: downloadURL
        });

        // Update profile image in UI
        currentProfileImage.src = downloadURL;

        showNotification('Profile image updated successfully!', 'success');
    } catch (error) {
        console.error('Error uploading profile image:', error);
        showNotification('Error uploading image. Please try again.', 'error');
    }
}

function applyTheme(theme) {
    const root = document.documentElement;
    
    if (theme === 'system') {
        if (prefersDarkScheme.matches) {
            root.setAttribute('data-theme', 'dark');
        } else {
            root.setAttribute('data-theme', 'light');
        }
    } else {
        root.setAttribute('data-theme', theme);
    }
}

// Listen for system theme changes
prefersDarkScheme.addListener((e) => {
    const currentTheme = localStorage.getItem('theme');
    if (currentTheme === 'system') {
        applyTheme('system');
    }
});

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.remove();
    }, 3000);
}
