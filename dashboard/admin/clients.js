// Clients JavaScript

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const notificationPanel = document.querySelector('.notification-panel');
    const notificationBell = document.querySelector('.notification-bell');
    const closePanel = document.querySelector('.close-panel');
    const clientsGrid = document.querySelector('.clients-grid');
    const activityTimeline = document.querySelector('.activity-timeline');
    const toastContainer = document.querySelector('.toast-container');
    const addClientModal = document.getElementById('addClientModal');
    const addClientBtn = document.querySelector('.btn-primary');
    const closeModalBtn = document.querySelector('.close-modal');
    const filterSelect = document.querySelector('.filter-select');
    const searchInput = document.querySelector('.search-bar input');

    // Event Listeners
    notificationBell.addEventListener('click', toggleNotificationPanel);
    closePanel.addEventListener('click', toggleNotificationPanel);
    addClientBtn.addEventListener('click', () => addClientModal.style.display = 'block');
    closeModalBtn.addEventListener('click', () => addClientModal.style.display = 'none');
    filterSelect.addEventListener('change', filterClients);
    searchInput.addEventListener('input', searchClients);

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === addClientModal) {
            addClientModal.style.display = 'none';
        }
    });

    // Toggle Notification Panel
    function toggleNotificationPanel() {
        notificationPanel.classList.toggle('active');
    }

    // Mock Data
    const clients = [
        {
            id: 1,
            name: 'Sarah Johnson',
            email: 'sarah.j@email.com',
            phone: '+1 234-567-8901',
            status: 'active',
            joinDate: '2023-12-01',
            lastVisit: '2024-01-14',
            totalBookings: 12,
            totalSpent: 1800,
            avatar: '../assets/client1.jpg'
        },
        {
            id: 2,
            name: 'Mike Smith',
            email: 'mike.s@email.com',
            phone: '+1 234-567-8902',
            status: 'active',
            joinDate: '2023-11-15',
            lastVisit: '2024-01-10',
            totalBookings: 8,
            totalSpent: 1200,
            avatar: '../assets/client2.jpg'
        },
        // Add more mock clients here
    ];

    const activities = [
        {
            clientId: 1,
            type: 'booking',
            message: 'Sarah Johnson made a new booking',
            time: '2 hours ago'
        },
        {
            clientId: 2,
            type: 'review',
            message: 'Mike Smith left a 5-star review',
            time: '4 hours ago'
        },
        // Add more activities
    ];

    // Populate Clients Grid
    function populateClientsGrid(filteredClients = clients) {
        clientsGrid.innerHTML = filteredClients.map(client => `
            <div class="client-card">
                <div class="client-header">
                    <img src="${client.avatar}" alt="${client.name}" class="client-avatar">
                    <div class="client-status ${client.status}"></div>
                </div>
                <div class="client-info">
                    <h3>${client.name}</h3>
                    <p class="client-contact">
                        <i class="fas fa-envelope"></i> ${client.email}<br>
                        <i class="fas fa-phone"></i> ${client.phone}
                    </p>
                </div>
                <div class="client-stats">
                    <div class="stat">
                        <span class="stat-label">Bookings</span>
                        <span class="stat-value">${client.totalBookings}</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">Total Spent</span>
                        <span class="stat-value">$${client.totalSpent}</span>
                    </div>
                </div>
                <div class="client-footer">
                    <button class="btn-icon" onclick="viewClient(${client.id})">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-icon" onclick="editClient(${client.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon" onclick="deleteClient(${client.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    // Populate Activity Timeline
    function populateActivityTimeline() {
        activityTimeline.innerHTML = activities.map(activity => `
            <div class="activity-item ${activity.type}">
                <div class="activity-icon">
                    <i class="fas fa-${getActivityIcon(activity.type)}"></i>
                </div>
                <div class="activity-content">
                    <p>${activity.message}</p>
                    <small>${activity.time}</small>
                </div>
            </div>
        `).join('');
    }

    // Filter Clients
    function filterClients(e) {
        const status = e.target.value;
        const filteredClients = status === 'all' 
            ? clients 
            : clients.filter(client => client.status === status);
        populateClientsGrid(filteredClients);
    }

    // Search Clients
    function searchClients(e) {
        const searchTerm = e.target.value.toLowerCase();
        const filteredClients = clients.filter(client => 
            client.name.toLowerCase().includes(searchTerm) ||
            client.email.toLowerCase().includes(searchTerm) ||
            client.phone.includes(searchTerm)
        );
        populateClientsGrid(filteredClients);
    }

    // Utility Functions
    function getActivityIcon(type) {
        const icons = {
            booking: 'calendar-check',
            review: 'star',
            payment: 'dollar-sign',
            registration: 'user-plus'
        };
        return icons[type] || 'info-circle';
    }

    function showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    // Form Handling
    const addClientForm = document.getElementById('addClientForm');
    addClientForm.addEventListener('submit', (e) => {
        e.preventDefault();
        // Add form handling logic here
        showToast('Client added successfully!', 'success');
        addClientModal.style.display = 'none';
    });

    // Initialize
    function init() {
        populateClientsGrid();
        populateActivityTimeline();
        
        // Update date
        const dateText = document.querySelector('.date-text');
        const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
        const now = new Date();
        dateText.textContent = `Today is ${now.toLocaleDateString('en-US', options)}`;
    }

    // Initialize the page
    init();

    // Add to window object for onclick handlers
    window.viewClient = (clientId) => {
        const client = clients.find(c => c.id === clientId);
        showToast(`Viewing ${client.name}'s profile`, 'info');
    };

    window.editClient = (clientId) => {
        const client = clients.find(c => c.id === clientId);
        showToast(`Editing ${client.name}'s profile`, 'info');
    };

    window.deleteClient = (clientId) => {
        const client = clients.find(c => c.id === clientId);
        showToast(`Delete ${client.name}'s profile?`, 'warning');
    };
});
