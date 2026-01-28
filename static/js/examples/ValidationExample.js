// Example: Form Validation Usage
// This demonstrates how to use the new validation system

import { reactive, ref } from 'vue';
import { useValidation, rules } from '../core/components/composable/useValidation.js';
import { useToast } from '../core/components/composable/useToast.js';
import { SchemaForm } from '../core/components/ui/SchemaForm.js';

export const ValidationExample = {
    name: 'ValidationExample',
    components: {
        SchemaForm
    },
    setup() {
        const toast = useToast;

        // Form data
        const formData = reactive({
            username: '',
            email: '',
            password: '',
            confirmPassword: '',
            age: null,
            website: '',
            phone: '',
            bio: '',
            agreeToTerms: false
        });

        // Setup validation
        const { validateAll, errors, isValid, errorCount } = useValidation({
            username: [
                rules.required('Username is required'),
                rules.minLength(3, 'Username must be at least 3 characters'),
                rules.maxLength(20, 'Username cannot exceed 20 characters'),
                rules.pattern(/^[a-zA-Z0-9_]+$/, 'Only letters, numbers, and underscores allowed')
            ],
            email: [
                rules.required('Email is required'),
                rules.email('Please enter a valid email address')
            ],
            password: [
                rules.required('Password is required'),
                rules.password({
                    min: 8,
                    requireUppercase: true,
                    requireLowercase: true,
                    requireNumber: true,
                    requireSpecial: true
                })
            ],
            confirmPassword: [
                rules.required('Please confirm your password'),
                rules.match('password', 'Passwords do not match')
            ],
            age: [
                rules.required('Age is required'),
                rules.numeric('Age must be a number'),
                rules.min(18, 'You must be at least 18 years old'),
                rules.max(120, 'Please enter a valid age')
            ],
            website: [
                rules.url('Please enter a valid URL (e.g., https://example.com)')
            ],
            phone: [
                rules.phone('Please enter a valid phone number')
            ],
            bio: [
                rules.maxLength(500, 'Bio cannot exceed 500 characters')
            ],
            agreeToTerms: [
                rules.custom((value) => value === true || 'You must agree to the terms and conditions')
            ]
        });

        // Form schema for SchemaForm component
        const formSchema = [
            {
                name: 'username',
                label: 'Username',
                type: 'text',
                placeholder: 'Enter username',
                required: true,
                colClass: 'col-md-6'
            },
            {
                name: 'email',
                label: 'Email Address',
                type: 'email',
                placeholder: 'Enter email',
                required: true,
                colClass: 'col-md-6'
            },
            {
                name: 'password',
                label: 'Password',
                type: 'password',
                placeholder: 'Enter password',
                required: true,
                colClass: 'col-md-6'
            },
            {
                name: 'confirmPassword',
                label: 'Confirm Password',
                type: 'password',
                placeholder: 'Confirm password',
                required: true,
                colClass: 'col-md-6'
            },
            {
                name: 'age',
                label: 'Age',
                type: 'number',
                placeholder: 'Enter age',
                required: true,
                colClass: 'col-md-4'
            },
            {
                name: 'phone',
                label: 'Phone Number',
                type: 'text',
                placeholder: '+1 (555) 123-4567',
                colClass: 'col-md-4'
            },
            {
                name: 'website',
                label: 'Website',
                type: 'text',
                placeholder: 'https://example.com',
                colClass: 'col-md-4'
            },
            {
                name: 'bio',
                label: 'Bio',
                type: 'textarea',
                placeholder: 'Tell us about yourself',
                rows: 4,
                colClass: 'col-12'
            },
            {
                name: 'agreeToTerms',
                label: 'I agree to the terms and conditions',
                type: 'checkbox',
                checkboxLabel: 'I agree to the terms and conditions',
                required: true,
                colClass: 'col-12'
            }
        ];

        // Validation schema for SchemaForm
        const validationSchema = {
            username: [
                rules.required('Username is required'),
                rules.minLength(3),
                rules.maxLength(20),
                rules.alphanumeric('Only letters and numbers allowed')
            ],
            email: [
                rules.required(),
                rules.email()
            ],
            password: [
                rules.required(),
                rules.password({ min: 8 })
            ],
            confirmPassword: [
                rules.required(),
                rules.match('password')
            ],
            age: [
                rules.required(),
                rules.min(18),
                rules.max(120)
            ],
            website: [
                rules.url()
            ],
            phone: [
                rules.phone()
            ],
            bio: [
                rules.maxLength(500)
            ],
            agreeToTerms: [
                rules.custom((value) => value === true || 'You must agree to terms')
            ]
        };

        const isSubmitting = ref(false);
        const schemaFormRef = ref(null);

        // Submit handler
        const handleSubmit = async () => {
            // Validate using SchemaForm's built-in validation
            if (schemaFormRef.value) {
                const valid = await schemaFormRef.value.validateAll();
                if (!valid) {
                    toast.error(`Please fix ${errorCount.value} validation error(s)`);
                    return;
                }
            }

            isSubmitting.value = true;

            try {
                // Simulate API call
                await new Promise(resolve => setTimeout(resolve, 1500));

                toast.success('Form submitted successfully!');
                console.log('Form data:', formData);
            } catch (error) {
                toast.error('Failed to submit form');
            } finally {
                isSubmitting.value = false;
            }
        };

        return {
            formData,
            formSchema,
            validationSchema,
            errors,
            isValid,
            errorCount,
            isSubmitting,
            schemaFormRef,
            handleSubmit
        };
    },
    template: `
        <div class="container mt-5">
            <div class="row justify-content-center">
                <div class="col-lg-8">
                    <div class="card shadow">
                        <div class="card-header bg-primary text-white">
                            <h4 class="mb-0">
                                <i class="fas fa-user-plus me-2"></i>
                                User Registration Form
                            </h4>
                            <small>Demonstrating Form Validation System</small>
                        </div>
                        <div class="card-body">
                            <!-- Validation Summary -->
                            <div v-if="errorCount > 0" class="alert alert-danger">
                                <i class="fas fa-exclamation-triangle me-2"></i>
                                Please fix {{ errorCount }} validation error(s) before submitting
                            </div>

                            <!-- Schema Form with Validation -->
                            <schema-form
                                ref="schemaFormRef"
                                :schema="formSchema"
                                v-model="formData"
                                :validation-schema="validationSchema"
                                :validate-on-blur="true"
                                :validate-on-change="false"
                                :show-errors-on-touched="true"
                                :loading="isSubmitting"
                                @submit="handleSubmit"
                            >
                                <template #actions>
                                    <div class="d-flex justify-content-between align-items-center">
                                        <div>
                                            <span v-if="isValid" class="text-success">
                                                <i class="fas fa-check-circle me-1"></i>
                                                All fields valid
                                            </span>
                                            <span v-else class="text-muted">
                                                <i class="fas fa-info-circle me-1"></i>
                                                Fill out all required fields
                                            </span>
                                        </div>
                                        <button 
                                            type="submit" 
                                            class="btn btn-primary"
                                            :disabled="isSubmitting"
                                        >
                                            <span v-if="isSubmitting">
                                                <i class="fas fa-spinner fa-spin me-1"></i>
                                                Submitting...
                                            </span>
                                            <span v-else>
                                                <i class="fas fa-paper-plane me-1"></i>
                                                Submit Registration
                                            </span>
                                        </button>
                                    </div>
                                </template>
                            </schema-form>
                        </div>
                        <div class="card-footer text-muted">
                            <small>
                                <i class="fas fa-shield-alt me-1"></i>
                                Your data is protected with enterprise-grade validation
                            </small>
                        </div>
                    </div>

                    <!-- Validation Rules Info -->
                    <div class="card mt-4">
                        <div class="card-header">
                            <h5 class="mb-0">
                                <i class="fas fa-list-check me-2"></i>
                                Validation Rules
                            </h5>
                        </div>
                        <div class="card-body">
                            <ul class="list-unstyled mb-0">
                                <li><i class="fas fa-check text-success me-2"></i> Username: 3-20 characters, alphanumeric only</li>
                                <li><i class="fas fa-check text-success me-2"></i> Email: Valid email format</li>
                                <li><i class="fas fa-check text-success me-2"></i> Password: Min 8 chars, uppercase, lowercase, number, special char</li>
                                <li><i class="fas fa-check text-success me-2"></i> Confirm Password: Must match password</li>
                                <li><i class="fas fa-check text-success me-2"></i> Age: 18-120 years old</li>
                                <li><i class="fas fa-check text-success me-2"></i> Website: Valid URL format (optional)</li>
                                <li><i class="fas fa-check text-success me-2"></i> Phone: Valid phone number format (optional)</li>
                                <li><i class="fas fa-check text-success me-2"></i> Bio: Max 500 characters (optional)</li>
                                <li><i class="fas fa-check text-success me-2"></i> Terms: Must agree to continue</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
};
