// Initialize Firebase Authentication
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// DOM Elements
const profileForm = document.getElementById('profileForm');
const securityForm = document.getElementById('securityForm');
const profilePicture = document.getElementById('profilePicture');
const profilePreview = document.getElementById('profilePreview');
const displayNameInput = document.getElementById('displayName');
const emailInput = document.getElementById('email');

// Load user profile data
auth.onAuthStateChanged(async (user) => {
    if (user) {
        // Set email (readonly)
        emailInput.value = user.email;

        // Set display name if exists
        if (user.displayName) {
            displayNameInput.value = user.displayName;
        }

        // Set profile picture if exists
        if (user.photoURL) {
            profilePreview.src = user.photoURL;
        }

        // Load notification settings
        loadNotificationSettings(user.uid);
    } else {
        // Redirect to login if not authenticated
        window.location.href = 'login.html';
    }
});

// Handle profile picture change
profilePicture.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (file) {
        // Preview image
        const reader = new FileReader();
        reader.onload = (e) => {
            profilePreview.src = e.target.result;
        };
        reader.readAsDataURL(file);

        try {
            // Upload to Firebase Storage
            const user = auth.currentUser;
            const storageRef = storage.ref();
            const profileRef = storageRef.child(`profile-pictures/${user.uid}/${file.name}`);
            
            await profileRef.put(file);
            const downloadURL = await profileRef.getDownloadURL();
            
            // Update user profile
            await user.updateProfile({
                photoURL: downloadURL
            });
            
            showToast('Profile picture updated successfully!', 'success');
        } catch (error) {
            console.error('Error uploading profile picture:', error);
            showToast('Failed to update profile picture', 'error');
        }
    }
});

// Handle profile form submission
profileForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const user = auth.currentUser;
    const newDisplayName = displayNameInput.value.trim();

    try {
        await user.updateProfile({
            displayName: newDisplayName
        });

        // Update user document in Firestore
        await db.collection('users').doc(user.uid).set({
            displayName: newDisplayName,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });

        showToast('Profile updated successfully!', 'success');
    } catch (error) {
        console.error('Error updating profile:', error);
        showToast('Failed to update profile', 'error');
    }
});

// Add rate limiting utility
let lastAuthAttempt = 0;
const AUTH_COOLDOWN = 10000; // 10 seconds cooldown

function checkRateLimit() {
    const now = Date.now();
    if (now - lastAuthAttempt < AUTH_COOLDOWN) {
        throw new Error('Please wait a few seconds before trying again.');
    }
    lastAuthAttempt = now;
}

// Handle security form submission
securityForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    try {
        // Check rate limit before proceeding
        checkRateLimit();

        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        // Validate passwords
        if (newPassword !== confirmPassword) {
            showToast('New passwords do not match', 'error');
            return;
        }

        if (newPassword.length < 6) {
            showToast('Password must be at least 6 characters', 'error');
            return;
        }

        const user = auth.currentUser;
        const credential = firebase.auth.EmailAuthProvider.credential(
            user.email,
            currentPassword
        );

        // Reauthenticate user
        await user.reauthenticateWithCredential(credential);
        
        // Update password
        await user.updatePassword(newPassword);
        
        // Clear form
        securityForm.reset();
        
        showToast('Password updated successfully!', 'success');
    } catch (error) {
        console.error('Error updating password:', error);
        if (error.code === 'auth/too-many-requests') {
            showToast('Too many attempts. Please try again in a few minutes.', 'error');
        } else if (error.code === 'auth/wrong-password') {
            showToast('Current password is incorrect', 'error');
        } else if (error.message.includes('Please wait')) {
            showToast(error.message, 'error');
        } else {
            showToast('Failed to update password. Please try again later.', 'error');
        }
    }
});

// Load notification settings
async function loadNotificationSettings(userId) {
    try {
        const doc = await db.collection('users').doc(userId).get();
        const settings = doc.data()?.notificationSettings || {
            emailNotifications: true,
            companyAlerts: true,
            employeeAlerts: true,
            jobAlerts: true
        };

        // Set checkbox values
        document.getElementById('emailNotifications').checked = settings.emailNotifications;
        document.getElementById('companyAlerts').checked = settings.companyAlerts;
        document.getElementById('employeeAlerts').checked = settings.employeeAlerts;
        document.getElementById('jobAlerts').checked = settings.jobAlerts;
    } catch (error) {
        console.error('Error loading notification settings:', error);
        showToast('Failed to load notification settings', 'error');
    }
}

// Save notification settings
async function saveNotificationSettings() {
    const settings = {
        emailNotifications: document.getElementById('emailNotifications').checked,
        companyAlerts: document.getElementById('companyAlerts').checked,
        employeeAlerts: document.getElementById('employeeAlerts').checked,
        jobAlerts: document.getElementById('jobAlerts').checked
    };

    try {
        const user = auth.currentUser;
        await db.collection('users').doc(user.uid).set({
            notificationSettings: settings,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });

        showToast('Notification settings saved!', 'success');
    } catch (error) {
        console.error('Error saving notification settings:', error);
        showToast('Failed to save notification settings', 'error');
    }
}

// Toast notification function
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;

    const container = document.getElementById('toastContainer');
    container.appendChild(toast);

    // Remove toast after 3 seconds
    setTimeout(() => {
        toast.remove();
    }, 3000);
}
