import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB successfully');

    // Create indexes on uploads.files to speed up queries drastically
    const db = mongoose.connection.db;
    try {
      await db.collection('uploads.files').createIndex({ uploadDate: -1 });
      await db.collection('uploads.files').createIndex({ 'metadata.contentType': 1 });
      await db.collection('uploads.files').createIndex({ 'metadata.originalname': 1 });
      await db.collection('uploads.files').createIndex({ filename: 1 });
    } catch (idxErr) {
      // index might already exist
    }
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
  }
};

export default connectDB;
