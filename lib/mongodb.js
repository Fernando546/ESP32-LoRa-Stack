import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

let cachedClient = null;
let cachedDb = null;

const connectToDatabase = async () => {
  if (cachedDb) {
    return { db: cachedDb };
  }

  try {
    console.log('Connecting to MongoDB...');
    cachedClient = await mongoose.connect(MONGODB_URI);
    cachedDb = cachedClient.connection;

    cachedDb.on('error', console.error.bind(console, 'MongoDB connection error:'));
    cachedDb.once('open', () => {
      console.log('MongoDB connected successfully');
    });

  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error; // Rzuć błąd, aby wyłapać go w GET/POST
  }

  return { db: cachedDb };
};

export default connectToDatabase;
