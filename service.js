require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const path    = require('path');
const nodemailer = require('nodemailer');

const { connectDB } = require('./db');
const bookingRoutes = require('./booking');
const paymentRoutes = require('./payment');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname))); 

// --- NODEMAILER SETUP ---
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, // sharmilapappu20@gmail.com
        pass: process.env.EMAIL_PASS  // 16-digit App Password
    }
});

// Email Trigger Function
const sendBookingEmail = (details) => {
    const mailOptions = {
        from: `"QuickWash Service" <${process.env.EMAIL_USER}>`,
        to: process.env.RECEIVER_EMAIL || "sharmilapappu20@gmail.com", 
        subject: `New Booking: ${details.name} - ${details.brand}`,
        html: `
            <div style="font-family: Arial, sans-serif; border: 1px solid #ddd; padding: 20px; border-radius: 10px; max-width: 600px;">
                <h2 style="color: #0056b3; text-align: center;">New Service Request</h2>
                <hr>
                <p><strong>Customer Name:</strong> ${details.name}</p>
                <p><strong>Phone:</strong> ${details.phone}</p>
                <p><strong>Machine Type:</strong> ${details.machineType}</p>
                <p><strong>Brand:</strong> ${details.brand}</p>
                <p><strong>Problem:</strong> ${details.problem}</p>
                <p><strong>Address:</strong> ${details.address}</p>
                <p><strong>Location Link:</strong> <a href="${details.googleMapLink}" style="color: #0056b3;">View on Google Maps</a></p>
                <hr>
                <p style="font-size: 12px; color: #777; text-align: center;">This is an automated notification from QuickWash Service.</p>
            </div>
        `
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log("❌ Email Error:", error.message);
        } else {
            console.log("📧 Notification sent to sharmilapappu20@gmail.com successfully!");
        }
    });
};

/**
 * Route: Booking handling
 */
app.post('/api/booking', (req, res, next) => {
    console.log("📥 New Booking Data Received, sending email...");
    sendBookingEmail(req.body);
    next(); 
}, bookingRoutes);

app.use('/api/payment', paymentRoutes);

// Main Page Route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// REMOVED: app.get('/admin') route removed as requested.

const PORT = process.env.PORT || 3000;

// Connect Database then Start Server
connectDB().then(() => {
    console.log('✅ MongoDB Connected Successfully');
    app.listen(PORT, () => {
        console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
}).catch(err => {
    console.error('❌ DB Connection failed:', err.message);
    app.listen(PORT, () => {
        console.log(`⚠️ Server running without DB at http://localhost:${PORT}`);
    });
});