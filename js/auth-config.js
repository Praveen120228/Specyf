// Secure Authentication Module with Local Storage
import { 
    app, 
    auth, 
    db, 
    FirebaseAuth,
    handleFirebaseError 
} from './firebase-config.js';

// Login Validation Service
const LoginValidationService = {
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new Error('Invalid email format');
        }
    },

    validatePassword(password) {
        if (!password || password.length < 8) {
            throw new Error('Password must be at least 8 characters');
        }
    },

    validateLoginCredentials(email, password) {
        this.validateEmail(email);
        this.validatePassword(password);
    }
};

// Signup Validation Service
const SignupValidationService = {
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new Error('Invalid email format');
        }
    },

    validatePassword(password) {
        if (!password || password.length < 8) {
            throw new Error('Password must be at least 8 characters');
        }
    },

    validateFullName(name) {
        if (!name || name.trim().length < 2) {
            throw new Error('Full name is required');
        }
    },

    validateSignupData(data) {
        const errors = {};
        
        // Validate user type
        if (!data.userType) {
            errors.userType = 'Please select a user type';
        }

        // Validate full name
        try {
            this.validateFullName(data.fullName);
        } catch (error) {
            errors.fullName = error.message;
        }

        // Validate email
        try {
            this.validateEmail(data.email);
        } catch (error) {
            errors.email = error.message;
        }

        // Validate password
        try {
            this.validatePassword(data.password);
        } catch (error) {
            errors.password = error.message;
        }

        // Validate password confirmation
        if (data.password !== data.confirmPassword) {
            errors.confirmPassword = 'Passwords do not match';
        }

        // Validate terms agreement
        if (!data.termsAgreed) {
            errors.terms = 'You must agree to the terms and conditions';
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    }
};

// Login Submission Handler
async function handleLoginSubmission(event) {
    event.preventDefault();
    
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const loginError = document.getElementById('login-error');

    try {
        // Validate credentials
        LoginValidationService.validateLoginCredentials(emailInput.value, passwordInput.value);

        // Attempt login with Firebase
        const result = await FirebaseAuth.signInUser(emailInput.value, passwordInput.value);
        
        // Redirect based on user type
        const userType = result.userData?.userType || 'default';
        window.location.href = `/${userType}-dashboard.html`;

    } catch (error) {
        loginError.textContent = error.message;
        loginError.style.color = 'red';
        console.error('Login Error:', error);
    }
}

// Signup Submission Handler
async function handleSignupSubmission(event) {
    event.preventDefault();
    
    const form = event.target;
    const userTypeSelect = document.getElementById('user-type');
    const fullNameInput = document.getElementById('full-name');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    const termsCheckbox = document.getElementById('terms');
    const signupError = document.getElementById('signup-error');

    // Collect form data
    const signupData = {
        userType: userTypeSelect.value,
        fullName: fullNameInput.value.trim(),
        email: emailInput.value.trim(),
        password: passwordInput.value,
        confirmPassword: confirmPasswordInput.value,
        termsAgreed: termsCheckbox.checked
    };

    try {
        // Validate signup data
        const validationResult = SignupValidationService.validateSignupData(signupData);
        
        if (!validationResult.isValid) {
            Object.entries(validationResult.errors).forEach(([field, message]) => {
                const errorElement = document.getElementById(`${field}-error`);
                if (errorElement) {
                    errorElement.textContent = message;
                }
            });
            return;
        }

        // Register user with Firebase
        await FirebaseAuth.registerUser(
            signupData.email, 
            signupData.password, 
            {
                userType: signupData.userType,
                fullName: signupData.fullName
            }
        );

        signupError.textContent = 'Account created successfully!';
        signupError.style.color = 'green';

        // Redirect to login
        setTimeout(() => {
            window.location.href = '/login.html';
        }, 1500);

    } catch (error) {
        signupError.textContent = error.message || 'Signup failed. Please try again.';
        signupError.style.color = 'red';
        console.error('Signup Error:', error);
    }
}

// Add form validation on page load
document.addEventListener('DOMContentLoaded', () => {
    // Setup login form
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLoginSubmission);
    }

    // Setup signup form
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        signupForm.addEventListener('submit', handleSignupSubmission);
    }
});

// Export the handler functions
export { handleLoginSubmission, handleSignupSubmission };