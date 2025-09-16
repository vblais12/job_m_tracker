import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  text = 'Loading...' 
}) => {
  const spinnerSize = {
    sm: 'spinner-border-sm',
    md: '',
    lg: ''
  };

  return (
    <div className="d-flex flex-column align-items-center justify-content-center py-4">
      <div className={`spinner-border text-primary ${spinnerSize[size]}`} role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
      {text && <div className="mt-2 text-muted">{text}</div>}
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
  onRetry, 
  variant = 'danger' 
}) => {
  return (
    <div className={`alert alert-${variant} d-flex align-items-center`} role="alert">
      <div className="flex-grow-1">
        <strong>Error:</strong> {message}
      </div>
      {onRetry && (
        <button 
          className="btn btn-outline-danger btn-sm ms-3"
          onClick={onRetry}
        >
          Retry
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
  icon,
  colorClass = 'primary'
}) => {
  return (
    <div className="card h-100 shadow-sm">
      <div className="card-body">
        <div className="d-flex align-items-center">
          <div className="flex-grow-1">
            <h6 className="card-subtitle mb-2 text-muted">{title}</h6>
            <h3 className={`card-title mb-1 text-${colorClass}`}>{value}</h3>
            {subtitle && (
              <small className="text-muted">{subtitle}</small>
            )}
          </div>
          {icon && (
            <div className={`ms-3 text-${colorClass}`}>
              <i className={`${icon} fa-2x`}></i>
            </div>
          )}
        </div>
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
    <div className="card shadow-sm">
      <div className="card-header bg-white">
        <div className="d-flex justify-content-between align-items-center">
          <h5 className="card-title mb-0">{title}</h5>
          {actions && <div className="ms-auto">{actions}</div>}
        </div>
      </div>
      <div className="card-body">
        {children}
      </div>
    </div>
  );
};