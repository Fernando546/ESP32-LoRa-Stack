import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Measurement from '@/models/Measurement';
import MeasureRequest from '@/models/MeasureRequest';

export async function POST() {
  const { db } = await connectToDatabase();

  // Dodaj nową prośbę o pomiar do bazy danych
  const result = await db.collection('measureRequests').insertOne({ request: 'measure', createdAt: new Date() });
  
  // Tutaj możesz dodać logikę, która wyzwala pomiar w kontrolerze
  console.log('Measurement triggered. Request ID:', result.insertedId);

  return NextResponse.json({ message: 'Measurement request triggered successfully', requestId: result.insertedId });
}

export async function GET() {
  const { db } = await connectToDatabase();

  // Pobierz tylko najnowszą prośbę o pomiar
  const latestRequest = await db.collection('measureRequests')
    .find()
    .sort({ createdAt: -1 }) // Sortuj malejąco według daty
    .limit(1) // Ogranicz do jednej
    .toArray();

  return NextResponse.json(latestRequest.length > 0 ? latestRequest[0] : null);
}
