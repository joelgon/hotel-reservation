import mongoose from 'mongoose';

if (!process.env.MONGO_URI) {
  throw new Error('Environment variables for MongoDB connection are not set properly');
}

export const connectToDatabase = async (): Promise<typeof mongoose> => {
  try {
    return mongoose.connect(process.env.MONGO_URI ?? '');
  } catch (error) {
    throw error;
  }
};

export const disconnectFromDatabase = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
  } catch (error) {
    throw error;
  }
};
