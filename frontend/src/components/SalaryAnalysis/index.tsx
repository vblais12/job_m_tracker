import React from 'react';
import { useSalaryData } from '../../hooks/useApi';
import { LoadingSpinner, ErrorAlert, StatCard, ChartContainer } from '../common';

interface SalaryAnalysisProps {
  location?: string;
}

export const SalaryAnalysis: React.FC<SalaryAnalysisProps> = ({ location }) => {
  const { data, loading, error, refetch } = useSalaryData(location);

  if (loading) {
    return <LoadingSpinner text="Loading salary data..." />;
  }

  if (error) {
    return <ErrorAlert message={error} onRetry={refetch} />;
  }

  if (!data || data.length === 0) {
    return <ErrorAlert message="No salary data available" variant="warning" />;
  }

  // Calculate relevant statistics from actual data
  const validSalaries = data.filter(item => 
    item.median_salary && item.median_salary > 0
  );

  if (validSalaries.length === 0) {
    return (
      <div className="text-center text-muted py-5">
        <i className="fas fa-dollar-sign fa-3x mb-3"></i>
        <p>No valid salary data available for analysis</p>
      </div>
    );
  }

  // Key salary insights
  const medianSalaries = validSalaries.map(item => item.median_salary);
  const minSalaries = validSalaries.map(item => item.min_salary).filter(sal => sal && sal > 0);
  const medianBaseSalaries = validSalaries.map(item => item.median_base_salary).filter(sal => sal && sal > 0);
  
  const medianSalaryAverage = medianSalaries.reduce((sum, sal) => sum + sal, 0) / medianSalaries.length;
  const lowestMinSalary = minSalaries.length > 0 ? Math.min(...minSalaries) : Math.min(...medianSalaries);
  const highestMedianSalary = Math.max(...medianSalaries);
  const salaryRangeSpread = highestMedianSalary - lowestMinSalary;

  // Group by role for better analysis
  const roleGroups = validSalaries.reduce((acc, item) => {
    if (!acc[item.role]) {
      acc[item.role] = [];
    }
    acc[item.role].push(item);
    return acc;
  }, {} as Record<string, typeof validSalaries>);

  const roleAnalysis = Object.entries(roleGroups).map(([role, salaries]) => {
    const medianSalaries = salaries.map(s => s.median_salary);
    const highestMedian = Math.max(...medianSalaries);
    const lowestMedian = Math.min(...medianSalaries);
    const cityCount = salaries.length;
    return { role, highestMedian, lowestMedian, cityCount, salaries };
  }).sort((a, b) => b.highestMedian - a.highestMedian);

  const formatSalary = (salary: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(salary);
  };

  return (
    <div className="row g-4">
      {/* Key Salary Insights */}
      <div className="col-12">
        <div className="row g-3">
          <div className="col-md-3">
            <StatCard
              title="Median Salary Average"
              value={formatSalary(medianSalaryAverage)}
              subtitle="Average of all medians"
              icon="fas fa-chart-line"
              colorClass="primary"
            />
          </div>
          <div className="col-md-3">
            <StatCard
              title="Min Salary"
              value={formatSalary(lowestMinSalary)}
              subtitle="Lowest minimum salary"
              icon="fas fa-level-down-alt"
              colorClass="info"
            />
          </div>
          <div className="col-md-3">
            <StatCard
              title="Salary Range"
              value={formatSalary(salaryRangeSpread)}
              subtitle="Market spread"
              icon="fas fa-expand-arrows-alt"
              colorClass="warning"
            />
          </div>
          <div className="col-md-3">
            <StatCard
              title="Highest Median Salary"
              value={formatSalary(highestMedianSalary)}
              subtitle="Peak earning potential"
              icon="fas fa-trophy"
              colorClass="success"
            />
          </div>
        </div>
      </div>

      {/* Salary Range by Role */}
      <div className="col-lg-8">
        <ChartContainer title="Salary Ranges by Role">
          {roleAnalysis.length > 0 ? (
            <div>
              {roleAnalysis.map((roleData, index) => {
                const percentage = highestMedianSalary > 0 ? (roleData.highestMedian / highestMedianSalary) * 100 : 0;
                const colors = [
                  'primary', 'success', 'info', 'warning', 'danger',
                  'secondary', 'dark'
                ];
                const colorClass = colors[index % colors.length];
                
                return (
                  <div key={roleData.role} className="mb-4">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <div className="d-flex align-items-center">
                        <span className={`badge bg-${colorClass} me-2`}>#{index + 1}</span>
                        <div>
                          <div className="fw-bold">{roleData.role}</div>
                          <small className="text-muted">{roleData.cityCount} markets</small>
                        </div>
                      </div>
                      <div className="text-end">
                        <div className="fw-bold">{formatSalary(roleData.highestMedian)}</div>
                        <small className="text-muted">top median</small>
                      </div>
                    </div>
                    <div className="progress" style={{ height: '35px' }}>
                      <div
                        className={`progress-bar bg-${colorClass} d-flex align-items-center justify-content-between px-3`}
                        style={{ width: `${Math.max(percentage, 15)}%` }}
                      >
                        <span className="text-white fw-medium small">
                          {formatSalary(roleData.lowestMedian)}
                        </span>
                        <span className="text-white fw-bold">
                          {percentage > 25 ? formatSalary(roleData.highestMedian) : ''}
                        </span>
                      </div>
                    </div>
                    <div className="d-flex justify-content-between mt-1">
                      <small className="text-muted">Range: {formatSalary(roleData.highestMedian - roleData.lowestMedian)}</small>
                      <small className="text-muted">Median range: {formatSalary(roleData.lowestMedian)} - {formatSalary(roleData.highestMedian)}</small>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center text-muted py-5">
              <i className="fas fa-chart-bar fa-3x mb-3"></i>
              <p>No role-based salary data available</p>
            </div>
          )}
        </ChartContainer>
      </div>

      {/* Top Paying Cities */}
      <div className="col-lg-4">
        <ChartContainer title="Top Paying Cities">
          {(() => {
            const cityAnalysis = validSalaries.reduce((acc, item) => {
              if (!acc[item.city]) {
                acc[item.city] = { medianSalaries: [], salaries: [] };
              }
              acc[item.city].medianSalaries.push(item.median_salary);
              acc[item.city].salaries.push(item);
              return acc;
            }, {} as Record<string, { medianSalaries: number[]; salaries: typeof validSalaries }>);

            const topCities = Object.entries(cityAnalysis)
              .map(([city, data]) => ({
                city,
                highestMedian: Math.max(...data.medianSalaries),
                lowestMedian: Math.min(...data.medianSalaries),
                roleCount: data.salaries.length
              }))
              .sort((a, b) => b.highestMedian - a.highestMedian)
              .slice(0, 8);

            return (
              <div>
                {topCities.map((cityData, index) => {
                  const colors = ['primary', 'success', 'info', 'warning'];
                  const colorClass = colors[index % colors.length];
                  
                  return (
                    <div 
                      key={cityData.city}
                      className="d-flex justify-content-between align-items-center px-0 py-3"
                      style={{
                        backgroundColor: 'transparent',
                        borderBottom: '1px solid var(--border-color)',
                        color: 'var(--text-primary)'
                      }}
                    >
                      <div className="d-flex align-items-center">
                        <span className={`badge bg-${colorClass} me-3`}>#{index + 1}</span>
                        <div>
                          <div className="fw-medium" style={{ color: 'var(--text-primary)' }}>
                            {cityData.city}
                          </div>
                          <small style={{ color: 'var(--text-muted)' }}>
                            {cityData.roleCount} roles
                          </small>
                        </div>
                      </div>
                      <div className="text-end">
                        <div className="fw-bold" style={{ color: 'var(--text-primary)' }}>
                          {formatSalary(cityData.highestMedian)}
                        </div>
                        <small style={{ color: 'var(--text-muted)' }}>
                          top median
                        </small>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </ChartContainer>
      </div>

      {/* Detailed Salary Table */}
      <div className="col-12">
        <ChartContainer title="Detailed Salary Breakdown">
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
                City
              </span>
              <span style={{ flex: 1, color: 'var(--text-primary)', fontWeight: '600', fontSize: '0.9rem', textAlign: 'center' }}>
                Role
              </span>
              <span style={{ flex: 1, color: 'var(--text-primary)', fontWeight: '600', fontSize: '0.9rem', textAlign: 'center' }}>
                Min Salary
              </span>
              <span style={{ flex: 1, color: 'var(--text-primary)', fontWeight: '600', fontSize: '0.9rem', textAlign: 'center' }}>
                Median Salary
              </span>
              <span style={{ flex: 1, color: 'var(--text-primary)', fontWeight: '600', fontSize: '0.9rem', textAlign: 'center' }}>
                Min Base
              </span>
              <span style={{ flex: 1, color: 'var(--text-primary)', fontWeight: '600', fontSize: '0.9rem', textAlign: 'center' }}>
                Median Base
              </span>
            </div>

            {/* Data Rows */}
            {validSalaries
              .sort((a, b) => b.median_salary - a.median_salary)
              .slice(0, 20)
              .map((item, index) => (
                <div 
                  key={`${item.city}-${item.role}-${index}`}
                  className="d-flex align-items-center px-0 py-3"
                  style={{
                    backgroundColor: 'transparent',
                    borderBottom: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                    width: '100%'
                  }}
                >
                  <span className="fw-medium" style={{ flex: 1, color: 'var(--text-primary)', textAlign: 'center' }}>
                    {item.city}
                  </span>
                  <span style={{ flex: 1, color: 'var(--text-secondary)', textAlign: 'center' }}>
                    {item.role}
                  </span>
                  <span style={{ flex: 1, color: 'var(--text-secondary)', textAlign: 'center' }}>
                    {formatSalary(item.min_salary || 0)}
                  </span>
                  <span className="fw-bold" style={{ flex: 1, color: 'var(--accent-primary)', textAlign: 'center' }}>
                    {formatSalary(item.median_salary)}
                  </span>
                  <span style={{ flex: 1, color: 'var(--text-secondary)', textAlign: 'center' }}>
                    {formatSalary(item.min_base_salary || 0)}
                  </span>
                  <span style={{ flex: 1, color: 'var(--text-secondary)', textAlign: 'center' }}>
                    {formatSalary(item.median_base_salary || 0)}
                  </span>
                </div>
              ))}
          </div>
          {validSalaries.length > 20 && (
            <div className="text-center mt-3">
              <small className="text-muted">
                Showing top 20 of {validSalaries.length} salary entries
              </small>
            </div>
          )}
        </ChartContainer>
      </div>
    </div>
  );
};