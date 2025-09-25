import { useState, useEffect, useCallback } from 'react';
import { Position } from '../types';
import { getPositionData, getPositionsData } from '../data/data';
import { mockPositions } from '../data/mockData';
import { NETWORKS } from '../services/fetcher';

export const cache = new Map<string, Position[]>();

export const usePositions = (address?: string, chainId?: string, positionId?: string) => {
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshPositions = useCallback(() => {
    if (!address) return;
    
    console.log('Refreshing positions for address:', address);
    const cacheKey = `positions-${address}`;
    cache.delete(cacheKey); // Supprimer du cache
    
    setLoading(true);
    setError(null);
    
    // Recharger les données
    Promise.all([
      getPositionsData(address, NETWORKS[0].id),
      getPositionsData(address, NETWORKS[1].id),
    ])
    .then((datas) => {
      const allPositions = datas.flat();
      setPositions(allPositions);
      cache.set(cacheKey, allPositions);
    })
    .catch(error => {
      console.error('Error refreshing positions:', error);
      setError(error.message);
    })
    .finally(() => {
      setLoading(false);
    });
  }, [address]);

  useEffect(() => {
    console.log('usePositions called with address:', address, 'chainId:', chainId, 'positionId:', positionId);
    if (!address && (!chainId && !positionId)) {
      setLoading(false);
      setPositions([]);
      setError(null);
      return;
    }

    if (!address && chainId && positionId) {
      setLoading(true);
      setError(null);
      getPositionData(chainId, positionId)
      .then(data => {
        setPositions(data);
        setError(null);
      })
      .catch(error => {
        console.error('Error fetching position by ID:', error);
        setError(error.message);
        setPositions([]); // Fallback to mock data
      })
      .finally(() => {
        setLoading(false);
      });
      return;
    }

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
  }, [address, chainId, positionId]);

  useEffect(() => {
    const handlePositionsUpdate = () => {
      refreshPositions();
    };
    
    window.addEventListener('positions-updated', handlePositionsUpdate);
    return () => window.removeEventListener('positions-updated', handlePositionsUpdate);
  }, [refreshPositions]);

  return { positions, loading, error, refreshPositions };
};