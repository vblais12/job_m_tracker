// API Types based on your backend responses
export interface SkillData {
  skill: string;
  freq: number;
}

export interface SkillsResponse {
  skills: Array<{
    search_query?: string;
    skills?: SkillData[];
    skill?: string;
    freq?: number;
  }>;
  role?: string;
}

export interface JobCountData {
  search_query?: string;
  count?: number;
  0?: string; // For array format [search_query, count]
  1?: number;
}

export interface JobCountsResponse {
  total_jobs?: number;
  counts_by_query?: JobCountData[];
  // Handle direct array response
  length?: number;
  [index: number]: any;
}

export interface RemoteVsOnsiteData {
  work_type: string;
  count: number;
}

export interface GeographicData {
  job_state: string;
  job_count: number;
}

export interface SalaryData {
  city: string;
  role: string;
  min_salary: number;
  min_base_salary: number;
  median_salary: number;
  median_base_salary: number;
}

export interface RecentListing {
  job_title: string;
  employer_name: string;
  job_country: string;
  apply_link: string;
  search_query: string;
}

export interface ApiResponse<T> {
  data?: T;
  [key: string]: any;
}