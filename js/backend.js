/**
 * SOUL SUSHI – SAMURAI POS BACKEND (Browser version)
 * ---------------------------------------------------
 * Stores data in localStorage
 */

const ADMIN_EMAILS = ['echostarcitizen@gmail.com'];
const WIPE_PIN = '0208';

function getAppData() {
  return { services: getLockedServices() };
}

function getLockedServices() {
  return {
    'NET-RUNNER': 5000, 'TIPSY WARRIOR': 2600, 'DRAGON CHEST': 5000,
    'SAMURAI TO GO': 3500, 'ZEN GARDEN': 5000, 'SOUL FEAST': 5000,
    'THE LAST STAND': 7000, 'SUMO SAMURAI': 13000,
    'Matcha & Bubble Tea': 150, 'Mooncake & Dango': 150,
    'Lucid Eats With Note': 100, 'Lucid Eats Without Note': 50,
    'DELIVERY B': 5500, 'FRIED RICE': 300, 'SUSHI ROLL': 600,
    'SASHIMI': 800, 'PD/EMS': 2000, 'GANG BUNDLE': 1000, 'ALCOHOL': 1000
  };
}

function saveInvoiceGrouped(items, total, employee, partner, commissionPct, commissionValue) {
  const logs = JSON.parse(localStorage.getItem('LOGS') || '[]');

  logs.push({
    time: new Date().toISOString(),
    employee,
    partner,
    total: Number(total),
    commissionPct,
    commission: Number(commissionValue)
  });

  localStorage.setItem('LOGS', JSON.stringify(logs));
}

function getLogs(range) {
  const logs = JSON.parse(localStorage.getItem('LOGS') || '[]');
  const now = new Date();
  const start = new Date(now);

  if (range === 'today') start.setHours(0,0,0,0);
  else start.setDate(start.getDate() - 7);

  return logs.filter(log => new Date(log.time) >= start).reverse();
}

function exportWeeklyLogCSV() {
  const logs = JSON.parse(localStorage.getItem('LOGS') || '[]');
  const start = new Date();
  start.setDate(start.getDate() - 7);

  const summary = {};
  logs.filter(log => new Date(log.time) >= start).forEach(log => {
    if (!summary[log.employee]) summary[log.employee] = { sales:0, commission:0 };
    summary[log.employee].sales += Number(log.total);
    summary[log.employee].commission += Number(log.commission);
  });

  let csv = 'Employee,Total Sales,Total Commission\n';
  Object.entries(summary).forEach(([employee, values]) => {
    csv += `${employee},${values.sales},${values.commission}\n`;
  });
  return csv;
}

function wipeLogs(pin) {
  if (pin !== WIPE_PIN) throw new Error('Invalid PIN');
  localStorage.removeItem('LOGS');
  return true;
}

function isAdmin(email) {
  return ADMIN_EMAILS.includes(email);
}
