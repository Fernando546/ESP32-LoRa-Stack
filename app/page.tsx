"use client"; // Ensure this is at the top of the file

import { useEffect, useState } from 'react';
import Login from './components/Login'; // Ensure the path to the Login component is correct

type Data = {
  soilMoisture: number;
  relayState: number;
  newMeasurement: number; // New property
  createdAt: string;
};

const HomePage = () => {
  const [data, setData] = useState<Data | null>(null);
  const [instruction, setInstruction] = useState<string>('');
  const [moistureThreshold, setMoistureThreshold] = useState<number>(50); // Default moisture threshold value
  const [isMeasuring, setIsMeasuring] = useState<boolean>(false); // State to track measurement
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false); // Login state
  const [isLoginPanelVisible, setIsLoginPanelVisible] = useState<boolean>(false); // Login panel visibility

  const isTokenExpired = (token: string) => {
    if (!token) return true;
    
    const payload = JSON.parse(atob(token.split('.')[1]));
    const now = Date.now() / 60; // Current time in seconds

    return payload.exp < now; // Returns true if token is expired
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && !isTokenExpired(token)) {
      setIsLoggedIn(true); // Set logged in state if token is valid
    } else {
      setIsLoggedIn(false); // Set logged in state to false
      if (token) {
        localStorage.removeItem('token'); // Remove expired token
      }
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/data');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const { latestData } = await response.json();
        setData(latestData); // Ensure latestData contains newMeasurement
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

  const handleThresholdSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const token = localStorage.getItem('token'); // Get JWT token

    try {
      const response = await fetch('/api/instructions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // Send token in authorization header
        },
        body: JSON.stringify({ action: moistureThreshold }),
      });

      if (!response.ok) {
        throw new Error('Failed to update instruction');
      }

      setInstruction(`Threshold set to ${moistureThreshold}%`);
    } catch (error) {
      console.error('Error updating threshold:', error);
    }
  };

  const handleMeasure = async () => {
    setIsMeasuring(true);

    const token = localStorage.getItem('token'); // Get JWT token

    try {
      const response = await fetch('/api/measure', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`, // Send token in authorization header
        },
      });

      if (!response.ok) {
        throw new Error('Failed to trigger measurement');
      }

      await fetchData(); // Refresh data after measurement
    } catch (error) {
      console.error('Error triggering measurement:', error);
    } finally {
      setIsMeasuring(false);
    }
  };

  const toggleLoginPanel = () => {
    setIsLoginPanelVisible((prev) => !prev);
  };

  const handleLogout = () => {
    localStorage.removeItem('token'); // Remove token from localStorage
    setIsLoggedIn(false); // Set login state to false
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

      {isLoggedIn ? ( // Check if the user is logged in
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
          <h2 className="text-xl font-semibold text-center text-blue-600 mb-4">Current Threshold: {data.newMeasurement !== undefined ? `${data.newMeasurement}%` : 'N/A'}</h2>
          <button 
            onClick={handleMeasure} 
            disabled={isMeasuring} 
            className={`bg-green-500 text-white px-4 py-2 rounded-lg ${isMeasuring ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isMeasuring ? 'Measuring...' : 'Measure'}
          </button>
        </div>
      ) : (
        <div className="mt-8 text-center">
          <p className="text-lg text-red-500">You must be logged in to set a threshold and perform a measurement.</p>
        </div>
      )}

      <button onClick={isLoggedIn ? handleLogout : toggleLoginPanel} className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg">
        {isLoggedIn ? 'Logout' : 'Login'}
      </button>

      {isLoginPanelVisible && <Login onLoginSuccess={() => {
          setIsLoggedIn(true);
          setIsLoginPanelVisible(false); // Hide panel after login
      }} />}
    </div>
  );
};

export default HomePage;
function fetchData() {
  throw new Error('Function not implemented.');
}

