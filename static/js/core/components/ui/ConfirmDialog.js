import { useDialog } from '../composable/useDialog.js';

export const ConfirmDialog = {
    name: 'ConfirmDialog',
    setup() {
        const dialogStore = useDialog;

        // Expose reactive state directly
        // New store has $state property which is the reactive state object
        const handleConfirm = () => dialogStore.close(true);
        const handleCancel = () => dialogStore.close(false);

        return {
            state: dialogStore.$state,
            handleConfirm,
            handleCancel
        };
    },
    template: `
        <transition name="fade">
            <div v-if="state.isOpen" class="modal d-block" tabindex="-1" role="dialog" style="background: rgba(0,0,0,0.5)">
                <div class="modal-dialog modal-dialog-centered" role="document">
                    <div class="modal-content shadow-lg border-0">
                        <div class="modal-header border-bottom-0 pb-0">
                            <h5 class="modal-title fw-bold">{{ state.title }}</h5>
                            <button type="button" class="btn-close" @click="handleCancel"></button>
                        </div>
                        <div class="modal-body py-4">
                            <p class="mb-0 fs-6 text-secondary">{{ state.message }}</p>
                        </div>
                        <div class="modal-footer border-top-0 pt-0">
                            <button 
                                v-if="state.type === 'confirm'" 
                                type="button" 
                                class="btn btn-light" 
                                @click="handleCancel"
                            >
                                {{ state.cancelText }}
                            </button>
                            <button 
                                type="button" 
                                class="btn px-4" 
                                :class="'btn-' + state.variant"
                                @click="handleConfirm"
                            >
                                {{ state.confirmText }}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </transition>
    `
};
