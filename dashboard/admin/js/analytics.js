// Initialize Firebase references
let db;
let auth;

document.addEventListener('DOMContentLoaded', function() {
    // Initialize Firebase
    const app = firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
    auth = firebase.auth();

    // Check authentication
    auth.onAuthStateChanged(function(user) {
        if (user) {
            loadAnalytics();
        } else {
            window.location.href = 'login.html';
        }
    });
});

async function loadAnalytics() {
    try {
        // Load overview statistics
        await loadOverviewStats();
        
        // Initialize charts
        initializeCharts();
        
        // Load recent activities
        await loadRecentActivities();
    } catch (error) {
        console.error("Error loading analytics:", error);
        showNotification('Error loading analytics data', 'error');
    }
}

async function loadOverviewStats() {
    try {
        const [companiesSnapshot, candidatesSnapshot, jobsSnapshot, bookingsSnapshot] = await Promise.all([
            db.collection('companies').get(),
            db.collection('candidates').get(),
            db.collection('jobs').get(),
            db.collection('bookings').get()
        ]);

        // Update statistics
        document.getElementById('totalCompanies').textContent = companiesSnapshot.size;
        document.getElementById('totalCandidates').textContent = candidatesSnapshot.size;
        document.getElementById('totalJobs').textContent = jobsSnapshot.size;
        document.getElementById('totalBookings').textContent = bookingsSnapshot.size;

    } catch (error) {
        console.error("Error loading overview stats:", error);
        throw error;
    }
}

function initializeCharts() {
    // Companies Growth Chart
    const companiesCtx = document.getElementById('companiesGrowthChart').getContext('2d');
    new Chart(companiesCtx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'Companies Growth',
                data: [12, 19, 25, 32, 45, 51],
                borderColor: '#4CAF50',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                }
            }
        }
    });

    // Bookings Distribution Chart
    const bookingsCtx = document.getElementById('bookingsDistributionChart').getContext('2d');
    new Chart(bookingsCtx, {
        type: 'doughnut',
        data: {
            labels: ['Completed', 'Pending', 'Cancelled'],
            datasets: [{
                data: [65, 25, 10],
                backgroundColor: ['#4CAF50', '#FFC107', '#F44336']
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                }
            }
        }
    });
}

async function loadRecentActivities() {
    try {
        const activitiesSnapshot = await db.collection('activities')
            .orderBy('timestamp', 'desc')
            .limit(5)
            .get();

        const activitiesList = document.getElementById('recentActivitiesList');
        activitiesList.innerHTML = '';

        activitiesSnapshot.forEach(doc => {
            const activity = doc.data();
            const li = document.createElement('li');
            li.className = 'activity-item';
            li.innerHTML = `
                <div class="activity-icon ${activity.type}">
                    <i class="fas ${getActivityIcon(activity.type)}"></i>
                </div>
                <div class="activity-details">
                    <p class="activity-text">${activity.description}</p>
                    <span class="activity-time">${formatTimestamp(activity.timestamp)}</span>
                </div>
            `;
            activitiesList.appendChild(li);
        });
    } catch (error) {
        console.error("Error loading recent activities:", error);
        throw error;
    }
}

function getActivityIcon(type) {
    const icons = {
        'booking': 'fa-calendar-check',
        'company': 'fa-building',
        'candidate': 'fa-user',
        'job': 'fa-briefcase'
    };
    return icons[type] || 'fa-info-circle';
}

function formatTimestamp(timestamp) {
    const date = timestamp.toDate();
    return new Intl.RelativeTimeFormat('en', { numeric: 'auto' })
        .format(Math.round((date - new Date()) / (1000 * 60 * 60 * 24)), 'day');
}

function showNotification(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    const toastContainer = document.querySelector('.toast-container');
    toastContainer.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}
