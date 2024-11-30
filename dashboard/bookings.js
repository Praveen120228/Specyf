// Bookings JavaScript

document.addEventListener('DOMContentLoaded', () => {
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
