import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
} from 'chart.js';
import Papa from 'papaparse';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler
);

const ChartComponent = ({ data, label, title, color }) => {
  const chartData = {
    labels: data.map(d => d.Hour),
    datasets: [
      {
        label: label,
        data: data.map(d => d[label]),
        borderColor: color,
        backgroundColor: `${color}33`, // 33 is 20% opacity in hex
        fill: true,
        tension: 0.3,
        borderWidth: 0.9,
        pointRadius: 5,
        pointHoverRadius: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: title,
        color: 'white',
        font: {
          size: 12, // Even smaller font size
          weight: '400', // Less bold (normal weight)
        },
        padding: {
          top: 10,
          bottom: 20
        },
        align: 'start', // Align to the left
      },
    },
    scales: {
      x: {
        ticks: { color: 'white' },
        grid: { color: '#2c3e50' },
      },
      y: {
        ticks: { color: 'white' },
        grid: { color: '#2c3e50' },
      },
    },
  };

  return (
    <div className="w-1/2 p-4">
      <div className="h-[400px]">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    Papa.parse('/warehouse_data.csv', {
      download: true,
      header: true,
      complete: (results) => {
        const parsedData = results.data.map(row => ({
          ...row,
          Hour: parseInt(row.Hour),
          Lines: parseInt(row.Lines),
          Quantity: parseInt(row.Quantity)
        }));
        setData(parsedData);
      }
    });
  }, []);

  return (
    <div className="h-screen w-full bg-[#0d1825] text-white p-8">
      <div className="flex">
        <ChartComponent 
          data={data} 
          label="Lines" 
          title="Lines Picked per Hour" 
          color="#119b9d"
        />
        <ChartComponent 
          data={data} 
          label="Quantity" 
          title="Quantity Picked per Hour" 
          color="#e74475"
        />
      </div>
    </div>
  );
};

export default Dashboard;