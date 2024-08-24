import mongoose, { ConnectOptions } from 'mongoose';

const { MONGO_USER, MONGO_PASSWORD, DATABASE } = process.env;

if (!MONGO_USER || !MONGO_PASSWORD || !DATABASE) {
  throw new Error('Environment variables for MongoDB connection are not set properly');
}

const uri = `mongodb+srv://${MONGO_USER}:${MONGO_PASSWORD}@${DATABASE}/test?retryWrites=true&w=majority`;

export const connectToDatabase = async (): Promise<typeof mongoose> => {
  try {
    const connection = await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }as ConnectOptions);

    return connection;
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
