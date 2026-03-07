import '../../css/accounts/settings.css';

const SettingsApp = {
    setup() {
        const api = useApi();
        const toast = useToast;
        const loading = ref(false);



        onMounted(() => {
            fetchSettings();
        });

        // Global Config Store
        const config = useConfig;

        // Settings State
        // Bind directly to store where possible, or sync with store
        const settings = reactive({
            theme: computed({
                get: () => config.theme,
                set: (val) => {
                    config.theme = val;
                    // Apply immediately (store action handles DOM update?) - Store action toggleTheme is specific.
                    // We need a set action or direct mutation if store allows.
                    // useConfig.theme is reactive. useConfig.onInit applies it.
                    // We need to ensuring setting it updates DOM. 
                    // Let's rely on store watcher or update manually.
                    document.documentElement.setAttribute('data-theme', val);
                }
            }),
            sidebar_collapsed: computed({
                get: () => config.sidebarCollapsed,
                set: (val) => config.sidebarCollapsed = val
            }),
            items_per_page: computed({
                get: () => config.defaultPageSize,
                set: (val) => config.defaultPageSize = val
            }),
            // App-specific preferences (not yet in global config store, keep local or move to store?)
            // For now, keep as local reactive defaults or fetch from API if they are server-side only.
            email_notifications: true,
            push_notifications: false,
            sms_notifications: false,
            notification_frequency: 'realtime',
            profile_visibility: 'connections',
            time_format: '24h',
            date_format: 'YYYY-MM-DD'
        });

        const activeTab = ref('general');

        const tabs = [
            { id: 'general', label: 'General', icon: 'fas fa-cog' },
            { id: 'notifications', label: 'Notifications', icon: 'fas fa-bell' },
            { id: 'privacy', label: 'Privacy & Security', icon: 'fas fa-shield-alt' }
        ];

        // Fetch Settings
        const fetchSettings = async () => {
            loading.value = true;
            try {
                const response = await api.get('/accounts/preferences/');
                // Update Store
                if (response) {
                    if (response.theme) config.theme = response.theme;
                    if (response.sidebar_collapsed !== undefined) config.sidebarCollapsed = response.sidebar_collapsed;
                    if (response.items_per_page) config.defaultPageSize = response.items_per_page;

                    // Update local state
                    Object.assign(settings, response);
                }
            } catch (error) {
                console.error('Failed to fetch settings:', error);
            } finally {
                loading.value = false;
            }
        };

        // Save Settings
        const saveSettings = async () => {
            loading.value = true;
            try {
                // Construct payload from store + local values
                const payload = {
                    theme: config.theme,
                    sidebar_collapsed: config.sidebarCollapsed,
                    items_per_page: config.defaultPageSize,
                    // ... other local settings
                    email_notifications: settings.email_notifications,
                    push_notifications: settings.push_notifications,
                    sms_notifications: settings.sms_notifications,
                    notification_frequency: settings.notification_frequency,
                    profile_visibility: settings.profile_visibility,
                    time_format: settings.time_format,
                    date_format: settings.date_format
                };

                const response = await api.put('/accounts/preferences/', payload);
                if (response.code === 1) {
                    toast.success('Settings saved successfully');
                    // HydrationManager handles local persistence automatically via store watchers
                } else {
                    toast.error(response.message || 'Failed to save settings');
                }
            } catch (error) {
                console.error('Failed to save settings:', error);
            } finally {
                loading.value = false;
            }
        };

        const applyTheme = (theme) => {
            console.log('Applying theme:', theme); // Debug log
            document.documentElement.setAttribute('data-theme', theme);
        };

        onMounted(() => {
            fetchSettings();

            // Inject Styles
            const style = document.createElement('style');
            style.innerHTML = `
                .card-radio {
                    flex: 1;
                    position: relative;
                }
                .card-radio input {
                    position: absolute;
                    opacity: 0;
                    width: 0;
                    height: 0;
                }
                .card-radio label {
                    display: block;
                    border: 2px solid var(--border-color);
                    border-radius: 8px;
                    padding: 1.5rem;
                    text-align: center;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    background: var(--bg-card);
                    color: var(--text-primary);
                }
                .card-radio input:checked + label {
                    border-color: var(--color-primary);
                    background-color: rgba(52, 152, 219, 0.1);
                    color: var(--color-primary);
                }
                .fade-in {
                    animation: fadeIn 0.3s ease-in-out;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `;
            document.head.appendChild(style);
        });

        return {
            settings,
            loading,
            activeTab,
            tabs,
            saveSettings
        };
    },
    template: `
        <div class="settings-container">
            <toast-container />
            
            <div class="row">
                <!-- Sidebar/Tabs -->
                <div class="col-md-3 mb-4">
                    <div class="card h-100">
                        <div class="list-group list-group-flush">
                            <button 
                                v-for="tab in tabs" 
                                :key="tab.id"
                                class="list-group-item list-group-item-action d-flex align-items-center"
                                :class="{ 'active': activeTab === tab.id }"
                                @click="activeTab = tab.id"
                            >
                                <i :class="tab.icon + ' me-3'"></i>
                                {{ tab.label }}
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Content -->
                <div class="col-md-9">
                    <div class="card">
                        <div class="card-header bg-white py-3">
                            <h5 class="mb-0 text-capitalize">{{ activeTab }} Settings</h5>
                        </div>
                        <div class="card-body">
                            <form @submit.prevent="saveSettings">
                                
                                <!-- General Tab -->
                                <div v-if="activeTab === 'general'" class="fade-in">
                                    <div class="mb-4">
                                        <label class="form-label fw-bold">Theme Preference</label>
                                        <div class="d-flex gap-3">
                                            <div class="form-check card-radio">
                                                <input class="form-check-input" type="radio" name="theme" id="themeLight" value="light" v-model="settings.theme">
                                                <label class="form-check-label" for="themeLight">
                                                    <i class="fas fa-sun text-warning mb-2 d-block fs-4"></i>
                                                    Light
                                                </label>
                                            </div>
                                            <div class="form-check card-radio">
                                                <input class="form-check-input" type="radio" name="theme" id="themeDark" value="dark" v-model="settings.theme">
                                                <label class="form-check-label" for="themeDark">
                                                    <i class="fas fa-moon text-primary mb-2 d-block fs-4"></i>
                                                    Dark
                                                </label>
                                            </div>
                                            <div class="form-check card-radio">
                                                <input class="form-check-input" type="radio" name="theme" id="themeAuto" value="auto" v-model="settings.theme">
                                                <label class="form-check-label" for="themeAuto">
                                                    <i class="fas fa-adjust text-secondary mb-2 d-block fs-4"></i>
                                                    Auto
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="row mb-4">
                                        <div class="col-md-6">
                                            <label class="form-label">Items Per Page</label>
                                            <select class="form-select" v-model="settings.items_per_page">
                                                <option :value="10">10 items</option>
                                                <option :value="25">25 items</option>
                                                <option :value="50">50 items</option>
                                                <option :value="100">100 items</option>
                                            </select>
                                        </div>
                                        <div class="col-md-6">
                                            <label class="form-label">Time Format</label>
                                            <select class="form-select" v-model="settings.time_format">
                                                <option value="12h">12 Hour (AM/PM)</option>
                                                <option value="24h">24 Hour</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div class="form-check form-switch mb-3">
                                        <input class="form-check-input" type="checkbox" id="sidebarCollapse" v-model="settings.sidebar_collapsed">
                                        <label class="form-check-label" for="sidebarCollapse">
                                            Start with Sidebar Collapsed
                                        </label>
                                    </div>
                                </div>

                                <!-- Notifications Tab -->
                                <div v-if="activeTab === 'notifications'" class="fade-in">
                                    <h6 class="mb-3 text-muted">Email Notifications</h6>
                                    <div class="form-check form-switch mb-3">
                                        <input class="form-check-input" type="checkbox" id="emailNotif" v-model="settings.email_notifications">
                                        <label class="form-check-label" for="emailNotif">
                                            Receive email notifications
                                        </label>
                                    </div>

                                    <h6 class="mb-3 text-muted mt-4">Push Notifications</h6>
                                    <div class="form-check form-switch mb-3">
                                        <input class="form-check-input" type="checkbox" id="pushNotif" v-model="settings.push_notifications">
                                        <label class="form-check-label" for="pushNotif">
                                            Receive push notifications
                                        </label>
                                    </div>
                                    <div class="form-check form-switch mb-3">
                                        <input class="form-check-input" type="checkbox" id="smsNotif" v-model="settings.sms_notifications">
                                        <label class="form-check-label" for="smsNotif">
                                            Receive SMS notifications
                                        </label>
                                    </div>

                                    <div class="mt-4">
                                        <label class="form-label">Notification Frequency</label>
                                        <select class="form-select" v-model="settings.notification_frequency">
                                            <option value="realtime">Real-time (Immediate)</option>
                                            <option value="hourly">Hourly Digest</option>
                                            <option value="daily">Daily Digest</option>
                                            <option value="weekly">Weekly Digest</option>
                                        </select>
                                    </div>
                                </div>

                                <!-- Privacy Tab -->
                                <div v-if="activeTab === 'privacy'" class="fade-in">
                                    <div class="alert alert-info border-0 bg-soft-info">
                                        <i class="fas fa-info-circle me-2"></i>
                                        Control who can see your profile information.
                                    </div>

                                    <div class="mb-4">
                                        <label class="form-label d-block mb-2">Profile Visibility</label>
                                        <div class="btn-group w-100" role="group">
                                            <input type="radio" class="btn-check" name="visibility" id="visPublic" value="public" v-model="settings.profile_visibility">
                                            <label class="btn btn-outline-primary" for="visPublic">
                                                <i class="fas fa-globe me-2"></i> Public
                                            </label>

                                            <input type="radio" class="btn-check" name="visibility" id="visConnections" value="connections" v-model="settings.profile_visibility">
                                            <label class="btn btn-outline-primary" for="visConnections">
                                                <i class="fas fa-users me-2"></i> Connections
                                            </label>

                                            <input type="radio" class="btn-check" name="visibility" id="visPrivate" value="private" v-model="settings.profile_visibility">
                                            <label class="btn btn-outline-primary" for="visPrivate">
                                                <i class="fas fa-lock me-2"></i> Private
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <hr class="my-4">

                                <div class="d-flex justify-content-end">
                                    <button type="submit" class="btn btn-primary px-4" :disabled="loading">
                                        <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
};

export { SettingsApp as Settings };




