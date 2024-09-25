"use client"; // Ensure this is at the top of the file

import { SetStateAction, useEffect, useState } from 'react';
import Login from './components/Login';
import Slider from '@mui/material/Slider';
import { Gauge, gaugeClasses } from '@mui/x-charts';
import Box from '@mui/material/Box';
import LineChartComponent from './components/LineChartComponent';
import ThemeProviderComponent from './components/ThemeProvider';
import Button from '@mui/material/Button';
import DarkMode from '@mui/icons-material/DarkMode';
import LightMode from '@mui/icons-material/LightMode';
import PersonOff from '@mui/icons-material/PersonOff';
import Person from '@mui/icons-material/Person';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

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
  const [darkMode, setDarkMode] = useState<boolean>(false); // Nowy stan dla motywu

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

  const toggleTheme = () => {
    setDarkMode((prevMode) => !prevMode); // Funkcja przełączająca motyw
  };

  if (!data) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <p className="text-xl text-gray-700">Loading...</p>
      </div>
    );
  }

  return (
    <ThemeProviderComponent darkMode={darkMode}> {/* Przekazanie darkMode jako prop */}
      <Box sx={{ maxWidth: 'lg', mx: 'auto', p: 4, bgcolor: 'background.paper', borderRadius: 2, mt: { xs: 0, md: 5 } }}>
        <Button
          onClick={toggleTheme}
          variant="contained"
          sx={{
            bgcolor: darkMode ? 'lightgray' : '#444',
            color: darkMode ? 'black' : 'white',
            width: 50,
            height: 50,
            borderRadius: 3,
            minWidth: 0,
            marginRight: 2,
            marginBottom: 2,
          }}
        >
          {darkMode ? (
            <DarkMode sx={{ color: 'black' }} />
          ) : (
            <LightMode sx={{ color: 'white' }} />
          )}
        </Button>
        <Button
          onClick={isLoggedIn ? handleLogout : toggleLoginPanel}
          variant="contained"
          sx={{
            bgcolor: darkMode ? 'lightgray' : '#444',
            color: darkMode ? 'black' : 'white',
            width: 50,
            height: 50,
            borderRadius: 3,
            minWidth: 0,
            marginRight: 2,
            marginBottom: 2,
          }}
        >
          {isLoggedIn ? (
            <PersonOff />
          ) : (
            <Person />
          )}
        </Button>
        <h1 className="text-2xl font-bold text-center">Wilgotność gleby</h1>
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
                [`& .${gaugeClasses.valueArc}`]: {
                  fill: '#666',
                },
              }}
              text={`${data.soilMoisture}%`}
            />
          )}

          <p className="text-xl">Stan elektrozaworu: <span className={`font-semibold ${data?.relayState === 1 ? 'text-green-500' : 'text-red-500'}`}>{data?.relayState === 1 ? 'Włączony' : 'Wyłączony'}</span></p>
          <p className="text-sm">Data ostatniego pomiaru: {data ? new Date(data.createdAt).toLocaleString() : ''}</p>
        </div>
        <div className='flex justify-center mt-3'>
          <Button
              onClick={isLoggedIn ? handleMeasure : undefined} // Nie wywołuj funkcji, gdy nie jest zalogowany
              disabled={!isLoggedIn || isMeasuring} // Wygaszony, jeśli nie jest zalogowany lub jest w trakcie pomiaru
              className={`px-4 py-2 rounded-lg ${!isLoggedIn || isMeasuring ? 'opacity-50 cursor-not-allowed' : ''}`}
              variant="contained"
              style={{
                backgroundColor: darkMode ? 'lightgray' : '#444', // Ustaw kolor tła w zależności od trybu
                color: darkMode ? 'black' : 'white', // Ustaw kolor tekstu w zależności od trybu
              }}
            >
              {isMeasuring ? 'Mierzenie...' : 'Pomiar'}
          </Button>
        </div>
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-center mb-3">Nowy próg wilgotności</h2>
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
              style={{ color: darkMode ? 'white' : 'black' }} // Ustaw kolor slidera w zależności od trybu
            />
            <h2 className="text-l text-center mb-3">Aktualny próg wilgotności: {fetchedThreshold}%</h2>
            <Button type="submit" variant="contained" disabled={!isLoggedIn} className={`px-4 py-2 rounded-lg ${!isLoggedIn ? 'opacity-50 cursor-not-allowed' : ''}`} style={{
              backgroundColor: darkMode ? 'lightgray' : '#444', // Ustaw kolor tła w zależności od trybu
              color: darkMode ? 'black' : 'white', // Ustaw kolor tekstu w zależności od trybu
            }}
            >
              Ustaw próg
            </Button>
          </form>
        </div>
        <div className='mt-10'>
          <h2 className="text-xl font-semibold text-center mb-2 ">Pomiary z ostatnich 24 godzin</h2>
          <LineChartComponent historicalData={historicalData} />
        </div>
      </Box>

      <Dialog open={isLoginPanelVisible} onClose={toggleLoginPanel}>
        <DialogTitle>Login</DialogTitle>
        <DialogContent>
          <Login setIsLoggedIn={setIsLoggedIn} closeDialog={toggleLoginPanel} /> {/* Przekazanie closeDialog */}
        </DialogContent>
        <DialogActions>
          <Button onClick={toggleLoginPanel}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </ThemeProviderComponent>
  );
};

export default HomePage;
