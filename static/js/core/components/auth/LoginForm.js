
export const LoginForm = {
    name: 'LoginForm',
    setup() {
        const toast = useToast;
        const authStore = useAuth;

        const formData = reactive({
            username: '',
            password: ''
        });

        // Local loading state to prevent race conditions
        const isSubmitting = ref(false);

        const handleLogin = async () => {
            // Prevent multiple simultaneous submissions
            if (isSubmitting.value) {
                console.log('[LoginForm] Already submitting, ignoring duplicate request');
                return;
            }

            // Basic frontend validation
            if (!formData.username || !formData.password) {
                toast.warning('Please enter both username and password');
                return;
            }

            isSubmitting.value = true;

            try {
                const success = await authStore.login(formData);

                if (success) {
                    // The useApi composable will show a success toast.
                    // Redirect after a short delay to allow the user to see the message.
                    setTimeout(() => {
                        window.location.href = '/app/';
                    }, 800);
                }
                // If login fails, the useAuth -> useApi flow will automatically show an error toast.
            } finally {
                // Reset loading state after completion (success or failure)
                isSubmitting.value = false;
            }
        };

        return {
            formData,
            isSubmitting,
            handleLogin
        };
    },
    template: `
        <div class="login-container">
            <div class="login-card">
                <div class="login-header">
                    <div class="logo-container">
                        <i class="fas fa-building"></i>
                    </div>
                    <h1>ERP System</h1>
                    <p>Sign in to your account</p>
                </div>

                <form @submit.prevent="handleLogin" class="login-form">
                    <div class="form-group">
                        <label for="username">
                            <i class="fas fa-user"></i>
                            Username
                        </label>
                        <input
                            type="text"
                            id="username"
                            v-model="formData.username"
                            placeholder="Enter your username"
                            :disabled="isSubmitting"
                            autocomplete="username"
                            required
                        />
                    </div>

                    <div class="form-group">
                        <label for="password">
                            <i class="fas fa-lock"></i>
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            v-model="formData.password"
                            placeholder="Enter your password"
                            :disabled="isSubmitting"
                            autocomplete="current-password"
                            required
                        />
                    </div>

                    <div class="form-options">
                        <label class="checkbox-container">
                            <input type="checkbox" />
                            <span>Remember me</span>
                        </label>
                        <a href="#" class="forgot-password">Forgot password?</a>
                    </div>

                    <button
                        type="submit"
                        class="login-button"
                        :disabled="isSubmitting"
                    >
                        <span v-if="!isSubmitting">
                            <i class="fas fa-sign-in-alt"></i>
                            Sign In
                        </span>
                        <span v-else>
                            <i class="fas fa-spinner fa-spin"></i>
                            Signing in...
                        </span>
                    </button>
                </form>

                <div class="login-footer">
                    <p>Don't have an account? <a href="#">Contact Administrator</a></p>
                </div>
            </div>

            <div class="login-background">
                <div class="bg-shape shape-1"></div>
                <div class="bg-shape shape-2"></div>
                <div class="bg-shape shape-3"></div>
            </div>
        </div>
    `
};
