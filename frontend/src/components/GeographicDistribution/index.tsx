import React from 'react';
import { useGeographicDistribution } from '../../hooks/useApi';
import { LoadingSpinner, ErrorAlert, ChartContainer } from '../common';

interface GeographicDistributionProps {
  location?: string;
}

export const GeographicDistribution: React.FC<GeographicDistributionProps> = ({ location }) => {
  const { data, loading, error, refetch } = useGeographicDistribution(location);

  if (loading) {
    return <LoadingSpinner text="Loading geographic data..." />;
  }

  if (error) {
    return <ErrorAlert message={error} onRetry={refetch} />;
  }

  if (!data || data.length === 0) {
    return <ErrorAlert message="No geographic data available" variant="warning" />;
  }

  const totalJobs = data.reduce((sum, item) => sum + item.job_count, 0);
  const topStates = data.slice(0, 10);
  const maxCount = Math.max(...data.map(item => item.job_count));

  return (
    <div className="row g-4">
      {/* Top States/Provinces */}
      <div className="col-lg-8">
        <ChartContainer title={`Job Distribution by ${location === 'CA' ? 'Province' : 'State'}`}>
          {topStates.length > 0 ? (
            <div className="space-y-3">
              {topStates.map((item, index) => {
                const percentage = totalJobs > 0 ? ((item.job_count / totalJobs) * 100) : 0;
                const barWidth = maxCount > 0 ? (item.job_count / maxCount) * 100 : 0;
                const colors = [
                  'primary', 'success', 'info', 'warning', 'danger',
                  'secondary', 'dark', 'primary', 'success', 'info'
                ];
                const colorClass = colors[index % colors.length];
                
                return (
                  <div key={item.job_state} className="mb-4">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <div className="d-flex align-items-center">
                        <span className={`badge bg-${colorClass} me-2`}>#{index + 1}</span>
                        <span className="fw-bold">{item.job_state}</span>
                      </div>
                      <div className="text-end">
                        <div className="fw-bold">{item.job_count.toLocaleString()}</div>
                        <small className="text-muted">{percentage.toFixed(1)}%</small>
                      </div>
                    </div>
                    <div className="progress" style={{ height: '25px' }}>
                      <div
                        className={`progress-bar bg-${colorClass} d-flex align-items-center justify-content-start ps-3`}
                        style={{ width: `${Math.max(barWidth, 5)}%` }}
                      >
                        <span className="text-white fw-medium">
                          {barWidth > 15 ? item.job_count.toLocaleString() : ''}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center text-muted py-5">
              <i className="fas fa-map-marker-alt fa-3x mb-3"></i>
              <p>No geographic data available</p>
            </div>
          )}
        </ChartContainer>
      </div>

      {/* Summary Stats */}
      <div className="col-lg-4">
        <div className="row g-3">
          <div className="col-12">
            <div className="card border-primary">
              <div className="card-body text-center">
                <i className="fas fa-map-marked-alt fa-2x text-primary mb-2"></i>
                <h3 className="text-primary mb-1">{data.length}</h3>
                <small className="text-muted">
                  {location === 'CA' ? 'Provinces/Territories' : 'States'} with Jobs
                </small>
              </div>
            </div>
          </div>
          
          <div className="col-12">
            <div className="card border-success">
              <div className="card-body text-center">
                <i className="fas fa-briefcase fa-2x text-success mb-2"></i>
                <h3 className="text-success mb-1">{totalJobs.toLocaleString()}</h3>
                <small className="text-muted">Total Job Positions</small>
              </div>
            </div>
          </div>

          {topStates.length > 0 && (
            <div className="col-12">
              <div className="card border-info">
                <div className="card-body text-center">
                  <i className="fas fa-star fa-2x text-info mb-2"></i>
                  <h5 className="text-info mb-1">{topStates[0].job_state}</h5>
                  <small className="text-muted">
                    Top Location ({topStates[0].job_count.toLocaleString()} jobs)
                  </small>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Top 5 Quick Stats */}
        <div className="mt-4">
          <ChartContainer title="Top 5 Locations">
            <div className="list-group list-group-flush">
              {topStates.slice(0, 5).map((item, index) => {
                const percentage = totalJobs > 0 ? ((item.job_count / totalJobs) * 100) : 0;
                const colors = ['primary', 'success', 'info', 'warning', 'danger'];
                const colorClass = colors[index % colors.length];
                
                return (
                  <div 
                    key={item.job_state}
                    className="list-group-item d-flex justify-content-between align-items-center px-0 py-3 border-0"
                  >
                    <div className="d-flex align-items-center">
                      <span className={`badge bg-${colorClass} me-3`}>#{index + 1}</span>
                      <div>
                        <div className="fw-medium">{item.job_state}</div>
                        <small className="text-muted">{percentage.toFixed(1)}% of total</small>
                      </div>
                    </div>
                    <span className={`badge bg-${colorClass} rounded-pill fs-6`}>
                      {item.job_count.toLocaleString()}
                    </span>
                  </div>
                );
              })}
            </div>
          </ChartContainer>
        </div>
      </div>

      {/* Full Table for remaining states */}
      {data.length > 10 && (
        <div className="col-12">
          <ChartContainer title={`All ${location === 'CA' ? 'Provinces/Territories' : 'States'} (${data.length} total)`}>
            <div className="table-responsive">
              <table className="table table-hover">
                <thead className="table-light">
                  <tr>
                    <th>Rank</th>
                    <th>{location === 'CA' ? 'Province/Territory' : 'State'}</th>
                    <th className="text-end">Job Count</th>
                    <th className="text-end">Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((item, index) => {
                    const percentage = totalJobs > 0 ? ((item.job_count / totalJobs) * 100) : 0;
                    return (
                      <tr key={item.job_state}>
                        <td>
                          <span className="badge bg-secondary">#{index + 1}</span>
                        </td>
                        <td className="fw-medium">{item.job_state}</td>
                        <td className="text-end">{item.job_count.toLocaleString()}</td>
                        <td className="text-end">{percentage.toFixed(1)}%</td>
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