const admin = require('firebase-admin');
const serviceAccount = require('./service-account-key.json');

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

// The email of the user you want to verify/set as admin
const userEmail = 'rajapraveensir@gmail.com';

async function verifyAndSetAdminClaim() {
    try {
        // Get the user by email
        const user = await admin.auth().getUserByEmail(userEmail);
        
        // Get the user's custom claims
        const { customClaims } = await admin.auth().getUser(user.uid);
        
        if (!customClaims || !customClaims.admin) {
            // Set admin custom claim if not already set
            await admin.auth().setCustomUserClaims(user.uid, {
                admin: true
            });
            console.log(`Successfully set admin claim for user ${userEmail}`);
        } else {
            console.log(`Admin claim already set for user ${userEmail}`);
        }
        
        // Verify the claims were set
        const updatedUser = await admin.auth().getUser(user.uid);
        console.log('Current custom claims:', updatedUser.customClaims);
        
        process.exit(0);
    } catch (error) {
        console.error('Error verifying/setting admin claim:', error);
        process.exit(1);
    }
}

verifyAndSetAdminClaim();
