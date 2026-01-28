import { ref, onErrorCaptured, defineComponent, h } from 'vue';
import { CrashReporter } from './CrashReporter.js';

export const ErrorBoundary = defineComponent({
    name: 'ErrorBoundary',
    setup(_, { slots }) {
        const error = ref(null);

        onErrorCaptured((err, instance, info) => {
            console.error('[Framework] Error captured by boundary:', err, info);
            error.value = err;

            // Log to Diagnostics service
            if (window.$fx?.diagnostics) {
                window.$fx.diagnostics.logError('Component Crash', {
                    error: err.stack || err.message,
                    info,
                    component: instance?.$.type?.name || 'Unknown'
                });
            }

            return false; // Prevent further propagation
        });

        return () => {
            if (error.value) {
                if (slots.error) {
                    return slots.error({ error: error.value });
                }
                return h(CrashReporter, { error: error.value });
            }
            return slots.default ? slots.default() : null;
        };
    }
});
