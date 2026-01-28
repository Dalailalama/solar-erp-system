import { computed } from 'vue';
import { useValidation } from '../composable/useValidation.js';

export const SchemaForm = {
    name: 'SchemaForm',
    props: {
        schema: {
            type: Array,
            required: true,
            // Example: [{ name: 'email', label: 'Email', type: 'email', required: true }]
        },
        modelValue: {
            type: Object,
            required: true
        },
        errors: {
            type: Object,
            default: () => ({})
        },
        loading: {
            type: Boolean,
            default: false
        },
        // NEW: Validation schema (optional)
        validationSchema: {
            type: Object,
            default: null
            // Example: { email: [rules.required(), rules.email()] }
        },
        // NEW: Validate on blur (default: true)
        validateOnBlur: {
            type: Boolean,
            default: true
        },
        // NEW: Validate on change (default: false)
        validateOnChange: {
            type: Boolean,
            default: false
        },
        // NEW: Show errors only after field is touched
        showErrorsOnTouched: {
            type: Boolean,
            default: true
        }
    },
    emits: ['update:modelValue', 'submit', 'validation-change'],
    setup(props, { emit }) {
        // Initialize validation if schema is provided
        const validation = props.validationSchema
            ? useValidation(props.validationSchema)
            : null;

        const updateField = async (field, value) => {
            const newData = { ...props.modelValue, [field]: value };
            emit('update:modelValue', newData);

            // Validate on change if enabled and field is touched
            if (validation && props.validateOnChange && validation.isTouched(field)) {
                await validation.validateField(field, value, newData);
                emit('validation-change', {
                    isValid: validation.isValid.value,
                    errors: validation.errors
                });
            }
        };

        const handleBlur = async (field) => {
            if (!validation) return;

            // Mark field as touched
            validation.touch(field);

            // Validate on blur if enabled
            if (props.validateOnBlur) {
                await validation.validateField(field, props.modelValue[field], props.modelValue);
                emit('validation-change', {
                    isValid: validation.isValid.value,
                    errors: validation.errors
                });
            }
        };

        const handleFocus = (field) => {
            // Optional: Clear error on focus for better UX
            if (validation && props.showErrorsOnTouched) {
                // Don't clear, just mark as focused
            }
        };

        // Merge validation errors with external errors
        const hasError = (field) => {
            if (validation) {
                // Show validation errors only if field is touched (or showErrorsOnTouched is false)
                const showValidationError = !props.showErrorsOnTouched || validation.isTouched(field);
                if (showValidationError && validation.hasError(field)) {
                    return true;
                }
            }
            return !!props.errors[field];
        };

        const getError = (field) => {
            if (validation) {
                const showValidationError = !props.showErrorsOnTouched || validation.isTouched(field);
                if (showValidationError && validation.hasError(field)) {
                    return validation.getError(field);
                }
            }
            return props.errors[field];
        };

        // Expose validation methods for parent component
        const validateAll = async () => {
            if (!validation) return true;
            validation.touchAll();
            const isValid = await validation.validateAll(props.modelValue);
            emit('validation-change', {
                isValid,
                errors: validation.errors
            });
            return isValid;
        };

        return {
            updateField,
            handleBlur,
            handleFocus,
            hasError,
            getError,
            validateAll,
            // Expose validation state
            validation,
            isValid: validation ? validation.isValid : computed(() => true)
        };
    },
    template: `
        <form @submit.prevent="$emit('submit')" class="schema-form">
            <div class="row">
                <div 
                    v-for="field in schema" 
                    :key="field.name" 
                    :class="['mb-3', field.colClass || 'col-12']"
                >
                    <label :for="field.name" class="form-label">
                        {{ field.label }}
                        <span v-if="field.required" class="text-danger">*</span>
                    </label>
                    
                    <!-- Text / Email / Password / Number -->
                    <input
                        v-if="['text', 'email', 'password', 'number', 'date'].includes(field.type)"
                        :type="field.type"
                        :id="field.name"
                        :value="modelValue[field.name]"
                        @input="updateField(field.name, $event.target.value)"
                        @blur="handleBlur(field.name)"
                        @focus="handleFocus(field.name)"
                        class="form-control"
                        :class="{ 'is-invalid': hasError(field.name) }"
                        :placeholder="field.placeholder"
                        :disabled="loading || field.disabled"
                    >

                    <!-- Select -->
                    <select
                        v-else-if="field.type === 'select'"
                        :id="field.name"
                        :value="modelValue[field.name]"
                        @change="updateField(field.name, $event.target.value)"
                        @blur="handleBlur(field.name)"
                        @focus="handleFocus(field.name)"
                        class="form-select"
                        :class="{ 'is-invalid': hasError(field.name) }"
                        :disabled="loading || field.disabled"
                    >
                        <option value="" disabled selected>Select {{ field.label }}</option>
                        <option 
                            v-for="opt in field.options" 
                            :key="opt.value" 
                            :value="opt.value"
                        >
                            {{ opt.label }}
                        </option>
                    </select>

                    <!-- Textarea -->
                    <textarea
                        v-else-if="field.type === 'textarea'"
                        :id="field.name"
                        :value="modelValue[field.name]"
                        @input="updateField(field.name, $event.target.value)"
                        @blur="handleBlur(field.name)"
                        @focus="handleFocus(field.name)"
                        class="form-control"
                        :class="{ 'is-invalid': hasError(field.name) }"
                        :rows="field.rows || 3"
                        :disabled="loading || field.disabled"
                    ></textarea>

                    <!-- Checkbox -->
                    <div v-else-if="field.type === 'checkbox'" class="form-check">
                        <input
                            type="checkbox"
                            :id="field.name"
                            :checked="modelValue[field.name]"
                            @change="updateField(field.name, $event.target.checked)"
                            @blur="handleBlur(field.name)"
                            @focus="handleFocus(field.name)"
                            class="form-check-input"
                            :class="{ 'is-invalid': hasError(field.name) }"
                            :disabled="loading || field.disabled"
                        >
                        <label class="form-check-label" :for="field.name">
                            {{ field.checkboxLabel || field.label }}
                        </label>
                    </div>

                    <!-- Error Message -->
                    <div v-if="hasError(field.name)" class="invalid-feedback">
                        {{ getError(field.name) }}
                    </div>
                </div>
            </div>

            <!-- Submit Button Slot or Default -->
            <div class="mt-3">
                <slot name="actions">
                    <button type="submit" class="btn btn-primary" :disabled="loading">
                        <span v-if="loading" class="spinner-border spinner-border-sm me-1"></span>
                        Submit
                    </button>
                </slot>
            </div>
        </form>
    `
};
