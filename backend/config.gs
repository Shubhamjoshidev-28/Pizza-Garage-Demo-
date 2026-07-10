/**
 * ============================================================================
 * config.gs 
 * ============================================================================
 */

const SHEETS = {
  CUSTOMERS: "Customers",
  ORDERS: "Orders",
  SETTINGS: "Settings"
};

const CUSTOMER_HEADERS = [
  "CustomerID",
  "Name",
  "CreatedAt"
];

const ORDER_HEADERS = [
  "OrderID",
  "CustomerID",
  "CustomerName",
  "ItemsJSON",
  "Total",
  "PaymentMethod",
  "PaymentStatus",
  "OrderStatus",
  "CreatedAt",
  "UpdatedAt"
];



const SETTINGS_HEADERS = [
  "Key",
  "Value"
];

const ORDER_STATUS = {
  ACCEPTED: "Accepted",
  PREPARING: "Preparing",
  READY: "Ready to Collect",
  DELIVERED: "Delivered"
};

const PAYMENT_STATUS = {
  PENDING: "Pending",
  PAID: "Paid"
};

const SCRIPT = {
  VERSION: "1.0.0"
};