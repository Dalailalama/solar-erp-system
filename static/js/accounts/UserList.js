// Imports handled by ERP Framework Auto-Import

export const UserList = {
    name: 'UserList',
    setup() {
        const api = useApi();

        // DataTable Configuration
        const columns = [
            { key: 'id', label: 'ID', sortable: true },
            { key: 'username', label: 'Username', sortable: true },
            { key: 'email', label: 'Email', sortable: true },
            { key: 'first_name', label: 'First Name', sortable: true },
            { key: 'last_name', label: 'Last Name', sortable: true },
            {
                key: 'is_active',
                label: 'Status',
                sortable: true,
                formatter: (value) => value ? 'Active' : 'Inactive'
            }
        ];

        const rowActions = [
            {
                label: 'View Profile',
                icon: 'user',
                handler: (row) => {
                    console.log('View profile:', row);
                    // Navigate to profile or show modal
                    // window.location.href = `/accounts/profiles/${row.id}/`;
                }
            },
            {
                label: 'Edit',
                icon: 'edit',
                handler: (row) => {
                    console.log('Edit user:', row);
                }
            }
        ];

        return {
            columns,
            rowActions
        };
    },
    template: `
        <div class="user-list-container">
            <data-table
                api-url="accounts/users/"
                :columns="columns"
                :row-actions="rowActions"
                :selectable="true"
                search-placeholder="Search users by name, email..."
                persist-id="user_list_v1"
            />
        </div>
    `
};

