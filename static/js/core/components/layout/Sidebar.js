
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
            </nav>
            
            <div v-if="loading" class="menu-loading">
                <i class="fas fa-spinner fa-spin"></i> Loading menu...
            </div>
        </div>
    `,
    setup(props, { emit }) {
        const config = useConfig;

        const isCollapsed = computed(() => config.sidebarCollapsed);
        const activeRoute = ref('/dashboard');
        const menuStore = useMenu;

        const menuItems = computed(() => menuStore.items);
        const loading = computed(() => menuStore.loading);

        const toggleSidebar = () => {
            config.toggleSidebar();
            emit('toggle', config.sidebarCollapsed);
        };

        const handleNavigation = (menuItem) => {
            activeRoute.value = menuItem.route;
            emit('navigate', menuItem);
        };

        onMounted(async () => {
            menuStore.loadMenu();
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


