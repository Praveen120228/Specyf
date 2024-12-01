// Initialize Firebase
let db;
let auth;

// Firebase Authentication State
let currentUser = null;

document.addEventListener('DOMContentLoaded', function() {
    // Initialize Firebase
    const app = firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
    auth = firebase.auth();

    // Initialize Firebase Auth
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            currentUser = user;
            updateUIForAuthenticatedUser();
        } else {
            // Redirect to login if not on login page
            if (!window.location.pathname.includes('login.html')) {
                window.location.href = 'login.html';
            }
        }
    });

    // Get current page
    const currentPage = window.location.pathname.split('/').pop();
    
    // Skip auth check for login page
    if (currentPage === 'login.html') {
        initializeLoginPage();
        return;
    }

    // Check authentication for other pages
    auth.onAuthStateChanged(function(user) {
        if (user) {
            // User is signed in
            initializeUI(user);
        } else {
            // No user is signed in, redirect to login
            window.location.href = 'login.html';
        }
    });

    // Initialize sidebar navigation
    initializeSidebar();

    // Initialize logout functionality
    initializeLogout();

    // Navigation Handling
    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', (e) => {
            const currentPage = window.location.pathname.split('/').pop();
            const targetPage = link.getAttribute('href');
            
            if (currentPage === targetPage) {
                e.preventDefault();
            }
        });
    });

    // Stats Counter Animation
    function animateValue(element, start, end, duration) {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const value = Math.floor(progress * (end - start) + start);
            element.textContent = value;
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }

    // Update Stats
    function updateStats() {
        // In a real application, these would be fetched from Firebase
        const stats = {
            totalCompanies: 0,
            activeCompanies: 0,
            totalJobs: 0,
            totalHires: 0
        };

        // Animate the counters
        document.querySelectorAll('.stat-card h3').forEach((element, index) => {
            const values = Object.values(stats);
            animateValue(element, 0, values[index], 1000);
        });
    }

    // Search Functionality
    const searchInput = document.querySelector('.search-bar input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            // Implement search logic here
        });
    }

    // Add Company Button
    const addCompanyBtn = document.querySelector('.add-button');
    if (addCompanyBtn) {
        addCompanyBtn.addEventListener('click', () => {
            // Implement add company logic here
            console.log('Add company clicked');
        });
    }

    // Initialize the page
    function initializePage() {
        const currentPage = window.location.pathname.split('/').pop();
        
        // Update active navigation item
        document.querySelectorAll('.nav-menu a').forEach(link => {
            if (link.getAttribute('href') === currentPage) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });

        // Update stats if on companies page
        if (currentPage === 'companies.html') {
            updateStats();
        }
    }

    // Call initialize when DOM is loaded
    document.addEventListener('DOMContentLoaded', initializePage);
});

function initializeUI(user) {
    // Update user profile info
    const userDisplayName = document.getElementById('userDisplayName');
    if (userDisplayName) {
        userDisplayName.textContent = user.displayName || 'Admin User';
    }

    // Load page-specific content
    const currentPage = getCurrentPage();
    loadPageContent(currentPage);
}

function getCurrentPage() {
    const path = window.location.pathname;
    const page = path.split('/').pop().replace('.html', '');
    return page || 'index';
}

function initializeSidebar() {
    // Add click event listeners to sidebar links
    const sidebarLinks = document.querySelectorAll('.nav-item, .nav-link');
    sidebarLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const page = this.getAttribute('data-page');
            navigateToPage(page);
        });
    });

    // Highlight active link
    const currentPage = getCurrentPage();
    sidebarLinks.forEach(link => {
        const linkPage = link.getAttribute('data-page');
        if (linkPage === currentPage) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

function navigateToPage(page) {
    const pageMap = {
        'dashboard': 'index.html',
        'companies': 'companies.html',
        'candidates': 'candidates.html',
        'analytics': 'analytics.html',
        'settings': 'settings.html'
    };

    const url = pageMap[page] || 'index.html';
    window.location.href = url;
}

function initializeLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            auth.signOut().then(() => {
                // Sign-out successful, redirect to login
                window.location.href = 'login.html';
            }).catch((error) => {
                console.error('Error signing out:', error);
                showNotification('Error signing out. Please try again.', 'error');
            });
        });
    }
}

function loadPageContent(page) {
    switch(page) {
        case 'index':
            loadDashboardContent();
            break;
        case 'companies':
            loadCompaniesContent();
            break;
        case 'candidates':
            loadCandidatesContent();
            break;
        case 'jobs':
            loadJobsContent();
            break;
        case 'analytics':
            loadAnalyticsContent();
            break;
        case 'settings':
            loadSettingsContent();
            break;
        case 'bookings':
            initializeBookings();
            break;
        case 'clients':
            initializeClients();
            break;
        case 'companies':
            initializeCompanies();
            break;
        case 'jobs':
            initializeJobs();
            break;
        case 'book-service':
            initializeBookService();
            break;
    }
}

// Show notification
function showNotification(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    const toastContainer = document.querySelector('.toast-container');
    if (toastContainer) {
        toastContainer.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('fade-out');
            setTimeout(() => toast.remove(), 500);
        }, 3000);
    }
}

// Page-specific content loading functions
function loadDashboardContent() {
    // Load dashboard statistics and charts
    console.log('Loading dashboard content...');
}

function loadCompaniesContent() {
    // Load companies list and data
    console.log('Loading companies content...');
}

function loadCandidatesContent() {
    // Load candidates list and data
    console.log('Loading candidates content...');
}

function loadJobsContent() {
    // Load jobs list and data
    console.log('Loading jobs content...');
}

function loadAnalyticsContent() {
    // Load analytics data and charts
    console.log('Loading analytics content...');
}

function loadSettingsContent() {
    // Load user settings
    console.log('Loading settings content...');
}

// CRUD Operations
async function deleteBooking(id) {
    try {
        await db.collection('bookings').doc(id).delete();
        showNotification('Booking deleted successfully', 'success');
    } catch (error) {
        showNotification('Error deleting booking', 'error');
    }
}

async function deleteCandidate(id) {
    try {
        await db.collection('candidates').doc(id).delete();
        showNotification('Candidate deleted successfully', 'success');
    } catch (error) {
        showNotification('Error deleting candidate', 'error');
    }
}

async function deleteClient(id) {
    try {
        await db.collection('clients').doc(id).delete();
        showNotification('Client deleted successfully', 'success');
    } catch (error) {
        showNotification('Error deleting client', 'error');
    }
}

async function deleteCompany(id) {
    try {
        await db.collection('companies').doc(id).delete();
        showNotification('Company deleted successfully', 'success');
    } catch (error) {
        showNotification('Error deleting company', 'error');
    }
}

async function deleteJob(id) {
    try {
        await db.collection('jobs').doc(id).delete();
        showNotification('Job deleted successfully', 'success');
    } catch (error) {
        showNotification('Error deleting job', 'error');
    }
}

// Initialize page-specific content
function initializeBookings() {
    // Bookings initialization
    const bookingsTable = document.querySelector('.bookings-table tbody');
    if (bookingsTable) {
        db.collection('bookings')
            .orderBy('date', 'desc')
            .limit(10)
            .onSnapshot((snapshot) => {
                bookingsTable.innerHTML = '';
                snapshot.forEach((doc) => {
                    const booking = doc.data();
                    bookingsTable.innerHTML += `
                        <tr>
                            <td>${booking.clientName}</td>
                            <td>${booking.service}</td>
                            <td>${new Date(booking.date).toLocaleDateString()}</td>
                            <td>${booking.status}</td>
                            <td>
                                <button onclick="updateBooking('${doc.id}')">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button onclick="deleteBooking('${doc.id}')">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </td>
                        </tr>
                    `;
                });
            });
    }
}

function initializeCandidates() {
    // Candidates initialization
    const candidatesTable = document.querySelector('.candidates-table tbody');
    if (candidatesTable) {
        db.collection('candidates')
            .orderBy('appliedDate', 'desc')
            .limit(10)
            .onSnapshot((snapshot) => {
                candidatesTable.innerHTML = '';
                snapshot.forEach((doc) => {
                    const candidate = doc.data();
                    candidatesTable.innerHTML += `
                        <tr>
                            <td>${candidate.name}</td>
                            <td>${candidate.position}</td>
                            <td>${candidate.status}</td>
                            <td>${new Date(candidate.appliedDate).toLocaleDateString()}</td>
                            <td>
                                <button onclick="viewCandidate('${doc.id}')">
                                    <i class="fas fa-eye"></i>
                                </button>
                                <button onclick="deleteCandidate('${doc.id}')">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </td>
                        </tr>
                    `;
                });
            });
    }
}

function initializeClients() {
    // Clients initialization
    const clientsTable = document.querySelector('.clients-table tbody');
    if (clientsTable) {
        db.collection('clients')
            .orderBy('joinDate', 'desc')
            .limit(10)
            .onSnapshot((snapshot) => {
                clientsTable.innerHTML = '';
                snapshot.forEach((doc) => {
                    const client = doc.data();
                    clientsTable.innerHTML += `
                        <tr>
                            <td>${client.name}</td>
                            <td>${client.email}</td>
                            <td>${client.phone}</td>
                            <td>${new Date(client.joinDate).toLocaleDateString()}</td>
                            <td>
                                <button onclick="editClient('${doc.id}')">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button onclick="deleteClient('${doc.id}')">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </td>
                        </tr>
                    `;
                });
            });
    }
}

function initializeCompanies() {
    // Companies initialization
    const companiesTable = document.querySelector('.companies-table tbody');
    if (companiesTable) {
        db.collection('companies')
            .orderBy('joinDate', 'desc')
            .limit(10)
            .onSnapshot((snapshot) => {
                companiesTable.innerHTML = '';
                snapshot.forEach((doc) => {
                    const company = doc.data();
                    companiesTable.innerHTML += `
                        <tr>
                            <td>${company.name}</td>
                            <td>${company.industry}</td>
                            <td>${company.location}</td>
                            <td>${new Date(company.joinDate).toLocaleDateString()}</td>
                            <td>
                                <button onclick="editCompany('${doc.id}')">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button onclick="deleteCompany('${doc.id}')">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </td>
                        </tr>
                    `;
                });
            });
    }
}

function initializeJobs() {
    // Jobs initialization
    const jobsTable = document.querySelector('.jobs-table tbody');
    if (jobsTable) {
        db.collection('jobs')
            .orderBy('postDate', 'desc')
            .limit(10)
            .onSnapshot((snapshot) => {
                jobsTable.innerHTML = '';
                snapshot.forEach((doc) => {
                    const job = doc.data();
                    jobsTable.innerHTML += `
                        <tr>
                            <td>${job.title}</td>
                            <td>${job.company}</td>
                            <td>${job.location}</td>
                            <td>${new Date(job.postDate).toLocaleDateString()}</td>
                            <td>
                                <button onclick="editJob('${doc.id}')">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button onclick="deleteJob('${doc.id}')">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </td>
                        </tr>
                    `;
                });
            });
    }
}

function initializeBookService() {
    // Book Service initialization
    const bookServiceTable = document.querySelector('.book-service-table tbody');
    if (bookServiceTable) {
        db.collection('book-service')
            .orderBy('date', 'desc')
            .limit(10)
            .onSnapshot((snapshot) => {
                bookServiceTable.innerHTML = '';
                snapshot.forEach((doc) => {
                    const bookService = doc.data();
                    bookServiceTable.innerHTML += `
                        <tr>
                            <td>${bookService.clientName}</td>
                            <td>${bookService.service}</td>
                            <td>${new Date(bookService.date).toLocaleDateString()}</td>
                            <td>${bookService.status}</td>
                            <td>
                                <button onclick="updateBookService('${doc.id}')">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button onclick="deleteBookService('${doc.id}')">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </td>
                        </tr>
                    `;
                });
            });
    }
}

function initializeLoginPage() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            try {
                await auth.signInWithEmailAndPassword(email, password);
                window.location.href = 'index.html';
            } catch (error) {
                showNotification(error.message, 'error');
            }
        });
    }
}

// Add rate limiting utilities
let lastLoginAttempt = 0;
const LOGIN_COOLDOWN = 30000; // 30 seconds cooldown
let loginAttempts = 0;
const MAX_LOGIN_ATTEMPTS = 5;
const LOGIN_BLOCK_DURATION = 15 * 60 * 1000; // 15 minutes
let loginBlockedUntil = 0;

function checkLoginRateLimit() {
    const now = Date.now();
    
    // Check if user is temporarily blocked
    if (now < loginBlockedUntil) {
        const minutesLeft = Math.ceil((loginBlockedUntil - now) / 60000);
        throw new Error(`Too many login attempts. Please try again in ${minutesLeft} minutes.`);
    }

    // Check cooldown between attempts
    if (now - lastLoginAttempt < LOGIN_COOLDOWN) {
        const secondsLeft = Math.ceil((LOGIN_COOLDOWN - (now - lastLoginAttempt)) / 1000);
        throw new Error(`Please wait ${secondsLeft} seconds before trying again.`);
    }

    // Check maximum attempts
    if (loginAttempts >= MAX_LOGIN_ATTEMPTS) {
        loginBlockedUntil = now + LOGIN_BLOCK_DURATION;
        loginAttempts = 0;
        throw new Error('Too many login attempts. Please try again in 15 minutes.');
    }

    lastLoginAttempt = now;
    loginAttempts++;
}

// Update login function with rate limiting
async function handleLogin(email, password) {
    try {
        checkLoginRateLimit();

        const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
        
        // Reset attempts on successful login
        loginAttempts = 0;
        loginBlockedUntil = 0;
        
        return userCredential;
    } catch (error) {
        console.error('Login error:', error);
        
        if (error.code === 'auth/too-many-requests') {
            loginBlockedUntil = Date.now() + LOGIN_BLOCK_DURATION;
            throw new Error('Account temporarily locked due to too many login attempts. Please try again in 15 minutes.');
        } else if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
            throw new Error('Invalid email or password.');
        } else if (error.message.includes('try again in')) {
            throw error;
        } else {
            throw new Error('Login failed. Please try again later.');
        }
    }
}

// Update login form submission
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const errorDiv = document.getElementById('error-message');
        const loginButton = document.querySelector('button[type="submit"]');
        
        try {
            loginButton.disabled = true;
            loginButton.textContent = 'Logging in...';
            
            await handleLogin(email, password);
            
            // Redirect on success
            window.location.href = 'index.html';
        } catch (error) {
            errorDiv.textContent = error.message;
            errorDiv.style.display = 'block';
            
            // If blocked, disable the login button temporarily
            if (error.message.includes('minutes')) {
                loginButton.disabled = true;
                setTimeout(() => {
                    loginButton.disabled = false;
                    loginButton.textContent = 'Login';
                    errorDiv.style.display = 'none';
                }, LOGIN_BLOCK_DURATION);
            } else {
                loginButton.disabled = false;
                loginButton.textContent = 'Login';
            }
        }
    });
}
