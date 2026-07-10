/**
 * ============================================================================
 * Utils.gs
 * ============================================================================
 */

/* -------------------------------------------------------------------------- */
/* Spreadsheet */
/* -------------------------------------------------------------------------- */

function getSpreadsheet() {
  return SpreadsheetApp.getActiveSpreadsheet();
}

function getSheet(sheetName) {
  const sheet = getSpreadsheet().getSheetByName(sheetName);

  if (!sheet) {
    throw new Error(`Sheet "${sheetName}" not found.`);
  }

  return sheet;
}

/* -------------------------------------------------------------------------- */
/* Database Initialization */
/* -------------------------------------------------------------------------- */

function initializeDatabase() {

  createSheetIfNotExists(
    SHEETS.CUSTOMERS,
    CUSTOMER_HEADERS
  );

  createSheetIfNotExists(
    SHEETS.ORDERS,
    ORDER_HEADERS
  );

  createSheetIfNotExists(
    SHEETS.SETTINGS,
    SETTINGS_HEADERS
  );

}

function createSheetIfNotExists(name, headers) {

  const ss = getSpreadsheet();

  let sheet = ss.getSheetByName(name);

  if (!sheet) {
    sheet = ss.insertSheet(name);
  }

  // Add headers only if the sheet is empty
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
    sheet.setFrozenRows(1);
  }

  return sheet;
}

/* -------------------------------------------------------------------------- */
/* Locking */
/* -------------------------------------------------------------------------- */

function withLock(callback) {

  const lock = LockService.getScriptLock();

  lock.waitLock(30000);

  try {

    return callback();

  } finally {

    lock.releaseLock();

  }

}

/* -------------------------------------------------------------------------- */
/* ID Generation */
/* -------------------------------------------------------------------------- */

function generateCustomerId() {

  return withLock(() => {

    const sheet = getSheet(SHEETS.CUSTOMERS);

    const id = sheet.getLastRow();

    return "CUS" + String(id).padStart(5, "0");

  });

}

function generateOrderId() {

  return withLock(() => {

    const sheet = getSheet(SHEETS.ORDERS);

    const id = sheet.getLastRow();

    return "ORD" + String(id).padStart(6, "0");

  });

}

/* -------------------------------------------------------------------------- */
/* Read Helpers */
/* -------------------------------------------------------------------------- */

function getAllRows(sheetName) {

  const sheet = getSheet(sheetName);

  if (sheet.getLastRow() <= 1) {

    return [];

  }

  return sheet
    .getRange(
      2,
      1,
      sheet.getLastRow() - 1,
      sheet.getLastColumn()
    )
    .getValues();

}

function findRowByValue(sheetName, columnIndex, value) {

  const rows = getAllRows(sheetName);

  for (let i = 0; i < rows.length; i++) {

    if (rows[i][columnIndex] == value) {

      return {
        rowNumber: i + 2,
        data: rows[i]
      };

    }

  }

  return null;

}

/* -------------------------------------------------------------------------- */
/* Write Helpers */
/* -------------------------------------------------------------------------- */

function appendRow(sheetName, values) {

  const sheet = getSheet(sheetName);

  sheet.appendRow(values);

}

function updateRow(sheetName, rowNumber, values) {

  const sheet = getSheet(sheetName);

  sheet
    .getRange(
      rowNumber,
      1,
      1,
      values.length
    )
    .setValues([values]);

}

function updateCell(sheetName, rowNumber, columnNumber, value) {

  getSheet(sheetName)
    .getRange(rowNumber, columnNumber)
    .setValue(value);

}

/* -------------------------------------------------------------------------- */
/* JSON Response */
/* -------------------------------------------------------------------------- */

function success(data = {}) {

  return ContentService
    .createTextOutput(
      JSON.stringify({

        success: true,

        data

      })
    )
    .setMimeType(ContentService.MimeType.JSON);

}

function failure(message) {

  return ContentService
    .createTextOutput(
      JSON.stringify({

        success: false,

        message

      })
    )
    .setMimeType(ContentService.MimeType.JSON);

}

function error(message) {

  return failure(message);

}

/* -------------------------------------------------------------------------- */
/* Request Parsing */
/* -------------------------------------------------------------------------- */

function parseBody(e) {

  if (!e.postData) {

    return {};

  }

  return JSON.parse(e.postData.contents);

}

function getAction(e) {

  if (e.parameter && e.parameter.action) {

    return e.parameter.action;

  }

  const body = parseBody(e);

  return body.action || "";

}