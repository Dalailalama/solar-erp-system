import { ref } from 'vue';

const isLoading = ref(false);
const activeRequests = ref(0);

/**
 * useLoading Composable
 * Global loading state management.
 */
export function useLoading(container) {

    const start = () => {
        activeRequests.value++;
        isLoading.value = true;
    };

    const finish = () => {
        activeRequests.value--;
        if (activeRequests.value <= 0) {
            activeRequests.value = 0;
            isLoading.value = false;
        }
    };

    return {
        isLoading,
        start,
        finish
    };
}
