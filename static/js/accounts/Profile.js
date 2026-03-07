import '../../css/core/profile.css';

export const Profile = {
    name: 'Profile',
    template: `
        <div class="profile-container">
            <div class="profile-grid">
                <div class="profile-sidebar-col">
                    <div class="panel profile-card">
                        <div class="panel-body text-center">
                            <div class="profile-avatar mb-3">{{ userInitials }}</div>
                            <h4 class="mb-1">{{ displayUser.first_name }} {{ displayUser.last_name }}</h4>
                            <p class="text-muted">{{ displayUser.username }}</p>
                            <p class="text-muted small">{{ displayUser.email }}</p>
                        </div>
                    </div>
                </div>

                <div class="profile-content-col">
                    <div class="panel mb-4">
                        <div class="panel-header">
                            <h5 class="mb-0">Personal Details</h5>
                        </div>
                        <div class="panel-body">
                            <form @submit="onUpdateProfileSubmit">
                                <div class="form-row">
                                    <div class="form-group half">
                                        <label class="form-label">First Name</label>
                                        <input type="text" class="form-input" v-model="form.first_name" required>
                                    </div>
                                    <div class="form-group half">
                                        <label class="form-label">Last Name</label>
                                        <input type="text" class="form-input" v-model="form.last_name" required>
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Email Address</label>
                                    <input type="email" class="form-input" v-model="form.email" required>
                                </div>
                                <button type="submit" class="action-btn btn-primary" :disabled="loading">
                                    <i class="fas fa-save me-1"></i> Save Changes
                                </button>
                            </form>
                        </div>
                    </div>

                    <div class="panel">
                        <div class="panel-header">
                            <h5 class="mb-0">Change Password</h5>
                        </div>
                        <div class="panel-body">
                            <form @submit="onChangePasswordSubmit">
                                <div class="form-group">
                                    <label class="form-label">New Password</label>
                                    <input type="password" class="form-input" v-model="passwordForm.new_password" required>
                                    <div class="password-criteria mt-2">
                                        <small :class="criteria.length ? 'text-success' : 'text-danger'">
                                            <i :class="criteria.length ? 'fas fa-check' : 'fas fa-times'"></i> 8+ Characters
                                        </small>
                                        <small :class="criteria.upper ? 'text-success' : 'text-danger'" class="ms-2">
                                            <i :class="criteria.upper ? 'fas fa-check' : 'fas fa-times'"></i> Uppercase
                                        </small>
                                        <small :class="criteria.lower ? 'text-success' : 'text-danger'" class="ms-2">
                                            <i :class="criteria.lower ? 'fas fa-check' : 'fas fa-times'"></i> Lowercase
                                        </small>
                                        <small :class="criteria.number ? 'text-success' : 'text-danger'" class="ms-2">
                                            <i :class="criteria.number ? 'fas fa-check' : 'fas fa-times'"></i> Number
                                        </small>
                                        <small :class="criteria.special ? 'text-success' : 'text-danger'" class="ms-2">
                                            <i :class="criteria.special ? 'fas fa-check' : 'fas fa-times'"></i> Symbol
                                        </small>
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Confirm Password</label>
                                    <input type="password" class="form-input" v-model="passwordForm.confirm_password" required>
                                    <small v-if="passwordMismatch" class="text-danger d-block mt-1">Passwords do not match</small>
                                </div>
                                <button type="submit" class="action-btn btn-warning" :disabled="!isPasswordValid || passwordMismatch || loadingRes">
                                    <i class="fas fa-key me-1"></i> Update Password
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,
    setup() {
        const authStore = useAuth;
        const api = useApi();
        const toast = useToast;
        const loading = ref(false);
        const loadingRes = ref(false);

        const defaultUserDetails = () => ({
            username: '',
            first_name: '',
            last_name: '',
            email: ''
        });

        const userDetails = ref(defaultUserDetails());

        const displayUser = computed(() => {
            const user = userDetails.value && typeof userDetails.value === 'object'
                ? userDetails.value
                : defaultUserDetails();
            return {
                username: user.username || '',
                first_name: user.first_name || '',
                last_name: user.last_name || '',
                email: user.email || ''
            };
        });

        const form = reactive({
            first_name: '',
            last_name: '',
            email: ''
        });

        const passwordForm = reactive({
            new_password: '',
            confirm_password: ''
        });

        const userInitials = computed(() => {
            const name = `${displayUser.value.first_name} ${displayUser.value.last_name}`.trim() || displayUser.value.username || 'U';
            return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
        });

        onMounted(async () => {
            try {
                const response = await api.get('/accounts/user/');
                const payload = response?.user || response?.data || response || {};
                userDetails.value = {
                    ...defaultUserDetails(),
                    ...(typeof payload === 'object' && payload !== null ? payload : {})
                };
                form.first_name = displayUser.value.first_name;
                form.last_name = displayUser.value.last_name;
                form.email = displayUser.value.email;
            } catch (e) {
                console.error(e);
                toast.error?.('Failed to load profile details');
            }
        });

        const updateProfile = async () => {
            loading.value = true;
            try {
                await api.put('/accounts/profile/', form);
                userDetails.value = { ...userDetails.value, ...form };
            } finally {
                loading.value = false;
            }
        };

        const criteria = computed(() => {
            const p = passwordForm.new_password;
            return {
                length: p.length >= 8,
                upper: /[A-Z]/.test(p),
                lower: /[a-z]/.test(p),
                number: /[0-9]/.test(p),
                special: /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(p)
            };
        });

        const isPasswordValid = computed(() => {
            const c = criteria.value;
            return c.length && c.upper && c.lower && c.number && c.special;
        });

        const passwordMismatch = computed(() => {
            return passwordForm.confirm_password && passwordForm.new_password !== passwordForm.confirm_password;
        });

        const changePassword = async () => {
            if (!isPasswordValid.value || passwordMismatch.value) return;
            loadingRes.value = true;
            try {
                await api.post('/accounts/change-password/', passwordForm);
                passwordForm.new_password = '';
                passwordForm.confirm_password = '';
            } finally {
                loadingRes.value = false;
            }
        };

        const onUpdateProfileSubmit = (event) => {
            event.preventDefault();
            return updateProfile();
        };

        const onChangePasswordSubmit = (event) => {
            event.preventDefault();
            return changePassword();
        };

        return {
            displayUser,
            userInitials,
            form,
            passwordForm,
            loading,
            loadingRes,
            criteria,
            isPasswordValid,
            passwordMismatch,
            onUpdateProfileSubmit,
            onChangePasswordSubmit
        };
    }
};


