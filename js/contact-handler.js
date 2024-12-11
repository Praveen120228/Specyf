// Email notification using EmailJS

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
            resolve();
        } else {
            const script = document.createElement('script');
            script.src = 'https://cdn.emailjs.com/dist/email.min.js';
            script.onload = () => {
                console.log('EmailJS script loaded');
                resolve();
            };
            script.onerror = () => {
                reject(new Error('Failed to load EmailJS script'));
            };
            document.head.appendChild(script);
        }
    });
}

// Contact form submission handler
async function submitContactForm(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);

    try {
        await loadEmailJS();
        // Use EmailJS to send the email
        const response = await emailjs.send(EMAILJS_CONFIG.serviceID, EMAILJS_CONFIG.templateID, data, EMAILJS_CONFIG.publicKey);
        console.log('Email sent successfully:', response);
        alert('Your message has been sent!');
        form.reset(); // Reset form after submission
    } catch (error) {
        console.error('Error sending email:', error);
        alert('Failed to send your message. Please try again later.');
    }
}

// Add event listener when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', submitContactForm);
    }
});
