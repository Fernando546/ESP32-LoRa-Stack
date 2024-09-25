import jwt from 'jsonwebtoken';
import { MongoClient } from 'mongodb';
import bcrypt from 'bcrypt';

const MONGODB_URI = 'mongodb+srv://Vercel:esp32s3@cluster0.exq2g.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

export async function POST(request) {
  const { username, password } = await request.json();

  const client = new MongoClient(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

  try {
    await client.connect();
    const db = client.db('test'); // Upewnij się, że podajesz prawidłową nazwę bazy danych
    const collection = db.collection('admin'); // Upewnij się, że kolekcja nazywa się 'admin'

    // Sprawdzenie poprawności danych logowania
    const user = await collection.findOne({ username });
    if (!user) {
      return new Response(JSON.stringify({ error: 'Invalid credentials' }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return new Response(JSON.stringify({ error: 'Invalid credentials' }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    // Tworzenie tokenu JWT
    const token = jwt.sign({ username: user.username }, process.env.JWT_SECRET, {
      expiresIn: '1h', // Token wygasa po godzinie
    });

    return new Response(JSON.stringify({ token }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error during login:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } finally {
    await client.close();
  }
}
