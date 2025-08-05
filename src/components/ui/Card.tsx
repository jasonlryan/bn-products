import type { ReactNode, MouseEventHandler } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  shadow?: 'none' | 'sm' | 'md' | 'lg';
  onClick?: MouseEventHandler<HTMLDivElement>;
}

export default function Card({
  children,
  className = '',
  hover = false,
  padding = 'md',
  shadow = 'sm',
  onClick,
}: CardProps) {
  const baseClasses =
    'bg-white rounded-lg border border-gray-200 transition-all duration-200';

  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const shadowClasses = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
  };

  const hoverClasses = hover
    ? 'hover:shadow-md hover:border-primary/20 cursor-pointer'
    : '';

  const classes = `${baseClasses} ${paddingClasses[padding]} ${shadowClasses[shadow]} ${hoverClasses} ${className}`;

  return (
    <div className={classes} onClick={onClick}>
      {children}
    </div>
  );
}
