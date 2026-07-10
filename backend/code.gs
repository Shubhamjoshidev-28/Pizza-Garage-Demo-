/**
 * ============================================================================
 * Code.gs
 * Main Router
 * ============================================================================
 */

function doGet(e) {

  const action = e.parameter.action;

  try {

    switch (action) {

      case "getSettings":
        return success(getSettings());

      case "getCustomer":
        return success(getCustomer(e.parameter.customerId));

      case "getActiveOrders":
        return success(
          getActiveOrders(e.parameter.customerId)
        );

      case "getHistory":
        return success(
          getHistory(e.parameter.customerId)
        );

      case "adminGetOrders":

        verifyToken(e.parameter.token);

        return success(
          adminGetOrders()
        );

      default:
        return error("Invalid GET action.");

    }

  } catch (err) {

    return error(err.message);

  }

}

function doPost(e) {

  const body = JSON.parse(e.postData.contents);

  try {

    switch (body.action) {

      case "createCustomer":
        return success(
          createCustomer(body.name)
        );

      case "placeOrder":
        return success(
          placeOrder(body)
        );

      case "adminLogin":
        return success(
          adminLogin(body.password)
        );

      case "adminUpdateOrder":

        verifyToken(body.token);

        return success(
          adminUpdateOrder(
            body.orderId,
            body.patch
          )
        );

      case "updateSettings":

        verifyToken(body.token);

        return success(
          updateSettings(body.settings)
        );

      default:
        return error("Invalid POST action.");

    }

  } catch (err) {

    return error(err.message);

  }

}

/* ============================================================================
   Admin Authentication
============================================================================ */



const TOKEN_EXPIRY = 8 * 60 * 60; // 8 Hours

function adminLogin(password) {

  const realPassword =
    PropertiesService
      .getScriptProperties()
      .getProperty("ADMIN_PASSWORD");

  if (!realPassword) {

    throw new Error(
      "ADMIN_PASSWORD not configured."
    );

  }

  if (password !== realPassword) {

    throw new Error(
      "Invalid password."
    );

  }

  const token = Utilities.getUuid();

  CacheService
    .getScriptCache()
    .put(
      token,
      "valid",
      TOKEN_EXPIRY
    );

  return {
    token
  };

}

function verifyToken(token) {

  if (!token) {

    throw new Error(
      "Missing token."
    );

  }

  const exists =
    CacheService
      .getScriptCache()
      .get(token);

  if (!exists) {

    throw new Error(
      "Session expired."
    );

  }

  return true;

}

