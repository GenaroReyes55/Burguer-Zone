/* =========================================================
   CONFIGURACIÓN DEL RESTAURANTE
   Cambia aquí el número de WhatsApp donde llegarán los pedidos.
   Formato: código de país + número, SIN espacios ni signos.
   Ejemplo México: 52 + 9611234567 = 529611234567
   ========================================================= */
const WHATSAPP_NUMBER = "5215613385501";

/* =========================================================
   MENÚ — edita nombres, descripciones y precios aquí
   ========================================================= */
const MENU = {
  hamburguesas: [
    { id: "h1", name: "Clásica", label: "Hamburguesa", desc: "100gr de carne, queso americano, jamón, tocino, lechuga, tomate, chile asado, cebolla caramelizada y aderezos.", price: 75 },
    { id: "h2", name: "Hawaiana", label: "Hamburguesa", desc: "100gr de carne, queso americano, jamón, tocino, lechuga, piña, queso chédar, tomate, cebolla, BBQ y aderezos.", price: 85 },
    { id: "h3", name: "Doble Carne", label: "Hamburguesa", desc: "200gr de carne, queso americano, jamón, tocino, lechuga, queso asadero, queso chédar, tomate, cebolla, guacamole y aderezos (al doble).", price: 120 },
    { id: "h4", name: "Mamalona", label: "Hamburguesa", desc: "100gr de carne, queso americano, jamón, tocino, lechuga, piña, queso chédar, tomate, cebolla, BBQ y aderezos.", price: 100 },
  ],
  hotdogs: [
    { id: "d1", name: "Sencillo", label: "Hot Dog", desc: "Salchicha de pavo, aderezos, tomate y cebolla.", price: 35 },
    { id: "d2", name: "Especial", label: "Hot Dog", desc: "Salchicha de pavo, tocino, queso asadero, queso chédar, aderezos, tomate y cebolla.", price: 45 },
    { id: "d3", name: "Mamalón", label: "Hot Dog", desc: "Salchicha de pavo, queso asadero, tocino, cebolla caramelizada, chile asado, piña, aguacate, aderezos.", price: 65 },
  ],
  bebidas: [
    { id: "b1", name: "Refresco", label: "Bebida", desc: "Lata / botella fría.", price: 30 },
    { id: "b2", name: "Agua de sabor", label: "Bebida", desc: "Preparada del día.", price: 25 },
  ],
};

const CATEGORY_LABELS = { hamburguesas: "list-hamburguesas", hotdogs: "list-hotdogs", bebidas: "list-bebidas" };

/* =========================================================
   ZONAS DE ENVÍO — edita nombres y costos aquí
   ========================================================= */
const ZONES = [
  { id: "puerta", name: "A la puerta", cost: 25 },
  { id: "jardines", name: "Jardines", cost: 15 },
  { id: "arboledas", name: "Arboledas", cost: 15 },
  { id: "victoria", name: "Fraccionamiento La Victoria", cost: 50 },
];

/* =========================================================
   ESTADO DEL CARRITO
   ========================================================= */
let cart = {}; // { itemId: qty }

function allItems() {
  return [...MENU.hamburguesas, ...MENU.hotdogs, ...MENU.bebidas];
}

function findItem(id) {
  return allItems().find(i => i.id === id);
}

function cartCount() {
  return Object.values(cart).reduce((a, b) => a + b, 0);
}

function cartTotal() {
  return Object.entries(cart).reduce((sum, [id, qty]) => sum + findItem(id).price * qty, 0);
}

/* =========================================================
   RENDER DEL MENÚ
   ========================================================= */
function renderMenu() {
  Object.entries(CATEGORY_LABELS).forEach(([cat, listId]) => {
    const container = document.getElementById(listId);
    container.innerHTML = "";
    MENU[cat].forEach(item => {
      const card = document.createElement("div");
      card.className = "item-card";
      card.innerHTML = `
        <div class="item-name">${item.name}</div>
        <div class="item-price">$${item.price}</div>
        <div class="item-desc">${item.desc}</div>
        <div class="item-add" data-add="${item.id}"></div>
      `;
      container.appendChild(card);
      renderItemControl(item.id);
    });
  });
}

function renderItemControl(id) {
  const holder = document.querySelector(`[data-add="${id}"]`);
  if (!holder) return;
  const qty = cart[id] || 0;

  if (qty === 0) {
    holder.innerHTML = `<button class="qty-add-btn" data-inc="${id}">+</button>`;
  } else {
    holder.innerHTML = `
      <div class="qty-control">
        <button data-dec="${id}">−</button>
        <span>${qty}</span>
        <button data-inc="${id}">+</button>
      </div>`;
  }
}

document.addEventListener("click", (e) => {
  const incId = e.target.getAttribute("data-inc");
  const decId = e.target.getAttribute("data-dec");
  if (incId) {
    cart[incId] = (cart[incId] || 0) + 1;
    renderItemControl(incId);
    renderTicket();
  }
  if (decId) {
    cart[decId] = Math.max(0, (cart[decId] || 0) - 1);
    if (cart[decId] === 0) delete cart[decId];
    renderItemControl(decId);
    renderTicket();
  }
});

/* =========================================================
   NAV DE CATEGORÍAS
   ========================================================= */
const catButtons = document.querySelectorAll(".cat-btn");
catButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    catButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    const target = document.getElementById(btn.dataset.target);
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

/* =========================================================
   BLOQUEO DE SCROLL DE FONDO (evita saltos raros en móvil)
   ========================================================= */
let savedScrollY = 0;
let scrollLockCount = 0;

function lockScroll() {
  if (scrollLockCount === 0) {
    savedScrollY = window.scrollY;
    document.body.style.top = `-${savedScrollY}px`;
    document.body.classList.add("no-scroll");
  }
  scrollLockCount++;
}

function unlockScroll() {
  scrollLockCount = Math.max(0, scrollLockCount - 1);
  if (scrollLockCount === 0) {
    document.body.classList.remove("no-scroll");
    document.body.style.top = "";
    window.scrollTo(0, savedScrollY);
  }
}

/* =========================================================
   TICKET / CARRITO LATERAL
   ========================================================= */
const ticketFab = document.getElementById("ticketFab");
const fabCount = document.getElementById("fabCount");
const orderTicket = document.getElementById("orderTicket");
const overlay = document.getElementById("overlay");
const closeTicket = document.getElementById("closeTicket");
const ticketBody = document.getElementById("ticketBody");
const emptyMsg = document.getElementById("emptyMsg");
const ticketTotal = document.getElementById("ticketTotal");
const goCheckout = document.getElementById("goCheckout");

function renderTicket() {
  const count = cartCount();
  fabCount.textContent = count;
  ticketTotal.textContent = `$${cartTotal()}`;
  goCheckout.disabled = count === 0;

  ticketBody.querySelectorAll(".ticket-item").forEach(el => el.remove());

  if (count === 0) {
    emptyMsg.style.display = "block";
    return;
  }
  emptyMsg.style.display = "none";

  Object.entries(cart).forEach(([id, qty]) => {
    const item = findItem(id);
    const row = document.createElement("div");
    row.className = "ticket-item";
    row.innerHTML = `
      <span class="ti-name">${item.name} <span class="ti-tag">${item.label}</span></span>
      <span class="ti-price">$${item.price * qty}</span>
      <div class="ti-controls">
        <div class="qty-control">
          <button data-dec="${id}">−</button>
          <span>${qty}</span>
          <button data-inc="${id}">+</button>
        </div>
        <span style="color:var(--cream-dim)">$${item.price} c/u</span>
      </div>
    `;
    ticketBody.appendChild(row);
  });
}

function openTicket() {
  orderTicket.classList.add("open");
  overlay.classList.add("show");
  lockScroll();
}
function closeTicketPanel() {
  if (orderTicket.classList.contains("open")) {
    orderTicket.classList.remove("open");
    overlay.classList.remove("show");
    unlockScroll();
  }
}

ticketFab.addEventListener("click", openTicket);
closeTicket.addEventListener("click", closeTicketPanel);
overlay.addEventListener("click", closeTicketPanel);

/* =========================================================
   CHECKOUT — PASOS
   ========================================================= */
const checkoutModal = document.getElementById("checkoutModal");
const checkoutOverlay = document.getElementById("checkoutOverlay");
const closeCheckout = document.getElementById("closeCheckout");
const backStep = document.getElementById("backStep");
const stepsIndicator = document.querySelectorAll(".step");
const stepPanels = document.querySelectorAll(".step-panel");

let currentStep = 1;
let order = { delivery: null, zone: null, name: "", address: "", phone: "", comments: "", payment: null, change: "" };

function goToStep(n) {
  currentStep = n;
  stepPanels.forEach(p => p.classList.toggle("active", Number(p.dataset.stepPanel) === n));
  stepsIndicator.forEach(s => s.classList.toggle("active", Number(s.dataset.step) <= n));
  backStep.classList.toggle("visible", n > 1);

  if (n === 2) {
    document.getElementById("step2Title").textContent =
      order.delivery === "domicilio" ? "Datos de entrega" : "Datos de contacto";
    document.getElementById("addressField").style.display =
      order.delivery === "domicilio" ? "flex" : "none";

    const zoneField = document.getElementById("zoneField");
    if (order.delivery === "domicilio") {
      zoneField.style.display = "block";
      renderZoneGrid();
    } else {
      zoneField.style.display = "none";
      order.zone = null;
    }
  }
  if (n === 4) buildSummary();
}

function renderZoneGrid() {
  const grid = document.getElementById("zoneGrid");
  grid.innerHTML = "";
  ZONES.forEach(z => {
    const btn = document.createElement("button");
    btn.className = "choice-card";
    btn.dataset.zone = z.id;
    if (order.zone && order.zone.id === z.id) btn.classList.add("selected");
    btn.innerHTML = `
      <span class="choice-title">${z.name}</span>
      <span class="zone-price">+$${z.cost}</span>
    `;
    btn.addEventListener("click", () => {
      order.zone = z;
      document.querySelectorAll("#zoneGrid .choice-card").forEach(b => b.classList.remove("selected"));
      btn.classList.add("selected");
    });
    grid.appendChild(btn);
  });
}

function openCheckout() {
  closeTicketPanel();
  checkoutModal.classList.add("open");
  checkoutOverlay.classList.add("show");
  lockScroll();
  document.getElementById("acceptTerms").checked = false;
  document.getElementById("sendWhatsapp").disabled = true;
  goToStep(1);
}
function closeCheckoutPanel() {
  checkoutModal.classList.remove("open");
  checkoutOverlay.classList.remove("show");
  unlockScroll();
}

goCheckout.addEventListener("click", openCheckout);
closeCheckout.addEventListener("click", closeCheckoutPanel);
checkoutOverlay.addEventListener("click", closeCheckoutPanel);
backStep.addEventListener("click", () => { if (currentStep > 1) goToStep(currentStep - 1); });

// Paso 1: tipo de entrega
document.querySelectorAll("[data-delivery]").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll("[data-delivery]").forEach(b => b.classList.remove("selected"));
    btn.classList.add("selected");
    order.delivery = btn.dataset.delivery;
    setTimeout(() => goToStep(2), 180);
  });
});

// Paso 2: siguiente
document.getElementById("toStep3").addEventListener("click", () => {
  order.name = document.getElementById("custName").value.trim();
  order.address = document.getElementById("custAddress").value.trim();
  order.phone = document.getElementById("custPhone").value.trim();
  order.comments = document.getElementById("custComments").value.trim();

  if (!order.name || !order.phone) {
    alert("Por favor completa tu nombre y teléfono.");
    return;
  }
  if (order.delivery === "domicilio" && !order.address) {
    alert("Por favor escribe tu dirección para el envío.");
    return;
  }
  if (order.delivery === "domicilio" && !order.zone) {
    alert("Por favor elige la zona de tu envío.");
    return;
  }
  goToStep(3);
});

// Paso 3: pago
document.querySelectorAll("[data-payment]").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll("[data-payment]").forEach(b => b.classList.remove("selected"));
    btn.classList.add("selected");
    order.payment = btn.dataset.payment;
    document.getElementById("changeField").style.display =
      order.payment === "efectivo" ? "flex" : "none";
  });
});
document.getElementById("toStep4").addEventListener("click", () => {
  if (!order.payment) {
    alert("Elige un método de pago.");
    return;
  }
  order.change = document.getElementById("custChange").value.trim();
  if (order.payment === "efectivo" && !order.change) {
    alert("Por favor indica con cuánto vas a pagar, para llevar tu cambio.");
    return;
  }
  goToStep(4);
});

/* =========================================================
   RESUMEN + ENVÍO A WHATSAPP
   ========================================================= */
function buildOrderLines() {
  return Object.entries(cart).map(([id, qty]) => {
    const item = findItem(id);
    return `• ${qty}x [${item.label}] ${item.name} — $${item.price * qty}`;
  });
}

function deliveryCost() {
  return order.delivery === "domicilio" && order.zone ? order.zone.cost : 0;
}

function grandTotal() {
  return cartTotal() + deliveryCost();
}

function buildSummary() {
  const lines = buildOrderLines();
  const deliveryText = order.delivery === "domicilio" ? "Envío a domicilio 🛵" : "Recoger en el local 🏠";
  const paymentText = order.payment === "efectivo" ? "Efectivo 💵" : "Transferencia 💳";

  let text = `PEDIDO BURGUER ZONE\n${"-".repeat(24)}\n`;
  text += lines.join("\n") + "\n";
  text += `${"-".repeat(24)}\n`;
  text += `Subtotal: $${cartTotal()}\n`;
  if (order.delivery === "domicilio" && order.zone) {
    text += `Envío (${order.zone.name}): $${order.zone.cost}\n`;
  }
  text += `TOTAL: $${grandTotal()}\n\n`;
  text += `Entrega: ${deliveryText}\n`;
  if (order.delivery === "domicilio") text += `Zona: ${order.zone ? order.zone.name : "-"}\n`;
  if (order.delivery === "domicilio") text += `Dirección: ${order.address}\n`;
  text += `Nombre: ${order.name}\n`;
  text += `Teléfono: ${order.phone}\n`;
  text += `Pago: ${paymentText}\n`;
  if (order.change) text += `Cambio: ${order.change}\n`;
  if (order.comments) text += `Comentarios: ${order.comments}\n`;

  document.getElementById("summaryTicket").textContent = text;
}

document.getElementById("termsToggle").addEventListener("click", (e) => {
  const list = document.getElementById("termsList");
  const isHidden = list.hasAttribute("hidden");
  if (isHidden) {
    list.removeAttribute("hidden");
    e.currentTarget.classList.add("open");
  } else {
    list.setAttribute("hidden", "");
    e.currentTarget.classList.remove("open");
  }
});

document.getElementById("acceptTerms").addEventListener("change", (e) => {
  document.getElementById("sendWhatsapp").disabled = !e.target.checked;
});

document.getElementById("sendWhatsapp").addEventListener("click", () => {
  const lines = buildOrderLines();
  const deliveryText = order.delivery === "domicilio" ? "Envío a domicilio" : "Recoger en el local";
  const paymentText = order.payment === "efectivo" ? "Efectivo" : "Transferencia";

  let msg = `¡Hola Burguer Zone! 🍔 Quiero hacer este pedido:\n\n`;
  msg += lines.join("\n") + "\n\n";
  msg += `Subtotal: $${cartTotal()}\n`;
  if (order.delivery === "domicilio" && order.zone) {
    msg += `Envío (${order.zone.name}): $${order.zone.cost}\n`;
  }
  msg += `Total: $${grandTotal()}\n\n`;
  msg += `Entrega: ${deliveryText}\n`;
  if (order.delivery === "domicilio") msg += `Zona: ${order.zone ? order.zone.name : "-"}\n`;
  if (order.delivery === "domicilio") msg += `Dirección: ${order.address}\n`;
  msg += `Nombre: ${order.name}\n`;
  msg += `Teléfono: ${order.phone}\n`;
  msg += `Pago: ${paymentText}\n`;
  if (order.change) msg += `Cambio: ${order.change}\n`;
  if (order.comments) msg += `Comentarios: ${order.comments}\n`;

  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
  window.open(url, "_blank");
});

/* =========================================================
   INICIO
   ========================================================= */
renderMenu();
renderTicket();