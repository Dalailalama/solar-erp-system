
/**
 * CollaborationIndicator Component
 * Shows avatars/usernames of users currently viewing/editing the same resource.
 */
export const CollaborationIndicator = {
    name: 'CollaborationIndicator',
    props: {
        roomName: {
            type: String,
            required: true
        },
        showNames: {
            type: Boolean,
            default: true
        }
    },
    setup(props) {
        const { isConnected, otherUsers } = useCollaboration(props.roomName);

        const safeUsers = computed(() =>
            (otherUsers.value || []).filter(user => user && (user.id !== null || user.username))
        );

        const getAvatarColor = (username) => {
            const colors = [
                '#3498db', '#e74c3c', '#2ecc71', '#f1c40f',
                '#9b59b6', '#1abc9c', '#e67e22', '#34495e'
            ];
            let hash = 0;
            for (let i = 0; i < username.length; i++) {
                hash = username.charCodeAt(i) + ((hash << 5) - hash);
            }
            return colors[Math.abs(hash) % colors.length];
        };

        const initials = (name) => {
            return name.substring(0, 2).toUpperCase();
        };

        return {
            isConnected,
            safeUsers,
            getAvatarColor,
            initials
        };
    },
    template: `
        <div class="collaboration-container d-flex align-items-center">
            <div 
                class="status-dot me-3" 
                :class="{ 'connected': isConnected }"
                :title="isConnected ? 'Real-time connected' : 'Connecting...'"
            ></div>

            <div class="avatar-group d-flex">
                <div 
                    v-for="user in safeUsers" 
                    :key="user.id || user.username"
                    class="avatar-circle"
                    :style="{ backgroundColor: getAvatarColor(user.username) }"
                    :title="user.username"
                >
                    {{ initials(user.username) }}
                </div>
                
                <div v-if="safeUsers.length === 0" class="no-others text-muted small">
                    <i class="fas fa-user-friends me-1"></i>
                    Only you are here
                </div>
                <div v-else-if="showNames" class="user-names ms-2 small text-muted">
                    {{ safeUsers.length }} others viewing this
                </div>
            </div>

            <style scoped>
                .status-dot {
                    width: 10px;
                    height: 10px;
                    border-radius: 50%;
                    background-color: #95a5a6;
                }
                .status-dot.connected {
                    background-color: #2ecc71;
                    box-shadow: 0 0 5px #2ecc71;
                }
                .avatar-group {
                    position: relative;
                    padding-left: 10px;
                }
                .avatar-circle {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 12px;
                    font-weight: bold;
                    border: 2px solid white;
                    margin-left: -10px;
                    transition: transform 0.2s;
                    cursor: default;
                }
                .avatar-circle:hover {
                    transform: translateY(-5px);
                    z-index: 10;
                }
            </style>
        </div>
    `
};


