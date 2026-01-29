/**
 * Quote Form Composable
 * Handles multi-step quote form with validation
 * Integrates with Core Framework validation and API services
 */

import { ref, computed, getCurrentInstance } from 'vue';

interface QuoteFormData {
    // Step 1: Personal Info
    firstName: string;
    lastName: string;
    email: string;
    phone: string;

    // Step 2: Property Info
    address: string;
    city: string;
    state: string;
    zipCode: string;
    propertyType: 'residential' | 'commercial' | 'industrial';

    // Step 3: Energy Info
    monthlyBill: number;
    roofType: string;
    roofAge: number;
    shading: 'none' | 'partial' | 'heavy';

    // Step 4: Preferences
    installationTimeframe: string;
    financingInterest: boolean;
    comments: string;
}

export function useQuoteForm() {
    const instance = getCurrentInstance();
    const $fx = instance?.appContext.config.globalProperties.$fx;

    const currentStep = ref(1);
    const totalSteps = 4;
    const isSubmitting = ref(false);

    const formData = ref<QuoteFormData>({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        propertyType: 'residential',
        monthlyBill: 0,
        roofType: '',
        roofAge: 0,
        shading: 'none',
        installationTimeframe: '',
        financingInterest: false,
        comments: '',
    });

    const errors = ref<Record<string, string>>({});

    // Validation rules using core framework
    const validationRules = computed(() => {
        if (!$fx?.validation) return {};

        return {
            step1: {
                firstName: [$fx.validation.rules.required('First name is required')],
                lastName: [$fx.validation.rules.required('Last name is required')],
                email: [
                    $fx.validation.rules.required('Email is required'),
                    $fx.validation.rules.email('Invalid email format'),
                ],
                phone: [
                    $fx.validation.rules.required('Phone is required'),
                    $fx.validation.rules.pattern(/^\d{10}$/, 'Phone must be 10 digits'),
                ],
            },
            step2: {
                address: [$fx.validation.rules.required('Address is required')],
                city: [$fx.validation.rules.required('City is required')],
                state: [$fx.validation.rules.required('State is required')],
                zipCode: [
                    $fx.validation.rules.required('ZIP code is required'),
                    $fx.validation.rules.pattern(/^\d{5}$/, 'ZIP must be 5 digits'),
                ],
            },
            step3: {
                monthlyBill: [
                    $fx.validation.rules.required('Monthly bill is required'),
                    $fx.validation.rules.min(1, 'Must be greater than 0'),
                ],
                roofType: [$fx.validation.rules.required('Roof type is required')],
                roofAge: [
                    $fx.validation.rules.required('Roof age is required'),
                    $fx.validation.rules.min(0, 'Must be 0 or greater'),
                ],
            },
            step4: {
                installationTimeframe: [$fx.validation.rules.required('Please select a timeframe')],
            },
        };
    });

    // Validate current step
    const validateStep = (step: number): boolean => {
        errors.value = {};
        const stepKey = `step${step}` as keyof typeof validationRules.value;
        const rules = validationRules.value[stepKey];

        if (!rules) return true;

        let isValid = true;

        Object.entries(rules).forEach(([field, fieldRules]) => {
            const value = formData.value[field as keyof QuoteFormData];

            for (const rule of fieldRules as any[]) {
                const result = rule(value);
                if (result !== true) {
                    errors.value[field] = result;
                    isValid = false;
                    break;
                }
            }
        });

        return isValid;
    };

    // Navigate to next step
    const nextStep = () => {
        if (validateStep(currentStep.value)) {
            if (currentStep.value < totalSteps) {
                currentStep.value++;
            }
        } else {
            if ($fx?.toast) {
                $fx.toast.error('Please fix the errors before continuing');
            }
        }
    };

    // Navigate to previous step
    const prevStep = () => {
        if (currentStep.value > 1) {
            currentStep.value--;
        }
    };

    // Submit form
    const submitForm = async () => {
        if (!validateStep(currentStep.value)) {
            if ($fx?.toast) {
                $fx.toast.error('Please fix the errors before submitting');
            }
            return;
        }

        isSubmitting.value = true;

        try {
            // Submit using core framework API
            if ($fx?.api) {
                const response = await $fx.api.post('/api/quote/submit', formData.value);

                if (response.success) {
                    $fx.toast?.success('Quote request submitted successfully!');

                    // Track analytics
                    $fx.analytics?.track('quote_submitted', {
                        property_type: formData.value.propertyType,
                        monthly_bill: formData.value.monthlyBill,
                        location: `${formData.value.city}, ${formData.value.state}`,
                    });

                    // Reset form
                    resetForm();

                    // Redirect to thank you page
                    $fx.utils?.navigate('/thank-you');
                }
            } else {
                // Fallback to fetch
                const response = await fetch('/api/quote/submit', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': getCookie('csrftoken'),
                    },
                    body: JSON.stringify(formData.value),
                });

                if (response.ok) {
                    alert('Quote request submitted successfully!');
                    resetForm();
                }
            }
        } catch (error) {
            console.error('Quote submission error:', error);
            if ($fx?.toast) {
                $fx.toast.error('Failed to submit quote. Please try again.');
            }
        } finally {
            isSubmitting.value = false;
        }
    };

    // Reset form
    const resetForm = () => {
        formData.value = {
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            address: '',
            city: '',
            state: '',
            zipCode: '',
            propertyType: 'residential',
            monthlyBill: 0,
            roofType: '',
            roofAge: 0,
            shading: 'none',
            installationTimeframe: '',
            financingInterest: false,
            comments: '',
        };
        currentStep.value = 1;
        errors.value = {};
    };

    // Progress percentage
    const progress = computed(() => {
        return (currentStep.value / totalSteps) * 100;
    });

    return {
        formData,
        errors,
        currentStep,
        totalSteps,
        isSubmitting,
        progress,
        nextStep,
        prevStep,
        submitForm,
        resetForm,
        validateStep,
    };
}

// Utility function
function getCookie(name: string): string | null {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === name + '=') {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
