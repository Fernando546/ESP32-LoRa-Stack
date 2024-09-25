import { NextResponse } from 'next/server';
import DataModel from '../../../models/Data';
import connectToDatabase from '../../../lib/mongodb'; 

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    await connectToDatabase();
    const data = await request.json();

    console.log('Received data:', data);

    // Walidacja danych
    if (typeof data.soilMoisture !== 'number' || data.soilMoisture < 0 || data.soilMoisture > 100) {
      console.error('Invalid soilMoisture value:', data.soilMoisture);
      return NextResponse.json({ error: 'Invalid soilMoisture value' }, { status: 400 });
    }

    if (typeof data.relayState !== 'number' || ![0, 1].includes(data.relayState)) {
      console.error('Invalid relayState value:', data.relayState);
      return NextResponse.json({ error: 'Invalid relayState value' }, { status: 400 });
    }

    // Opcjonalnie: Dodaj walidację dla nowego pomiaru, jeśli jest używany
    if (typeof data.newMeasurement !== 'number') {
      console.error('Invalid newMeasurement value:', data.newMeasurement);
      return NextResponse.json({ error: 'Invalid newMeasurement value' }, { status: 400 });
    }

    const newData = new DataModel(data);
    await newData.save();

    return NextResponse.json('Data saved successfully');
  } catch (error) {
    console.error('Error saving data:', error);
    return NextResponse.json({ error: 'Error saving data' }, { status: 500 });
  }
}

export async function GET() {
  try {
    await connectToDatabase();

    // Pobranie ostatniego rekordu
    const latestData = await DataModel.findOne().sort({ createdAt: -1 }).lean();

    // Obliczenie czasu sprzed 24 godzin
    const last24h = new Date();
    last24h.setHours(last24h.getHours() - 24);

    // Pobranie wszystkich danych z ostatnich 24 godzin
    const last24HoursData = await DataModel.find({
      createdAt: { $gte: last24h },
    }).sort({ createdAt: 1 }).lean();

    return NextResponse.json({ latestData, last24HoursData });
  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
