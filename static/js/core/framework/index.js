// Central framework barrel for ERP frontend
// Import from '@fx' instead of deep relative paths.

export {
    createApp,
    ref,
    reactive,
    computed,
    watch,
    onMounted,
    onUnmounted,
    nextTick,
    defineComponent,
    h,
    onErrorCaptured
} from 'vue';

export {
    createRouter,
    createWebHistory,
    useRoute,
    useRouter
} from 'vue-router';

export * from '../components/composable/index.js';
export { api } from '../components/services/api.js';
export { container, $fx, ErpFramework } from '../base.js';
