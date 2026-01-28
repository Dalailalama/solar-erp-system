import { ref, onMounted } from 'vue';
import { useCommand } from '../core/components/composable/useCommand.js';
import { useApi } from '../core/components/composable/useApi.js';

export const SearchFilterExample = {
    name: 'SearchFilterExample',
    setup() {
        const { registerSearchProvider } = useCommand();
        const api = useApi();

        // 1. Register Search Providers for the Command Palette
        onMounted(() => {
            // Mock User Search Provider
            registerSearchProvider({
                name: 'Users',
                search: async (query) => {
                    if (!query || query.length < 2) return [];
                    // In a real app, this would be an API call:
                    // const res = await api.get('/api/accounts/users/search/', { q: query });
                    // return res.data.map(u => ({ title: u.username, subtitle: u.email, icon: 'fas fa-user' }));

                    // Mock data for demo
                    const users = [
                        { id: 1, title: 'admin', subtitle: 'admin@erp.com', icon: 'fas fa-user-shield', url: '/accounts/users/1' },
                        { id: 2, title: 'john_doe', subtitle: 'john@example.com', icon: 'fas fa-user', url: '/accounts/users/2' },
                        { id: 3, title: 'jane_smith', subtitle: 'jane@example.com', icon: 'fas fa-user', url: '/accounts/users/3' },
                        { id: 4, title: 'robert_perry', subtitle: 'robert@company.org', icon: 'fas fa-user', url: '/accounts/users/4' }
                    ];
                    return users.filter(u => u.title.toLowerCase().includes(query.toLowerCase()) || u.subtitle.toLowerCase().includes(query.toLowerCase()));
                }
            });

            // Mock Product Search Provider
            registerSearchProvider({
                name: 'Products',
                search: async (query) => {
                    if (!query || query.length < 2) return [];
                    const products = [
                        { id: 101, title: 'Industrial Drill Gear', subtitle: 'SKU: IDG-001 | Stock: 45', icon: 'fas fa-cog', url: '/inventory/products/101' },
                        { id: 102, title: 'Steel Pipe 2m', subtitle: 'SKU: SP-200 | Stock: 120', icon: 'fas fa-box', url: '/inventory/products/102' },
                        { id: 103, title: 'Hydraulic Press', subtitle: 'SKU: HP-500 | Stock: 5', icon: 'fas fa-tools', url: '/inventory/products/103' }
                    ];
                    return products.filter(p => p.title.toLowerCase().includes(query.toLowerCase()));
                }
            });
        });

        // 2. DataTable Configuration
        const columns = [
            { key: 'username', label: 'Username', sortable: true, formatter: (val) => val || 'Unknown' },
            { key: 'email', label: 'Email', sortable: true, formatter: (val) => val || 'No Email' },
            { key: 'role', label: 'Role', sortable: true, formatter: (val) => val || 'User' },
            {
                key: 'status', label: 'Status', sortable: true, formatter: (val) => {
                    // Default to 'active' if undefined for demo purposes
                    const status = val || 'active';
                    const classes = status === 'active' ? 'bg-success' : 'bg-secondary';
                    return `<span class="badge ${classes}">${status}</span>`;
                }
            },
            { key: 'last_login', label: 'Last Login', sortable: true, formatter: (val) => val || '-' }
        ];

        const filterSchema = {
            role: {
                type: 'select',
                label: 'User Role',
                options: [
                    { label: 'Admin', value: 'admin' },
                    { label: 'Manager', value: 'manager' },
                    { label: 'User', value: 'user' }
                ]
            },
            status: {
                type: 'select',
                label: 'Account Status',
                options: [
                    { label: 'Active', value: 'active' },
                    { label: 'Inactive', value: 'inactive' },
                    { label: 'Pending', value: 'pending' }
                ]
            },
            date_joined: {
                type: 'date',
                label: 'Joined After'
            }
        };

        return {
            columns,
            filterSchema
        };
    },
    template: `
        <div class="search-filter-example p-4">
            <div class="row mb-4">
                <div class="col-12">
                    <div class="card shadow-sm border-0 bg-primary text-white">
                        <div class="card-body p-4">
                            <h2 class="mb-2">Advanced Search & Filtering</h2>
                            <p class="mb-0 opacity-75">
                                Try pressing <kbd class="bg-white text-primary">Ctrl + K</kbd> to search across Users and Products.
                                Use the Filtering sidebar in the DataTable below to segment data.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div class="row">
                <div class="col-12">
                    <div class="card shadow-sm border-0">
                        <div class="card-header bg-white py-3">
                            <h5 class="mb-0">Faceted Filtering Demo</h5>
                        </div>
                        <div class="card-body">
                            <data-table
                                api-url="accounts/users/"
                                :columns="columns"
                                :filter-schema="filterSchema"
                                searchable
                                search-placeholder="Search users..."
                                :selectable="true"
                            >
                                <template #table-actions>
                                    <button class="btn btn-primary d-flex align-items-center gap-2">
                                        <i class="fas fa-plus"></i> New User
                                    </button>
                                </template>
                            </data-table>
                        </div>
                    </div>
                </div>
            </div>

            <div class="row mt-4">
                <div class="col-md-6">
                    <div class="card border-0 shadow-sm">
                        <div class="card-body">
                            <h6><i class="fas fa-search me-2 text-primary"></i> Cross-Module Search</h6>
                            <p class="text-muted small">
                                The Command Palette now supports "Search Providers". You can search for data across different 
                                modules without leaving your current page.
                            </p>
                            <ul class="small text-muted">
                                <li>Asynchronous, debounced searching (300ms)</li>
                                <li>Categorized results</li>
                                <li>Keyboard navigation across categories</li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="card border-0 shadow-sm">
                        <div class="card-body">
                            <h6><i class="fas fa-filter me-2 text-primary"></i> Faceted Filtering</h6>
                            <p class="text-muted small">
                                The DataTable can now define a <code>filterSchema</code>. This automatically generates a 
                                filtering UI that stays in sync with API requests.
                            </p>
                            <ul class="small text-muted">
                                <li>Declarative schema-based UI</li>
                                <li>Automatic API parameter sync</li>
                                <li>Active filter badges and "Clear All" support</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
};
