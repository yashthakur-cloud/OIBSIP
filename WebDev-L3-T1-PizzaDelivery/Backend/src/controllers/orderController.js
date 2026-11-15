const crypto = require('crypto');
const Razorpay = require('razorpay');
const Order = require('../models/Order');
const InventoryItem = require('../models/InventoryItem');

function getRazorpay() {
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

function ingredientIds(items) {
  return items.flatMap((item) => [
    item.base,
    item.sauce,
    item.cheese,
    ...(item.veggies || []),
  ]).filter(Boolean).map(String);
}

async function createRazorpayOrder(req, res) {
  try {
    const amount = Number(req.body.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({ message: 'A valid amount is required' });
    }
    const order = await getRazorpay().orders.create({
      amount: Math.round(amount * 100),
      currency: 'INR',
    });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Could not create payment order', error: error.message });
  }
}

async function verifyPayment(req, res) {
  try {
    const {
      razorpay_order_id: razorpayOrderId,
      razorpay_payment_id: razorpayPaymentId,
      razorpay_signature: razorpaySignature,
      items,
      deliveryAddress,
      totalAmount,
    } = req.body;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    if (!razorpayOrderId || !razorpayPaymentId || expectedSignature !== razorpaySignature) {
      return res.status(400).json({ message: 'Payment verification failed' });
    }
    if (!Array.isArray(items) || !deliveryAddress || !Number.isFinite(Number(totalAmount))) {
      return res.status(400).json({ message: 'Order details are incomplete' });
    }

    const quantities = new Map();
    for (const item of items) {
      const quantity = Number(item.quantity) || 1;
      for (const id of ingredientIds([item])) {
        quantities.set(id, (quantities.get(id) || 0) + quantity);
      }
    }
    for (const [id, quantity] of quantities) {
      const updated = await InventoryItem.findOneAndUpdate(
        { _id: id, stockCount: { $gte: quantity } },
        { $inc: { stockCount: -quantity } },
        { new: true },
      );
      if (!updated) {
        return res.status(409).json({ message: 'One or more ingredients are out of stock' });
      }
    }

    const order = await Order.create({
      user: req.user._id,
      items,
      deliveryAddress,
      totalAmount: Number(totalAmount),
      paymentInfo: {
        razorpayOrderId,
        razorpayPaymentId,
        status: 'Paid',
      },
      orderStatus: 'Order Received',
    });
    const populatedOrder = await Order.findById(order._id)
      .populate('user', 'name email')
      .populate('items.base items.sauce items.cheese items.veggies', 'name price');
    if (req.io) {
      req.io.emit('newOrder', populatedOrder);
    }
    res.status(201).json(populatedOrder);
  } catch (error) {
    res.status(500).json({ message: 'Could not save order', error: error.message });
  }
}

async function getMyOrders(req, res) {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('items.base items.sauce items.cheese items.veggies', 'name price')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Could not load orders', error: error.message });
  }
}

async function getAllOrders(req, res) {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .populate('items.base items.sauce items.cheese items.veggies', 'name price')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Could not load orders', error: error.message });
  }
}

async function updateOrderStatus(req, res) {
  try {
    const allowedStatuses = ['Order Received', 'In Kitchen', 'Sent to Delivery'];
    if (!allowedStatuses.includes(req.body.orderStatus)) {
      return res.status(400).json({ message: 'Invalid order status' });
    }
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { orderStatus: req.body.orderStatus },
      { new: true, runValidators: true },
    );
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    if (req.io) {
      req.io.emit(`orderStatus_${order._id}`, order.orderStatus);
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Could not update order status', error: error.message });
  }
}

module.exports = {
  createRazorpayOrder,
  verifyPayment,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
};
