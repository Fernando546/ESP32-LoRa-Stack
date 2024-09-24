"use client"; // Dodaj to na górze pliku

import { useEffect, useState } from 'react';

type Data = {
  soilMoisture: number;
  relayState: number;
  createdAt: string;
};

const HomePage = () => {
  const [data, setData] = useState<Data | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/data');

        // Sprawdzenie, czy odpowiedź jest poprawna
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const { latestData } = await response.json();
        setData(latestData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  if (!data) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <p className="text-xl text-gray-700">Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto p-4 bg-white rounded-lg shadow-md mt-10">
      <h1 className="text-2xl font-bold text-center text-green-600 mb-4">Latest Soil Moisture Data</h1>
      <div className="flex flex-col items-center">
        <p className="text-xl text-gray-800">Soil Moisture: <span className="font-semibold">{data.soilMoisture}%</span></p>
        <p className="text-xl text-gray-800">Relay State: <span className={`font-semibold ${data.relayState === 1 ? 'text-red-500' : 'text-green-500'}`}>{data.relayState === 1 ? 'ON' : 'OFF'}</span></p>
        <p className="text-sm text-gray-600">Timestamp: {new Date(data.createdAt).toLocaleString()}</p>
      </div>
    </div>
  );
};

export default HomePage;
