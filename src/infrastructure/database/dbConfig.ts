import mongoose, { ConnectOptions } from 'mongoose';

const { MONGO_USER, MONGO_PASSWORD, DATABASE, MONGO_HOST, MONGO_PORT } = process.env;

if (!MONGO_USER || !MONGO_PASSWORD || !DATABASE || !MONGO_HOST || !MONGO_PORT) {
  throw new Error('Environment variables for MongoDB connection are not set properly');
}

const uri = `mongodb://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_HOST}:${MONGO_PORT}/${DATABASE}?authSource=admin`

export const connectToDatabase = async (): Promise<typeof mongoose> => {
  try {
    return mongoose.connect(uri);
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
