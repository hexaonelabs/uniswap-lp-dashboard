import { useState, useEffect } from 'react';
import { getPoolTicksData } from '../data/pools';

export const usePoolTicks = (poolId: string | null, chainId: number | null) => {
  const [poolTicks, setPoolTicks] = useState<{ tickIdx: string; liquidityNet: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!poolId || !chainId) return;

    const loadTicks = async () => {
      setLoading(true);
      setError(null);
      try {
        const ticks = await getPoolTicksData(poolId, chainId);
        setPoolTicks(ticks);
      } catch (err) {
        setError('Failed to load pool ticks');
        console.error('Error loading pool ticks:', err);
      } finally {
        setLoading(false);
      }
    };

    loadTicks();
  }, [poolId, chainId]);

  return { poolTicks, loading, error };
};