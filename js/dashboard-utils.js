// Dashboard Utility Functions
import authService from './auth-service.js';

export class DashboardUtils {
    static async initializeDashboard(userType) {
        try {
            // Ensure user is authenticated
            if (!authService.isAuthenticated()) {
                window.location.href = '/login.html';
                return null;
            }

            // Get current user data
            const userData = await authService.getCurrentUserData();
            if (!userData) {
                console.error('No user data found');
                return null;
            }

            // Validate user type
            if (userData.userType !== userType) {
                console.error(`Unauthorized access for user type: ${userData.userType}`);
                authService.signOut();
                return null;
            }

            return userData;
        } catch (error) {
            console.error('Dashboard initialization error:', error);
            authService.signOut();
            return null;
        }
    }

    static setupSidebar() {
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

    static setupSignOut() {
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

    static updateUserProfile(userData) {
        const profileContainer = document.getElementById('user-profile');
        if (profileContainer && userData) {
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
}

// Initialization for all dashboards
document.addEventListener('DOMContentLoaded', () => {
    DashboardUtils.setupSidebar();
    DashboardUtils.setupSignOut();
});
