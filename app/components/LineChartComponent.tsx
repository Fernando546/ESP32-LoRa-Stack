import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { useEffect, useState } from 'react';
import { useTheme } from '@mui/material/styles'; // Import useTheme

// Register the components you are going to use
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

type LineChartComponentProps = {
  historicalData: { createdAt: string; soilMoisture: number }[];
};

const LineChartComponent = ({ historicalData }: LineChartComponentProps) => {
  const theme = useTheme(); // Użyj useTheme
  const [chartData, setChartData] = useState<any>(null);

  useEffect(() => {
    const labels = historicalData.map(data => 
      new Date(data.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    );
    const dataValues = historicalData.map(data => data.soilMoisture);

    setChartData({
      labels: labels,
      datasets: [
        {
          label: 'Wilgotność (%)',
          data: dataValues,
          borderColor: theme.palette.mode === 'light' ? 'black' : 'white', // Kolor linii
          backgroundColor: theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.2)', // Kolor tła
          fill: true,
        },
      ],
    });
  }, [historicalData, theme.palette.mode]); // Dodano theme.palette.mode jako zależność

  if (!chartData) return null;

  return (
    <Line
      data={chartData}
      options={{
        plugins: {
          legend: {
            labels: {
              color: theme.palette.mode === 'light' ? 'black' : 'white', // Kolor legendy zależny od motywu
            },
          },
        },
        scales: {
          x: {
            grid: {
              color: theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.2)', // Kolor siatki na osi X
            },
            ticks: {
              color: theme.palette.mode === 'light' ? 'black' : 'white', // Kolor ticków na osi X
            },
          },
          y: {
            grid: {
              color: theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.2)', // Kolor siatki na osi Y
            },
            ticks: {
              color: theme.palette.mode === 'light' ? 'black' : 'white', // Kolor ticków na osi Y
            },
          },
        },
      }}
    />
  );
};

export default LineChartComponent;
