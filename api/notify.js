require('dotenv').config();
const nodemailer = require('nodemailer');

// 1. Notify Owner (SMS + Email)
const notifyOwner = async (booking) => {
  try {
    // --- EMAIL LOGIC ---
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // Unga business mail-ke varum
      subject: `🔔 New Booking: ${booking.name}`,
      text: `
        New Service Booking Received!
        ━━━━━━━━━━━━━━━━━━━━━━
        Name    : ${booking.name}
        Phone   : ${booking.phone}
        Problem : ${booking.problem}
        Brand   : ${booking.brand} (${booking.machineType})
        Date    : ${booking.date}
        Slot    : ${booking.slot}
        Address : ${booking.address}
        Map     : ${booking.googleMapLink}
        ━━━━━━━━━━━━━━━━━━━━━━
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Owner Email sent!');

    // --- SMS LOGIC (Twilio) ---
    if (process.env.TWILIO_SID && process.env.TWILIO_TOKEN) {
      const twilio = require('twilio');
      const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);
      await client.messages.create({
        body: `🔔 NEW BOOKING: ${booking.name} - ${booking.phone} - ${booking.problem}`,
        from: process.env.TWILIO_PHONE,
        to: process.env.OWNER_PHONE
      });
      console.log('✅ Owner SMS sent!');
    }
  } catch (err) {
    console.error('❌ Owner Notification Error:', err.message);
  }
};

// 2. Notify Customer (SMS)
const notifyCustomer = async (phone, name, date, slot) => {
  try {
    if (process.env.TWILIO_SID && process.env.TWILIO_TOKEN) {
      const twilio = require('twilio');
      const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);
      await client.messages.create({
        body: `✅ QuickWash Confirmed! Hi ${name}, technician will arrive on ${date} (${slot}). Questions? Call: ${process.env.OWNER_PHONE}`,
        from: process.env.TWILIO_PHONE,
        to: `+91${phone}`
      });
      console.log('✅ Customer SMS sent!');
    }
  } catch (err) {
    console.error('❌ Customer SMS Error:', err.message);
  }
};

module.exports = { notifyOwner, notifyCustomer };