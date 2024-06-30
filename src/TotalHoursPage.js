import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { useNavigate } from 'react-router-dom';

const hours = Array.from({ length: 18 }, (_, i) => `${String(i + 6).padStart(2, '0')}:00`);

const getActivityColor = (activity) => {
  switch (activity) {
    case 'Nesting': return 'rgba(55, 210, 187, 0.7)';
    case 'Picking': return 'rgba(245, 114, 0, 0.7)';
    case 'Consolidation': return 'rgba(94, 35, 157, 0.7)';
    case 'Legacy': return 'rgba(202, 63, 84, 0.7)';
    case 'Replenishment': return 'rgba(108, 117, 125, 0.7)';
    case 'Trolley Preparation': return 'rgba(206, 190, 190, 0.7)';
    case 'T8': return 'rgba(255, 231, 135, 0.7)';
    case 'Out of Work': return 'rgba(0, 0, 0, 0.1)';
    default: return 'rgba(0, 0, 0, 0.1)';
  }
};

const OperatorSchedule = ({ name, schedule }) => {
  return (
    <div className="flex items-center mb-4">
      <div className="w-48 flex items-center">
        <div className="w-12 h-12 bg-pink-500 rounded-full mr-4"></div>
        <div className="font-semibold">{name}</div>
      </div>
      {hours.map((hour) => (
        <div 
          key={hour} 
          className="flex-1 h-16 flex items-center justify-center text-xs text-center border border-gray-700"
          style={{ backgroundColor: getActivityColor(schedule[hour] || 'Out of Work') }}
        >
          {schedule[hour] || 'Out of Work'}
        </div>
      ))}
    </div>
  );
};

const TotalHoursPage = () => {
  const [schedules, setSchedules] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    Papa.parse('/hour_schedule.csv', {
      download: true,
      header: true,
      complete: (results) => {
        const parsedSchedules = results.data.map(row => ({
          name: row.Operator,
          schedule: hours.reduce((acc, hour) => {
            acc[hour] = row[hour] || 'Out of Work';
            return acc;
          }, {})
        }));
        setSchedules(parsedSchedules);

        // Calculate total working hours
        const totalHours = parsedSchedules.reduce((total, operator) => {
          return total + Object.values(operator.schedule).filter(activity => activity !== 'Out of Work').length;
        }, 0);

        // Store total hours in localStorage
        localStorage.setItem('totalWorkingHours', totalHours.toString());
      }
    });
  }, []);

  return (
    <div className="min-h-screen w-full bg-[#030311] text-white p-8 relative">
      <button
        onClick={() => navigate('/')}
        className="absolute top-4 right-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Main Dashboard
      </button>
      <h1 className="text-3xl font-bold mb-8">Hours Schedule</h1>
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          <div className="flex mb-4">
            <div className="w-48"></div>
            {hours.map(hour => (
              <div key={hour} className="flex-1 font-semibold text-center">{hour}</div>
            ))}
          </div>
          {schedules.map((operator, index) => (
            <OperatorSchedule key={index} name={operator.name} schedule={operator.schedule} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TotalHoursPage;