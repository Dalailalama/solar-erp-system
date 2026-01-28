// Main application entry point
import { createApp } from 'vue';
import { router } from './router.js';
import { container } from './services/serviceContainer.js';

// Import ERP Framework Plugin
import { ErpFramework } from './base.js';

const app = createApp({
    template: `
        <main-layout></main-layout>
        <toast-container position="top-right"></toast-container>
    `
});

// 1. Register router in container first (so services can use it)
container.register('router', router);

// 2. Install ERP Framework (registers all global components)
app.use(ErpFramework);

// 3. Setup router
app.use(router);

app.mount('#app');
