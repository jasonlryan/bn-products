import React from 'react';

type BadgeVariant = 'default' | 'warning' | 'success' | 'danger' | 'info';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  children: React.ReactNode;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-gray-100 text-gray-800 border border-gray-200',
  warning: 'bg-amber-100 text-amber-800 border border-amber-200',
  success: 'bg-green-100 text-green-800 border border-green-200',
  danger: 'bg-red-100 text-red-800 border border-red-200',
  info: 'bg-blue-100 text-blue-800 border border-blue-200',
};

export function Badge({
  variant = 'default',
  children,
  className = '',
  ...rest
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-[10px] font-medium rounded-full ${variantClasses[variant]} ${className}`}
      {...rest}
    >
      {children}
    </span>
  );
}

export default Badge;
