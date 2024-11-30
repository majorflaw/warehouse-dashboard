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
      setIsLoading(true);
      try {
        const response = await fetch('https://warehouse-data-server.onrender.com/api/testing_cvg/a_flow_shipment_data.json');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        let data = await response.json();
        data = sortByDate(data);
        setShipments(data);
        setFilteredShipments(data);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error.message);
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-300">Total Shipments</p>
              <p className="text-lg font-semibold text-gray-300">{shipments.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100 text-red-600">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-300">With Issues</p>
              <p className="text-lg font-semibold text-gray-300">
                {shipments.filter(s => s.is_issue).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-300">On Track</p>
              <p className="text-lg font-semibold text-gray-300">
                {shipments.filter(s => !s.is_issue).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-300">Average Progress</p>
              <p className="text-lg font-semibold text-gray-300">
                {shipments.length > 0
                  ? `${Math.round(
                      shipments.reduce(
                        (acc, curr) => acc + parseFloat(curr.picking_progress),
                        0
                      ) / shipments.length
                    )}%`
                  : '0%'}
              </p>
            </div>
          </div>
        </div>
      </div>

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
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="bg-gray-900 shadow overflow-hidden sm:rounded-lg">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Shipment Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    End Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Country
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Process
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Flow
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Lines
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    HU
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    HU Nested
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    TO Packed
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-900 divide-y divide-gray-700">
                {filteredShipments.map((shipment, index) => (
                  <tr key={index} className="hover:bg-gray-800">
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
          </div>
        </div>
      )}
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
};

export default DashboardCVGA;