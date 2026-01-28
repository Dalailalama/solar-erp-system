# System Architecture

## Overview
This ERP system is a hybrid application combining **Django Templates** for the public website and a **Vue.js Single Page Application (SPA)** for the internal ERP application.

### Key Technologies
-   **Backend**: Django, Django Ninja (API).
-   **Frontend**: Vue.js 3, Vite (Build Tool), Bootstrap (Legacy), Custom CSS (Modern).
-   **Database**: SQLite (Dev), PostgreSQL (Prod - Recommended).

## Directory Structure
```
erp_system_project/
├── accounts/           # User authentication & API
├── core/               # Main SPA code (views, urls)
│   ├── api.py          # Core API endpoints
│   └── urls.py         # SPA routing
├── static/
│   ├── css/core/       # Modular CSS
│   ├── js/             # Vue Application
│   │   ├── core/       # Shared components & logic
│   │   └── accounts/   # Feature-specific modules
├── templates/          # Django HTML templates
├── website/            # Public landing page app
└── manage.py
```

## Routing Logic
The application uses a dual-routing strategy:

1.  **Server-Side Routing (Django)**:
    -   `/`: Public Website (`website` app).
    -   `/app/`: Internal ERP SPA (`core` app).
    -   `/api/`: REST API endpoints.

2.  **Client-Side Routing (Vue)**:
    -   Inside `/app/`, the URL updates using the HTML5 History API (`window.history.pushState`).
    -   `MainLayout.js` listens to navigation events and dynamically swaps components (e.g., `Dashboard` <-> `Profile`).
    -   **Important**: This is a "Lightweight SPA" that does not use `vue-router` but a custom History API implementation for simplicity and tight integration.

## API Layer
-   **Django Ninja**: Used for creating fast, typed API endpoints.
-   **useApi Composable**: A custom Vue wrapper (`static/js/core/components/composable/useApi.js`) for Axios.
    -   Automatically handles CSRF tokens.
    -   Manages loading states.
    -   Displays Toast notifications for success/error (Code 0/1).

## Authentication
-   Session-based authentication (Standard Django).
-   `useAuth` composable manages user state on the frontend.
-   `MainLayout` hydrates the session on mount by calling `fetchUser`.
