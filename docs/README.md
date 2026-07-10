# 🍽️ Restaurant Ordering System Template

A production-ready restaurant ordering website template built with **HTML, CSS, Vanilla JavaScript, Google Apps Script, and Google Sheets**.

This project is designed as a reusable foundation for restaurants, cafés, bakeries, fast-food outlets, cloud kitchens, and similar food businesses. Instead of being tied to a single brand, it provides a configurable ordering system where menu items, business information, and customer orders are managed through Google Sheets.

The frontend is hosted on **GitHub Pages**, while **Google Apps Script** provides the backend API and **Google Sheets** serves as the database.

---

# Overview

The Restaurant Ordering System Template allows businesses to accept customer orders without maintaining a traditional backend server.

Restaurant owners can customize their branding, menu, contact information, and operating hours through the admin dashboard, while customers can browse the menu, place orders, and track their order status.

The template is intended for demonstration projects, client portfolios, freelance work, and small businesses that need an affordable online ordering solution.

---

# Features

## Customer Website

* Dynamic menu rendering
* Category-based navigation
* Multiple size and pricing support
* Shopping cart
* Customer registration
* Order placement
* Live order tracking
* Order history
* Mobile responsive interface

---

## Admin Dashboard

* Secure administrator login
* Live order management
* Payment status updates
* Order status updates
* Menu management
* Business settings management
* Revenue overview
* Responsive dashboard

---

## Backend

* Google Apps Script API
* Google Sheets database
* Customer management
* Order management
* Menu management
* Business settings management

---

# Technology Stack

## Frontend

* HTML5
* CSS3
* Vanilla JavaScript

## Backend

* Google Apps Script

## Database

* Google Sheets

## Hosting

* GitHub Pages

---

# Architecture

```text
                Customer Website
                       │
                       ▼
              Vanilla JavaScript
                       │
                       ▼
                    api.js
                       │
                       ▼
            Google Apps Script API
                       │
                       ▼
                Google Sheets
        ┌────────┬────────┬────────┬──────────┐
        │Customer│ Orders │  Menu  │ Settings │
        └────────┴────────┴────────┴──────────┘
```

---

# Repository Structure

```text
Restaurant-Ordering-System/

│
├── index.html
├── admin.html
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
├── backend/
│   ├── Config.gs
│   ├── Utils.gs
│   ├── Customer.gs
│   ├── Orders.gs
│   ├── Menu.gs
│   ├── Settings.gs
│   └── Code.gs
│
├── assets/
│
├── README.md
├── DEPLOYMENT.md
├── USER.md
└── DEVELOPER.md
```

---

# Typical Workflow

```text
Customer

↓

Open Website

↓

Browse Menu

↓

Select Items

↓

Place Order

↓

Order Stored

↓

Admin Receives Order

↓

Order Status Updated

↓

Customer Tracks Order

↓

Delivered

↓

Order Archived
```

---

# Use Cases

This template can be customized for:

* Pizza Restaurants
* Cafés
* Burger Restaurants
* Sandwich Shops
* Bakeries
* Coffee Shops
* Fast Food Restaurants
* Cloud Kitchens
* Dessert Stores
* Juice Bars
* Food Trucks
* College Cafeterias
* Restaurant Demonstrations
* Freelance Client Projects

---

# Project Objectives

* Lightweight architecture
* No dedicated backend server
* Low hosting cost
* Easy customization
* Simple deployment
* Suitable for freelance projects
* Suitable for small businesses
* Easy maintenance

---

# Browser Support

* Google Chrome
* Microsoft Edge
* Mozilla Firefox
* Safari

---

# Documentation

This repository contains separate documentation for different audiences.

| File              | Purpose                           |
| ----------------- | --------------------------------- |
| **README.md**     | Project overview                  |
| **DEPLOYMENT.md** | Installation and deployment guide |
| **USER.md**       | Restaurant owner and staff guide  |
| **DEVELOPER.md**  | Developer documentation           |

---

# License

This template is released under the MIT License.

You are free to modify, customize, and reuse it for personal, educational, and commercial projects in accordance with the license terms.

---

# Contributing

Issues, bug reports, feature suggestions, and pull requests are welcome.

Please read **DEVELOPER.md** before contributing to ensure consistency with the project's architecture and coding standards.
