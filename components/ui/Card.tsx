// components/ui/Card.tsx
import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverGlow?: boolean;
}

export function Card({ children, hoverGlow = true, style, className = '', ...props }: CardProps) {
  return (
    <div
      className={`product-card ${hoverGlow ? 'glow-on-hover' : ''} ${className}`}
      style={{
        padding: '2rem',
        ...style
      }}
      {...props}
    >
      {children}
    </div>
  );
}
