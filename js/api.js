/* ==========================================================================
   Pizza Creator
   API Layer
   ========================================================================== */

const Api = (() => {

    /* ===========================================================
       GET Request
    =========================================================== */

    async function get(action, params = {}) {

        const url = new URL(CONFIG.APPS_SCRIPT_URL);

        url.searchParams.set("action", action);

        Object.entries(params).forEach(([key, value]) => {

            if (value !== undefined && value !== null) {

                url.searchParams.set(key, value);

            }

        });

        const response = await fetch(url);

        if (!response.ok) {

            throw new Error(`HTTP ${response.status}`);

        }

        const json = await response.json();

        if (!json.success) {

            throw new Error(json.message);

        }

        return json.data;

    }

    /* ===========================================================
       POST Request
    =========================================================== */

    async function post(action, body = {}) {

        const response = await fetch(CONFIG.APPS_SCRIPT_URL, {

            method: "POST",

            headers: {

                "Content-Type": "text/plain;charset=utf-8"

            },

            body: JSON.stringify({

                action,

                ...body

            })

        });

        if (!response.ok) {

            throw new Error(`HTTP ${response.status}`);

        }

        const json = await response.json();

        if (!json.success) {

            throw new Error(json.message);

        }

        return json.data;

    }

    /* ===========================================================
       CUSTOMER
    =========================================================== */

    function createCustomer(name) {

        return post("createCustomer", {

            name

        });

    }

    function getCustomer(customerId) {

        return get("getCustomer", {

            customerId

        });

    }

    
    /* ===========================================================
       ORDERS
    =========================================================== */

    function placeOrder(order) {

        return post("placeOrder", order);

    }

    function getActiveOrders(customerId) {

        return get("getActiveOrders", {

            customerId

        });

    }

    function getHistory(customerId) {

        return get("getHistory", {

            customerId

        });

    }

    /* ===========================================================
       SETTINGS
    =========================================================== */

    function getSettings() {

        return get("getSettings");

    }

    function updateSettings(token, settings) {

        return post("updateSettings", {

            token,

            settings

        });

    }

    /* ===========================================================
       ADMIN
    =========================================================== */

    function adminLogin(password) {

        return post("adminLogin", {

            password

        });

    }

    function adminGetOrders(token) {

        return get("adminGetOrders", {

            token

        });

    }

    function adminUpdateOrder(token, orderId, patch) {

        return post("adminUpdateOrder", {

            token,

            orderId,

            patch

        });

    }

    /* ===========================================================
       EXPORT
    =========================================================== */

    return {

        createCustomer,

        getCustomer,

        placeOrder,

        getActiveOrders,

        getHistory,

        getSettings,

        updateSettings,

        adminLogin,

        adminGetOrders,

        adminUpdateOrder

    };

})();