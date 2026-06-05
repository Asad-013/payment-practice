// components/ui/Input.tsx
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="form-group" style={{ marginBottom: '1rem' }}>
        {label && <label style={{ marginBottom: '0.35rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{label}</label>}
        <input
          ref={ref}
          className={`form-control ${error ? 'is-invalid' : ''} ${className}`}
          {...props}
        />
        {error && (
          <span style={{ color: 'var(--danger-accent)', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
            {error}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
