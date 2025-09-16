import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/apiService';
import type {
  SkillsResponse,
  JobCountsResponse,
  RemoteVsOnsiteData,
  GeographicData,
  SalaryData,
  RecentListing,
} from '../types/api';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useJobCounts(location = 'US'): UseApiState<JobCountsResponse> {
  const [state, setState] = useState<{
    data: JobCountsResponse | null;
    loading: boolean;
    error: string | null;
  }>({
    data: null,
    loading: true,
    error: null,
  });

  const fetchData = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const data = await apiService.getJobCounts(location);
      setState({ data, loading: false, error: null });
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch job counts'
      });
    }
  }, [location]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { ...state, refetch: fetchData };
}

export function useTopSkills(role?: string, topK = 10): UseApiState<SkillsResponse> {
  const [state, setState] = useState<{
    data: SkillsResponse | null;
    loading: boolean;
    error: string | null;
  }>({
    data: null,
    loading: true,
    error: null,
  });

  const fetchData = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const data = await apiService.getTopSkills(role, topK);
      setState({ data, loading: false, error: null });
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch skills data'
      });
    }
  }, [role, topK]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { ...state, refetch: fetchData };
}

export function useRemoteVsOnsite(): UseApiState<RemoteVsOnsiteData[]> {
  const [state, setState] = useState<{
    data: RemoteVsOnsiteData[] | null;
    loading: boolean;
    error: string | null;
  }>({
    data: null,
    loading: true,
    error: null,
  });

  const fetchData = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const data = await apiService.getRemoteVsOnsite();
      setState({ data, loading: false, error: null });
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch work arrangement data'
      });
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { ...state, refetch: fetchData };
}

export function useGeographicDistribution(location?: string): UseApiState<GeographicData[]> {
  const [state, setState] = useState<{
    data: GeographicData[] | null;
    loading: boolean;
    error: string | null;
  }>({
    data: null,
    loading: true,
    error: null,
  });

  const fetchData = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const data = await apiService.getGeographicDistribution(location);
      setState({ data, loading: false, error: null });
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch geographic data'
      });
    }
  }, [location]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { ...state, refetch: fetchData };
}

export function useSalaryData(location?: string): UseApiState<SalaryData[]> {
  const [state, setState] = useState<{
    data: SalaryData[] | null;
    loading: boolean;
    error: string | null;
  }>({
    data: null,
    loading: true,
    error: null,
  });

  const fetchData = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const data = await apiService.getSalaryData(location);
      setState({ data, loading: false, error: null });
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch salary data'
      });
    }
  }, [location]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { ...state, refetch: fetchData };
}

export function useRecentListings(location?: string): UseApiState<RecentListing[]> {
  const [state, setState] = useState<{
    data: RecentListing[] | null;
    loading: boolean;
    error: string | null;
  }>({
    data: null,
    loading: true,
    error: null,
  });

  const fetchData = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const data = await apiService.getRecentListings(location);
      setState({ data, loading: false, error: null });
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch recent listings'
      });
    }
  }, [location]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { ...state, refetch: fetchData };
}