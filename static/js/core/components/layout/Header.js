import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useAuth } from '../composable/useAuth.js';

export const Header = {
    template: `
        <div class="top-header">
            <div class="header-left">
                <h1>{{ pageTitle }}</h1>
            </div>
            <div class="header-right">
                <div class="notification-icon">
                    <i class="fas fa-bell"></i>
                    <span class="notification-badge" v-if="notificationCount > 0">
                        {{ notificationCount }}
                    </span>
                </div>
                
                <div class="user-profile" @click="toggleDropdown" ref="dropdownRef">
                    <div class="user-avatar">{{ userInitials }}</div>
                    <span>{{ userName }}</span>
                    <i class="fas fa-chevron-down ms-2"></i>
                    
                    <!-- Dropdown Menu -->
                    <div class="profile-dropdown" v-if="isDropdownOpen" @click.stop>
                        <a href="#" @click.prevent="navigateToProfile" class="dropdown-item">
                            <i class="fas fa-user-circle"></i> Profile
                        </a>
                        <div class="dropdown-divider"></div>
                        <a href="#" @click.prevent="handleLogout" class="dropdown-item text-danger">
                            <i class="fas fa-sign-out-alt"></i> Logout
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `,
    emits: ['navigate'],
    props: {
        pageTitle: {
            type: String,
            default: 'Dashboard'
        }
    },
    setup(props, { emit }) {
        // useAuth is now a store object, not a function
        const authStore = useAuth;

        // computed is auto-imported!
        const userName = computed(() => {
            if (!authStore.user) return 'Guest';
            return authStore.user.first_name ? `${authStore.user.first_name} ${authStore.user.last_name}` : authStore.user.username;
        });

        // ref is auto-imported!
        const notificationCount = ref(5);
        const isDropdownOpen = ref(false);
        const dropdownRef = ref(null);

        const userInitials = computed(() => {
            return userName.value
                .split(' ')
                .map(n => n[0])
                .join('')
                .toUpperCase();
        });

        const toggleDropdown = (event) => {
            event.stopPropagation();
            isDropdownOpen.value = !isDropdownOpen.value;
        };

        const closeDropdown = () => {
            isDropdownOpen.value = false;
        };

        const navigateToProfile = () => {
            emit('navigate', { label: 'User Profile', route: '/profile' });
            closeDropdown();
        };

        const handleLogout = async () => {
            try {
                await authStore.logout();
                window.location.href = '/accounts/login/';
            } catch (e) {
                console.error(e);
                window.location.href = '/accounts/login/';
            }
        };

        const handleClickOutside = (event) => {
            if (isDropdownOpen.value && dropdownRef.value && !dropdownRef.value.contains(event.target)) {
                closeDropdown();
            }
        };

        // onMounted/onUnmounted are auto-imported!
        onMounted(() => {
            document.addEventListener('click', handleClickOutside);
        });

        onUnmounted(() => {
            document.removeEventListener('click', handleClickOutside);
        });

        return {
            userName,
            notificationCount,
            userInitials,
            isDropdownOpen,
            toggleDropdown,
            navigateToProfile,
            handleLogout,
            dropdownRef
        };
    }
};