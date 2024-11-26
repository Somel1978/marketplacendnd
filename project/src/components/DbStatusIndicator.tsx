import React from 'react';
import { Database, AlertCircle, Loader2 } from 'lucide-react';
import { useDbStatus } from '../hooks/useDbStatus';

export function DbStatusIndicator() {
  const { isConnected, isLoading, error } = useDbStatus();

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2 text-gray-500">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span>Checking database connection...</span>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="flex items-center space-x-2 text-red-500" title={error || undefined}>
        <AlertCircle className="w-4 h-4" />
        <span>Database disconnected</span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2 text-green-500">
      <Database className="w-4 h-4" />
      <span>Database connected</span>
    </div>
  );
}