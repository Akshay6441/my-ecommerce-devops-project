import React, { useState } from 'react';
import { FiStar } from 'react-icons/fi';
import clsx from 'clsx';

export default function StarRating({ value = 0, onChange, readOnly = false, size = 20 }) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = (hovered || value) >= star;
        return (
          <button
            key={star}
            type="button"
            disabled={readOnly}
            onClick={() => !readOnly && onChange?.(star)}
            onMouseEnter={() => !readOnly && setHovered(star)}
            onMouseLeave={() => !readOnly && setHovered(0)}
            className={clsx('transition-colors', readOnly ? 'cursor-default' : 'cursor-pointer')}
            aria-label={`${star} star`}
          >
            <FiStar
              size={size}
              className={clsx(
                'transition-colors',
                filled ? 'text-amber-400 fill-amber-400' : 'text-gray-200'
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
