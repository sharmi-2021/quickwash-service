require('dotenv').config();

const notifyOwner = async (booking) => {
  try {
    const twilio = require('twilio');
    const client = twilio(
      process.env.TWILIO_SID,
      process.env.TWILIO_TOKEN
    );
    await client.messages.create({
      body: `🔔 NEW BOOKING!
━━━━━━━━━━━━━━━━
👤 Name   : ${booking.name}
📞 Phone  : ${booking.phone}
🔧 Problem: ${booking.problem}
🏷️ Brand  : ${booking.brand} (${booking.machineType})
📅 Date   : ${booking.date}
⏰ Slot   : ${booking.slot}
📍 Map    : ${booking.googleMapLink}
━━━━━━━━━━━━━━━━
Call: ${booking.phone}`,
      from: process.env.TWILIO_PHONE,
      to:   process.env.OWNER_PHONE
    });
    console.log('✅ Owner SMS sent!');
  } catch (err) {
    console.error('❌ Owner SMS Error:', err.message);
  }
};

const notifyCustomer = async (phone, name, date, slot) => {
  try {
    const twilio = require('twilio');
    const client = twilio(
      process.env.TWILIO_SID,
      process.env.TWILIO_TOKEN
    );
    await client.messages.create({
      body: `✅ QuickWash Booking Confirmed!
Hi ${name}!
📅 Date: ${date}
⏰ Slot: ${slot}
Our technician will arrive on time.
Questions? Call: ${process.env.OWNER_PHONE}
Thank you! 🙏`,
      from: process.env.TWILIO_PHONE,
      to:   `+91${phone}`
    });
    console.log('✅ Customer SMS sent!');
  } catch (err) {
    console.error('❌ Customer SMS Error:', err.message);
  }
};

module.exports = { notifyOwner, notifyCustomer };