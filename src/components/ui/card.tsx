// src/components/ui/card.tsx
import React from 'react';

export function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white dark:bg-gray-800 p-4 rounded shadow ${className}`}>
      {children}
    </div>
  );
}
