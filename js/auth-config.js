// Base URL for GitHub Pages
const BASE_URL = '/Specyf';

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
    },

    validateFullName(name) {
        if (!name || name.trim().length < 2) {
            throw new Error('Full name is required');
        }
    },

    validateSignupData(data) {
        const { email, password, fullName, userType } = data;
        
        // Basic validation
        if (!email || !password || !fullName || !userType) {
            throw new Error('All fields are required');
        }

        // Validate email
        this.validateEmail(email);

        // Validate password
        this.validatePassword(password);

        // Validate full name
        this.validateFullName(fullName);

        // Validate user type
        const validUserTypes = ['employee', 'company', 'startup', 'freelancer', 'recruitment'];
        if (!validUserTypes.includes(userType.toLowerCase())) {
            throw new Error('Invalid user type');
        }

        return true;
    }
};

// Login Submission Handler
async function handleLoginSubmission(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const loginError = document.getElementById('login-error');
    const loginButton = event.target.querySelector('button[type="submit"]');

    try {
        // Disable login button
        loginButton.disabled = true;
        loginButton.innerHTML = 'Logging in...';
        
        // Clear previous errors
        loginError.textContent = '';
        
        // Validate credentials
        LoginValidationService.validateLoginCredentials(email, password);
        
        // Call auth service to login
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Login failed');
        }

        const data = await response.json();
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        // Redirect to appropriate dashboard
        const dashboardPath = `/dashboard/${data.user.type.toLowerCase()}-dashboard.html`;
        window.location.href = dashboardPath;

    } catch (error) {
        loginError.textContent = error.message;
        console.error('Login error:', error);
    } finally {
        loginButton.disabled = false;
        loginButton.innerHTML = 'Login';
    }
}

// Signup Submission Handler
async function handleSignupSubmission(event) {
    event.preventDefault();
    
    const formData = {
        email: document.getElementById('email').value,
        password: document.getElementById('password').value,
        fullName: document.getElementById('fullName').value,
        userType: document.querySelector('input[name="userType"]:checked')?.value
    };
    
    const signupError = document.getElementById('signup-error');
    const signupButton = event.target.querySelector('button[type="submit"]');

    try {
        // Disable signup button
        signupButton.disabled = true;
        signupButton.innerHTML = 'Creating Account...';
        
        // Clear previous errors
        signupError.textContent = '';
        
        // Validate signup data
        LoginValidationService.validateSignupData(formData);
        
        // Call auth service to register
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Registration failed');
        }

        const data = await response.json();
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        // Redirect to appropriate dashboard
        const dashboardPath = `/dashboard/${data.user.type.toLowerCase()}-dashboard.html`;
        window.location.href = dashboardPath;

    } catch (error) {
        signupError.textContent = error.message;
        console.error('Signup error:', error);
    } finally {
        signupButton.disabled = false;
        signupButton.innerHTML = 'Create Account';
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

export { LoginValidationService, handleLoginSubmission, handleSignupSubmission };
