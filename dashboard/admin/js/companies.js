import { db, storage } from './firebase-config.js';
import { collection, addDoc, getDocs, doc, deleteDoc, updateDoc, query, where } from 'https://www.gstatic.com/firebasejs/9.x.x/firebase-firestore.js';
import { ref, uploadBytes, getDownloadURL } from 'https://www.gstatic.com/firebasejs/9.x.x/firebase-storage.js';

// DOM Elements
const companyTableBody = document.getElementById('companiesTableBody');
const addCompanyBtn = document.getElementById('addCompanyBtn');
const addCompanyModal = document.getElementById('addCompanyModal');
const addCompanyForm = document.getElementById('addCompanyForm');
const searchInput = document.getElementById('companySearch');
const closeModalBtn = document.querySelector('.close-modal');
const cancelBtn = document.querySelector('.btn-secondary');

// Stats Elements
const totalCompaniesEl = document.getElementById('totalCompanies');
const activeCompaniesEl = document.getElementById('activeCompanies');
const totalJobsEl = document.getElementById('totalJobs');
const totalEmployeesEl = document.getElementById('totalEmployees');

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    loadCompanies();
    updateStats();
});

addCompanyBtn.addEventListener('click', () => {
    addCompanyModal.style.display = 'block';
});

closeModalBtn.addEventListener('click', () => {
    addCompanyModal.style.display = 'none';
    addCompanyForm.reset();
});

cancelBtn.addEventListener('click', () => {
    addCompanyModal.style.display = 'none';
    addCompanyForm.reset();
});

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    if (e.target === addCompanyModal) {
        addCompanyModal.style.display = 'none';
        addCompanyForm.reset();
    }
});

addCompanyForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    
    try {
        const companyData = {
            name: document.getElementById('companyName').value.trim(),
            industry: document.getElementById('industry').value,
            location: document.getElementById('location').value.trim(),
            website: document.getElementById('website').value.trim(),
            description: document.getElementById('description').value.trim(),
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        // Add company to Firestore
        const docRef = await addDoc(collection(db, 'companies'), companyData);
        
        // Update UI
        addCompanyToTable({ id: docRef.id, ...companyData });
        updateStats();
        
        // Close modal and reset form
        addCompanyModal.style.display = 'none';
        addCompanyForm.reset();
        
        showNotification('Company added successfully!', 'success');
    } catch (error) {
        console.error('Error adding company:', error);
        showNotification('Error adding company. Please try again.', 'error');
    } finally {
        submitBtn.disabled = false;
    }
});

if (searchInput) {
    searchInput.addEventListener('input', debounce(filterCompanies, 300));
}

// Functions
async function loadCompanies() {
    try {
        const querySnapshot = await getDocs(collection(db, 'companies'));
        companyTableBody.innerHTML = ''; // Clear existing rows
        
        if (querySnapshot.empty) {
            companyTableBody.innerHTML = '<tr><td colspan="7" class="empty-state">No companies found</td></tr>';
            return;
        }

        querySnapshot.forEach((doc) => {
            const company = { id: doc.id, ...doc.data() };
            addCompanyToTable(company);
        });
    } catch (error) {
        console.error('Error loading companies:', error);
        showNotification('Error loading companies. Please refresh the page.', 'error');
    }
}

function addCompanyToTable(company) {
    // Remove empty state if it exists
    const emptyState = companyTableBody.querySelector('.empty-state');
    if (emptyState) {
        emptyState.remove();
    }

    const row = document.createElement('tr');
    row.dataset.id = company.id;
    
    row.innerHTML = `
        <td>${company.name}</td>
        <td>${company.industry}</td>
        <td>${company.location}</td>
        <td>0</td>
        <td>0</td>
        <td><span class="status-badge ${company.status}">${company.status}</span></td>
        <td class="actions">
            <button class="action-btn delete" data-id="${company.id}">
                <i class="fas fa-trash"></i>
            </button>
        </td>
    `;
    
    // Add delete event listener
    const deleteBtn = row.querySelector('.delete');
    deleteBtn.addEventListener('click', () => deleteCompany(company.id));
    
    companyTableBody.insertBefore(row, companyTableBody.firstChild);
}

async function deleteCompany(companyId) {
    if (!confirm('Are you sure you want to delete this company?')) return;

    try {
        await deleteDoc(doc(db, 'companies', companyId));
        
        // Remove from UI
        const row = document.querySelector(`tr[data-id="${companyId}"]`);
        row.remove();
        
        // Show empty state if no companies left
        if (companyTableBody.children.length === 0) {
            companyTableBody.innerHTML = '<tr><td colspan="7" class="empty-state">No companies found</td></tr>';
        }
        
        updateStats();
        showNotification('Company deleted successfully!', 'success');
    } catch (error) {
        console.error('Error deleting company:', error);
        showNotification('Error deleting company. Please try again.', 'error');
    }
}

async function updateStats() {
    try {
        const companiesSnapshot = await getDocs(collection(db, 'companies'));
        const activeCompaniesSnapshot = await getDocs(query(collection(db, 'companies'), where('status', '==', 'active')));
        
        totalCompaniesEl.textContent = companiesSnapshot.size;
        activeCompaniesEl.textContent = activeCompaniesSnapshot.size;
        
        // These would need to be implemented with actual queries
        totalJobsEl.textContent = '0';
        totalEmployeesEl.textContent = '0';
    } catch (error) {
        console.error('Error updating stats:', error);
    }
}

function filterCompanies() {
    const searchTerm = searchInput.value.toLowerCase();
    const rows = companyTableBody.querySelectorAll('tr:not(.empty-state)');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
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

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}
