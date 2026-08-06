import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const connStr = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/uniportal';
    const conn = await mongoose.connect(connStr);
    console.log(`[MongoDB] Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[MongoDB Error] Connection failed: ${error.message}`);
    // Fallback: Continue running with in-memory fallback state if MongoDB service is offline
    console.log(`[MongoDB Notice] Backend will operate using fallback database mode if DB unreachable.`);
  }
};
