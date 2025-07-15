import { useEffect, useState } from "react";
import { getPoolsData } from "../data/pools";
import { NETWORKS } from "../services/fetcher";
import { PoolColumnDataType } from "../types";

export const usePools = () => {
  const [pools, setPools] = useState<PoolColumnDataType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('usePools called');
    
    setLoading(true);
    setError(null);
    
    Promise.all([
      getPoolsData(NETWORKS[0].totalValueLockedUSD_gte, NETWORKS[0].volumeUSD_gte, NETWORKS[0].id, 500),
      getPoolsData(NETWORKS[1].totalValueLockedUSD_gte, NETWORKS[1].volumeUSD_gte, NETWORKS[1].id, 500),
    ])
    .then((responses) => {
      const allPools = responses.flatMap(response => response.pools);
      setPools(allPools);
      console.log('Pools fetched:', allPools);
    })
    .catch(error => {
      console.error('Error fetching pools:', error);
      setError(error.message);
    })
    .finally(() => {
      setLoading(false);
    });
  }, []);

  return { pools, loading, error };
}