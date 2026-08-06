import React from 'react';
import { Link } from 'react-router-dom';

export default function EmptyState({ icon, title, description, actionLabel, actionTo }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
      <div className="text-6xl mb-5">{icon || '📭'}</div>
      <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
      {description && <p className="text-gray-500 text-sm max-w-xs">{description}</p>}
      {actionLabel && actionTo && (
        <Link to={actionTo} className="btn-primary mt-6">
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
