import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  variant?: 'default' | 'filled';
}

export default function Input({
  label,
  error,
  helperText,
  variant = 'default',
  className = '',
  id,
  ...props
}: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  const baseClasses =
    'block w-full rounded-lg border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent';

  const variantClasses = {
    default: 'border-gray-300 bg-white px-3 py-2',
    filled: 'border-gray-200 bg-gray-50 px-3 py-2 focus:bg-white',
  };

  const errorClasses = error
    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
    : '';

  const classes = `${baseClasses} ${variantClasses[variant]} ${errorClasses} ${className}`;

  return (
    <div className="space-y-1">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700"
        >
          {label}
        </label>
      )}
      <input id={inputId} className={classes} {...props} />
      {error && <p className="text-sm text-red-600">{error}</p>}
      {helperText && !error && (
        <p className="text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
}
