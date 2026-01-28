import { ref, computed } from 'vue';
import { useMenu } from '../composable/useMenu.js';

export const MenuItem = {
    name: 'MenuItem',
    template: `
        <div class="menu-item">
            <div 
                :class="['item-label', { active: isActive }]"
                @click="handleClick"
            >
                <i :class="'fas fa-' + item.icon" v-if="item.icon"></i>
                <i class="fas fa-folder" v-else></i>
                <span v-if="!collapsed">{{ item.label }}</span>
                <i v-if="hasChildren && !collapsed" 
                   :class="['fas fa-chevron-right arrow', { expanded: isExpanded }]">
                </i>
            </div>
            
            <transition name="submenu">
                <div v-if="hasChildren && isExpanded && !collapsed" class="submenu">
                    <menu-item 
                        v-for="child in children"
                        :key="child.id"
                        :item="child"
                        :collapsed="false"
                        :active-route="activeRoute"
                        @navigate="$emit('navigate', $event)"
                    />
                </div>
            </transition>
        </div>
    `,
    props: {
        item: {
            type: Object,
            required: true
        },
        collapsed: {
            type: Boolean,
            default: false
        },
        activeRoute: {
            type: String,
            default: ''
        }
    },
    setup(props, { emit }) {
        const isExpanded = ref(false);
        const children = ref([]);
        const menuStore = useMenu;

        const hasChildren = computed(() => props.item.has_children);
        const isActive = computed(() => props.item.route === props.activeRoute);

        const handleClick = async () => {
            if (props.item.route) {
                emit('navigate', props.item);
            } else if (hasChildren.value) {
                isExpanded.value = !isExpanded.value;
                if (isExpanded.value && children.value.length === 0) {
                    await loadChildren();
                }
            }
        };

        const loadChildren = async () => {
            children.value = await menuStore.getChildren(props.item.id);
        };

        // Make this component recursively available to itself
        return {
            isExpanded,
            children,
            hasChildren,
            isActive,
            handleClick
        };
    }
};