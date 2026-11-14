const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  base: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InventoryItem',
  },
  sauce: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InventoryItem',
  },
  cheese: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InventoryItem',
  },
  veggies: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InventoryItem',
  }],
  quantity: {
    type: Number,
    default: 1,
  },
}, { _id: false });

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  items: [orderItemSchema],
  deliveryAddress: {
    type: String,
    required: true,
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  paymentInfo: {
    razorpayOrderId: String,
    razorpayPaymentId: String,
    status: {
      type: String,
      default: 'Pending',
    },
  },
  orderStatus: {
    type: String,
    enum: ['Order Received', 'In Kitchen', 'Sent to Delivery'],
    default: 'Order Received',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Order', orderSchema);
