import axios from 'axios';
import type {
  SkillsResponse,
  JobCountsResponse,
  RemoteVsOnsiteData,
  GeographicData,
  SalaryData,
  RecentListing,
  ApiResponse,
} from '../types/api';

const API_BASE_URL = 'http://localhost:8000';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    throw new Error(
      error.response?.data?.detail || 
      error.message || 
      'An error occurred while fetching data'
    );
  }
);

export class ApiService {
  // Get job counts by location
  async getJobCounts(location = 'US'): Promise<JobCountsResponse> {
    const response = await apiClient.get(`/job_listings/counts?location=${location}`);
    return response.data;
  }

  // Get top skills (overall or by role)
  async getTopSkills(role?: string, topK = 10): Promise<SkillsResponse> {
    const params = new URLSearchParams();
    if (role) params.append('role', role);
    params.append('top_k', topK.toString());
    
    const response = await apiClient.get(`/skills/top?${params.toString()}`);
    return response.data;
  }

  // Get remote vs onsite distribution
  async getRemoteVsOnsite(): Promise<RemoteVsOnsiteData[]> {
    const response = await apiClient.get<ApiResponse<RemoteVsOnsiteData[]>>('/remote_v_onsite');
    return response.data.data || [];
  }

  // Get geographic distribution
  async getGeographicDistribution(location?: string): Promise<GeographicData[]> {
    const url = location ? `/geographic_distribution?location=${location}` : '/geographic_distribution';
    const response = await apiClient.get<ApiResponse<GeographicData[]>>(url);
    return response.data.data || [];
  }

  // Get salary data
  async getSalaryData(location?: string): Promise<SalaryData[]> {
    const url = location ? `/salaries?location=${location}` : '/salaries';
    const response = await apiClient.get<ApiResponse<SalaryData[]>>(url);
    return response.data.data || [];
  }

  // Get recent listings
  async getRecentListings(location?: string): Promise<RecentListing[]> {
    const url = location ? `/recent_listings?location=${location}` : '/recent_listings';
    const response = await apiClient.get<ApiResponse<RecentListing[]>>(url);
    return response.data.data || [];
  }
}

export const apiService = new ApiService();