import React from 'react';
import { clsx } from 'clsx';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glass?: boolean;
  hoverGlow?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  glass = true,
  hoverGlow = false,
  className = '',
  ...props
}) => {
  return (
    <div
      className={clsx(
        'rounded-3xl border transition-all duration-200',
        glass 
          ? 'bg-white border-slate-200/90 shadow-xs' 
          : 'bg-white border-slate-200 shadow-xs',
        hoverGlow && 'hover:border-purple-300 hover:shadow-sm hover:-translate-y-0.5',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<{
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}> = ({ title, subtitle, action, icon, className = '' }) => {
  return (
    <div className={clsx('flex items-center justify-between p-5 border-b border-slate-100', className)}>
      <div className="flex items-center gap-3">
        {icon && (
          <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 border border-purple-100/80">
            {icon}
          </div>
        )}
        <div>
          <h3 className="text-base font-semibold text-slate-900 font-heading">{title}</h3>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5 font-sans">{subtitle}</p>}
        </div>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
};

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <div className={clsx('p-5', className)} {...props}>
      {children}
    </div>
  );
};
