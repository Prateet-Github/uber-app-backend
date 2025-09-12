import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // Optional: Add connection options for better performance/reliability
      // These are actually not needed in Mongoose 6+ as they're default
      // but including them for explicit configuration
    });
    
    console.log(`MongoDB connected successfully: ${conn.connection.host}`);
    
    // Optional: Handle connection events
    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });

    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error after initial connection:', err);
    });
    
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};

export default connectDB;