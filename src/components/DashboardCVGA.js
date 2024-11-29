import React, { useState, useEffect } from 'react';

const DashboardCVGA = () => {
  const [shipments, setShipments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchShipmentData();
  }, []);

  const fetchShipmentData = async () => {
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
            process: item.process || 'N/A',
            total_quantity: item.total_quantity?.toString() || 'N/A',
            flow: item.flow || 'N/A'
          }));
        
        setShipments(validData);
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

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Shipments</p>
              <p className="text-lg font-semibold text-gray-900">{shipments.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100 text-red-600">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">With Issues</p>
              <p className="text-lg font-semibold text-gray-900">
                {shipments.filter(s => s.is_issue).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">On Track</p>
              <p className="text-lg font-semibold text-gray-900">
                {shipments.filter(s => !s.is_issue).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Average Progress</p>
              <p className="text-lg font-semibold text-gray-900">
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

      {isLoading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded p-4">
          <p className="text-red-500">{error}</p>
        </div>
      )}
      
      {!isLoading && !error && shipments.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Shipment Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    End Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Process
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Flow
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {shipments.map((shipment, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                      {shipment.shipment}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {shipment.shipment_end_date !== 'N/A' 
                        ? `${shipment.shipment_end_date.slice(0,2)}.${shipment.shipment_end_date.slice(2,4)}.${shipment.shipment_end_date.slice(4)}`
                        : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {shipment.process}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {shipment.total_quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {shipment.flow}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardCVGA;
