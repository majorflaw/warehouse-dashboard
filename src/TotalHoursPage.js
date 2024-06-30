import React from 'react';

const activities = ['Nesting', 'Picking', 'Cons', 'Legacy', 'Break'];
const hours = Array.from({ length: 18 }, (_, i) => i + 6); // 6 to 23

const getRandomActivity = () => activities[Math.floor(Math.random() * activities.length)];

const OperatorSchedule = ({ name }) => {
  const schedule = hours.map(() => getRandomActivity());

  return (
    <div className="flex items-center mb-4">
      <div className="w-32 font-semibold">{name}</div>
      {schedule.map((activity, index) => (
        <div 
          key={index} 
          className="w-16 h-16 flex items-center justify-center text-xs text-center border border-gray-700"
          style={{ backgroundColor: getActivityColor(activity) }}
        >
          {activity}
        </div>
      ))}
    </div>
  );
};

const getActivityColor = (activity) => {
  switch (activity) {
    case 'Nesting': return 'rgba(55, 210, 187, 0.3)'; // Light teal
    case 'Picking': return 'rgba(245, 114, 0, 0.3)'; // Light orange
    case 'Cons': return 'rgba(94, 35, 157, 0.3)'; // Light purple
    case 'Legacy': return 'rgba(202, 63, 84, 0.3)'; // Light red
    case 'Break': return 'rgba(108, 117, 125, 0.3)'; // Light gray
    default: return 'rgba(0, 0, 0, 0.1)';
  }
};

const TotalHoursPage = () => {
  const operators = [
    "John Doe", "Jane Smith", "Mike Johnson", "Emily Brown", "Alex Wilson"
  ];

  return (
    <div className="min-h-screen w-full bg-[#030311] text-white p-8">
      <h1 className="text-3xl font-bold mb-8">Hours Schedule</h1>
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          <div className="flex mb-4">
            <div className="w-32"></div>
            {hours.map(hour => (
              <div key={hour} className="w-16 font-semibold text-center">{hour}:00</div>
            ))}
          </div>
          {operators.map((operator, index) => (
            <OperatorSchedule key={index} name={operator} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TotalHoursPage;