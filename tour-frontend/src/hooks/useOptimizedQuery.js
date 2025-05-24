import { useState, useEffect, useRef, useCallback } from 'react';
import { ref, query, orderByKey, limitToLast, startAfter, get, off, onValue } from 'firebase/database';
import { rtdb } from '../config/firebase';

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const useOptimizedQuery = (path, { pageSize = 10, orderBy = 'createdAt' } = {}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const lastKeyRef = useRef(null);
  const cacheRef = useRef({});
  const cacheKey = `${path}:${pageSize}:${orderBy}`;

  // Clear cache entry when component unmounts or path changes
  useEffect(() => {
    return () => {
      // Cleanup cache if no components are using this query
      setTimeout(() => {
        const now = Date.now();
        Object.keys(cacheRef.current).forEach(key => {
          if (now - cacheRef.current[key].timestamp > CACHE_DURATION) {
            delete cacheRef.current[key];
          }
        });
      }, 0);
    };
  }, [cacheKey]);

  const fetchData = useCallback(async (isInitial = true) => {
    if (!path) return;

    setLoading(true);
    setError(null);

    try {
      let queryRef = ref(rtdb, path);
      let queryConstraints = [];

      // Apply ordering
      if (orderBy) {
        queryConstraints.push(orderByKey(orderBy));
      }


      // Apply pagination if not initial load
      if (!isInitial && lastKeyRef.current) {
        queryConstraints.push(startAfter(lastKeyRef.current));
      }

      // Always limit the query to optimize performance
      queryConstraints.push(limitToLast(pageSize + 1));

      // Apply all query constraints
      if (queryConstraints.length > 0) {
        queryRef = query(queryRef, ...queryConstraints);
      }

      // Check cache first
      const cacheHit = cacheRef.current[cacheKey];
      const now = Date.now();

      if (cacheHit && (now - cacheHit.timestamp < CACHE_DURATION)) {
        setData(prev => isInitial ? cacheHit.data : [...prev, ...cacheHit.data]);
        lastKeyRef.current = cacheHit.lastKey;
        setHasMore(cacheHit.hasMore);
        setLoading(false);
        return;
      }

      // Fetch from Firebase
      const snapshot = await get(queryRef);
      const result = [];
      snapshot.forEach(child => {
        result.push({
          id: child.key,
          ...child.val()
        });
      });

      // Check if we have more data
      const hasMoreData = result.length > pageSize;
      const items = hasMoreData ? result.slice(0, -1) : result;
      
      // Update last key for pagination
      if (items.length > 0) {
        lastKeyRef.current = items[items.length - 1][orderBy];
      }

      // Update cache
      cacheRef.current[cacheKey] = {
        data: items,
        lastKey: lastKeyRef.current,
        hasMore: hasMoreData,
        timestamp: now
      };

      setData(prev => isInitial ? items : [...prev, ...items]);
      setHasMore(hasMoreData);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [path, pageSize, orderBy, cacheKey]);

  // Real-time updates
  useEffect(() => {
    if (!path) return;
    
    const dbRef = ref(rtdb, path);
    
    const handleValueChange = (snapshot) => {
      if (snapshot.exists()) {
        const result = [];
        snapshot.forEach(child => {
          result.push({
            id: child.key,
            ...child.val()
          });
        });
        
        // Update cache with fresh data
        const now = Date.now();
        cacheRef.current[cacheKey] = {
          data: result,
          lastKey: result.length > 0 ? result[result.length - 1][orderBy] : null,
          hasMore: result.length >= pageSize,
          timestamp: now
        };
        
        setData(result);
      }
    };
    
    // Set up real-time listener
    onValue(dbRef, handleValueChange);
    
    // Cleanup listener on unmount
    return () => off(dbRef, 'value', handleValueChange);
  }, [path, pageSize, orderBy, cacheKey]);

  const loadMore = useCallback(() => {
    if (hasMore && !loading) {
      fetchData(false);
    }
  }, [hasMore, loading, fetchData]);

  const refresh = useCallback(() => {
    lastKeyRef.current = null;
    fetchData(true);
  }, [fetchData]);

  return { data, loading, error, hasMore, loadMore, refresh };
};

export default useOptimizedQuery;
