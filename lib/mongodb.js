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
    cachedClient = await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    cachedDb = cachedClient.connection;
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error; // Rzuć błąd, aby wyłapać go w GET/POST
  }

  return { db: cachedDb }; // Zwróć połączenie do bazy danych
};

export default connectToDatabase;
