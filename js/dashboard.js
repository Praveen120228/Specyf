// Dashboard Functionality
import authService from './auth-service.js';

class DashboardManager {
    constructor() {
        this.initDashboard();
    }

    async initDashboard() {
        try {
            // Ensure user is authenticated
            if (!authService.isAuthenticated()) {
                window.location.href = '../login.html';
                return;
            }

            // Get user data from local storage
            const userData = JSON.parse(localStorage.getItem('user'));
            if (!userData) {
                console.error('No user data found');
                window.location.href = '../login.html';
                return;
            }

            this.setupUserProfile(userData);
            this.setupSidebar();
            this.setupQuickActions();
            this.setupEventListeners();
            await this.loadDashboardData();
        } catch (error) {
            console.error('Dashboard initialization error:', error);
            authService.logout();
        }
    }

    setupUserProfile(userData) {
        const profileContainer = document.getElementById('user-profile');
        if (profileContainer) {
            const userName = userData.name || userData.email.split('@')[0];
            profileContainer.innerHTML = `
                <img src="../assets/default-avatar.png" 
                     alt="Profile" 
                     class="user-profile-img">
                <div>
                    <h3>${userName}</h3>
                    <p>${userData.userType}</p>
                </div>
            `;
        }
    }

    setupSidebar() {
        // Toggle sidebar on mobile
        const sidebarToggle = document.querySelector('.sidebar-toggle');
        const sidebar = document.querySelector('.sidebar');
        
        if (sidebarToggle && sidebar) {
            sidebarToggle.addEventListener('click', () => {
                sidebar.classList.toggle('collapsed');
            });
        }
    }

    setupQuickActions() {
        const quickActionsContainer = document.querySelector('.quick-actions');
        if (quickActionsContainer) {
            quickActionsContainer.addEventListener('click', (e) => {
                const action = e.target.closest('.action-card');
                if (action) {
                    const actionType = action.dataset.action;
                    this.handleQuickAction(actionType);
                }
            });
        }
    }

    setupEventListeners() {
        // Logout button
        const logoutBtn = document.getElementById('sign-out-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                authService.logout();
            });
        }
    }

    async loadDashboardData() {
        // Simulate loading dashboard data
        const dashboardCards = document.querySelectorAll('.dashboard-card');
        dashboardCards.forEach(card => {
            card.classList.remove('loading');
        });
    }

    handleQuickAction(actionType) {
        switch(actionType) {
            case 'profile':
                window.location.href = 'profile.html';
                break;
            case 'messages':
                window.location.href = 'messages.html';
                break;
            case 'settings':
                window.location.href = 'settings.html';
                break;
            default:
                console.log('Unknown action:', actionType);
        }
    }
}

// Initialize dashboard for each page
document.addEventListener('DOMContentLoaded', () => {
    new DashboardManager();
});
