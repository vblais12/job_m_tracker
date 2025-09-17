import React from 'react';
import '../ChartContainer/ChartContainer.css';

interface LoadingSpinnerProps {
  text?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  text = 'Loading...' 
}) => {
  return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      {text && <div className="loading-text">{text}</div>}
    </div>
  );
};

interface ErrorAlertProps {
  message: string;
  onRetry?: () => void;
  variant?: 'danger' | 'warning';
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({ 
  message, 
  onRetry
}) => {
  return (
    <div className="error-container">
      <div className="error-icon">
        <i className="fas fa-exclamation-triangle"></i>
      </div>
      <div className="error-message">
        {message}
      </div>
      {onRetry && (
        <button 
          className="btn btn-outline-primary btn-sm mt-3"
          onClick={onRetry}
        >
          <i className="fas fa-redo me-2"></i>
          Try Again
        </button>
      )}
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: string;
  colorClass?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon
}) => {
  return (
    <div className="stat-card">
      <div className="d-flex align-items-center">
        <div className="flex-grow-1">
          <div className="stat-label">{title}</div>
          <div className="stat-value">{value}</div>
          {subtitle && (
            <div className="stat-label" style={{ fontSize: '0.8rem', marginTop: '4px' }}>
              {subtitle}
            </div>
          )}
        </div>
        {icon && (
          <div className="ms-3" style={{ color: 'var(--accent-primary)', fontSize: '2rem' }}>
            <i className={icon}></i>
          </div>
        )}
      </div>
    </div>
  );
};

interface ChartContainerProps {
  title: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

export const ChartContainer: React.FC<ChartContainerProps> = ({
  title,
  children,
  actions
}) => {
  return (
    <div className="chart-container">
      <div className="chart-header">
        <div className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">{title}</h5>
          {actions && <div className="ms-auto">{actions}</div>}
        </div>
      </div>
      <div className="chart-body">
        {children}
      </div>
    </div>
  );
};