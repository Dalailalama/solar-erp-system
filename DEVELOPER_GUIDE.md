# ERP System Developer Guide

Welcome to the ERP System Project! This is a hybrid Django + Vue.js application.

## 🚀 Quick Start
1.  **Run Server**: `python manage.py runserver`
2.  **App Access**: `http://localhost:8000/app/`
3.  **Website**: `http://localhost:8000/`

## 📚 Documentation
Detailed documentation is located in the `documentation/` folder:

-   [**Architecture Overview**](documentation/ARCHITECTURE.md): Understand the Django-Vue Hybrid structure.
-   [**Component Reference**](documentation/COMPONENTS.md): How to use `DataTable`, `useApi`, and other core tools.
-   [**Developer Guide**](documentation/DEVELOPER_GUIDE.md): **Step-by-step tutorial for adding new pages/menus.**

## 🛠 Adding a New Page (Cheat Sheet)
1.  **Backend**: Add endpoint in `api.py`.
2.  **Frontend**: Create `.js` component in `static/js/`.
3.  **Route**: Register component in `MainLayout.js`.
4.  **Menu**: Add item in `useMenu.js` (or Backend Menu API).

*For the full guide, see [documentation/DEVELOPER_GUIDE.md](documentation/DEVELOPER_GUIDE.md).*
