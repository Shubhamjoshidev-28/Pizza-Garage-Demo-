# DEVELOPER GUIDE

This document explains the architecture, development workflow, coding standards, and extension guidelines for the Restaurant Ordering System Template.

It is intended for developers who maintain, customize, or extend the project.

---

# Project Philosophy

The project is designed to be:

* Lightweight
* Easy to understand
* Easy to deploy
* Easy to customize
* Framework independent
* Suitable for GitHub Pages
* Suitable for Google Apps Script

The primary objective is to provide a reusable restaurant ordering template that can be customized for different businesses without modifying the application architecture.

---

# Architecture Overview

```text id="xrnknl"
                Customer Website
                       │
                       ▼
                  Vanilla JS UI
                       │
                       ▼
                     api.js
                       │
                       ▼
             Google Apps Script
                       │
                       ▼
                Google Sheets
```

The frontend never communicates directly with Google Sheets.

All communication must go through the API layer.

---

# Folder Structure

```text id="zcjlwm"
project/

├── assets/
│
├── backend/
│   ├── Config.gs
│   ├── Utils.gs
│   ├── Customer.gs
│   ├── Orders.gs
│   ├── Menu.gs
│   ├── Settings.gs
│   └── Code.gs
│
├── css/
│   ├── style.css
│   └── admin.css
│
├── js/
│   ├── app.js
│   ├── admin.js
│   ├── api.js
│   ├── cart.js
│   └── config.js
│
├── index.html
├── admin.html
│
├── README.md
├── DEPLOYMENT.md
├── USER.md
└── DEVELOPER.md
```

---

# Frontend Responsibilities

## app.js

Responsible for:

* Customer initialization
* Loading menu
* Rendering menu
* Cart interaction
* Checkout
* Order tracking
* Order history
* Loading business settings

This file should never call Google Apps Script directly.

Always use the API layer.

---

## admin.js

Responsible for:

* Administrator login
* Order management
* Menu management
* Business settings
* Dashboard rendering

No business logic should be duplicated from the backend.

---

## api.js

The only file allowed to communicate with Google Apps Script.

All network requests must be implemented here.

If the backend changes, only this file should require modification.

---

## cart.js

Responsible only for cart state.

It should never perform API requests.

---

## config.js

Stores runtime configuration such as:

* Apps Script URL
* Feature flags
* Environment configuration

Never store secrets in this file.

---

# Backend Responsibilities

## Config.gs

Global constants.

Sheet names.

Configuration values.

---

## Utils.gs

Shared helper functions.

Validation.

JSON responses.

Common utilities.

---

## Customer.gs

Customer CRUD operations.

Responsibilities:

* Create customer
* Retrieve customer

---

## Orders.gs

Order management.

Responsibilities:

* Create order
* Retrieve orders
* Update order status
* Update payment status
* Retrieve customer history

---

## Menu.gs

Menu CRUD.

Responsibilities:

* Load menu
* Add menu item
* Update menu item
* Delete menu item

---

## Settings.gs

Business configuration.

Responsibilities:

* Load settings
* Update settings

---

## Code.gs

Acts as the router.

Receives every HTTP request.

Delegates requests to the appropriate module.

No business logic should exist here.

---

# Google Sheet Schema

The application expects the following sheets.

Customers

Orders

Menu

Settings

Changes to sheet names require corresponding updates in the backend configuration.

---

# Coding Standards

Use:

* const whenever possible.
* let only when reassignment is required.
* async/await instead of promise chains.
* Meaningful function names.
* Single responsibility functions.

Avoid:

* Global variables unless necessary.
* Duplicate logic.
* Hardcoded configuration values.
* Inline event handlers for new features.

---

# Error Handling

Every API request must:

* Handle network failures.
* Catch exceptions.
* Return predictable responses.
* Display user-friendly notifications.

Frontend should never expose raw backend errors directly to users.

---

# Security Guidelines

Do not store:

* Passwords
* Tokens
* API secrets

inside:

* HTML
* CSS
* JavaScript
* Google Sheets

Administrator credentials should be stored using Google Apps Script Script Properties.

Validate all administrative requests on the backend.

---

# Extending the Project

When adding new functionality:

1. Add backend logic.
2. Add routing in Code.gs.
3. Add API wrapper in api.js.
4. Update the appropriate frontend module.
5. Test the complete workflow.

Avoid bypassing the API layer.

---

# Recommended Development Workflow

1. Create a feature branch.
2. Implement backend support.
3. Update the API layer.
4. Integrate with the frontend.
5. Test customer flow.
6. Test admin flow.
7. Review code.
8. Merge into the main branch.

---

# Future Enhancements

Possible future improvements include:

* Customer accounts
* Email notifications
* WhatsApp notifications
* Payment gateway integration
* Inventory management
* Coupons and discounts
* Loyalty program
* Multi-location support
* Role-based staff accounts
* Kitchen display system
* QR code ordering
* Analytics dashboard
* Sales reporting
* PWA offline enhancements
* Internationalization

These features should be implemented without breaking the existing separation between frontend, API layer, backend modules, and Google Sheets.

---

# Maintenance Principles

* Keep modules independent.
* Preserve backward compatibility where practical.
* Prefer configuration over hardcoding.
* Keep UI and business logic separate.
* Document public APIs and significant architectural changes.
* Update documentation whenever functionality changes.

Following these principles helps keep the project maintainable, reusable, and easy to adapt for different restaurant businesses.
