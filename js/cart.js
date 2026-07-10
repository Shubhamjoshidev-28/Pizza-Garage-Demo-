/* ==========================================================================
   CART
   Ephemeral shopping-cart state, persisted to localStorage only so a page
   refresh doesn't wipe it. Not sensitive data — just item picks and qty.
   ========================================================================== */

const Cart = (() => {
  const KEY = "pc_cart";
  let items = load();
  const listeners = [];

  function toNumber(value) {
    const num = Number(value);
    return Number.isNaN(num) ? 0 : num;
  }

  function normalizeLine(line = {}) {
    const quantity = Math.max(0, toNumber(line.quantity ?? line.qty ?? 0));
    const unitPrice = toNumber(line.unitPrice ?? line.price ?? 0);
    return {
      key: String(line.key || ""),
      itemId: String(line.itemId || ""),
      name: String(line.name || ""),
      sizeLabel: line.sizeLabel ? String(line.sizeLabel) : null,
      quantity,
      qty: quantity,
      unitPrice,
      totalPrice: unitPrice * quantity
    };
  }

  function load() {
    try {
      const parsed = JSON.parse(localStorage.getItem(KEY)) || [];
      return Array.isArray(parsed) ? parsed.map(normalizeLine) : [];
    }
    catch { return []; }
  }
  function persist() {
    localStorage.setItem(KEY, JSON.stringify(items));
    listeners.forEach(fn => fn(items));
  }

  function lineKey(itemId, sizeIndex) {
    return itemId + "::" + (sizeIndex ?? "flat");
  }

  function add(item, sizeIndex, selectedSize, fallbackSizeLabel) {
    const key = lineKey(item.id, sizeIndex);
    const existing = items.find(l => l.key === key);
    const normalizedSize = selectedSize && typeof selectedSize === "object"
      ? selectedSize
      : {
          label: fallbackSizeLabel || null,
          price: selectedSize
        };
    const unitPrice = toNumber(normalizedSize?.price);
    const sizeLabel = normalizedSize?.label ? String(normalizedSize.label) : null;

    if (existing) {
      existing.quantity += 1;
      existing.qty = existing.quantity;
      existing.unitPrice = unitPrice;
      existing.totalPrice = existing.unitPrice * existing.quantity;
    } else {
      items.push({
        key,
        itemId: item.id,
        name: item.name,
        sizeLabel,
        quantity: 1,
        qty: 1,
        unitPrice,
        totalPrice: unitPrice
      });
    }
    persist();
  }

  function updateQty(key, delta) {
    const line = items.find(l => l.key === key);
    if (!line) return;
    line.quantity += delta;
    line.qty = line.quantity;
    line.totalPrice = line.unitPrice * line.quantity;
    if (line.quantity <= 0) items = items.filter(l => l.key !== key);
    persist();
  }

  function remove(key) {
    items = items.filter(l => l.key !== key);
    persist();
  }

  function clear() {
    items = [];
    persist();
  }

  function getItems() { return items; }
  function getCount() { return items.reduce((s, l) => s + l.quantity, 0); }
  function getTotal() { return items.reduce((s, l) => s + l.totalPrice, 0); }
  function onChange(fn) { listeners.push(fn); }

  return { add, updateQty, remove, clear, getItems, getCount, getTotal, onChange };
})();
