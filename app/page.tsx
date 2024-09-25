"use client"; // Ensure this is at the top of the file

import { SetStateAction, useEffect, useState } from 'react';
import Login from './components/Login';
import Slider from '@mui/material/Slider';
import { Gauge, gaugeClasses } from '@mui/x-charts';
import Box from '@mui/material/Box';
import LineChartComponent from './components/LineChartComponent';

type Data = {
  soilMoisture: number;
  relayState: number;
  newMeasurement: number;
  createdAt: string;
};

const HomePage = () => {
  const [data, setData] = useState<Data | null>(null);
  const [fetchedThreshold, setFetchedThreshold] = useState<number>(50);
  const [moistureThreshold, setMoistureThreshold] = useState<number>(50);
  const [isMeasuring, setIsMeasuring] = useState<boolean>(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isLoginPanelVisible, setIsLoginPanelVisible] = useState<boolean>(false);
  const [historicalData, setHistoricalData] = useState<Data[]>([]);

  const isTokenExpired = (token: string) => {
    if (!token) return true;

    const payload = JSON.parse(atob(token.split('.')[1]));
    const now = Date.now() / 1000;

    return payload.exp < now;
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && !isTokenExpired(token)) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
      if (token) {
        localStorage.removeItem('token');
      }
    }
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch('/api/data');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const { latestData, last24HoursData } = await response.json();
      setData(latestData);
      setHistoricalData(last24HoursData);
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

      const { threshold } = await response.json();
      setFetchedThreshold(threshold);
    } catch (error) {
      console.error('Error fetching instruction:', error);
    }
  };

  useEffect(() => {
    fetchData();
    fetchInstruction();
  }, []);

  const handleThresholdSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const token = localStorage.getItem('token');

    try {
      const response = await fetch('/api/instructions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ action: moistureThreshold }),
      });

      if (!response.ok) {
        throw new Error('Failed to update instruction');
      }

      setFetchedThreshold(moistureThreshold);
    } catch (error) {
      console.error('Error updating threshold:', error);
    }
  };

  const handleMeasure = async () => {
    setIsMeasuring(true);

    const token = localStorage.getItem('token');

    try {
      const response = await fetch('/api/measure', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to trigger measurement');
      }

      await fetchData();
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
    localStorage.removeItem('token');
    setIsLoggedIn(false);
  };

  if (!data) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <p className="text-xl text-gray-700">Loading...</p>
      </div>
    );
  }

  return (
    <Box 
      sx={{ 
        maxWidth: 'lg', 
        mx: 'auto', 
        p: 4, 
        bgcolor: 'background.paper',
        borderRadius: 2, 
        boxShadow: 3, 
        mt: 10 
      }}
    >
      <h1 className="text-2xl font-bold text-center text-green-600 mb-4">Latest Soil Moisture Data</h1>
      <div className="flex flex-col items-center">
        {data && (
          <Gauge
            value={data.soilMoisture}
            valueMin={0}
            valueMax={100}
            width={200}
            height={200}
            sx={{
              [`& .${gaugeClasses.valueText}`]: {
                fontSize: 40,
                transform: 'translate(0px, 0px)',
              },
            }}
            text={`${data.soilMoisture}%`}
          />
        )}
        
        <p className="text-xl text-gray-800">Relay State: <span className={`font-semibold ${data?.relayState === 1 ? 'text-red-500' : 'text-green-500'}`}>{data?.relayState === 1 ? 'ON' : 'OFF'}</span></p>
        <p className="text-sm text-gray-600">Timestamp: {data ? new Date(data.createdAt).toLocaleString() : ''}</p>
      </div>
    
      <h2 className="text-xl font-semibold text-center text-blue-600 mb-4">Current Threshold from Database: {fetchedThreshold}%</h2>
  
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-center text-blue-600 mb-4">Set Moisture Threshold</h2>
        <form onSubmit={handleThresholdSubmit} className="flex flex-col items-center">
          <Slider
            aria-label="Moisture Threshold"
            defaultValue={moistureThreshold}
            valueLabelDisplay="auto"
            step={5}
            marks
            min={0}
            max={100}
            onChange={(e, newValue) => setMoistureThreshold(newValue as number)} 
            disabled={!isLoggedIn} // Wygaszenie slidera
          />
          <p className="text-lg font-semibold">New Threshold: {moistureThreshold}%</p>
          <button type="submit" disabled={!isLoggedIn} className={`bg-blue-500 text-white px-4 py-2 rounded-lg ${!isLoggedIn ? 'opacity-50 cursor-not-allowed' : ''}`}>
            Set Threshold
          </button>
        </form>
        <button 
          onClick={isLoggedIn ? handleMeasure : undefined} // Nie wywołuj funkcji, gdy nie jest zalogowany
          disabled={!isLoggedIn || isMeasuring} // Wygaszony, jeśli nie jest zalogowany lub jest w trakcie pomiaru
          className={`bg-green-500 text-white px-4 py-2 rounded-lg ${!isLoggedIn || isMeasuring ? 'opacity-50 cursor-not-allowed bg-gray-400' : ''}`}
        >
          {isMeasuring ? 'Measuring...' : 'Measure'}
        </button>
        {!isLoggedIn && (
          <div className="mt-2 text-center">
            <p className="text-lg text-red-500">You must be logged in to set a threshold and perform a measurement.</p>
          </div>
        )}
      </div>
  
      <button onClick={isLoggedIn ? handleLogout : toggleLoginPanel} className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg">
        {isLoggedIn ? 'Logout' : 'Login'}
      </button>
  
      {isLoginPanelVisible && <Login 
        onLoginSuccess={() => { 
          setIsLoggedIn(true); 
          setIsLoginPanelVisible(false); 
        }} 
        setIsLoggedIn={setIsLoggedIn} 
      />}
    
      <LineChartComponent historicalData={historicalData} />
    </Box>
  );
  
}

export default HomePage;
