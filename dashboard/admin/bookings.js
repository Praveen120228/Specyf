// Initialize Firebase
let db;
let auth;
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

document.addEventListener('DOMContentLoaded', function() {
    // Initialize Firebase
    const app = firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
    auth = firebase.auth();

    // Check authentication
    auth.onAuthStateChanged(function(user) {
        if (user) {
            loadBookings();
            loadStats();
        } else {
            window.location.href = 'login.html';
        }
    });

    // DOM Elements
    const notificationPanel = document.querySelector('.notification-panel');
    const notificationBell = document.querySelector('.notification-bell');
    const closePanel = document.querySelector('.close-panel');
    const calendarGrid = document.getElementById('calendarGrid');
    const bookingsTable = document.querySelector('.bookings-table tbody');
    const toastContainer = document.querySelector('.toast-container');
    const newBookingModal = document.getElementById('newBookingModal');
    const newBookingBtn = document.querySelector('.btn-primary');
    const closeModalBtn = document.querySelector('.close-modal');
    const filterSelect = document.querySelector('.filter-select');

    // Event Listeners
    notificationBell.addEventListener('click', toggleNotificationPanel);
    closePanel.addEventListener('click', toggleNotificationPanel);
    newBookingBtn.addEventListener('click', () => newBookingModal.style.display = 'block');
    closeModalBtn.addEventListener('click', () => newBookingModal.style.display = 'none');
    filterSelect.addEventListener('change', filterBookings);

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === newBookingModal) {
            newBookingModal.style.display = 'none';
        }
    });

    // Toggle Notification Panel
    function toggleNotificationPanel() {
        notificationPanel.classList.toggle('active');
    }

    // Load booking statistics
    async function loadStats() {
        try {
            const bookingsSnapshot = await db.collection('bookings').get();
            const staffSnapshot = await db.collection('staff').get();

            let activeCount = 0;
            let pendingCount = 0;

            bookingsSnapshot.forEach(doc => {
                const booking = doc.data();
                if (booking.status === 'active') activeCount++;
                if (booking.status === 'pending') pendingCount++;
            });

            document.getElementById('activeCompanies').textContent = activeCount;
            document.getElementById('pendingRequests').textContent = pendingCount;
            document.getElementById('totalStaff').textContent = staffSnapshot.size;
        } catch (error) {
            console.error("Error loading stats:", error);
            showNotification('Error loading statistics', 'error');
        }
    }

    // Load bookings
    async function loadBookings() {
        try {
            const statusFilter = document.getElementById('statusFilter').value;
            const tableBody = document.getElementById('bookingsTableBody');
            tableBody.innerHTML = '';

            let query = db.collection('bookings');
            if (statusFilter !== 'all') {
                query = query.where('status', '==', statusFilter);
            }

            const snapshot = await query.get();
            
            snapshot.forEach(doc => {
                const booking = doc.data();
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${booking.companyName}</td>
                    <td>${booking.serviceType}</td>
                    <td>${booking.staffRequired}</td>
                    <td>${new Date(booking.startDate).toLocaleDateString()}</td>
                    <td>${booking.duration}</td>
                    <td><span class="status-badge ${booking.status}">${booking.status}</span></td>
                    <td>
                        <button onclick="viewBooking('${doc.id}')" class="btn-icon">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button onclick="editBooking('${doc.id}')" class="btn-icon">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="deleteBooking('${doc.id}')" class="btn-icon">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                `;
                tableBody.appendChild(row);
            });
        } catch (error) {
            console.error("Error loading bookings:", error);
            showNotification('Error loading bookings', 'error');
        }
    }

    // Filter bookings
    document.getElementById('statusFilter').addEventListener('change', loadBookings);

    // Open new booking modal
    function openNewBookingModal() {
        // Implement modal functionality
        console.log('Opening new booking modal');
    }

    // View booking details
    async function viewBooking(bookingId) {
        try {
            const doc = await db.collection('bookings').doc(bookingId).get();
            if (doc.exists) {
                const booking = doc.data();
                // Implement view modal
                console.log('Viewing booking:', booking);
            }
        } catch (error) {
            console.error("Error viewing booking:", error);
            showNotification('Error viewing booking details', 'error');
        }
    }

    // Edit booking
    async function editBooking(bookingId) {
        try {
            const doc = await db.collection('bookings').doc(bookingId).get();
            if (doc.exists) {
                const booking = doc.data();
                // Implement edit modal
                console.log('Editing booking:', booking);
            }
        } catch (error) {
            console.error("Error editing booking:", error);
            showNotification('Error editing booking', 'error');
        }
    }

    // Delete booking
    async function deleteBooking(bookingId) {
        if (confirm('Are you sure you want to delete this booking?')) {
            try {
                await db.collection('bookings').doc(bookingId).delete();
                showNotification('Booking deleted successfully', 'success');
                loadBookings();
                loadStats();
            } catch (error) {
                console.error("Error deleting booking:", error);
                showNotification('Error deleting booking', 'error');
            }
        }
    }

    // Show notification
    function showNotification(message, type = 'info') {
        // Implement notification system
        console.log(`${type}: ${message}`);
    }

    // Mock Data
    const bookings = [
        { 
            client: 'Sarah Johnson',
            service: 'Consultation',
            datetime: '2024-01-15 09:00',
            status: 'Confirmed',
            amount: '$150'
        },
        { 
            client: 'Mike Smith',
            service: 'Follow-up',
            datetime: '2024-01-15 11:00',
            status: 'Pending',
            amount: '$100'
        },
        { 
            client: 'Emma Davis',
            service: 'Assessment',
            datetime: '2024-01-16 14:00',
            status: 'Completed',
            amount: '$200'
        },
        { 
            client: 'John Wilson',
            service: 'Consultation',
            datetime: '2024-01-16 16:00',
            status: 'Cancelled',
            amount: '$150'
        }
    ];

    // Calendar Functions
    function generateCalendar(year, month) {
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startingDay = firstDay.getDay();
        const monthLength = lastDay.getDate();

        const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        
        let calendarHTML = '<div class="calendar-header">';
        weekdays.forEach(day => {
            calendarHTML += `<div class="calendar-cell weekday">${day}</div>`;
        });
        calendarHTML += '</div>';

        let day = 1;
        for (let i = 0; i < 6; i++) {
            calendarHTML += '<div class="calendar-row">';
            for (let j = 0; j < 7; j++) {
                if (i === 0 && j < startingDay) {
                    calendarHTML += '<div class="calendar-cell empty"></div>';
                } else if (day > monthLength) {
                    calendarHTML += '<div class="calendar-cell empty"></div>';
                } else {
                    const hasBookings = checkBookingsForDate(year, month, day);
                    calendarHTML += `
                        <div class="calendar-cell ${hasBookings ? 'has-bookings' : ''}">
                            <span class="date">${day}</span>
                            ${hasBookings ? `<span class="booking-indicator">${hasBookings}</span>` : ''}
                        </div>
                    `;
                    day++;
                }
            }
            calendarHTML += '</div>';
            if (day > monthLength) break;
        }

        calendarGrid.innerHTML = calendarHTML;
    }

    function checkBookingsForDate(year, month, day) {
        const date = new Date(year, month, day).toISOString().split('T')[0];
        const dayBookings = bookings.filter(booking => booking.datetime.startsWith(date));
        return dayBookings.length > 0 ? dayBookings.length : 0;
    }

    // Populate Bookings Table
    function populateBookingsTable(filteredBookings = bookings) {
        bookingsTable.innerHTML = filteredBookings.map(booking => `
            <tr>
                <td>${booking.client}</td>
                <td>${booking.service}</td>
                <td>${formatDateTime(booking.datetime)}</td>
                <td><span class="status-badge ${booking.status.toLowerCase()}">${booking.status}</span></td>
                <td>${booking.amount}</td>
                <td class="actions">
                    <button class="btn-icon" onclick="editBooking('${booking.client}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon" onclick="deleteBooking('${booking.client}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    // Filter Bookings
    function filterBookings(e) {
        const status = e.target.value;
        const filteredBookings = status === 'all' 
            ? bookings 
            : bookings.filter(booking => booking.status.toLowerCase() === status);
        populateBookingsTable(filteredBookings);
    }

    // Utility Functions
    function formatDateTime(datetime) {
        const date = new Date(datetime);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
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
    const newBookingForm = document.getElementById('newBookingForm');
    newBookingForm.addEventListener('submit', (e) => {
        e.preventDefault();
        // Add form handling logic here
        showToast('Booking created successfully!', 'success');
        newBookingModal.style.display = 'none';
    });

    // Initialize
    function init() {
        const now = new Date();
        generateCalendar(now.getFullYear(), now.getMonth());
        populateBookingsTable();
        
        // Update date
        const dateText = document.querySelector('.date-text');
        const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
        dateText.textContent = `Today is ${now.toLocaleDateString('en-US', options)}`;
    }

    // Initialize the page
    init();

    // Add to window object for onclick handlers
    window.editBooking = (client) => {
        showToast(`Editing booking for ${client}`, 'info');
    };

    window.deleteBooking = (client) => {
        showToast(`Deleting booking for ${client}`, 'warning');
    };
});
