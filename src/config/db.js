import mongoose from 'mongoose';

const connectDB = async () => {
  if (process.env.NODE_ENV !== 'test') {
    if (mongoose.connection.readyState === 0) {  // Only connect if not already connected
      const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/mydb', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log(`MongoDB connected: ${conn.connection.host}`);
    }
  }
};

export default connectDB;
