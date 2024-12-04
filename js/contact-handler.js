// Email notification using EmailJS
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getFirestore, collection, addDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBXGGtvn8_Sp5LMaP7TPAyxt8VpcaUwR_0",
    authDomain: "usersdata-6b760.firebaseapp.com",
    projectId: "usersdata-6b760",
    storageBucket: "usersdata-6b760.appspot.com",
    messagingSenderId: "19070397931",
    appId: "1:19070397931:web:0fdb7e6a0c0a3f4d5e8c7b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// EmailJS configuration (free tier)
const EMAILJS_CONFIG = {
    serviceID: 'service_7zyil9vice', // Your service ID
    templateID: 'template_h3j1mng', // Your template ID
    publicKey: 'oc_v4wrOK2XAdXgAS', // Your actual public key
    recipientEmail: 'specyf.contact@gmail.com' // Add your email address
};

// Load EmailJS script
function loadEmailJS() {
    return new Promise((resolve, reject) => {
        if (window.emailjs) {
            console.log('EmailJS already loaded');
            window.emailjs.init(EMAILJS_CONFIG.publicKey);
            resolve();
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js';
        script.onload = () => {
            console.log('EmailJS script loaded successfully');
            try {
                window.emailjs.init(EMAILJS_CONFIG.publicKey);
                console.log('EmailJS initialized with public key');
                resolve();
            } catch (initError) {
                console.error('EmailJS initialization error:', initError);
                reject(initError);
            }
        };
        script.onerror = (error) => {
            console.error('Failed to load EmailJS script:', error);
            reject(error);
        };
        document.head.appendChild(script);
    });
}

// Contact form submission handler
async function submitContactForm(event) {
    event.preventDefault();
    
    const submitButton = document.getElementById('submitButton');
    const formFeedback = document.getElementById('formFeedback');
    
    // Disable submit button
    submitButton.disabled = true;
    submitButton.textContent = 'Sending...';
    formFeedback.style.display = 'none';
    
    try {
        // Load EmailJS if not already loaded
        await loadEmailJS();
        
        // Collect form data
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const subject = document.getElementById('subject').value.trim();
        const message = document.getElementById('message').value.trim();
        
        // Validate inputs
        if (!name || !email || !subject || !message) {
            throw new Error('Please fill out all fields.');
        }
        
        console.log('Preparing to send email with:', {
            serviceID: EMAILJS_CONFIG.serviceID,
            templateID: EMAILJS_CONFIG.templateID,
            recipientEmail: EMAILJS_CONFIG.recipientEmail
        });
        
        // Send email via EmailJS
        try {
            const response = await window.emailjs.send(
                EMAILJS_CONFIG.serviceID, 
                EMAILJS_CONFIG.templateID, 
                {
                    from_name: name,
                    from_email: email,
                    subject: subject,
                    message: message,
                    to_email: EMAILJS_CONFIG.recipientEmail
                }
            );
            
            console.log('EmailJS Send Response:', response);
            
            if (response.status !== 200) {
                throw new Error('Email sending failed');
            }
        } catch (emailError) {
            console.error('Detailed EmailJS Error:', {
                message: emailError.message,
                stack: emailError.stack,
                name: emailError.name
            });
            throw emailError;
        }
        
        // Store submission in Firestore
        await addDoc(collection(db, 'contact_submissions'), {
            name: name,
            email: email,
            subject: subject,
            message: message,
            timestamp: serverTimestamp(),
            status: 'sent'
        });
        
        // Success feedback
        formFeedback.textContent = 'Message sent successfully! We will get back to you soon.';
        formFeedback.className = 'alert alert-success';
        formFeedback.style.display = 'block';
        
        // Reset form
        event.target.reset();
    } catch (error) {
        // Error handling
        console.error('Contact form submission FULL error:', {
            message: error.message,
            stack: error.stack,
            name: error.name
        });
        
        formFeedback.textContent = error.message || 'An error occurred. Please try again.';
        formFeedback.className = 'alert alert-danger';
        formFeedback.style.display = 'block';
    } finally {
        // Re-enable submit button
        submitButton.disabled = false;
        submitButton.textContent = 'Send Message';
    }
}

// Add event listener when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', submitContactForm);
    }
});

export default submitContactForm;
