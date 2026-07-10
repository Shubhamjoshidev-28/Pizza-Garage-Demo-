# DEPLOYMENT GUIDE

This document explains how to deploy the Restaurant Ordering System from a fresh clone to a fully working production website.

This guide assumes no prior project setup.

---

# Prerequisites

Before deployment, ensure you have:

* Google Account
* GitHub Account
* Google Chrome (recommended)
* GitHub Pages enabled
* Google Apps Script access
* Google Sheets access

---

# Project Components

The application consists of two independent parts.

## Frontend

Hosted on GitHub Pages.

Responsible for:

* Customer Website
* Admin Dashboard
* User Interface

---

## Backend

Hosted using Google Apps Script.

Responsible for:

* API Endpoints
* Business Logic
* Database Operations
* Authentication

---

# Create Google Spreadsheet

Create a new Google Spreadsheet.

Use a meaningful name such as

Restaurant Ordering System Database

The spreadsheet must contain the following sheets.

| Sheet     |
| --------- |
| Customers |
| Orders    |
| Menu      |
| Settings  |

Do not rename these sheets unless the backend configuration is updated accordingly.

---

# Import Apps Script

Open the spreadsheet.

Select

Extensions

↓

Apps Script

Delete the default file.

Copy the backend files from the project into the Apps Script project.

Required files:

* Config.gs
* Utils.gs
* Customer.gs
* Orders.gs
* Menu.gs
* Settings.gs
* Code.gs

Save the project.

---

# Configure Script Properties

Open

Project Settings

↓

Script Properties

Create the following property.

| Key            | Value                              |
| -------------- | ---------------------------------- |
| ADMIN_PASSWORD | Your secure administrator password |

Do not store administrator credentials in JavaScript or Google Sheets.

---

# Initialize the Database

Run the initialization function from the Apps Script editor.

This creates the required sheet headers and default records.

Verify that all required sheets exist before continuing.

---

# Deploy the Backend

Select

Deploy

↓

New Deployment

Choose

Web App

Configuration

Execute As

Me

Who Has Access

Anyone

Deploy the application.

Copy the generated Web App URL.

---

# Configure Frontend

Open

js/config.js

Replace the placeholder Apps Script URL with the deployed Web App URL.

Example

```javascript
APPS_SCRIPT_URL = "YOUR_WEB_APP_URL";
```

Disable mock mode before production.

```javascript
USE_MOCK_BACKEND = false;
```

Save the file.

---

# Deploy Frontend

Push the project to GitHub.

Enable GitHub Pages.

Settings

↓

Pages

Branch

main

Folder

/

Save.

After deployment, GitHub will provide the public website URL.

---

# Verify Deployment

Customer Website

* Website opens successfully
* Menu loads
* Customer registration works
* Orders can be placed
* Order tracking updates
* Order history displays correctly

Admin Dashboard

* Login works
* Orders appear
* Payment status updates
* Order status updates
* Menu management works
* Settings save correctly

Backend

* Customers are stored
* Orders are stored
* Menu changes persist
* Settings update correctly

---

# Production Checklist

* Apps Script deployed
* Script Properties configured
* Required sheets created
* Menu populated
* Settings configured
* Mock backend disabled
* GitHub Pages enabled
* Browser console free of errors

---

# Troubleshooting

## Menu does not load

Verify:

* Apps Script deployment
* Web App URL
* Menu sheet contains records

---

## Orders do not appear

Verify:

* Orders sheet exists
* Apps Script permissions granted
* Browser network requests succeed

---

## Admin login fails

Verify:

* ADMIN_PASSWORD exists in Script Properties
* Password matches exactly

---

## API requests fail

Verify:

* Correct Web App URL
* Latest Apps Script deployment
* Public access is enabled

---

# Updating the Application

Backend changes require a new Apps Script deployment.

Frontend changes require pushing updated files to GitHub.

Menu and business information updates do not require redeployment because they are stored in Google Sheets.

---

# Backup

The application's data resides in Google Sheets.

Regularly download a copy of the spreadsheet or create scheduled backups using Google Drive.

---

# Next Documentation

After deployment, refer to:

* USER.md for operating the application.
* DEVELOPER.md for architecture and development guidelines.
