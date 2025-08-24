import { useState, useEffect } from 'react';
import { useDataStorage } from './useDataStorage';
import type { InventoryMetrics } from '@/services/businessCalculations';
import { InventoryCalculator } from '@/services/businessCalculations';

export function useInventoryMetrics() {
  const { getActiveFileData } = useDataStorage();
  const [metrics, setMetrics] = useState<InventoryMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculateMetrics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const inventoryData = await getActiveFileData('inventory');
      
      if (!inventoryData || !inventoryData.sheets.length) {
        setMetrics(null);
        return;
      }

      // Calculate metrics using the inventory calculator
      const calculatedMetrics = InventoryCalculator.calculateAllMetrics(inventoryData.sheets);
      setMetrics(calculatedMetrics);
      
    } catch (err) {
      console.error('Failed to calculate inventory metrics:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setMetrics(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    calculateMetrics();
  }, []);

  const refresh = () => {
    calculateMetrics();
  };

  return {
    metrics,
    loading,
    error,
    refresh
  };
}