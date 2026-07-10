/**
 * ============================================================================
 * Orders.gs
 * ============================================================================
 */

function placeOrder(data) {

  const orderId = generateOrderId();

  const now = new Date();

  appendRow(
    SHEETS.ORDERS,
    [

      orderId,

      data.customerId,

      data.customerName,

      JSON.stringify(data.items),

      Number(data.total),

      data.paymentMethod,

      data.paymentMethod === "online"
        ? PAYMENT_STATUS.PAID
        : PAYMENT_STATUS.PENDING,

      ORDER_STATUS.ACCEPTED,

      now,

      now

    ]
  );

  return {
    orderId
  };

}

function getOrders() {

  const rows = getAllRows(
    SHEETS.ORDERS
  );

  return rows.map(row => ({

    orderId: row[0],

    customerId: row[1],

    customerName: row[2],

    items: JSON.parse(row[3] || "[]"),

    total: Number(row[4]),

    paymentMethod: row[5],

    paymentStatus: row[6],

    orderStatus: row[7],

    createdAt: row[8],

    placedAt: row[8],

    updatedAt: row[9]

  })).reverse();

}

function getCustomerOrders(customerId) {

  return getOrders().filter(

    order => order.customerId === customerId

  );

}

function getActiveOrders(customerId) {

  return getCustomerOrders(customerId).filter(order => order.orderStatus !== ORDER_STATUS.DELIVERED);

}

function getHistory(customerId) {

  return getCustomerOrders(customerId).filter(order => order.orderStatus === ORDER_STATUS.DELIVERED);

}

function adminGetOrders() {

  return getOrders();

}

function updateOrder(orderId, patch) {

  const result = findRowByValue(
    SHEETS.ORDERS,
    0,
    orderId
  );

  if (!result) {

    throw new Error(
      "Order not found."
    );

  }

  const row = result.data;

  if (patch.paymentStatus) {

    row[6] = patch.paymentStatus;

  }

  if (patch.orderStatus) {

    row[7] = patch.orderStatus;

  }

  row[9] = new Date();

  updateRow(
    SHEETS.ORDERS,
    result.rowNumber,
    row
  );

  return true;

}

function adminUpdateOrder(orderId, patch) {

  return updateOrder(orderId, patch);

}