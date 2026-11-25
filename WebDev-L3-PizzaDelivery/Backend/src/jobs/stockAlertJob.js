const cron = require('node-cron');
const InventoryItem = require('../models/InventoryItem');
const sendEmail = require('../utils/sendEmail');

async function sendLowStockAlert() {
  const items = await InventoryItem.find({
    $expr: { $lt: ['$stockCount', '$threshold'] },
  }).sort({ category: 1, name: 1 });

  if (!items.length || !process.env.ADMIN_EMAIL) {
    return;
  }

  const rows = items.map((item) => (
    `<tr><td>${item.name}</td><td>${item.category}</td><td>${item.stockCount}</td><td>${item.threshold}</td></tr>`
  )).join('');
  await sendEmail({
    to: process.env.ADMIN_EMAIL,
    subject: 'PizzaCraft low-stock alert',
    html: `<h2>Low-stock ingredients</h2><table><thead><tr><th>Name</th><th>Category</th><th>Stock</th><th>Threshold</th></tr></thead><tbody>${rows}</tbody></table>`,
  });
}

function startStockAlertJob() {
  cron.schedule('*/15 * * * *', () => {
    sendLowStockAlert().catch((error) => {
      console.error('Low-stock alert failed:', error);
    });
  });
}

module.exports = startStockAlertJob;
module.exports.sendLowStockAlert = sendLowStockAlert;
