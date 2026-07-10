/**
 * ============================================================================
 * Customer.gs
 * ============================================================================
 */

function createCustomer(name) {

  name = String(name || "").trim();

  if (!name) {
    throw new Error("Customer name is required.");
  }

  const existing = findCustomerByName(name);

  if (existing) {
    return existing;
  }

  const customer = {
    customerId: generateCustomerId(),
    name: name,
    createdAt: new Date()
  };

  appendRow(
    SHEETS.CUSTOMERS,
    [
      customer.customerId,
      customer.name,
      customer.createdAt
    ]
  );

  return customer;

}

function getCustomer(customerId) {

  if (!customerId) {
    return null;
  }

  return findCustomerById(customerId);

}

function findCustomerByName(name) {

  const result = findRowByValue(
    SHEETS.CUSTOMERS,
    1,
    name
  );

  if (!result) {
    return null;
  }

  return {
    customerId: result.data[0],
    name: result.data[1],
    createdAt: result.data[2]
  };

}

function findCustomerById(customerId) {

  const result = findRowByValue(
    SHEETS.CUSTOMERS,
    0,
    customerId
  );

  if (!result) {
    return null;
  }

  return {
    customerId: result.data[0],
    name: result.data[1],
    createdAt: result.data[2]
  };

}
