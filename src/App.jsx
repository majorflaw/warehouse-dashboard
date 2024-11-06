import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import axios from 'axios';
import { Card } from "@tremor/react";
import { Loader2 } from 'lucide-react';
import { AlertCircle, Check, XCircle, Package, AlertTriangle, Truck, Plane, Ship, HelpCircle, ChevronDown } from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';

// WebSocket connection with retry logic
const useWebSocket = () => {
  const [status, setStatus] = useState('connecting');
  const [data, setData] = useState([]);
  const wsRef = useRef(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectDelay = 30000;

  const getWebSocketURL = () => {
    // Check if we're in development mode
    if (window.location.hostname === 'localhost') {
      // Try production URL if local fails
      return ['ws://localhost:8000/ws', 'wss://warehouse-dashboard-api.onrender.com/ws'];
    }
    // Production URL only
    return ['wss://warehouse-dashboard-api.onrender.com/ws'];
  };

  const connect = useCallback(() => {
    try {
      const urls = getWebSocketURL();
      let currentUrlIndex = 0;

      const tryConnect = () => {
        if (currentUrlIndex >= urls.length) {
          console.error('Failed to connect to all WebSocket URLs');
          setStatus('error');
          return;
        }

        const ws = new WebSocket(urls[currentUrlIndex]);

        ws.onopen = () => {
          console.log('Connected to WebSocket:', urls[currentUrlIndex]);
          setStatus('connected');
          reconnectAttempts.current = 0;

          const heartbeat = setInterval(() => {
            if (ws.readyState === WebSocket.OPEN) {
              ws.send('ping');
            }
          }, 30000);
          
          wsRef.current = { socket: ws, heartbeat };
        };

        ws.onmessage = (event) => {
          try {
            if (event.data === 'pong') {
              console.debug('Received pong');
              return;
            }

            const message = JSON.parse(event.data);
            console.debug('Received WebSocket message:', message.type);

            switch (message.type) {
              case 'initial_data':
                setData(message.data);
                toast.success('Connected to server');
                break;

              case 'data_update':
                setData(prevData => {
                  const isEqual = JSON.stringify(prevData) === JSON.stringify(message.data);
                  if (!isEqual) {
                    toast.success('Data updated');
                    return message.data;
                  }
                  return prevData;
                });
                break;

              default:
                console.log('Unknown message type:', message.type);
            }
          } catch (error) {
            console.error('Error processing WebSocket message:', error, event.data);
          }
        };

        ws.onclose = () => {
          setStatus('disconnected');
          console.log('WebSocket disconnected');

          if (wsRef.current?.heartbeat) {
            clearInterval(wsRef.current.heartbeat);
          }

          // Try next URL if available
          currentUrlIndex++;
          setTimeout(tryConnect, 1000);
        };

        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          ws.close();
        };
      };

      tryConnect();
    } catch (error) {
      console.error('WebSocket connection error:', error);
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    connect();

    return () => {
      if (wsRef.current) {
        clearInterval(wsRef.current.heartbeat);
        wsRef.current.socket.close();
      }
    };
  }, [connect]);

  return { status, data };
};

const getTransportIcon = (way) => {
  switch (way?.toLowerCase()) {
    case 'road':
      return <Truck size={16} className="text-yellow-500" />;
    case 'air':
      return <Plane size={16} className="text-blue-500" />;
    case 'ocean':
      return <Ship size={16} className="text-cyan-500" />;
    default:
      return null;
  }
};

function DateFilter({ selectedFilter, onFilterChange }) {
  const [isOpen, setIsOpen] = useState(false);

  const filters = [
    { value: 'today', label: 'Today' },
    { value: 'untilToday', label: 'Until Today' },
    { value: 'tomorrow', label: 'Tomorrow' },
    { value: 'backlog', label: 'Backlog' },
    { value: 'allOpen', label: 'All Open' },
    { value: 'allFuture', label: 'All Future' },
  ];

  return (
    <div className="relative mb-4">
      <button onClick={() => setIsOpen(!isOpen)} className="flex items-center justify-between w-48 px-4 py-2 bg-gray-700 text-gray-200 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
        <span>{filters.find(f => f.value === selectedFilter)?.label || 'Select Filter'}</span>
        <ChevronDown size={16} className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-20 w-48 mt-1 bg-gray-700 border border-gray-600 rounded-md shadow-lg">
          {filters.map((filter) => (
            <button key={filter.value} onClick={() => {onFilterChange(filter.value); setIsOpen(false);}} className="w-full px-4 py-2 text-left text-gray-200 hover:bg-gray-600 first:rounded-t-md last:rounded-b-md">
              {filter.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Legend() {
  const legendItems = [
    {
      icon: <AlertCircle size={16} className="text-red-500" />,
      label: 'Open Issues',
      description: 'Shipment has pending issues that need attention'
    },
    {
      icon: <Check size={16} className="text-green-500" />,
      label: 'TO Created',
      description: 'Transfer Orders has been created'
    },
    {
      icon: <XCircle size={16} className="text-red-500" />,
      label: 'TO Not Created',
      description: 'Transfer Orders has not been created yet'
    },
    {
      icon: <Package size={16} className="text-purple-500" />,
      label: 'VAS',
      description: 'VAS required'
    },
    {
      icon: <AlertTriangle size={16} className="text-orange-500" />,
      label: 'DG',
      description: 'Dangerous Goods shipment'
    },
    {
      icon: <AlertCircle size={16} className="text-yellow-500" />,
      label: '100% Check',
      description: 'Shipment that requires 100% Check'
    },
    {
      icon: <Truck size={16} className="text-yellow-500" />,
      label: 'Road Transport',
      description: 'Shipment via road transportation'
    },
    {
      icon: <Plane size={16} className="text-blue-500" />,
      label: 'Air Transport',
      description: 'Shipment via air transportation'
    },
    {
      icon: <Ship size={16} className="text-cyan-500" />,
      label: 'Ocean Transport',
      description: 'Shipment via ocean transportation'
    }
  ];

  return (
    <div className="mt-6 bg-gray-800 rounded-lg p-4">
      <div className="mb-3 flex items-center gap-2">
        <HelpCircle size={18} className="text-gray-400" />
        <h2 className="text-gray-300 font-semibold">Legend</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {legendItems.map((item, index) => (
          <div
            key={index}
            className="flex items-center gap-3 bg-gray-700/50 rounded-md p-3"
          >
            <div className="flex-shrink-0">
              {item.icon}
            </div>
            <div>
              <div className="text-gray-200 text-sm font-medium">
                {item.label}
              </div>
              <div className="text-gray-400 text-xs">
                {item.description}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProgressBar({ progress, type = 'default' }) {
  const getColor = () => {
    if (progress >= 100) return 'bg-green-500';
    if (progress >= 70) return 'bg-orange-500';
    if (progress >= 30) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="w-full bg-gray-600 rounded-full h-2">
      <div className={`h-full rounded-full ${getColor()} transition-all duration-300`} style={{ width: `${Math.min(100, Math.max(0, progress))}%` }} />
    </div>
  );
}

function ConnectionStatus({ status }) {
  const getStatusColor = () => {
    switch (status) {
      case 'connected':
        return 'text-green-500';
      case 'connecting':
        return 'text-yellow-500';
      case 'disconnected':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'connected':
        return 'Connected';
      case 'connecting':
        return 'Reconnecting...';
      case 'disconnected':
        return 'Disconnected';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-gray-800 border border-gray-700 w-fit">
      <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
      <span className="text-sm text-gray-300">{getStatusText()}</span>
    </div>
  );
}

function App() {
  const { status, data: shipments } = useWebSocket();
  //const [shipments, setShipments] = useState([]);
  const [dateFilter, setDateFilter] = useState('allOpen');
  const [currentTime, setCurrentTime] = useState(new Date());

  const getRowHighlight = useCallback((shipment) => {
    const currentHour = currentTime.getHours();
    const currentMinute = currentTime.getMinutes();
  
    // Add null check for shipment and shipment_end_date
    if (!shipment || !shipment.shipment_end_date) {
      return '';
    }
  
    try {
      const shipmentDate = new Date(shipment.shipment_end_date.split('.').reverse().join('-'));
      const isToday = shipmentDate.toDateString() === currentTime.toDateString();
  
      const isHighlightCountry = !['ES', 'IT'].includes(shipment.country);
  
      if (isToday && isHighlightCountry) {
        if (currentHour === 13 && currentMinute >= 30 && currentMinute < 59) {
          return 'animate-pulse bg-red-900/50';
        }
  
        if (currentHour === 13 && currentMinute >= 0 && currentMinute < 29) {
          return 'animate-pulse bg-yellow-500/50';
        }
      }
  
      return '';
    } catch (error) {
      console.error('Error processing date for shipment:', shipment, error);
      return '';
    }
  }, [currentTime]);

  const filteredShipments = useMemo(() => {
    if (!shipments || !shipments.length) return [];
  
    const today = new Date(currentTime);
    today.setHours(0, 0, 0, 0);
  
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
  
    return shipments.filter(shipment => {
      // Add null check for shipment and shipment_end_date
      if (!shipment || !shipment.shipment_end_date) {
        return false;
      }
  
      try {
        const shipmentDate = new Date(shipment.shipment_end_date.split('.').reverse().join('-'));
        shipmentDate.setHours(0, 0, 0, 0);
  
        switch (dateFilter) {
          case 'today':
            return shipmentDate.getTime() === today.getTime();
          case 'untilToday':
            return shipmentDate.getTime() <= today.getTime();
          case 'tomorrow':
            return shipmentDate.getTime() === tomorrow.getTime();
          case 'backlog':
            return shipmentDate.getTime() < today.getTime();
          case 'allFuture':
            return shipmentDate.getTime() > today.getTime();
          case 'allOpen':
          default:
            return true;
        }
      } catch (error) {
        console.error('Error filtering shipment:', shipment, error);
        return false;
      }
    });
  }, [shipments, dateFilter, currentTime]);

  const columns = [
    {
      key: 'icons',
      label: '',
      width: 'w-40',
      render: (shipment) => (
        <div className="flex items-center justify-center gap-1.5">
          {shipment.has_issue && (
            <div className="relative group">
              <AlertCircle size={16} className="text-red-500" />
              {shipment.count_issue > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                  {shipment.count_issue}
                </span>
              )}
            </div>
          )}
          {shipment.to_created ? (
            <Check size={16} className="text-green-500" />
          ) : (
            <XCircle size={16} className="text-red-500" />
          )}
          {shipment.is_vas && (
            <Package size={16} className="text-purple-500" />
          )}
          {shipment.is_dg && (
            <AlertTriangle size={16} className="text-orange-500" />
          )}
          {shipment.is_need_check && (
            <AlertCircle size={16} className="text-yellow-500" />
          )}
          {getTransportIcon(shipment.transport_way)}
        </div>
      )
    },
    { key: 'shipment_number', label: 'SHIPMENT', width: 'w-32' },
    { key: 'overall_status', label: 'STATUS', width: 'w-24' },
    { key: 'shipment_end_date', label: 'END DATE', width: 'w-32' },
    { key: 'country', label: 'COUNTRY', width: 'w-24' },
    { key: 'process', label: 'FLOW', width: 'w-24' },
    { key: 'type', label: 'TYPE', width: 'w-24' },
    { key: 'cta', label: 'CTA', width: 'w-24' },
    { key: 'total_lines', label: 'TOTAL LINES', width: 'w-28' },
    { key: 'confirmed_lines', label: 'CONFIRMED LINES', width: 'w-28' },
    { key: 'open_lines', label: 'OPEN LINES', width: 'w-28' },
    { key: 'picking_progress', label: 'PICKING %', width: 'w-32', render: (shipment) => (<div className="flex flex-col gap-1"><ProgressBar progress={shipment.picking_progress || 0} /><span className="text-xs">{(shipment.picking_progress || 0).toFixed(1)}%</span></div>)},
    { key: 'number_of_hus', label: 'HU', width: 'w-24' },
    { key: 'number_of_hus_closed', label: 'HU CLOSED', width: 'w-24' },
    { key: 'number_of_hus_nested', label: 'HU NESTED', width: 'w-24' },
    { key: 'nesting_progress', label: 'NESTING %', width: 'w-32', render: (shipment) => (<div className="flex flex-col gap-1"><ProgressBar progress={shipment.nesting_progress || 0} /><span className="text-xs">{(shipment.nesting_progress || 0).toFixed(1)}%</span></div>)},
    { key: 'tos_packed', label: 'TO PACKED', width: 'w-24' },
    { key: 'packing_progress', label: 'PACKING %', width: 'w-32', render: (shipment) => (<div className="flex flex-col gap-1"><ProgressBar progress={shipment.packing_progress || 0} /><span className="text-xs">{(shipment.packing_progress || 0).toFixed(1)}%</span></div>)},
    { key: 'volume', label: <span>VOLUME (m<sup>3</sup>)</span>, width: 'w-24' }
  ];

  if (status === 'error') return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-red-400 text-lg">Connection error. Please try again later.</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 p-4 md:p-6">
      <div className="mb-4">
        <ConnectionStatus status={status} />
      </div>
      <div className="max-w-full mx-auto">
        <Card className="bg-gray-800 border-gray-700">
          {status === 'connecting' ? (
            <div className="h-[600px] flex items-center justify-center">
              <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
            </div>
          ) : (
            <>
              <DateFilter selectedFilter={dateFilter} onFilterChange={setDateFilter} />
              <div className="relative">
                {/* Table wrapper with horizontal scroll */}
                <div className="overflow-x-auto">
                  <div className="inline-block min-w-full align-middle">
                    {/* Container with vertical scroll and fixed height */}
                    <div className="relative max-h-table overflow-y-auto">
                      <table className="w-full divide-y divide-gray-700">
                        <thead className="bg-gray-800">
                          <tr>
                            {columns.map((column) => (
                              <th
                                key={column.key}
                                className={`${column.width} sticky top-0 bg-gray-800 z-10 p-3 text-center
                                  border-b border-gray-700`}
                                scope="col"
                              >
                                <span className="text-gray-300 font-mono text-sm font-semibold whitespace-nowrap">
                                  {column.label}
                                </span>
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700 bg-gray-800">
                          {filteredShipments.map((filteredShipments, index) => (
                            <tr
                              key={index}
                              className={`hover:bg-gray-700 transition-colors duration-150 ${getRowHighlight(filteredShipments)}`}
                            >
                              {columns.map((column) => (
                                <td
                                  key={column.key}
                                  className={`${column.width} p-3 whitespace-nowrap text-center`}
                                >
                                  <span className="text-gray-300 font-mono text-xs">
                                    {column.render ?
                                      column.render(filteredShipments) :
                                      (column.key === 'volume' ?
                                        <>{filteredShipments[column.key]} m<sup>3</sup></> :
                                        filteredShipments[column.key]
                                      )
                                    }
                                  </span>
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
              <Legend />
              <Toaster position="top-right" />
            </>
          )}
        </Card>
      </div>
    </div>
  );
}

export default App;