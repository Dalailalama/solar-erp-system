import { reactive, ref, computed } from 'vue';
import { validators } from '../utils/validators.js';

/**
 * useForm Composable
 * Manages form state, validation, and submission.
 * @param {Object} initialState - Initial form data
 * @param {Object} validationRules - Rules for each field { fieldName: { required: true, email: true } }
 */
export function useForm(initialState = {}, validationRules = {}) {
    const formData = reactive({ ...initialState });
    const errors = reactive({});
    const isSubmitting = ref(false);
    const isDirty = ref(false);

    // Validate a single field
    const validateField = (field) => {
        const rules = validationRules[field];
        if (!rules) return true;

        const value = formData[field];
        errors[field] = null; // Clear previous error

        if (rules.required && !validators.isRequired(value)) {
            errors[field] = 'This field is required';
            return false;
        }

        if (rules.email && !validators.validateEmail(value)) {
            errors[field] = 'Invalid email address';
            return false;
        }

        if (rules.minLength && !validators.minLength(value, rules.minLength)) {
            errors[field] = `Minimum ${rules.minLength} characters required`;
            return false;
        }

        // Add more validators as needed from validators.js
        if (rules.phone && !validators.validatePhone(value)) {
            errors[field] = 'Invalid phone number';
            return false;
        }

        if (rules.custom && typeof rules.custom === 'function') {
            const customResult = rules.custom(value, formData);
            if (customResult !== true) {
                errors[field] = customResult || 'Invalid value';
                return false;
            }
        }

        return true;
    };

    // Validate all fields
    const validate = () => {
        let valid = true;
        Object.keys(validationRules).forEach(field => {
            if (!validateField(field)) {
                valid = false;
            }
        });
        return valid;
    };

    // Reset form to initial state
    const reset = () => {
        Object.keys(initialState).forEach(key => {
            formData[key] = initialState[key];
        });
        Object.keys(errors).forEach(key => errors[key] = null);
        isDirty.value = false;
    };

    // Handle Submission
    const handleSubmit = async (callback) => {
        isSubmitting.value = true;
        errors.root = null; // Clear general errors

        if (!validate()) {
            isSubmitting.value = false;
            return;
        }

        try {
            await callback(formData);
        } catch (error) {
            console.error('Form submission error:', error);
            // Handle global error if needed, or rely on callback
        } finally {
            isSubmitting.value = false;
        }
    };

    return {
        formData,
        errors,
        isSubmitting,
        isDirty,
        validate,
        reset,
        handleSubmit
    };
}
