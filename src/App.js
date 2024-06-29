import React, { useState, useEffect } from 'react';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  ArcElement,
  Legend
} from 'chart.js';
import Papa from 'papaparse';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  ArcElement,
  Legend
);

const unifiedShapeColor = "#030311";

const TotalMetric = ({ label, value, color }) => (
  <span className="text-lg whitespace-nowrap">
    {label}: 
    <span className="font-bold ml-1" style={{ color: color }}>
      {value.toLocaleString()}
    </span>
  </span>
);

const ChartComponent = ({ data, label, title, color }) => {
  const chartData = {
    labels: data.map(d => d.Hour),
    datasets: [
      {
        label: label,
        data: data.map(d => d[label]),
        borderColor: color,
        backgroundColor: `${color}33`,
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
          size: 10,
          weight: '400',
        },
        padding: {
          top: 10,
          bottom: 30
        },
        align: 'start',
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
    <div className="h-[400px] w-full">
      <Line data={chartData} options={options} />
    </div>
  );
};

const DonutChartComponent = ({ data, title }) => {
  const chartData = {
    labels: Object.keys(data),
    datasets: [
      {
        data: Object.values(data),
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
        hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: 'white',
        },
      },
      title: {
        display: true,
        text: title,
        color: 'white',
        font: {
          size: 10,
          weight: '400',
        },
        padding: {
          top: 10,
          bottom: 30
        },
      },
    },
  };

  return (
    <div className="h-[300px] w-full">
      <Doughnut data={chartData} options={options} />
    </div>
  );
};

const Dashboard = () => {
  const [data, setData] = useState([]);
  const [totalLinesPGI, setTotalLinesPGI] = useState(0);

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
        
        if (results.data.length > 0 && 'Total Lines PGI' in results.data[0]) {
          setTotalLinesPGI(parseInt(results.data[0]['Total Lines PGI']) || 0);
        }
      }
    });
  }, []);

  const totalLines = data.reduce((sum, row) => sum + row.Lines, 0);
  const totalQuantity = data.reduce((sum, row) => sum + row.Quantity, 0);

  // Random data for Storage Type
  const storageTypeData = {
    PA1: Math.floor(Math.random() * 100),
    PA2: Math.floor(Math.random() * 100),
    PA3: Math.floor(Math.random() * 100),
    PA4: Math.floor(Math.random() * 100),
    PA5: Math.floor(Math.random() * 100),
  };

  return (
    <div className="min-h-screen w-full bg-[#030311] text-white p-8">
      <div className="flex justify-between items-center rounded-lg mb-8 px-4 py-2" style={{ backgroundColor: unifiedShapeColor }}>
        <TotalMetric label="Total Lines Picked" value={totalLines} color="#37D2BB" />
        <TotalMetric label="Total Quantity Picked" value={totalQuantity} color="#F57200" />
        <TotalMetric label="Total Lines PGI" value={totalLinesPGI} color="#FFFFFF" />
      </div>
      <div className="flex flex-wrap -mx-4 mb-8">
        <div className="w-1/2 px-4 mb-8">
          <ChartComponent 
            data={data} 
            label="Lines" 
            title="Lines Picked per Hour" 
            color="#37D2BB"
          />
        </div>
        <div className="w-1/2 px-4 mb-8">
          <ChartComponent 
            data={data} 
            label="Quantity" 
            title="Quantity Picked per Hour" 
            color="#F57200"
          />
        </div>
      </div>
      <div className="w-full">
        <DonutChartComponent 
          data={storageTypeData}
          title="Storage Type"
        />
      </div>
    </div>
  );
};

export default Dashboard;