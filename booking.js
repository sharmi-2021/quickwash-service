require('dotenv').config();
const express = require('express');
const router  = express.Router();
const { Booking } = require('./db');
const { notifyOwner, notifyCustomer } = require('./notify');

// POST: Create a new booking
router.post('/', async (req, res) => {
  try {
    const {
      name, phone, address, problem,
      machineType, brand, date, time, 
      lat, lng, googleMapLink
    } = req.body;

    // Slot assignment
    const slot = time || req.body.slot; 

    if (!name || !phone || !problem) {
      return res.status(400).json({
        success: false,
        error: 'Name, phone and problem required!'
      });
    }

    // 1. Save to Database
    let booking;
    try {
        booking = new Booking({
          name, phone, address, problem,
          machineType, brand, date, slot,
          lat, lng,
          googleMapLink: googleMapLink || 'Location not shared'
        });
        await booking.save();
        console.log('✅ Booking saved to DB');
    } catch (dbErr) {
        console.error('⚠️ DB Save Failed, but proceeding with notifications:', dbErr.message);
        // Manual object for notifications if DB fails
        booking = { name, phone, address, problem, machineType, brand, date, slot, googleMapLink };
    }

    // 2. Send SMS & WhatsApp/Email Notifications
    // Note: Email trigger logic service.js-la middleware-ah irukku, 
    // so inga SMS mattum handle pannalaam.
    try {
      console.log('📱 Triggering Notifications for sharmilapappu20@gmail.com...');
      await notifyOwner(booking);
      await notifyCustomer(phone, name, date, slot);
      console.log('✅ Notifications Sent Successfully');
    } catch (notificationErr) {
      console.error('❌ Notification Error:', notificationErr.message);
    }

    res.json({
      success:   true,
      message:   'Booking processed!',
      bookingId: booking._id || 'TEMP_ID'
    });

  } catch (err) {
    console.error('❌ Booking Route Error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET all bookings (Admin check panna)
router.get('/', async (req, res) => {
    try {
        const bookings = await Booking.find().sort({ createdAt: -1 });
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;