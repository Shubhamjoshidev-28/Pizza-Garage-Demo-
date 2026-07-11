/* ==========================================================================
   Pizza Creator Configuration
   ==========================================================================
   This is the ONLY frontend configuration file.

   Setup:

   1. Deploy Google Apps Script as a Web App.
   2. Copy the Web App URL.
   3. Paste it below in APPS_SCRIPT_URL.

   Nothing secret belongs here.
   Never store:
   - Admin Password
   - Google Credentials
   - Client Secret
   - Spreadsheet ID
   ========================================================================== */

const CONFIG = {

    // Google Apps Script Web App URL
    APPS_SCRIPT_URL:"https://script.google.com/macros/s/AKfycbxwQHm8N4XMgtyMw12PC1WKdSgSz1tniaLjsZvI-1xrX6tmgPBN-IXYDijN8_J0uXincw/exec",

    // Website Information
    CAFE_NAME: "Pizza Creator",

    CURRENCY: "₹",

    // Refresh intervals
    REFRESH_INTERVAL: {

        CUSTOMER_ORDERS: 5000,

        ORDER_HISTORY: 15000,

        ADMIN_DASHBOARD: 15000

    },

    // Local Storage Keys
    STORAGE: {

        CUSTOMER_PROFILE: "pc_customer",

        CUSTOMER_ID: "pizza_creator_customer_id",

        CUSTOMER_NAME: "pizza_creator_customer_name"

    },

    // Order Status
    ORDER_STATUS: {

        ACCEPTED: "Accepted",

        PREPARING: "Preparing",

        READY: "Ready to Collect",

        DELIVERED: "Delivered"

    },

    // Payment Status
    PAYMENT_STATUS: {

        PENDING: "Pending",

        PAID: "Paid"

    }

};

Object.freeze(CONFIG);