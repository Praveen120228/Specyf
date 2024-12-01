// Logging Service for Specyf Authentication System
class LoggingService {
    /**
     * Log error events with detailed context
     * @param {Object} errorData - Error logging information
     */
    static async logError(errorData) {
        try {
            // Collect additional context
            const logEntry = {
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent,
                platform: navigator.platform,
                ...errorData
            };

            // Log to console for development
            console.error('Specyf Error Log:', logEntry);

            // Optional: Send to backend logging endpoint
            // Uncomment and configure when backend is ready
            // await this.sendErrorToBackend(logEntry);

            // Optional: Log to local storage for later analysis
            this.logToLocalStorage(logEntry);
        } catch (loggingError) {
            console.error('Logging failed:', loggingError);
        }
    }

    /**
     * Log authentication events
     * @param {Object} eventData - Authentication event details
     */
    static async logAuthEvent(eventData) {
        try {
            const authLogEntry = {
                timestamp: new Date().toISOString(),
                type: 'AUTH_EVENT',
                ...eventData
            };

            console.log('Specyf Auth Event:', authLogEntry);
            this.logToLocalStorage(authLogEntry);
        } catch (error) {
            console.error('Auth event logging failed:', error);
        }
    }

    /**
     * Store log entries in local storage
     * @param {Object} logEntry - Log entry to store
     */
    static logToLocalStorage(logEntry) {
        try {
            const logs = JSON.parse(localStorage.getItem('specyf_logs') || '[]');
            
            // Limit log storage to last 100 entries
            logs.push(logEntry);
            if (logs.length > 100) {
                logs.shift(); // Remove oldest log
            }

            localStorage.setItem('specyf_logs', JSON.stringify(logs));
        } catch (error) {
            console.error('Local storage logging failed:', error);
        }
    }

    /**
     * Retrieve stored logs
     * @returns {Array} - Stored log entries
     */
    static getLogs() {
        try {
            return JSON.parse(localStorage.getItem('specyf_logs') || '[]');
        } catch (error) {
            console.error('Failed to retrieve logs:', error);
            return [];
        }
    }

    /**
     * Clear stored logs
     */
    static clearLogs() {
        try {
            localStorage.removeItem('specyf_logs');
        } catch (error) {
            console.error('Failed to clear logs:', error);
        }
    }
}

// Export the logging service
export default LoggingService;
