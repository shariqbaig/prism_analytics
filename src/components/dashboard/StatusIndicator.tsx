import React from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle, AlertTriangle, XCircle, Clock, Minus } from 'lucide-react';

export type StatusLevel = 'success' | 'warning' | 'error' | 'pending' | 'neutral';

interface StatusIndicatorProps {
  status: StatusLevel;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

const statusConfig = {
  success: {
    color: 'text-green-600',
    backgroundColor: 'bg-green-100',
    borderColor: 'border-green-200',
    icon: CheckCircle
  },
  warning: {
    color: 'text-yellow-600',
    backgroundColor: 'bg-yellow-100',
    borderColor: 'border-yellow-200',
    icon: AlertTriangle
  },
  error: {
    color: 'text-red-600',
    backgroundColor: 'bg-red-100',
    borderColor: 'border-red-200',
    icon: XCircle
  },
  pending: {
    color: 'text-blue-600',
    backgroundColor: 'bg-blue-100',
    borderColor: 'border-blue-200',
    icon: Clock
  },
  neutral: {
    color: 'text-gray-600',
    backgroundColor: 'bg-gray-100',
    borderColor: 'border-gray-200',
    icon: Minus
  }
};

const sizeConfig = {
  sm: {
    container: 'px-2 py-1 text-xs',
    icon: 'w-3 h-3',
    dot: 'w-2 h-2'
  },
  md: {
    container: 'px-3 py-1.5 text-sm',
    icon: 'w-4 h-4',
    dot: 'w-3 h-3'
  },
  lg: {
    container: 'px-4 py-2 text-base',
    icon: 'w-5 h-5',
    dot: 'w-4 h-4'
  }
};

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  label,
  size = 'md',
  showIcon = true,
  className
}) => {
  const config = statusConfig[status];
  const sizeStyles = sizeConfig[size];
  const Icon = config.icon;

  return (
    <div className={cn(
      'inline-flex items-center gap-1.5 rounded-full font-medium',
      config.backgroundColor,
      config.color,
      sizeStyles.container,
      className
    )}>
      {showIcon && <Icon className={sizeStyles.icon} />}
      {label && <span>{label}</span>}
      {!label && !showIcon && (
        <div className={cn(
          'rounded-full',
          config.backgroundColor,
          sizeStyles.dot
        )} />
      )}
    </div>
  );
};

interface StatusDotProps {
  status: StatusLevel;
  className?: string;
}

export const StatusDot: React.FC<StatusDotProps> = ({ status, className }) => {
  const config = statusConfig[status];
  
  return (
    <div className={cn(
      'w-3 h-3 rounded-full',
      config.backgroundColor,
      config.borderColor,
      'border-2',
      className
    )} />
  );
};