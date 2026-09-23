import React from 'react';
import { clsx } from 'clsx';

export type BadgeVariant = 
  | 'success' 
  | 'warning' 
  | 'danger' 
  | 'info' 
  | 'neutral' 
  | 'purple'
  | 'cyan';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  dot?: boolean;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200/80 font-semibold',
  warning: 'bg-amber-50 text-amber-800 border-amber-200/80 font-semibold',
  danger: 'bg-rose-50 text-rose-700 border-rose-200/80 font-semibold',
  info: 'bg-purple-50 text-purple-700 border-purple-200/80 font-semibold',
  neutral: 'bg-slate-100 text-slate-700 border-slate-200 font-semibold',
  purple: 'bg-purple-50 text-purple-700 border-purple-200 font-semibold',
  cyan: 'bg-cyan-50 text-cyan-800 border-cyan-200 font-semibold',
};

const dotColors: Record<BadgeVariant, string> = {
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  danger: 'bg-rose-500',
  info: 'bg-purple-600',
  neutral: 'bg-slate-500',
  purple: 'bg-purple-600',
  cyan: 'bg-cyan-500',
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  dot = false,
  className = '',
}) => {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 font-medium border rounded-full transition-colors',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs',
        variantStyles[variant],
        className
      )}
    >
      {dot && (
        <span
          className={clsx('w-1.5 h-1.5 rounded-full animate-pulse', dotColors[variant])}
        />
      )}
      {children}
    </span>
  );
};

export const StatusBadge: React.FC<{ status: string; className?: string }> = ({ status, className }) => {
  const s = status.toLowerCase();
  if (['verified', 'completed', 'active', 'success'].includes(s)) {
    return <Badge variant="success" dot className={className}>{status.toUpperCase()}</Badge>;
  }
  if (['pending', 'processing'].includes(s)) {
    return <Badge variant="warning" dot className={className}>{status.toUpperCase()}</Badge>;
  }
  if (['rejected', 'failed', 'suspended', 'deactivated'].includes(s)) {
    return <Badge variant="danger" dot className={className}>{status.toUpperCase()}</Badge>;
  }
  if (['unverified'].includes(s)) {
    return <Badge variant="neutral" dot className={className}>{status.toUpperCase()}</Badge>;
  }
  return <Badge variant="info" className={className}>{status.toUpperCase()}</Badge>;
};
