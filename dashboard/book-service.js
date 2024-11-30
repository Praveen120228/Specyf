document.addEventListener('DOMContentLoaded', () => {
    const serviceTypeSelect = document.getElementById('serviceType');
    const specificServiceSelect = document.getElementById('specificService');
    const urgentServiceCheckbox = document.getElementById('urgentService');
    const estimatedCostElement = document.getElementById('estimatedCost');
    const bookServiceForm = document.getElementById('bookServiceForm');

    // Service pricing data
    const servicePrices = {
        home: {
            cleaning: 50,
            maintenance: 75,
            repair: 100
        },
        industrial: {
            consultation: 200,
            equipment_maintenance: 300,
            safety_audit: 250
        }
    };

    // Populate specific services based on category
    serviceTypeSelect.addEventListener('change', () => {
        const serviceType = serviceTypeSelect.value;
        specificServiceSelect.innerHTML = '<option value="">Select Specific Service</option>';

        if (serviceType === 'home') {
            addOptions(specificServiceSelect, Object.keys(servicePrices.home));
        } else if (serviceType === 'industrial') {
            addOptions(specificServiceSelect, Object.keys(servicePrices.industrial));
        }
    });

    // Calculate estimated cost
    function calculateCost() {
        const serviceType = serviceTypeSelect.value;
        const specificService = specificServiceSelect.value;
        const isUrgent = urgentServiceCheckbox.checked;

        if (serviceType && specificService) {
            let baseCost = servicePrices[serviceType][specificService];
            let totalCost = isUrgent ? baseCost * 1.5 : baseCost;
            
            estimatedCostElement.textContent = `$${totalCost.toFixed(2)}`;
        } else {
            estimatedCostElement.textContent = '$0.00';
        }
    }

    specificServiceSelect.addEventListener('change', calculateCost);
    urgentServiceCheckbox.addEventListener('change', calculateCost);

    // Form submission
    bookServiceForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const formData = {
            serviceType: serviceTypeSelect.value,
            specificService: specificServiceSelect.value,
            date: document.getElementById('serviceDate').value,
            time: document.getElementById('serviceTime').value,
            urgent: urgentServiceCheckbox.checked,
            estimatedCost: parseFloat(estimatedCostElement.textContent.replace('$', ''))
        };

        // TODO: Send booking to backend
        console.log('Booking submitted:', formData);
        alert('Service booked successfully! We will contact you soon.');
        
        // Redirect to dashboard or bookings page
        window.location.href = 'index.html';
    });

    // Utility function to add options to select
    function addOptions(selectElement, options) {
        options.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option;
            optionElement.textContent = option.replace('_', ' ').toUpperCase();
            selectElement.appendChild(optionElement);
        });
    }
});
