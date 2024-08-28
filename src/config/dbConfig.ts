import mongoose from 'mongoose';

import { logger } from '../common/utils/logger.util';

if (!process.env.MONGO_URI) {
  throw new Error('Environment variables for MongoDB connection are not set properly');
}

export const connectToDatabase = async (): Promise<typeof mongoose> => {
  try {
    return mongoose.connect(process.env.MONGO_URI ?? '');
  } catch (error) {
    logger.error({ error }, 'Database connect error');
    throw error;
  }
};

export const disconnectFromDatabase = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
  } catch (error) {
    logger.error({ error }, 'Database disconect error');
    throw error;
  }
};
