// Core Framework Infrastructure
import { container, $fx } from './services/serviceContainer.js';
import { useModules } from './services/module.js';
import { directives } from './directives/index.js';

// Services
import { api } from './components/services/api.js';

// Composables
import * as composables from './components/composable/index.js';

// UI Components
import * as ui from './components/ui/index.js';

// Diagnostics
import { diagnostics } from './components/services/Diagnostics.js';

// Layout Components
import { MainLayout, Sidebar, Header, MenuItem } from './components/layout/index.js';

// Utils
import { handleResponseCode, RESPONSE_CODES } from './components/utils/responseCodes.js';

/**
 * ERP Framework Plugin
 */
const ErpFramework = {
    install(app) {
        const modules = useModules(container);

        // 1. Core Module Setup (Basic Services)
        modules.register({
            name: 'core',
            setup(c) {
                // Persistent/Critical Services (Registered as Instances)
                c.register('api', api);
                c.register('auth', composables.useAuth);
                c.register('toast', composables.useToast);
                c.register('config', composables.useConfig);
                c.register('tasks', composables.useTasks);
                c.register('menu', composables.useMenu);
                c.register('dialog', composables.useDialog);
                c.register('config', composables.useConfig); // Ensure config is instance
                // c.register('utils', { handleResponseCode, RESPONSE_CODES }); // Merged into useUtils

                // Diagnostics Service (Professional Observability)
                c.register('diagnostics', diagnostics);

                // Lazy/Heavy Services (Registered as Factories)
                c.registerFactory('permission', (c) => composables.usePermission(c));
                // Dialog moved to instance: c.registerFactory('dialog', (c) => composables.useDialog(c));
                c.registerFactory('loading', (c) => composables.useLoading(c));
                c.registerFactory('format', (c) => composables.useFormatter(c));
                c.registerFactory('bus', (c) => composables.useEventBus(c));
                c.registerFactory('utils', (c) => {
                    const u = composables.useUtils(c);
                    return { ...u, handleResponseCode, RESPONSE_CODES };
                });
                c.registerFactory('export', (c) => composables.useExport(c));
                c.registerFactory('charts', (c) => composables.useCharts(c));
                c.registerFactory('ui', (c) => composables.useUI(c));
                c.registerFactory('socket', (c) => composables.useSocket(c));
                c.registerFactory('meta', (c) => composables.useMetadata(c));
                c.registerFactory('cmd', (c) => composables.useCommand(c));
                c.registerFactory('files', (c) => composables.useFiles(c));
                c.registerFactory('validation', (c) => composables.useValidation(c));
                c.registerFactory('collaboration', (c) => composables.useCollaboration(c));
            }
        });

        // Initialize Modules & Container
        modules.init();
        container.init();

        // 1.1 Hydrate Stores (Bulk Load)
        // Must happen after modules/container init but before app mount (ideally)
        // Since we are in install(), app is not mounted yet.
        // We need to import hydrationManager here or get it from a service if registered.
        // It's a static import in createStore, so we can import it here too.
        import('./store/hydrationManager.js').then(({ hydrationManager }) => {
            hydrationManager.load();
        });

        // 1.5 Global Init (Commands)
        const cmd = container.get('cmd');
        cmd.initGlobalShortcuts();

        // Register Core Navigation Commands
        cmd.register({
            id: 'nav-dashboard',
            title: 'Go to Dashboard',
            icon: 'fas fa-home',
            shortcut: 'g d',
            action: () => container.get('utils').navigate('/dashboard')
        });

        cmd.register({
            id: 'nav-users',
            title: 'User Management',
            icon: 'fas fa-users',
            shortcut: 'g u',
            action: () => container.get('utils').navigate('/accounts/users')
        });

        cmd.register({
            id: 'ui-toggle-sidebar',
            title: 'Toggle Sidebar',
            icon: 'fas fa-columns',
            shortcut: 'b',
            action: () => {
                const sidebar = document.querySelector('.sidebar');
                if (sidebar) {
                    const toggleBtn = sidebar.querySelector('.toggle-btn');
                    if (toggleBtn instanceof HTMLElement) toggleBtn.click();
                }
            }
        });

        // 2. Register UI Components
        const components = {
            ...ui,
            AppHeader: Header,
            MainLayout,
            Sidebar,
            MenuItem
        };

        for (const [key, component] of Object.entries(components)) {
            if (component) {
                const componentName = key
                    .replace(/\.?([A-Z]+)/g, (x, y) => "-" + y.toLowerCase())
                    .replace(/^-/, "");
                app.component(componentName, component);
            }
        }

        // 3. Register Global Directives
        for (const [name, directive] of Object.entries(directives)) {
            app.directive(name, directive);
        }

        /**
         * 4. Register $fx Global Proxy
         * Uses a Proxy to ensure lazy resolution via container
         */
        app.config.globalProperties.$fx = new Proxy({}, {
            get(target, prop) {
                // Special mapping for short aliases defined in base.js
                const aliases = {
                    p: 'permission',
                    f: 'format',
                    ws: 'socket',
                    exp: 'export',
                    chart: 'charts',
                    u: 'utils', // Points to the merged utils service
                    router: 'router'
                };
                const serviceName = aliases[prop] || prop;

                try {
                    return container.get(serviceName);
                } catch (e) {
                    // If not in container, return from target if exists
                    return target[prop];
                }
            }
        });

        // Legacy compatibility
        app.config.globalProperties.$api = api;

        console.log('[Framework] ERP Framework initialized (Modular).');
    }
};

export {
    $fx,
    container,
    ErpFramework,
    useModules
};