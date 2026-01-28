// Core app specific functionality - Composition API
console.log('Core app JavaScript loaded - Composition API');

// Composable: useFormat
function useFormat() {
    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };
    
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    const formatNumber = (number) => {
        return new Intl.NumberFormat('en-IN').format(number);
    };
    
    return {
        formatDate,
        formatCurrency,
        formatNumber
    };
}

// Composable: useNotification
function useNotification() {
    const showToast = (message, type = 'info') => {
        console.log(`[${type.toUpperCase()}] ${message}`);
        // TODO: Integrate with a toast library later
    };

    const showSuccess = (message) => showToast(message, 'success');
    const showError = (message) => showToast(message, 'error');
    const showWarning = (message) => showToast(message, 'warning');
    const showInfo = (message) => showToast(message, 'info');
    
    return {
        showToast,
        showSuccess,
        showError,
        showWarning,
        showInfo
    };
}

// Composable: useValidation
function useValidation() {
    const validateGST = (gstNumber) => {
        const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
        return gstRegex.test(gstNumber);
    };

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validatePhone = (phone) => {
        const phoneRegex = /^[6-9]\d{9}$/;
        return phoneRegex.test(phone);
    };
    
    return {
        validateGST,
        validateEmail,
        validatePhone
    };
}

// Make composables available globally
window.useFormat = useFormat;
window.useNotification = useNotification;
window.useValidation = useValidation;
