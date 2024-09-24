"use client"; // Dodaj to na górze pliku

import { useEffect, useState } from 'react';

type Data = {
  soilMoisture: number;
  relayState: number;
  createdAt: string;
};

type Instruction = {
  action: string;
};

const HomePage = () => {
  const [data, setData] = useState<Data | null>(null);
  const [instruction, setInstruction] = useState<string>('');
  const [moistureThreshold, setMoistureThreshold] = useState<number>(50); // Domyślna wartość progu wilgotności

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/data');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const { latestData } = await response.json();
        setData(latestData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    const fetchInstruction = async () => {
      try {
        const response = await fetch('/api/instructions');
        if (!response.ok) {
          throw new Error('Failed to fetch instructions');
        }

        const { instruction } = await response.json();
        setInstruction(instruction.action);
      } catch (error) {
        console.error('Error fetching instruction:', error);
      }
    };

    fetchData();
    fetchInstruction();
  }, []);

  const handleThresholdSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    try {
      const response = await fetch('/api/instructions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: moistureThreshold }), // Przesyłanie wartości jako liczby
      });
  
      if (!response.ok) {
        throw new Error('Failed to update instruction');
      }
  
      setInstruction(`Threshold set to ${moistureThreshold}%`);
    } catch (error) {
      console.error('Error updating threshold:', error);
    }
};
  
  

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

      <div className="mt-8">
        <h2 className="text-xl font-semibold text-center text-blue-600 mb-4">Set Moisture Threshold</h2>
        <form onSubmit={handleThresholdSubmit} className="flex flex-col items-center">
          <input
            type="range"
            min="0"
            max="100"
            value={moistureThreshold}
            onChange={(e) => setMoistureThreshold(Number(e.target.value))}
            className="w-full mb-4"
          />
          <p className="text-lg font-semibold">Current Threshold: {moistureThreshold}%</p>
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-lg">Set Threshold</button>
        </form>
        <h2 className="text-xl font-semibold text-center text-blue-600 mb-4">Current Instruction: {instruction}</h2>
      </div>
    </div>
  );
};

export default HomePage;
