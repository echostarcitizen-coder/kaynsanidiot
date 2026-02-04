let employees = {};
let partners = {};
let items = {};
let cart = [];
let subtotal = 0;

// DOM references
const employeeEl   = document.getElementById('employee');
const partnerEl    = document.getElementById('partner');
const productEl    = document.getElementById('product');
const logsEl       = document.getElementById('logs');
const subtotalEl   = document.getElementById('subtotal');
const discountEl   = document.getElementById('discountPct');
const totalEl      = document.getElementById('total');

// =========================
// Fetch data from SQL backend
// =========================
async function loadStaticData() {
  employees = await (await fetch('/api/employees')).json();
  partners  = await (await fetch('/api/partners')).json();
  items     = await (await fetch('/api/items')).json();

  // Populate dropdowns
  employeeEl.innerHTML = Object.keys(employees).map(e => `<option>${e}</option>`).join('');
  partnerEl.innerHTML  = Object.keys(partners).map(p => `<option>${p}</option>`).join('');
  productEl.innerHTML  = Object.entries(items)
    .map(([name, price]) => `<option value="${name}">${name} – $${price}</option>`).join('');
}

loadStaticData();

// =========================
// Cart Logic
// =========================
function addItem() {
  const itemName = productEl.value;
  const price = items[itemName];
  if (!price) return;

  cart.push(itemName);
  subtotal += price;
  renderTotals();
}

function renderTotals() {
  const discount = partners[partnerEl.value] || 0;
  subtotalEl.innerText = subtotal;
  discountEl.innerText = discount;
  totalEl.innerText = Math.round(subtotal * (1 - discount/100));
}

partnerEl.onchange = renderTotals;

// =========================
// Save Invoice to SQL backend
// =========================
async function saveInvoice() {
  if (!cart.length) return alert('No items added');

  const employeeName = employeeEl.value;
  const partnerName  = partnerEl.value;
  const commissionPct = employees[employeeName];
  const totalValue = Math.round(subtotal * (1 - (partners[partnerName] || 0)/100));
  const commission = Math.round(totalValue * (commissionPct / 100));

  // Send to backend
  await fetch('/api/sales', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      employee_name: employeeName,
      items: cart,
      partner_name: partnerName,
      amount: totalValue,
      commission_pct: commissionPct,
      commission
    })
  });

  // Reset cart
  cart = [];
  subtotal = 0;
  renderTotals();
  loadLogs();
}

// =========================
// Load logs from backend
// =========================
async function loadLogs() {
  const logs = await (await fetch('/api/sales?range=week')).json();
  logsEl.innerHTML = '';

  logs.slice(0,3).forEach(row => {
    logsEl.innerHTML += `
      <div class="log">
        <strong>${row.employee_name}</strong> (${row.commission_pct}%)<br>
        <span class="muted">${row.partner_name} • $${row.amount}</span><br>
        Commission: <strong>$${row.commission}</strong>
      </div>
    `;
  });
}

// =========================
// Download weekly CSV
// =========================
async function downloadWeekly() {
  const res = await fetch('/api/sales/export-weekly');
  const csv = await res.text();

  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([csv], {type:'text/csv'}));
  a.download = `soul_sushi_weekly_${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
}

// =========================
// Admin Wipe
// =========================
async function wipeWithPin() {
  const pin = prompt('Enter admin PIN');
  if (!pin) return;
  if (!confirm('This will permanently delete all logs. Continue?')) return;

  try {
    const res = await fetch('/api/sales/wipe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin })
    });
    const result = await res.json();
    if (result.success) {
      alert('Logs successfully wiped');
      loadLogs();
    } else {
      throw new Error(result.message);
    }
  } catch(err) {
    alert('WIPE FAILED: ' + err.message);
  }
}

// Initial load
loadLogs();
renderTotals();
