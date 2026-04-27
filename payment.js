require('dotenv').config();
const express  = require('express');
const router   = express.Router();
const { Booking } = require('./db');

router.post('/order', async (req, res) => {
  try {
    const Razorpay = require('razorpay');
    const razorpay = new Razorpay({
      key_id:     process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });
    const { amount, bookingId } = req.body;
    const order = await razorpay.orders.create({
      amount:   amount * 100,
      currency: 'INR',
      receipt:  `receipt_${bookingId}`
    });
    res.json({ success: true, order });
  } catch (err) {
    console.error('❌ Payment Order Error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/verify', async (req, res) => {
  try {
    const { bookingId, paymentId, amount } = req.body;
    await Booking.findByIdAndUpdate(bookingId, {
      paymentStatus: 'Paid',
      paymentId,
      amount
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/cash', async (req, res) => {
  try {
    const { bookingId } = req.body;
    await Booking.findByIdAndUpdate(bookingId, {
      paymentStatus: 'Cash on Service'
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/history', async (req, res) => {
  try {
    const payments = await Booking.find(
      { paymentStatus: 'Paid' },
      { name:1, phone:1, amount:1, paymentId:1, date:1, problem:1, createdAt:1 }
    ).sort({ createdAt: -1 });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const paid = await Booking.find({ paymentStatus: 'Paid' });
    const totalRevenue = paid.reduce((sum, b) => sum + (b.amount || 0), 0);
    res.json({ totalPaid: paid.length, totalRevenue });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;