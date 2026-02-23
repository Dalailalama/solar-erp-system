/**
 * Contact Page Logic - Vite Entry Point
 * Uses Core Framework's useApi for standardized submissions
 */
import { createApp, ref, computed } from 'vue';
import { useApi } from '@core/components/composable/useApi';

const ContactApp = {
    delimiters: ['[[', ']]'],
    setup() {
        const { post, loading: isSubmitting, error: submitError, RESPONSE_CODES } = useApi({
            showSuccessToast: true,
            showErrorToast: true,
            successMessage: 'Your inquiry has been received. Our engineers will reach out shortly.'
        });

        const selectedBranch = ref('ahmedabad');
        const submitSuccess = ref(false);

        // Form Fields
        const formFields = ref({
            full_name: '',
            email: '',
            phone: '',
            contactSubject: '',
            message: ''
        });

        // Branch Data
        const branches = {
            'ahmedabad': {
                name: 'Ahmedabad (Head Office)',
                address: 'B-409, Celebration City Center, South Bopal',
                city: 'Ahmedabad, Gujarat 380058',
                phone: '+917984482472',
                displayPhone: '+91 79844 82472',
                email: 'info@ultrarayssolar.com',
                hours: 'Mon - Sat: 9:00 AM - 6:30 PM',
                mapSrc: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d58752.03112101433!2d72.39602814863281!3d23.023700800000025!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x395e9bff7bc9381d%3A0x90c3e5d9d557b686!2sUltrarays%20Solar%20Energy%20Solution!5e0!3m2!1sen!2sin!4v1771519686819!5m2!1sen!2sin'
            },
            'bhavnagar': {
                name: 'Bhavnagar Branch',
                address: 'Shop No. G-2, Jito Pride complex, 150ft Ring road',
                city: 'Bhavnagar, Gujarat 364002',
                phone: '+917383149898',
                displayPhone: '+91 73831 49898',
                email: 'info@ultrarayssolar.com',
                hours: 'Mon - Sat: 9:00 AM - 6:30 PM',
                mapSrc: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d58752.03112101433!2d72.39602814863281!3d23.023700800000025!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x395e9bff7bc9381d%3A0x90c3e5d9d557b686!2sUltrarays%20Solar%20Energy%20Solution!5e0!3m2!1sen!2sin!4v1771519686819!5m2!1sen!2sin'
            },
            'dholka': {
                name: 'Dholka Branch',
                address: 'Shop no-07, Hare Krihna complex, near maruti suzuki showroom,ranoda road',
                city: 'Dholka, Gujarat 382225',
                phone: '+919898815381',
                displayPhone: '+91 98988 15381',
                email: 'info@ultrarayssolar.com',
                hours: 'Mon - Sat: 9:30 AM - 6:30 PM',
                mapSrc: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d58871.1252178115!2d72.36490584863282!3d22.748849000000014!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x395eed80bf373db3%3A0x8b2f2402cbfcbfc3!2sUltrarays%20Energy%20Solution!5e0!3m2!1sen!2sin!4v1771520753301!5m2!1sen!2sin'
            }
        };

        // Computeds
        const currentBranch = computed(() => {
            return branches[selectedBranch.value] || branches['ahmedabad'];
        });

        // Methods
        const submitForm = async () => {
            try {
                // Using core framework's standardized post
                const result = await post('crm/forms/submit', {
                    form_name: 'contact_us',
                    data: formFields.value
                });

                if (result && result.code === 1) {
                    submitSuccess.value = true;
                    // Clear form
                    formFields.value = {
                        full_name: '',
                        email: '',
                        phone: '',
                        contactSubject: '',
                        message: ''
                    };
                }
            } catch (err) {
                console.error('Contact submission error:', err);
                // useApi handles the error toast if showErrorToast is true
            }
        };

        return {
            selectedBranch,
            formFields,
            isSubmitting,
            submitError,
            submitSuccess,
            submitForm,
            branches,
            currentBranch
        };
    }
};

// Mount the app
console.log('[ContactApp] Starting mount on #contact-app');
const app = createApp(ContactApp);

// Error Handling
app.config.errorHandler = (err, vm, info) => {
    console.error('[ContactApp] Global Error:', err);
    console.group('[ContactApp] Diagnostic Info');
    console.log('Component:', vm);
    console.log('Info:', info);
    console.groupEnd();
};

try {
    const rootEl = document.querySelector('#contact-app');
    if (rootEl) {
        const mountedApp = app.mount('#contact-app');
        console.log('[ContactApp] Mount SUCCESS', mountedApp ? 'Instance Ready' : 'Instance Empty');
    } else {
        console.error('[ContactApp] CRITICAL: Mount target #contact-app not found in DOM');
    }
} catch (mountError) {
    console.error('[ContactApp] Mount CRASH:', mountError);
}
