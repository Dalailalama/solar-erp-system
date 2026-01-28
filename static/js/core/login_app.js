import { createApp } from 'vue';
import { LoginForm } from './components/auth/LoginForm.js';
import { ToastContainer } from './components/ui/ToastContainer.js';

const app = createApp({
    components: {
        LoginForm,
        ToastContainer
    }
});

app.mount('#login-app');
