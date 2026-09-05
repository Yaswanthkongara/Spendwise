const mongoose = require('mongoose');

const connectDB = async () => {
  const primaryUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/spendwise';
  const localUri = 'mongodb://127.0.0.1:27017/spendwise';

  try {
    const conn = await mongoose.connect(primaryUri);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`⚠️ Primary MongoDB connection failed (${error.message}). Trying fallback local database...`);
    try {
      const fallbackConn = await mongoose.connect(localUri);
      console.log(`✅ MongoDB Connected (Fallback Local): ${fallbackConn.connection.host}`);
    } catch (fallbackError) {
      console.error(`❌ MongoDB connection error: ${fallbackError.message}`);
      process.exit(1);
    }
  }
};

module.exports = connectDB;

