import React from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import clsx from 'clsx';

export default function Pagination({ page, pages, onPageChange }) {
  if (pages <= 1) return null;

  const range = [];
  for (let i = Math.max(1, page - 2); i <= Math.min(pages, page + 2); i++) {
    range.push(i);
  }

  return (
    <div className="flex items-center justify-center gap-1 mt-10">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:border-primary-400 hover:text-primary-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <FiChevronLeft size={18} />
      </button>

      {range[0] > 1 && (
        <>
          <button onClick={() => onPageChange(1)}
            className="w-9 h-9 rounded-xl text-sm font-medium text-gray-600 hover:bg-primary-50 hover:text-primary-600 transition-colors">
            1
          </button>
          {range[0] > 2 && <span className="text-gray-400 px-1">…</span>}
        </>
      )}

      {range.map((p) => (
        <button key={p} onClick={() => onPageChange(p)}
          className={clsx(
            'w-9 h-9 rounded-xl text-sm font-medium transition-colors',
            p === page
              ? 'bg-primary-600 text-white shadow-sm'
              : 'text-gray-600 hover:bg-primary-50 hover:text-primary-600'
          )}>
          {p}
        </button>
      ))}

      {range[range.length - 1] < pages && (
        <>
          {range[range.length - 1] < pages - 1 && <span className="text-gray-400 px-1">…</span>}
          <button onClick={() => onPageChange(pages)}
            className="w-9 h-9 rounded-xl text-sm font-medium text-gray-600 hover:bg-primary-50 hover:text-primary-600 transition-colors">
            {pages}
          </button>
        </>
      )}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === pages}
        className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:border-primary-400 hover:text-primary-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <FiChevronRight size={18} />
      </button>
    </div>
  );
}
