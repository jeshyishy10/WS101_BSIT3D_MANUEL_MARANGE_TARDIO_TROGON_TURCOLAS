// src/components/ConnectionStatus.jsx
import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { api } from '../services';

const CONNECTION_STATUS = {
  CHECKING: 'checking',
  CONNECTED: 'connected',
  PARTIAL: 'partial',
  DISCONNECTED: 'disconnected'
};

const STATUS_CONFIG = {
  [CONNECTION_STATUS.CHECKING]: {
    color: 'bg-gray-500',
    text: 'Checking Connection...',
    label: 'checking'
  },
  [CONNECTION_STATUS.CONNECTED]: {
    color: 'bg-green-500',
    text: 'Backend Connected',
    label: 'connected'
  },
  [CONNECTION_STATUS.PARTIAL]: {
    color: 'bg-yellow-500',
    text: 'Partial Connection',
    label: 'partial'
  },
  [CONNECTION_STATUS.DISCONNECTED]: {
    color: 'bg-red-500',
    text: 'Backend Disconnected',
    label: 'disconnected'
  }
};

const ConnectionStatus = ({ autoCheck = true, checkInterval = 30000 }) => {
  const [status, setStatus] = useState(CONNECTION_STATUS.CHECKING);
  const [results, setResults] = useState([]);
  const [showDetails, setShowDetails] = useState(false);
  const [lastChecked, setLastChecked] = useState(null);
  const [isChecking, setIsChecking] = useState(false);

  const checkConnection = useCallback(async () => {
    if (isChecking) return;

    setIsChecking(true);
    setStatus(CONNECTION_STATUS.CHECKING);

    try {
      const connectionResults = await api.testConnection();
      setResults(connectionResults);
      setLastChecked(new Date());

      const allSuccess = connectionResults.every(r => r.success);
      setStatus(allSuccess ? CONNECTION_STATUS.CONNECTED : CONNECTION_STATUS.PARTIAL);
    } catch (error) {
      console.error('Connection check failed:', error);
      setStatus(CONNECTION_STATUS.DISCONNECTED);
      setResults([{
        test: 'Connection',
        success: false,
        status: error.message || 'Network Error',
        responseTime: null
      }]);
    } finally {
      setIsChecking(false);
    }
  }, [isChecking]);

  useEffect(() => {
    if (autoCheck) {
      checkConnection();

      const interval = setInterval(checkConnection, checkInterval);
      return () => clearInterval(interval);
    }
  }, [autoCheck, checkInterval, checkConnection]);

  const getStatusConfig = () => STATUS_CONFIG[status] || STATUS_CONFIG[CONNECTION_STATUS.CHECKING];

  const formatTime = (date) => {
    if (!date) return 'Never';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const currentConfig = getStatusConfig();

  return (
    <div className="fixed bottom-4 right-4 z-50" role="status" aria-live="polite">
      <div className="bg-white rounded-lg shadow-lg p-4 max-w-md border border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <div
              className={`w-3 h-3 rounded-full mr-2 ${currentConfig.color} animate-pulse`}
              aria-label={currentConfig.label}
            ></div>
            <span className="font-medium">{currentConfig.text}</span>
          </div>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-sm text-blue-600 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-300 rounded"
            aria-expanded={showDetails}
          >
            {showDetails ? 'Hide Details' : 'Show Details'}
          </button>
        </div>

        <div className="text-sm text-gray-600 mb-2 truncate" title={`${api.config.BASE_URL}${api.config.API_PREFIX}`}>
          {api.config.BASE_URL}{api.config.API_PREFIX}
        </div>

        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-gray-500">
            Last checked: {formatTime(lastChecked)}
          </span>
          <button
            onClick={checkConnection}
            disabled={isChecking}
            className="bg-blue-100 text-blue-700 py-1 px-3 rounded text-sm hover:bg-blue-200
                     transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                     focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            {isChecking ? 'Testing...' : 'Test Connection'}
          </button>
        </div>

        {showDetails && results.length > 0 && (
          <div className="mt-3 border-t pt-3">
            <div className="text-sm font-medium mb-2">Test Results:</div>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-2" role="list">
              {results.map((result, index) => (
                <div
                  key={result.test || index}
                  className="flex items-center justify-between text-sm p-2 rounded hover:bg-gray-50"
                  role="listitem"
                >
                  <div className="flex items-center min-w-0">
                    <span
                      className={`w-2 h-2 rounded-full mr-2 flex-shrink-0 ${result.success ? 'bg-green-500' : 'bg-red-500'}`}
                      aria-hidden="true"
                    ></span>
                    <span className="truncate font-medium">{result.test}:</span>
                  </div>
                  <div className="flex items-center ml-2 flex-shrink-0">
                    <span className={`${result.success ? 'text-green-600' : 'text-red-600'} mr-2`}>
                      {result.status}
                    </span>
                    {result.responseTime && (
                      <span className="text-gray-500 text-xs">
                        ({result.responseTime}ms)
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

ConnectionStatus.propTypes = {
  autoCheck: PropTypes.bool,
  checkInterval: PropTypes.number
};

export default ConnectionStatus;