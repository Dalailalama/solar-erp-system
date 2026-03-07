
export const MainLayout = {
    template: `
        <div class="erp-container" :class="{ 'collapsed': collapsed }">
            <sidebar @toggle="collapsed = $event" @navigate="handleNavigation"></sidebar>
            
            <div class="main-content">
                <app-header :page-title="currentPage" @navigate="handleNavigation"></app-header>
                <div class="content-area">
                    <div class="page-content">
                        <error-boundary>
                            <router-view v-slot="{ Component }">
                                <keep-alive>
                                    <component :is="Component" />
                                </keep-alive>
                            </router-view>
                        </error-boundary>
                        
                        <!-- Fallback for generic content if no route matches -->
                        <div v-if="!$route.matched.length">
                            <h2>{{ currentPage }}</h2>
                            <p>Select an item from the sidebar.</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Global Overlay Components (Fixed Position) -->
            <toast-container></toast-container>
            <command-palette></command-palette>
            <loading-bar></loading-bar>
            <confirm-dialog></confirm-dialog>
        </div>
    `,
    setup() {
        const authStore = useAuth;
        const config = useConfig;
        const route = useRoute();
        const router = useRouter();

        // Use global config for layout state
        const collapsed = computed(() => config.sidebarCollapsed);
        const currentPage = ref('Dashboard');

        // Update title based on route name
        watch(route, (newRoute) => {
            if (newRoute.name) {
                currentPage.value = newRoute.name.toString();
            }
        });

        const handleNavigation = (menuItem) => {
            if (menuItem && menuItem.route) {
                router.push(menuItem.route);
            }
        };

        onMounted(async () => {
            await authStore.fetchUser();

            // Apply Theme Preference
            try {
                const { useApi } = await import('../composable/useApi.js');
                const api = useApi();
                const prefs = await api.get('/accounts/preferences/');
                if (prefs && prefs.theme) {
                    document.documentElement.setAttribute('data-theme', prefs.theme);
                }
            } catch (error) {
                console.error('Failed to apply theme preference:', error);
            }
        });

        return {
            collapsed,
            currentPage,
            handleNavigation
        };
    }
};


