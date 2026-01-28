/**
 * useWorkflow Composable
 * Workflow Engine for managing approval chains and state transitions.
 */
import { ref, computed, reactive } from 'vue';
import { useAuth } from './useAuth.js';

export function createWorkflow(definition) {
    const {
        name,
        steps,
        initialStep = steps[0]?.id,
        onComplete,
        onStateChange
    } = definition;

    // State
    const currentStepId = ref(initialStep);
    const history = ref([]);
    const context = reactive({}); // Workflow data context
    const status = ref('active'); // 'active', 'completed', 'rejected'
    const error = ref(null);

    const auth = useAuth; // Singleton store access

    // Getters
    const currentStep = computed(() => steps.find(s => s.id === currentStepId.value));

    const isCompleted = computed(() => status.value === 'completed');

    /**
     * Check if current user can perform an action
     */
    const canPerformAction = (actionName) => {
        if (!currentStep.value) return false;

        // 1. Check Role
        const requiredRole = currentStep.value.role;
        if (requiredRole) {
            const userRoles = auth.user?.groups || [];
            // Allow if user has role OR is superuser
            if (!userRoles.includes(requiredRole) && !auth.user?.is_superuser) {
                return false;
            }
        }

        // 2. Check Action Existence
        // Action can be a string "approve|reject" or array
        const allowedActions = currentStep.value.action.split('|');
        if (!allowedActions.includes(actionName)) return false;

        // 3. Check Condition (if any)
        if (currentStep.value.condition) {
            // Safe eval of condition against context
            try {
                // Function constructor for sandboxed-ish eval
                const check = new Function('ctx', `with(ctx) { return ${currentStep.value.condition} }`);
                if (!check(context)) return false;
            } catch (e) {
                console.error('[Workflow] Condition check failed', e);
                return false;
            }
        }

        return true;
    };

    /**
     * Transition to next step
     */
    const transition = async (action, note = '') => {
        error.value = null;

        if (!canPerformAction(action)) {
            error.value = 'You do not have permission to perform this action.';
            return false;
        }

        // Record history
        history.value.push({
            stepId: currentStepId.value,
            action,
            actor: auth.user?.username || 'system',
            timestamp: new Date(),
            note
        });

        // Determine next state
        // This logic depends on how 'next' is defined in definition.
        // For this simple engine, we assume linear or explicit 'next' map.
        // Or if action is 'reject', maybe go back or fail?

        if (action === 'reject') {
            status.value = 'rejected';
            if (onStateChange) onStateChange('rejected', context);
            return true;
        }

        // Find next step
        // In a real engine, this is a graph traversal. 
        // Here we default to next in array index unless explicit 'next' provided?
        // Let's assume definition has simplistic logic for now or we just move to next index.

        const currentIndex = steps.findIndex(s => s.id === currentStepId.value);
        let nextStepId = null;

        if (currentStep.value.transitions && currentStep.value.transitions[action]) {
            nextStepId = currentStep.value.transitions[action];
        } else if (currentIndex < steps.length - 1) {
            nextStepId = steps[currentIndex + 1].id;
        }

        if (nextStepId) {
            currentStepId.value = nextStepId;
            if (onStateChange) onStateChange(nextStepId, context);
        } else {
            // No next step = completion
            status.value = 'completed';
            if (onComplete) onComplete(context);
        }

        return true;
    };

    /**
     * Initialize workflow with data
     */
    const init = (data = {}) => {
        Object.assign(context, data);
        currentStepId.value = initialStep;
        history.value = [];
        status.value = 'active';
    };

    return {
        // State
        currentStepId,
        currentStep,
        history,
        context,
        status,
        error,

        // Methods
        init,
        transition,
        canPerformAction,

        // Helpers
        getAvailableActions: computed(() => currentStep.value?.action?.split('|') || [])
    };
}
