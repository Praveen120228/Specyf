// Main JavaScript file
document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu functionality
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('nav ul');

    if (hamburger) {
        hamburger.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            hamburger.classList.toggle('active');
        });
    }

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Add animation on scroll
    const animateOnScroll = function() {
        const elements = document.querySelectorAll('.feature-card');
        elements.forEach(element => {
            const elementPosition = element.getBoundingClientRect().top;
            const screenPosition = window.innerHeight;
            
            if (elementPosition < screenPosition) {
                element.classList.add('animate');
            }
        });
    };

    window.addEventListener('scroll', animateOnScroll);

    // Form validation
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            let isValid = true;
            const inputs = form.querySelectorAll('input[required], textarea[required]');
            
            inputs.forEach(input => {
                if (!input.value.trim()) {
                    isValid = false;
                    showError(input, 'This field is required');
                } else {
                    clearError(input);
                }

                if (input.type === 'email' && !validateEmail(input.value)) {
                    isValid = false;
                    showError(input, 'Please enter a valid email address');
                }
            });

            if (isValid) {
                // Submit form to backend
                const formData = new FormData(form);
                const endpoint = form.getAttribute('action') || '/api/' + form.id;
                
                fetch(endpoint, {
                    method: 'POST',
                    body: JSON.stringify(Object.fromEntries(formData)),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        showMessage('Success!', 'success');
                        form.reset();
                    } else {
                        showMessage('Something went wrong. Please try again.', 'error');
                    }
                })
                .catch(error => {
                    showMessage('An error occurred. Please try again later.', 'error');
                });
            }
        });
    });

    // Form Validation
    function validateForm(formId) {
        const form = document.getElementById(formId);
        if (!form) return;

        form.addEventListener('submit', function(e) {
            e.preventDefault();
            let isValid = true;
            const formData = new FormData(form);

            // Clear previous error messages
            form.querySelectorAll('.error-message').forEach(el => el.remove());

            // Validate each field
            for (let [key, value] of formData.entries()) {
                const input = form.querySelector(`[name="${key}"]`);
                if (!input) continue;

                // Remove previous error styling
                input.classList.remove('error');

                // Required field validation
                if (input.hasAttribute('required') && !value.trim()) {
                    showError(input, 'This field is required');
                    isValid = false;
                    continue;
                }

                // Email validation
                if (input.type === 'email' && value.trim()) {
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(value)) {
                        showError(input, 'Please enter a valid email address');
                        isValid = false;
                    }
                }

                // Password validation
                if (input.type === 'password' && formId === 'signup-form') {
                    if (value.length < 8) {
                        showError(input, 'Password must be at least 8 characters long');
                        isValid = false;
                    } else if (!/[A-Z]/.test(value)) {
                        showError(input, 'Password must contain at least one uppercase letter');
                        isValid = false;
                    } else if (!/[a-z]/.test(value)) {
                        showError(input, 'Password must contain at least one lowercase letter');
                        isValid = false;
                    } else if (!/[0-9]/.test(value)) {
                        showError(input, 'Password must contain at least one number');
                        isValid = false;
                    }
                }

                // Confirm password validation
                if (key === 'confirmPassword') {
                    const password = formData.get('password');
                    if (value !== password) {
                        showError(input, 'Passwords do not match');
                        isValid = false;
                    }
                }
            }

            if (isValid) {
                // Show success message
                showNotification('Success!', formId === 'signup-form' ? 'Account created successfully!' : 'Login successful!', 'success');
                
                // Simulate form submission
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 2000);
            }
        });
    }

    // Show error message under input field
    function showError(input, message) {
        input.classList.add('error');
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        input.parentNode.appendChild(errorDiv);
    }

    // Password visibility toggle
    function setupPasswordToggles() {
        document.querySelectorAll('.toggle-password').forEach(toggle => {
            toggle.addEventListener('click', function() {
                const input = this.previousElementSibling;
                const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
                input.setAttribute('type', type);
                this.classList.toggle('fa-eye');
                this.classList.toggle('fa-eye-slash');
            });
        });
    }

    // Notification system
    function showNotification(title, message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <h4>${title}</h4>
            <p>${message}</p>
        `;
        document.body.appendChild(notification);

        // Remove notification after 5 seconds
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 5000);
    }

    // Smooth scroll animation
    function setupSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    // Add animation on scroll
    function setupScrollAnimations() {
        const elements = document.querySelectorAll('.animate-on-scroll');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animated');
                }
            });
        }, { threshold: 0.1 });

        elements.forEach(element => {
            observer.observe(element);
        });
    }

    // Initialize all features
    validateForm('login-form');
    validateForm('signup-form');
    validateForm('contact-form');

    setupPasswordToggles();

    setupSmoothScroll();

    setupScrollAnimations();

    // Helper functions
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    function showMessage(message, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.textContent = message;
        document.body.appendChild(messageDiv);
        
        setTimeout(() => {
            messageDiv.remove();
        }, 3000);
    }

    function clearError(input) {
        const formGroup = input.closest('.form-group');
        const error = formGroup.querySelector('.error-message');
        if (error) {
            error.remove();
        }
        input.classList.remove('error');
    }

    // Add CSS for notifications and animations
    const style = document.createElement('style');
    style.textContent = `
        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 25px;
            border-radius: 5px;
            background: white;
            box-shadow: 0 3px 10px rgba(0,0,0,0.1);
            z-index: 1000;
            animation: slideIn 0.3s ease-out;
        }

        .notification.success {
            border-left: 4px solid #4CAF50;
        }

        .notification.error {
            border-left: 4px solid #f44336;
        }

        .notification.fade-out {
            animation: slideOut 0.3s ease-out forwards;
        }

        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }

        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }

        .error-message {
            color: #f44336;
            font-size: 0.8rem;
            margin-top: 5px;
        }

        input.error {
            border-color: #f44336 !important;
        }

        .animate-on-scroll {
            opacity: 0;
            transform: translateY(20px);
            transition: all 0.6s ease-out;
        }

        .animate-on-scroll.animated {
            opacity: 1;
            transform: translateY(0);
        }
    `;
    document.head.appendChild(style);
});
