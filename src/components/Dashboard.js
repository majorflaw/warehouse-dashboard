import React, { useState, useEffect } from 'react';

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('https://warehouse-data-server.onrender.com/api/testing/general_statistics.json');
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      const data = await response.json();
      // We'll use this data later
      setIsLoading(false);
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Warehouse Dashboard
        </h1>
        {isLoading && (
          <p className="text-gray-600">Loading data...</p>
        )}
        {error && (
          <p className="text-red-500">Error: {error}</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;