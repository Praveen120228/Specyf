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
                window.location.href = '/login.html';
                return;
            }

            // Get current user data
            const userData = await authService.getCurrentUserData();
            if (!userData) {
                console.error('Failed to retrieve user data');
                return;
            }

            this.setupUserProfile(userData);
            this.setupSidebar();
            this.setupQuickActions();
        } catch (error) {
            console.error('Dashboard initialization error:', error);
            authService.signOut();
        }
    }

    setupUserProfile(userData) {
        const profileContainer = document.getElementById('user-profile');
        if (profileContainer) {
            profileContainer.innerHTML = `
                <img src="${userData.photoURL || 'assets/default-avatar.png'}" 
                     alt="Profile" 
                     class="user-profile-img">
                <div>
                    <h3>${userData.fullName || 'User'}</h3>
                    <p>${userData.userType || 'User Type'}</p>
                </div>
            `;
        }
    }

    setupSidebar() {
        const sidebar = document.querySelector('.sidebar');
        const sidebarToggle = document.querySelector('.sidebar-toggle');
        const navLinks = document.querySelectorAll('.sidebar-nav a');

        // Highlight current page
        const currentPath = window.location.pathname;
        navLinks.forEach(link => {
            if (link.getAttribute('href') === currentPath) {
                link.classList.add('active');
            }
        });

        // Sidebar toggle functionality
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', () => {
                sidebar.classList.toggle('collapsed');
            });
        }
    }

    setupQuickActions() {
        const signOutBtn = document.getElementById('sign-out-btn');
        if (signOutBtn) {
            signOutBtn.addEventListener('click', async () => {
                try {
                    await authService.signOut();
                } catch (error) {
                    console.error('Sign out error:', error);
                }
            });
        }
    }
}

// Initialize dashboard for each page
document.addEventListener('DOMContentLoaded', () => {
    new DashboardManager();
});

export default DashboardManager;
