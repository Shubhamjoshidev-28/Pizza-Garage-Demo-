/* ==========================================================================
   APP — wires up nav, menu rendering, cart, checkout, order tracking, history
   ========================================================================== */

// ---------------------------------------------------------------- Toast ---
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

const CUSTOMER_STORAGE_KEY = CONFIG.STORAGE.CUSTOMER_PROFILE || "pc_customer";
const ORDER_POLL_MS = 10000;
const HISTORY_POLL_MS = 15000;

let currentCustomer = null;
let menuGroups = [];
let activeOrdersTimer = null;
let historyTimer = null;
let menuObserver = null;
let selectedPayMethod = "counter";

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function readStoredCustomer() {
  try {
    const raw = localStorage.getItem(CUSTOMER_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && parsed.customerId && parsed.name ? {
      customerId: String(parsed.customerId),
      name: String(parsed.name)
    } : null;
  } catch {
    return null;
  }
}

function persistCustomer(profile) {
  if (!profile) return;
  localStorage.setItem(CUSTOMER_STORAGE_KEY, JSON.stringify({
    customerId: String(profile.customerId || ""),
    name: String(profile.name || "")
  }));
}

function normalizeCustomer(profile) {
  if (!profile) return null;
  return {
    customerId: String(profile.customerId || profile.customerID || ""),
    name: String(profile.name || profile.customerName || "")
  };
}

function normalizeSizes(sizes) {
  if (!Array.isArray(sizes)) return [];
  return sizes.map(size => ({
    label: String(size?.label || size?.name || ""),
    price: Number(size?.price || 0)
  })).filter(size => size.label || size.price);
}

function normalizeMenuGroups(data) {
  if (!Array.isArray(data)) return [];

  if (data.some(entry => Array.isArray(entry?.items))) {
    return data.map(group => ({
      category: String(group.category || "Other"),
      items: (group.items || []).map(item => ({
        itemId: String(item.itemId || item.id || ""),
        name: String(item.name || ""),
        description: String(item.description || item.desc || ""),
        image: String(item.image || ""),
        available: item.available !== false,
        sizes: normalizeSizes(item.sizes)
      }))
    }));
  }

  const grouped = new Map();

  data.forEach(item => {
    const category = String(item.category || "Other");
    if (!grouped.has(category)) grouped.set(category, []);
    grouped.get(category).push({
      itemId: String(item.itemId || item.id || ""),
      name: String(item.name || ""),
      description: String(item.description || item.desc || ""),
      image: String(item.image || ""),
      available: item.available !== false,
      sizes: normalizeSizes(item.sizes)
    });
  });

  return [...grouped.entries()].map(([category, items]) => ({ category, items }));
}

function normalizeOrder(order) {
  if (!order) return null;
  return {
    orderId: String(order.orderId || ""),
    customerId: String(order.customerId || ""),
    customerName: String(order.customerName || ""),
    items: Array.isArray(order.items) ? order.items : [],
    total: Number(order.total || 0),
    paymentMethod: String(order.paymentMethod || "counter"),
    paymentStatus: String(order.paymentStatus || "Pending"),
    orderStatus: String(order.orderStatus || "Accepted"),
    createdAt: order.createdAt || order.placedAt || "",
    placedAt: order.placedAt || order.createdAt || "",
    updatedAt: order.updatedAt || order.createdAt || ""
  };
}

function getOrderItemQty(item) {
  return Number(item?.quantity ?? item?.qty ?? 0);
}

function setBrandText(label) {
  const parts = String(label || "Pizza Creator").trim().split(/\s+/);
  const first = parts.shift() || "Pizza";
  const second = parts.length ? parts.join(" ") : "Creator";

  document.querySelectorAll(".brand").forEach(brand => {
    const firstPart = brand.querySelector(".b1");
    const secondPart = brand.querySelector(".b2");
    if (firstPart) firstPart.textContent = first;
    if (secondPart) secondPart.textContent = second;
  });
}

function applySettings(settings = {}) {
  const cafeName = String(settings.brand || settings.cafeName || "Pizza Creator").trim() || "Pizza Creator";
  const documentTitle = String(settings.documentTitle || `${cafeName} — Build Your Craving`);

  document.title = documentTitle;
  setBrandText(cafeName);

  const slice = document.querySelector(".brand .slice");
  if (slice && settings.logo && String(settings.logo).length <= 3) {
    slice.textContent = settings.logo;
  }

  const footerCopy = document.querySelector(".footer .container > div:first-child p");
  if (footerCopy && settings.footer) {
    footerCopy.textContent = settings.footer;
  }

  const contactSection = document.querySelector("#contact .section-head p");
  if (contactSection && settings.contactPage) {
    contactSection.textContent = settings.contactPage;
  }

  const locationSection = document.querySelector("#locations .section-head p");
  if (locationSection && settings.locationPage) {
    locationSection.textContent = settings.locationPage;
  }

  const contactCards = document.querySelectorAll("#contact .info-card");
  if (contactCards[0]) {
    const phone = contactCards[0].querySelector("p");
    if (phone) phone.textContent = settings.phone || "";
  }
  if (contactCards[1]) {
    const email = contactCards[1].querySelector("p");
    if (email) email.textContent = settings.email || "";
  }
  if (contactCards[2]) {
    const hours = contactCards[2].querySelector("p");
    if (hours) hours.textContent = settings.openingHours || "";
  }

  const locationCard = document.querySelector("#locations .info-card p");
  if (locationCard && settings.address) {
    locationCard.textContent = settings.address;
  }
}

function showEmptyMenuState(message) {
  const jump = document.getElementById("menuJump");
  const strips = document.getElementById("menuStrips");
  if (jump) jump.innerHTML = "";
  if (strips) strips.innerHTML = `<div class="empty-state">${escapeHtml(message)}</div>`;
}

async function loadStoredCustomer() {
  const stored = readStoredCustomer();
  if (!stored) return null;

  try {
    const customer = normalizeCustomer(await Api.getCustomer(stored.customerId));
    if (customer?.customerId && customer?.name) {
      persistCustomer(customer);
      return customer;
    }
  } catch (error) {
    console.error(error);
  }

  return stored;
}

function startPolling() {
  if (!activeOrdersTimer) {
    activeOrdersTimer = setInterval(refreshActiveOrders, ORDER_POLL_MS);
  }

  if (!historyTimer) {
    historyTimer = setInterval(refreshHistory, HISTORY_POLL_MS);
  }
}

async function ensureCustomerProfile() {
  if (currentCustomer?.customerId && currentCustomer?.name) {
    return currentCustomer;
  }

  return NameModal.open();
}

// ---------------------------------------------------------------- Nav -----
(function initNav() {
  document.getElementById("year").textContent = new Date().getFullYear();

  const hamburger = document.getElementById("hamburgerBtn");
  const panel = document.getElementById("mobilePanel");
  hamburger.addEventListener("click", () => {
    const open = panel.classList.toggle("open");
    hamburger.classList.toggle("open", open);
    hamburger.setAttribute("aria-expanded", open);
  });
  panel.querySelectorAll("a").forEach(a => a.addEventListener("click", () => {
    panel.classList.remove("open");
    hamburger.classList.remove("open");
  }));

  // highlight active section link on scroll
  const links = document.querySelectorAll(".nav-links a");
  const sections = [...links].map(a => document.querySelector(a.getAttribute("href")));
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = "#" + entry.target.id;
        links.forEach(a => a.classList.toggle("active", a.getAttribute("href") === id));
      }
    });
  }, { rootMargin: "-40% 0px -55% 0px" });
  sections.forEach(s => s && io.observe(s));
})();

// ---------------------------------------------------------- Name modal ----
const NameModal = (() => {
  const overlay = document.getElementById("nameModalOverlay");
  const input = document.getElementById("nameInput");
  const saveBtn = document.getElementById("nameSaveBtn");
  const closeBtn = document.getElementById("nameModalClose");
  const idPreview = document.getElementById("ticketIdPreview");
  let resolvePending = null;

  async function open(cb) {
    if (currentCustomer?.customerId && currentCustomer?.name) {
      if (cb) cb(currentCustomer);
      return currentCustomer;
    }

    if (cb) {
      resolvePending = cb;
    }

    input.value = "";
    idPreview.textContent = "";
    overlay.classList.add("open");
    setTimeout(() => input.focus(), 100);

    return new Promise(resolve => {
      resolvePending = (profile) => {
        resolve(profile);
        if (cb) cb(profile);
      };
    });
  }

  function close(profile = null) {
    overlay.classList.remove("open");
    const done = resolvePending;
    resolvePending = null;
    if (done) done(profile);
  }

  saveBtn.addEventListener("click", async () => {
    const name = input.value.trim();
    if (!name) { input.focus(); return; }
    try {
      const profile = normalizeCustomer(await Api.createCustomer(name));
      currentCustomer = profile;
      persistCustomer(profile);
      idPreview.textContent = "Customer ID: " + profile.customerId;
      startPolling();
      close(profile);
    } catch (error) {
      console.error(error);
      Toast.show("Couldn't create customer");
    }
  });
  closeBtn.addEventListener("click", () => close(null));
  input.addEventListener("keydown", e => { if (e.key === "Enter") saveBtn.click(); });

  return { open };
})();

document.getElementById("orderNowBtn").addEventListener("click", () => {
  document.getElementById("menu").scrollIntoView({ behavior: "smooth" });
});

// ---------------------------------------------------------- Boot + Menu --
async function loadSettings() {
  try {
    return await Api.getSettings();
  } catch (error) {
    console.error(error);
    Toast.show("Unable to load settings");
    return {};
  }
}

async function fetchMenuConfig() {
  try {
    const response = await fetch("data/menu.json", { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    // fetch() is blocked entirely when the page is opened via file://
    // (no local server). Fall back to the menu embedded at build time
    // in data/menu-fallback.js so the menu still shows up.
    if (window.__MENU_FALLBACK__) {
      console.warn("data/menu.json fetch failed, using embedded fallback menu.", error);
      return window.__MENU_FALLBACK__;
    }
    throw error;
  }
}

async function loadMenu() {

    try {

        const menuConfig = await fetchMenuConfig();

        const categories = Array.isArray(menuConfig)
            ? menuConfig
            : menuConfig.categories;

        if (!Array.isArray(categories)) {
            throw new Error("Invalid menu structure.");
        }

        const groups = categories.map(category => ({
            category: category.name,
            items: category.items || []
        }));

        menuGroups = normalizeMenuGroups(groups);

        renderMenu();

    } catch (error) {

        console.error(error);

        menuGroups = [];

        renderMenu();

        Toast.show("Unable to load menu.");

    }

}

function renderMenu() {
  const jump = document.getElementById("menuJump");
  const strips = document.getElementById("menuStrips");
  if (!jump || !strips) return;

  jump.innerHTML = "";
  strips.innerHTML = "";

  if (!menuGroups.length) {
    showEmptyMenuState("No menu items are available right now.");
    return;
  }

  if (menuObserver) {
    menuObserver.disconnect();
  }

  menuGroups.forEach((group, index) => {
    const sectionId = `cat-${index}`;

    const chip = document.createElement("a");
    chip.href = `#${sectionId}`;
    chip.className = "chip";
    chip.textContent = group.category;
    chip.addEventListener("click", event => {
      event.preventDefault();
      document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    jump.appendChild(chip);

    const strip = document.createElement("div");
    strip.className = "strip";
    strip.id = sectionId;
    strip.innerHTML = `
      <div class="strip-head">
        <h3>${escapeHtml(group.category)}</h3>
      </div>
      <div class="strip-row" id="row-${index}"></div>
    `;
    strips.appendChild(strip);

    const row = strip.querySelector(`#row-${index}`);
    group.items.forEach(item => {
      row.appendChild(buildItemCard(item));
    });
  });

  const chips = [...jump.querySelectorAll(".chip")];
  const catSections = menuGroups.map((_, index) => document.getElementById(`cat-${index}`));
  menuObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = `#${entry.target.id}`;
        chips.forEach(chip => chip.classList.toggle("active", chip.getAttribute("href") === id));
      }
    });
  }, { rootMargin: "-20% 0px -70% 0px" });
  catSections.forEach(section => section && menuObserver.observe(section));
}

function buildItemCard(item) {
  console.log(item);
  const card = document.createElement("div");
  const isAvailable = item.available !== false;
  card.className = "item-card" + (isAvailable ? "" : " unavailable");

  const sizes = normalizeSizes(item.sizes);
  const hasSizes = sizes.length > 0;
  let sizeIdx = 0;

  card.innerHTML = `
    <div class="item-top">
      <h4>${escapeHtml(item.name)}</h4>
      <span class="item-icon">🍕</span>
    </div>
    <div class="desc">${escapeHtml(item.description)}</div>
    ${!isAvailable ? `<div class="unavailable-badge">Currently unavailable</div>` : ""}
    ${hasSizes ? `<div class="size-toggle">${sizes.map((size, index) => `<button data-i="${index}" class="${index === 0 ? "active" : ""}" ${isAvailable ? "" : "disabled"}>${escapeHtml(size.label)}</button>`).join("")}</div>` : ""}
    <div class="price-row">
      <span class="price" data-price>₹${hasSizes ? sizes[0].price : 0}</span>
      <div class="qty-slot"></div>
    </div>
  `;

  const priceEl = card.querySelector("[data-price]");
  const qtySlot = card.querySelector(".qty-slot");

  if (hasSizes && isAvailable) {
    card.querySelectorAll(".size-toggle button").forEach(button => {
      button.addEventListener("click", () => {
        card.querySelectorAll(".size-toggle button").forEach(other => other.classList.remove("active"));
        button.classList.add("active");
        sizeIdx = Number(button.dataset.i);
        priceEl.textContent = `₹${sizes[sizeIdx].price}`;
        renderQtySlot();
      });
    });
  }

  function currentKey() {
    return `${item.itemId}::${hasSizes ? sizeIdx : "flat"}`;
  }

  function renderQtySlot() {
    if (!isAvailable) {
      qtySlot.innerHTML = `<span class="unavailable-label">Sold out</span>`;
      return;
    }

    const line = Cart.getItems().find(entry => entry.key === currentKey());
    if (line) {
      qtySlot.innerHTML = `
        <div class="qty-control">
          <button data-act="dec">−</button>
          <span>${line.quantity}</span>
          <button data-act="inc">+</button>
        </div>`;
      qtySlot.querySelector('[data-act="dec"]').addEventListener("click", () => Cart.updateQty(line.key, -1));
      qtySlot.querySelector('[data-act="inc"]').addEventListener("click", () => Cart.updateQty(line.key, 1));
    } else {
      qtySlot.innerHTML = `<button class="add-btn" aria-label="Add">+</button>`;
      qtySlot.querySelector(".add-btn").addEventListener("click", () => {
        const size = hasSizes ? sizes[sizeIdx] : null;
        Cart.add(
          { id: item.itemId, name: item.name },
          hasSizes ? sizeIdx : null,
          size ? { label: size.label, price: size.price } : { label: null, price: 0 }
        );
        Toast.show(`Added ${item.name}${size ? ` (${size.label})` : ""}`);
      });
    }
  }

  Cart.onChange(renderQtySlot);
  renderQtySlot();
  return card;
}

async function bootstrapApp() {
  document.getElementById("year").textContent = new Date().getFullYear();
  const settings = await loadSettings();
  applySettings(settings);
  await loadMenu();
  currentCustomer = await loadStoredCustomer();

  if (currentCustomer) {
    startPolling();
    await refreshActiveOrders();
    await refreshHistory();
  } else {
    const profile = await NameModal.open();
    if (profile?.customerId) {
      currentCustomer = normalizeCustomer(profile);
      persistCustomer(currentCustomer);
      startPolling();
      await refreshActiveOrders();
      await refreshHistory();
    }
  }
}

bootstrapApp();

// ---------------------------------------------------------- Cart UI -------
const drawer = document.getElementById("cartDrawer");
const drawerOverlay = document.getElementById("drawerOverlay");
const drawerBody = document.getElementById("drawerBody");
const drawerTotal = document.getElementById("drawerTotal");

function openDrawer() {
  drawer.classList.add("open");
  drawerOverlay.classList.add("open");
}
function closeDrawer() {
  drawer.classList.remove("open");
  drawerOverlay.classList.remove("open");
}
document.getElementById("navCartBtn").addEventListener("click", openDrawer);
document.getElementById("mobileCartBtn").addEventListener("click", (e) => { e.preventDefault(); openDrawer(); });
document.getElementById("cartBarBtn").addEventListener("click", openDrawer);
document.getElementById("drawerCloseBtn").addEventListener("click", closeDrawer);
drawerOverlay.addEventListener("click", closeDrawer);

document.querySelectorAll(".pay-methods button").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".pay-methods button").forEach(b => b.classList.remove("selected"));
    btn.classList.add("selected");
    selectedPayMethod = btn.dataset.method;
  });
});

function renderCartUI(items) {
  const count = Cart.getCount();
  const total = Cart.getTotal();

  document.getElementById("navCartCount").textContent = count;
  document.getElementById("mobileCartCount").textContent = count;
  document.getElementById("cartBarCount").textContent = count;
  document.getElementById("cartBarTotal").textContent = CONFIG.CURRENCY + total;
  document.getElementById("cartBar").classList.toggle("show", count > 0);
  drawerTotal.textContent = CONFIG.CURRENCY + total;

  if (!items.length) {
    drawerBody.innerHTML = `<div class="cart-empty">Your ticket's empty.<br>Add something from the menu.</div>`;
    return;
  }
  drawerBody.innerHTML = items.map(l => {
    const quantity = Number(l.quantity || 0);
    const unitPrice = Number(l.unitPrice || 0);
    const totalPrice = Number(l.totalPrice ?? unitPrice * quantity);

    return `
    <div class="cart-line">
      <div class="cl-info">
        <h5>${l.name}</h5>
        <span>${l.sizeLabel ? l.sizeLabel + " · " : ""}₹${unitPrice} × ${quantity}</span>
      </div>
      <div class="cl-price">₹${totalPrice}</div>
      <div class="qty-control">
        <button data-key="${l.key}" data-act="dec">−</button>
        <span>${quantity}</span>
        <button data-key="${l.key}" data-act="inc">+</button>
      </div>
    </div>
  `;
  }).join("");
  drawerBody.querySelectorAll("[data-act]").forEach(btn => {
    btn.addEventListener("click", () => Cart.updateQty(btn.dataset.key, btn.dataset.act === "inc" ? 1 : -1));
  });
}
Cart.onChange(renderCartUI);
renderCartUI(Cart.getItems());

document.getElementById("placeOrderBtn").addEventListener("click", async () => {
  if (!Cart.getItems().length) { Toast.show("Add something to your ticket first"); return; }
  const profile = await ensureCustomerProfile();
  if (!profile?.customerId) {
    Toast.show("Add your name to continue");
    return;
  }

  const btn = document.getElementById("placeOrderBtn");
  btn.disabled = true;
  btn.textContent = "Placing order…";

  try {
    const items = Cart.getItems().map(line => {
      const quantity = Number(line.quantity || 0);
      const unitPrice = Number(line.unitPrice || 0);
      const totalPrice = Number(line.totalPrice ?? unitPrice * quantity);

      return {
        itemId: line.itemId,
        name: line.name,
        quantity,
        qty: quantity,
        sizeLabel: line.sizeLabel,
        unitPrice,
        totalPrice
      };
    });

    const total = items.reduce((sum, item) => sum + Number(item.totalPrice || 0), 0);
    const result = await Api.placeOrder({
      customerId: profile.customerId,
      customerName: profile.name,
      items,
      total,
      paymentMethod: selectedPayMethod
    });

    Cart.clear();
    closeDrawer();
    await refreshActiveOrders();
    await refreshHistory();
    Toast.show(`Order placed! Ticket #${result.orderId}`);
    document.getElementById("orders").scrollIntoView({ behavior: "smooth" });
  } catch (error) {
    console.error(error);
    Toast.show("Couldn't place order — check your connection and try again.");
  } finally {
    btn.disabled = false;
    btn.textContent = "Place Order";
  }
});

// ---------------------------------------------------- Orders live tracker -
const STAGE_LABELS = ["Accepted", "Preparing", "Ready to Collect"];
const STAGE_ICONS = ["📝", "🔥", "🛎️"];

function renderTrackerCard(order) {
  const stageIdx = Math.max(0, STAGE_LABELS.indexOf(order.orderStatus));
  const fillPct = ((stageIdx + 1) / STAGE_LABELS.length) * 100;
  const itemsSummary = order.items.map(i => `${getOrderItemQty(i)}× ${i.name}${i.sizeLabel ? " (" + i.sizeLabel + ")" : ""}`).join(", ");

  return `
    <div class="tracker-card">
      <div class="tracker-top">
        <div>
          <div class="oid">Ticket #${order.orderId}</div>
          <h4>${order.customerName}</h4>
        </div>
        <span class="pay-badge ${order.paymentStatus === "Paid" ? "paid" : "pending"}">${order.paymentStatus}</span>
      </div>
      <div class="stepper">
        ${STAGE_LABELS.map((label, i) => `
          <div class="step ${i < stageIdx ? "done" : i === stageIdx ? "current" : ""}">
            <div class="bar"></div>
            <div class="dot">${STAGE_ICONS[i]}</div>
            <div class="label">${label}</div>
          </div>
        `).join("")}
      </div>
      <div class="fill-track"><div class="fill-bar" style="width:${fillPct}%"></div></div>
      <div class="tracker-items">${itemsSummary} · ₹${order.total}</div>
    </div>
  `;
}

async function refreshActiveOrders() {
  const list = document.getElementById("ordersList");

  if (!currentCustomer?.customerId) {
    list.innerHTML = `<div class="empty-state"><div class="big-icon">🧾</div>No orders yet — add your name and place one from the menu.</div>`;
    return;
  }

  try {
    const orders = (await Api.getActiveOrders(currentCustomer.customerId)).map(normalizeOrder);
    if (!orders.length) {
      list.innerHTML = `<div class="empty-state"><div class="big-icon">🧾</div>No active orders right now.</div>`;
      return;
    }

    list.innerHTML = orders.map(renderTrackerCard).join("");
  } catch (error) {
    console.error(error);
    Toast.show("Couldn't refresh active orders");
  }
}

// ---------------------------------------------------------------- History -
async function refreshHistory() {
  const list = document.getElementById("historyList");

  if (!currentCustomer?.customerId) {
    list.innerHTML = `<div class="empty-state"><div class="big-icon">📜</div>Nothing here yet.</div>`;
    return;
  }

  try {
    const orders = (await Api.getHistory(currentCustomer.customerId)).map(normalizeOrder);
    if (!orders.length) {
      list.innerHTML = `<div class="empty-state"><div class="big-icon">📜</div>Your collected orders will show up here.</div>`;
      return;
    }

    list.innerHTML = `<div class="history-list">${orders.map(order => `
    <div class="history-row">
      <div class="h-left">
        <span class="h-date">${new Date(order.createdAt || order.placedAt).toLocaleString()} · #${order.orderId}</span>
        <span class="h-items">${order.items.map(item => `${getOrderItemQty(item)}× ${item.name}`).join(", ")}</span>
      </div>
      <div style="display:flex; align-items:center; gap:14px;">
        <span class="status-pill">Delivered</span>
        <span class="h-total">₹${order.total}</span>
      </div>
    </div>
  `).join("")}</div>`;
  } catch (error) {
    console.error(error);
    Toast.show("Couldn't refresh history");
  }
}
