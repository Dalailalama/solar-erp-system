// Toast Component - Single toast notification
import { ref, onMounted, computed } from 'vue';

export const Toast = {
    name: 'Toast',
    props: {
        id: {
            type: [String, Number],
            required: true
        },
        message: {
            type: String,
            required: true
        },
        type: {
            type: String,
            default: 'info',
            validator: (value) => ['success', 'error', 'warning', 'info', 'custom'].includes(value)
        },
        duration: {
            type: Number,
            default: 3000  // Internal: milliseconds (user provides seconds, converted in useToast)
        },
        customClass: {
            type: String,
            default: ''
        },
        customStyle: {
            type: Object,
            default: () => ({})
        },
        showIcon: {
            type: Boolean,
            default: true
        },
        closable: {
            type: Boolean,
            default: true
        },
        pauseOnHover: {
            type: Boolean,
            default: true
        }
    },
    emits: ['close'],
    template: `
        <div 
            :class="['toast', 'toast-' + type, customClass, { 'toast-entering': isEntering }]"
            :style="mergedStyle"
            @mouseenter="handleMouseEnter"
            @mouseleave="handleMouseLeave"
            role="alert"
            aria-live="polite"
        >
            <div class="toast-content">
                <i v-if="showIcon && type !== 'custom'" :class="['toast-icon', iconClass]"></i>
                <span class="toast-message">{{ message }}</span>
            </div>
            <button 
                v-if="closable"
                class="toast-close"
                @click="handleClose"
                aria-label="Close notification"
            >
                <i class="fas fa-times"></i>
            </button>
        </div>
    `,
    setup(props, { emit }) {
        const isEntering = ref(true);
        const isPaused = ref(false);
        let timeoutId = null;
        let remainingTime = ref(props.duration);
        let startTime = null;

        const iconClass = computed(() => {
            const icons = {
                success: 'fas fa-check-circle',
                error: 'fas fa-times-circle',
                warning: 'fas fa-exclamation-triangle',
                info: 'fas fa-info-circle'
            };
            return icons[props.type] || '';
        });

        const mergedStyle = computed(() => {
            return { ...props.customStyle };
        });

        const startTimer = () => {
            if (props.duration && props.duration > 0) {
                startTime = Date.now();
                timeoutId = setTimeout(() => {
                    handleClose();
                }, remainingTime.value);
            }
        };

        const pauseTimer = () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
                remainingTime.value -= Date.now() - startTime;
            }
        };

        const resumeTimer = () => {
            if (props.duration && props.duration > 0 && remainingTime.value > 0) {
                startTimer();
            }
        };

        const handleMouseEnter = () => {
            if (props.pauseOnHover) {
                isPaused.value = true;
                pauseTimer();
            }
        };

        const handleMouseLeave = () => {
            if (props.pauseOnHover) {
                isPaused.value = false;
                resumeTimer();
            }
        };

        const handleClose = () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
            emit('close', props.id);
        };

        onMounted(() => {
            // Trigger enter animation
            setTimeout(() => {
                isEntering.value = false;
            }, 10);

            // Start auto-dismiss timer
            startTimer();
        });

        return {
            isEntering,
            iconClass,
            mergedStyle,
            handleMouseEnter,
            handleMouseLeave,
            handleClose
        };
    }
};
