// components/ui/Button.tsx
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  isLoading?: boolean;
}

export function Button({
  children,
  variant = 'primary',
  isLoading,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'secondary':
        return 'background: var(--bg-surface); border: 1px solid var(--border-color); color: var(--text-primary);';
      case 'danger':
        return 'background: var(--danger-accent); color: white; border: none;';
      case 'ghost':
        return 'background: transparent; color: var(--text-secondary); border: none;';
      case 'primary':
      default:
        return 'background: var(--primary-accent); color: white; border: none;';
    }
  };

  return (
    <>
      <button
        className={`btn custom-btn ${className}`}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <span className="spinner" style={{
            width: '14px',
            height: '14px',
            border: '2px solid currentColor',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            display: 'inline-block',
            animation: 'spin 0.8s linear infinite',
            marginRight: '0.5rem'
          }} />
        )}
        {children}
      </button>

      <style jsx>{`
        .custom-btn {
          ${getVariantStyles()}
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }
        .custom-btn:hover:not(:disabled) {
          filter: brightness(1.1);
          transform: translateY(-1px);
        }
        .custom-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>
    </>
  );
}
