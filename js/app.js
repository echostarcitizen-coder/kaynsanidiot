/* =========================
   Static Data
   ========================= */

const EMPLOYEES = {
  "Stacy Veil": 30, "Lexi Voss": 30, "Nikkia Gunn": 30, "Daryl Dixon": 30,
  "Valensia Capone": 25, "Kiki BonBon": 25,
  "Harvey Specteroni": 20, "Moe Bongo": 20, "Premberly Lovelace": 20,
  "Loc Kazinsky": 20, "Pat Veil": 20, "Will Ospreay": 20,
  "Dylan Maguire": 20, "Kayn Fluit": 20, "Logini Daogini": 20,
  "Nathan Griffin": 20, "Jake Cherry": 20, "Harry Grey": 20,
  "William Butcher": 20, "Testing Sushi": 100
};

const PARTNERS = {
  "None": 0, "Lucid Motors": 25, "Harmony Repair": 25,
  "High Notes": 25, "Puff Puff Pass": 25, "Gunstore 366": 25,
  "Vanilla Unicorn": 25, "Imports": 25, "Taxi": 25,
  "Weazel News": 25, "Employee": 50
};

/* =========================
   State
   ========================= */

let SERVICES = getAppData().services;
let subtotal = 0;

/* =========================
   DOM References
   ========================= */

const employee   = document.getElementById('employee');
const partner    = document.getElementById('partner');
const product    = document.getElementById('product');
const logs       = document.getElementById('logs');
const subtotalEl = document.getElementById('subtotal');
const discountEl = document.getElementById('discountPct');
const totalEl    = document.getElementById('total');

/* =========================
   Initialization
   ========================= */

employee.innerHTML = Object.keys(EMPLOYEES).map(e => `<option>${e}</option>`).join('');
partner.innerHTML  = Object.keys(PARTNERS).map(p => `<option>${p}</option>`).join('');
product.innerHTML  = Object.entries(SERVICES).map(([name, price]) => 
  `<option value="${name}">${name} – $${price}</option>`).join('');

/* =========================
   Cart Logic
   ========================= */

function addItem() {
  const price = SERVICES[product.value];
  if (!price) return;

  subtotal += price;
  renderTotals();
}

function renderTotals() {
  const discount = PARTNERS[partner.value] || 0;
  subtotalEl.innerText = subtotal;
  discountEl.innerText = discount;
  totalEl.innerText = Math.round(subtotal * (1 - discount/100));
}

partner.onchange = renderTotals;

/* =========================
   Save Invoice
   ========================= */

function saveInvoice() {
  if (!subtotal) return alert('No items added');

  const employeeName = employee.value;
  const commissionPct = EMPLOYEES[employeeName];
  const totalValue = Number(totalEl.innerText);
  const commission = Math.round(totalValue * (commissionPct / 100));

  saveInvoiceGrouped([], totalValue, employeeName, partner.value, commissionPct, commission);

  subtotal = 0;
  renderTotals();
  loadLogs();
}

/* =========================
   Logs
   ========================= */

function loadLogs() {
  const rows = getLogs('week');
  logs.innerHTML = '';
  rows.slice(0,3).forEach(row => {
    logs.innerHTML += `
      <div class="log">
        <strong>${row.employee}</strong> (${row.commissionPct}%)<br>
        <span class="muted">${row.partner} • $${row.total}</span><br>
        Commission: <strong>$${row.commission}</strong>
      </div>
    `;
  });
}

/* =========================
   Export CSV
   ========================= */

function downloadWeekly() {
  const csv = exportWeeklyLogCSV();
  if (!csv) return alert('No logs to download');

  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([csv], {type:'text/csv'}));
  a.download = `soul_sushi_weekly_${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
}

/* =========================
   Admin Wipe
   ========================= */

function wipeWithPin() {
  const pin = prompt('Enter admin PIN');
  if (!pin) return;
  if (!confirm('This will permanently delete all logs. Continue?')) return;

  try {
    wipeLogs(pin);
    alert('Logs successfully wiped');
    loadLogs();
  } catch(err) {
    alert('WIPE FAILED: ' + err.message);
  }
}

/* =========================
   Initial Load
   ========================= */

loadLogs();
renderTotals();

