import { ref, reactive, computed } from 'vue';

/**
 * Built-in Validation Rules
 * Each rule returns a validator function
 */
export const rules = {
    /**
     * Required field validation
     */
    required: (message = 'This field is required') => (value) => {
        if (value === null || value === undefined || value === '') {
            return message;
        }
        if (typeof value === 'string' && value.trim() === '') {
            return message;
        }
        if (Array.isArray(value) && value.length === 0) {
            return message;
        }
        return true;
    },

    /**
     * Email format validation
     */
    email: (message = 'Invalid email address') => (value) => {
        if (!value) return true; // Skip if empty (use required separately)
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value) || message;
    },

    /**
     * Minimum length validation
     */
    minLength: (min, message) => (value) => {
        if (!value) return true;
        const msg = message || `Minimum ${min} characters required`;
        return value.length >= min || msg;
    },

    /**
     * Maximum length validation
     */
    maxLength: (max, message) => (value) => {
        if (!value) return true;
        const msg = message || `Maximum ${max} characters allowed`;
        return value.length <= max || msg;
    },

    /**
     * Minimum value validation (for numbers)
     */
    min: (minValue, message) => (value) => {
        if (value === null || value === undefined || value === '') return true;
        const msg = message || `Minimum value is ${minValue}`;
        return Number(value) >= minValue || msg;
    },

    /**
     * Maximum value validation (for numbers)
     */
    max: (maxValue, message) => (value) => {
        if (value === null || value === undefined || value === '') return true;
        const msg = message || `Maximum value is ${maxValue}`;
        return Number(value) <= maxValue || msg;
    },

    /**
     * Pattern/Regex validation
     */
    pattern: (regex, message = 'Invalid format') => (value) => {
        if (!value) return true;
        return regex.test(value) || message;
    },

    /**
     * URL validation
     */
    url: (message = 'Invalid URL') => (value) => {
        if (!value) return true;
        try {
            new URL(value);
            return true;
        } catch {
            return message;
        }
    },

    /**
     * Numeric validation
     */
    numeric: (message = 'Must be a number') => (value) => {
        if (!value) return true;
        return !isNaN(Number(value)) || message;
    },

    /**
     * Integer validation
     */
    integer: (message = 'Must be an integer') => (value) => {
        if (!value) return true;
        return Number.isInteger(Number(value)) || message;
    },

    /**
     * Alpha (letters only) validation
     */
    alpha: (message = 'Only letters allowed') => (value) => {
        if (!value) return true;
        return /^[a-zA-Z]+$/.test(value) || message;
    },

    /**
     * Alphanumeric validation
     */
    alphanumeric: (message = 'Only letters and numbers allowed') => (value) => {
        if (!value) return true;
        return /^[a-zA-Z0-9]+$/.test(value) || message;
    },

    /**
     * Password strength validation
     */
    password: (options = {}) => (value) => {
        if (!value) return true;

        const {
            min = 8,
            requireUppercase = true,
            requireLowercase = true,
            requireNumber = true,
            requireSpecial = true
        } = options;

        if (value.length < min) {
            return `Password must be at least ${min} characters`;
        }
        if (requireUppercase && !/[A-Z]/.test(value)) {
            return 'Password must contain an uppercase letter';
        }
        if (requireLowercase && !/[a-z]/.test(value)) {
            return 'Password must contain a lowercase letter';
        }
        if (requireNumber && !/[0-9]/.test(value)) {
            return 'Password must contain a number';
        }
        if (requireSpecial && !/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
            return 'Password must contain a special character';
        }
        return true;
    },

    /**
     * Field matching validation (e.g., password confirmation)
     */
    match: (otherField, message) => (value, formData) => {
        if (!value) return true;
        const msg = message || `Must match ${otherField}`;
        return value === formData[otherField] || msg;
    },

    /**
     * Phone number validation (basic)
     */
    phone: (message = 'Invalid phone number') => (value) => {
        if (!value) return true;
        // Basic phone validation: 10-15 digits with optional +, spaces, dashes, parentheses
        const phoneRegex = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/;
        return phoneRegex.test(value.replace(/\s/g, '')) || message;
    },

    /**
     * Date validation
     */
    date: (message = 'Invalid date') => (value) => {
        if (!value) return true;
        const date = new Date(value);
        return !isNaN(date.getTime()) || message;
    },

    /**
     * Date range validation
     */
    dateRange: (minDate, maxDate, message) => (value) => {
        if (!value) return true;
        const date = new Date(value);
        const min = minDate ? new Date(minDate) : null;
        const max = maxDate ? new Date(maxDate) : null;

        if (min && date < min) {
            return message || `Date must be after ${min.toLocaleDateString()}`;
        }
        if (max && date > max) {
            return message || `Date must be before ${max.toLocaleDateString()}`;
        }
        return true;
    },

    /**
     * File size validation (for file inputs)
     */
    fileSize: (maxSizeInMB, message) => (file) => {
        if (!file) return true;
        const maxBytes = maxSizeInMB * 1024 * 1024;
        const msg = message || `File size must not exceed ${maxSizeInMB}MB`;
        return file.size <= maxBytes || msg;
    },

    /**
     * File type validation
     */
    fileType: (allowedTypes, message) => (file) => {
        if (!file) return true;
        const types = Array.isArray(allowedTypes) ? allowedTypes : [allowedTypes];
        const msg = message || `Allowed file types: ${types.join(', ')}`;
        return types.some(type => file.type.includes(type)) || msg;
    },

    /**
     * Async validation (e.g., check username availability via API)
     */
    async: (validatorFn, message = 'Validation failed') => async (value) => {
        if (!value) return true;
        try {
            const result = await validatorFn(value);
            return result === true || message;
        } catch (error) {
            return error.message || message;
        }
    },

    /**
     * Custom validator function
     */
    custom: (validatorFn) => validatorFn
};

/**
 * Form Validation Composable
 * Provides declarative validation with built-in rules and async support
 */
export function useValidation(schema = {}, container) {
    const errors = reactive({});
    const touched = reactive({});
    const isValidating = ref(false);

    /**
     * Validate a single field
     */
    const validateField = async (fieldName, value, formData = {}) => {
        const fieldRules = schema[fieldName];
        if (!fieldRules || fieldRules.length === 0) {
            delete errors[fieldName];
            return true;
        }

        for (const rule of fieldRules) {
            const result = await rule(value, formData);
            if (result !== true) {
                errors[fieldName] = result;
                return false;
            }
        }

        delete errors[fieldName];
        return true;
    };

    /**
     * Validate all fields in the form
     */
    const validateAll = async (formData) => {
        isValidating.value = true;
        try {
            const validationPromises = Object.keys(schema).map(fieldName =>
                validateField(fieldName, formData[fieldName], formData)
            );
            const results = await Promise.all(validationPromises);
            return results.every(result => result === true);
        } finally {
            isValidating.value = false;
        }
    };

    const touch = (fieldName) => touched[fieldName] = true;
    const touchAll = () => Object.keys(schema).forEach(f => touched[f] = true);
    const reset = () => {
        Object.keys(errors).forEach(k => delete errors[k]);
        Object.keys(touched).forEach(k => delete touched[k]);
    };
    const resetField = (fieldName) => {
        delete errors[fieldName];
        delete touched[fieldName];
    };

    const isValid = computed(() => Object.keys(errors).length === 0);
    const getError = (fieldName) => errors[fieldName];
    const hasError = (fieldName) => !!errors[fieldName];
    const isTouched = (fieldName) => !!touched[fieldName];
    const errorList = computed(() => Object.entries(errors).map(([field, message]) => ({ field, message })));
    const errorCount = computed(() => Object.keys(errors).length);

    return {
        // State
        errors,
        touched,
        isValidating,
        isValid,
        errorList,
        errorCount,

        // Rules (Keep here for backward compatibility but encourage separate import)
        rules,

        // Methods
        validateField,
        validateAll,
        touch,
        touchAll,
        reset,
        resetField,
        getError,
        hasError,
        isTouched
    };
}
