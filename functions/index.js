const functions = require('firebase-functions');
const admin = require('firebase-admin');
const sgMail = require('@sendgrid/mail');

// Initialize Firebase Admin (if not already initialized)
admin.initializeApp();

// Set your SendGrid API key (store this in Firebase Config)
sgMail.setApiKey(functions.config().sendgrid.key);

// Email notification function triggered by Firestore
exports.sendContactFormEmail = functions.firestore
    .document('contact_submissions/{docId}')
    .onCreate(async (snapshot, context) => {
        // Get the submitted data
        const formData = snapshot.data();

        // Prepare email
        const msg = {
            to: 'specyf.contact@gmail.com', // Your contact email
            from: 'notifications@specyf.com', // Verified SendGrid sender
            subject: `New Contact Form Submission: ${formData.subject}`,
            html: `
                <h2>New Contact Form Submission</h2>
                <p><strong>Name:</strong> ${formData.name}</p>
                <p><strong>Email:</strong> ${formData.email}</p>
                <p><strong>Subject:</strong> ${formData.subject}</p>
                <p><strong>Message:</strong></p>
                <p>${formData.message}</p>
                <hr>
                <small>Received at: ${new Date().toLocaleString()}</small>
            `
        };

        try {
            // Send email
            await sgMail.send(msg);
            console.log('Contact form email sent successfully');
            
            // Optionally, update the submission status
            return snapshot.ref.update({ 
                emailSent: true, 
                emailSentAt: admin.firestore.FieldValue.serverTimestamp() 
            });
        } catch (error) {
            console.error('Error sending email:', error);
            
            // Log the error to Firestore
            return snapshot.ref.update({ 
                emailError: error.toString(),
                emailSent: false 
            });
        }
    });
