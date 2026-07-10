/**
 * ============================================================================
 * Settings.gs
 * ============================================================================
 */

/**
 * Returns all settings as an object.
 */
function getSettings() {

  const rows = getAllRows(SHEETS.SETTINGS);

  const settings = {};

  rows.forEach(row => {

    const key = String(row[0]).trim();

    const value = row[1];

    settings[key] = value;

  });

  return settings;

}

/**
 * Updates all settings.
 *
 * Example:
 * {
 *   cafeName:"Pizza Creator",
 *   phone:"+91xxxxxxxxxx",
 *   email:"hello@example.com"
 * }
 */
function updateSettings(data) {

  const sheet = getSheet(SHEETS.SETTINGS);

  const rows = sheet.getDataRange().getValues();

  for (const key in data) {

    let found = false;

    for (let i = 1; i < rows.length; i++) {

      if (rows[i][0] === key) {

        sheet.getRange(i + 1, 2).setValue(data[key]);

        found = true;

        break;

      }

    }

    if (!found) {

      sheet.appendRow([

        key,

        data[key]

      ]);

    }

  }

  return {

    success: true

  };

}

/**
 * Creates the Settings sheet with default values.
 * Safe to call multiple times.
 */
function initializeSettings() {

  const sheet = getSheet(SHEETS.SETTINGS);

  if (sheet.getLastRow() > 1) {

    return;

  }

  sheet.appendRows([

    ["cafeName", "Pizza Creator"],

    ["brand", "Pizza Creator"],

    ["documentTitle", "Pizza Creator — Build Your Craving"],

    ["phone", ""],

    ["email", ""],

    ["address", ""],

    ["openingHours", "11:00 AM - 11:00 PM"],

    ["footer", "Hand-stretched, fired hot, built the way you like it. Order ahead and skip the wait."],

    ["contactPage", "Reach out to the café for orders, questions, and special requests."],

    ["locationPage", "Outlet addresses and maps are on the way."],

    ["instagram", ""],

    ["facebook", ""],

    ["whatsapp", ""],

    ["logo", ""],

    ["currency", "₹"],

    ["themeColor", "#E53935"]

  ]);

}