import React, { useState } from 'react';
import { useRecentListings } from '../../hooks/useApi';
import { LoadingSpinner, ErrorAlert, ChartContainer } from '../common';

interface RecentListingsProps {
  location?: string;
}

export const RecentListings: React.FC<RecentListingsProps> = ({ location }) => {
  const { data, loading, error, refetch } = useRecentListings(location);
  const [showAllJobs, setShowAllJobs] = useState(false);

  if (loading) {
    return <LoadingSpinner text="Loading recent job listings..." />;
  }

  if (error) {
    return <ErrorAlert message={error} onRetry={refetch} />;
  }

  if (!data || data.length === 0) {
    return (
      <div className="card">
        <div className="card-body text-center py-5">
          <i className="fas fa-calendar-alt fa-3x text-muted mb-3"></i>
          <h5 className="text-muted">No Recent Listings</h5>
          <p className="text-muted">No recent job listings found for the selected location.</p>
        </div>
      </div>
    );
  }

  // Group by search query/role
  const groupedByRole = data.reduce((acc, job) => {
    const role = job.search_query || 'Other';
    if (!acc[role]) {
      acc[role] = [];
    }
    acc[role].push(job);
    return acc;
  }, {} as Record<string, typeof data>);

  const roleStats = Object.entries(groupedByRole).map(([role, jobs]) => ({
    role,
    count: jobs.length,
    jobs
  })).sort((a, b) => b.count - a.count);

  return (
    <div className="row g-4">
      {/* Summary Stats */}
      <div className="col-12">
        <div className="row g-3">
          <div className="col-md-4">
            <div className="card border-primary">
              <div className="card-body text-center">
                <i className="fas fa-newspaper fa-2x text-primary mb-2"></i>
                <h3 className="text-primary mb-1">{data.length}</h3>
                <small className="text-muted">Recent Job Listings</small>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card border-success">
              <div className="card-body text-center">
                <i className="fas fa-building fa-2x text-success mb-2"></i>
                <h3 className="text-success mb-1">
                  {new Set(data.map(job => job.employer_name)).size}
                </h3>
                <small className="text-muted">Unique Companies</small>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card border-info">
              <div className="card-body text-center">
                <i className="fas fa-layer-group fa-2x text-info mb-2"></i>
                <h3 className="text-info mb-1">{Object.keys(groupedByRole).length}</h3>
                <small className="text-muted">Job Categories</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Jobs by Role */}
      <div className="col-lg-4">
        <ChartContainer title="Recent Jobs by Role">
          <div>
            {roleStats.map((roleData, index) => {
              const colors = ['primary', 'success', 'info', 'warning', 'danger'];
              const colorClass = colors[index % colors.length];
              
              return (
                <div 
                  key={roleData.role}
                  className="d-flex justify-content-between align-items-center px-0 py-3"
                  style={{
                    backgroundColor: 'transparent',
                    borderBottom: '1px solid var(--border-color)',
                    color: 'var(--text-primary)'
                  }}
                >
                  <div className="d-flex align-items-center">
                    <span className={`badge bg-${colorClass} me-3`}>{index + 1}</span>
                    <div>
                      <div className="fw-medium" style={{ color: 'var(--text-primary)' }}>
                        {roleData.role}
                      </div>
                      <small style={{ color: 'var(--text-muted)' }}>
                        Category
                      </small>
                    </div>
                  </div>
                  <span className={`badge bg-${colorClass} rounded-pill fs-6`}>
                    {roleData.count}
                  </span>
                </div>
              );
            })}
          </div>
        </ChartContainer>
      </div>

      {/* Recent Job Listings */}
      <div className="col-lg-8">
        <ChartContainer title={`Latest Job Postings ${location ? `in ${location}` : ''}`}>
          <div className="row g-3">
            {(showAllJobs ? data : data.slice(0, 12)).map((job, index) => (
              <div key={`${job.job_title}-${job.employer_name}-${index}`} className="col-md-6">
                <div className="card h-100 border-0 shadow-sm">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h6 className="card-title mb-0 text-primary fw-bold" style={{ fontSize: '0.9rem' }}>
                        {job.job_title}
                      </h6>
                      <span className="badge bg-light text-dark">
                        {job.job_country}
                      </span>
                    </div>
                    
                    <div className="mb-2">
                      <div className="d-flex align-items-center text-muted mb-1">
                        <i className="fas fa-building fa-sm me-2"></i>
                        <span className="fw-medium text-dark">{job.employer_name}</span>
                      </div>
                      <div className="d-flex align-items-center text-muted">
                        <i className="fas fa-tag fa-sm me-2"></i>
                        <span>{job.search_query}</span>
                      </div>
                    </div>

                    <div className="mt-auto">
                      {job.apply_link && (
                        <a
                          href={job.apply_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-outline-primary btn-sm w-100"
                        >
                          <i className="fas fa-external-link-alt me-1"></i>
                          Apply Now
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {data.length > 12 && (
            <div className="text-center mt-4">
              <button
                className="btn btn-outline-primary btn-lg"
                onClick={() => setShowAllJobs(!showAllJobs)}
                style={{
                  background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                  borderColor: 'var(--accent-primary)',
                  color: 'white',
                  transition: 'all 0.3s ease',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.2)';
                }}
              >
                <i className={`fas fa-chevron-${showAllJobs ? 'up' : 'down'} me-2`}></i>
                {showAllJobs 
                  ? `Show Less (12 of ${data.length})` 
                  : `Show All ${data.length} Jobs`
                }
              </button>
              
              {!showAllJobs && (
                <div className="alert alert-info mt-3 mb-0">
                  <i className="fas fa-info-circle me-2"></i>
                  Showing 12 of {data.length} recent job listings
                </div>
              )}
            </div>
          )}
        </ChartContainer>
      </div>

      {/* Company Breakdown */}
      <div className="col-12">
        <ChartContainer title="Top Hiring Companies">
          {(() => {
            const companyStats = data.reduce((acc, job) => {
              const company = job.employer_name;
              if (!acc[company]) {
                acc[company] = {
                  count: 0,
                  roles: new Set(),
                  jobs: []
                };
              }
              acc[company].count += 1;
              acc[company].roles.add(job.search_query);
              acc[company].jobs.push(job);
              return acc;
            }, {} as Record<string, { count: number; roles: Set<string>; jobs: typeof data }>);

            const topCompanies = Object.entries(companyStats)
              .map(([company, stats]) => ({
                company,
                count: stats.count,
                roleCount: stats.roles.size,
                jobs: stats.jobs
              }))
              .sort((a, b) => b.count - a.count)
              .slice(0, 10);

            return (
              <div>
                {/* Header */}
                <div 
                  className="d-flex align-items-center px-0 py-2 mb-2"
                  style={{
                    borderBottom: '2px solid var(--border-color)',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    width: '100%'
                  }}
                >
                  <span style={{ flex: 1, color: 'var(--text-primary)', fontWeight: '600', fontSize: '0.9rem', textAlign: 'center' }}>
                    Rank
                  </span>
                  <span style={{ flex: 2, color: 'var(--text-primary)', fontWeight: '600', fontSize: '0.9rem', textAlign: 'center' }}>
                    Company
                  </span>
                  <span style={{ flex: 1, color: 'var(--text-primary)', fontWeight: '600', fontSize: '0.9rem', textAlign: 'center' }}>
                    Job Count
                  </span>
                  <span style={{ flex: 1, color: 'var(--text-primary)', fontWeight: '600', fontSize: '0.9rem', textAlign: 'center' }}>
                    Role Types
                  </span>
                  <span style={{ flex: 2, color: 'var(--text-primary)', fontWeight: '600', fontSize: '0.9rem', textAlign: 'center' }}>
                    Sample Positions
                  </span>
                </div>

                {/* Data Rows */}
                {topCompanies.map((company, index) => (
                  <div 
                    key={company.company}
                    className="d-flex align-items-center px-0 py-3"
                    style={{
                      backgroundColor: 'transparent',
                      borderBottom: '1px solid var(--border-color)',
                      color: 'var(--text-primary)',
                      width: '100%'
                    }}
                  >
                    <span style={{ flex: 1, textAlign: 'center' }}>
                      <span className="badge bg-primary">#{index + 1}</span>
                    </span>
                    <span className="fw-bold" style={{ flex: 2, color: 'var(--text-primary)', textAlign: 'center' }}>
                      {company.company}
                    </span>
                    <span style={{ flex: 1, textAlign: 'center' }}>
                      <span className="badge bg-success">{company.count}</span>
                    </span>
                    <span style={{ flex: 1, textAlign: 'center' }}>
                      <span className="badge bg-info">{company.roleCount}</span>
                    </span>
                    <span style={{ flex: 2, textAlign: 'center' }}>
                      <div className="d-flex flex-wrap gap-1 justify-content-center">
                        {company.jobs.slice(0, 2).map((job, jobIndex) => (
                          <small 
                            key={jobIndex} 
                            className="badge bg-light text-dark"
                            title={job.job_title}
                          >
                            {job.job_title.length > 15 
                              ? job.job_title.substring(0, 15) + '...' 
                              : job.job_title
                            }
                          </small>
                        ))}
                        {company.jobs.length > 2 && (
                          <small style={{ color: 'var(--text-muted)' }}>
                            +{company.jobs.length - 2} more
                          </small>
                        )}
                      </div>
                    </span>
                  </div>
                ))}
              </div>
            );
          })()}
        </ChartContainer>
      </div>
    </div>
  );
};