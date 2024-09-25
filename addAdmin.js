import { MongoClient } from 'mongodb';
import bcrypt from 'bcrypt';

// Ustawienia MongoDB URI bezpośrednio w kodzie
const MONGODB_URI = 'mongodb+srv://Vercel:esp32s3@cluster0.exq2g.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

// Funkcja do dodania administratora
const addAdmin = async () => {
  const client = new MongoClient(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

  try {
    // Łączenie z bazą danych
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db('test'); // Podaj nazwę swojej bazy danych
    const collection = db.collection('admin'); // Podaj nazwę kolekcji

    // Tworzenie obiektu administratora
    const adminUser = {
      username: 'admin', // Ustaw nazwę użytkownika
      password: await bcrypt.hash('dzialka2137', 10) // Haszowanie hasła
    };

    // Dodanie administratora do kolekcji
    const result = await collection.insertOne(adminUser);
    console.log(`Admin user added with ID: ${result.insertedId}`);
  } catch (error) {
    console.error('Error adding admin:', error);
  } finally {
    // Zamykanie połączenia
    await client.close();
    console.log('Connection closed');
  }
};

// Uruchomienie funkcji
addAdmin();
