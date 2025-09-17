'use client';

import React, { useState, useEffect } from 'react';
import { databaseApi } from '@/lib/api';

interface DatabaseSelectorProps {
  className?: string;
}

export const DatabaseSelector: React.FC<DatabaseSelectorProps> = ({ className = '' }) => {
  const [currentDatabase, setCurrentDatabase] = useState<'sqlite' | 'postgres'>('postgres');
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<{
    sqlite: boolean;
    postgres: boolean;
  }>({ sqlite: false, postgres: false });

  useEffect(() => {
    // Load current database type from localStorage
    const storedType = databaseApi.getCurrentType() as 'sqlite' | 'postgres';
    setCurrentDatabase(storedType);
    
    // Test both connections on mount
    testConnections();
  }, []);

  const testConnections = async () => {
    const [sqliteResult, postgresResult] = await Promise.all([
      databaseApi.testConnection('sqlite'),
      databaseApi.testConnection('postgres'),
    ]);

    setConnectionStatus({
      sqlite: sqliteResult,
      postgres: postgresResult,
    });
  };

  const handleDatabaseSwitch = async (type: 'sqlite' | 'postgres') => {
    if (type === currentDatabase) return;

    setIsConnecting(true);
    try {
      // Test connection first
      const isConnectionValid = await databaseApi.testConnection(type);
      
      if (isConnectionValid) {
        databaseApi.switchDatabase(type);
        setCurrentDatabase(type);
        
        // Refresh the page to ensure all components use the new database
        window.location.reload();
      } else {
        alert(`Failed to connect to ${type.toUpperCase()} database. Please check your configuration.`);
      }
    } catch (error) {
      console.error('Database switch failed:', error);
      alert(`Error switching to ${type.toUpperCase()} database.`);
    } finally {
      setIsConnecting(false);
    }
  };

  const getDatabaseDisplayName = (type: 'sqlite' | 'postgres') => {
    return type === 'sqlite' ? 'SQLite (Local)' : 'PostgreSQL (Remote)';
  };

  const getConnectionStatusIcon = (type: 'sqlite' | 'postgres') => {
    const isConnected = connectionStatus[type];
    return isConnected ? '🟢' : '🔴';
  };

  return (
    <div className={`database-selector ${className}`}>
      <div className="flex items-center space-x-4 p-4 bg-white rounded-lg shadow-sm border">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700">Database:</span>
        </div>
        
        <div className="flex space-x-2">
          {(['sqlite', 'postgres'] as const).map((type) => (
            <button
              key={type}
              onClick={() => handleDatabaseSwitch(type)}
              disabled={isConnecting}
              className={`
                px-4 py-2 rounded-md text-sm font-medium transition-colors
                flex items-center space-x-2
                ${currentDatabase === type
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
                ${isConnecting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              <span>{getConnectionStatusIcon(type)}</span>
              <span>{getDatabaseDisplayName(type)}</span>
              {currentDatabase === type && (
                <span className="ml-1 text-xs bg-white bg-opacity-20 px-1 rounded">
                  Active
                </span>
              )}
            </button>
          ))}
        </div>

        {isConnecting && (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
            <span>Switching...</span>
          </div>
        )}

        <button
          onClick={testConnections}
          className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
          disabled={isConnecting}
        >
          Test Connections
        </button>
      </div>

      <div className="mt-2 text-xs text-gray-500">
        <div className="flex space-x-4">
          <span>🟢 Connected</span>
          <span>🔴 Disconnected</span>
        </div>
      </div>
    </div>
  );
};

export default DatabaseSelector;