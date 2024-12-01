const admin = require('firebase-admin');
const serviceAccount = require('./service-account-key.json');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// The email of the user you want to make an admin
const userEmail = 'rajapraveensir@gmail.com';

async function setAdminClaim() {
  try {
    // Get the user by email
    const user = await admin.auth().getUserByEmail(userEmail);
    
    // Set admin custom claim
    await admin.auth().setCustomUserClaims(user.uid, {
      admin: true
    });

    console.log(`Successfully set admin claim for user ${userEmail}`);
    process.exit(0);
  } catch (error) {
    console.error('Error setting admin claim:', error);
    process.exit(1);
  }
}

setAdminClaim();
