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
                className="form-select bg-primary border-primary text-white"
                style={{ 
                  backgroundImage: 'none',
                  color: 'white !important'
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
                    activeTab === tab.id ? 'active text-primary border-bottom border-primary border-2' : 'text-muted'
                  }`}
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
                <h2 className="h3 mb-1">
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

      {/* Footer */}
      <footer className="bg-dark text-white py-4 mt-5">
        <div className="container-fluid">
          <div className="row">
            <div className="col-md-6">
              <h6 className="fw-bold">Job Market Tracker</h6>
              <p className="mb-0 text-center">
                Real-time job market intelligence powered by advanced analytics
              </p>
            </div>
            <div className="col-md-6 text-md-end">
              <small className="text-muted">
                Built with React, TypeScript, and Bootstrap<br/>
                Data provided by JSearch API
              </small>
            </div>
          </div>
        </div>
      </footer>


    </div>
  );
};