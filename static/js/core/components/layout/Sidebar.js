import { ref, onMounted, computed } from 'vue';
import { useMenu } from '../composable/useMenu.js';
import { useConfig } from '../composable/useConfig.js';

export const Sidebar = {
    template: `
        <div :class="['sidebar', { collapsed: isCollapsed }]">
            <button @click="toggleSidebar" class="toggle-btn">
                <i :class="isCollapsed ? 'fas fa-bars' : 'fas fa-times'"></i>
            </button>
            
            <div class="sidebar-header">
                <h2>ERP System</h2>
            </div>
            
            <nav class="menu" v-if="!loading">
                <menu-item 
                    v-for="item in menuItems"
                    :key="item.id"
                    :item="item"
                    :collapsed="isCollapsed"
                    :active-route="activeRoute"
                    @navigate="handleNavigation"
                />

                <!-- Developer Examples Section -->
                <div class="sidebar-divider my-2 border-top border-secondary opacity-25" v-if="!isCollapsed"></div>
                
                <div class="menu-label small text-muted px-3 py-2 text-uppercase fw-bold" v-if="!isCollapsed" style="font-size: 0.7rem;">
                    Framework Examples
                </div>

                <menu-item 
                    :item="{ id: 'ex-search', label: 'Search & Filter', icon: 'fas fa-search', route: '/examples/search-filter' }"
                    :collapsed="isCollapsed"
                    :active-route="activeRoute"
                    @navigate="handleNavigation"
                />
                
                <menu-item 
                    :item="{ id: 'ex-virtual', label: 'Virtual Scroll', icon: 'fas fa-rocket', route: '/examples/virtual-scroll' }"
                    :collapsed="isCollapsed"
                    :active-route="activeRoute"
                    @navigate="handleNavigation"
                />

                <menu-item 
                    :item="{ id: 'ex-valid', label: 'Form Validation', icon: 'fas fa-check-double', route: '/examples/validation' }"
                    :collapsed="isCollapsed"
                    :active-route="activeRoute"
                    @navigate="handleNavigation"
                />
                
                <menu-item 
                    :item="{ id: 'ex-collab', label: 'Collaboration', icon: 'fas fa-users-cog', route: '/examples/collaboration' }"
                    :collapsed="isCollapsed"
                    :active-route="activeRoute"
                    @navigate="handleNavigation"
                />
            </nav>
            
            <div v-if="loading" class="menu-loading">
                <i class="fas fa-spinner fa-spin"></i> Loading menu...
            </div>
        </div>
    `,
    setup(props, { emit }) {
        // Use Global Config Store (Persisted)
        const config = useConfig;

        const isCollapsed = computed(() => config.sidebarCollapsed);
        const activeRoute = ref('/dashboard');
        const menuStore = useMenu;

        // computed property to maintain reactivity for the template
        const menuItems = computed(() => menuStore.items);
        const loading = computed(() => menuStore.loading);

        const toggleSidebar = () => {
            config.toggleSidebar();
            // Emit for parent components if they listen (MainLayout)
            // But MainLayout will also assume useConfig, so emit might be redundant or strictly for syncing local layout state if not using store there.
            // We'll keep emit for compatibility but switch MainLayout to store too.
            emit('toggle', config.sidebarCollapsed);
        };

        const handleNavigation = (menuItem) => {
            activeRoute.value = menuItem.route;
            emit('navigate', menuItem);
        };

        onMounted(async () => {
            menuStore.loadMenu();
            // Preference loading is now handled by hydrationManager (local) or could be sync via API in useConfig.
            // We remove the manual API call here to rely on the Hydration System.
        });

        return {
            isCollapsed,
            menuItems,
            loading,
            activeRoute,
            toggleSidebar,
            handleNavigation
        };
    }
};