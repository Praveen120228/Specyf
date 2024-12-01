// Form State Management Utility
class FormStateManager {
    /**
     * Disable form submit button and show loading state
     * @param {HTMLFormElement} form - Form element
     * @param {Object} options - Configuration options
     */
    static disableSubmit(form, options = {}) {
        const submitButton = form.querySelector('button[type="submit"]');
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.classList.add('loading');
            
            // Optional custom loading text
            if (options.loadingText) {
                submitButton.dataset.originalText = submitButton.textContent;
                submitButton.textContent = options.loadingText;
            }
        }
    }

    /**
     * Re-enable form submit button and remove loading state
     * @param {HTMLFormElement} form - Form element
     */
    static enableSubmit(form) {
        const submitButton = form.querySelector('button[type="submit"]');
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.classList.remove('loading');
            
            // Restore original button text
            if (submitButton.dataset.originalText) {
                submitButton.textContent = submitButton.dataset.originalText;
                delete submitButton.dataset.originalText;
            }
        }
    }

    /**
     * Reset form to its initial state
     * @param {HTMLFormElement} form - Form element
     * @param {Object} options - Reset configuration
     */
    static resetForm(form, options = {}) {
        // Reset form fields
        form.reset();

        // Clear any error messages
        const errorElements = form.querySelectorAll('.error-message');
        errorElements.forEach(el => el.textContent = '');

        // Optional: Trigger change events to reset dynamic elements
        if (options.triggerChange) {
            const inputs = form.querySelectorAll('input, select');
            inputs.forEach(input => {
                const event = new Event('change', { bubbles: true });
                input.dispatchEvent(event);
            });
        }

        // Re-enable submit button
        this.enableSubmit(form);
    }

    /**
     * Display form validation errors
     * @param {HTMLFormElement} form - Form element
     * @param {Array|Object} errors - Validation errors
     */
    static displayErrors(form, errors) {
        // Clear previous errors
        const previousErrors = form.querySelectorAll('.error-message');
        previousErrors.forEach(el => el.remove());

        // Handle array of errors
        if (Array.isArray(errors)) {
            errors.forEach(error => {
                const errorSpan = document.createElement('span');
                errorSpan.classList.add('error-message');
                errorSpan.textContent = error;
                form.appendChild(errorSpan);
            });
        } 
        // Handle object of field-specific errors
        else if (typeof errors === 'object') {
            Object.entries(errors).forEach(([fieldName, errorMessage]) => {
                const field = form.querySelector(`[name="${fieldName}"]`);
                if (field) {
                    const errorSpan = document.createElement('span');
                    errorSpan.classList.add('error-message');
                    errorSpan.textContent = errorMessage;
                    field.parentNode.insertBefore(errorSpan, field.nextSibling);
                }
            });
        }
    }

    /**
     * Add real-time validation to form inputs
     * @param {HTMLFormElement} form - Form element
     * @param {Object} validationRules - Validation rules for inputs
     */
    static addRealTimeValidation(form, validationRules) {
        Object.entries(validationRules).forEach(([fieldName, validateFn]) => {
            const field = form.querySelector(`[name="${fieldName}"]`);
            if (field) {
                field.addEventListener('input', (event) => {
                    const errorMessage = validateFn(event.target.value);
                    const existingError = field.nextElementSibling;
                    
                    if (errorMessage) {
                        // Remove previous error if exists
                        if (existingError && existingError.classList.contains('error-message')) {
                            existingError.remove();
                        }
                        
                        // Create and add new error
                        const errorSpan = document.createElement('span');
                        errorSpan.classList.add('error-message');
                        errorSpan.textContent = errorMessage;
                        field.parentNode.insertBefore(errorSpan, field.nextSibling);
                    } else if (existingError && existingError.classList.contains('error-message')) {
                        // Remove error if validation passes
                        existingError.remove();
                    }
                });
            }
        });
    }
}

// Export the form state manager
export default FormStateManager;
