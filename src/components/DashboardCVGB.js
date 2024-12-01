import React, { useState, useEffect } from 'react';

const DashboardCVGB = () => {
  const [shipments, setShipments] = useState([]);
  const [filteredShipments, setFilteredShipments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateFilter, setDateFilter] = useState('ALL');

  const formatDate = (dateVal) => {
    if (!dateVal) return 'N/A';
    // Convert number to string and pad with zeros
    const dateStr = dateVal.toString().padStart(8, '0');
    return `${dateStr.slice(0, 2)}.${dateStr.slice(2, 4)}.${dateStr.slice(4)}`;
  };

  const formatTime = (timeVal) => {
    if (!timeVal) return 'N/A';
    // Convert number to string and pad with zeros
    const timeStr = timeVal.toString().padStart(6, '0');
    return `${timeStr.slice(0, 2)}:${timeStr.slice(2, 4)}`;
  };

  const getDateFromString = (dateVal) => {
    if (!dateVal) return new Date(0);
    // Convert number to string and pad with zeros
    const dateStr = dateVal.toString().padStart(8, '0');
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
    return parseInt(dd + mm + yyyy);
  };

  const getTomorrowString = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dd = String(tomorrow.getDate()).padStart(2, '0');
    const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const yyyy = tomorrow.getFullYear();
    return parseInt(dd + mm + yyyy);
  };

  const filterShipmentsByDate = (data) => {
    const today = getTodayString();
    const tomorrow = getTomorrowString();

    switch (dateFilter) {
      case 'TODAY':
        return data.filter(item => item.cutoff_dt === today);
      case 'TOMORROW':
        return data.filter(item => item.cutoff_dt === tomorrow);
      case 'BACKLOG':
        return data.filter(item => getDateFromString(item.cutoff_dt) < getDateFromString(today));
      case 'ALL FUTURE':
        return data.filter(item => getDateFromString(item.cutoff_dt) > getDateFromString(today));
      case 'ALL':
      default:
        return data;
    }
  };

  const sortByDate = (data) => {
    return [...data].sort((a, b) => {
      if (!a.cutoff_dt || !b.cutoff_dt) return 0;
      return a.cutoff_dt - b.cutoff_dt;  // Direct numeric comparison
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch(
          'https://warehouse-data-server.onrender.com/api/testing/b_flow_delivery_data.json'
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
          
          // Map the data to our required format and ensure all fields exist
          const validData = data
            .filter(item => item && typeof item === 'object')
            .map(item => ({
              delivery: item.delivery?.toString() || 'N/A',
              cutoff_dt: item.cutoff_dt || null,  // Keep as number
              cutoff_tm: item.cutoff_tm || null,    // Keep as number
              country: item.country || 'N/A',
              total_lines: item.total_lines || 'N/A'
            }));

          console.log('Sample data:', validData[0]); // Debug log
          
          const sortedData = sortByDate(validData);
          setShipments(sortedData);
          setFilteredShipments(filterShipmentsByDate(sortedData));
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
  }, [dateFilter]);

  useEffect(() => {
    setFilteredShipments(filterShipmentsByDate(shipments));
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
                            {formatDate(shipment.cutoff_dt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                            {formatTime(shipment.cutoff_tm)}
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
                            {shipment.total_lines}
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
