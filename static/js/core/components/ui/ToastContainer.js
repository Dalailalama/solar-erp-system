// ToastContainer Component - Manages multiple toasts
import { Toast } from './Toast.js';
import { useToast } from '../composable/useToast.js';

export const ToastContainer = {
    name: 'ToastContainer',
    components: {
        Toast
    },
    props: {
        position: {
            type: String,
            default: 'top-right',
            validator: (value) => [
                'top-right', 'top-left', 'top-center',
                'bottom-right', 'bottom-left', 'bottom-center'
            ].includes(value)
        }
    },
    template: `
        <teleport to="body">
            <div :class="['toast-container', 'toast-container-' + position]">
                <transition-group name="toast-list" tag="div">
                    <toast
                        v-for="toast in toasts"
                        :key="toast.id"
                        :id="toast.id"
                        :message="toast.message"
                        :type="toast.type"
                        :duration="toast.duration"
                        :custom-class="toast.customClass"
                        :custom-style="toast.customStyle"
                        :show-icon="toast.showIcon"
                        :closable="toast.closable"
                        :pause-on-hover="toast.pauseOnHover"
                        @close="handleClose"
                    />
                </transition-group>
            </div>
        </teleport>
    `,
    setup() {
        const toastStore = useToast;
        const toasts = toastStore.toasts;

        const handleClose = (id) => {
            toastStore.remove(id);
        };

        return {
            toasts,
            handleClose
        };
    }
};
