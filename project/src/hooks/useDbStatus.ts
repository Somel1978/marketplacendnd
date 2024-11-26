import { useState, useEffect } from 'react';
import { testConnection } from '../services/api';
import { loadDbConfig } from '../config/database';

export function useDbStatus() {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkConnection = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const config = loadDbConfig();
      await testConnection(config);
      setIsConnected(true);
    } catch (err) {
      setIsConnected(false);
      setError(err instanceof Error ? err.message : 'Failed to connect to database');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkConnection();
  }, []);

  return {
    isConnected,
    isLoading,
    error,
    checkConnection
  };
}