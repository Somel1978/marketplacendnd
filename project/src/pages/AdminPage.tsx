import React from 'react';
import { AdminPanel } from '../components/AdminPanel';
import { DbConfigPanel } from '../components/DbConfigPanel';
import { DbStatusIndicator } from '../components/DbStatusIndicator';
import { useItems } from '../hooks/useItems';
import { loadDbConfig, saveDbConfig } from '../config/database';

export function AdminPage() {
  const { allItems, setItems, refresh, isLoading, error } = useItems();
  const currentConfig = loadDbConfig();

  const handleConfigSave = async (newConfig: typeof currentConfig) => {
    saveDbConfig(newConfig);
    window.location.reload(); // Reload to apply new database configuration
  };

  return (
    <div className="space-y-8">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Database Status</h2>
          <DbStatusIndicator />
        </div>
        <DbConfigPanel
          currentConfig={currentConfig}
          onConfigSave={handleConfigSave}
        />
      </div>
      <AdminPanel
        items={allItems}
        onItemsChange={setItems}
        onRefresh={refresh}
        isLoading={isLoading}
        error={error}
      />
    </div>
  );
}