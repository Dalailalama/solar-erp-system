import { createStore } from '../../store/createStore.js';

/**
 * useTasks Store
 * Manages and tracks persistent background tasks (reports, imports, etc.)
 */
export const useTasks = createStore('tasks', {
    state: () => ({
        tasks: []
    }),

    persist: ['tasks'], // Tasks survive page refreshes!

    getters: {
        activeTasks: (state) => state.tasks.filter(t => t.status === 'running'),
        hasActiveTasks: (state, getters) => state.activeTasks.length > 0
    },

    actions: {
        startTask(task) {
            const newTask = {
                id: Date.now(),
                status: 'running',
                progress: 0,
                ...task
            };
            this.tasks.push(newTask);
            return newTask.id;
        },

        updateTask(id, updates) {
            const index = this.tasks.findIndex(t => t.id === id);
            if (index > -1) {
                this.tasks[index] = { ...this.tasks[index], ...updates };
            }
        },

        finishTask(id, success = true) {
            this.updateTask(id, {
                status: success ? 'completed' : 'error',
                progress: 100
            });

            // Auto-remove completed tasks after 5 seconds
            setTimeout(() => {
                this.removeTask(id);
            }, 5000);
        },

        removeTask(id) {
            const index = this.tasks.findIndex(t => t.id === id);
            if (index > -1) {
                this.tasks.splice(index, 1);
            }
        }
    }
});
