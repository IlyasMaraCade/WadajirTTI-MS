import React from 'react';

interface BadgeProps {
  variant?: 'success' | 'danger' | 'warning' | 'info' | 'default';
  children: React.ReactNode;
}

const variantStyles = {
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
  danger: 'bg-rose-50 text-rose-700 border-rose-200/80',
  warning: 'bg-amber-50 text-amber-700 border-amber-200/80',
  info: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
  default: 'bg-slate-100 text-slate-700 border-slate-200',
};

const dotColors = {
  success: 'bg-emerald-500',
  danger: 'bg-rose-500',
  warning: 'bg-amber-500',
  info: 'bg-indigo-500',
  default: 'bg-slate-400',
};

export const Badge: React.FC<BadgeProps> = ({ variant = 'default', children }) => (
  <span
    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${variantStyles[variant]} shadow-[0_1px_2px_rgba(0,0,0,0.03)]`}
  >
    <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]}`}></span>
    {children}
  </span>
);

export default Badge;
