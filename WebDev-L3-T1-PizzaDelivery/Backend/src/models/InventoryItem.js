const mongoose = require('mongoose');

const inventoryItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ['base', 'sauce', 'cheese', 'veggie'],
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  stockCount: {
    type: Number,
    required: true,
    min: 0,
    default: 50,
  },
  threshold: {
    type: Number,
    default: 20,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('InventoryItem', inventoryItemSchema);
