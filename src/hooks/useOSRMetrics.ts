import { useState, useEffect } from 'react';
import { useDataStorage } from './useDataStorage';
import type { OSRMetrics } from '@/services/businessCalculations';
import { OSRCalculator } from '@/services/osrCalculations';

export function useOSRMetrics() {
  const { getActiveFileData } = useDataStorage();
  const [metrics, setMetrics] = useState<OSRMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculateMetrics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const osrData = await getActiveFileData('osr');
      
      if (!osrData || !osrData.sheets.length) {
        setMetrics(null);
        return;
      }

      // Calculate OSR metrics using the OSR calculator
      const calculatedMetrics = OSRCalculator.calculateAllMetrics(osrData.sheets);
      setMetrics(calculatedMetrics);
      
    } catch (err) {
      console.error('Failed to calculate OSR metrics:', err);
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