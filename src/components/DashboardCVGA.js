import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTimes, faExclamationTriangle, faPlane, faTruck, faShip, faMagnifyingGlass, faBoxOpen, faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
import Select from 'react-select';

const DashboardCVGA = () => {
  const [shipments, setShipments] = useState([]);
  const [filteredShipments, setFilteredShipments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateFilter, setDateFilter] = useState('ALL');

  const formatDate = (dateStr) => {
    // Input: DDMMYYYY, Output: DD.MM.YYYY
    return `${dateStr.slice(0, 2)}.${dateStr.slice(2, 4)}.${dateStr.slice(4)}`;
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
        return data.filter(item => item.shipment_end_date === today);
      case 'TOMORROW':
        return data.filter(item => item.shipment_end_date === tomorrow);
      case 'BACKLOG':
        return data.filter(item => getDateFromString(item.shipment_end_date) < getDateFromString(today));
      case 'ALL FUTURE':
        return data.filter(item => getDateFromString(item.shipment_end_date) > getDateFromString(today));
      case 'ALL':
      default:
        return data;
    }
  };

  const sortByDate = (data) => {
    if (!Array.isArray(data)) {
      try {
        // Try to parse the data if it's a string
        data = JSON.parse(data);
      } catch (e) {
        console.error('Failed to parse data:', e);
        return [];
      }
    }
    
    return data.sort((a, b) => {
      const dateA = a.shipment_end_date; // DDMMYYYY format
      const dateB = b.shipment_end_date; // DDMMYYYY format

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
          'https://warehouse-data-server.onrender.com/api/testing-cvg/a_flow_shipment_data.json'
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
            throw new Error('Expected array of shipments');
          }
          
          // Map the data to our required format
          const validData = data
            .filter(item => item && typeof item === 'object')
            .map(item => ({
              shipment: item.shipment?.toString() || 'N/A',
              shipment_end_date: item.shipment_end_date || 'N/A',
              country: item.country || 'N/A',
              process: item.process || 'N/A',
              total_quantity: item.total_quantity?.toString() || 'N/A',
              flow: item.flow || 'N/A',
              total_hu_closed: item.total_hu_closed?.toString() || '0',
              total_hu: item.total_hu?.toString() || '0',
              hu_nested: item.hu_nested?.toString() || '0',
              tos_packed: item.tos_packed?.toString() || '0',
              total_lines: item.total_lines?.toString() || '0',
              picked_lines: item.picked_lines?.toString() || '0',
              is_created: item.is_created || false,
              is_issue: item.is_issue || false,
              issue_count: item.issue_count || 0,
              transport_way: item.transport_way || 'N/A',
              is_check: item.is_check || false,
              is_vas: item.is_vas || false,
              is_dg: item.is_dg || false
            }));

          const sortedData = sortByDate(validData);
          setShipments(sortedData);
          setFilteredShipments(sortedData);
        } catch (parseError) {
          console.error('Parse error:', parseError);
          setError('Failed to parse shipment data. Please try again.');
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
    <div className="p-6 bg-gray-900 min-h-screen">
      <div className="mb-6">
        <select
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="bg-gray-800 text-gray-300 border border-gray-700 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center h-[calc(100vh-8rem)] text-red-500">
          {error}
        </div>
      ) : (
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full">
              <div className="h-[calc(100vh-8rem)] overflow-auto">
                {filteredShipments.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-400 text-lg">
                    No Shipments Found
                  </div>
                ) : (
                  <table className="min-w-full">
                    <thead className="bg-gray-900 sticky top-0">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Shipment Number
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          End Date
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Country
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Process
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Flow
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Lines
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          HU
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          HU Nested
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          TO Packed
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Quantity
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-gray-800 divide-y divide-gray-700">
                      {filteredShipments.map((shipment, index) => (
                        <tr key={index} className="hover:bg-gray-700">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                            {shipment.shipment}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                            {shipment.shipment_end_date !== 'N/A' 
                              ? formatDate(shipment.shipment_end_date)
                              : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
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
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                            {shipment.process}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                            {shipment.flow}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                            {`${shipment.picked_lines}/${shipment.total_lines}`}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                            {`${shipment.total_hu_closed}/${shipment.total_hu}`}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                            {`${shipment.hu_nested}/${shipment.total_hu}`}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                            {`${shipment.tos_packed}/${shipment.total_lines}`}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                            {shipment.total_quantity}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                            <div className="flex items-center space-x-2">
                              {/* Created Status */}
                              <FontAwesomeIcon 
                                icon={shipment.is_created ? faCheck : faTimes}
                                className={shipment.is_created ? 'text-green-500' : 'text-red-500'}
                              />
                              
                              {/* Issue Status */}
                              {shipment.is_issue && (
                                <div className="relative">
                                  <FontAwesomeIcon 
                                    icon={faExclamationTriangle} 
                                    className="text-yellow-500"
                                  />
                                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                                    {shipment.issue_count}
                                  </span>
                                </div>
                              )}
                              
                              {/* Transport Way */}
                              {shipment.transport_way === 'AIR' && (
                                <FontAwesomeIcon icon={faPlane} className="text-blue-500" />
                              )}
                              {shipment.transport_way === 'ROAD' && (
                                <FontAwesomeIcon icon={faTruck} className="text-blue-500" />
                              )}
                              {shipment.transport_way === 'OCEAN' && (
                                <FontAwesomeIcon icon={faShip} className="text-blue-500" />
                              )}
                              
                              {/* Check Status */}
                              {shipment.is_check && (
                                <FontAwesomeIcon icon={faMagnifyingGlass} className="text-purple-500" />
                              )}
                              
                              {/* VAS Status */}
                              {shipment.is_vas && (
                                <FontAwesomeIcon icon={faBoxOpen} className="text-indigo-500" />
                              )}
                              
                              {/* DG Status */}
                              {shipment.is_dg && (
                                <FontAwesomeIcon icon={faExclamationCircle} className="text-orange-500" />
                              )}
                            </div>
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
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
};

export default DashboardCVGA;
