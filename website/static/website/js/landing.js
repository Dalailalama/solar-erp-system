import { createApp, ref } from 'vue';
import { useNotification } from '../../js/core/components/composable/useNotification.js';
import { useApi } from '../../js/core/components/services/api.js';

// Define the Landing Page App
const LandingApp = {
    setup() {
        const { showSuccess, showError } = useNotification();
        const api = useApi();

        const contactForm = ref({
            name: '',
            email: '',
            phone: '',
            message: ''
        });

        const loading = ref(false);

        const submitContact = async () => {
            loading.value = true;
            try {
                // Simulate API call using framework's api service
                // const response = await api.post('/api/contact/', contactForm.value); 

                // For demo, just simulate delay
                await new Promise(resolve => setTimeout(resolve, 1500));

                showSuccess('Quote Request Sent!', 'We have received your details and will call you shortly.');

                // Reset form
                contactForm.value = { name: '', email: '', phone: '', message: '' };

            } catch (err) {
                showError('Submission Failed', 'Please try again later.');
            } finally {
                loading.value = false;
            }
        };

        // Scroll Handling for Navbar
        const isScrolled = ref(false);
        window.addEventListener('scroll', () => {
            isScrolled.value = window.scrollY > 50;
        });

        return {
            contactForm,
            submitContact,
            loading,
            isScrolled
        };
    }
};

// Mount to #app (which wraps the main content in base.html)
// Note: transforming the existing DOM which is rendered by Django
const app = createApp(LandingApp);
app.mount('#landing-app');
