import { useLoading } from '../composable/useLoading.js';

export const LoadingBar = {
    name: 'LoadingBar',
    setup() {
        const { isLoading } = useLoading();
        return { isLoading };
    },
    template: `
        <div v-if="isLoading" class="loading-bar-container">
            <div class="loading-bar"></div>
        </div>
    `
};
