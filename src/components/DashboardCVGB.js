import React, { useState, useEffect } from 'react';

const DashboardCVGB = () => {
  const [shipments, setShipments] = useState([]);
  const [filteredShipments, setFilteredShipments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateFilter, setDateFilter] = useState('ALL');

  const formatDate = (dateStr) => {
    // Input: DDMMYYYY, Output: DD.MM.YYYY
    return `${dateStr.slice(0, 2)}.${dateStr.slice(2, 4)}.${dateStr.slice(4)}`;
  };

  const formatTime = (timeStr) => {
    // Input: HHMMSS, Output: HH:MM
    return `${timeStr.slice(0, 2)}:${timeStr.slice(2, 4)}`;
  };

  const getDateFromString = (dateStr) => {
    // Input: DDMMYYYY
    const year = parseInt(dateStr.slice(4));
    const month = parseInt(dateStr.slice(2, 4)) - 1;
    const day = parseInt(dateStr.slice(0, 2));
    return new Date(year, month, day);
  };

  const getTodayString = () => {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();
    return dd + mm + yyyy;
  };

  const getTomorrowString = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dd = String(tomorrow.getDate()).padStart(2, '0');
    const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const yyyy = tomorrow.getFullYear();
    return dd + mm + yyyy;
  };

  const filterShipmentsByDate = (data) => {
    const today = getTodayString();
    const tomorrow = getTomorrowString();

    switch (dateFilter) {
      case 'TODAY':
        return data.filter(item => item.cuttoff_dt === today);
      case 'TOMORROW':
        return data.filter(item => item.cuttoff_dt === tomorrow);
      case 'BACKLOG':
        return data.filter(item => getDateFromString(item.cuttoff_dt) < getDateFromString(today));
      case 'ALL FUTURE':
        return data.filter(item => getDateFromString(item.cuttoff_dt) > getDateFromString(today));
      case 'ALL':
      default:
        return data;
    }
  };

  const sortByDate = (data) => {
    if (!Array.isArray(data)) {
      try {
        data = JSON.parse(data);
      } catch (e) {
        console.error('Failed to parse data:', e);
        return [];
      }
    }
    
    return data.sort((a, b) => {
      const dateA = a.cuttoff_dt; // DDMMYYYY format
      const dateB = b.cuttoff_dt;

      // Extract year, month, day
      const yearA = dateA.slice(4);
      const monthA = dateA.slice(2, 4);
      const dayA = dateA.slice(0, 2);

      const yearB = dateB.slice(4);
      const monthB = dateB.slice(2, 4);
      const dayB = dateB.slice(0, 2);

      // Compare year first
      if (yearA !== yearB) return yearA - yearB;
      // If years are equal, compare months
      if (monthA !== monthB) return monthA - monthB;
      // If months are equal, compare days
      return dayA - dayB;
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch(
          'https://warehouse-data-server.onrender.com/api/testing-cvg/b_flow_delivery_data.json'
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const text = await response.text();
        
        try {
          // Remove the outer quotes and unescape the inner quotes
          let cleanedText = text.trim();
          if (cleanedText.startsWith('"') && cleanedText.endsWith('"')) {
            cleanedText = cleanedText.slice(1, -1);
          }
          
          // Replace invalid JSON values and clean up the string
          cleanedText = cleanedText
            .replace(/\\"/g, '"')
            .replace(/\\n/g, '')
            .replace(/: NaN/g, ': null')
            .replace(/: Infinity/g, ': null')
            .replace(/: -Infinity/g, ': null');
          
          // Parse the cleaned JSON
          const data = JSON.parse(cleanedText);
          
          if (!Array.isArray(data)) {
            throw new Error('Expected array of deliveries');
          }
          
          // Map the data to our required format
          const validData = data
            .filter(item => item && typeof item === 'object')
            .map(item => ({
              delivery: item.delivery?.toString() || 'N/A',
              cuttoff_dt: item.cuttoff_dt || 'N/A',
              cutoff_tm: item.cutoff_tm || 'N/A',
              country: item.country || 'N/A',
              flow: item.flow || 'N/A'
            }));

          const sortedData = sortByDate(validData);
          setShipments(sortedData);
          setFilteredShipments(sortedData);
        } catch (parseError) {
          console.error('Parse error:', parseError);
          setError('Failed to parse delivery data. Please try again.');
        }
      } catch (err) {
        console.error('Fetch error:', err);
        setError(`Failed to load data: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (shipments.length > 0) {
      const filteredData = filterShipmentsByDate(shipments);
      setFilteredShipments(filteredData);
    }
  }, [dateFilter, shipments]);

  return (
    <div className="p-6 bg-[#121212] min-h-screen">
      <div className="mb-6">
        <select
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="bg-[#1E1E1E] text-gray-300 border border-[#2D2D2D] rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#404040] hover:border-[#404040] transition-colors"
        >
          <option value="ALL">ALL</option>
          <option value="TODAY">TODAY</option>
          <option value="TOMORROW">TOMORROW</option>
          <option value="BACKLOG">BACKLOG</option>
          <option value="ALL FUTURE">ALL FUTURE</option>
        </select>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#404040]"></div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center h-[calc(100vh-8rem)] text-red-400">
          {error}
        </div>
      ) : (
        <div className="bg-[#1E1E1E] rounded-lg overflow-hidden border border-[#2D2D2D]">
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full">
              <div className="h-[calc(100vh-8rem)] overflow-auto">
                {filteredShipments.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-400 text-lg">
                    No Deliveries Found
                  </div>
                ) : (
                  <table className="min-w-full">
                    <thead className="bg-[#181818] sticky top-0">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider border-b border-[#2D2D2D]">
                          Delivery Number
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider border-b border-[#2D2D2D]">
                          Cut-off Date
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider border-b border-[#2D2D2D]">
                          Cut-off Time
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider border-b border-[#2D2D2D]">
                          Country
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider border-b border-[#2D2D2D]">
                          Flow
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-[#1E1E1E] divide-y divide-[#2D2D2D]">
                      {filteredShipments.map((shipment, index) => (
                        <tr key={index} className="hover:bg-[#252525] transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                            {shipment.delivery}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                            {shipment.cuttoff_dt !== 'N/A' 
                              ? formatDate(shipment.cuttoff_dt)
                              : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                            {shipment.cutoff_tm !== 'N/A'
                              ? formatTime(shipment.cutoff_tm)
                              : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                            {shipment.country !== 'N/A' ? (
                              <div className="flex items-center">
                                <img
                                  src={`https://flagcdn.com/w20/${shipment.country.toLowerCase()}.png`}
                                  alt={shipment.country}
                                  className="w-4 h-4 rounded-full mr-2"
                                />
                                {shipment.country}
                              </div>
                            ) : (
                              'N/A'
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                            {shipment.flow}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      {error && <p className="text-red-400">{error}</p>}
    </div>
  );
};

export default DashboardCVGB;
