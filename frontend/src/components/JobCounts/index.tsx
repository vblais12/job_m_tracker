import React from 'react';
import { useJobCounts } from '../../hooks/useApi';
import { LoadingSpinner, ErrorAlert, StatCard, ChartContainer } from '../common';
import type { JobCountData } from '../../types/api';

interface JobCountsProps {
  location: string;
}

export const JobCounts: React.FC<JobCountsProps> = ({ location }) => {
  const { data, loading, error, refetch } = useJobCounts(location);

  if (loading) {
    return <LoadingSpinner text="Loading job market data..." />;
  }

  if (error) {
    return <ErrorAlert message={error} onRetry={refetch} />;
  }

  if (!data) {
    return <ErrorAlert message="No job data available" variant="warning" />;
  }

  // Parse response data --> handle different formats
  let totalJobs = 0;
  let jobsByRole: Array<{ role: string; count: number }> = [];

  if (typeof data.total_jobs === 'number') {
    totalJobs = data.total_jobs;
  }

  if (Array.isArray(data.counts_by_query)) {
    jobsByRole = data.counts_by_query.map((item: JobCountData) => ({
      role: item.search_query || item[0] || 'Unknown',
      count: item.count || item[1] || 0
    }));
  } else if (Array.isArray(data)) {
    // Handle direct array response
    jobsByRole = (data as any[]).map((item: any) => ({
      role: typeof item === 'object' ? (item.search_query || item[0] || 'Unknown') : 'Unknown',
      count: typeof item === 'object' ? (item.count || item[1] || 0) : 0
    }));
    totalJobs = jobsByRole.reduce((sum, item) => sum + item.count, 0);
  }

  const topRoles = jobsByRole.slice(0, 5);
  const averagePerRole = jobsByRole.length > 0 ? Math.round(totalJobs / jobsByRole.length) : 0;

  return (
    <div className="row g-4">
      {/* Summary Stats */}
      <div className="col-12">
        <div className="row g-3">
          <div className="col-md-4">
            <StatCard
              title="Total Job Listings"
              value={totalJobs.toLocaleString()}
              subtitle={`Available in ${location}`}
              icon="fas fa-briefcase"
              colorClass="primary"
            />
          </div>
          <div className="col-md-4">
            <StatCard
              title="Active Roles"
              value={jobsByRole.length}
              subtitle="Different job categories"
              icon="fas fa-layer-group"
              colorClass="success"
            />
          </div>
          <div className="col-md-4">
            <StatCard
              title="Average per Role"
              value={averagePerRole.toLocaleString()}
              subtitle="Jobs per category"
              icon="fas fa-chart-bar"
              colorClass="info"
            />
          </div>
        </div>
      </div>

      {/* Top Roles Chart */}
      <div className="col-12">
        <ChartContainer title="Top Job Categories">
          {topRoles.length > 0 ? (
            <div className="row">
              {topRoles.map((role, index) => {
                const percentage = totalJobs > 0 ? ((role.count / totalJobs) * 100).toFixed(1) : '0';
                const barVariants = ['primary', 'success', 'info', 'warning', 'secondary'];
                const variant = barVariants[index % barVariants.length];
                
                return (
                  <div key={role.role} className="col-12 mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span className="fw-medium">{role.role}</span>
                      <span className="text-muted">
                        {role.count.toLocaleString()} ({percentage}%)
                      </span>
                    </div>
                    <div className="progress" style={{ height: '20px' }}>
                      <div
                        className={`progress-bar bg-${variant}`}
                        role="progressbar"
                        style={{ width: `${percentage}%` }}
                        aria-valuenow={role.count}
                        aria-valuemin={0}
                        aria-valuemax={totalJobs}
                      >
                        {percentage}%
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center text-muted py-4">
              <i className="fas fa-chart-bar fa-3x mb-3"></i>
              <p>No job data available for visualization</p>
            </div>
          )}
        </ChartContainer>
      </div>

      {/* All Roles Table */}
      {jobsByRole.length > 5 && (
        <div className="col-12">
          <ChartContainer title="All Job Categories">
            <div className="table-responsive">
              <table className="table table-hover">
                <thead className="table-light">
                  <tr>
                    <th>Role</th>
                    <th className="text-end">Count</th>
                    <th className="text-end">Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {jobsByRole.map((role, index) => {
                    const percentage = totalJobs > 0 ? ((role.count / totalJobs) * 100).toFixed(1) : '0';
                    return (
                      <tr key={`${role.role}-${index}`}>
                        <td className="fw-medium">{role.role}</td>
                        <td className="text-end">{role.count.toLocaleString()}</td>
                        <td className="text-end">{percentage}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </ChartContainer>
        </div>
      )}
    </div>
  );
};