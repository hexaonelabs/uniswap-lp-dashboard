import { useState, useEffect } from 'react';
import { Position } from '../types';
import { getPositionsData } from '../data/data';
import { mockPositions } from '../data/mockData';
import { NETWORKS } from '../services/fetcher';

const cache = new Map<string, Position[]>();

export const usePositions = (address?: string) => {
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('usePositions called with address:', address);
    if (!address) {
      setLoading(false);
      setPositions([]);
      setError(null);
      return;
    }

    
    const cacheKey = `positions-${address}`;
    const cachedData = cache.get(cacheKey);
    
    if (cachedData) {
      setPositions(cachedData);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    
    Promise.all([
      getPositionsData(address, NETWORKS[0].id) // Assuming the first network is the default
      .then(data => {
        console.log('Fetched positions for chain:', NETWORKS[0].id, data);
        return data;
      }),
      getPositionsData(address, NETWORKS[1].id) // Assuming the first network is the default
      .then(data => {
        console.log('Fetched positions for chain:', NETWORKS[1].id, data);
        return data;
      }),
    ])
    .then((datas) => {
      const allPositions = datas.flat();
      setPositions(allPositions);
      cache.set(cacheKey, allPositions); // Cache the fetched positions
      console.log('Positions fetched and cached:', allPositions);
    })
    .catch(error => {
      console.error('Error fetching positions:', error);
      setError(error.message);
      setPositions(mockPositions); // Fallback to mock data
    })
    .finally(() => {
      setLoading(false);
    });
  }, [address]);

  return { positions, loading, error };
};