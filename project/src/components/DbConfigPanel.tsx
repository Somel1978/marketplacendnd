import React, { useState } from 'react';
import { Settings, AlertCircle, CheckCircle2 } from 'lucide-react';
import { DbConfig, dbConfigSchema } from '../config/database';
import { testConnection } from '../services/api';

interface DbConfigPanelProps {
  currentConfig: DbConfig;
  onConfigSave: (config: DbConfig) => void;
}

export function DbConfigPanel({ currentConfig, onConfigSave }: DbConfigPanelProps) {
  const [config, setConfig] = useState(currentConfig);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setConfig(prev => ({
      ...prev,
      [name]: name === 'port' ? parseInt(value, 10) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const validatedConfig = dbConfigSchema.parse(config);
      await testConnection(validatedConfig);
      onConfigSave(validatedConfig);
      setSuccess('Database connection successful!');
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect to database');
    }
  };

  if (!isEditing) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2">
            <Settings className="w-5 h-5 text-gray-500" />
            <h2 className="text-lg font-medium text-gray-900">Database Configuration</h2>
          </div>
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Edit Configuration
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Host</p>
            <p className="mt-1">{config.host}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Port</p>
            <p className="mt-1">{config.port}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Database</p>
            <p className="mt-1">{config.database}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Table</p>
            <p className="mt-1">{config.table}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">User</p>
            <p className="mt-1">{config.user}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center space-x-2 mb-6">
        <Settings className="w-5 h-5 text-gray-500" />
        <h2 className="text-lg font-medium text-gray-900">Edit Database Configuration</h2>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded flex items-center text-red-600">
          <AlertCircle className="w-5 h-5 mr-2" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded flex items-center text-green-600">
          <CheckCircle2 className="w-5 h-5 mr-2" />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="host" className="block text-sm font-medium text-gray-700">
              Host
            </label>
            <input
              type="text"
              id="host"
              name="host"
              value={config.host}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label htmlFor="port" className="block text-sm font-medium text-gray-700">
              Port
            </label>
            <input
              type="number"
              id="port"
              name="port"
              value={config.port}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label htmlFor="database" className="block text-sm font-medium text-gray-700">
              Database Name
            </label>
            <input
              type="text"
              id="database"
              name="database"
              value={config.database}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label htmlFor="table" className="block text-sm font-medium text-gray-700">
              Table Name
            </label>
            <input
              type="text"
              id="table"
              name="table"
              value={config.table}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label htmlFor="user" className="block text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              type="text"
              id="user"
              name="user"
              value={config.user}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={config.password}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            type="button"
            onClick={() => {
              setIsEditing(false);
              setConfig(currentConfig);
              setError(null);
              setSuccess(null);
            }}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            Save Configuration
          </button>
        </div>
      </form>
    </div>
  );
}