/**
 * Ultra Rays Solar - Vue 3 Main App
 * Professional, production-ready Vue application
 */

import { createApp } from 'vue';
import SolarApp from './SolarApp.vue';
import { registerDirectives } from './directives';
import { registerPlugins } from './plugins';

// Create Vue app
const app = createApp(SolarApp);

// Use plugins
registerPlugins(app);
registerDirectives(app);

// Global error handler
app.config.errorHandler = (err, instance, info) => {
    console.error('Vue Error:', err);
    console.error('Component:', instance);
    console.error('Info:', info);
};

// Mount app
app.mount('#solar-vue-app'); // Updated mount point ID to match base.html plan

export { app };
