import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import MeasureRequest from '@/models/MeasureRequest';

export async function GET() {
  const { db } = await connectToDatabase();
  
  const latestInstruction = await db.collection('instructions').findOne({}, { sort: { createdAt: -1 } });

  // Upewnij się, że command jest liczbą
  return NextResponse.json({ threshold: parseInt(latestInstruction.command, 10) });
}

export async function POST(req) {
  const { action } = await req.json();
  console.log('Received action:', action); // Loguje otrzymaną akcję

  const { db } = await connectToDatabase();

  if (action === undefined || typeof action !== 'number') { // Sprawdź, czy akcja to liczba
    return NextResponse.json({ message: 'Invalid instruction' }, { status: 400 });
  }

  // Przechowaj nową instrukcję w kolekcji instructions
  const result = await db.collection('instructions').insertOne({ command: action, createdAt: new Date() });

  console.log('Inserted result:', result); // Loguje wynik wstawienia

  return NextResponse.json({ message: 'Instruction updated successfully', result });
}
