// Firestore Data Structure and Helper Functions
import { db, auth } from './firebase-config.js';
import { 
    collection, 
    doc, 
    addDoc, 
    updateDoc, 
    deleteDoc, 
    getDoc,
    getDocs,
    query,
    where,
    orderBy,
    setDoc,
    writeBatch
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

// Collection References
const companiesRef = collection(db, 'companies');
const employeesRef = collection(db, 'employees');
const jobsRef = collection(db, 'jobs');
const candidatesRef = collection(db, 'candidates');

// Helper function to verify admin status
async function verifyAdminStatus() {
    const user = auth.currentUser;
    if (!user) {
        throw new Error('User not authenticated');
    }
    
    // Force token refresh
    await user.getIdToken(true);
    const idTokenResult = await user.getIdTokenResult();
    
    if (!idTokenResult.claims.admin) {
        throw new Error('User does not have admin privileges');
    }
    return true;
}

// Companies Collection Functions
export const companyStructure = {
    addCompany: async (companyData) => {
        try {
            // Verify admin status first
            await verifyAdminStatus();
            
            const user = auth.currentUser;
            const companyDoc = doc(companiesRef);
            
            const company = {
                id: companyDoc.id,
                ...companyData,
                createdAt: new Date(),
                updatedAt: new Date(),
                createdBy: user.uid,
                employees: [],
                jobs: [],
                status: 'active'
            };

            await setDoc(companyDoc, company);
            console.log('Company added successfully:', companyDoc.id);
            return companyDoc;
        } catch (error) {
            console.error('Error in addCompany:', error);
            throw new Error(error.message || 'Error adding company');
        }
    },

    updateCompany: async (companyId, updateData) => {
        try {
            const companyRef = doc(db, 'companies', companyId);
            const updates = {
                ...updateData,
                updatedAt: new Date(),
                updatedBy: auth.currentUser?.uid
            };
            await updateDoc(companyRef, updates);
        } catch (error) {
            console.error('Error in updateCompany:', error);
            throw error;
        }
    },

    deleteCompany: async (companyId) => {
        try {
            // First, delete or reassign related data
            const companyRef = doc(db, 'companies', companyId);
            const companyDoc = await getDoc(companyRef);
            
            if (companyDoc.exists()) {
                // Update related employees
                const employeeQuery = query(employeesRef, where("companyId", "==", companyId));
                const employeeSnapshot = await getDocs(employeeQuery);
                
                const employeeUpdates = employeeSnapshot.docs.map(doc => 
                    updateDoc(doc.ref, {
                        status: 'inactive',
                        updatedAt: new Date(),
                        updatedBy: auth.currentUser?.uid
                    })
                );

                // Update related jobs
                const jobQuery = query(jobsRef, where("companyId", "==", companyId));
                const jobSnapshot = await getDocs(jobQuery);
                
                const jobUpdates = jobSnapshot.docs.map(doc => 
                    updateDoc(doc.ref, {
                        status: 'closed',
                        updatedAt: new Date(),
                        updatedBy: auth.currentUser?.uid
                    })
                );

                // Wait for all updates to complete
                await Promise.all([...employeeUpdates, ...jobUpdates]);
            }

            await deleteDoc(companyRef);
        } catch (error) {
            console.error('Error in deleteCompany:', error);
            throw error;
        }
    },

    getCompanyById: async (companyId) => {
        try {
            const companyRef = doc(db, 'companies', companyId);
            const companyDoc = await getDoc(companyRef);
            return companyDoc.exists() ? { id: companyDoc.id, ...companyDoc.data() } : null;
        } catch (error) {
            console.error('Error in getCompanyById:', error);
            throw error;
        }
    },

    getAllCompanies: async () => {
        try {
            const q = query(companiesRef, orderBy('createdAt', 'desc'));
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error('Error in getAllCompanies:', error);
            throw error;
        }
    }
};

// Employees Collection Functions
export const employeeStructure = {
    addEmployee: async (employeeData) => {
        try {
            const user = auth.currentUser;
            if (!user) {
                throw new Error('User not authenticated');
            }

            const employeeDoc = doc(employeesRef);
            const employee = {
                id: employeeDoc.id,
                ...employeeData,
                createdAt: new Date(),
                updatedAt: new Date(),
                createdBy: user.uid,
                status: 'active'
            };

            await setDoc(employeeDoc, employee);

            // Update company's employees array
            if (employee.companyId) {
                const companyRef = doc(db, 'companies', employee.companyId);
                const companyDoc = await getDoc(companyRef);
                if (companyDoc.exists()) {
                    const employees = companyDoc.data().employees || [];
                    employees.push(employeeDoc.id);
                    await updateDoc(companyRef, { 
                        employees,
                        updatedAt: new Date(),
                        updatedBy: user.uid
                    });
                }
            }

            return employeeDoc;
        } catch (error) {
            console.error('Error in addEmployee:', error);
            throw error;
        }
    },

    updateEmployee: async (employeeId, updateData) => {
        try {
            const employeeRef = doc(db, 'employees', employeeId);
            const updates = {
                ...updateData,
                updatedAt: new Date(),
                updatedBy: auth.currentUser?.uid
            };
            await updateDoc(employeeRef, updates);
        } catch (error) {
            console.error('Error in updateEmployee:', error);
            throw error;
        }
    },

    deleteEmployee: async (employeeId) => {
        try {
            const employeeRef = doc(db, 'employees', employeeId);
            const employeeDoc = await getDoc(employeeRef);

            if (employeeDoc.exists()) {
                const { companyId } = employeeDoc.data();
                
                // Remove from company's employees array
                if (companyId) {
                    const companyRef = doc(db, 'companies', companyId);
                    const companyDoc = await getDoc(companyRef);
                    if (companyDoc.exists()) {
                        const employees = companyDoc.data().employees || [];
                        const updatedEmployees = employees.filter(id => id !== employeeId);
                        await updateDoc(companyRef, { 
                            employees: updatedEmployees,
                            updatedAt: new Date(),
                            updatedBy: auth.currentUser?.uid
                        });
                    }
                }
            }

            await deleteDoc(employeeRef);
        } catch (error) {
            console.error('Error in deleteEmployee:', error);
            throw error;
        }
    },

    getEmployeesByCompany: async (companyId) => {
        try {
            const q = query(employeesRef, 
                where("companyId", "==", companyId),
                orderBy("createdAt", "desc")
            );
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error('Error in getEmployeesByCompany:', error);
            throw error;
        }
    },

    getAllEmployees: async () => {
        try {
            const q = query(employeesRef, orderBy("createdAt", "desc"));
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error('Error in getAllEmployees:', error);
            throw error;
        }
    }
};

// Jobs Collection Functions
export const jobStructure = {
    addJob: async (jobData) => {
        try {
            const user = auth.currentUser;
            if (!user) {
                throw new Error('User not authenticated');
            }

            const jobDoc = doc(jobsRef);
            const job = {
                id: jobDoc.id,
                ...jobData,
                createdAt: new Date(),
                updatedAt: new Date(),
                createdBy: user.uid,
                status: 'open',
                applications: []
            };

            await setDoc(jobDoc, job);

            // Update company's jobs array
            if (job.companyId) {
                const companyRef = doc(db, 'companies', job.companyId);
                const companyDoc = await getDoc(companyRef);
                if (companyDoc.exists()) {
                    const jobs = companyDoc.data().jobs || [];
                    jobs.push(jobDoc.id);
                    await updateDoc(companyRef, { 
                        jobs,
                        updatedAt: new Date(),
                        updatedBy: user.uid
                    });
                }
            }

            return jobDoc;
        } catch (error) {
            console.error('Error in addJob:', error);
            throw error;
        }
    },

    updateJob: async (jobId, updateData) => {
        try {
            const jobRef = doc(db, 'jobs', jobId);
            const updates = {
                ...updateData,
                updatedAt: new Date()
            };
            await updateDoc(jobRef, updates);
        } catch (error) {
            console.error('Error in updateJob:', error);
            throw error;
        }
    },

    deleteJob: async (jobId) => {
        try {
            const jobRef = doc(db, 'jobs', jobId);
            const jobDoc = await getDoc(jobRef);

            if (jobDoc.exists()) {
                const { companyId } = jobDoc.data();
                
                // Remove from company's jobs array
                if (companyId) {
                    const companyRef = doc(db, 'companies', companyId);
                    const companyDoc = await getDoc(companyRef);
                    if (companyDoc.exists()) {
                        const jobs = companyDoc.data().jobs || [];
                        const updatedJobs = jobs.filter(id => id !== jobId);
                        await updateDoc(companyRef, { jobs: updatedJobs });
                    }
                }
            }

            await deleteDoc(jobRef);
        } catch (error) {
            console.error('Error in deleteJob:', error);
            throw error;
        }
    },

    getJobsByCompany: async (companyId) => {
        try {
            const q = query(jobsRef, where("companyId", "==", companyId));
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error('Error in getJobsByCompany:', error);
            throw error;
        }
    },

    getActiveJobs: async () => {
        try {
            const q = query(jobsRef, where("status", "==", "open"), orderBy("createdAt", "desc"));
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error('Error in getActiveJobs:', error);
            throw error;
        }
    }
};

// Candidates Collection Functions
export const candidateStructure = {
    addCandidate: async (candidateData) => {
        try {
            const user = auth.currentUser;
            if (!user) {
                throw new Error('User not authenticated');
            }

            const candidateDoc = doc(candidatesRef);
            const candidate = {
                id: candidateDoc.id,
                ...candidateData,
                createdAt: new Date(),
                updatedAt: new Date(),
                createdBy: user.uid,
                status: 'active',
                applications: []
            };

            await setDoc(candidateDoc, candidate);
            return candidateDoc;
        } catch (error) {
            console.error('Error in addCandidate:', error);
            throw error;
        }
    },

    updateCandidate: async (candidateId, updateData) => {
        try {
            const candidateRef = doc(db, 'candidates', candidateId);
            const updates = {
                ...updateData,
                updatedAt: new Date(),
                updatedBy: auth.currentUser?.uid
            };
            await updateDoc(candidateRef, updates);
        } catch (error) {
            console.error('Error in updateCandidate:', error);
            throw error;
        }
    },

    deleteCandidate: async (candidateId) => {
        try {
            // Remove candidate from all job applications
            const candidateRef = doc(db, 'candidates', candidateId);
            const candidateDoc = await getDoc(candidateRef);

            if (candidateDoc.exists()) {
                const applications = candidateDoc.data().applications || [];
                
                // Update all jobs that this candidate applied to
                const jobUpdates = applications.map(async (jobId) => {
                    const jobRef = doc(db, 'jobs', jobId);
                    const jobDoc = await getDoc(jobRef);
                    
                    if (jobDoc.exists()) {
                        const jobApps = jobDoc.data().applications || [];
                        const updatedApps = jobApps.filter(id => id !== candidateId);
                        await updateDoc(jobRef, { 
                            applications: updatedApps,
                            updatedAt: new Date(),
                            updatedBy: auth.currentUser?.uid
                        });
                    }
                });

                await Promise.all(jobUpdates);
            }

            await deleteDoc(candidateRef);
        } catch (error) {
            console.error('Error in deleteCandidate:', error);
            throw error;
        }
    },

    applyToJob: async (candidateId, jobId) => {
        try {
            const user = auth.currentUser;
            if (!user) {
                throw new Error('User not authenticated');
            }

            const candidateRef = doc(db, 'candidates', candidateId);
            const jobRef = doc(db, 'jobs', jobId);

            const [candidateDoc, jobDoc] = await Promise.all([
                getDoc(candidateRef),
                getDoc(jobRef)
            ]);

            if (!candidateDoc.exists()) {
                throw new Error('Candidate not found');
            }
            if (!jobDoc.exists()) {
                throw new Error('Job not found');
            }

            const batch = writeBatch(db);

            // Update candidate's applications
            const candidateApps = candidateDoc.data().applications || [];
            if (!candidateApps.includes(jobId)) {
                batch.update(candidateRef, { 
                    applications: [...candidateApps, jobId],
                    updatedAt: new Date(),
                    updatedBy: user.uid
                });
            }

            // Update job's applications
            const jobApps = jobDoc.data().applications || [];
            if (!jobApps.includes(candidateId)) {
                batch.update(jobRef, { 
                    applications: [...jobApps, candidateId],
                    updatedAt: new Date(),
                    updatedBy: user.uid
                });
            }

            await batch.commit();
        } catch (error) {
            console.error('Error in applyToJob:', error);
            throw error;
        }
    },

    getCandidatesByJob: async (jobId) => {
        try {
            const q = query(
                candidatesRef, 
                where("applications", "array-contains", jobId),
                orderBy("createdAt", "desc")
            );
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error('Error in getCandidatesByJob:', error);
            throw error;
        }
    },

    getActiveCandidates: async () => {
        try {
            const q = query(
                candidatesRef, 
                where("status", "==", "active"),
                orderBy("createdAt", "desc")
            );
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error('Error in getActiveCandidates:', error);
            throw error;
        }
    }
};
