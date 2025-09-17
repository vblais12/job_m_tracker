import React, { useState } from 'react';
import { JobCounts } from '../JobCounts';
import { TopSkills } from '../TopSkills';
import { RemoteVsOnsite } from '../RemoteVsOnsite';
import { GeographicDistribution } from '../GeographicDistribution';
import { SalaryAnalysis } from '../SalaryAnalysis';
import { RecentListings } from '../RecentListings';

type DashboardTab = 'overview' | 'skills' | 'work-style' | 'geographic' | 'salaries' | 'recent';

export const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  const [selectedLocation, setSelectedLocation] = useState('US');
  const [showMethodology, setShowMethodology] = useState(false);

  const locations = [
    { value: 'US', label: 'United States' },
    { value: 'CA', label: 'Canada' },
    { value: '', label: 'All Locations' }
  ];

  const tabs = [
    { id: 'overview' as const, label: 'Job Overview', icon: 'fas fa-chart-pie' },
    { id: 'skills' as const, label: 'Top Skills', icon: 'fas fa-code' },
    { id: 'work-style' as const, label: 'Work Style', icon: 'fas fa-home' },
    { id: 'geographic' as const, label: 'Geographic', icon: 'fas fa-map-marked-alt' },
    { id: 'salaries' as const, label: 'Salaries', icon: 'fas fa-dollar-sign' },
    { id: 'recent' as const, label: 'Recent Jobs', icon: 'fas fa-clock' }
  ];

  // Available roles for filtering
  const availableRoles = ['Software engineer', 'Machine Learning engineer'];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <JobCounts location={selectedLocation} />;
      case 'skills':
        return <TopSkills availableRoles={availableRoles} />;
      case 'work-style':
        return <RemoteVsOnsite />;
      case 'geographic':
        return <GeographicDistribution location={selectedLocation} />;
      case 'salaries':
        return <SalaryAnalysis location={selectedLocation} />;
      case 'recent':
        return <RecentListings location={selectedLocation} />;
      default:
        return <JobCounts location={selectedLocation} />;
    }
  };

  return (
    <div className="dashboard-container min-vh-100 bg-light">
      {/* Header */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
        <div className="container-fluid">
          <div className="navbar-brand d-flex align-items-center">
            <i className="fas fa-briefcase me-2 fa-lg"></i>
            <span className="fw-bold">Job Market Tracker</span>
          </div>
          
          <div className="navbar-nav ms-auto">
            <div className="nav-item">
              <select
                className="form-select text-white"
                style={{ 
                  background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                  color: 'white',
                  backgroundImage: 'none'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.2)';
                }}
                onFocus={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, var(--accent-secondary), var(--accent-primary))';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))';
                }}
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
              >
                {locations.map(location => (
                  <option 
                    key={location.value} 
                    value={location.value}
                    style={{ color: 'black' }}
                  >
                    {location.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </nav>

      {/* Tab Navigation */}
      <div className="bg-white border-bottom sticky-top">
        <div className="container-fluid">
          <ul className="nav nav-tabs border-0 pt-3">
            {tabs.map(tab => (
              <li key={tab.id} className="nav-item">
                <button
                  className={`nav-link border-0 d-flex align-items-center gap-2 ${
                    activeTab === tab.id ? 'active border-bottom border-primary border-2' : 'text-muted'
                  }`}
                  style={{
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    borderRadius: '8px 8px 0 0',
                    position: 'relative',
                    ...(activeTab === tab.id ? {
                      background: 'var(--bg-secondary)',
                      color: 'var(--accent-primary)'
                    } : {})
                  }}
                  onMouseEnter={(e) => {
                    if (activeTab !== tab.id) {
                      e.currentTarget.style.setProperty('color', 'var(--accent-primary)', 'important');
                      e.currentTarget.style.background = 'var(--bg-secondary)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeTab !== tab.id) {
                      e.currentTarget.style.setProperty('color', '#6c757d', 'important');
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }
                  }}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <i className={tab.icon}></i>
                  <span className="d-none d-md-inline">{tab.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Main Content */}
      <main className="container-fluid py-4">
        <div className="row">
          <div className="col-12">
            {/* Tab Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h2 className="h3 mb-1" style={{ color: 'black' }}>
                  {tabs.find(tab => tab.id === activeTab)?.label || 'Dashboard'}
                </h2>
                <p className="text-muted mb-0">
                  {activeTab === 'salaries' && selectedLocation === 'US' && 'United States Job Market Data - Top Cities Only'}
                  {activeTab === 'salaries' && selectedLocation === 'CA' && 'Canadian Job Market Data - Top Cities Only'}
                  {activeTab === 'salaries' && selectedLocation === '' && 'Global Job Market Data - Top Cities Only'}
                  {activeTab !== 'salaries' && selectedLocation === 'US' && 'United States Job Market Data'}
                  {activeTab !== 'salaries' && selectedLocation === 'CA' && 'Canadian Job Market Data'}
                  {activeTab !== 'salaries' && selectedLocation === '' && 'Global Job Market Data'}
                </p>
              </div>
              
              <div className="d-flex align-items-center gap-2">
                <small className="text-muted">
                  <i className="fas fa-sync-alt me-1"></i>
                  Real-time data
                </small>
              </div>
            </div>

            {/* Tab Content */}
            <div className="fade-in">
              {renderTabContent()}
            </div>
          </div>
        </div>
      </main>

      {/* Data Methodology Panel */}
      <div className="border-top bg-light">
        <div className="container-fluid">
          <div className="py-3">
            <button
              className="btn btn-link text-decoration-none d-flex align-items-center justify-content-center w-100 p-2"
              onClick={() => setShowMethodology(!showMethodology)}
              style={{
                background: showMethodology 
                  ? 'linear-gradient(135deg, var(--accent-secondary), var(--accent-primary))' 
                  : 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                transition: 'all 0.3s ease',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
              }}
            >
              <i className="fas fa-chart-line me-2"></i>
              <span className="fw-bold">Data Methodology & Sources</span>
              <i className={`fas fa-chevron-${showMethodology ? 'up' : 'down'} ms-2`}></i>
            </button>

            {showMethodology && (
              <div 
                className="mt-3 fade-in"
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(248, 249, 250, 0.9))',
                  border: '1px solid rgba(0, 0, 0, 0.1)',
                  borderRadius: '12px',
                  padding: '2rem',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                }}
              >
                <div className="row g-4">
                  <div className="col-md-6">
                    <h5 className="text-primary mb-3">
                      <i className="fas fa-database me-2"></i>
                      Data Collection
                    </h5>
                    <ul className="list-unstyled">
                      <li className="mb-2" style={{ color: '#333' }}>
                        <i className="fas fa-plug me-2" style={{ color: '#28a745' }}></i>
                        <strong>JSearch API Integration:</strong> Real-time job data from major job boards
                      </li>
                      <li className="mb-2" style={{ color: '#333' }}>
                        <i className="fas fa-globe text-info me-2"></i>
                        <strong>Multi-Platform Scraping:</strong> Indeed, LinkedIn, ZipRecruiter, and more
                      </li>
                      <li className="mb-2" style={{ color: '#333' }}>
                        <i className="fas fa-clock text-warning me-2"></i>
                        <strong>Automated Updates:</strong> Data refreshed every 24 hours for accuracy
                      </li>
                      <li className="mb-2" style={{ color: '#333' }}>
                        <i className="fas fa-filter text-secondary me-2"></i>
                        <strong>Quality Filtering:</strong> Duplicate removal and data validation processes
                      </li>
                    </ul>
                  </div>
                  
                  <div className="col-md-6">
                    <h5 className="text-primary mb-3">
                      <i className="fas fa-brain me-2"></i>
                      Analytics & Processing
                    </h5>
                    <ul className="list-unstyled">
                      <li className="mb-2" style={{ color: '#333' }}>
                        <i className="fas fa-code text-danger me-2"></i>
                        <strong>Skills Extraction:</strong> NLP-powered skill identification from job descriptions
                      </li>
                      <li className="mb-2" style={{ color: '#333' }}>
                        <i className="fas fa-dollar-sign text-success me-2"></i>
                        <strong>Salary Normalization:</strong> Standardized compensation data across regions
                      </li>
                      <li className="mb-2" style={{ color: '#333' }}>
                        <i className="fas fa-map-marker-alt text-info me-2"></i>
                        <strong>Geographic Mapping:</strong> Location-based trend analysis and clustering
                      </li>
                      <li className="mb-2" style={{ color: '#333' }}>
                        <i className="fas fa-chart-bar text-warning me-2"></i>
                        <strong>Statistical Modeling:</strong> Advanced analytics for market insights
                      </li>
                    </ul>
                  </div>
                  
                  <div className="col-12">
                    <div className="border-top pt-3 mt-3">
                      <h6 className="text-muted mb-2">
                        <i className="fas fa-shield-alt me-2"></i>
                        Data Quality & Coverage
                      </h6>
                      <div className="row text-center">
                        <div className="col-md-3">
                          <div className="bg-white rounded p-3 shadow-sm">
                            <i className="fas fa-search fa-2x text-primary mb-2"></i>
                            <h4 className="text-primary mb-1">Live</h4>
                            <small className="text-muted">Real-time Job Search</small>
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="bg-white rounded p-3 shadow-sm">
                            <i className="fas fa-globe-americas fa-2x text-success mb-2"></i>
                            <h4 className="text-success mb-1">2</h4>
                            <small className="text-muted">Countries (US, CA)</small>
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="bg-white rounded p-3 shadow-sm">
                            <i className="fas fa-code fa-2x text-info mb-2"></i>
                            <h4 className="text-info mb-1">5+</h4>
                            <small className="text-muted">Job Boards Covered</small>
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="bg-white rounded p-3 shadow-sm">
                            <i className="fas fa-robot fa-2x text-warning mb-2"></i>
                            <h4 className="text-warning mb-1">Auto</h4>
                            <small className="text-muted">Skill Extraction</small>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-dark text-white py-4 mt-5">
        <div className="container-fluid">
          <div className="row">
            <div className="col-md-6">
              <h6 className="fw-bold">Job Market Tracker</h6>
              <p className="mb-0">
                Real-time job market intelligence powered by advanced analytics
              </p>
            </div>
            <div className="col-md-6 text-md-end">
              <div className="mt-2">
                <small style={{ color: '#adb5bd' }}>
                  © 2025 Viktor Blais. All rights reserved.
                </small>
              </div>
            </div>
          </div>
        </div>
      </footer>


    </div>
  );
};