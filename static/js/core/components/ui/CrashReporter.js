/**
 * Crash Reporter Component
 * Displayed when a catastrophic framework error occurs.
 */
import { ref } from 'vue';

export const CrashReporter = {
    props: {
        error: { type: [Error, String, Object], default: 'Unknown Error' }
    },
    setup(props) {
        const showDetails = ref(false);
        const diagnosticData = window.$fx?.diagnostics?.getSnapshot() || {};

        const copyReport = () => {
            const report = JSON.stringify(diagnosticData, null, 2);
            navigator.clipboard.writeText(report);
            alert('Diagnostic report copied to clipboard!');
        };

        const reload = () => {
            window.location.reload();
        };

        return {
            showDetails,
            diagnosticData,
            copyReport,
            reload
        };
    },
    template: `
        <div class="crash-reporter">
            <div class="crash-card">
                <div class="crash-icon">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <h2>Oops! Something went wrong</h2>
                <p>The application encountered an unexpected error. Our team has been notified (simulated).</p>
                
                <div class="crash-actions">
                    <button @click="reload" class="btn-primary">
                        <i class="fas fa-sync"></i> Reload Application
                    </button>
                    <button @click="showDetails = !showDetails" class="btn-secondary">
                        {{ showDetails ? 'Hide' : 'View' }} Technical Details
                    </button>
                </div>

                <div v-if="showDetails" class="crash-details">
                    <pre>{{ error }}</pre>
                    <div class="diagnostic-actions">
                        <button @click="copyReport" class="btn-sm">
                            <i class="fas fa-copy"></i> Copy Diagnostic Report
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `
};
