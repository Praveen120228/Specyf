// This script helps create the first admin user
const email = 'admin@specyf.com';    // Change this to your admin email
const password = 'admin123';         // Change this to your desired password

// Initialize Firebase Auth
firebase.auth().createUserWithEmailAndPassword(email, password)
    .then(async (userCredential) => {
        const user = userCredential.user;
        
        // Create admin user document in Firestore
        await firebase.firestore().collection('users').doc(user.uid).set({
            email: email,
            role: 'admin',
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            displayName: 'Admin User'
        });

        console.log('Admin user created successfully!');
        alert('Admin account created! You can now log in.');
    })
    .catch((error) => {
        console.error('Error creating admin:', error);
        alert('Error creating admin account: ' + error.message);
    });
