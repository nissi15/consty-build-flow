import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export function useDataRefresh(interval: number = 30000) {
  const queryClient = useQueryClient();
  const refreshInterval = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Set up interval for data refresh
    refreshInterval.current = setInterval(() => {
      // Invalidate and refetch all queries
      queryClient.invalidateQueries();
    }, interval);

    // Clean up on unmount
    return () => {
      if (refreshInterval.current) {
        clearInterval(refreshInterval.current);
      }
    };
  }, [interval, queryClient]);

  return null;
}
