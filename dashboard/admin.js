// Initialize Firebase Authentication and Firestore
const auth = firebase.auth();
const db = firebase.firestore();

// Protected pages that require authentication
const protectedPages = [
    'index.html',
    'settings.html',
    'analytics.html',
    'bookings.html',
    'candidates.html',
    'clients.html',
    'companies.html',
    'jobs.html',
    'book-service.html'
];

// Check if current page is protected
const currentPage = window.location.pathname.split('/').pop();
if (protectedPages.includes(currentPage) && currentPage !== 'login.html') {
    // Check authentication state
    auth.onAuthStateChanged((user) => {
        if (!user) {
            // Redirect to login if not authenticated
            window.location.href = 'login.html';
        } else {
            // User is authenticated, initialize the page
            initializePage(user);
        }
    });
}

// Initialize page based on current URL
function initializePage(user) {
    // Common elements initialization
    initializeCommonElements();
    
    // Page-specific initialization
    switch (currentPage) {
        case 'index.html':
            initializeDashboard(user);
            break;
        case 'settings.html':
            initializeSettings(user);
            break;
        case 'analytics.html':
            initializeAnalytics(user);
            break;
        case 'bookings.html':
            initializeBookings(user);
            break;
        case 'candidates.html':
            initializeCandidates(user);
            break;
        case 'clients.html':
            initializeClients(user);
            break;
        case 'companies.html':
            initializeCompanies(user);
            break;
        case 'jobs.html':
            initializeJobs(user);
            break;
        case 'book-service.html':
            initializeBookService(user);
            break;
    }
}

// Initialize common elements across all pages
function initializeCommonElements() {
    // Initialize sidebar navigation
    const sidebarLinks = document.querySelectorAll('.sidebar a');
    sidebarLinks.forEach(link => {
        const page = link.getAttribute('href').split('/').pop();
        if (page === currentPage) {
            link.classList.add('active');
        }
    });

    // Initialize logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            auth.signOut().then(() => {
                window.location.href = 'login.html';
            });
        });
    }

    // Initialize user info
    const userNameElement = document.querySelector('.user-name');
    if (userNameElement) {
        const user = auth.currentUser;
        userNameElement.textContent = user.displayName || user.email;
    }
}

// Page-specific initializations
function initializeDashboard(user) {
    // Dashboard specific code...
    setupEventListeners();
    loadStatistics();
    loadRecentActivity();
    setupNavigationHandlers();
}

function initializeSettings(user) {
    // Settings specific code is in settings.js
}

function initializeAnalytics(user) {
    // Analytics specific code is in analytics.js
}

function initializeBookings(user) {
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

function initializeCandidates(user) {
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

function initializeClients(user) {
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

function initializeCompanies(user) {
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

function initializeJobs(user) {
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

// CRUD Operations
async function deleteBooking(id) {
    try {
        await db.collection('bookings').doc(id).delete();
        showToast('Booking deleted successfully', 'success');
    } catch (error) {
        showToast('Error deleting booking', 'error');
    }
}

async function deleteCandidate(id) {
    try {
        await db.collection('candidates').doc(id).delete();
        showToast('Candidate deleted successfully', 'success');
    } catch (error) {
        showToast('Error deleting candidate', 'error');
    }
}

async function deleteClient(id) {
    try {
        await db.collection('clients').doc(id).delete();
        showToast('Client deleted successfully', 'success');
    } catch (error) {
        showToast('Error deleting client', 'error');
    }
}

async function deleteCompany(id) {
    try {
        await db.collection('companies').doc(id).delete();
        showToast('Company deleted successfully', 'success');
    } catch (error) {
        showToast('Error deleting company', 'error');
    }
}

async function deleteJob(id) {
    try {
        await db.collection('jobs').doc(id).delete();
        showToast('Job deleted successfully', 'success');
    } catch (error) {
        showToast('Error deleting job', 'error');
    }
}

// Toast notification function
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;

    const container = document.getElementById('toastContainer');
    if (!container) {
        const newContainer = document.createElement('div');
        newContainer.id = 'toastContainer';
        newContainer.className = 'toast-container';
        document.body.appendChild(newContainer);
        newContainer.appendChild(toast);
    } else {
        container.appendChild(toast);
    }

    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Event Listeners Setup
function setupEventListeners() {
    // Logout Handler
    document.getElementById('logoutBtn')?.addEventListener('click', () => {
        firebase.auth().signOut();
    });

    // Navigation Handlers
    document.querySelectorAll('.sidebar nav a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = e.target.closest('a').dataset.page;
            navigateToPage(page);
        });
    });

    // Search Handler
    const searchInput = document.querySelector('.search-bar input');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(handleSearch, 300));
    }
}

// Navigation Handler
function navigateToPage(page) {
    // Remove active class from all links
    document.querySelectorAll('.sidebar nav a').forEach(link => {
        link.classList.remove('active');
    });

    // Add active class to current link
    document.querySelector(`[data-page="${page}"]`)?.classList.add('active');

    // Hide all content sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.style.display = 'none';
    });

    // Show selected content section
    const contentSection = document.getElementById(`${page}Content`);
    if (contentSection) {
        contentSection.style.display = 'block';
        loadPageContent(page);
    }
}

// Load Page Content
async function loadPageContent(page) {
    switch (page) {
        case 'dashboard':
            await loadStatistics();
            await loadRecentActivity();
            break;
        case 'companies':
            await loadCompanies();
            break;
        case 'employees':
            await loadEmployees();
            break;
        case 'jobs':
            await loadJobs();
            break;
        case 'candidates':
            await loadCandidates();
            break;
        case 'settings':
            loadSettings();
            break;
    }
}

// Dashboard Statistics
async function loadStatistics() {
    try {
        const stats = await Promise.all([
            db.collection('companies').get(),
            db.collection('employees').get(),
            db.collection('jobs').where('status', '==', 'active').get(),
            db.collection('candidates').get()
        ]);

        document.getElementById('totalCompanies').textContent = stats[0].size;
        document.getElementById('totalEmployees').textContent = stats[1].size;
        document.getElementById('activeJobs').textContent = stats[2].size;
        document.getElementById('totalCandidates').textContent = stats[3].size;
    } catch (error) {
        showToast('Error loading statistics: ' + error.message, 'error');
    }
}

// Recent Activity
async function loadRecentActivity() {
    try {
        const activityList = document.getElementById('recentActivity');
        if (!activityList) return;

        const activities = await db.collection('activities')
            .orderBy('timestamp', 'desc')
            .limit(5)
            .get();

        activityList.innerHTML = '';
        activities.forEach(doc => {
            const activity = doc.data();
            activityList.innerHTML += `
                <div class="activity-item">
                    <i class="fas ${getActivityIcon(activity.type)}"></i>
                    <div class="activity-details">
                        <p>${activity.description}</p>
                        <small>${formatTimestamp(activity.timestamp)}</small>
                    </div>
                </div>
            `;
        });
    } catch (error) {
        showToast('Error loading activities: ' + error.message, 'error');
    }
}

// Company Management
async function loadCompanies() {
    try {
        const companies = await db.collection('companies')
            .orderBy('createdAt', 'desc')
            .get();

        const tableBody = document.getElementById('companiesTableBody');
        if (!tableBody) return;

        tableBody.innerHTML = '';
        companies.forEach(doc => {
            const company = doc.data();
            tableBody.innerHTML += `
                <tr>
                    <td>${escapeHtml(company.name)}</td>
                    <td>${escapeHtml(company.industry)}</td>
                    <td>${company.size}</td>
                    <td>${escapeHtml(company.location)}</td>
                    <td>
                        <button onclick="editCompany('${doc.id}')" class="edit-btn">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="deleteCompany('${doc.id}')" class="delete-btn">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        });
    } catch (error) {
        showToast('Error loading companies: ' + error.message, 'error');
    }
}

async function addCompany(data) {
    try {
        const docRef = await db.collection('companies').add({
            ...data,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            createdBy: currentUser.uid
        });

        await addActivity('company_added', `New company added: ${data.name}`);
        showToast('Company added successfully!', 'success');
        return docRef.id;
    } catch (error) {
        showToast('Error adding company: ' + error.message, 'error');
        throw error;
    }
}

// Employee Management
async function loadEmployees() {
    try {
        const employees = await db.collection('employees')
            .orderBy('createdAt', 'desc')
            .get();

        const tableBody = document.getElementById('employeesTableBody');
        if (!tableBody) return;

        tableBody.innerHTML = '';
        employees.forEach(doc => {
            const employee = doc.data();
            tableBody.innerHTML += `
                <tr>
                    <td>${escapeHtml(employee.name)}</td>
                    <td>${escapeHtml(employee.email)}</td>
                    <td>${escapeHtml(employee.phone)}</td>
                    <td>${escapeHtml(employee.department)}</td>
                    <td>
                        <button onclick="editEmployee('${doc.id}')" class="edit-btn">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="deleteEmployee('${doc.id}')" class="delete-btn">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        });
    } catch (error) {
        showToast('Error loading employees: ' + error.message, 'error');
    }
}

async function addEmployee(data) {
    try {
        const docRef = await db.collection('employees').add({
            ...data,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            createdBy: currentUser.uid
        });

        await addActivity('employee_added', `New employee added: ${data.name}`);
        showToast('Employee added successfully!', 'success');
        return docRef.id;
    } catch (error) {
        showToast('Error adding employee: ' + error.message, 'error');
        throw error;
    }
}

// Activity Logging
async function addActivity(type, description) {
    try {
        await db.collection('activities').add({
            type,
            description,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            userId: currentUser.uid
        });
    } catch (error) {
        console.error('Error logging activity:', error);
    }
}

// Utility Functions
function getActivityIcon(type) {
    const icons = {
        company_added: 'fa-building',
        employee_added: 'fa-user',
        job_added: 'fa-briefcase',
        candidate_added: 'fa-user-tie',
        default: 'fa-info-circle'
    };
    return icons[type] || icons.default;
}

function getToastIcon(type) {
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        info: 'fa-info-circle',
        warning: 'fa-exclamation-triangle'
    };
    return icons[type] || icons.info;
}

function formatTimestamp(timestamp) {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    return new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(
        Math.round((date - new Date()) / (1000 * 60 * 60 * 24)),
        'day'
    );
}

function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Search Functionality
async function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    if (searchTerm.length < 2) return;

    try {
        const results = await Promise.all([
            searchCompanies(searchTerm),
            searchEmployees(searchTerm),
            searchJobs(searchTerm)
        ]);

        // Update UI with search results
        displaySearchResults(results.flat());
    } catch (error) {
        showToast('Error performing search: ' + error.message, 'error');
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

// Initialize the dashboard when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Check authentication state
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            currentUser = user;
            initializeDashboard();
        } else {
            window.location.href = 'login.html';
        }
    });
});
