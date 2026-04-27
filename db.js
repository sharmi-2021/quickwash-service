require('dotenv').config();
const mongoose = require('mongoose');

console.log('🔍 MONGO_URI:', process.env.MONGO_URI ? 'Found ✅' : 'NOT FOUND ❌');

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI not found in .env!');
    }
    
    // .trim() use panna link-la irukura extra spaces remove aydum
    const connectionString = process.env.MONGO_URI.trim();

    await mongoose.connect(connectionString, {
      serverSelectionTimeoutMS: 5000, 
    });
    
    console.log('✅ MongoDB Connected Successfully!');
  } catch (err) {
    console.error('❌ MongoDB Error:', err.message);
  }
};

const bookingSchema = new mongoose.Schema({
  name:          { type: String, required: true },
  phone:         { type: String, required: true },
  address:       { type: String, default: '' },
  problem:       { type: String, required: true },
  machineType:   { type: String, default: '' },
  brand:         { type: String, default: '' },
  date:          { type: String, default: '' },
  slot:          { type: String, default: '' },
  lat:           { type: String, default: '' },
  lng:           { type: String, default: '' },
  googleMapLink: { type: String, default: 'Location not shared' },
  status:        { type: String, default: 'Pending' },
  paymentStatus: { type: String, default: 'Unpaid' },
  paymentId:     { type: String, default: '' },
  amount:        { type: Number, default: 0 },
  createdAt:     { type: Date,   default: Date.now }
});

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = { connectDB, Booking };