const Toast = (() => {
  let timer;
  function show(msg) {
    const el = document.getElementById("toast");
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(timer);
    timer = setTimeout(() => el.classList.remove("show"), 2600);
  }
  return { show };
})();

const SESSION_KEY = "pc_admin_session";
let currentFilter = "active";
let allOrders = [];
let settings = {};

function getToken() { return sessionStorage.getItem(SESSION_KEY); }
function setToken(t) { sessionStorage.setItem(SESSION_KEY, t); }
function clearToken() { sessionStorage.removeItem(SESSION_KEY); }

function normalizeOrder(order) {
  return {
    orderId: String(order.orderId || ""),
    customerId: String(order.customerId || ""),
    customerName: String(order.customerName || ""),
    items: Array.isArray(order.items) ? order.items : [],
    total: Number(order.total || 0),
    paymentMethod: String(order.paymentMethod || ""),
    paymentStatus: String(order.paymentStatus || "Pending"),
    orderStatus: String(order.orderStatus || "Accepted"),
    createdAt: order.createdAt || order.placedAt || "",
    placedAt: order.placedAt || order.createdAt || "",
    updatedAt: order.updatedAt || order.createdAt || ""
  };
}

function ensureSettingsExtras() {
  const form = document.getElementById("settingsForm");
  if (!form || document.getElementById("settingBrand")) return;

  const submitButton = form.querySelector('button[type="submit"]');
  const fragment = document.createElement("div");
  fragment.innerHTML = `
    <label>Brand</label>
    <input id="settingBrand">

    <label>Document Title</label>
    <input id="settingDocumentTitle">

    <label>Footer Text</label>
    <textarea id="settingFooter"></textarea>

    <label>Contact Page Copy</label>
    <textarea id="settingContactPage"></textarea>

    <label>Location Page Copy</label>
    <textarea id="settingLocationPage"></textarea>
  `;

  form.insertBefore(fragment, submitButton);
}

async function tryEnterDashboard() {
  if (getToken()) {
    document.getElementById("adminGate").classList.add("hidden");
    document.getElementById("dashboard").style.display = "block";
    await refreshOrders();
    await loadSettings();
  }
}

document.getElementById("gateSubmit").addEventListener("click", async () => {
  const pass = document.getElementById("gatePassword").value;
  const errEl = document.getElementById("gateError");
  errEl.textContent = "";
  try {
    const { token } = await Api.adminLogin(pass);
    if (token) {
      setToken(token);
      await tryEnterDashboard();
    } else {
      errEl.textContent = "Incorrect password. Try again.";
    }
  } catch (e) {
    errEl.textContent = "Couldn't reach the server. Check your connection.";
  }
});
document.getElementById("gatePassword").addEventListener("keydown", e => {
  if (e.key === "Enter") document.getElementById("gateSubmit").click();
});
document.getElementById("logoutBtn").addEventListener("click", () => {
  clearToken();
  location.reload();
});
document.getElementById("refreshBtn").addEventListener("click", refreshOrders);

document.querySelectorAll(".filter-row .chip[data-filter]").forEach(chip => {
  chip.addEventListener("click", () => {
    document.querySelectorAll(".filter-row .chip[data-filter]").forEach(c => c.classList.remove("active"));
    chip.classList.add("active");
    currentFilter = chip.dataset.filter;
    renderTable();
  });
});

const STAGES = ["Accepted", "Preparing", "Ready to Collect", "Delivered"];

async function refreshOrders() {
  try {
  allOrders = (await Api.adminGetOrders(getToken())).map(normalizeOrder);
    renderStats();
    renderTable();
    document.getElementById("refreshNote").textContent = "updated " + new Date().toLocaleTimeString();
  } catch (e) {
    Toast.show("Couldn't refresh orders");
  }
}

async function loadSettings(){

  ensureSettingsExtras();

  try {
    settings = await Api.getSettings();

    settingCafeName.value = settings.cafeName || "";
    settingBrand.value = settings.brand || "";
    settingDocumentTitle.value = settings.documentTitle || "";
    settingPhone.value = settings.phone || "";
    settingEmail.value = settings.email || "";
    settingAddress.value = settings.address || "";
    settingHours.value = settings.openingHours || "";
    settingFooter.value = settings.footer || "";
    settingContactPage.value = settings.contactPage || "";
    settingLocationPage.value = settings.locationPage || "";
    settingWhatsapp.value = settings.whatsapp || "";
    settingInstagram.value = settings.instagram || "";
    settingFacebook.value = settings.facebook || "";
    settingLogo.value = settings.logo || "";
  } catch (error) {
    console.error(error);
    Toast.show("Unable to load settings");
  }

}

settingsForm.addEventListener("submit",async e=>{

    e.preventDefault();

  try {
    await Api.updateSettings(

      getToken(),

      {

        cafeName: settingCafeName.value,
        brand: settingBrand.value,
        documentTitle: settingDocumentTitle.value,
        phone: settingPhone.value,
        email: settingEmail.value,
        address: settingAddress.value,
        openingHours: settingHours.value,
        footer: settingFooter.value,
        contactPage: settingContactPage.value,
        locationPage: settingLocationPage.value,
        whatsapp: settingWhatsapp.value,
        instagram: settingInstagram.value,
        facebook: settingFacebook.value,
        logo: settingLogo.value

      }

    );

    Toast.show("Settings Saved");
  } catch (error) {
    console.error(error);
    Toast.show("Couldn't save settings");
  }

});

function renderStats() {
  const today = new Date().toDateString();
  const todays = allOrders.filter(o => new Date(o.createdAt || o.placedAt).toDateString() === today);
  document.getElementById("statAccepted").textContent = allOrders.filter(o => o.orderStatus === "Accepted").length;
  document.getElementById("statPreparing").textContent = allOrders.filter(o => o.orderStatus === "Preparing").length;
  document.getElementById("statReady").textContent = allOrders.filter(o => o.orderStatus === "Ready to Collect").length;
  document.getElementById("statRevenue").textContent = "₹" + todays.reduce((s, o) => s + (o.paymentStatus === "Paid" ? o.total : 0), 0);
}

function renderTable() {
  const body = document.getElementById("ordersBody");
  let rows = allOrders;
  if (currentFilter === "active") rows = rows.filter(o => o.orderStatus !== "Delivered");
  else if (currentFilter !== "all") rows = rows.filter(o => o.orderStatus === currentFilter);

  if (!rows.length) {
    body.innerHTML = `<tr class="empty-row"><td colspan="8">No orders in this view.</td></tr>`;
    return;
  }

  body.innerHTML = rows.map(o => `
    <tr>
      <td class="oid-cell">#${o.orderId}</td>
      <td class="cust-cell"><strong>${o.customerName}</strong><span>${o.customerId}</span></td>
      <td class="items-cell">${o.items.map(i => `${i.qty}× ${i.name}${i.sizeLabel ? " (" + i.sizeLabel + ")" : ""}`).join(", ")}</td>
      <td>₹${o.total}</td>
      <td>
        <button class="pay-toggle ${o.paymentStatus === "Paid" ? "paid" : "pending"}" data-order="${o.orderId}" data-act="pay">${o.paymentStatus}</button>
      </td>
      <td>
        <select class="status-select st-${o.orderStatus.toLowerCase().replace(/ .*/,"")}" data-order="${o.orderId}" data-act="status">
          ${STAGES.map(s => `<option value="${s}" ${s === o.orderStatus ? "selected" : ""}>${s}</option>`).join("")}
        </select>
      </td>
      <td class="oid-cell">${new Date(o.createdAt || o.placedAt).toLocaleString()}</td>
      <td>
        ${o.orderStatus !== "Delivered" ? `<button class="btn btn-flame btn-sm" data-order="${o.orderId}" data-act="deliver">Mark Delivered</button>` : ""}
      </td>
    </tr>
  `).join("");

  body.querySelectorAll('[data-act="status"]').forEach(sel => {
    sel.addEventListener("change", () => updateOrder(sel.dataset.order, { orderStatus: sel.value }));
  });
  body.querySelectorAll('[data-act="pay"]').forEach(btn => {
    btn.addEventListener("click", () => {
      const order = allOrders.find(o => o.orderId === btn.dataset.order);
      const next = order.paymentStatus === "Paid" ? "Pending" : "Paid";
      updateOrder(btn.dataset.order, { paymentStatus: next });
    });
  });
  body.querySelectorAll('[data-act="deliver"]').forEach(btn => {
    btn.addEventListener("click", () => updateOrder(btn.dataset.order, { orderStatus: "Delivered" }));
  });
}

async function updateOrder(orderId, patch) {
  try {
    await Api.adminUpdateOrder(getToken(), orderId, patch);
    Toast.show("Order updated");
    await refreshOrders();
    await loadSettings();
  } catch (e) {
    Toast.show("Couldn't update order");
  }
}

tryEnterDashboard();
setInterval(() => { if (getToken()) refreshOrders(); }, 15000);
document.querySelectorAll(".admin-tab").forEach(btn => {

    btn.addEventListener("click", () => {

        document.querySelectorAll(".admin-tab")
            .forEach(b => b.classList.remove("active"));

        btn.classList.add("active");

        document.querySelectorAll(".admin-page")
            .forEach(page => page.style.display = "none");

        document.getElementById(btn.dataset.page).style.display = "block";

    });

});