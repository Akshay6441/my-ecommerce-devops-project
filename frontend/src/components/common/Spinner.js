import React from 'react';
import clsx from 'clsx';

const sizes = {
  sm: 'w-4 h-4 border-2',
  md: 'w-7 h-7 border-2',
  lg: 'w-12 h-12 border-4',
};

export default function Spinner({ size = 'md', className }) {
  return (
    <div
      className={clsx(
        'rounded-full border-primary-200 border-t-primary-600 animate-spin',
        sizes[size],
        className
      )}
      role="status"
      aria-label="Loading"
    />
  );
}
