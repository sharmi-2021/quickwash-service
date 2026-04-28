const nodemailer = require('nodemailer');
// DB and Notify modules unga api folder kulla iruppadhala path sariya check pannunga
const { Booking } = require('./db'); 
const { notifyOwner, notifyCustomer } = require('./notify');

/**
 * Vercel Serverless Function - Handles POST and GET for /api/booking
 */
module.exports = async (req, res) => {
    // 1. GET Request: Bookings history paarka
    if (req.method === 'GET') {
        try {
            const bookings = await Booking.find().sort({ createdAt: -1 });
            return res.status(200).json(bookings);
        } catch (err) {
            return res.status(500).json({ error: 'Database fetch failed' });
        }
    }

    // 2. POST Request: Pudhu booking create panna
    if (req.method === 'POST') {
        try {
            const {
                name, phone, address, problem,
                machineType, brand, date, time, 
                lat, lng, googleMapLink
            } = req.body;

            const slot = time || req.body.slot;

            // Basic Validation
            if (!name || !phone || !problem) {
                return res.status(400).json({
                    success: false,
                    error: 'System Error: Name, Phone, and Problem are mandatory.'
                });
            }

            // Step A: Save to Database (Optional - but handled safely)
            let booking;
            try {
                booking = new Booking({
                    name, phone, address, problem,
                    machineType, brand, date, slot,
                    lat, lng,
                    googleMapLink: googleMapLink || 'Location not shared'
                });
                await booking.save();
                console.log('✅ System: Booking archived in Database.');
            } catch (dbErr) {
                console.error('⚠️ Warning: DB connection failed, bypassing to notifications.');
                booking = { name, phone, address, problem, machineType, brand, date, slot, googleMapLink };
            }

            // Step B: Trigger Email Notifications
            console.log('📨 System: Dispatching notifications to quickwashservice.chennai@gmail.com...');
            
            // Note: Notify functions-la nodemailer logic irukkura maadhiri confirm pannikonga
            await notifyOwner(booking);
            await notifyCustomer(phone, name, date, slot);

            console.log('✅ System: Email notification successfully dispatched.');

            return res.status(200).json({
                success: true,
                message: 'Booking request successfully processed!',
                bookingId: booking._id || 'TEMP_SYNC_ID'
            });

        } catch (err) {
            console.error('❌ Critical Error:', err.message);
            return res.status(500).json({ 
                success: false, 
                error: 'Internal Server Error',
                details: err.message 
            });
        }
    }

    // Default: Method not allowed
    return res.status(405).json({ error: 'Method Not Allowed' });
};