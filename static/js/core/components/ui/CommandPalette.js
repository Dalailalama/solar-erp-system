import { ref, reactive, computed, onMounted, nextTick, watch } from 'vue';
import { useCommand } from '../composable/useCommand.js';
import '../../../../css/core/command-palette.css';

export const CommandPalette = {
    name: 'CommandPalette',
    template: `
        <transition name="fade">
            <div v-if="state.isOpen" class="command-palette-overlay" @click="close">
                <div class="command-palette-modal" @click.stop>
                    <div class="command-input-wrapper">
                        <i v-if="state.isLoading" class="fas fa-spinner fa-spin text-primary"></i>
                        <i v-else class="fas fa-search"></i>
                        <input 
                            ref="inputRef"
                            v-model="state.searchQuery"
                            @input="handleInput"
                            @keydown.esc="close"
                            @keydown.down="moveNext"
                            @keydown.up="movePrev"
                            @keydown.enter="executeCurrent"
                            type="text" 
                            placeholder="Search commands or data (Users, Products...)"
                        >
                    </div>
                    
                    <div class="command-results" v-if="hasResults || state.isLoading">
                        <!-- Loading State for Providers -->
                        <div v-if="state.isLoading && !state.results.length" class="result-group border-0">
                            <div class="p-3 text-center text-muted">
                                <i class="fas fa-spinner fa-spin me-2"></i> Searching for "{{ state.searchQuery }}"...
                            </div>
                        </div>

                        <!-- Static Commands Category -->
                        <div v-if="state.results.length" class="result-group">
                            <div class="group-label">Commands</div>
                            <div 
                                v-for="(cmd, index) in state.results" 
                                :key="'cmd-' + cmd.id"
                                :class="['command-item', { active: isSelected(index, 'cmd') }]"
                                @click="executeCommand(cmd)"
                                @mouseenter="setSelection(index, 'cmd')"
                            >
                                <div class="cmd-info">
                                    <i :class="cmd.icon || 'fas fa-terminal'"></i>
                                    <span>{{ cmd.title }}</span>
                                </div>
                                <span class="cmd-shortcut" v-if="cmd.shortcut">{{ cmd.shortcut }}</span>
                            </div>
                        </div>

                        <!-- Provider Categories -->
                        <div v-for="(results, category) in state.providerResults" :key="category" class="result-group">
                            <div class="group-label">{{ category }}</div>
                            <div 
                                v-for="(item, index) in results" 
                                :key="category + '-' + index"
                                :class="['command-item', { active: isSelected(index, category) }]"
                                @click="handleItemClick(item)"
                                @mouseenter="setSelection(index, category)"
                            >
                                <div class="cmd-info">
                                    <i :class="item.icon || 'fas fa-file-alt'"></i>
                                    <span>{{ item.title }}</span>
                                    <small v-if="item.subtitle" class="text-muted ms-2">{{ item.subtitle }}</small>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="command-empty" v-else-if="state.searchQuery && !state.isLoading">
                        No results found for "{{ state.searchQuery }}"
                    </div>

                    <div class="command-footer">
                        <span><kbd>Enter</kbd> to select</span>
                        <span><kbd>↑↓</kbd> to navigate</span>
                        <span><kbd>Esc</kbd> to close</span>
                    </div>
                </div>
            </div>
        </transition>
    `,
    setup() {
        const { state, close, search } = useCommand();
        const inputRef = ref(null);

        // Track category and index for selection
        const selection = reactive({
            category: 'cmd', // 'cmd' or provider name
            index: 0
        });

        const hasResults = computed(() => {
            return state.results.length > 0 || Object.keys(state.providerResults).length > 0;
        });

        const handleInput = () => {
            search(state.searchQuery);
            // Reset selection to first available item after search
            nextTick(() => {
                if (state.results.length > 0) {
                    selection.category = 'cmd';
                    selection.index = 0;
                } else {
                    const firstProviderCat = Object.keys(state.providerResults)[0];
                    if (firstProviderCat) {
                        selection.category = firstProviderCat;
                        selection.index = 0;
                    }
                }
            });
        };

        // Watch for provider results to set selection if currently empty
        watch(() => state.providerResults, (newVal) => {
            if (selection.category === 'cmd' && state.results.length === 0) {
                const firstCat = Object.keys(newVal)[0];
                if (firstCat) {
                    selection.category = firstCat;
                    selection.index = 0;
                }
            }
        }, { deep: true });

        const isSelected = (index, category) => {
            return selection.index === index && selection.category === category;
        };

        const setSelection = (index, category) => {
            selection.index = index;
            selection.category = category;
        };

        // All categories in order
        const allCategories = computed(() => {
            const cats = [];
            if (state.results.length) cats.push('cmd');
            Object.keys(state.providerResults).forEach(cat => cats.push(cat));
            return cats;
        });

        const moveNext = () => {
            const cats = allCategories.value;
            const currentCatIdx = cats.indexOf(selection.category);
            const currentResults = selection.category === 'cmd' ? state.results : state.providerResults[selection.category];

            if (selection.index < currentResults.length - 1) {
                selection.index++;
            } else if (currentCatIdx < cats.length - 1) {
                // Move to next category
                selection.category = cats[currentCatIdx + 1];
                selection.index = 0;
            }
        };

        const movePrev = () => {
            const cats = allCategories.value;
            const currentCatIdx = cats.indexOf(selection.category);

            if (selection.index > 0) {
                selection.index--;
            } else if (currentCatIdx > 0) {
                // Move to previous category's end
                const prevCat = cats[currentCatIdx - 1];
                const prevResults = prevCat === 'cmd' ? state.results : state.providerResults[prevCat];
                selection.category = prevCat;
                selection.index = prevResults.length - 1;
            }
        };

        const executeCurrent = () => {
            if (selection.category === 'cmd') {
                const cmd = state.results[selection.index];
                if (cmd) executeCommand(cmd);
            } else {
                const item = state.providerResults[selection.category][selection.index];
                if (item) handleItemClick(item);
            }
        };

        const executeCommand = (cmd) => {
            if (cmd.action) {
                cmd.action();
            } else if (cmd.url) {
                // Accessing navigate via global $fx
                window.$fx?.u?.navigate(cmd.url);
            }
            close();
        };

        const handleItemClick = (item) => {
            if (item.action) {
                item.action();
            } else if (item.url) {
                // Accessing navigate via global $fx
                window.$fx?.u?.navigate(item.url);
            }
            close();
        };

        return {
            state,
            inputRef,
            hasResults,
            isSelected,
            setSelection,
            close,
            handleInput,
            moveNext,
            movePrev,
            executeCurrent,
            executeCommand,
            handleItemClick
        };
    }
};
