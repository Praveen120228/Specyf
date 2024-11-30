// Initialize EmailJS with your public key
(function() {
    emailjs.init("YOUR_PUBLIC_KEY"); // Replace with your actual EmailJS public key
})();

// Function to show success/error message
function showMessage(message, isError = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `alert ${isError ? 'alert-error' : 'alert-success'}`;
    messageDiv.textContent = message;
    
    const form = document.getElementById('contactForm');
    form.parentNode.insertBefore(messageDiv, form);
    
    setTimeout(() => {
        messageDiv.remove();
    }, 5000);
}

// Function to handle form submission
function handleSubmit(event) {
    event.preventDefault();
    
    // Basic form validation
    if (!validateForm(event)) {
        return;
    }
    
    // Get form data
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const subject = document.getElementById('subject').value;
    const message = document.getElementById('message').value;
    
    // Show loading state
    const submitBtn = document.querySelector('.submit-btn');
    const originalBtnText = submitBtn.textContent;
    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;
    
    // Send email using EmailJS
    emailjs.send(
        'YOUR_SERVICE_ID', // Replace with your EmailJS service ID
        'YOUR_TEMPLATE_ID', // Replace with your EmailJS template ID
        {
            from_name: name,
            from_email: email,
            subject: subject,
            message: message,
            to_email: 'specyf.contact@gmail.com'
        }
    ).then(
        function(response) {
            showMessage('Message sent successfully! We\'ll get back to you soon.');
            document.getElementById('contactForm').reset();
        },
        function(error) {
            showMessage('Failed to send message. Please try again later.', true);
            console.error('EmailJS Error:', error);
        }
    ).finally(() => {
        submitBtn.textContent = originalBtnText;
        submitBtn.disabled = false;
    });
}

// Form validation function
function validateForm(event) {
    let isValid = true;
    
    // Reset error messages
    document.querySelectorAll('.error-message').forEach(error => error.textContent = '');
    
    // Name validation
    const name = document.getElementById('name').value.trim();
    if (name.length < 2) {
        document.getElementById('nameError').textContent = 'Name must be at least 2 characters long';
        isValid = false;
    }
    
    // Email validation
    const email = document.getElementById('email').value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        document.getElementById('emailError').textContent = 'Please enter a valid email address';
        isValid = false;
    }
    
    // Subject validation
    const subject = document.getElementById('subject').value.trim();
    if (subject.length < 3) {
        document.getElementById('subjectError').textContent = 'Subject must be at least 3 characters long';
        isValid = false;
    }
    
    // Message validation
    const message = document.getElementById('message').value.trim();
    if (message.length < 10) {
        document.getElementById('messageError').textContent = 'Message must be at least 10 characters long';
        isValid = false;
    }
    
    return isValid;
}

// Attach submit handler to the form
document.getElementById('contactForm').addEventListener('submit', handleSubmit);
