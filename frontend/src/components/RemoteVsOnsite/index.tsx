import React from 'react';
import { useRemoteVsOnsite } from '../../hooks/useApi';
import { LoadingSpinner, ErrorAlert, StatCard, ChartContainer } from '../common';

export const RemoteVsOnsite: React.FC = () => {
  const { data, loading, error, refetch } = useRemoteVsOnsite();

  if (loading) {
    return <LoadingSpinner text="Loading work arrangement data..." />;
  }

  if (error) {
    return <ErrorAlert message={error} onRetry={refetch} />;
  }

  if (!data || data.length === 0) {
    return <ErrorAlert message="No work arrangement data available" variant="warning" />;
  }

  const totalJobs = data.reduce((sum, item) => sum + item.count, 0);
  const remoteData = data.find(item => item.work_type === 'Remote');
  const onsiteData = data.find(item => item.work_type === 'Onsite/Hybrid' || item.work_type === 'Onsite');

  const chartData = data.map(item => ({
    ...item,
    percentage: totalJobs > 0 ? ((item.count / totalJobs) * 100) : 0
  }));

  return (
    <div className="row g-4">
      {/* Summary Stats */}
      <div className="col-12">
        <div className="row g-3">
          <div className="col-md-4">
            <StatCard
              title="Total Positions"
              value={totalJobs.toLocaleString()}
              subtitle="All work arrangements"
              icon="fas fa-briefcase"
              colorClass="primary"
            />
          </div>
          <div className="col-md-4">
            <StatCard
              title="Remote Jobs"
              value={remoteData?.count.toLocaleString() || '0'}
              subtitle={`${((remoteData?.count || 0) / totalJobs * 100).toFixed(1)}% of total`}
              icon="fas fa-home"
              colorClass="success"
            />
          </div>
          <div className="col-md-4">
            <StatCard
              title="On-site & Hybrid"
              value={onsiteData?.count.toLocaleString() || '0'}
              subtitle={`${((onsiteData?.count || 0) / totalJobs * 100).toFixed(1)}% of total`}
              icon="fas fa-building"
              colorClass="info"
            />
          </div>
        </div>
      </div>

      {/* Visual Chart */}
      <div className="col-md-8">
        <ChartContainer title="Work Arrangement Distribution">
          <div className="text-center mb-4">
            <div className="row justify-content-center">
              {chartData.map((item) => {
                const isRemote = item.work_type === 'Remote';
                const colorClass = isRemote ? 'success' : 'info';
                const icon = isRemote ? 'fas fa-home' : 'fas fa-building';
                
                return (
                  <div key={item.work_type} className="col-auto">
                    <div className={`card border-${colorClass} mb-3`} style={{ minWidth: '200px' }}>
                      <div className={`card-header bg-${colorClass} text-white text-center`}>
                        <i className={`${icon} fa-2x mb-2`}></i>
                        <h6 className="mb-0">{item.work_type}</h6>
                      </div>
                      <div className="card-body text-center">
                        <h3 className={`text-${colorClass} mb-2`}>
                          {item.count.toLocaleString()}
                        </h3>
                        <div className={`badge bg-${colorClass} fs-6`}>
                          {item.percentage.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Progress Bar Visualization */}
          <div className="mb-3">
            <h6 className="mb-3">Distribution Overview</h6>
            <div className="progress" style={{ height: '40px' }}>
              {chartData.map((item) => {
                const isRemote = item.work_type === 'Remote';
                const colorClass = isRemote ? 'success' : 'info';
                
                return (
                  <div
                    key={item.work_type}
                    className={`progress-bar bg-${colorClass} d-flex align-items-center justify-content-center`}
                    style={{ 
                      width: `${item.percentage}%`,
                      minWidth: item.percentage > 10 ? 'auto' : '80px'
                    }}
                  >
                    <span className="fw-bold text-white">
                      {item.percentage > 10 ? `${item.percentage.toFixed(1)}%` : ''}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="d-flex justify-content-between mt-2">
              {chartData.map((item) => (
                <small key={item.work_type} className="text-muted">
                  {item.work_type}: {item.count.toLocaleString()}
                </small>
              ))}
            </div>
          </div>
        </ChartContainer>
      </div>

      {/* Detailed Breakdown */}
      <div className="col-md-4">
        <ChartContainer title="Detailed Breakdown">
          <div className="list-group list-group-flush">
            {chartData.map((item) => {
              const isRemote = item.work_type === 'Remote';
              const colorClass = isRemote ? 'success' : 'info';
              const icon = isRemote ? 'fas fa-home' : 'fas fa-building';
              
              return (
                <div 
                  key={item.work_type} 
                  className="d-flex align-items-center px-0 py-3"
                  style={{
                    backgroundColor: 'transparent',
                    borderBottom: '1px solid var(--border-color)',
                    color: 'var(--text-primary)'
                  }}
                >
                  <div className={`me-3 text-${colorClass}`}>
                    <i className={`${icon} fa-lg`}></i>
                  </div>
                  <div className="flex-grow-1">
                    <h6 className="mb-1" style={{ color: 'var(--text-primary)' }}>
                      {item.work_type}
                    </h6>
                    <div className="d-flex justify-content-between align-items-center">
                      <small style={{ color: 'var(--text-muted)' }}>
                        {item.percentage.toFixed(1)}% of all positions
                      </small>
                      <span className={`badge bg-${colorClass} rounded-pill`}>
                        {item.count.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {totalJobs > 0 && (
            <div 
              className="mt-3 pt-3"
              style={{ borderTop: '1px solid var(--border-color)' }}
            >
              <div className="text-center">
                <small style={{ color: 'var(--text-muted)' }}>
                  Remote work represents{' '}
                  <strong className="text-success">
                    {((remoteData?.count || 0) / totalJobs * 100).toFixed(1)}%
                  </strong>{' '}
                  of all job opportunities
                </small>
              </div>
            </div>
          )}
        </ChartContainer>
      </div>
    </div>
  );
};