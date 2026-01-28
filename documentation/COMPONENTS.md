# Component Reference

## Core Composables

### `useApi`
The primary way to interact with the backend.
```javascript
import { useApi } from '../core/components/composable/useApi.js';

const api = useApi();
// GET
const data = await api.get('/accounts/users/');
// POST
await api.post('/accounts/create/', { name: 'John' });
// TOASTS
// Automatically shown based on server response code (1=Success, 0=Error).
```

### `useAuth`
Manages user session.
```javascript
import { useAuth } from '../core/components/composable/useAuth.js';

const { user, login, logout } = useAuth();
// user.value contains { username, first_name, ... }
```

## UI Components

### `DataTable`
A powerful, reusable table component with server-side pagination.
```javascript
import { DataTable } from '../core/components/ui/DataTable.js';

// Template
<data-table
    :columns="[
        { key: 'username', label: 'User' },
        { key: 'email', label: 'Email' }
    ]"
    :api-endpoint="'/accounts/users/'"
    :actions="['edit', 'delete']"
    @edit="handleEdit"
/>
```

### `ToastContainer`
Handles application notifications. Use `useToast()` to trigger manually if needed (though `useApi` handles most cases).

### `MainLayout`
The shell of the ERP application. It handles:
-   Sidebar state.
-   Header (User profile, Page title).
-   Dynamic Component Loading (`activeComponent`).
-   URL History Management.

## CSS Architecture
-   **`base.css`**: Global variables, reset, and layout structure.
-   **`toast.css`**: Styles for notifications.
-   **Component CSS**: Loaded modularly (e.g., `profile.css` imported in `Profile.js`).
