const express = require('express');
const InventoryItem = require('../models/InventoryItem');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const items = await InventoryItem.find().sort({ category: 1, price: 1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Could not load inventory', error: error.message });
  }
});

router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const item = await InventoryItem.create(req.body);
    res.status(201).json(item);
  } catch (error) {
    res.status(400).json({ message: 'Could not create inventory item', error: error.message });
  }
});

router.put('/:id/restock', protect, adminOnly, async (req, res) => {
  try {
    const amount = Number(req.body.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({ message: 'Restock amount must be positive' });
    }
    const item = await InventoryItem.findByIdAndUpdate(
      req.params.id,
      { $inc: { stockCount: amount } },
      { new: true, runValidators: true },
    );
    if (!item) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }
    res.json(item);
  } catch (error) {
    res.status(400).json({ message: 'Could not restock item', error: error.message });
  }
});

module.exports = router;
