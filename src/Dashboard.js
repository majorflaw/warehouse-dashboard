import React, { useState, useEffect } from 'react';
import { Line, Doughnut } from 'react-chartjs-2';
import { useNavigate } from 'react-router-dom';
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
);

const TotalMetric = ({ label, value, color, subtext, onClick }) => (
  <div 
    className="w-40 h-48 bg-white flex flex-col items-center justify-center text-center p-4 cursor-pointer"
    onClick={onClick}
  >
    <span className="text-xs font-semibold text-gray-600 mb-2">{label}</span>
    <span className="text-2xl font-bold mb-2" style={{ color: color }}>
      {value}
    </span>
    {subtext && (
      <span className="text-[10px]" style={{ color: subtext.color }}>
        {subtext.percentage}% {subtext.isUp ? '↑' : '↓'}
      </span>
    )}
  </div>
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
    <div className="h-[300px] w-full">
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
        backgroundColor: ['#37D2BB', '#CA3F54', '#F57200', '#D6C9C9', '#5E239D'],
        hoverBackgroundColor: ['#37D2BB', '#CA3F54', '#F57200', '#D6C9C9', '#5E239D'],
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
      },
    },
  };

  return (
    <div className="h-[600px] w-full">
      <Doughnut data={chartData} options={options} />
    </div>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [totalLinesPGI, setTotalLinesPGI] = useState(0);
  const [totalHours, setTotalHours] = useState(0);
  const [target, setTarget] = useState(0);
  const [pickingAreaData, setPickingAreaData] = useState({});
  const [openLinesPickToday, setOpenLinesPickToday] = useState(0);
  const [openLinesPickFuture, setOpenLinesPickFuture] = useState(0);
  const [openLinesPGIToday, setOpenLinesPGIToday] = useState(0);
  const [openLinesPGIFuture, setOpenLinesPGIFuture] = useState(0);
  const [openQuantityPickToday, setOpenQuantityPickToday] = useState(0);
  const [openQuantityPickFuture, setOpenQuantityPickFuture] = useState(0);

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
        
        if (results.data.length > 0) {
          const firstRow = results.data[0];
          setTotalLinesPGI(parseInt(firstRow['Total Lines PGI']) || 0);
          setTotalHours(Math.round(parseFloat(firstRow['Total Hours']) || 0));
          setTarget(parseFloat(firstRow['Target']) || 0);
          
          setPickingAreaData({
            PA1: parseInt(firstRow['PA1']) || 0,
            PA2: parseInt(firstRow['PA2']) || 0,
            PA3: parseInt(firstRow['PA3']) || 0,
            PA4: parseInt(firstRow['PA4']) || 0,
            PA5: parseInt(firstRow['PA5']) || 0,
          });

          setOpenLinesPickToday(parseInt(firstRow['Open Lines Pick Today']) || 0);
          setOpenLinesPickFuture(parseInt(firstRow['Open Lines Pick Future']) || 0);
          setOpenLinesPGIToday(parseInt(firstRow['Open Lines PGI Today']) || 0);
          setOpenLinesPGIFuture(parseInt(firstRow['Open Lines PGI Future']) || 0);
          setOpenQuantityPickToday(parseInt(firstRow['Open Quantity Pick Today']) || 0);
          setOpenQuantityPickFuture(parseInt(firstRow['Open Quantity Pick Future']) || 0);
        }
      }
    });
  }, []);

  const totalLines = data.reduce((sum, row) => sum + row.Lines, 0);
  const totalQuantity = data.reduce((sum, row) => sum + row.Quantity, 0);
  
  const calculateProductivity = (lines, hours) => {
    if (hours === 0) return '0.0';
    const rawProductivity = lines / hours;
    const roundedProductivity = Math.round(rawProductivity * 10) / 10;
    return roundedProductivity.toFixed(1);
  };

  const overallProductivity = calculateProductivity(totalLines, totalHours);
  const productivityColor = parseFloat(overallProductivity) >= target ? '#589D74' : '#CA3F54';

  const targetLines = Math.ceil(target * totalHours);
  const linesDifference = targetLines - totalLines;
  const linePercentage = Math.abs((linesDifference / targetLines) * 100).toFixed(1);
  const isOverTarget = parseFloat(overallProductivity) >= target;
  const lineSubtext = {
    percentage: linePercentage,
    isUp: isOverTarget,
    color: isOverTarget ? '#589D74' : '#CA3F54'
  };

  const handleTotalHoursClick = () => {
    navigate('/total-hours');
  };

  return (
    <div className="min-h-screen w-full bg-[#030311] text-white p-8">
      <div className="flex flex-wrap justify-between items-stretch mb-8 -mx-2">
        <TotalMetric label="Total Lines Picked" value={totalLines.toLocaleString()} color="#37D2BB" subtext={lineSubtext} />
        <TotalMetric label="Open Lines Pick Today" value={openLinesPickToday.toLocaleString()} color="#37D2BB" />
        <TotalMetric label="Open Lines Pick Future" value={openLinesPickFuture.toLocaleString()} color="#37D2BB" />
        <TotalMetric label="Total Quantity Picked" value={totalQuantity.toLocaleString()} color="#F57200" />
        <TotalMetric label="Open Quantity Pick Today" value={openQuantityPickToday.toLocaleString()} color="#F57200" />
        <TotalMetric label="Open Quantity Pick Future" value={openQuantityPickFuture.toLocaleString()} color="#F57200" />
        <TotalMetric label="Total Lines PGI" value={totalLinesPGI.toLocaleString()} color="#5E239D" />
        <TotalMetric label="Open Lines PGI Today" value={openLinesPGIToday.toLocaleString()} color="#5E239D" />
        <TotalMetric label="Open Lines PGI Future" value={openLinesPGIFuture.toLocaleString()} color="#5E239D" />
        <TotalMetric label="Total Hours" value={totalHours} color="#030311" onClick={handleTotalHoursClick} />
        <TotalMetric label="Overall Productivity" value={overallProductivity} color={productivityColor} />
      </div>
      <div className="flex flex-wrap -mx-4 mb-8">
        <div className="w-1/3 px-4 mb-8">
          <DonutChartComponent 
            data={pickingAreaData}
            title="Picking Area"
          />
        </div>
        <div className="w-2/3 px-4 mb-8">
          <div className="mb-8">
            <ChartComponent 
              data={data} 
              label="Lines" 
              title="Lines Picked per Hour" 
              color="#37D2BB"
            />
          </div>
          <div>
            <ChartComponent 
              data={data} 
              label="Quantity" 
              title="Quantity Picked per Hour" 
              color="#F57200"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;